---
layout   : post
title    : "Java并发概述"
subtitle : "Effective Java笔记"
date     : 2018-02-20 20:49:00
author   : fxleyu
tags:
    - Java
    - 并发
---
> 截至时间 2018-02-28 23:59:59

本文阐述的建议可以帮助编写出清晰、正确、文档组织良好的并发程序。

# #66 同步访问共享的可变数据
`volatile`保证任何一个线程在读取该域的时候都可以看到最近刚刚被写入的值。

- 安全性失败（**safety failure**）
- 活性失败（**liveness failure**）

# #67 避免过度同步

# #68 executor和task优先于线程

# #69 并发工具优先于wait和notify

# #70 线程安全性的文档化

# #71 慎用延迟初始化

# #72 不要依赖于现场调度器

# #73 避免使用线程组
