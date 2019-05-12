---
layout   : post
title    : "初探 Java 并发"
date     : 2017-01-11 23:30:00
author   : fxleyu
tags:
    - Java
    - 并发

---

> 整理有道笔记
> 简单看完《Java编程思想》的并发章节后，写一遍总结文档，为了复习。

## 1、并发的概念

- 函数型语言被设计为并发任务彼此隔离

## 2、基本的线程机制

```java
// 1
Runnable task = ...;
new Thread(task).start();

// 2
Thread thread = ...;
thread.start();

// 3
ExecutorService exec = Executors.newCachedThreadPool();
exec.execute(task);
exec.shutdown(); //防止新任务被提交到当前执行器

// 多任务下载的情形
exec = Executors.newFixedThreadPool(num);

exec = Executors.newSingleThreadExecutor();// == newFixedThreadPool(1)

// 4
Future<String> future = exec.submit(new
Callable<String>() {
    public String call() {
        return "IT";
    }
});

// 5
Thread.sleep(); //不释放锁
TimeUnit.MILLISECONDS.sleep(m);
String result = future.get(); // 阻塞

// 6
Thread.currentThread().setPriority(Thread.MAX_PRIORITY);

// 7
yield()； // 暗示可以让出CPU

// 8 后台线程
// 后台（daemon）线程，是指在程序运行的时候在后台提供一种通用服务的线程，并且这种线程并不属于程序中不可或缺的部分。
// 只要有任何非后台线程在运行，程序就不会终止。
Thread thread = ...;
thread.setDaemon(true);
thread.start();

// 9 编码变体
public SimpleThread extends Thread {
    pinlic SimpleThread() {
        super();
        start();
    }

    public void run() {
        // do something
    }
}

// 10 术语

// 11 join()
Thread t = ..;
t.join(); // 等待t执行完成

// 12 创建响应的用户界面
// 后台线程

// 13 线程组 设计是有问题的
// 承诺升级理论
// 继续错误的代价是由别人承担，而承认错误的代价由自己承担

// 14 捕获异常
ExecutorService exec = Executors.newCachedThreadPool(new ThreadFactory() {
    public Thread newThread(Runnable r) {
        Thread t = new Thread(r);
        t.setUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            public void uncaughtException(Thread t, Throwable e) {
                System.out.println(t + " be caughted " + e);
            }
        });
        return t;
    }
});
exec.execute(task);


Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
    public void uncaughtException(Thread t, Throwable e) {
            System.out.println(t + " be caughted " + e);
    }
});

```


## 3、共享受限资源

- 基本上所有的并发模式在解决线程冲突问题的时候，都是采用*序列化访问共享资源*的方案。这意味着在给定时刻只允许一个任务访问资源。通常这是通过在代码前面加上一条锁语句来实现的，这就使得在一段时间内只有一个任务可以运行这段代码。因为锁语句产生了一种相互排斥的效果，所以这种机制常常被称为*互斥量（mutex）*
- 所有对象都自动含有单一的锁（也称为监视器）。当在对象上调用`synchronized`方法的时候，此对象都被加锁，这时候该对象上的其他`synchronized`方法只有等到前一个方法调用完毕并释放了锁后才能被调用。
- ReentrantLock允许你尝试着获取但最终未获取锁。

```java
// 1 synchronized
public void synchronized method() {
    // ...
}

// 2 显示的Lock对象
private Lock lock = new ReentrantLock();

public void method() {
    lock.lock();
    // boolean captured = lock.tryLock();
    // boolean captured = lock.tryLock(2, TimeUnit.SECONDS);
    try {
        // ...
    } finally {
        lock.unlock();
        // if (captured) {
        //     lock.unlock();
        // }
    }
}
```

- *原子操作*是不能被线程调度机制终端的操作；一旦操作开始，那么它一定可以在可能发送的“上下文切换”之前（切换到其他线程执行）执行完毕。

> Geotz测试：如果你可以编写用于现代微处理器的高性能JVM，那么就有资格取取考虑是否可以避免同步。

