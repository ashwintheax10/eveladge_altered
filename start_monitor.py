#!/usr/bin/env python3
"""
Start the monitor app Flask server
"""
import subprocess
import sys
import os

def start_monitor():
    """Start the monitor app Flask server"""
    monitor_dir = "monitor-app"
    
    if not os.path.exists(monitor_dir):
        print(f"Error: {monitor_dir} directory not found!")
        return False
    
    # Change to monitor-app directory
    os.chdir(monitor_dir)
    
    try:
        print("Starting monitor app on http://localhost:6000")
        print("Press Ctrl+C to stop")
        
        # Start the Flask app
        subprocess.run([sys.executable, "app.py"], check=True)
        
    except KeyboardInterrupt:
        print("\nMonitor app stopped.")
    except subprocess.CalledProcessError as e:
        print(f"Error starting monitor app: {e}")
        return False
    
    return True

if __name__ == "__main__":
    start_monitor() 