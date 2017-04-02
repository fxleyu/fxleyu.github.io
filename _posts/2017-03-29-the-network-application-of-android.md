---
layout   : post
title    : "Android的网络服务"
date     : 2017-03-28 19:28:00
author   : fxleyu
tags:
    - Android
    - 计算机网络
---
Android作为手机操作系统，其内的应用对于网络的访问是其不可缺少的一部分。在这里，将简要记录一些Android对于网络的操作。
# TCP通信
```java
// server
ServerSocket ss = new ServerSocket(10240);
while (true) {
  Socket socket = ss.accept();
  new Thread(new Runnable() {
    public void run() {

    }
  }).start();
}
```
