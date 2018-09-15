---
layout   : post
title    : "Hello, Unsafe 和 LockSupport"
date     : 2018-09-14 00:07:10
author   : fxleyu
tags:
    - Java
    - 多线程
    - 源码阅读
---
> 未有特殊说明，本文源码来源于 jdk1.6.0_45。

在阅读 `AbstractQueuedSynchronizer` 源码时，发现其批量使用 `LockSupport` 相关接口，
而 `LockSupport` 又使用 `Unsafe` 本地库来实现的。故，这里为了理解这两部分而写的。

# `Unsafe` 接口
## 1. 对象的内存操作
```java
// 返回成员属性在内存中的地址相对于对象内存地址的偏移量 [1]
public native long objectFieldOffset(Field field);

// 对 obj 内存偏移量位为 offset 的属性赋新值 value
// 如果 obj 内存偏移量位为 offset 的属性被 volatile， 这里也不需要 write barrier
public native void putObject(Object obj, long offset, Object value);

// 对 obj 内存偏移量位为 offset 的属性的值，使用 read_barrier
public native Object getObjectVolatile(Object obj, long offset);
```

## 3. 阻塞相关
```java
// 如果许可不可用，使进程调度器不再调度当前线程，出发遇到如下四种情况：
// 1. 其他某个线程将当前线程作为目标调用 unpark
// 2. 其他某个线程中断当前线程
// 3. isAbsoluteTime 为 true 时，到了 value 时刻（对于历元的毫秒数值）
//    isAbsoluteTime 为 false 时，过了 balue nanos（纳秒）
// 4. 该调用不合逻辑地（即毫无理由地）返回
public native void park(boolean isAbsoluteTime, long value);

// 如果给定线程的许可尚不可用，则使其可用。
// 如果线程在 park 上受阻塞，则它将解除其阻塞状态。
// 否则，保证下一次调用 park 不会受阻塞。
// 如果给定线程尚未启动，则无法保证此操作有任何效果。
public native void unpark(Object thead);
```

# 二、`LockSupport` 相关
`LockSupport` 用来创建锁和其他同步类的基本线程阻塞原语。

# 参考
- [1](http://www.cnblogs.com/chenpi/p/5389254.html) http://www.cnblogs.com/chenpi/p/5389254.html
