import subprocess
import tempfile
import os
import json
import time
import signal
from typing import Dict, List, Any, Optional
import psutil

class CodeExecutor:
    def __init__(self):
        self.supported_languages = {
            'javascript': {
                'extension': '.js',
                'command': ['node'],
                'timeout': 10
            },
            'python': {
                'extension': '.py',
                'command': ['python3'],
                'timeout': 10
            },
            'java': {
                'extension': '.java',
                'command': ['javac'],
                'run_command': ['java'],
                'timeout': 15
            },
            'cpp': {
                'extension': '.cpp',
                'command': ['g++', '-o'],
                'timeout': 15
            }
        }
    
    def execute_code(self, code: str, language: str, test_cases: List[Dict], problem_id: str) -> Dict[str, Any]:
        """Execute code with test cases and return results"""
        if language not in self.supported_languages:
            return {
                'success': False,
                'error': f'Unsupported language: {language}',
                'results': []
            }
        
        lang_config = self.supported_languages[language]
        
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                # Create code file
                code_file = os.path.join(temp_dir, f'solution{lang_config["extension"]}')
                
                # Prepare code based on language
                prepared_code = self._prepare_code(code, language, problem_id)
                
                with open(code_file, 'w') as f:
                    f.write(prepared_code)
                
                # Compile if necessary
                if language in ['java', 'cpp']:
                    compile_result = self._compile_code(code_file, temp_dir, language)
                    if not compile_result['success']:
                        return compile_result
                
                # Run test cases
                results = []
                for i, test_case in enumerate(test_cases):
                    result = self._run_test_case(
                        code_file, temp_dir, language, test_case, i + 1
                    )
                    results.append(result)
                
                # Calculate overall score
                passed_tests = sum(1 for r in results if r['passed'])
                total_tests = len(results)
                score = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
                
                return {
                    'success': True,
                    'results': results,
                    'score': score,
                    'passed_tests': passed_tests,
                    'total_tests': total_tests,
                    'all_passed': passed_tests == total_tests
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'results': []
            }
    
    def _prepare_code(self, code: str, language: str, problem_id: str) -> str:
        """Prepare code for execution based on language and problem"""
        if language == 'javascript':
            return self._prepare_javascript_code(code, problem_id)
        elif language == 'python':
            return self._prepare_python_code(code, problem_id)
        elif language == 'java':
            return self._prepare_java_code(code, problem_id)
        elif language == 'cpp':
            return self._prepare_cpp_code(code, problem_id)
        return code
    
    def _prepare_javascript_code(self, code: str, problem_id: str) -> str:
        """Prepare JavaScript code with test harness"""
        return f"""
{code}

// Test execution
const testCases = JSON.parse(process.argv[2]);
const results = [];

testCases.forEach((testCase, index) => {{
    try {{
        const startTime = Date.now();
        const result = solution(...testCase.input);
        const executionTime = Date.now() - startTime;
        
        const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
        
        results.push({{
            testCase: index + 1,
            input: testCase.input,
            expected: testCase.expected,
            actual: result,
            passed: passed,
            executionTime: executionTime
        }});
    }} catch (error) {{
        results.push({{
            testCase: index + 1,
            input: testCase.input,
            expected: testCase.expected,
            actual: null,
            passed: false,
            error: error.message,
            executionTime: 0
        }});
    }}
}});

console.log(JSON.stringify(results));
"""
    
    def _prepare_python_code(self, code: str, problem_id: str) -> str:
        """Prepare Python code with test harness"""
        return f"""
import json
import sys
import time

{code}

# Test execution
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('[]')
        sys.exit(0)
        
    test_cases = json.loads(sys.argv[1])
    results = []
    
    for i, test_case in enumerate(test_cases):
        try:
            start_time = time.time()
            result = solution(*test_case['input'])
            execution_time = (time.time() - start_time) * 1000
            
            # Debug output for comparison
            print(f"Debug - Test {{i+1}}: result={{result}}, expected={{test_case['expected']}}", file=sys.stderr)
            
            # More robust comparison for lists
            if isinstance(result, list) and isinstance(test_case['expected'], list):
                # Sort both lists for comparison in case order doesn't matter
                passed = sorted(result) == sorted(test_case['expected'])
            else:
                passed = result == test_case['expected']
            
            results.append({{
                'testCase': i + 1,
                'input': test_case['input'],
                'expected': test_case['expected'],
                'actual': result,
                'passed': passed,
                'executionTime': execution_time
            }})
        except Exception as e:
            results.append({{
                'testCase': i + 1,
                'input': test_case['input'],
                'expected': test_case['expected'],
                'actual': None,
                'passed': False,
                'error': str(e),
                'executionTime': 0
            }})
    
    print(json.dumps(results))
"""
    
    def _prepare_java_code(self, code: str, problem_id: str) -> str:
        """Prepare Java code with test harness"""
        return f"""
import java.util.*;
import com.google.gson.*;

public class Solution {{
    {code}
    
    public static void main(String[] args) {{
        Gson gson = new Gson();
        // Test execution logic here
        System.out.println("Java execution not fully implemented yet");
    }}
}}
"""
    
    def _prepare_cpp_code(self, code: str, problem_id: str) -> str:
        """Prepare C++ code with test harness"""
        return f"""
#include <iostream>
#include <vector>
#include <string>
#include <chrono>

using namespace std;

{code}

int main() {{
    // Test execution logic here
    cout << "C++ execution not fully implemented yet" << endl;
    return 0;
}}
"""
    
    def _compile_code(self, code_file: str, temp_dir: str, language: str) -> Dict[str, Any]:
        """Compile code for compiled languages"""
        try:
            if language == 'java':
                result = subprocess.run(
                    ['javac', code_file],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
            elif language == 'cpp':
                executable = os.path.join(temp_dir, 'solution')
                result = subprocess.run(
                    ['g++', '-o', executable, code_file],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
            
            if result.returncode != 0:
                return {
                    'success': False,
                    'error': f'Compilation failed: {result.stderr}',
                    'results': []
                }
            
            return {'success': True}
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Compilation timeout',
                'results': []
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Compilation error: {str(e)}',
                'results': []
            }
    
    def _run_test_case(self, code_file: str, temp_dir: str, language: str, test_case: Dict, test_num: int) -> Dict[str, Any]:
        """Run a single test case"""
        try:
            lang_config = self.supported_languages[language]
            
            if language == 'javascript':
                cmd = ['node', code_file, json.dumps([test_case])]
            elif language == 'python':
                cmd = ['python3', code_file, json.dumps([test_case])]
            elif language == 'java':
                class_name = 'Solution'
                cmd = ['java', '-cp', temp_dir, class_name, json.dumps([test_case])]
            elif language == 'cpp':
                executable = os.path.join(temp_dir, 'solution')
                cmd = [executable, json.dumps([test_case])]
            
            start_time = time.time()
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=lang_config['timeout']
            )
            execution_time = (time.time() - start_time) * 1000
            
            if result.returncode != 0:
                return {
                    'testCase': test_num,
                    'input': test_case['input'],
                    'expected': test_case['expected'],
                    'actual': None,
                    'passed': False,
                    'error': result.stderr,
                    'executionTime': execution_time
                }
            
            # Parse output for JavaScript and Python
            if language in ['javascript', 'python']:
                try:
                    output_results = json.loads(result.stdout.strip())
                    if output_results:
                        return output_results[0]  # Return first result
                except json.JSONDecodeError:
                    pass
            
            return {
                'testCase': test_num,
                'input': test_case['input'],
                'expected': test_case['expected'],
                'actual': result.stdout.strip(),
                'passed': False,
                'executionTime': execution_time
            }
            
        except subprocess.TimeoutExpired:
            return {
                'testCase': test_num,
                'input': test_case['input'],
                'expected': test_case['expected'],
                'actual': None,
                'passed': False,
                'error': 'Time Limit Exceeded',
                'executionTime': lang_config['timeout'] * 1000
            }
        except Exception as e:
            return {
                'testCase': test_num,
                'input': test_case['input'],
                'expected': test_case['expected'],
                'actual': None,
                'passed': False,
                'error': str(e),
                'executionTime': 0
            }
