#!/usr/bin/env python3
"""
Test script to verify code execution functionality
"""

import requests
import json

# Test the code execution API
API_BASE = "http://localhost:5001"

def test_get_problems():
    """Test getting all problems"""
    print("🧪 Testing: Get all problems")
    try:
        response = requests.get(f"{API_BASE}/api/problems")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data['problems'])} problems")
            for problem in data['problems']:
                print(f"   - {problem['id']}: {problem['title']} ({problem['difficulty']})")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Server not running. Start with: python test_app.py")

def test_execute_two_sum():
    """Test executing a Two Sum solution"""
    print("\n🧪 Testing: Execute Two Sum solution")
    
    # Correct solution
    javascript_solution = """
function solution(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
"""
    
    python_solution = """
def solution(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []
"""
    
    # Test JavaScript
    try:
        response = requests.post(f"{API_BASE}/api/execute", json={
            "code": javascript_solution,
            "language": "javascript",
            "problem_id": "two_sum"
        })
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ JavaScript: {result['passed_tests']}/{result['total_tests']} tests passed ({result['score']:.1f}%)")
            if not result['all_passed']:
                print("   Failed tests:")
                for test_result in result['results']:
                    if not test_result['passed']:
                        print(f"     Test {test_result['testCase']}: Expected {test_result['expected']}, got {test_result['actual']}")
        else:
            print(f"❌ JavaScript failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ JavaScript test error: {e}")
    
    # Test Python
    try:
        response = requests.post(f"{API_BASE}/api/execute", json={
            "code": python_solution,
            "language": "python",
            "problem_id": "two_sum"
        })
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Python: {result['passed_tests']}/{result['total_tests']} tests passed ({result['score']:.1f}%)")
            if not result['all_passed']:
                print("   Failed tests:")
                for test_result in result['results']:
                    if not test_result['passed']:
                        print(f"     Test {test_result['testCase']}: Expected {test_result['expected']}, got {test_result['actual']}")
        else:
            print(f"❌ Python failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Python test error: {e}")

def test_execute_wrong_solution():
    """Test executing an incorrect solution"""
    print("\n🧪 Testing: Execute incorrect solution")
    
    wrong_solution = """
function solution(nums, target) {
    // Wrong solution - always return [0, 1]
    return [0, 1];
}
"""
    
    try:
        response = requests.post(f"{API_BASE}/api/execute", json={
            "code": wrong_solution,
            "language": "javascript",
            "problem_id": "two_sum"
        })
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Wrong solution test: {result['passed_tests']}/{result['total_tests']} tests passed ({result['score']:.1f}%)")
            print("   (This should have some failures, which is expected)")
        else:
            print(f"❌ Wrong solution test failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Wrong solution test error: {e}")

def test_sample_execution():
    """Test running sample test case only"""
    print("\n🧪 Testing: Run sample test case")
    
    solution = """
function solution(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
"""
    
    try:
        response = requests.post(f"{API_BASE}/api/run-sample", json={
            "code": solution,
            "language": "javascript",
            "problem_id": "two_sum"
        })
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Sample test: {result['passed_tests']}/{result['total_tests']} tests passed")
            print(f"   Expected 1 test case only (sample)")
        else:
            print(f"❌ Sample test failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Sample test error: {e}")

if __name__ == "__main__":
    print("🚀 EvalEdge Code Execution Tests")
    print("=" * 50)
    
    test_get_problems()
    test_execute_two_sum()
    test_execute_wrong_solution()
    test_sample_execution()
    
    print("\n✨ Tests completed!")
    print("\nTo run the frontend:")
    print("1. npm install")
    print("2. npm run dev")
    print("3. Open http://localhost:5173 and navigate to /exam")
