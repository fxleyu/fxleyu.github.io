---
layout   : post
title    : "【LeetCode】 #531 Lonely Pixel I"
date     : 2017-03-05 22:29:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---
# Description
Given a picture consisting of black and white pixels, find the number of black lonely pixels.

The picture is represented by a 2D char array consisting of 'B' and 'W', which means black and white pixels respectively.

A black lonely pixel is character 'B' that located at a specific position where the same row and same column don't have any other black pixels.

# Example:
```
Input:
[['W', 'W', 'B'],
 ['W', 'B', 'W'],
 ['B', 'W', 'W']]

Output: 3
Explanation: All the three 'B's are black lonely pixels.
```

## Python
- 下面是我提交的AC代码，运行时间是`1458ms`
```python
class Solution(object):
    def findLonelyPixel(self, picture):
        """
        :type picture: List[List[str]]
        :rtype: int
        """
        row = self.find_row(picture)
        column =self.find_colum(picture)

        result = 0
        for x in row:
            for y in column:
                if picture[x][y] == "B":
                    result += 1
        return result

    def find_row(self, picture):
        result = []
        for x in xrange(len(picture)):
            num = 0
            for y in xrange(len(picture[x])):
                if picture[x][y] == "B":
                    num += 1
            if num == 1:
                result.append(x)
        return result

    def find_colum(self, picture):
        result = []
        for y in xrange(len(picture[0])):
            num = 0
            for x in xrange(len(picture)):
                if picture[x][y] == "B":
                    num += 1
            if num == 1:
                result.append(y)
        return result
```

- 在评论区找到的其他代码，运行时间是`708ms`
```python
class Solution(object):
    def findLonelyPixel(self, picture):
        return sum(col.count('B') == 1 == picture[col.index('B')].count('B') for col in zip(*picture))
```
对于这行代码，膜拜ing

不愧有这句话：
> 人生苦短，我用Python
