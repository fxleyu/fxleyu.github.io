---
layout   : post
title    : "办公室中打水故事"
date     : 2013-12-21 12:09:00
author   : fxleyu
tags:
    - 生活
    - java
---
交代下故事背景，办公室中有个电热水壶，办公室内的人员公用。其中还有个潜规则，就是若谁在接水是发现电热水壶中没有水（就是自己的杯子没有接满），他/她就负责给电热水壶注满水。    
故事是，一段时间，本人喝水不多，但连续多次去接水喝，都是没有接满杯子就没水了。本人开始吐槽自己的运气和人品，但小师弟就说这事因为我的杯子原因。为此，我们争论了好几次。个人语言表达能力有限，知道这是个常识性问题，还是未能说服他。    

昨夜在床上看书，突发奇想，用事实说服吧。既然是学计算机的，那就把情况模拟一下好了。    
```
算法：  
  初始化人员各种参数（杯子大小，打水概率）
  产生打水序列
  依据水壶大小，进行切割（就是确定打水人员）
  对切割结果进行统计
  打印
```
Java实现如下
```java
public class Test {  

    private int[] container;  
    private int length;  
    private int members[] = {3,4,5,6};  
    private static int sum[] = new int[4];  

    public Test(int c, int l){  
        container = new int[c];  
        length = l;  
    }  


    public static void main(String[] args){  
        Test t = new Test(10000000, 60);  
        t.init();  
        t.statistics();  
        t.print();  
    }  

    private void print() {  
        for(int s: sum){  
            System.out.println(s);  
        }  
    }  

    private void statistics() {  
        for(int index=0; index*length < container.length; index++){  
            sum[container[index*length]]++;  
        }  
    }  


    public void init(){  
        int index = 0;  
        while(index < container.length){  
            int member = getMember();  
            int size = members[member];  
            if(index + size < container.length){  
                for(int i=0; i < size; i++){  
                    container[index + i] = member;  
                }  
                index += size;  
            }else{  
                for(; index < container.length; index++){  
                    container[index] = member;  
                }  
            }  
        }  
    }  

    private int getMember() {  
        int x = new Double(57*Math.random()).intValue();  
        if(x < 20){  
            return 0;  
        } else if( x < 35){  
            return 1;  
        }else if( x < 47){  
            return 2;  
        }else{  
            return 3;  
        }  
    }  
}  
```
其中原始设置如下：
四个人，杯子大小一次容量为3,4,5,6

java类可以直接调节电热水壶的容量，和实验次数

其中，如果试验次数较少，会影响结果

最后给出上述代码运行一次的结果：
```
41590
41842
41553
41682
```
（注意：由于其中运用了随机函数，两次的运行结果一般不会一样，但大的差距不会很大。哦，很大概率上，你可以近似理解为永不）

含义为：
- 杯子容量为3的人给壶注入水的次数为：41590
- 杯子容量为4的人给壶注入水的次数为：41842
- 杯子容量为5的人给壶注入水的次数为：41553
- 杯子容量为6的人给壶注入水的次数为：41682

上述结果我们可以说明，给壶接水的次数或则概率与接水人杯子的大小无关

### 后记
该文章是我写在CSDN上的，为了新建博客上填充写内容，整理到GitHub的Page中。此外，本文在原来的文章中做了简单的修改。

- 该文章的CDSN地址为：http://blog.csdn.net/fxleyu/article/details/17463733
