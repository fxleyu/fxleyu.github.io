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

此类以及每个使用它的线程与一个许可关联（从 `Semaphore` 类的意义上说）。如果该许可可用，
并且可在进程中使用，则调用 `park` 将立即返回；否则可能 阻塞。如果许可尚不可用，则可以调用
 `unpark` 使其可用。（但与 `Semaphore` 不同的是，许可不能累积，并且最多只能有一个许可。）

 park 和 unpark 方法提供了阻塞和解除阻塞线程的有效方法，并且不会遇到导致过时方法 Thread.suspend 和 Thread.resume 因为以下目的变得不可用的问题：由于许可的存在，调用 park 的线程和另一个试图将其 unpark 的线程之间的竞争将保持活性。此外，如果调用者线程被中断，并且支持超时，则 park 将返回。park 方法还可以在其他任何时间“毫无理由”地返回，因此通常必须在重新检查返回条件的循环里调用此方法。从这个意义上说，park 是“忙碌等待”的一种优化，它不会浪费这么多的时间进行自旋，但是必须将它与 unpark 配对使用才更高效。

 三种形式的 park 还各自支持一个 blocker 对象参数。此对象在线程受阻塞时被记录，以允许监视工具和诊断工具确定线程受阻塞的原因。（这样的工具可以使用方法 getBlocker(java.lang.Thread) 访问 blocker。）建议最好使用这些形式，而不是不带此参数的原始形式。在锁实现中提供的作为 blocker 的普通参数是 this。



## 实践
这些方法被设计用来作为创建高级同步实用工具的工具，对于大多数并发控制应用程序而言，它们本身并不是很有用。park 方法仅设计用于以下形式的构造：
```
while (!canProceed()) { ... LockSupport.park(this); }
```

在这里，在调用 park 之前，canProceed 和其他任何动作都不会锁定或阻塞。因为每个线程只与一个许可关联，park 的任何中间使用都可能干扰其预期效果。

以下是一个先进先出 (first-in-first-out) 非重入锁类的框架。
```java
public class FIFOMutex {
    private final AtomicBoolean locked = new AtomicBoolean(false);
    private final Queue<Thread> waiters
            = new ConcurrentLinkedQueue<Thread>();

    public void lock() {
        boolean wasInterrupted = false;
        Thread current = Thread.currentThread();
        waiters.add(current);

        // Block while not first in queue or cannot acquire lock
        while (waiters.peek() != current ||
                !locked.compareAndSet(false, true)) {
            LockSupport.park(this);
            if (Thread.interrupted()) // ignore interrupts while waiting
                wasInterrupted = true;
        }

        waiters.remove();
        if (wasInterrupted)          // reassert interrupt status on exit
            current.interrupt();
    }

    public void unlock() {
        locked.set(false);
        LockSupport.unpark(waiters.peek());
    }
}

```

## 源码阅读
```java
public class LockSupport {
    private LockSupport() {} // Cannot be instantiated.

    // Hotspot implementation via intrinsics API
    private static final Unsafe unsafe = Unsafe.getUnsafe();
    private static final long parkBlockerOffset;

    static {
        try {
            parkBlockerOffset = unsafe.objectFieldOffset
                (java.lang.Thread.class.getDeclaredField("parkBlocker"));
        } catch (Exception ex) { throw new Error(ex); }
    }

    private static void setBlocker(Thread t, Object arg) {
        // Even though volatile, hotspot doesn't need a write barrier here.
        unsafe.putObject(t, parkBlockerOffset, arg);
    }

    public static void unpark(Thread thread) {
        if (thread != null)
            unsafe.unpark(thread);
    }

    public static void park(Object blocker) {
        Thread t = Thread.currentThread();
        setBlocker(t, blocker);
        unsafe.park(false, 0L);
        setBlocker(t, null);
    }

    public static void parkNanos(Object blocker, long nanos) {
        if (nanos > 0) {
            Thread t = Thread.currentThread();
            setBlocker(t, blocker);
            unsafe.park(false, nanos);
            setBlocker(t, null);
        }
    }

    public static void parkUntil(Object blocker, long deadline) {
        Thread t = Thread.currentThread();
        setBlocker(t, blocker);
        unsafe.park(true, deadline);
        setBlocker(t, null);
    }

    public static Object getBlocker(Thread t) {
        if (t == null)
            throw new NullPointerException();
        return unsafe.getObjectVolatile(t, parkBlockerOffset);
    }


    public static void park() {
        unsafe.park(false, 0L);
    }


    public static void parkNanos(long nanos) {
        if (nanos > 0)
            unsafe.park(false, nanos);
    }


    public static void parkUntil(long deadline) {
        unsafe.park(true, deadline);
    }
}
```
# 参考
- [1](http://www.cnblogs.com/chenpi/p/5389254.html) http://www.cnblogs.com/chenpi/p/5389254.html
