import cv2
import mediapipe as mp
import sounddevice as sd
import numpy as np
import os
import json
import zipfile
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from .eye_track import EyeTracker

class IntegratedProctoringSystem:
    def __init__(self, disable_ui=False):
        # Initialize MediaPipe
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=0, min_detection_confidence=0.5
        )
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=5,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Session management
        self.session_start_time = datetime.now()
        self.session_id = self.session_start_time.strftime("%Y%m%d_%H%M%S")
        self.is_session_active = True
        
        # Violation tracking
        self.major_violations = 0
        self.minor_violations = 0
        self.max_violations = 3
        self.violation_types = {
            'MULTIPLE_FACES': {'threshold': 3.0, 'current_duration': 0, 'start_time': None},
            'LOOKING_AWAY': {'threshold': 5.0, 'current_duration': 0, 'start_time': None},
            'SUSTAINED_AUDIO': {'threshold': 3.0, 'current_duration': 0, 'start_time': None}
        }
        
        # Eye tracking specific settings
        self.eye_minor_warning_threshold = 2.0  # seconds for minor warning
        self.eye_major_warning_threshold = 8.0  # seconds for major warning
        
        # Camera and snapshot system
        self.camera = None
        self.frame_count = 0
        self.fps = 30
        
        # Snapshot system (every 30 seconds for testing, normally 2 minutes)
        self.last_snapshot_time = None
        self.snapshot_interval = 30  # 30 seconds for testing (change to 120 for production)
        self.regular_snapshots = []
        
        # Audio monitoring
        self.audio_amplitude = 0
        self.audio_threshold = 20
        self.audio_callback_running = False
        self.audio_stream = None
        
        # Head pose tracking
        self.head_pose_angles = {'x': 0, 'y': 0, 'z': 0}
        self.pose_threshold_x = 25  # degrees
        self.pose_threshold_y = 20  # degrees
        
        # Eye tracking
        self.eye_tracker = EyeTracker(enable_iris_tracking=True)
        print("Enhanced Eye Tracker initialized")
        
        # Setup directories and files
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.setup_directories()
        self.setup_logging()
        
        print(f"Integrated Proctoring System initialized - Session: {self.session_id}")
    
    def setup_directories(self):
        """Create necessary directories"""
        self.snapshots_dir = os.path.join(self.base_dir, "snapshots")
        self.logs_dir = os.path.join(self.base_dir, "logs")
        self.recordings_dir = os.path.join(self.base_dir, "recordings")
        self.reports_dir = os.path.join(self.base_dir, "reports")
        
        for directory in [self.snapshots_dir, self.logs_dir, 
                         self.recordings_dir, self.reports_dir]:
            os.makedirs(directory, exist_ok=True)
    
    def setup_logging(self):
        """Setup logging files"""
        self.violations_log = []
        self.log_file_path = os.path.join(self.logs_dir, f"log_{self.session_id}.json")
        self.recording_path = os.path.join(self.recordings_dir, f"session_{self.session_id}.avi")
    
    def initialize_camera(self):
        """Initialize camera"""
        try:
            self.camera = cv2.VideoCapture(0)
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            self.camera.set(cv2.CAP_PROP_FPS, self.fps)
            
            if not self.camera.isOpened():
                raise RuntimeError("Failed to open camera")
            
            # Initialize snapshot timing
            self.last_snapshot_time = datetime.now()
            
            print("Camera initialized successfully")
            print("Regular snapshots will be taken every 2 minutes")
            return True
            
        except Exception as e:
            print(f"Failed to initialize camera: {e}")
            return False
    
    def initialize_audio(self):
        """Initialize audio monitoring"""
        try:
            def audio_callback(indata, frames, time, status):
                if self.audio_callback_running:
                    rms = np.sqrt(np.mean(indata**2)) * 1000
                    self.audio_amplitude = rms
            
            self.audio_stream = sd.InputStream(callback=audio_callback)
            self.audio_stream.start()
            self.audio_callback_running = True
            print("Audio monitoring initialized successfully")
            return True
            
        except Exception as e:
            print(f"Failed to initialize audio: {e}")
            return False
    
    def detect_faces(self, frame):
        """Detect faces using MediaPipe"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_detection.process(rgb_frame)
        
        faces = []
        if results.detections:
            for i, detection in enumerate(results.detections):
                bbox = detection.location_data.relative_bounding_box
                h, w, _ = frame.shape
                x = int(bbox.xmin * w)
                y = int(bbox.ymin * h)
                width = int(bbox.width * w)
                height = int(bbox.height * h)
                
                faces.append({
                    'bbox': (x, y, width, height),
                    'confidence': detection.score[0]
                })
        
        return faces, frame
    
    def calculate_head_pose(self, frame):
        """Calculate head pose angles"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                # Get specific landmarks for pose estimation
                h, w, _ = frame.shape
                
                # Nose tip, chin, left eye, right eye
                nose_tip = face_landmarks.landmark[1]
                chin = face_landmarks.landmark[175]
                left_eye = face_landmarks.landmark[33]
                right_eye = face_landmarks.landmark[263]
                
                # Convert to pixel coordinates
                nose_2d = np.array([nose_tip.x * w, nose_tip.y * h], dtype=np.float64)
                chin_2d = np.array([chin.x * w, chin.y * h], dtype=np.float64)
                left_eye_2d = np.array([left_eye.x * w, left_eye.y * h], dtype=np.float64)
                right_eye_2d = np.array([right_eye.x * w, right_eye.y * h], dtype=np.float64)
                
                # Calculate angles (simplified approach)
                eye_center = (left_eye_2d + right_eye_2d) / 2
                
                # Y-axis rotation (left/right turn)
                eye_to_nose = nose_2d - eye_center
                y_angle = np.arctan2(eye_to_nose[0], abs(eye_to_nose[1])) * 180 / np.pi
                
                # X-axis rotation (up/down tilt)
                nose_to_chin = chin_2d - nose_2d
                x_angle = np.arctan2(nose_to_chin[1], abs(nose_to_chin[0])) * 180 / np.pi - 90
                
                self.head_pose_angles = {'x': x_angle, 'y': y_angle, 'z': 0}
                
                # Draw pose info
                cv2.putText(frame, f"Pose Y: {y_angle:.1f}°", (10, 200), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                cv2.putText(frame, f"Pose X: {x_angle:.1f}°", (10, 230), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                
                return True
        
        return False
    
    def take_snapshot(self, frame, violation_type: str):
        """Take snapshot during violation"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
        snapshot_filename = f"violation_{self.major_violations}_{violation_type}_{timestamp}.jpg"
        snapshot_path = os.path.join(self.snapshots_dir, snapshot_filename)
        
        # Add violation overlay
        overlay_frame = frame.copy()
        cv2.putText(overlay_frame, f"VIOLATION: {violation_type}", 
                   (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
        cv2.putText(overlay_frame, f"Count: {self.major_violations}/{self.max_violations}", 
                   (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
        cv2.putText(overlay_frame, f"Time: {timestamp}", 
                   (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        success = cv2.imwrite(snapshot_path, overlay_frame)
        if success:
            print(f"Snapshot saved: {snapshot_path}")
            return snapshot_path
        return None
    
    def take_regular_snapshot(self, frame):
        """Take regular snapshot every 2 minutes"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        snapshot_filename = f"regular_snapshot_{timestamp}.jpg"
        snapshot_path = os.path.join(self.snapshots_dir, snapshot_filename)
        
        # Add timestamp overlay to frame
        overlay_frame = frame.copy()
        cv2.putText(overlay_frame, f"Regular Snapshot - {timestamp}", 
                   (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)
        cv2.putText(overlay_frame, f"Session: {self.session_id}", 
                   (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(overlay_frame, f"Violations: {self.major_violations}/{self.max_violations}", 
                   (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        success = cv2.imwrite(snapshot_path, overlay_frame)
        if success:
            self.regular_snapshots.append({
                'timestamp': datetime.now().isoformat(),
                'filename': snapshot_filename,
                'path': snapshot_path,
                'session_time': (datetime.now() - self.session_start_time).total_seconds()
            })
            print(f"Regular snapshot saved: {snapshot_path}")
            return snapshot_path
        return None
    
    def check_regular_snapshot(self, frame):
        """Check if it's time to take a regular snapshot"""
        if self.last_snapshot_time is None:
            return
        
        current_time = datetime.now()
        time_since_last = (current_time - self.last_snapshot_time).total_seconds()
        
        if time_since_last >= self.snapshot_interval:
            self.take_regular_snapshot(frame)
            self.last_snapshot_time = current_time
    
    def log_violation(self, violation_type: str, details: Dict, snapshot_path: Optional[str] = None):
        """Log violation to JSON file"""
        violation_entry = {
            'violation_number': self.major_violations,
            'type': violation_type,
            'timestamp': datetime.now().isoformat(),
            'session_time_seconds': (datetime.now() - self.session_start_time).total_seconds(),
            'details': details,
            'snapshot_path': snapshot_path,
            'frame_number': self.frame_count
        }
        
        self.violations_log.append(violation_entry)
        
        # Save to file
        session_info = {
            'session_id': self.session_id,
            'session_start': self.session_start_time.isoformat(),
            'max_violations': self.max_violations,
            'current_violations': self.major_violations,
            'violations': self.violations_log
        }
        
        try:
            with open(self.log_file_path, 'w') as f:
                json.dump(session_info, f, indent=2)
        except Exception as e:
            print(f"Failed to save log: {e}")
    
    def check_violations(self, frame, faces):
        """Check for various types of violations"""
        current_time = datetime.now()
        violations_detected = []
        
        # Check for multiple faces
        if len(faces) > 1:
            violation_info = self.violation_types['MULTIPLE_FACES']
            if violation_info['start_time'] is None:
                violation_info['start_time'] = current_time
            
            duration = (current_time - violation_info['start_time']).total_seconds()
            
            if duration >= violation_info['threshold']:
                self.major_violations += 1
                snapshot_path = self.take_snapshot(frame, "MULTIPLE_FACES")
                
                details = {
                    'faces_detected': len(faces),
                    'duration_seconds': duration,
                    'face_positions': [face['bbox'] for face in faces]
                }
                
                self.log_violation("MULTIPLE_FACES", details, snapshot_path)
                violations_detected.append("MULTIPLE_FACES")
                violation_info['start_time'] = None
        else:
            self.violation_types['MULTIPLE_FACES']['start_time'] = None
        
        # Check for looking away
        if abs(self.head_pose_angles['y']) > self.pose_threshold_y or abs(self.head_pose_angles['x']) > self.pose_threshold_x:
            violation_info = self.violation_types['LOOKING_AWAY']
            if violation_info['start_time'] is None:
                violation_info['start_time'] = current_time
            
            duration = (current_time - violation_info['start_time']).total_seconds()
            
            if duration >= violation_info['threshold']:
                self.major_violations += 1
                snapshot_path = self.take_snapshot(frame, "LOOKING_AWAY")
                
                details = {
                    'pose_x_angle': self.head_pose_angles['x'],
                    'pose_y_angle': self.head_pose_angles['y'],
                    'duration_seconds': duration
                }
                
                self.log_violation("LOOKING_AWAY", details, snapshot_path)
                violations_detected.append("LOOKING_AWAY")
                violation_info['start_time'] = None
        else:
            self.violation_types['LOOKING_AWAY']['start_time'] = None
        
        # Check for sustained audio
        if self.audio_amplitude > self.audio_threshold:
            violation_info = self.violation_types['SUSTAINED_AUDIO']
            if violation_info['start_time'] is None:
                violation_info['start_time'] = current_time
            
            duration = (current_time - violation_info['start_time']).total_seconds()
            
            if duration >= violation_info['threshold']:
                self.major_violations += 1
                snapshot_path = self.take_snapshot(frame, "SUSTAINED_AUDIO")
                
                details = {
                    'audio_amplitude': self.audio_amplitude,
                    'threshold': self.audio_threshold,
                    'duration_seconds': duration
                }
                
                self.log_violation("SUSTAINED_AUDIO", details, snapshot_path)
                violations_detected.append("SUSTAINED_AUDIO")
                violation_info['start_time'] = None
        else:
            self.violation_types['SUSTAINED_AUDIO']['start_time'] = None
        
        return violations_detected
    
    def check_eye_tracking_violations(self, gaze_data, frame=None):
        """Check for eye tracking violations with tiered warning system"""
        if not gaze_data or gaze_data['combined_gaze'] == 'UNKNOWN':
            return None
        
        current_time = datetime.now()
        combined_gaze = gaze_data['combined_gaze']
        
        # Check if currently looking away from center
        if combined_gaze != 'CENTER':
            if not hasattr(self, 'eye_gaze_away_start_time') or self.eye_gaze_away_start_time is None:
                self.eye_gaze_away_start_time = current_time
                return None
            
            # Calculate duration of looking away
            duration = (current_time - self.eye_gaze_away_start_time).total_seconds()
            
            # Check for minor warning (2 seconds)
            if duration >= self.eye_minor_warning_threshold and duration < self.eye_major_warning_threshold:
                # Only log once per minor warning period
                if not hasattr(self, 'eye_minor_warning_logged') or not self.eye_minor_warning_logged:
                    self.minor_violations += 1
                    self.eye_minor_warning_logged = True
                    
                    # Log minor violation (no snapshot, no termination count)
                    details = {
                        'violation_severity': 'MINOR',
                        'left_gaze': gaze_data['left_gaze'],
                        'right_gaze': gaze_data['right_gaze'],
                        'combined_gaze': combined_gaze,
                        'duration_seconds': duration,
                        'threshold_type': 'minor_warning',
                        'left_ratio': gaze_data.get('left_ratio', 0),
                        'right_ratio': gaze_data.get('right_ratio', 0)
                    }
                    
                    # Create a special log entry for minor violations
                    minor_violation_entry = {
                        'violation_number': f"MINOR-{self.minor_violations}",
                        'type': 'EYE_TRACKING_MINOR_WARNING',
                        'timestamp': datetime.now().isoformat(),
                        'session_time_seconds': (datetime.now() - self.session_start_time).total_seconds(),
                        'details': details,
                        'snapshot_path': None,
                        'frame_number': self.frame_count,
                        'affects_termination': False
                    }
                    
                    self.violations_log.append(minor_violation_entry)
                    print(f"Eye tracking MINOR warning: Looking {combined_gaze} for {duration:.1f}s")
                    
                    return "EYE_TRACKING_MINOR_WARNING"
            
            # Check for major warning (8 seconds)
            elif duration >= self.eye_major_warning_threshold:
                # Reset tracking
                self.eye_gaze_away_start_time = None
                self.eye_minor_warning_logged = False
                
                # Take snapshot and count as major violation  
                snapshot_frame = frame if frame is not None else np.zeros((480, 640, 3), dtype=np.uint8)
                snapshot_path = self.take_snapshot(snapshot_frame, "EYE_TRACKING_MAJOR_VIOLATION")
                self.major_violations += 1
                
                details = {
                    'violation_severity': 'MAJOR',
                    'left_gaze': gaze_data['left_gaze'],
                    'right_gaze': gaze_data['right_gaze'],
                    'combined_gaze': combined_gaze,
                    'duration_seconds': duration,
                    'threshold_type': 'major_violation',
                    'left_ratio': gaze_data.get('left_ratio', 0),
                    'right_ratio': gaze_data.get('right_ratio', 0)
                }
                
                self.log_violation("EYE_TRACKING_MAJOR_VIOLATION", details, snapshot_path)
                print(f"Eye tracking MAJOR violation: Looking {combined_gaze} for {duration:.1f}s - LOGGED")
                
                return "EYE_TRACKING_MAJOR_VIOLATION"
        
        else:
            # Reset tracking when looking back at center
            if hasattr(self, 'eye_gaze_away_start_time'):
                self.eye_gaze_away_start_time = None
            if hasattr(self, 'eye_minor_warning_logged'):
                self.eye_minor_warning_logged = False
        
        return None
    
    def process_frame(self, frame):
        """Process frame for all detections"""
        self.frame_count += 1
        
        # Detect faces
        faces, annotated_frame = self.detect_faces(frame)
        
        # Calculate head pose
        self.calculate_head_pose(annotated_frame)
        
        # Analyze gaze using EyeTracker
        gaze_data = self.eye_tracker.analyze_gaze(frame)
        annotated_frame = self.eye_tracker.draw_gaze_info(annotated_frame, gaze_data)
        
        # Add session info overlay
        cv2.putText(annotated_frame, f"Session: {self.session_id}", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(annotated_frame, f"Violations: {self.major_violations}/{self.max_violations}", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(annotated_frame, f"Audio: {self.audio_amplitude:.1f}", 
                   (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Check for violations
        violations = self.check_violations(annotated_frame, faces)

        # Check for eye tracking violations with tiered system
        eye_violation_type = self.check_eye_tracking_violations(gaze_data, annotated_frame)
        if eye_violation_type:
            violations.append(eye_violation_type)
        
        # Check if session should end
        if self.major_violations >= self.max_violations:
            self.is_session_active = False
        
        return annotated_frame
    
    def create_final_report(self):
        """Create comprehensive final report"""
        report_filename = f"session_report_{self.session_id}.zip"
        report_path = os.path.join(self.reports_dir, report_filename)
        
        try:
            with zipfile.ZipFile(report_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Add log file
                if os.path.exists(self.log_file_path):
                    zipf.write(self.log_file_path, f"log_{self.session_id}.json")
                
                # Add all snapshots (violation and regular)
                for filename in os.listdir(self.snapshots_dir):
                    if filename.endswith(".jpg"):
                        snapshot_path = os.path.join(self.snapshots_dir, filename)
                        zipf.write(snapshot_path, f"snapshots/{filename}")
                
                # Add summary
                summary = self.generate_session_summary()
                zipf.writestr("session_summary.json", json.dumps(summary, indent=2))
                
                # Add regular snapshots summary
                snapshots_summary = {
                    'total_regular_snapshots': len(self.regular_snapshots),
                    'snapshot_interval_seconds': self.snapshot_interval,
                    'regular_snapshots': self.regular_snapshots
                }
                zipf.writestr("snapshots_summary.json", json.dumps(snapshots_summary, indent=2))
            
            print(f"Final report created: {report_path}")
            return report_path
            
        except Exception as e:
            print(f"Failed to create final report: {e}")
            return None
    
    def generate_session_summary(self):
        """Generate comprehensive session summary"""
        session_end_time = datetime.now()
        session_duration = (session_end_time - self.session_start_time).total_seconds()
        
        return {
            'session_id': self.session_id,
            'start_time': self.session_start_time.isoformat(),
            'end_time': session_end_time.isoformat(),
            'duration_seconds': session_duration,
            'duration_formatted': str(timedelta(seconds=int(session_duration))),
            'total_violations': self.major_violations,
            'max_violations': self.max_violations,
            'session_terminated': self.major_violations >= self.max_violations,
            'total_frames_processed': self.frame_count,
            'violation_breakdown': {
                'multiple_faces': len([v for v in self.violations_log if v['type'] == 'MULTIPLE_FACES']),
                'looking_away': len([v for v in self.violations_log if v['type'] == 'LOOKING_AWAY']),
                'sustained_audio': len([v for v in self.violations_log if v['type'] == 'SUSTAINED_AUDIO'])
            },
            'violations_detail': self.violations_log
        }
    
    def emergency_stop(self):
        """Emergency stop function"""
        self.is_session_active = False
        print("Emergency stop activated")
    
    def cleanup(self):
        """Clean up all resources"""
        if self.camera:
            self.camera.release()
        if self.audio_stream:
            self.audio_stream.stop()
            self.audio_stream.close()
        cv2.destroyAllWindows()
        print("All resources cleaned up")
    
    def run_proctoring_loop(self):
        """Run the proctoring loop in a separate thread for Flask"""
        print("Starting proctoring loop...")
        
        try:
            while self.is_session_active:
                if self.camera is None:
                    print("Camera not initialized, breaking loop")
                    break
                    
                ret, frame = self.camera.read()
                if not ret:
                    print("Failed to read frame from camera")
                    time.sleep(0.1)  # Brief pause before retrying
                    continue
                
                # Validate frame
                if frame is None or frame.size == 0:
                    print("Invalid frame received")
                    continue
                
                try:
                    # Process frame
                    processed_frame = self.process_frame(frame.copy())  # Use copy to avoid memory issues
                    
                    # Check for regular snapshots (every 2 minutes)
                    self.check_regular_snapshot(processed_frame)
                    
                    # Display frame (only if not in headless mode)
                    try:
                        cv2.imshow('Integrated AI Proctoring System', processed_frame)
                        cv2.waitKey(1)  # Non-blocking wait
                    except cv2.error as cv_err:
                        print(f"OpenCV display error: {cv_err}")
                        # Continue without display
                        
                except Exception as frame_error:
                    print(f"Error processing frame: {frame_error}")
                    continue
                    
                # Small delay to prevent overwhelming the system
                time.sleep(0.033)  # ~30 FPS
        
        except Exception as e:
            print(f"Error during proctoring loop: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print("Proctoring loop ended")
    
    def start_session(self):
        """Start the integrated proctoring session"""
        print("Initializing Integrated AI Proctoring System...")
        
        if not self.initialize_camera():
            print("Failed to initialize camera")
            return False
        
        if not self.initialize_audio():
            print("Failed to initialize audio")
            return False
        
        print("Starting proctoring session...")
        print("Press 'q' to quit session")
        
        try:
            while self.is_session_active:
                ret, frame = self.camera.read()
                if not ret:
                    print("Failed to read frame")
                    break
                
                # Process frame
                processed_frame = self.process_frame(frame)
                
                # Check for regular snapshots (every 2 minutes)
                self.check_regular_snapshot(processed_frame)
                
                # Display frame
                cv2.imshow('Integrated AI Proctoring System', processed_frame)
                
                # Handle quit
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
        
        except KeyboardInterrupt:
            print("Session interrupted")
        except Exception as e:
            print(f"Error during session: {e}")
        finally:
            print("Creating final report...")
            report_path = self.create_final_report()
            self.cleanup()
            
            if report_path:
                print(f"Session complete! Report saved: {report_path}")
