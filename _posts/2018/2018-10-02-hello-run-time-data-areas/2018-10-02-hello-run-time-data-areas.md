---
layout   : post
title    : "初探 Java 运行时数据区域"
date     : 2018-10-02 14:44:58
author   : fxleyu
tags:
    - JVM
---
Java 虚拟机在执行 Java 程序的过程中会把它所管理的内存划分为若干个不同的数据区域。这些
区域都有各自的用途，以及创建和销毁的时间，有的区域随着虚拟机进程的启动而存在，有写区域则
依赖用户线程的启动和结束而创建和销毁。

Java 虚拟机所管理的内存将会包括一下几个运行时数据区域。
![](https://upload.wikimedia.org/wikipedia/commons/d/dd/JvmSpec7.png)

# 1、程序计数器（PC Register）
程序计数器（Program Counter Register）是一块较小的内存空间，它可以看作是当前程序
所执行的字节码的行号指示器。在虚拟机的概念模型里，字节码解释器工作时就是通过改变这个计数器的值来选取下一条需要执行的字节码指令，分支、循环、跳转、异常处理、线程恢复等基础功能都需要依赖这个计数器来完成。

每一个 JVM 线程都自己拥有一个程序计数器（线程私有的内存）。在任何时候，每个Java虚拟机线程都在执行单个方法的代码，即该线程的当前方法。如果线程正在执行的是一个 Java 方法，这个计数器记录的是正在执行的虚拟机字节码指令的地址；如果正在执行的是 Native 方法，这个计数器值则为空（Undefined）。

# 2、Java 虚拟机栈
每一个 JVM 线程均有一个私有的 Java 虚拟机栈，该 JVM Stack 和线程同时被创建。除了栈帧（frame）的入栈和出栈外, JVM stack 不会被直接操作，帧也许被分配到对内存。 JVM stack 的内存空间不需要连续。

JVM stack 描述的时 Java 方法执行的内存模型：每个方法在执行的同时都会创建一个栈帧（Stack Frame）用于存储局部变量表、操作数栈、动态链接、方法出口等信息。每个方法从调用直至执行完成的过程，就对应着一个栈帧在 JVM Stack 中的入栈到出栈的过程。

局部变量表存放了编译期可知的各种基本数据类型（boolean、byte、char、short、int、float、long、double）、对象引用（reference 类型）和returnAddress 类型（指向了一条字节码指令的地址）。

在 JVM 规范中，有两种异常与该区域相关：
- StackOverflowError 异常
- OutOfMemoryError 异常

# 3、 本地方法栈
本地方法栈（Native Method Stack）与 JVM 栈所发挥的作用是非常相似的，它们之间的区别不过是 JVM Stack 为 JVM 执行 Java 方法（也就是字节码）服务，而本地方法栈则为虚拟机使用到的 Native 方法服务。

在 JVM 规范中，有两种异常与该区域相关：
- StackOverflowError 异常
- OutOfMemoryError 异常

# 4、Java 堆
JVM 有一个堆，该堆被所有 JVM 线程所共享。堆是运行时数据区域，所有的对象实例以及数组都在堆上进行分配。

堆在 VM 启动时被创建。Java 堆是垃圾收集器管理的主要区域。

根据 JVM 虚拟机规范的规定，Java 堆可以处于物理上不连续的内存空间中，只要逻辑上是连续的即可。如果在堆中没有内存完成实例分配，并且堆也无法再扩展时，将抛出 OutOfMemoryError 异常。

# 5、方法区
JVM 有一个方法区，该方法区被所有 JVM 线程共享。方法区用于存储已被虚拟机加载的类信息、常量、静态变量、即时编译器编译后的代码等数据。虽然 JVM 规范把方法区描述为堆的一个逻辑部分，但是它却有一个别名叫做 Non-Heap（非堆），目的应该是与 Java 堆区分开来。

Java 虚拟机规范对方法区的限制非常宽松，除了和 Java 堆一样不需要连续的内存和可选择固定大小或可扩展外，还可以选择不实现垃圾收集。这区域的内存回收目标主要是争对常量池的回收和对类型的卸载。

根据 JVM 规范的规定，当方法区无法满足内存分配需求时，将抛出 OutOfMemoryError 异常。

# 6、运行时常量池
运行时常量池（Runtime Constant Pool）是方法区的一部分。Class 文件中除了有类的版本、字段、方法、接口等描述信息外，还有一项信息是常量池（Constant Pool Table），用于存放编译器生存的各种字面量和符号引用，这部分内容将在类加载后进入方法区的运行时常量池中存放。

既然运行时常量池是方法区的一部分，自然受到方法区内存的限制，当常量池无法再申请到内存时会抛出 OutOfMemoryError 异常。

# 7、直接内存
直接内存（Direct Memory）并不是虚拟机运行时数据区的一部分，也不是 Java 虚拟机规范中定义的内存区域。但是这部分内存也被频繁地使用，并且也可能导致 OutOfMemoryError 异常的出现。

在 JDK 1.4 中新加入了 NIO（New Input/Output）类，引入了一种基于通道（Channel）与缓冲区（Buffer）的 I/O 方式，它可以使用 Native 函数库直接分配堆外内存，然后通过一个存在在 Java 堆中的 DirectByteBuffer 对象作为这块内存的引用进行操作。这样能在一些场景中显著提高性能，因为避免了在 Java 堆和 Native 堆中来回复制数据。

显然，本机直接内存的分配不受到 Java 堆大小的限制，但是，既然是内存，肯定还是会受到本机总内存（包括 RAM 以及 SWAP 区或者分页文件）大小以及处理器寻址空间的限制。服务器管理员在配置虚拟机参数时，会更具实际内存设置 -Xmx 等参数信息，但经常忽略直接内存，使得各个内存区域总和大于物理内存的限制，从而导致动态扩展时出现 OutOfMemoryError 异常。

# 参考
- [Java Virtual Machine Specification (The Structure of the Java Virtual Machine)](https://docs.oracle.com/javase/specs/jvms/se7/html/jvms-2.html#jvms-2.5)
- - [2] [深入理解Java虚拟机（第2版）(第 2 章 Java 内存区域与内存溢出异常)](https://book.douban.com/subject/24722612/)
