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

git commit -am
等同于
git add .
git commit -m

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

# 更改提交的操作
```
# git  reset 回溯历史版本
## 让仓库的HEAD、暂存区、当前工作树回溯到指定状态(使用哈希值)
git reset --hard fd0xxxxxxxxxxxxx

## 查看当前仓库执行过的操作的日志
git reflog

# 修改上一条提交信息
git commit --amend

# 压缩历史
## 压缩最近两次的提交记录
git rabase -i HEAD~2
```

# 与远程交互
```
# 添加远程仓库
git remote add origin git@github.com:fxleyu/git-tutorial.git

git push -u origin master

# 获取远程仓库
git clone git@github.com:fxleyu/git-tutorial.git

# 获取远程分支
git checkout -b feature-A origin/feature-A

```
