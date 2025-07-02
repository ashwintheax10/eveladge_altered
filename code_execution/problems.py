from typing import Dict, List, Any

class ProblemsDatabase:
    def __init__(self):
        self.problems = {
            "two_sum": {
                "id": "two_sum",
                "title": "Two Sum",
                "difficulty": "Easy",
                "description": """Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example:**
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

**Constraints:**
- 2 ≤ nums.length ≤ 10⁴
- -10⁹ ≤ nums[i] ≤ 10⁹
- -10⁹ ≤ target ≤ 10⁹
- Only one valid answer exists.""",
                "starter_code": {
                    "javascript": """function solution(nums, target) {
    // Write your code here
    // Return an array of two indices
}""",
                    "python": """def solution(nums, target):
    # Write your code here
    # Return a list of two indices
    pass""",
                    "java": """public static int[] solution(int[] nums, int target) {
    // Write your code here
    // Return an array of two indices
    return new int[]{};
}""",
                    "cpp": """vector<int> solution(vector<int>& nums, int target) {
    // Write your code here
    // Return a vector of two indices
    return {};
}"""
                },
                "test_cases": [
                    {
                        "input": [[2, 7, 11, 15], 9],
                        "expected": [0, 1],
                        "description": "Basic case: target found at beginning"
                    },
                    {
                        "input": [[3, 2, 4], 6],
                        "expected": [1, 2],
                        "description": "Target found at end"
                    },
                    {
                        "input": [[3, 3], 6],
                        "expected": [0, 1],
                        "description": "Duplicate numbers"
                    },
                    {
                        "input": [[1, 2, 3, 4, 5], 8],
                        "expected": [2, 4],
                        "description": "Numbers in middle"
                    },
                    {
                        "input": [[-1, -2, -3, -4, -5], -8],
                        "expected": [2, 4],
                        "description": "Negative numbers"
                    }
                ]
            },
            "binary_search": {
                "id": "binary_search",
                "title": "Binary Search",
                "difficulty": "Easy",
                "description": """Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.

**Example:**
```
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4
```

**Constraints:**
- 1 ≤ nums.length ≤ 10⁴
- -10⁴ < nums[i], target < 10⁴
- All the integers in nums are unique.
- nums is sorted in ascending order.""",
                "starter_code": {
                    "javascript": """function solution(nums, target) {
    // Write your binary search implementation here
    // Return the index of target, or -1 if not found
}""",
                    "python": """def solution(nums, target):
    # Write your binary search implementation here
    # Return the index of target, or -1 if not found
    pass""",
                    "java": """public static int solution(int[] nums, int target) {
    // Write your binary search implementation here
    // Return the index of target, or -1 if not found
    return -1;
}""",
                    "cpp": """int solution(vector<int>& nums, int target) {
    // Write your binary search implementation here
    // Return the index of target, or -1 if not found
    return -1;
}"""
                },
                "test_cases": [
                    {
                        "input": [[-1, 0, 3, 5, 9, 12], 9],
                        "expected": 4,
                        "description": "Target found in array"
                    },
                    {
                        "input": [[-1, 0, 3, 5, 9, 12], 2],
                        "expected": -1,
                        "description": "Target not in array"
                    },
                    {
                        "input": [[5], 5],
                        "expected": 0,
                        "description": "Single element array - found"
                    },
                    {
                        "input": [[5], -5],
                        "expected": -1,
                        "description": "Single element array - not found"
                    },
                    {
                        "input": [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1],
                        "expected": 0,
                        "description": "Target at beginning"
                    },
                    {
                        "input": [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10],
                        "expected": 9,
                        "description": "Target at end"
                    }
                ]
            },
            "palindrome": {
                "id": "palindrome",
                "title": "Valid Palindrome",
                "difficulty": "Easy",
                "description": """A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.

**Example:**
```
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
```

**Constraints:**
- 1 ≤ s.length ≤ 2 * 10⁵
- s consists only of printable ASCII characters.""",
                "starter_code": {
                    "javascript": """function solution(s) {
    // Write your code here
    // Return true if s is a palindrome, false otherwise
}""",
                    "python": """def solution(s):
    # Write your code here
    # Return True if s is a palindrome, False otherwise
    pass""",
                    "java": """public static boolean solution(String s) {
    // Write your code here
    // Return true if s is a palindrome, false otherwise
    return false;
}""",
                    "cpp": """bool solution(string s) {
    // Write your code here
    // Return true if s is a palindrome, false otherwise
    return false;
}"""
                },
                "test_cases": [
                    {
                        "input": ["A man, a plan, a canal: Panama"],
                        "expected": True,
                        "description": "Classic palindrome with spaces and punctuation"
                    },
                    {
                        "input": ["race a car"],
                        "expected": False,
                        "description": "Not a palindrome"
                    },
                    {
                        "input": [" "],
                        "expected": True,
                        "description": "Single space (empty after cleaning)"
                    },
                    {
                        "input": ["Madam"],
                        "expected": True,
                        "description": "Simple palindrome with capitals"
                    },
                    {
                        "input": ["No 'x' in Nixon"],
                        "expected": True,
                        "description": "Complex palindrome with quotes"
                    }
                ]
            },
            "fibonacci": {
                "id": "fibonacci",
                "title": "Fibonacci Number",
                "difficulty": "Easy",
                "description": """The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is,

F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1.

Given n, calculate F(n).

**Example:**
```
Input: n = 2
Output: 1
Explanation: F(2) = F(1) + F(0) = 1 + 0 = 1.
```

**Constraints:**
- 0 ≤ n ≤ 30""",
                "starter_code": {
                    "javascript": """function solution(n) {
    // Write your code here
    // Return the nth Fibonacci number
}""",
                    "python": """def solution(n):
    # Write your code here
    # Return the nth Fibonacci number
    pass""",
                    "java": """public static int solution(int n) {
    // Write your code here
    // Return the nth Fibonacci number
    return 0;
}""",
                    "cpp": """int solution(int n) {
    // Write your code here
    // Return the nth Fibonacci number
    return 0;
}"""
                },
                "test_cases": [
                    {
                        "input": [0],
                        "expected": 0,
                        "description": "Base case: F(0) = 0"
                    },
                    {
                        "input": [1],
                        "expected": 1,
                        "description": "Base case: F(1) = 1"
                    },
                    {
                        "input": [2],
                        "expected": 1,
                        "description": "F(2) = F(1) + F(0) = 1"
                    },
                    {
                        "input": [3],
                        "expected": 2,
                        "description": "F(3) = F(2) + F(1) = 2"
                    },
                    {
                        "input": [4],
                        "expected": 3,
                        "description": "F(4) = F(3) + F(2) = 3"
                    },
                    {
                        "input": [10],
                        "expected": 55,
                        "description": "Larger test case"
                    }
                ]
            },
            "reverse_string": {
                "id": "reverse_string",
                "title": "Reverse String",
                "difficulty": "Easy",
                "description": """Write a function that reverses a string. The input string is given as an array of characters `s`.

You must do this by modifying the input array in-place with O(1) extra memory.

**Example:**
```
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
```

**Constraints:**
- 1 ≤ s.length ≤ 10⁵
- s[i] is a printable ascii character.""",
                "starter_code": {
                    "javascript": """function solution(s) {
    // Write your code here
    // Modify the array in-place and return it
}""",
                    "python": """def solution(s):
    # Write your code here
    # Modify the list in-place and return it
    pass""",
                    "java": """public static char[] solution(char[] s) {
    // Write your code here
    // Modify the array in-place and return it
    return s;
}""",
                    "cpp": """vector<char> solution(vector<char>& s) {
    // Write your code here
    // Modify the vector in-place and return it
    return s;
}"""
                },
                "test_cases": [
                    {
                        "input": [["h", "e", "l", "l", "o"]],
                        "expected": ["o", "l", "l", "e", "h"],
                        "description": "Basic string reversal"
                    },
                    {
                        "input": [["H", "a", "n", "n", "a", "h"]],
                        "expected": ["h", "a", "n", "n", "a", "H"],
                        "description": "Palindrome with capitals"
                    },
                    {
                        "input": [["A"]],
                        "expected": ["A"],
                        "description": "Single character"
                    },
                    {
                        "input": [["a", "b"]],
                        "expected": ["b", "a"],
                        "description": "Two characters"
                    }
                ]
            }
        }
    
    def get_problem(self, problem_id: str) -> Dict[str, Any]:
        """Get a specific problem by ID"""
        return self.problems.get(problem_id)
    
    def get_all_problems(self) -> List[Dict[str, Any]]:
        """Get all problems"""
        return list(self.problems.values())
    
    def get_problems_by_difficulty(self, difficulty: str) -> List[Dict[str, Any]]:
        """Get problems filtered by difficulty"""
        return [p for p in self.problems.values() if p['difficulty'] == difficulty]
    
    def get_test_cases(self, problem_id: str) -> List[Dict[str, Any]]:
        """Get test cases for a specific problem"""
        problem = self.get_problem(problem_id)
        return problem['test_cases'] if problem else []
    
    def get_starter_code(self, problem_id: str, language: str) -> str:
        """Get starter code for a specific problem and language"""
        problem = self.get_problem(problem_id)
        if problem and 'starter_code' in problem:
            return problem['starter_code'].get(language, '')
        return ''
