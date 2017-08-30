---
layout   : post
title    : "2017年中遇到的编程问题"
subtitle : "Runaway Robot Game，这个游戏在求学期间可是疯狂痴迷过的，哈哈......"
date     : 2017-08-30 10:37:00
author   : fxleyu
tags:
    - 编程问题
---

# `ListView` 中 `AdapterView.OnItemClickListener` 不会被回调
由于`ListView`中有`CheckBox`组件，一直以为是事件分发导致，最后发现`ListView`未注册监听器。对自己醉了。

关于`ListView`的子项中有`CheckBox`组件，只需要把`CheckBox`设置`android:focusable="false"`即可，为了更好的处理事件，也做了`android:clickable="false"`设置。
修改的代码如下：
```xml
    <CheckBox
        android:id="@+id/item_select_checkbox"
        android:layout_width="wrap_content"
        android:layout_height="52px"
        android:focusable="false"
        android:clickable="false"
        android:button="@drawable/btn_select"
        android:gravity="center_vertical"
        android:paddingRight="8px"
        android:layout_alignParentTop="true"
        android:layout_alignParentEnd="true" />
```
