# monitor_app/app.py
import cv2, time, mediapipe as mp, numpy as np
from collections import deque
from threading import Lock
from flask import Flask, Response, jsonify
from flask_cors   import CORS

# ─── Flask app & shared flags ─────────────────────────────
app = Flask(__name__)
CORS(app)                                        # allow React polling

state_lock = Lock()
app_state  = {"warn": False, "terminate": False}  # flags React cares about

# ─── CV constants ─────────────────────────────────────────
BLINK_EAR_THR, BLINK_CONSEC_FR = 0.21, 2
GAZE_L_THR,  GAZE_R_THR        = 1.25, 0.75      # R/L thresholds
AWAY_GRACE_SEC, EXIT_DELAY_SEC = 1.5, 2.0
FPS_BUF                        = 30

LEFT  = [33,160,158,133,153,144];  RIGHT = [362,385,387,263,373,380]
LEFT_IRIS  = [468,469,470,471];     RIGHT_IRIS = [473,474,475,476]

mp_face = mp.solutions.face_mesh.FaceMesh(
    refine_landmarks=True, max_num_faces=1,
    min_detection_confidence=0.5, min_tracking_confidence=0.5)

# ─── helpers ──────────────────────────────────────────────
def ear(p):
    p1,p2,p3,p4,p5,p6 = p
    return (np.linalg.norm(p2-p6)+np.linalg.norm(p3-p5)) / (2*np.linalg.norm(p1-p4))

def gaze_ratio(iris, L, R):
    dl, dr = np.linalg.norm(iris-L), np.linalg.norm(iris-R)
    return dr/dl if dl else 1

def direction(r):
    return "RIGHT" if r > GAZE_L_THR else "LEFT" if r < GAZE_R_THR else "CENTER"

# ─── main generator ───────────────────────────────────────
def generate_frames():
    cam = cv2.VideoCapture(1)
    fps_hist, blink_cntr, blinks = deque(maxlen=FPS_BUF), 0, 0
    last_center, warned = time.time(), False
    warn_t = 0                                          # time of last warn

    while cam.isOpened():
        t0 = time.time()
        ok, frame = cam.read()
        if not ok:
            break
        h, w = frame.shape[:2]

        # ---------- Face‑mesh inference ----------
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = mp_face.process(rgb)

        gazeL = gazeR = "--"
        ear_disp = 0
        if res.multi_face_landmarks:
            lm = res.multi_face_landmarks[0].landmark
            eyeL  = np.array([[lm[i].x * w, lm[i].y * h] for i in LEFT])
            eyeR  = np.array([[lm[i].x * w, lm[i].y * h] for i in RIGHT])
            irisL = np.array([[lm[i].x * w, lm[i].y * h] for i in LEFT_IRIS]).mean(0)
            irisR = np.array([[lm[i].x * w, lm[i].y * h] for i in RIGHT_IRIS]).mean(0)

            # 1️⃣  blink detection
            ear_disp = round((ear(eyeL) + ear(eyeR)) / 2, 3)
            blink_cntr = blink_cntr + 1 if ear_disp < BLINK_EAR_THR else 0
            if ear_disp >= BLINK_EAR_THR and blink_cntr >= BLINK_CONSEC_FR:
                blinks += 1

            # 2️⃣  gaze direction
            gazeL, gazeR = (direction(gaze_ratio(irisL, eyeL[0], eyeL[3])),
                            direction(gaze_ratio(irisR, eyeR[0], eyeR[3])))

            # (optional) draw eyes
            for poly in (eyeL, eyeR):
                cv2.polylines(frame, [poly.astype(int)], True, (0, 255, 0), 1)
            cv2.circle(frame, tuple(irisL.astype(int)), 2, (0, 255, 0), -1)
            cv2.circle(frame, tuple(irisR.astype(int)), 2, (0, 255, 0), -1)

        # ---------- Focus‑guard ----------
        if gazeL == gazeR == "CENTER":
            last_center = time.time()
            warned = False
        else:
            away = time.time() - last_center
            if away > AWAY_GRACE_SEC:
                cv2.putText(frame, "LOOK BACK OR EXAM WILL CLOSE!",
                            (40, 60), cv2.FONT_HERSHEY_DUPLEX,
                            1, (0, 0, 255), 3)

                # 🔔 raise one‑shot warning flag for React
                with state_lock:
                    app_state["warn"] = True

                if not warned:
                    warned = True
                    warn_t = time.time()

                if time.time() - warn_t > EXIT_DELAY_SEC:
                    with state_lock:
                        app_state["terminate"] = True
                    break   # stop generator → React will see terminate

        # ---------- HUD ----------
        fps_hist.append(time.time() - t0)
        fps = 1 / np.mean(fps_hist)
        cv2.putText(frame, f"FPS:{fps:.1f}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f"Ratio:{ear_disp:.2f}", (10, 70),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.putText(frame, f"Total Blinks:{blinks}", (10, 110),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
        cv2.putText(frame, f"R:{gazeR}", (10, 180),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
        cv2.putText(frame, f"L:{gazeL}", (10, 250),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)

        # ---------- MJPEG yield ----------
        flag, buf = cv2.imencode(".jpg", frame)
        if not flag:
            continue
        yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" +
               bytearray(buf) + b"\r\n")

    cam.release()

# ─── routes ───────────────────────────────────────────────
@app.get("/")
def root():
    return "<h3>Monitor running — open /video_feed to preview.</h3>"

@app.get("/video_feed")
def video():
    return Response(generate_frames(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")

@app.get("/status")
def status():
    """React polls this every second."""
    with state_lock:
        data = app_state.copy()
        app_state["warn"] = False            # auto‑reset one‑shot
    return jsonify(data)

# ─── main ────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000, debug=True)
