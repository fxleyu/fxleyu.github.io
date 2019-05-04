---
layout   : post
title    : "按键机中组件聚焦问题总结"
date     : 2016-10-31 10:13:00
author   : fxleyu
tags:
    - Android
---

## 前言
最近负责的一个按键机的Email应用维护工作。在工作中遇到了很多方向键没法聚焦到组件的问题。本文就是归纳总结一下遇到的这些问题，并给出解决方案。

# 一、背景
在参与的按键机项目中，除Email之外其它模块应用基本上全部完成了按键操作。而Email应用的基线代码取之于一个支持触摸屏的项目，其中很多地方并未实现按键的操作。故该项目Email应用中，改造组件支持键盘操作是一项重要内容。而该项工作的重点就是使组件支持方向键的聚焦。

# 二、问题
在处理操作方向键聚焦组件的问题中，遇到了各种各样的类型。而这些类型可以归纳为如下几种：
## 1、物理上的不可聚焦
物理上的不可以聚焦包含两种含义，第一种是由于组件本身不支持聚焦；第二种是其子组件支持聚焦而获取本属于它的焦点导致的不可以聚焦。
## 2、逻辑上的不可聚焦
逻辑上的不可聚焦是由于该组件上下文逻辑导致所要聚焦的组件不可以获取到焦点。
## 3、视觉上的不可聚焦
视觉上的不可以聚焦并不是真正意义上的不可以聚焦，其是该组件可以被物理方向键聚焦，但UI上聚焦不聚焦表现一致导致用于以为不可以聚焦。
物理上的不可以聚焦和视觉上的不可聚焦均属于所要聚焦组件本身的问题，解决方案比较单一，处理起来也比较简单。
逻辑上的不可以聚焦又可以分为多种，其又可以分为如下几种子类：
1. 应用上下文逻辑导致的组件不可聚焦
2. 应用上下文使用组件上逻辑导致的组件不可聚焦

# 三、物理上的不可聚焦
## 3.1 问题表述
物理上的不可以聚焦包含两种含义，第一种是由于组件本身不支持聚焦；第二种是其子组件支持聚焦而获取本属于它的焦点导致的不可以聚焦。
其中第一种是常见形式，但其解决起来也比较简单，只是直接设置为可以聚焦即可。第二种不及第一种常见，也归属于常见类型，处理起来也不太困难，选取一个不可以聚焦且点击不触发事件的子组件代替它本身即可。
## 3.2 实例
对于两种类型导致的物理上的不可聚焦，这里分别选取了两个实例来进行说明，并分别给出具体解决方案。
### 实例一 组件本身不支持聚焦
**问题描述：** 该组件是下图中红色边框标记的组件。在触摸屏项目中，该组件只是添加了一个监听器，使其点击时可以进行相应操作。但该组件调用hasFocusable()是返回false，即其本身是不支持聚焦的。故，当使用方向键操作时，会跳过该组件，聚焦到其趋势（可以是向下，也可以是向上）的下一个组件。

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/94ABFD325AC94EFB9D73275ED5CAD707/33178)

**解决方案：** 设置其可以聚焦即可。解决代码如下：

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/A89FF82715AD40649DC94186FE3560BB/33170)

### 实例二 子组件支持聚焦而获取本属于它的焦点导致的不可以聚焦
**问题描述：** 该组件是下图中红色边框标记的组件。在触摸屏项目中，该组件只是添加了一个监听器，使其点击时可以进行相应操作。该组件调用hasFocusable()是返回true，即其本身是支持聚焦的。但由于其子组件如蓝色边框标记的组件也支持聚焦，所以其会获取到本属于红色边框标记的组件的焦点，导致红色边框标记的组件不可以聚焦。

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/94ABFD325AC94EFB9D73275ED5CAD707/33178)

**解决方案：** 设置其某一个不可以聚焦且点击不触发事件的子组件来代替中红色边框标记的组件，为其添加监听器并处理触发的事件。在这里选取的是绿色框表示的组件。解决代码如下：

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/43CE40632A4C4FC6B50EBD6292CB920D/33180)

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/599BF0EE463E4B5C8FAB7255C1F5C648/33184)



