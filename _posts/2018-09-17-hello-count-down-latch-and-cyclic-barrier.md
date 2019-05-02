---
layout   : post
title    : "Hello, CountDownLatch 和 CyclicBarrier"
date     : 2018-09-17 20:07:32
author   : fxleyu
tags:
    - Java
    - 源码阅读
---
> 未有特殊说明，本文源码来源于 jdk1.6.0_45。

# `CountDownLatch`

## `new CountDownLatch(count)`

```java
public CountDownLatch(int count) {
    if (count < 0) throw new IllegalArgumentException("count < 0");
    this.sync = new Sync(count);
}
```
其中 `Sync` 的实现如下：
```java
private static final class Sync extends AbstractQueuedSynchronizer {
    private static final long serialVersionUID = 4982264981922014374L;
    Sync(int count) {
        // 设置 AQS 维护的状态信息（资源数） count
        // private volatile int state; // AQS 维护的 state
        setState(count);
    }
}
```
## `await()`
```java
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}
```
`acquireSharedInterruptibly` 由 AQS 来实现。其主要逻辑是，先调用
`tryAcquireShared(1)`方法（AQS 是 abstract 方法，具体由 CountDownLatch 的内部类
Sync 实现）来测试当前资源是否可用，如果不可以，调用 `doAcquireSharedInterruptibly(1)`。
`doAcquireSharedInterruptibly(1)` 完全是 AQS 内部实现的，主要用来逻辑是创建一个共享
节点，并加入到 AQS 的等待队列的尾部（当然，还会去除被终止的节点，并修改其前置节点的状态，
使用的是自旋和 CAS 方式）。

## `await(long timeout, TimeUnit unit)`
```java
public boolean await(long timeout, TimeUnit unit) throws InterruptedException {
    return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));
}
```
`acquireSharedInterruptibly` 由 AQS 实现，与没有超时时间的区别在于，有时间控制而已。

## `countDown()`
```java
public void countDown() {
    sync.releaseShared(1);
}
```
