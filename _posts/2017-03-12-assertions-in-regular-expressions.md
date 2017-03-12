---
layout   : post
title    : "正则表达式中的断言"
date     : 2017-03-12 14:40:00
author   : fxleyu
tags:
    - RegEx
    - Java
---
# 介绍
**断言**（**Assertion**），也被称为**零宽度断言**（**zero-width assertions**），本身不匹配字符，而是匹配字符串中的位置。

**断言**又包含**锚位符**（**Anchor**）、**环视**（**Lookarounds**）。
- **锚位符**，也被称为**边界**（**Boundary**），
- **环视**，是一种非捕获分组，它根据某个模式之前或之后的内容匹配其他模式。

# 边界

Anchor | Description
---|-----
^	 | 行的开头
$	 | 行的结尾
\b | 单词边界
\B | 非单词边界
\A | 输入的开头
\G | 上一个匹配的结尾
\Z | 输入的结尾，仅用于最后的结束符（如果有的话）
\z | 输入的结尾


# 环视
> **环视**（lookaround）是一种非捕获分组，它根据某个模式之前或之后的内容匹配其他模式。环视也被称为**零宽度断言**（zero-length assertions）。

环视包含如下四种：
- 正前瞻（positive lookahead）
- 反前瞻（negative lookahead）
- 正后顾（positive lookbehind）
- 反后顾（negative lookbehind）

## 正前瞻

## 反前瞻

## 正后顾

## 反后顾

## 应用
密码强度匹配

# 总结
