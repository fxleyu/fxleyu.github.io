---
layout   : post
title    : "学习设计模式"
date     : 2017-04-02 10:28:00
author   : fxleyu
tags:
    - 设计模式
---
**设计模式**，在本文中，是面向对象软件的设计经验，是对用来在特定场景下解决一般设计问题的类和相互通信的对象的描述。设计模式确定了所包含的类和实例，它们的角色、协作方式以及职责分配。

> 每一个模式描述了一个在我们周围不断重复发生的问题，以及该问题的解决方案的核心。这样，你就能一次又一次地使用该方案而不必做重复劳动。 —— Christopher Alexander

一般来言，一个设计模式有如下四个基本要素：
- 模式名称（patern name）
- 问题（problem）
- 解决方案（solution）
- 效果（consequences）


### 设计模式所支持的设计的可变方面
目的 | 设计模式 | 可变的方面 | 示例
---|---|---|---
创建 | Abstact Factory | 产品对象家族 | -
创建 | Builder | 如何创建一个组合对象 | 
创建 | Factory Method | 被实例化的子类
创建 | Prototype | 被实例化的类
创建 | Singleton | 一个类的唯一实例
结构 | Adapter | 对象的接口
结构 | Bridge | 对象的实现
结构 | Composite | 一个对象的结构和组成
结构 | Decorator | 对象的职责，不生成子类
结构 | Facade | 一个子系统的接口
结构 | Flyweight | 对象的存储开销
结构 | Proxy | 如何访问一个对象；该对象的位置
