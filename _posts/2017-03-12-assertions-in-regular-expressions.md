---
layout   : post
title    : "正则表达式中的断言"
date     : 2017-03-12 14:40:00
author   : fxleyu
tags:
    - RegEx
    - Java
---
# 一、介绍
**断言**（**Assertion**），也被称为**零宽度断言**（**zero-width assertions**），本身不匹配字符，而是匹配字符串中的位置。

**断言**又包含**锚位符**（**Anchor**）、**环视**（**Lookarounds**）。
- **锚位符**，也被称为**边界**（**Boundary**），
- **环视**，是一种非捕获分组，它根据某个模式之前或之后的内容匹配其他模式。

# 二、边界

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


# 三、环视
> **环视**（lookaround）是一种非捕获分组，它根据某个模式之前或之后的内容匹配其他模式。环视也被称为**零宽度断言**（zero-length assertions）。

Lookaround | Description
-------|----------
(?=X)  | X, via zero-width positive lookahead (正前瞻)
(?!X)  | X, via zero-width negative lookahead (反前瞻)
(?<=X) | X, via zero-width positive lookbehind (正后顾)
(?<!X) | X, via zero-width negative lookbehind (反后顾)


环视包含如下四种：
- 正前瞻（positive lookahead）
- 反前瞻（negative lookahead）
- 正后顾（positive lookbehind）
- 反后顾（negative lookbehind）

在实际的用例中，使用到如下帮组方法：
```java
    private static boolean canMatch(String patternString, String string) {
        return Pattern.compile(patternString).matcher(string).find();
    }
```

## 3.1 正前瞻
> (?=X)  | X, via zero-width positive lookahead (正前瞻)

测试代码如下：
```java
    @Test
    public void testPositiveLookahead() {
        Assert.assertTrue(canMatch("Timeout(?=Exception)", "TimeoutException"));
        Assert.assertFalse(canMatch("Timeout(?=Exception)", "Timeout exception"));
    }
```


## 3.2 反前瞻
> (?!X)  | X, via zero-width negative lookahead (反前瞻)

测试代码如下：
```java
    @Test
    public void testNegativeLookahead() {
        Assert.assertTrue(canMatch("Timeout(?!Exception)", "Timeout exception"));
        Assert.assertFalse(canMatch("Timeout(?!Exception)", "TimeoutException"));
    }
```

## 3.3 正后顾
> (?<=X) | X, via zero-width positive lookbehind (正后顾)

测试代码如下：
```java
    @Test
    public void testPositiveLookbehind() {
        Assert.assertTrue(canMatch("(?<=Timeout)Exception", "TimeoutException"));
        Assert.assertFalse(canMatch("(?<=Timeout)Exception", "NullPointerException"));
    }
```

## 3.4 反后顾
> (?<!X) | X, via zero-width negative lookbehind (反后顾)

测试代码如下：
```java
    @Test
    public void testNegativeLookbehind() {
        Assert.assertTrue(canMatch("(?<!Timeout)Exception", "NullPointerException"));
        Assert.assertFalse(canMatch("(?<!Timeout)Exception", "TimeoutException"));
    }
```

## 四、应用
### 场景一
在做线上 log 查看时，由于大量超时 log，这边做搜索时只是搜索常见异常，其模式为`\java.lang.*Exception`。今天上线，遇到了 Json 解析失败异常，查询原因为上游新老版本逻辑有点不一致导致的。反思这很不应该，故尝试使用断言来查询除了超时异常之前的其他异常。

### 场景二
密码强度匹配

# 五、总结
