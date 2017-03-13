---
layout   : post
title    : "正则表达式中的量词"
date     : 2017-03-09 23:18:00
author   : fxleyu
tags:
    - RegEx
    - Java
---
> TODO: 三月份把这篇文档补全

# 基本量词

# 贪婪量词

Greedy 数量词

贪婪量词 | Description
-------|---------
X?     | X，一次或一次也没有
X*     | X，零次或多次
X+     | X，一次或多次
X{n}   | X，恰好 n 次
X{n,}  | X，至少 n 次
X{n,m} | X，至少 n 次，但是不超过 m 次

# 懒惰量词

懒惰量词 | Description
--------|----------
X??     | X，一次或一次也没有
X*?     | X，零次或多次
X+?     | X，一次或多次
X{n}?   | X，恰好 n 次
X{n,}?  | X，至少 n 次
X{n,m}? | X，至少 n 次，但是不超过 m 次


# 独占量词

独占量词 | Description
--------|----------
X?+     | X，一次或一次也没有
X*+     | X，零次或多次
X++     | X，一次或多次
X{n}+   | X，恰好 n 次
X{n,}+  | X，至少 n 次
X{n,m}+ | X，至少 n 次，但是不超过 m 次

# 应用  
