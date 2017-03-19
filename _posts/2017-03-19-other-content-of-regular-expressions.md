---
layout   : post
title    : "正则表达式中的其他内容"
date     : 2017-03-19 10:29:00
author   : fxleyu
tags:
    - RegEx
    - Java
---

在之前的文章中，记录了Java正则表达式中的各种表达方式。在这里将记录一下除上述之前的一些内容。例如，正则表达式中的模式等内容。

# 介绍

# 模式
在Java中，正则表达式中的模式选择使用Flag来标识。其使用如下接口来启用模式。
```java
public static Pattern compile(String regex, int flags)
```

常用的模式如下：

常量  |  等价的嵌入式FLAG表达式
--------------------------|-----------
Pattern.CANON_EQ          | None
Pattern.CASE_INSENSITIVE  | (?i)
Pattern.COMMENTS          | (?x)
Pattern.MULTILINE         | (?m)
Pattern.DOTALL            | (?s)
Pattern.LITERAL           | None
Pattern.UNICODE_CASE      | (?u)
Pattern.UNIX_LINES        | (?d)

## 1 Pattern.CANON_EQ
`Pattern.CANON_EQ`用于启用规范等价模式。
指定此标志后，当且仅当其完整规范分解匹配时，两个字符才可视为匹配。例如，当指定此标志时，表达式 "a\u030A"（a。） 将与字符串 "\u00E5"（å） 匹配。默认情况下，匹配不考虑采用规范等价。

## 2 Pattern.CASE_INSENSITIVE
`Pattern.CASE_INSENSITIVE`用于启用不区分大小写的匹配模式。默认情况下，不区分大小写的匹配假定仅匹配 US-ASCII 字符集中的字符。可以通过指定 `UNICODE_CASE` 标志连同此标志来启用 Unicode 感知的、不区分大小写的匹配。
```java
Pattern pattern = Pattern.compile("abc", Pattern.CASE_INSENSITIVE);
```
等价于
```java
Pattern pattern = Pattern.compile("(?i)
abc");
```
### 实践：启用不区分大小写的匹配模式
```java
public static void main(String[] args) {
  Pattern pattern = Pattern.compile("abc", Pattern.CASE_INSENSITIVE);
  Matcher matcher = pattern.matcher("abc\nABC\nABc\nAbc\naBC\nabC");
  while (matcher.find()) {
    System.out.println(matcher.group());
  }
}
```
输出结果为：
```
abc
ABC
ABc
Abc
aBC
abC
```
### 实践：扩展
```java
public static void main(String[] args) {
  Pattern pattern = Pattern.compile("(?i)ab(?-i)c");
  Matcher matcher = pattern.matcher("abc\nABC\nABc\nAbc\naBC\nabC");
  while (matcher.find()) {
    System.out.println(matcher.group());
  }
}
```
输出结果为：
```
abc
ABc
Abc
```

## 3 Pattern.COMMENTS
`Pattern.COMMENTS`用于启动 COMMENTS 模式。此模式将忽略空白和在结束行之前以 # 开头的嵌入式注释。
```java
Pattern pattern = Pattern.compile(" a b c   # comments", Pattern.COMMENTS);
```
等价于
```java
Pattern pattern = Pattern.compile("(?x) a b c   # comments");
```
同时等价于
```java
Pattern pattern = Pattern.compile("abc");
```

## 4 Pattern.MULTILINE
`Pattern.MULTILINE`用于启动多行模式。在多行模式中，表达式 ^ 和 $ 仅分别在行结束符前后匹配，或者在输入序列的结尾处匹配。默认情况下，这些表达式仅在整个输入序列的开头和结尾处匹配。
```java
Pattern pattern = Pattern.compile("^abc", Pattern.MULTILINE);
```
等价于
```java
Pattern pattern = Pattern.compile("(?m)^abc");
```
### 实践：在多行模式
```java
public static void main(String[] args) {
  Pattern pattern = Pattern.compile("^abc", Pattern.MULTILINE);
  Matcher matcher = pattern.matcher("abc\nABC\nABC\nAbc\nabc\nabc");
  while (matcher.find()) {
    System.out.println(matcher.group());
  }
}
```
输出结果为：
```
abc
abc
abc
```
### 实践：在默认的模式下
```java
public static void main(String[] args) {
  Pattern pattern = Pattern.compile("^abc");
  Matcher matcher = pattern.matcher("abc\nABC\nABC\nAbc\nabc\nabc");
  while (matcher.find()) {
    System.out.println(matcher.group());
  }
}
```
输出结果为：
```
abc
```


## 5 Pattern.DOTALL
`Pattern.DOTALL`启用 dotall 模式。在 dotall 模式中，表达式 `.` 可以匹配任何字符，包括行结束符。默认情况下，此表达式不匹配行结束符。

### 实践：在DOTALL模式下
```java
public static void main(String[] args) {
  Pattern pattern = Pattern.compile("c.", Pattern.DOTALL);
  Matcher matcher = pattern.matcher("abc\r\nABC\nABc\nAbc");
  while (matcher.find()) {
    System.out.println(matcher.group());
  }
}
```
输出结果：
```
c

c

```
### 实践：在默认模式下
```java
public static void main(String[] args) {
  Pattern pattern = Pattern.compile("c.", Pattern.DOTALL);
  Matcher matcher = pattern.matcher("abc\r\nABC\nABc\nAbc");
  while (matcher.find()) {
    System.out.println(matcher.group());
  }
}
```
输出结果为NULL

## 6 Pattern.LITERAL
`Pattern.LITERAL`用于启动字面值解析模式。指定该模式，输入字符串就会作为字面值字符序列来对待。输入序列中的元字符或转义序列不具有任何特殊意义。
```java
Pattern pattern = Pattern.compile("+", Pattern.LITERAL);
```
等价于
```java
Pattern pattern = Pattern.compile("\\Q+\\E");
```

## 7 Pattern.UNICODE_CASE
## 8 Pattern.UNIX_LINES

## 9 多模式使用
```java
Pattern pattern = Pattern.compile("[az]$", Pattern.MULTILINE | Pattern.UNIX_LINES);
```

# 结束语
正则表达式的学习就告一段落了。在接下来的时间里，用来对自己基础进行巩固。
