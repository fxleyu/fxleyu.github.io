---
layout   : post
title    : "初探 Java 内存模型"
subtitle : "读书笔记"
date     : 2018-09-28 23:17:03
author   : fxleyu
tags:
    - Java
    - JMM
---
Java 虚拟机规范中试图定义一种 Java 内存模型（Java Memory Model， JMM）来屏蔽各种硬件
和操作系统的内存访问差异，以实现让 Java 程序在各种平台下都能达到一致的内存访问效果。

在给定程序和该程序的执行踪迹（execution trace）的情况下，内存模型描述执行踪迹是否是程序
的合法执行。Java 内存模型的工作原理是检查执行踪迹中的每个读操作，并根据某些规则检查该读
操作所观察到的写操作是否有效。

内存模型描述了程序的可能行为。只要程序的所有结果执行产生可由内存模型预测的结果，JMM 的
实现就可以自由地生成它喜欢的任何代码。

这为实现者提供了大量的自由来执行无数的代码转换，包括重新排序动作和删除不必要的同步。

# 主内存与工作内存

# 内存间交互操作

# 对 volatile 型变量的特殊规则

# 对 long 和 double 型变量的特殊规则

# 原子性、可见性与有序性

# 先行发生原则

# 参考
- [Memory Model](https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html#jls-17.4)
