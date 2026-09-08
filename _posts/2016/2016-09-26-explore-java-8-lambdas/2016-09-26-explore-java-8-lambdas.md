---
layout   : post
title    : "初探Java 8函数式编程"
date     : 2016-09-26 13:59:00
author   : fxleyu
tags:
    - Java
---
# 初探Java 8函数式编程

### 摘要：
Android N中使用OpenJDK 8.0环境，也就是说在Android N中支持以Lambda表达式为代表的函数式编程。
在Java 8提供的函数式编程接口中，其主要是在集合内部添加了对函数式编程的支持。

## 关键词：Java Lambdas

## 1、函数式编程含义
函数式编程是一种编程范式。函数式编程属于“结构化编程”的一种，主要思想是运算过程尽量写成一系列嵌套的函数调用。
面向对象编程时对数据进行抽象，而函数式编程是对行为进行抽象，

函数式编程的基本特点：
- 1. 支持高阶函数    
高阶函数是指接收另外一个函数作为参数，或者返回一个函数的函数。高阶函数不难辨认：看函数签名就够了。如果函数的参数列表里包含函数接口，或该函数返回一个函数接口，那么该函数就是高阶函数。
- 2. 支持惰性计算    
惰性计算有两个相关而又有区别的含意，可以表示为“延迟计算”和“短路求值”。这里是“延迟求值”的意思。在使用延迟求值的时候，表达式不在它被绑定到变量之后就立即求值，而是在该值被取用的时候求值。
- 3. 使用递归作为控制流的机制
- 4. 加强引用透明性    
函数程序通常还加强 引用透明性，即如果提供同样的输入，那么函数总是返回同样的结果。
- 5. 没有副作用
副作用是修改系统状态的语言结构。

## 2、Java 8中的体现
对于Java 8中的函数式编程，其重要体现在集合运算中。现在主要在集合的api中体现Java 8对函数式编程的支持。
(本章节均参考来自于Java SE 8 doc)这部分内容主要包含在java.util.function 和 java.util.stream 两个包下。
### 2.0 Lambda表达式
Lambda 表达式——一种紧凑的、传递行为的方式。

``` java
    Comparator<String> comparator1 = new Comparator<String>() {
        @Override
        public int compare(String str1, String str2) {
            return str1.compareTo(str2);
        }
    };
    Comparator<String> comparator12 = (str1, str2) -> str1.compareTo(str2);
```

### 2.1、支持惰性计算

```java
int sum = widgets.stream()
        .filter(w -> w.getColor() == RED)
        .mapToInt(w -> w.getWeight())
        .sum();
```

> To perform a computation, stream operations are composed into a stream pipeline. A stream pipeline consists of a source (which might be an array, a collection, a generator function, an I/O channel, etc), zero or more intermediate operations (which transform a stream into another stream, such as filter(Predicate)), and a terminal operation (which produces a result or side-effect, such as count() or forEach(Consumer)). **Streams are lazy; computation on the source data is only performed when the terminal operation is initiated, and source elements are consumed only as needed.**


上述函数表达式是没有计算的

### 2.2、加强引用透明性、没有副作用
> Most stream operations accept parameters that describe user-specified behavior, such as the lambda expression w -> w.getWeight() passed to mapToInt in the example above. To preserve correct behavior, these behavioral parameters:
> - must be non-interfering (they do not modify the stream source);and
> - in most cases must be stateless (their result should not depend on any state that might change during execution of the stream pipeline).

```java
// 这里就满足上述两条
w -> w.getColor() == RED

// 这里不满足第一条
// w -> w.setColor(BLUE)

// 这里不满足第二条 
// mColor是一个全局变量
// w -> w.getColor() == mColor
```
## 3、实例
在第三部分，尝试把一段维护的自研Email的一段逻辑代码使用Java 8提供的函数式编程接口来实现。

### 3.1、自研Email中的代码

### 3.2、该段代码的功能

该段代码是从providers.xml读取数据，得到一个存储Provider对象的List中。
然后把这个List依据一定规则排序，此后获取List存储对象Provider的domain属性组成一个新的List。

其中排序规则是，“fr”结尾的域名排在最前方，其次是“com”结尾的域名，最后是其余部分。而在“fr”或者“com”结尾的域名中，按字母顺序排序。

### 3.3、Java 8函数式接口实现

对上述业务逻辑使用Java 8函数接口进行实现，具体代码如下：
```java
    private static Comparator<String> customizeComparator = (str1, str2) -> {
        if (str1.endsWith("fr") ^ str2.endsWith("fr")) {
            return str1.endsWith("fr") ? -1 : 1;
        }
        if (str1.endsWith("com") ^ str2.endsWith("com")) {
            return str1.endsWith("com") ? -1 : 1;
        }
        return str1.compareTo(str2);
    };

    public static List<String> getAllProviderDomain() {
        List<Provider> providerList = getAllProvider();
        return providerList.stream()
                .filter((provider) -> !provider.domain.contains("("))
                .map((provider) -> provider.domain)
                .sorted(customizeComparator)
                .collect(Collectors.toList());
    }
```

上述代码可以被编译运行，其中测试代码可以在https://github.com/fxleyu/CodeWorkshop/tree/master/src/fx/leyu/j8test中找到。

## 4、结束语

本文只是对函数式编程进行一个简要的介绍。



### 参考：
- http://docs.oracle.com/javase/8/docs/api/    
- http://www.ibm.com/developerworks/cn/java/j-fp/
