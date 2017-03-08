---
layout   : post
title    : "【LeetCode】 #09 Palindrome Number"
date     : 2017-03-08 23:24:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---
# Description
Determine whether an integer is a palindrome. Do this without extra space.

# Some hints:
Could negative integers be palindromes? (ie, -1)

If you are thinking of converting the integer to string, note the restriction of using extra space.

You could also try reversing an integer. However, if you have solved the problem "Reverse Integer", you know that the reversed integer might overflow. How would you handle such case?

There is a more generic way of solving this problem.

## Python
- 下面是我提交的AC代码，运行时间是`379ms`

```python
class Solution(object):
    def isPalindrome(self, x):
        """
        :type x: int
        :rtype: bool
        """
        string = str(x)
        half = len(string)/2
        for i in xrange(half):
            if string[i] != string[-1-i]:
                return False
        return True
```
