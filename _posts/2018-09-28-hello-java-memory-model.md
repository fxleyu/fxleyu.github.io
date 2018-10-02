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
和操作系统的内存访问差异，以实现让 Java 程序在各种平台下都能达到一致的内存访问效果。[2]

在给定程序和该程序的执行踪迹（execution trace）的情况下，内存模型描述执行踪迹是否是程序
的合法执行。Java 内存模型的工作原理是检查执行踪迹中的每个读操作，并根据某些规则检查该读
操作所观察到的写操作是否有效。   
内存模型描述了程序的可能行为。只要程序的所有结果执行产生可由内存模型预测的结果，JMM 的
实现就可以自由地生成它喜欢的任何代码。   
这为实现者提供了大量的自由来执行无数的代码转换，包括重新排序动作和删除不必要的同步。[1]

# Java 并发编程实战之 Java 内存模型
本章将尽可能地避开 Java 内存模型（JMM）的底层实现，而将重点放在一些高层设计问题，例如安
全发布，同步策略的规定以及一致性等。

## 1 什么是内存模型，为什么需要它
Java 语言规范要求 JVM 在线程中维护一种类似串行的语义：只要程序的最终结果与在严格串行环境
中执行的结果相同，那么指令重排、缓存等优化操作都是允许的。  
编译器通过对指令重新排序来实现优化执行，以及使用成熟的全局寄存器分配算法。   
只有当多个线程要共享数据时，才必须协调它们之间的操作，并且 JVM 依赖程序通过同步操作来
找出这些协调操作将在何时发生。    
JMM 规定了 JVM 必须遵循一组最小保证，这组保证规定了对变量的写入操作在何时将对其他线程
可见。

### 1.1 平台的内存模型
在共享内存的多处理器体系架构中，每个处理器都拥有自己的缓存，并且定期地与主内存进行协调。
在不同的处理器架构中提供不同级别的缓存一致性（Cache Coherence），其中一部分只提供最小
保证，即允许不同的处理器在任意时刻从同一存储为止看到不同的值。操作系统、编译器以及运行时
（有时甚至包括应用程序）需要弥合这种硬件能力和线程安全需求之间的差异。

在架构定义的内存模型中将告诉应用程序可以从内存系统中获取怎样的保证，此外还定义了一些特殊
指定（称为内存栅栏或栅栏），当需要共享数据时，这些指令就能实现额外的存储协调保证。

Java 还提供了自己的内存模型，并且 JVM 通过在适当的位置上插入内存栅栏来屏蔽在 JMM 在底层
平台内存模型之间的差异。

### 1.2 重排序
JMM 使得不同线程看到的操作执行顺序是不同的，从而导致在缺乏同步的情况下，要推断操作的执行
顺序将变得更加复杂。各种使操作延迟或者看似乱序执行的不同原因，都可以归为重排序。

内存级的重排序会使的程序变得不可预测。同步将限制编译器、运行时和硬件对内存操作重排序的
方式，从而在实施重排序时不会破坏 JMM 提供的可见性保证。

在大多数主流的处理器架构中，内存模型都非常强大，使得读取 `volatile` 变量的性能与读取非
`volatile` 变量的性能大致相当。

### 1.3 Java 内存模型简介
Java 内存模型是通过各种操作来定义的，包括对变量的读/写操作，监视器的加锁和释放操作，以及
线程的启动和合并操作。JMM 为程序中所有的操作定义了一个偏序关系，称之为 Happens-Before。
如果两个操作之间缺乏 Happens-Before 关系，那么 JVM 可以对它们任意地重排序。

Happens-Before 的规则包括：
- 程序顺序规则
- 监视器锁规则
- volatile 变量规则
- 线程启动规则
- 线程结束规则
- 中断规则
- 终结器规则
- 传递性

虽然这些操作只满足偏序关系，但同步操作，如锁的获取与释放等操作，以及 `volatile` 变量的
读取与写入操作，都满足全序关系。因此，在描述 Happens-Before 关系时，就可以使用“后续的锁
获取操作”和“后续的 volatile 变量读取操作”等表达术语。

### 1.4 借助同步
有一项技术称之为“借助（Piggyback）”，是因为它使用了一种现有的 Happens-Before 顺序来保证
对象 X 的的可见性，而不是专门为了发布 X 而创建的一种 Happens-Before 顺序。

“借助”可以实现同步机制的可见属性功能。这需要将 Happens-Before 的程序顺序与其他某个顺序
规则（通常是监视器锁规则或者 `volatile` 变量规则）结合起来，从而对某个未被锁保护的变量
的访问操作进行排序。

如果一个线程将对象置于队列并且另一个线程随后并且另一个线程随后获取这个对象，那么这就是一
种安全发布。

## 2 发布
发布（Publish）一个对象的意思是指，使对象能够在当前作用于之外的代码中使用。
如何安全地或者不正确地发布一个对象，对于其中的各种安全技术，它们都来自于 JMM 提供的保证，
而造成不正确发布的真正原因，就是在“发布一个共享对象”与“另外一个线程访问该对象”之间缺少一
种 Happens-Before 排序。

