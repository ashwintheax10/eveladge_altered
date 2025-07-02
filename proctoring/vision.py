"""
proctoring/vision.py  –  single‑user demo engine
------------------------------------------------
• verify_user(b64)   -> (bool_ok, dict_payload)
• analyse_frame(b64) -> dict {frame,gaze,blinks,status,message,playBeep}
"""

import base64, time, cv2, numpy as np
from pathlib import Path
from collections import deque
from datetime import datetime
import mediapipe as mp
from insightface.app import FaceAnalysis

# ─── constants ───────────────────────────────────────────
REF_DIR          = Path(__file__).resolve().parent / "reference"
EMB_THRESH       = 0.60
BLINK_EAR_THR, BLINK_CONSEC_FR = 0.21, 2
GAZE_L_THR,  GAZE_R_THR        = 1.25, 0.75
AWAY_GRACE_SEC, EXIT_DELAY_SEC = 1.5, 2.0
FPS_BUF                           = 30
L_EYE  = [33,160,158,133,153,144];   R_EYE  = [362,385,387,263,373,380]
L_IRIS = [474,475,476,477];          R_IRIS = [469,470,471,472]

# ─── helpers ─────────────────────────────────────────────
def _decode_b64(data_url: str) -> np.ndarray:
    raw = base64.b64decode(data_url.split(",", 1)[1])
    return cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)

def _ear(pts):
    p1,p2,p3,p4,p5,p6 = pts
    return (np.linalg.norm(p2-p6)+np.linalg.norm(p3-p5)) / (2*np.linalg.norm(p1-p4))

def _g_ratio(iris, lp, rp):
    dl = np.linalg.norm(iris-lp); dr = np.linalg.norm(iris-rp)
    return dr/(dl+1e-6)

def _dir(r):  # mirrored webcam
    if r > GAZE_L_THR: return "RIGHT"
    if r < GAZE_R_THR: return "LEFT"
    return "CENTER"

# ─── singleton models ───────────────────────────────────
_face = FaceAnalysis(providers=["CPUExecutionProvider"])
_face.prepare(ctx_id=0, det_size=(640,640))
_mesh = mp.solutions.face_mesh.FaceMesh(
            refine_landmarks=True, max_num_faces=1,
            min_detection_confidence=0.5, min_tracking_confidence=0.5)

# ─── preload reference embeddings ───────────────────────
REF_DIR.mkdir(exist_ok=True)
_refs = {}
for p in REF_DIR.glob("*.[jp][pn]g"):
    img = cv2.imread(str(p))
    f   = _face.get(img)
    if f:
        e = f[0].embedding
        _refs[p.stem] = e/np.linalg.norm(e)
print("Loaded reference photos:", list(_refs.keys()))

# ─── state (single user) ─────────────────────────────────
_ps = {
    "last_center": time.time(),
    "warned"     : False,
    "warning_time": 0.0,
    "blink_ctr"  : 0,
    "blinks"     : 0,
    "fps_hist"   : deque(maxlen=FPS_BUF),
    "active"     : False    # toggled True after successful verify
}

# ─── public api ──────────────────────────────────────────
def verify_user(b64):
    img   = _decode_b64(b64)
    faces = _face.get(img)
    if not faces:
        return False, {"message": "No face detected."}
    emb = faces[0].embedding / np.linalg.norm(faces[0].embedding)

    best, name = 0.0, "Unknown"
    for n, ref in _refs.items():
        s = float(np.dot(ref, emb))
        if s > best:
            best, name = s, n

    if best >= EMB_THRESH:
        _ps.update({"active": True, "last_center": time.time()})
        return True, {"person": name, "score": f"{best:.2f}"}
    return False, {"message": f"Closest match: {name} ({best:.2f})"}

def analyse_frame(b64):
    bgr  = _decode_b64(b64)
    h,w  = bgr.shape[:2]
    t0   = time.time()

    # ------ MediaPipe inference ------
    res  = _mesh.process(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
    gazeL = gazeR = "--"; ear_val = 0
    status = "OK"; msg = ""; beep = False

    if res.multi_face_landmarks:
        lm = res.multi_face_landmarks[0].landmark
        eL = np.array([[lm[i].x*w, lm[i].y*h] for i in L_EYE])
        eR = np.array([[lm[i].x*w, lm[i].y*h] for i in R_EYE])
        iL = np.array([[lm[i].x*w, lm[i].y*h] for i in L_IRIS]).mean(0)
        iR = np.array([[lm[i].x*w, lm[i].y*h] for i in R_IRIS]).mean(0)

        ear_val = (_ear(eL)+_ear(eR))/2
        if ear_val < BLINK_EAR_THR: _ps["blink_ctr"] += 1
        else:
            if _ps["blink_ctr"] >= BLINK_CONSEC_FR: _ps["blinks"] += 1
            _ps["blink_ctr"] = 0

        gazeL = _dir(_g_ratio(iL, eL[0], eL[3]))
        gazeR = _dir(_g_ratio(iR, eR[0], eR[3]))

        # drawing
        for poly in (eL,eR):
            cv2.polylines(bgr,[poly.astype(int)],True,(0,255,0),1)
        cv2.circle(bgr, tuple(iL.astype(int)),2,(0,255,0),-1)
        cv2.circle(bgr, tuple(iR.astype(int)),2,(0,255,0),-1)

    both_center = gazeL==gazeR=="CENTER"
    if both_center:
        _ps["last_center"] = time.time(); _ps["warned"] = False
    else:
        away = time.time()-_ps["last_center"]
        if away > AWAY_GRACE_SEC:
            status="WARNING"; msg="LOOK BACK OR EXAM WILL CLOSE!"
            if not _ps["warned"]:
                _ps["warned"]=True; _ps["warning_time"]=time.time(); beep=True
            if time.time()-_ps["warning_time"]>EXIT_DELAY_SEC:
                status="TERMINATE"; msg="Focus lost too long. Exam terminated."; _ps["active"]=False

    # HUD overlay
    _ps["fps_hist"].append(time.time()-t0)
    fps = 1/(np.mean(_ps["fps_hist"]) or 1)
    cv2.putText(bgr,f"FPS:{fps:.1f}", (10,30), cv2.FONT_HERSHEY_SIMPLEX,1,(0,255,0),2)
    cv2.putText(bgr,f"EAR:{ear_val:.2f}",(10,70), cv2.FONT_HERSHEY_SIMPLEX,1,(0,0,255),2)
    cv2.putText(bgr,f"Blinks:{_ps['blinks']}",(10,110), cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,0),2)
    cv2.putText(bgr,f"R:{gazeR}",(10,180), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,255),2)
    cv2.putText(bgr,f"L:{gazeL}",(10,250), cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,255),2)
    if status=="WARNING":
        cv2.putText(bgr,msg,(40,60),cv2.FONT_HERSHEY_DUPLEX,1,(0,0,255),3)

    _, buf = cv2.imencode(".jpg", bgr, [cv2.IMWRITE_JPEG_QUALITY,70])
    frame_url = "data:image/jpeg;base64," + base64.b64encode(buf).decode()

    gaze_dir = "CENTER" if both_center else ("LEFT" if gazeL=="LEFT" or gazeR=="LEFT" else "RIGHT")

    return {
        "frame"   : frame_url,
        "gaze"    : gaze_dir,
        "blinks"  : _ps["blinks"],
        "status"  : status,
        "message" : msg,
        "playBeep": beep
    }
