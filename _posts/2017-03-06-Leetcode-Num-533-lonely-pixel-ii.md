---
layout   : post
title    : "【LeetCode】 #533 Lonely Pixel II"
date     : 2017-03-06 22:22:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---
# Description
Given a picture consisting of black and white pixels, and a positive integer N, find the number of black pixels located at some specific row **R** and column **C** that align with all the following rules:

- Row R and column C both contain exactly N black pixels.
- For all rows that have a black pixel at column C, they should be exactly the same as row R
The picture is represented by a 2D char array consisting of 'B' and 'W', which means black and white pixels respectively.

# Example:
```
Input:                                            
[['W', 'B', 'W', 'B', 'B', 'W'],    
 ['W', 'B', 'W', 'B', 'B', 'W'],    
 ['W', 'B', 'W', 'B', 'B', 'W'],    
 ['W', 'W', 'B', 'W', 'B', 'W']]

N = 3
Output: 6
Explanation: All the bold 'B' are the black pixels we need (all 'B's at column 1 and 3).
        0    1    2    3    4    5         column index                                            
0    [['W', 'B', 'W', 'B', 'B', 'W'],    
1     ['W', 'B', 'W', 'B', 'B', 'W'],    
2     ['W', 'B', 'W', 'B', 'B', 'W'],    
3     ['W', 'W', 'B', 'W', 'B', 'W']]    
row index

Take 'B' at row R = 0 and column C = 1 as an example:
Rule 1, row R = 0 and column C = 1 both have exactly N = 3 black pixels.
Rule 2, the rows have black pixel at column C = 1 are row 0, row 1 and row 2. They are exactly the same as row R = 0.
```

## Python
- 下面是我提交的AC代码，运行时间是`302ms`
```python
class Solution(object):
    def findBlackPixel(self, picture, N):
        """
        :type picture: List[List[str]]
        :type N: int
        :rtype: int
        """
        row_map = {}
        for row in picture:
            if row.count("B") == N:
                row_tuple = tuple(row)
                if row_map.has_key(row_tuple):
                    row_map[row_tuple] += 1
                else:
                    row_map[row_tuple] = 1

        cols = []
        for c in zip(*picture):
            cols.append(1 if c.count("B") == N else 0)

        result = 0
        for row in row_map.keys():
            if row_map.get(row) == N:
                for i in xrange(len(row)):
                    if row[i] == "B" and cols[i] == 1:
                        result += N
        return result
```

- 在评论区找到的其他代码，运行时间是`168ms`
```python
class Solution(object):
  def findBlackPixel1(self, picture, N):
      ctr = collections.Counter(map(tuple, picture))
      cols = [col.count('B') for col in zip(*picture)]
      return sum(N * zip(row, cols).count(('B', N)) for row, count in ctr.items() if count == N == row.count('B'))
```
