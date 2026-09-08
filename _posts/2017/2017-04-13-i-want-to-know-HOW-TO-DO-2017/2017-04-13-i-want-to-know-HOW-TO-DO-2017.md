---
layout   : post
title    : "2017之这是如何做到的？"
date     : 2017-04-13 23:11:00
author   : fxleyu
tags:
    - 算法
---
> 有时候，我们很想知道，这是如何做到的。在这里，将记录一些突然想知道的一些问题。

# 两个文件差异化问题
时间：2017-04-13    
晚上，阅读《Pro Git》中文版，遇到了这句“如果想要看当前版本的文件和一个月前的版本之间有
何差异，Git 会取一个月前的快照和当前文件作一次**差异运算**，而不用请求远程服务器来做这
件事，或是把老版本的文件拉到本地来做比较。”。当时内心极其想搞明白如何实现这种文件间的**
差异运算**是如何实现的。这也导致了这篇博文的产生。     

### 零时解决方案
如果给我这个问题，让我来实现。我会如何做？

苦思冥想，想到了一个思路。    
前提：把文件中的行作为一个元素，这样文件就转换为字符串间的**差异化运算**了。    
具体内容：
```
INPUT: str1, str2

int i = j = 0
while i < str1.length || j < str2.length
    if str1[i] == str2[j]
        i++; j++
    else if str2[j+] contain str1[i] && str1[i+] is not contain str1[i]
        print ....
        j = str2.index(str1[i],j)
        i++
    else
        i++

if i < str1.lengt
    print ...
else if j < str2.length
    print ...
```
该思路还是有问题的，待进一步考虑

### 进一步的解决方案
对于字符串的**差异运算**。    
```
INPUT: str1, str2

init list
for item1, i ： str1
    for item2, j : str2
        if item == item2
            list.add(i,j)
// 这里的差异运算就转换求最长的子队列长度
// 要求队列中的任意元组，其元素均要大于排在其前面的元素大小
// list = [(1,2), (1,3), (1,4)]
init result
for (i,j) : list:
    if isUse (i,j) list
        result.add(i,j)

isUse (i,j) list
  next = (i+1, j+)
```
