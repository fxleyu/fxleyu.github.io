---
layout   : post
title    : "2017年中遇到的工具问题"
subtitle : "在使用电脑或者其他工具软件时，会遇到一些不可期待的现象，这里记下了它们"
date     : 2017-09-06 10:15:00
author   : fxleyu
tags:
    - 编程问题
---

# SVN操作时，遇到“由于系统缓冲区空间不足或队列已满，不能执行套接字上的操作”提示错误
依据[SVN_ERROR]，查看了电脑socket端口使用情况，发现某一进程大量持有连接，手动杀了该进程，可以正常使用SVN了。
```bat
NETSTAT -ano
```

# 使用`adb install -r`重新安装应用时，报`[INSTALL_FAILED_MISSING_SHARED_LIBRARY]`错误
这是由于在 AndroidManifest.xml 文件中，使用了`uses-library`属性导致，可以移除该属性或者设置其为false。
如下[MISSING_LIBRARY][USES_LIBRARY]：
```xml
<uses-library
        android:name="com.xxx.xx.xxx"
        android:required="false"/>
```



[SVN_ERROR](http://www.cnblogs.com/TeyGao/p/3539279.html)    
[MISSING_LIBRARY](https://stackoverflow.com/questions/5375919/getting-error-msg-install-failed-missing-shared-library)    
[USES_LIBRARY](https://developer.android.google.cn/guide/topics/manifest/uses-library-element.html)    
