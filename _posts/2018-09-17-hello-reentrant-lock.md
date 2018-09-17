---
layout   : post
title    : "Hello, ReentrantLock!"
date     : 2018-09-17 22:12:00
author   : fxleyu
tags:
    - Java
    - 多线程
    - 源码阅读
---
# ReentrantLock



# ReentrantLock 源码分析
## 创建对象
```java
public ReentrantLock() {
    sync = new NonfairSync();
}

public ReentrantLock(boolean fair) {
    sync = (fair) ? new FairSync() : new NonfairSync();
}
```

## `lock`
### 公平锁（FairSync）
```java
final void lock() {
    acquire(1);
}
```
AQS 的 `acquire(int)` 回调的 `tryAcquire(int)` 方式实现为:
```java
protected final boolean tryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        if (isFirst(current) &&
                compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0)
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
} 
```

### 非公平锁
```java
final void lock() {
    if (compareAndSetState(0, 1))
        setExclusiveOwnerThread(Thread.currentThread());
    else
        acquire(1);
}
```
