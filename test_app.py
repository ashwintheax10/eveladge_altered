from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from code_execution.executor import CodeExecutor
from code_execution.problems import ProblemsDatabase
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
code_executor = CodeExecutor()
problems_db = ProblemsDatabase()

@app.route('/')
def home():
    return jsonify({"message": "EvalEdge Code Execution API", "status": "running"})

# Code Execution Endpoints
@app.route('/api/problems', methods=['GET'])
def get_problems():
    """Get all available coding problems"""
    try:
        problems = problems_db.get_all_problems()
        return jsonify({"problems": problems}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/problems/<problem_id>', methods=['GET'])
def get_problem(problem_id):
    """Get a specific problem by ID"""
    try:
        problem = problems_db.get_problem(problem_id)
        if not problem:
            return jsonify({"error": "Problem not found"}), 404
        return jsonify({"problem": problem}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/execute', methods=['POST'])
def execute_code():
    """Execute code and run test cases"""
    try:
        data = request.get_json()
        
        # Debug logging
        print(f"🐛 Backend received:")
        print(f"   Language: {data.get('language')}")
        print(f"   Problem ID: {data.get('problem_id')}")
        print(f"   Code preview: {data.get('code', '')[:100]}...")
        
        # Validate required fields
        required_fields = ['code', 'language', 'problem_id']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        code = data['code']
        language = data['language']
        problem_id = data['problem_id']
        
        # Get test cases for the problem
        test_cases = problems_db.get_test_cases(problem_id)
        if not test_cases:
            return jsonify({"error": "No test cases found for this problem"}), 404
        
        # Execute code
        result = code_executor.execute_code(code, language, test_cases, problem_id)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/run-sample', methods=['POST'])
def run_sample():
    """Run code with sample input only"""
    try:
        data = request.get_json()
        
        required_fields = ['code', 'language', 'problem_id']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        code = data['code']
        language = data['language']
        problem_id = data['problem_id']
        
        # Get only the first test case as sample
        test_cases = problems_db.get_test_cases(problem_id)
        if not test_cases:
            return jsonify({"error": "No test cases found for this problem"}), 404
        
        sample_test = [test_cases[0]]  # Only run first test case
        result = code_executor.execute_code(code, language, sample_test, problem_id)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting EvalEdge Code Execution Server...")
    print("Available endpoints:")
    print("- GET /api/problems - Get all problems")
    print("- GET /api/problems/<id> - Get specific problem")
    print("- POST /api/execute - Execute code with all test cases")
    print("- POST /api/run-sample - Execute code with sample test case")
    app.run(debug=True, port=5001)
