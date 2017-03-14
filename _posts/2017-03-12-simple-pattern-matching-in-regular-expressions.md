---
layout   : post
title    : "正则表达式中的简单模式匹配"
date     : 2017-03-12 23:24:00
author   : fxleyu
tags:
    - RegEx
    - Java
---

# 字符组（character class）

character class | Description
--------------|---------
[abc]         | a, b, or c (simple class)
[^abc]        | Any character except a, b, or c (negation)
[a-zA-Z]      | a through z or A through Z, inclusive (range)
[a-d[m-p]]   | a through d, or m through p: [a-dm-p] (union)
[a-z&&[def]]  | d, e, or f (intersection)
[a-z&&[^bc]]  | a through z, except for b and c: [ad-z] (subtraction)
[a-z&&[^m-p]] | a through z, and not m through p: [a-lq-z](subtraction)
