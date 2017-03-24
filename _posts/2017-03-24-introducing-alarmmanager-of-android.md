---
layout   : post
title    : "学习Android的闹钟管理器"
date     : 2017-03-23 23:30:00
author   : fxleyu
tags:
    - Android
---
在工作中，接触到了闹钟管理器（'AlarmManager'）的问题。私以为需要把它搞明白，最基础也要知道如何使用。

# 一、介绍
闹钟管理器（'AlarmManager'）提供系统闹钟服务的接口。通过该接口，它允许你在未来的某个时间点来调度你的应用。下面引用Google的说明。
> This class provides access to the system alarm services. These allow you to schedule your application to be run at some point in the future. When an alarm goes off, the Intent that had been registered for it is broadcast by the system, automatically starting the target application if it is not already running. Registered alarms are retained while the device is asleep (and can optionally wake the device up if they go off during that time), but will be cleared if it is turned off and rebooted.

**NOTE**:注册的闹钟会在一下情况下被清空：1、在重启设备；2、该闹钟被关闭

此外，还需要注意一下情况。
> Note: Beginning with API 19 (KITKAT) alarm delivery is inexact: the OS will shift alarms in order to minimize wakeups and battery use. There are new APIs to support applications which need strict delivery guarantees; see setWindow(int, long, long, PendingIntent) and setExact(int, long, PendingIntent). Applications whose targetSdkVersion is earlier than API 19 will continue to see the previous behavior in which all alarms are delivered exactly when requested.

# 二、设置一个闹钟

使用闹钟管理器，需要做些什么工作？

1. 获取闹钟管理器实例
2. 设置一个闹钟（包含触发时间、以及触发事件（使用 `PendingIntent` ））
3. 处理触发事件的组件（可以是 Activity、BroadcastReceiver 或者 Service）

```java
// 获取闹钟管理器实例
AlarmManager alarmManager=(AlarmManager)mContext.getSystemService(Service.ALARM_SERVICE);
PendingIntent pi = PendingIntent.getBroadcast(mContext, requestCode, new Intent(mContext, TestReceiver.class), flag);
// 设置一个闹钟
alarmManager.set(AlarmManager.RTC_WAKEUP, triggerTimeAtMillis, pi);  
```

处理触发事件的组件使用的PendingIntent

```java
public static PendingIntent getActivities(Context context, int requestCode, Intent[] intents, int flags, Bundle options)
public static PendingIntent getActivities(Context context, int requestCode, Intent[] intents, int flags)
public static PendingIntent getActivity(Context context, int requestCode, Intent intent, int flags)
public static PendingIntent getActivity(Context context, int requestCode, Intent intent, int flags, Bundle options)
public static PendingIntent getBroadcast(Context context, int requestCode, Intent intent, int flags)
public static PendingIntent getService(Context context, int requestCode, Intent intent, int flags)
```

# 三、其他使用闹钟管理器的场景
在上部分只是一个简单的闹钟管理器使用场景，在这部分将介绍其他的使用场景。
## 3.1 设置重复闹钟

## 3.2 取消闹钟
```java
PendingIntent pi = this.getDistinctPendingIntent(intent, 2);
// Schedule the alarm!
AlarmManager am =
  (AlarmManager)
     this.mContext.getSystemService(Context.ALARM_SERVICE);
am.cancel(pi);
```
## 3.3 使用多个闹钟

# 四、闹钟管理器的注意事项
1. 闹钟和`PendingIntent`是一一对应的。一个无法用于多个闹钟。最后一个闹钟会覆盖前面的闹钟。所以可以使用`PendingItent`来终止闹钟。


# 五、小结

# 参考资料
