---
layout   : post
title    : "正则表达式中的简单模式匹配"
date     : 2017-03-12 23:24:00
author   : fxleyu
tags:
    - RegEx
    - Java
---
# 字符匹配

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

# 字符组（character class）
字符组（character class），有时也称为字符集（character class）,定义了一组字符，其中任意字符都可能出现在匹配成功的字符串中。[character_class]

character class | Description
--------------|---------
[abc]         | a, b, or c (simple class)
[^abc]        | Any character except a, b, or c (negation)
[a-zA-Z]      | a through z or A through Z, inclusive (range)
[a-d[m-p]]   | a through d, or m through p: [a-dm-p] (union)
[a-z&&[def]]  | d, e, or f (intersection)
[a-z&&[^bc]]  | a through z, except for b and c: [ad-z] (subtraction)
[a-z&&[^m-p]] | a through z, and not m through p: [a-lq-z] (subtraction)


Predefined character classes  | Description
--------------|---------
.  | Any character (may or may not match line terminators)
\d | A digit: [0-9]
\D | A non-digit: [^0-9]
\s | A whitespace character: [ \t\n\x0B\f\r]
\S | A non-whitespace character: [^\s]
\w | A word character: [a-zA-Z_0-9]
\W | A non-word character: [^\w]

## POSIX character classes (US-ASCII only)

POSIX character classes (US-ASCII only) | Description
--------------|---------
\p{Lower}  | A lower-case alphabetic character: [a-z]
\p{Upper}  | An upper-case alphabetic character:[A-Z]
\p{ASCII}  | All ASCII:[\x00-\x7F]
\p{Alpha}  | An alphabetic character:[\p{Lower}\p{Upper}]
\p{Digit}  | A decimal digit: [0-9]
\p{Alnum}  | An alphanumeric character: [\p{Alpha}\p{Digit}]
\p{Punct}  | 	Punctuation: One of !"#$%&'()\*+,-./:;<=>?@\[\\\]^\_\`\{\|\}\~
\p{Graph}  | A visible character: [\p{Alnum}\p{Punct}]
\p{Print}  | A printable character: [\p{Graph}\x20]
\p{Blank}  | A space or a tab: [ \t]
\p{Cntrl}  | A control character: [\x00-\x1F\x7F]
\p{XDigit} | A hexadecimal digit: [0-9a-fA-F]
\p{Space} | A whitespace character: [ \t\n\x0B\f\r]

## java.lang.Character

java.lang.Character classes (simple java character type)  | Description
--------|------
\p{javaLowerCase}  | Equivalent to java.lang.Character.isLowerCase()
\p{javaUpperCase}  | Equivalent to java.lang.Character.isUpperCase()
\p{javaWhitespace} | Equivalent to java.lang.Character.isWhitespace()
\p{javaMirrored}   | Equivalent to java.lang.Character.isMirrored()


[character_class]:https://msdn.microsoft.com/en-us/library/20bw873z(v=vs.110).aspx
