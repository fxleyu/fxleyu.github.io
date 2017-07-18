---
layout   : post
title    : "Java虚拟机概览"
date     : 2017-07-17 22:52:00
author   : fxleyu
tags:
    - Java
    - JVM
---
> 本文是Java性能优指南（Java Performnce）第五章的阅读笔记。

本文概要介绍HotSpot VM的架构，其没有包含其全部内容，只是介绍它的架构和主要组件。HotSpot VM有3个主要组件：VM运行时（Runtime）、JIT编译器（Just-in-time Compiler，即时编译器）以及内存管理（Memory Manager）。本文首先介绍了HotSpot VM的基本架构，然后介绍了这3个主要组件。此外，本文最后还会概述HotSpot VM的自动优化策略（Ergonomic Decisions）。

# 一、HotSpot VM的基本架构
HotSpot VM架构极富特点且功能强大，可以满足高性能和高扩展性。如下是HotSpot VM架构的概览。

![JVM](http://wx3.sinaimg.cn/large/5f4b7840ly1fhnam8g2pij20pe0n2q3v.jpg)

如上图所示，JIT编译器（Client或者Server）和垃圾收集器（Serial、Throughout、CMS或G1）都是可插拔的。HotSpot VM运行时系统为HotSpot JIT编译器和垃圾收集器提供服务和通用API。此外，它还为VM提供启动、线程管理、JNI(Java本地接口)等基本功能。

# 二、HotSpot VM运行时
HotSpot VM运行时环境担当许多职责，包括命令行选项解析、VM生命周期管理、类加载、字节码解释、异常处理、同步、线程管理、JNI、VM致命错误处理和C++堆管理。

## 2.1 命令行选项
HotSpot VM运行时系统解析命令行选项，并据此配置HotSpot VM。其中一些选项供HotSpot VM启动器使用，例如指定选择哪个JIT编译器、选择何种垃圾收集器等，还有一些经启动器处理后传给完成启动的HotSpot VM，例如指定Java堆的大小。

命令行选项主要有3类：标准选项（Standard Option）、非标准选项（Nonstandard Option）和非稳定选项（Developer Option）。标准选项是Java虚拟机规范要求所有虚拟机都必须实现的选项，它们在发行版本之间保持稳定，但也可能在后续的发行版本中被废除。非标准选项（以`-X`为前缀）不保证、也不强制所有JVM实现必须支持，它可能未经通知就在Java SDK发行版之间发生变更。非稳定选项（以`-XX`为前缀）通常是为了特定需要而对JVM的运行就行校正，并且可能需要有系统配置参数的访问权限。和非标准选项一样，非稳定选项也可能未经通知就在发行版之间发生变更。对于带有布尔标记的非稳定选项来说，选项名前的+或者-表示ture或false，用以开启或者关闭特定的HotSpot VM特性或参数。

## 2.2 VM生命周期
HotSpot VM运行时系统负责启动和停止HotSpot VM。本小节简要介绍一下HotSpot在Java程序运行前以及终止或者退出时所做的工作。

启动HotSpot VM的组件是启动器，其启动HotSpot VM时会执行如下一系列操作。具体步骤如下：
- 1、解析命令行选项
- 2、设置堆的大小和JIT编译器
- 3、设置环境变量，如LD_LIBRARY_PATH和CLASS_PATH。
- 4、如果命令行有`-jar`选项，启动器则从指定JAR的manifest中查找Main-Class，否则从命令行读取Main-Class。
- 5、使用标准Java本地接口（JNI）方法JNI_CreateJavaVM在新创建的线程中创建HotSpot VM。
- 6、一旦创建并初始化好HotSpot VM，就会加载Java Main-Class，启动器也会从Java Main-Class中得到Java main方法的参数。
- 7、HotSpot VM通过JNI方法CallStaticVoidMethod调用Java main方法，并将命令行选项传给它。
