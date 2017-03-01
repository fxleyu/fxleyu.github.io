---
layout   : post
title    : "【LeetCode】 #4 Median of Two Sorted Arrays"
date     : 2017-02-28 00:07:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---

# Description
There are two sorted arrays **nums1** and **nums2** of size m and n respectively.

Find the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).

# Examples1:
```
nums1 = [1, 3]
nums2 = [2]

The median is 2.0
```
# Examples2:
```
nums1 = [1, 2]
nums2 = [3, 4]

The median is (2 + 3)/2 = 2.5
```

## Python
- 下面是我提交的AC代码，运行时间是`95ms`

```python
import sys

class Solution(object):
    def findMedianSortedArrays(self, nums1, nums2):
        """
        :type nums1: List[int]
        :type nums2: List[int]
        :rtype: float
        """
        length = len(nums1) + len(nums2)
        mid = length / 2
        if length % 2 == 1:
            mid += 1

        index1 = index2 = 0
        result = 0
        for i in xrange(mid) :
            a = self.getIndex(nums1, index1)
            b = self.getIndex(nums2, index2)
            if a < b:
                index1 += 1
                result = a
            else:
                index2 += 1
                result = b

        if length % 2 == 1:
            return result

        a = self.getIndex(nums1, index1)
        b = self.getIndex(nums2, index2)
        if a < b:
            result += a
        else:
            result += b
        return result / 2.0

    def getIndex(self, nums, index):
        if len(nums) > index :
            return nums[index]
        else :
            return sys.maxint
```
- 在评论区找到的优秀代码，运行时间是`126ms`

```python
class Solution:
    # @return a float
    def findMedianSortedArrays(self, A, B):
        l=len(A)+len(B)
        return self.findKth(A,B,l//2) if l%2==1 else (self.findKth(A,B,l//2-1)+self.findKth(A,B,l//2))/2.0


    def findKth(self,A,B,k):
        if len(A)>len(B):
            A,B=B,A
        if not A:
            return B[k]
        if k==len(A)+len(B)-1:
            return max(A[-1],B[-1])
        i=len(A)//2
        j=k-i
        if A[i]>B[j]:
            #Here I assume it is O(1) to get A[:i] and B[j:]. In python, it's not but in cpp it is.
            return self.findKth(A[:i],B[j:],i)
        else:
            return self.findKth(A[i:],B[:j],j)
```