# 四、逻辑上的不可聚焦
## 4.1 问题表述
逻辑上的不可聚焦是由于该组件上下文逻辑导致所要聚焦的组件不可以获取到焦点。其又可以分为多种，其又可以分为如下几种子类：

1. 应用上下文逻辑导致的组件不可聚焦
2. 应用上下文使用组件上逻辑导致的组件不可聚焦

这类问题比较复杂，它的引起因素也各种各样。

## 4.2 实例
在这里，选取了两种遇到的类型进行说明。
### 实例一  应用上下文逻辑导致的组件不可聚焦
**问题描述：** 当前聚焦到Password的输入框中，但点击方向下键，还是聚焦到Password的输入框，不能聚焦到Show password的选项框中。

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/599BF0EE463E4B5C8FAB7255C1F5C648/33184)

**故障原因：** 其是由于Password的输入框中指定了其方向下键是需要聚焦的下一个组件，是一个之前显示的Next Button。但由于在当前项目中，UI交互图删除了该组件，所以在UI上也使其不显示了。但点击方向下键时，系统会尝试继续聚焦Next Button，聚焦不到就会返回到当前的组件，也就是Password输入框，形成了一个闭环。其直接结果就是导致Show password的选项框不可以使用方向下键聚焦。

**解决方案：** 删除指定了其方向下键是需要聚焦的下一个组件的操作，提交代码如下

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/3592A61A34E04FDB9E50E113726BF301/33194)

### 实例二  应用上下文使用组件上逻辑导致的组件不可聚焦
**问题描述：** 在写邮件的界面，添加一个收件人后，点击方向上键不能重新聚焦到发件栏。如下图界面，点击方向上键时，还是聚焦到如下图光标的位置。

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/F95526B30E164C2FB380835CD1A0D4A8/33140)

**故障原因：** 分析该故障，发现其为该收件人所使用的组件本身逻辑其有一个Chip内容时，会一直消耗方向上键的事件。该组件是RecipientEditTextView组件的一个子类，而RecipientEditTextView是EditView的子类。在RecipientEditTextView中，重写了onSelectionChange方法，该方法在光标发生变化时调用。其重写的内容如下。如果RecipientEditTextView的光标不在首位，当按方向上键时，其会消耗方向上级的事件，并发光标位置置于首位。这时会触发onSelectionChange方法，其内部逻辑（如下图）会重新把光标置为最后一个Chip的结尾或者文本最后。也就是说如果光标本身就在最后一个Chip的结尾或者文本最后，那么按方向上键，其结果就是该组件消耗该事件，但UI上并不会变化。其也就导致了该实例的现象，不能聚焦到其上一个可聚焦组件中。

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/742B3D9166B445BD9AAF598C916CEEAC/33201)

**解决方案：** 重写onSelectionChange，并其内容为RecipientEditTextView的super.onSelectionChange.提交代码如下图

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/5060D02E8D904524A372CAE841C776D0/33207)

# 五、视觉上的不可聚焦
## 5.1 问题表述
视觉上的不可以聚焦并不是真正意义上的不可以聚焦，其是该组件可以被物理方向键聚焦，但UI上聚焦不聚焦表现一致导致用于以为不可以。该类问题是比较常见的类型，其解决方案也比较简单，就是在该组件上添加一个一个StateListDrawable对象的背景即可。
## 5.2 实例
**问题描述：** 当聚焦到下图中红色边框标记的组件时，其UI没有发生任何变化，测试疑问不可以聚焦。

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/355F81F446CC4B349B551D5093D6D0C7/33210)

**解决方案：** 添加一个ateListDrawable对象的背景，提交代码如下：

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/A5BC2EED538B4B278CE60695119292E4/33212)

![](https://note.youdao.com/yws/public/resource/f373c1e151652e56d0e8d18cd9d9aaa8/xmlnote/BA60602891324793B747B28CB1C65DF7/33214)




# 六、总结
关于按键机中组件的聚焦问题，物理上的不可聚焦和视觉上的不可聚焦都属于比较容易处理的问题。而逻辑上的不可以聚焦处理起来会较为耗时。这里的耗时并不是修改上的耗时，而是找原因过程中的耗时。实际上，找到原因就比较简单了。