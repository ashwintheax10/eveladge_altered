import base64, cv2, numpy as np, os
from pathlib import Path
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import safe_join
from flask_cors import CORS
from insightface.app import FaceAnalysis

verify_bp = Blueprint('verify_bp', __name__, static_folder="static", static_url_path="/")
CORS_orig = CORS  # Save reference to CORS for use in main app if needed

REF_DIR     = "reference"
EMB_THRESH  = 0.60
SECRET_KEY  = "super‑secret"
STATIC_DIR  = "static"

# ---------- optional direct routes to SPA ----------
@verify_bp.route('/exam')
@verify_bp.route('/instructions')
def serve_spa():
    return send_from_directory(STATIC_DIR, 'index.html')

# ---------- InsightFace setup ----------
face_app = FaceAnalysis(providers=["CPUExecutionProvider"])
face_app.prepare(ctx_id=0, det_size=(640, 640))

def get_emb(bgr):
    faces = face_app.get(bgr)
    if not faces:
        return None
    emb = faces[0].embedding
    return emb / np.linalg.norm(emb)

# ---------- preload reference embeddings ----------
reference = {}
Path(REF_DIR).mkdir(exist_ok=True)
for img_p in Path(REF_DIR).glob("*.[jp][pn]g"):
    emb = get_emb(cv2.imread(str(img_p)))
    if emb is not None:
        reference[img_p.name] = emb
print("Loaded reference:", list(reference))

@verify_bp.route("/verify_api", methods=["POST"])
def verify_api():
    try:
        data_url = request.form["image"].split(",")[1]
        bgr = cv2.imdecode(
            np.frombuffer(base64.b64decode(data_url), np.uint8), cv2.IMREAD_COLOR
        )
        emb = get_emb(bgr)
        if emb is None:
            return jsonify(ok=False, msg="No face detected")
        best, name = 0.0, "Unknown"
        for n, ref in reference.items():
            score = float(np.dot(ref, emb))
            if score > best:
                best, name = score, n
        if best >= EMB_THRESH:
            return jsonify(ok=True, person=name, score=best)
        return jsonify(ok=False, msg="No match", closest=name, score=best)
    except Exception as e:
        return jsonify(ok=False, msg=str(e))

@verify_bp.route("/api/problems", methods=["GET"])
def get_problems():
    sample_problem = {
        "id": "1",
        "title": "Add Two Numbers",
        "difficulty": "Easy",
        "description": "**Example:**\\nInput: [1,2]\\nOutput: 3\\n\\n**Constraints:**\\n1 <= a,b <= 1000",
        "starter_code": {
            "javascript": "function add(a, b) {\\n  return a + b;\\n}",
            "python": "def add(a, b):\\n    return a + b"
        },
        "test_cases": [
            {"input": [1, 2], "expected": 3,  "description": "Simple sum"},
            {"input": [10,15], "expected": 25, "description": "Double digits"}
        ]
    }
    return jsonify({"problems": [sample_problem]})

@verify_bp.route("/api/run-sample", methods=["POST"])
def api_run_sample():
    return jsonify(success=True, results=[], score=0, passed_tests=0,
                   total_tests=0, all_passed=True)

@verify_bp.route("/api/execute", methods=["POST"])
def api_execute():
    return jsonify(success=True, results=[], score=0, passed_tests=0,
                   total_tests=0, all_passed=True)

@verify_bp.route('/')
def verify_home():
    return "<h3>Verify app is running. Use the API endpoints or visit /verify/exam.</h3>"

@verify_bp.route('/', defaults={'path': ''})
@verify_bp.route('/<path:path>')
def serve_react(path):
    file_path = safe_join(STATIC_DIR, path)
    if path and os.path.exists(file_path):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, 'index.html') 