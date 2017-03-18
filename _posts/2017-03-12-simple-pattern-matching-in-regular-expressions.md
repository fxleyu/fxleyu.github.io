---
layout   : post
title    : "正则表达式中的简单模式匹配"
date     : 2017-03-12 23:24:00
author   : fxleyu
tags:
    - RegEx
    - Java
---
## 摘要
本文将整理正则表达式的基础内容，其中字符、字符类、


# 基础
## 基本字符

字符 | 匹配
--------------|---------
x      | 字符 x
\\\\   | 反斜线字符
\\0n   | 带有八进制值 0 的字符 n (0 <= n <= 7)
\\0nn  | 带有八进制值 0 的字符 nn (0 <= n <= 7)
\\0mnn | 带有八进制值 0 的字符 mnn（0 <= m <= 3、0 <= n <= 7）
\xhh   | 带有十六进制值 0x 的字符 hh
\uhhhh | 带有十六进制值 0x 的字符 hhhh
\t     | 制表符 ('\u0009')
\n     | 新行（换行）符 ('\u000A')
\r     | 回车符 ('\u000D')
\f     | 换页符 ('\u000C')
\a     | 报警 (bell) 符 ('\u0007')
\e     | 转义符 ('\u001B')
\cx    | 对应于 x 的控制符

## Logical 运算符

运算符 | 描述
------|-----
XY    | X 后跟 Y
X\|Y	| X 或 Y
(X)	  | X，作为捕获组

## 特殊构造（非捕获）

特殊结构 | 描述
--------|-----
(?:X)              | X，作为非捕获组
(?idmsux-idmsux)   | Nothing，但是将匹配标志i d m s u x on - off
(?idmsux-idmsux:X) | X，作为带有给定标志 i d m s u x on - off
(?=X)              | X，通过零宽度的正 lookahead (正前瞻)
(?!X)              | X，通过零宽度的负 lookahead (反前瞻)
(?<=X)             | X，通过零宽度的正 lookbehind (正后顾)
(?<!X)             | X，通过零宽度的负 lookbehind (反后顾)
(?>X)              | X，作为独立的非捕获组


# 字符类（character class）
**字符类**（character class）（有时也称为**字符类**），有时也称为字符集（character class）,定义了一组字符，其中任意字符都可能出现在匹配成功的字符串中。[character_class]

## 0、普通字符类

字符类 | 描述
--------------|---------
[abc]         | a、b 或 c（简单类）
[^abc]        | 任何字符，除了 a、b 或 c（否定）
[a-zA-Z]      | a 到 z 或 A 到 Z，两头的字母包括在内（范围）
[a-d[m-p]]    | a 到 d 或 m 到 p：[a-dm-p]（并集）
[a-z&&[def]]  | d、e 或 f（交集）
[a-z&&[^bc]]  | a 到 z，除了 b 和 c：[ad-z]（减去）
[a-z&&[^m-p]] | a 到 z，而非 m 到 p：[a-lq-z]（减去）

## 1、预定义字符类

预定义字符类  | 描述
--------------|---------
.  | 任何字符（与行结束符可能匹配也可能不匹配）
\d | 数字：[0-9]
\D | 非数字： [^0-9]
\s | 空白字符：[ \t\n\x0B\f\r]
\S | 非空白字符：[^\s]
\w | 单词字符：[a-zA-Z_0-9]
\W | 非单词字符：[^\w]

## 2、POSIX 字符类
POSIX（可移植操作系统接口，Portable Operating System Interface of UNIX，缩写为 POSIX）字符类是用于US-ASCII。

POSIX 字符类 | 描述
--------------|---------
\p{Lower}  | 小写字母字符：[a-z]
\p{Upper}  | 大写字母字符：[A-Z]
\p{ASCII}  | 所有 ASCII：[\x00-\x7F]
\p{Alpha}  | 字母字符：[\p{Lower}\p{Upper}]
\p{Digit}  | 十进制数字：[0-9]
\p{Alnum}  | 字母数字字符：[\p{Alpha}\p{Digit}]
\p{Punct}  | 标点符号：!"#$%&'()\*+,-./:;<=>?@[\\]^\_\`{\|}~
\p{Graph}  | 可见字符：[\p{Alnum}\p{Punct}]
\p{Print}  | 可打印字符：[\p{Graph}\x20]
\p{Blank}  | 空格或制表符：[ \t]
\p{Cntrl}  | 控制字符：[\x00-\x1F\x7F]
\p{XDigit} | 十六进制数字：[0-9a-fA-F]
\p{Space}  | 空白字符：[ \t\n\x0B\f\r]


[character_class]:https://msdn.microsoft.com/en-us/library/20bw873z(v=vs.110).aspx