### 2.1 不安全发布
错误的延迟初始化将导致不正确的发布。

除了不可变对象以外，使用被另一个线程初始化的对象通常都是不安全的，除非对象的发布操作是在
使用该对象的线程开始使用之前执行。
```java
@NotThreadSafe
public class UnsafeLazyInitialization {
  private static Resource resource;
  public static Resource getInstance() {
    if (resource == null) {
      resource = new Resource();
    }
    return resource;
  }
}
```
上述例子中，存在多次创建的实例的问题，此外，还可能导致另外一个线程使用被部分构造的
`Resource` 实例的引用。（原因是另外一个线程可能看到先对 `resource` 赋值，再初始化的
问题。出现这种原因是由于线程间没有 Happens-Before 关系）

### 2.2 安全的发布
事实上，Happens-Before 比安全发布提供了更强可见性与顺序性保证。如果将 X 从线程 A 安全地
发布到 B，那么这种安全发布可以保证 X 状态的可见性，但无法保证 A 访问的其他变量的状态可见性。
然而，如果线程 A 将 X 置于队列的操作在 B 从队列中获取 X 的操作之前执行，那么 B 不仅能看到
A 留下的 X 的状态，而且还能看到 A 移交 X 之前所做的任何操作。

Happens-Before 排序是在内存级别上操作的，它是一种“并发级汇编语言”，而安全发布允许级别更
接近程序设计。

### 2.3 安全初始化模式
- 线程安全的延迟初始化
```java
@ThreadSafe
public class SafeLazyInitialization {
  private static Resource resource;
  public synchronized static Resource getInstance() {
    if (resource == null) {
      resource = new Resource();
    }
    return resource;
  }
}
```

- 提前初始化(Eager Initialization)
```java
@ThreadSafe
public class EagerInitialization {
  private static Resource resource = new Resource();
  public static Resource getInstance() {
    return resource;
  }
}
```

- 延迟初始化占位（Holder）类模式
```java
@ThreadSafe
public class ResourceFactory {
  private static class ResourceHolder {
    public static Resource resource = new Resource();
  }

  public static Resource getInstance() {
    return ResourceHolder.resource;
  }
}
```

### 2.4 双重检查加锁
```java
// 存储未安全发布的问题（也就是其他线程可能存在使用为初始化完成的类） 线程间没有 happens- before 关系
@NotThreadSafe
public class DoubleCheckedLocking {
  private static Resource resource;
  public static Resource getInstance() {
    if (resource == null) {
      synchronized (DoubleCheckedLocking.class) {
        if (resource == null) {
          resource = new Resource();
        }
      }
    }
    return resource;
  }
}
```

```java
@ThreadSafe
public class DoubleCheckedLocking {
  private volatile static Resource resource;
  public static Resource getInstance() {
    if (resource == null) {
      synchronized (DoubleCheckedLocking.class) {
        if (resource == null) {
          resource = new Resource();
        }
      }
    }
    return resource;
  }
}
```

## 3 初始化过程中的安全性
如果能确保初始化过程的安全性，那么就可以使得被正确构造的不可变对象再没有被同步的情况下
也能安全地在多个线程之间共享，而不管它们是如何发布的，甚至通过某些数据竞争来发布。

初始化安全性只能保证通过 `final` 域可达性的值从构造过程完成时开始的可见性，对于通过非 `final`
域可达性的值，或者其他在构造过程完成后可能改变的值，必须采用同步来确保可见性。

## 小结
Java 内存模型说明了某个线程的内存操作在哪些情况下对于其他线程是可见的。其中包括确保这些
操作是按照一种 Happens-Before 的偏序关系进行排序，而这种关系是基于内存操作和同步操作等
级别来定义的。



# 深入理解 Java 虚拟机之 Java 内存模型与线程
Java 虚拟机规范中试图定义一种 Java 内存模型（Java Memory Model，JMM）来屏蔽掉各种硬件
和操作系统的内存访问差异，以实现让 Java 程序在各种平台下都能够达到的一致的内存访问效果。

## 1 主内存与工作内存
Java 内存模型的主要目标是定义程序中各个变量的访问规则，即在虚拟机中将变量存储到内存和从
内存中取出变量的这样的底层细节。

Java 内存模型规定了所有的变量都存储在主内存（Main Memory）中。每条线程还有自己的工作内存
（Working Memory），线程的工作内存中保存了被该线程使用到的变量的主内存副本拷贝，线程对
变量的所有操作（读取、赋值等）都必须在工作内存中进行，而不能直接读写主内存中的变量。不同
的线程之间无法直接访问对方工作内存中的变量，线程间变量的传递需要通过主内存来完成。

