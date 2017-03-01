---
layout   : post
title    : "【LeetCode】 #2 Add Two Numbers "
date     : 2017-02-25 23:15:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---

# Description
You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in reverse order and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

**Example:**
```
Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
Output: 7 -> 0 -> 8
```

## Python
- 下面是我提交的AC代码，运行时间是`199ms`
```python
class Solution(object):
    def addTwoNumbers(self, l1, l2):
        """
        :type l1: ListNode
        :type l2: ListNode
        :rtype: ListNode
        """
        carryNum = 0
        work1 = l1
        work2 = l2
        preResult = ListNode(0)
        temp =  preResult
        while work1 != None or work2 != None:
            if work1 != None :
                carryNum += work1.val
                work1 = work1.next
            if work2 != None :
                carryNum += work2.val
                work2 = work2.next
            temp.next = ListNode(carryNum % 10)
            temp = temp.next
            if carryNum > 9 :
                carryNum = 1
            else :
                carryNum = 0

        if carryNum > 0 :
            temp.next = ListNode(1)

        return preResult.next
```
- 在评论区找到的优秀代码，运行时间是`138ms`
```python
class Solution(object):
    def addTwoNumbers(self, l1, l2):
        """
        :type l1: ListNode
        :type l2: ListNode
        :rtype: ListNode
        """
        ret = ListNode(0)
        cur = ret
        add = 0

        while l1 or l2 or add:
            val = (l1.val if l1 else 0) + (l2.val if l2 else 0) + add
            add = val / 10
            cur.next = ListNode(val % 10)
            cur = cur.next
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None

        return ret.next
```
