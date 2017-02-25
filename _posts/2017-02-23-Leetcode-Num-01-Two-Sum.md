---
layout   : post
title    : "【LeetCode】 #1 Two Sum "
date     : 2017-02-23 23:10:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---

# Description
Given an array of integers, return indices of the two numbers such that they add up to a specific target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example:**
```
Given nums = [2, 7, 11, 15], target = 9,

Because nums[0] + nums[1] = 2 + 7 = 9,
return [0, 1].
```

## Python
```Python
class Solution(object):
    def twoSum(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: List[int]
        """
        map = {}
        for index,item in enumerate(nums):
            other = target - item
            if map.has_key(other):
                return [map[other], index]
            else:
                map[item] = index
        return []
```
