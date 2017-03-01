---
layout   : post
title    : "【LeetCode】 #5 Longest Palindromic Substring"
date     : 2017-03-01 00:07:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---

# Description
Given a string **s**, find the longest palindromic substring in **s**. You may assume that the maximum length of **s** is 1000.

# Example:
```
Input: "babad"

Output: "bab"

Note: "aba" is also a valid answer.
```
# Example:
```
Input: "cbbd"

Output: "bb"
```
## Python
- 下面是我提交的AC代码，运行时间是`519ms`
```Python
class Solution(object):
    def longestPalindrome(self, s):
        """
        :type s: str
        :rtype: str
        """
        max = 0
        index = 0

        for i in xrange(0, len(s)):
            len1 = self.length_of_prlindrome(s, i, i)
            len2 = self.length_of_prlindrome(s, i, i + 1)
            if len1 > max:
                max = len1
                index = i - len1 / 2
            if len2 > max:
                max = len2
                index = i - len2 / 2 + 1
        return s[index : index + max]

    def length_of_prlindrome(me, s, left, right):
        result = 1
        for i in xrange(0, left+1):
            if right + i >= len(s) or s[left - i] != s[right + i]:
                # right + i -1 - (left - i + 1) + 1 == right - left + 2*i -1
                result = right - left + 2*i -1
                break
        else:
            result = right + left + 1
        return result
```
- 在评论区找到的其他代码，运行时间是`515ms`
```python
class Solution:
    # @return a string
    def longestPalindrome(self, s):
        if len(s)==0:
        	return 0
        maxLen=1
        start=0
        for i in xrange(len(s)):
        	if i-maxLen >=1 and s[i-maxLen-1:i+1]==s[i-maxLen-1:i+1][::-1]:
        		start=i-maxLen-1
        		maxLen+=2
        		continue

        	if i-maxLen >=0 and s[i-maxLen:i+1]==s[i-maxLen:i+1][::-1]:
        		start=i-maxLen
        		maxLen+=1
        return s[start:start+maxLen]
```
