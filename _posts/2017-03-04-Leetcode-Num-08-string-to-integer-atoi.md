---
layout   : post
title    : "【LeetCode】 #8 String to Integer (atoi)"
date     : 2017-03-04 23:22:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---
# Description
Implement atoi to convert a string to an integer.

**Hint**: Carefully consider all possible input cases. If you want a challenge, please do not see below and ask yourself what are the possible input cases.

**Notes**: It is intended for this problem to be specified vaguely (ie, no given input specs). You are responsible to gather all the input requirements up front.

Update (2015-02-10):
The signature of the C++ function had been updated. If you still see your function signature accepts a const char * argument, please click the reload button  to reset your code definition.

**Requirements for atoi**:
The function first discards as many whitespace characters as necessary until the first non-whitespace character is found. Then, starting from this character, takes an optional initial plus or minus sign followed by as many numerical digits as possible, and interprets them as a numerical value.

The string can contain additional characters after those that form the integral number, which are ignored and have no effect on the behavior of this function.

If the first sequence of non-whitespace characters in str is not a valid integral number, or if no such sequence exists because either str is empty or it contains only whitespace characters, no conversion is performed.

If no valid conversion could be performed, a zero value is returned. If the correct value is out of the range of representable values, INT_MAX (2147483647) or INT_MIN (-2147483648) is returned.

## Python
- 下面是我提交的AC代码，运行时间是`79ms`
```python
class Solution(object):
    def myAtoi(self, str):
        """
        :type str: str
        :rtype: int
        """
        toValue = {"0":0, "1":1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9}

        start = 0
        for i in xrange(len(str)):
            if  str[i] == "+" or str[i] == "-":
                start = i + 1
                break
            elif toValue.has_key(str[i]):
                start = i
                break
            elif str[i] != " ":
                return 0

        value = 0
        for i in xrange(start, len(str)):
            if toValue.has_key(str[i]):
                value = value * 10 + toValue.get(str[i])
            else:
                break

        if start != 0 and str[start-1] == "-":
            value *= -1;
        if value > 2147483647:
            value = 2147483647
        elif value < -2147483648:
            value = -2147483648
        return value
```

- 在评论区找到的其他代码，运行时间是`65ms`
```python
class Solution(object):
    def myAtoi(self, s):
        """
        :type str: str
        :rtype: int
        """
        ###better to do strip before sanity check (although 8ms slower):
        #ls = list(s.strip())
        #if len(ls) == 0 : return 0
        if len(s) == 0 : return 0
        ls = list(s.strip())

        sign = -1 if ls[0] == '-' else 1
        if ls[0] in ['-','+'] : del ls[0]
        ret, i = 0, 0
        while i < len(ls) and ls[i].isdigit() :
            ret = ret*10 + ord(ls[i]) - ord('0')
            i += 1
        return max(-2**31, min(sign * ret,2**31-1))
```
