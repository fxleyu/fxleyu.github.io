---
layout   : post
title    : "初探并发组件的基石 —— AQS"
subtitle : "AQS (AbstractQueuedSynchronizer, 队列同步器) 在整个 JDK 并发框架中占有极其重要的位置"
date     : 2019-05-12 14:55:55
author   : fxleyu
tags:
    - Java
    - 并发
---
> 未有特殊说明，本文源码来源于 jdk1.6.0_45。

`AbstractQueuedSynchronizer` 为实现依赖于先进先出 (FIFO) 等待队列的阻塞锁和相关同步
器（信号量、事件，等等）提供一个框架。此类的设计目标是成为依靠单个原子 `int` 值来表示状态
的大多数同步器的一个有用基础。

## 属性与数据结构
![](img\2019-05\AQS_field.jpg)

![](img\2019-05\AQS_struct.jpg)


# 其他并发组件
## `CountDownLatch`
其使用 AQS 的共享模型。当其初始化实例时，会创建一个当前状态为 n 的 AQS 子类实例。每一个线程执行 `await`，就会在同步队列的队尾创建一个节点，并把自己阻塞（`LockSupport.park`），并等待被唤醒或者超时。每调用一次`countDown`，就会修改状态值（减一），并判断当前状态是否需要处理队列中的节点；如果当前状态为 0，就处理处理中的节点。
