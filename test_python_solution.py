#!/usr/bin/env python3

def solution(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

# Test cases from our database
test_cases = [
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
    }
]

print("🧪 Testing Python Two Sum solution:")
print("=" * 50)

for i, test_case in enumerate(test_cases):
    nums, target = test_case["input"]
    expected = test_case["expected"]
    actual = solution(nums, target)
    
    passed = actual == expected
    status = "✅ PASS" if passed else "❌ FAIL"
    
    print(f"Test {i+1}: {status}")
    print(f"  Input: nums={nums}, target={target}")
    print(f"  Expected: {expected}")
    print(f"  Actual:   {actual}")
    print(f"  Description: {test_case['description']}")
    print()

print("If all tests pass above, the issue is in the execution framework, not your code!")
