---
layout   : post
title    : "在国内，如何登陆stackoverflow？"
date     : 2017-03-07 21:44:00
author   : fxleyu
tags:
    - 生活
---
## 背景
工作生活中，要查找的很多答案都来自于stackoverflow网址。在这种条件下，想注册一个账号，以方便记录自己喜欢的答案。由于公司不能安装翻墙软件，很遗憾不能登陆。

对这种情形分析了一下，是由于该stackoverflow使用了GOOGLE的js资源(googleapis.com)所致。

## 解决方案
查找网络资源（多处），找到了针对Firefox和Chrome的解决方案，其均是使用浏览器插件来解决这个问题。
### Firefox
[FIREFOX]给出了一种解决方案，就是安装**Decentraleyes**插件。安装该插件就可以正常注册登陆stackoverflow网站了。

### Chrome
[CHROME]给出了**Decentraleyes**的Chrome版本，也就是**Local CDN**。

由于国内不能访问GOOGLE，所以还需要利用第三方的服务来下载该插件。在这里我推荐一个网站，<http://chrome-extension-downloader.com/>。

## 参考
* **FIREFOX** http://blog.csdn.net/dream_an/article/details/50280977
* **CHROME**
http://www.ghacks.net/2017/02/15/local-cdn-for-chrome/


[FIREFOX]:http://blog.csdn.net/dream_an/article/details/50280977
[CHROME]:http://www.ghacks.net/2017/02/15/local-cdn-for-chrome/
