# app.py  ──────────────────────────────────────────────────
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import threading

# local modules
from proctoring.system import IntegratedProctoringSystem
from proctoring.vision import verify_user, analyse_frame

# ─── Flask setup ─────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})       # dev‑only; remove in prod

system = IntegratedProctoringSystem(disable_ui=True)

# ─── Face verification & live proctoring endpoints ──────
@app.post("/verify")
def verify():
    ok, payload = verify_user(request.form["image"])
    return jsonify({"ok": ok, **payload})

@app.post("/proctor")
def proctor():
    if not system.is_session_active:
        return jsonify(status="INACTIVE")
    return jsonify(analyse_frame(request.form["image"]))

# ─── Existing UI (templates/index.html) ──────────────────
@app.get("/")
def home():
    return render_template("index.html", session_id=system.session_id)

# ─── Start / stop the integrated CLI loop (unchanged) ───
@app.post("/start_proctoring")
def start_proctoring():
    if getattr(system, "session_thread", None) and system.session_thread.is_alive():
        return jsonify(status="Proctoring session already running"), 200

    # lazy‑init hardware
    if system.camera is None and not system.initialize_camera():
        return jsonify(error="Failed to initialize camera"), 500
    if system.audio_stream is None and not system.initialize_audio():
        return jsonify(error="Failed to initialize audio"), 500

    system.is_session_active = True
    system.session_thread = threading.Thread(
        target=system.run_proctoring_loop, daemon=True)
    system.session_thread.start()

    return jsonify(status="Proctoring session started"), 200

@app.post("/end_proctoring")
def end_proctoring():
    system.emergency_stop()
    return jsonify(status="Proctoring session ended"), 200

@app.get("/status")
def get_status():
    return jsonify(
        session_active   = system.is_session_active,
        session_id       = system.session_id,
        major_violations = system.major_violations,
        minor_violations = system.minor_violations,
        max_violations   = system.max_violations,
        camera_init      = system.camera is not None,
        audio_init       = system.audio_stream is not None
    ), 200

# ─── run ─────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True)
