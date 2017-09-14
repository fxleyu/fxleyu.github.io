---
layout   : post
title    : "2017年中遇到的编程问题"
subtitle : "编程中踩的各种坑，记录之，用来警示后人和追踪问题。"
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

# [Android] 自定义`Notification`导致的`RemoteServiceException`
该问题是由于在`RemoteViews`布局文件中使用`View`组件导致，解决文档[remote_views_error]。    
`RemoteViews`是不支持`View`的。    
故障异常信息如下：
```java
09-14 10:01:42.788: E/AndroidRuntime(453): FATAL EXCEPTION: main
09-14 10:01:42.788: E/AndroidRuntime(453): Process: com.android.ztemms, PID: 453
09-14 10:01:42.788: E/AndroidRuntime(453): android.app.RemoteServiceException: Bad notification posted from package com.android.ztemms: Couldn't expand RemoteViews for: StatusBarNotification(pkg=com.android.ztemms user=UserHandle{0} id=2147483647 tag=null score=0 key=0|com.android.ztemms|2147483647|null|10009: Notification(pri=0 contentView=com.android.ztemms/0x1090079 vibrate=null sound=null defaults=0x0 flags=0x0 color=0x00000000 category=msg vis=PRIVATE))
09-14 10:01:42.788: E/AndroidRuntime(453): 	at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1466)
09-14 10:01:42.788: E/AndroidRuntime(453): 	at android.os.Handler.dispatchMessage(Handler.java:102)
09-14 10:01:42.788: E/AndroidRuntime(453): 	at android.os.Looper.loop(Looper.java:153)
09-14 10:01:42.788: E/AndroidRuntime(453): 	at android.app.ActivityThread.main(ActivityThread.java:5254)
09-14 10:01:42.788: E/AndroidRuntime(453): 	at java.lang.reflect.Method.invoke(Native Method)
09-14 10:01:42.788: E/AndroidRuntime(453): 	at java.lang.reflect.Method.invoke(Method.java:372)
09-14 10:01:42.788: E/AndroidRuntime(453): 	at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:902)
09-14 10:01:42.788: E/AndroidRuntime(453): 	at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:697)

09-14 10:10:36.598: E/StatusBar(4482): couldn't inflate view for notification com.android.ztemms/0x3039
09-14 10:10:36.598: E/StatusBar(4482): android.view.InflateException: Binary XML file line #71: Error inflating class android.view.View
09-14 10:10:36.598: E/StatusBar(4482): 	at android.view.LayoutInflater.createView(LayoutInflater.java:633)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.view.LayoutInflater.onCreateView(LayoutInflater.java:665)
09-14 10:10:36.598: E/StatusBar(4482): 	at com.android.internal.policy.impl.PhoneLayoutInflater.onCreateView(PhoneLayoutInflater.java:65)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.view.LayoutInflater.onCreateView(LayoutInflater.java:682)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.view.LayoutInflater.createViewFromTag(LayoutInflater.java:741)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.view.LayoutInflater.rInflate(LayoutInflater.java:806)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.view.LayoutInflater.inflate(LayoutInflater.java:504)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.view.LayoutInflater.inflate(LayoutInflater.java:414)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.widget.RemoteViews.apply(RemoteViews.java:2615)
09-14 10:10:36.598: E/StatusBar(4482): 	at com.android.systemui.statusbar.BaseStatusBar.inflateViews(BaseStatusBar.java:1429)
09-14 10:10:36.598: E/StatusBar(4482): 	at com.android.systemui.statusbar.BaseStatusBar.inflateViews(BaseStatusBar.java:1340)
09-14 10:10:36.598: E/StatusBar(4482): 	at com.android.systemui.statusbar.BaseStatusBar.createNotificationViews(BaseStatusBar.java:1817)
09-14 10:10:36.598: E/StatusBar(4482): 	at com.android.systemui.statusbar.phone.PhoneStatusBar.addNotification(PhoneStatusBar.java:1622)
09-14 10:10:36.598: E/StatusBar(4482): 	at com.android.systemui.statusbar.BaseStatusBar$5$2.run(BaseStatusBar.java:457)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.os.Handler.handleCallback(Handler.java:743)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.os.Handler.dispatchMessage(Handler.java:95)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.os.Looper.loop(Looper.java:153)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.app.ActivityThread.main(ActivityThread.java:5254)
09-14 10:10:36.598: E/StatusBar(4482): 	at java.lang.reflect.Method.invoke(Native Method)
09-14 10:10:36.598: E/StatusBar(4482): 	at java.lang.reflect.Method.invoke(Method.java:372)
09-14 10:10:36.598: E/StatusBar(4482): 	at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:902)
09-14 10:10:36.598: E/StatusBar(4482): 	at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:697)
09-14 10:10:36.598: E/StatusBar(4482): Caused by: android.view.InflateException: Binary XML file line #71: Class not allowed to be inflated android.view.View
09-14 10:10:36.598: E/StatusBar(4482): 	at android.view.LayoutInflater.failNotAllowed(LayoutInflater.java:647)
09-14 10:10:36.598: E/StatusBar(4482): 	at android.view.LayoutInflater.createView(LayoutInflater.java:595)
09-14 10:10:36.598: E/StatusBar(4482): 	... 21 more
```




[remote_views_error]:(https://developer.android.google.cn/guide/topics/appwidgets/index.html#CreatingLayout)