- 原子类
- 防止多个线程同时访问方法内部的部分代码而不是防止访问整个方法，分离出来的代码块被称为*临界区（critical section）*

```java
// 5 也被称为 同步控制块
synchronized(object) {
    // todo
}
```
- 在其他对象上同步

- 线程本地存储

```java
// 7
ThreadLocal
```

## 4、终结任务
- 进入阻塞状态
- - 通过调用`sleep(milliseconds)`是任务进入休眠状态
- - 通过`wait()`使线程挂起
- - 任务在等待某个输入\输出完成
- - 任务试图在摸个对象上调用其同步控制方法，但是对象锁不可用，因为另外一个任务以及获取了这个锁
- 中断
> Thread类包含interrupt()方法，因此你可以终止被阻塞的任务，这个方法将设置线程的中断状态。如果一个线程已经被阻塞，或者试图执行一个阻塞操作，那么设置这个线程的中断状态将抛出InterruptedException。当抛出该异常或者任务调用Thread.interrupted()时，中断状态将被复位。

```java
Thread.interrupt();

Executor.shutdownNow();

Future.cancel();
```

- 被互斥阻塞

```java
// 具有中断能力的锁
Lock lock = new ReentrantLock();
try {
    lock.lockInterruptibly();
} catch(InterruptedException e) {
}
```

- 检查中断

```java
while (!Thread.interrupted()) {

}
```

## 5、线程之间的协作
- 使用线程来同时运行多个任务时，可以通过使用锁（互斥）来同步两个任务的行为，从而使得一个任务不会干涉另一个任务的资源。
- 线程间的协作也是通过互斥来完成。在这种情况下，互斥能够确保只有一个任务可以相应某个信号，这样就可以根除任何可能的竞争条件。
- `wait() notifyAll()`
- 调用`sleep()`的时候锁并没有被释放。当一个任务在方法中遇到对`wait()`的调用的时候，线程的执行被挂起，对象上的锁被释放。
- 只有在同步控制方法或同步控制块里调用`wait()、notify()、notifyAll()`
- 为了使用`notify()`，所有任务必须等待相同的条件，因为如果你有多个任务在等待不同条件，那么你就不会知道是否唤醒了恰当的任务。

```java
// wait() 在while循环中，防止信号错失
synchronized(this) {
    while(contions) {
        this.wait();
    }
}

// 使用显式的Lock和Condition对象

Lock lock = new ReentrantLock();
Condition condition = lock.newCondition();

lock.lock();
try {
    lock.signalAll();
} finally {
    lock.unlock();
}


lock.lock();
try {
    while( ... ) {
        condition.await();
    }
} finally {
    lock.unlock();
}

// 阻塞队列
ArrayBlockingQueue ;

// 任务间使用管道进行输入输出
// 管道基本上是一个阻塞队列
// **管道可以中断***

PipedWriter writer = new PipedWriter();

PipedReader reader = new PipedReader(writer);
```


## 6、死锁

## 7、新类库中的构件
- `CountDownLatch`被设计为只触发一次，计数数值不能被重置

```java
CountDownLatch latch = new CountDownLatch(N);

// 等待计数归零
latch.await();

// 计数减一
latch.countDown();
```

- `CyclicBarrier`

```java
CyclicBarrier barrier = new CyclicBarrier(N, new Runnable() {
    public void run() {
        // TODO
    }
});

barrier.await();
```

- DelayQueue
- PriorityBlockingQueue
- ScheduledExecutor
- Semaphore 正常的锁在任何时刻都只允许一个任务访问一项资源，而*计数信号量*允许n个任务同时访问这个资源。

```java
Semaphor semaphor = new Semaphor(N, true);

semaphor.acquire();

semaphor.release();
```

- Exchanger

```java
Exchanger<List> exchanger = new Exchanger<List>();

list = exchanger.exchange(list);
```

## 8、仿真

## 9、性能优化

## 10、活动对象

## 线程状态转换
![](img\2019-05\Thread_State.jpg)

## 总结
