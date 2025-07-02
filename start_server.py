#!/usr/bin/env python3
"""
Simple script to start the code execution server
"""

from test_app import app

if __name__ == '__main__':
    print("🚀 Starting EvalEdge Code Execution Server...")
    print("📝 Problems available:")
    
    # Test the problems database
    from code_execution.problems import ProblemsDatabase
    db = ProblemsDatabase()
    problems = db.get_all_problems()
    for p in problems:
        print(f"   - {p['title']} ({p['difficulty']})")
    
    print(f"\n🌐 Server will start on http://localhost:5001")
    print("📱 Frontend should connect automatically")
    print("🛑 Press Ctrl+C to stop")
    print("-" * 50)
    
    try:
        app.run(host='0.0.0.0', port=5001, debug=False)
    except KeyboardInterrupt:
        print("\n✅ Server stopped gracefully")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
