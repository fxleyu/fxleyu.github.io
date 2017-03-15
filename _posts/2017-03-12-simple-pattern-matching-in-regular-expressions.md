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
\p{Punct}  | Punctuation: One of !"#$%&'()\*+,-./:;<=>?@[\^_`{|}~
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
