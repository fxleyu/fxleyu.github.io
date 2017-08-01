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

# 贪婪量词（或者 贪心量词）

Greedy 数量词

量词自身是贪心的。贪心的量词会首先匹配整个字符串。尝试匹配时，它会选定尽可能多的内容，也就是整个输入。量词首次尝试匹配整个字符串，如果失败则回退一个字符再次尝试。这个过程叫做回溯（backtracking）。它会每次回退一个字符，直到找到匹配的内容或没有字符可尝试为止。此外，它还会记录所有行为，因此相较另两种方式它对资源的消耗最大。


贪婪量词 | Description
-------|---------
X?     | X，一次或一次也没有
X*     | X，零次或多次
X+     | X，一次或多次
X{n}   | X，恰好 n 次
X{n,}  | X，至少 n 次
X{n,m} | X，至少 n 次，但是不超过 m 次

# 懒惰量词

懒惰（有时也说勉强）量词使用另外一中策略。它从目标的起始位置开始尝试寻找匹配，每次检查字符串的一个字符，寻找它要匹配的内容。最后，它会尝试匹配整个字符串。

懒惰量词 | Description
--------|----------
X??     | X，一次或一次也没有
X*?     | X，零次或多次
X+?     | X，一次或多次
X{n}?   | X，恰好 n 次
X{n,}?  | X，至少 n 次
X{n,m}? | X，至少 n 次，但是不超过 m 次


# 独占量词

独占量词会覆盖整个目标然后尝试寻找匹配内容，但它只尝试一次，不会回溯。

独占量词 | Description
--------|----------
X?+     | X，一次或一次也没有
X*+     | X，零次或多次
X++     | X，一次或多次
X{n}+   | X，恰好 n 次
X{n,}+  | X，至少 n 次
X{n,m}+ | X，至少 n 次，但是不超过 m 次

# 实例代码

```java
private static final String string = "aaaabcd";

@Test
public void testTrue() {
    // 贪心量词 a{1,4}
    Assert.assertTrue(string.matches("a{1,4}abcd"));
    // // 勉强量词 a{1,4}？
    Assert.assertTrue(string.matches("a{1,4}?abcd"));
}

@Test
public void testFalse() {
    // 独占量词
    Assert.assertFalse(string.matches("a{1,4}+abcd"));
}
```
