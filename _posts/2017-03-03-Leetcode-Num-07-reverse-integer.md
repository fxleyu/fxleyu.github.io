---
layout   : post
title    : "【LeetCode】 #6 Reverse Integer"
date     : 2017-03-03 23:30:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---
# Description
Reverse digits of an integer.

**Example1**: x = 123, return 321

**Example2**: x = -123, return -321

## Python
- 下面是我提交的AC代码，运行时间是`62ms`
```python
class Solution(object):
    def reverse(self, x):
        """
        :type x: int
        :rtype: int
        """
        ls = list(str(x))
        ch = ls.pop(0)
        if ch == "+" or ch == "-" :
            ls.append(ch)
        else:
            ls.insert(0, ch)
        ls.reverse()
        result = int("".join(ls))
        if result > 2147483647 or result < -2147483648:
            result = 0
        return result
```

- 在评论区找到的其他代码，运行时间是`82ms`
```python
class Solution(object):
    def reverse(self, x):
        s = cmp(x, 0)
        r = int(`s*x`[::-1])
        return s*r * (r < 2**31)
```
