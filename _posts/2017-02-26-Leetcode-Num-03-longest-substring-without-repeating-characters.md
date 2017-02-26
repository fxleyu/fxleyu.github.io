---
layout   : post
title    : "【LeetCode】 #3 Longest Substring Without Repeating Characters"
date     : 2017-02-26 22:37:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---

# Description
Given a string, find the length of the longest substring without repeating characters.

# Examples:

Given `"abcabcbb"`, the answer is `"abc"`, which the length is 3.

Given `"bbbbb"`, the answer is `"b"`, with the length of 1.

Given `"pwwkew"`, the answer is `"wke"`, with the length of 3. Note that the answer must be a substring, `"pwke"` is a subsequence and not a substring.

## Python
- 下面是我提交的AC代码，运行时间是`765ms`
```Python
class Solution(object):
    def lengthOfLongestSubstring(self, s):
        """
        :type s: str
        :rtype: int
        """
        max = 0
        start = 0
        for i in range(1, len(s)):
            index = self.indexOfRepeatChar(s, start, i)
            if index != -1:
                thisMax = i - start
                start = index + 1
                if thisMax > max:
                    max = thisMax
        thisMax = len(s) - start
        if thisMax > max:
            max = thisMax
        return max

    def indexOfRepeatChar(self, s, start, end):
        for i in reversed(range(start, end)):
            if s[i] == s[end]:
                return i
        else:
            return -1
```
- 在评论区找到的优秀代码，运行时间是`82ms`
```Python
class Solution:
    # @return an integer
    def lengthOfLongestSubstring(self, s):
        start = maxLength = 0
        usedChar = {}

        for i in range(len(s)):
            if s[i] in usedChar and start <= usedChar[s[i]]:
                start = usedChar[s[i]] + 1
            else:
                maxLength = max(maxLength, i - start + 1)

            usedChar[s[i]] = i

        return maxLength
```
