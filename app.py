from flask import Flask, jsonify, request, render_template
from proctoring.system import IntegratedProctoringSystem
import threading

app = Flask(__name__)
system = IntegratedProctoringSystem(disable_ui=True)

@app.route('/')
def home():
    return render_template('index.html', session_id=system.session_id)

@app.route('/start_proctoring', methods=['POST'])
def start_proctoring():
    print("Start proctoring endpoint called")  # Debug log
    try:
        # Check if session is already running
        if hasattr(system, 'session_thread') and system.session_thread.is_alive():
            print("Session already running")
            return jsonify({"status": "Proctoring session already running"}), 200
        
        print("Initializing camera and audio...")
        
        # Initialize camera and audio if not already done
        if system.camera is None:
            print("Initializing camera...")
            if not system.initialize_camera():
                print("Failed to initialize camera")
                return jsonify({"error": "Failed to initialize camera"}), 500
            print("Camera initialized successfully")
        
        if system.audio_stream is None:
            print("Initializing audio...")
            if not system.initialize_audio():
                print("Failed to initialize audio")
                return jsonify({"error": "Failed to initialize audio"}), 500
            print("Audio initialized successfully")
        
        # Ensure session is active
        system.is_session_active = True
        print("Session marked as active")
        
        # Start the session in a separate thread
        print("Starting proctoring thread...")
        system.session_thread = threading.Thread(target=system.run_proctoring_loop, daemon=True)
        system.session_thread.start()
        print("Proctoring thread started successfully")
        
        return jsonify({"status": "Proctoring session started successfully"}), 200
            
    except Exception as e:
        print(f"Error in start_proctoring: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/end_proctoring', methods=['POST'])
def end_proctoring():
    try:
        system.emergency_stop()
        return jsonify({"status": "Proctoring session ended"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    try:
        return jsonify({
            "session_active": system.is_session_active,
            "session_id": system.session_id,
            "major_violations": system.major_violations,
            "minor_violations": system.minor_violations,
            "max_violations": system.max_violations,
            "camera_initialized": system.camera is not None,
            "audio_initialized": system.audio_stream is not None
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
