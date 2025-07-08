from flask import Blueprint, jsonify, request
from flask_cors import CORS
from code_execution.executor import CodeExecutor
from code_execution.problems import ProblemsDatabase

code_bp = Blueprint('code_bp', __name__)
CORS_orig = CORS  # Save reference to CORS for use in main app if needed
code_executor = CodeExecutor()
problems_db = ProblemsDatabase()

@code_bp.route('/')
def home():
    return jsonify({"message": "EvalEdge Code Execution API", "status": "running"})

@code_bp.route('/api/problems', methods=['GET'])
def get_problems():
    try:
        problems = problems_db.get_all_problems()
        return jsonify({"problems": problems}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@code_bp.route('/api/problems/<problem_id>', methods=['GET'])
def get_problem(problem_id):
    try:
        problem = problems_db.get_problem(problem_id)
        if not problem:
            return jsonify({"error": "Problem not found"}), 404
        return jsonify({"problem": problem}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@code_bp.route('/api/execute', methods=['POST'])
def execute_code():
    try:
        data = request.get_json()
        print(f"🐛 Backend received:")
        print(f"   Language: {data.get('language')}")
        print(f"   Problem ID: {data.get('problem_id')}")
        print(f"   Code preview: {data.get('code', '')[:100]}...")
        required_fields = ['code', 'language', 'problem_id']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        code = data['code']
        language = data['language']
        problem_id = data['problem_id']
        test_cases = problems_db.get_test_cases(problem_id)
        if not test_cases:
            return jsonify({"error": "No test cases found for this problem"}), 404
        result = code_executor.execute_code(code, language, test_cases, problem_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@code_bp.route('/api/run-sample', methods=['POST'])
def run_sample():
    try:
        data = request.get_json()
        required_fields = ['code', 'language', 'problem_id']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        code = data['code']
        language = data['language']
        problem_id = data['problem_id']
        test_cases = problems_db.get_test_cases(problem_id)
        if not test_cases:
            return jsonify({"error": "No test cases found for this problem"}), 404
        sample_test = [test_cases[0]]
        result = code_executor.execute_code(code, language, sample_test, problem_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500 