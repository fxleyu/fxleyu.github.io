---
layout   : post
title    : "Git学习笔记"
date     : 2017-04-13 23:11:00
author   : fxleyu
tags:
    - Git
---

# 一、基本操作
```
mkdir git-tutorial
cd git-tutorial
# 初始化仓库
git init

# 查看仓库状态
git status

# 向暂存区中添加文件
git add .


# 把暂存区的内容保存到历史仓库中
git commit -m "UPDATE"
git commit

# 查看日志
git log
git log --pretty=short
git log README.md
git log -p
git log -p README.md

# 查看修改前后的差别
## 查看工作数和暂存区的差别
git diff
## 查看工作树和仓库的差别
git diff HEAD
```
![pic_base](http://wx4.sinaimg.cn/mw690/5f4b7840ly1fetl98x8lcj20r70pvjtc.jpg)

# 分支的操作
```
# 查看分支一览表
git branch

# 创建、切换分支
git checkout -b branch-name
## 等同于
git branch branch-name
git checkout branch-name

# 切换分支
git checkout branch-name
## 切换到上一个分支
git checkout -

# 合并分支
git merge branch-name

git merge --no-ff branch-name

git log --graph
```