# 2 内存间交互操作
关于主内存与工作内存之间的交互协议，即一个变量如何从主内存拷贝到工作内存、如何从工作内存
同步回主内存之类的实现细节，Java 内存模型中定义了一下 8 中操作来完成，虚拟机实现时必须保证
下面提及的每一种操作都是原子的，不可再分的。
- lock（锁定）
- unlock（解锁）
- read（读取）：作用于主内存的变量，把主内存中变量的值传输到线程的工作内存，以便随后的 load 动作使用。
- load（载入）：作用于工作内存的变量，把 read 操作从主内存中获取的变量值放入工作内存的变量副本中。
- use（使用）：作用于工作内存的变量，把工作内存中一个变量的值传递给执行引擎。
- assign（赋值）：作用于工作内存的变量，把一个从执行引擎接收到的值传递给工作内存的变量。
- store（存储）：作用于工作内存的变量，把工作内存中的变量传送到主内存中，以便随后的 write 操作使用。
- write（写入）：作用于主内存的变量，把 store 操作从工作内存中得到的变量值放入主内存的变量中。

Java 内存模型还规定了在执行 8 中基本操作时必须满足如下规则：
- 不允许 read 和 load、store 和 write 操作之一单独出现。
- 不允许一个线程丢弃它的最近的 assign 操作。
- 不允许一个线程无原因地把数据从线程的工作内存同步到主内存中。
- 一个新的变量只能在主内存中“诞生”，不允许在工作内存中直接使用一个未被初始化（load或assign）的变量。
- 一个变量在同一时刻只允许一条线程对其进行 lock 操作。
- 如果对一个变量执行 lock 操作，那将会清空工作内存中此变量的值。
- 如果一个变量事先没有被 lock 操作锁定，那就不允许对它执行 unlock 操作，也不允许去 unlock 一个被其他线程锁定的变量
- 对一个变量执行 unlock 操作之前，必须事前把此变量同步会主内存中。

先行发生原则，用来确定一个访问在并发环境下是否安全。

## 3 对 volatile 型变量的特殊规则
关键字 volatile 是 Java 虚拟机提供的最轻量级的同步机制。

Java 内存模型对 volatile 专门定义了一些特殊的访问规则，当一个变量定义为 volatile 之后，
它将具备两种特性。
- 第一，保证此变量对所有线程的可见性，这里的“可见性”是指当一条线程修改了这个变量的值，新值对其他线程来说是可以立即得知的。
-第二，禁止指令重排序优化，普通的变量仅仅会保证在该方法的执行过程中所有依赖赋值结果的地方都能够获取到正确的结果，而不能保证变量赋值操作顺序与程序中的执行顺序一致。这就是 Java 内存模型中描述的“线程内表现为串行的语义”（Within-Thread As-If0Serial Semantics）

内存屏障（Memory Barrier 或 Memory Fence）指重排序时不能把后面的指令重排序到内存屏障之前的位置。

## 4 对 long 和 double 型变量的特殊规则
Java 内存模型要求 lock、unlock、read、load、assign、use、store、write 这 8 个操作都具有原子性，
但对于 64 位的数据类型（long 和 double），在内存模型中特别定义了一条相对宽松的规定：允许虚拟机将没有被 volatile 修饰的 64 位数据的读写操作划分位两次 32 位的操作来进行，即允许虚拟机可以选择不保证 64 位数据结构的 read、load、store、write 这 4 个操作的原子性。这就是所谓的 long 和 double 的非原子性协定（Nonatomic Treatment of double and long Variables）。

## 5 原子性、可见性与有序性
Java 内存模型是围绕着在并发过程中如何处理原子性、可见性和有序性这 3 个特性来建立的。
- 原子性（Atomicity）
- 可见性（Visibility）：可见性是指当一个线程修改了共享变量，其他线程能够立即得知这个修改。
- 有序性（Ordering）

同步块的可见性是由“对一个变量执行 unlock 操作之前，必须先把此变量同步回主内存中（执行 store、write 操作）”这条规则获取。
final 关键字的可见性是指，被 final 修饰的字符按在构造器一旦初始化完成，并且构造器没有把 `this` 的引用传递出去，那么其他线程能看到 final 字段的指。

## 6 先行发生原则
Java 语言中的先行发生（happens-before）原则是判断数据是否存在竞争、线程是否安全的主要依据。
先行发生是 Java 内存模型中定义的两项操作之前的偏序关系。

Happens-Before 的规则包括：
- 程序次序规则（Program Order Rule）
- 管程锁定规则（Monitor Lock Rule）
- volatile 变量规则（Volatile Variable Rule）
- 线程启动规则（Thread Strat Rule）
- 线程终止规则(Thread Temination Rule)
- 线程中断规则(Thread Interruption Rule)
- 对象终结规则(Finalizer Rule)
- 传递性（Transitivity）


# 参考
- [1] [Java Language Specification (17.4. Memory Model)](https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html#jls-17.4)
- [2] [深入理解Java虚拟机（第2版）(第 12 章 Java 内存模型与线程)](https://book.douban.com/subject/24722612/)
- [3] [Java并发编程实战 (第 16 章 Java 内存模型)](https://book.douban.com/subject/10484692/)
