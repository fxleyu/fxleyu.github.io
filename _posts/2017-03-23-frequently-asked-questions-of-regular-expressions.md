---
layout   : post
title    : "正则表达式中的常见问题"
date     : 2017-03-23 23:30:00
author   : fxleyu
tags:
    - RegEx
    - Java
---
# 正则表达式中的常见问题集锦

## 1、在后顾（lookbehind）中使用后向引用（backreference ）

```java
System.out.println(str.replaceAll("(.)(?<=a{1,4}\\1)", ""));
```
out:
```
Exception in thread "main" java.util.regex.PatternSyntaxException: Look-behind group does not have an obvious maximum length near index 14
(.)(?<=a{1,4}\1)
              ^
    at java.util.regex.Pattern.error(Unknown Source)
    at java.util.regex.Pattern.group0(Unknown Source)
    at java.util.regex.Pattern.sequence(Unknown Source)
    at java.util.regex.Pattern.expr(Unknown Source)
    at java.util.regex.Pattern.compile(Unknown Source)
    at java.util.regex.Pattern.<init>(Unknown Source)
    at java.util.regex.Pattern.compile(Unknown Source)
    at java.lang.String.replaceAll(Unknown Source)
    at com.stackoverflow.fxleyu.RegexMain.main(RegexMain.java:x)
```
