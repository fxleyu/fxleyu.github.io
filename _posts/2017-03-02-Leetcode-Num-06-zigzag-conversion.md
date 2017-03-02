---
layout   : post
title    : "【LeetCode】 #6 ZigZag Conversion"
date     : 2017-03-02 23:30:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---
# Description
The string `"PAYPALISHIRING"` is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility)
```
P   A   H   N
A P L S I I G
Y   I   R
```
And then read line by line: `"PAHNAPLSIIGYIR"`
Write the code that will take a string and make this conversion given a number of rows:
```
string convert(string text, int nRows);
```
`convert("PAYPALISHIRING", 3)` should return `"PAHNAPLSIIGYIR"`.
## Python
- 下面是我提交的AC代码，运行时间是`195ms`
```python
class Solution(object):
    def convert(self, s, numRows):
        """
        :type s: str
        :type numRows: int
        :rtype: str
        """
        if numRows == 1:
            return s

        result = []
        indexs = []
        for i in xrange(0, len(s), 2*numRows - 2):
            result.append(s[i])
            indexs.append(i)

        for i in xrange(1, numRows):
            for top in indexs:
                one = top + i
                two = top + i + 2 * (numRows - 1 - i)
                self.insert(result, s, one)
                if one != two:
                    self.insert(result, s, two)
        return "".join(result)

    def insert(self, result, s, index):
        if index < len(s):
            result.append(s[index])
```
- 在评论区找到的其他代码，运行时间是`116ms`
```python
class Solution(object):
    def convert(self, s, numRows):
        """
        :type s: str
        :type numRows: int
        :rtype: str
        """
        if numRows == 1 or numRows >= len(s):
            return s

        L = [''] * numRows
        index, step = 0, 1

        for x in s:
            L[index] += x
            if index == 0:
                step = 1
            elif index == numRows -1:
                step = -1
            index += step

        return ''.join(L)
```
