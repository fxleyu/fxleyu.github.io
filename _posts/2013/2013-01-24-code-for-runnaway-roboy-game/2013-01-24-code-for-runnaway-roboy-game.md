---
layout   : post
title    : "Runaway Robot游戏过关通用算法设计并java语言实现"
subtitle : "Runaway Robot Game，这个游戏在求学期间可是疯狂痴迷过的，哈哈......"
date     : 2013-01-24 13:28:00
author   : fxleyu
tags:
    - "Runaway Robot Game"
    - 程序设计
    - Java
---
## 介绍
这是一个游戏，感觉不错，加上有固定的套路去寻找答案，所以就决定用程序实现。    
这个小游戏的网址：http://www.hacker.org/runaway/index.php    
这个游戏是一个机器人在布满炸弹的地图（bigLayout）中寻找出路，出路是在雷区的边界（绿色区域）。但机器人（robot）记住的路途太少不可以记住从开始到安全区域的所有路径。robot会记住最小（min）的路径步数和最大（max）的路劲步数，但走完了记忆步骤，就开始循环记忆步骤。robot只会两种走法（向右和向下），开始时的图形为下图：    
![Game](http://img.my.csdn.net/uploads/201301/24/1359003793_3122.jpg)

## 算法设计
游戏<Runaway Robot>算法：
```
Input ：int min  //最小步数
        int max  //最大步数
        String info //布局
Output：int path[][] //可行路径

do getBigLayout
for min to max：
  for-each Dot，Dot为固定步骤一次循环到达的位置
    if dot可用：
      do getLayout
      do getLayoutUse
      do getLayoutCut
return：Layout

# getBigLayout1 把info代表的信息转化为地图
getLayout：
依据dot位置，建立layout布局
依据bigLayout，丰满layout布局 ，即把到到达dot位置的步骤循环走完bigLayout，经过区域的炸弹全部映射到layout中，其中炸弹区为 标记为red，null标记为null

getLayoutUse:
初始化layout起点为green
for-each layout.dot，由上至下，由左到右遍历layout
  if dot为green
    感染dot的右一或下一位置为null的为green
return layout

getLayoutCut：
初始化layout结束点（右下方的点）为robot2 for-each layout.dot，由下至上，由右到左遍历layout
if dot为robot
  感染dot的左一或上一位置为green为robot
return layout
```
## java算法实现
**注意**：0,green;1,red;2,null;3,robot;
```java
package runaway;  
public class Robot {  

    //主要算法实现  
    public int[][] go(String info,int min,int max){  
        int bigLayout[][]=getBigLayout(info);  
        int layout[][]=null;  
        for(int i=min;i<=max;i++){  
            for(int j=0;j<=i;j++){  
                int I=i-j+1;  
                int J=j+1;  
                layout=getLayout(bigLayout,I,J);  
                layout=layoutUse(layout);  
                layout=layoutCut(layout);  
                if(layout!=null)  
                    return layout;  
            }  
        }  
        return null;  
    }  

    //获取bigLayout  
    private int[][] getBigLayout(String info){  
        int n=(int)Math.sqrt((double)info.length());  
        int bigLayout[][] =new int[n+1][n+1];  
        for(int i=0;i<bigLayout.length;i++){  
            for(int j=0;j<bigLayout[0].length;j++){  
                bigLayout[i][j]=2;  
            }  
        }  
        int sum=0;  
        for(int i=0;i<n;i++){  
            for(int j=0;j<n;j++){  
                if(info.charAt(sum)=='X'){  
                    bigLayout[i][j]=1;  
                    sum++;  
                }else if(info.charAt(sum)=='.'){  
                    bigLayout[i][j]=2;  
                    sum++;  
                }else{  
                    System.out.println("error:getBigLayout");  
                    System.exit(0);  
                }  
            }  
        }  
        return bigLayout;  
    }  

    //获取layout  
    private int[][] getLayout(int[][] bigLayout, int i, int j) {  
        int layout[][]=new int[i][j];  
        for(int x=0;x<layout.length;x++){  
            for(int y=0;y<layout[0].length;y++){  
                layout[x][y]=2;  
            }  
        }  
        for(int m=0;m<bigLayout.length;m++){  
            for(int n=0;n<bigLayout[0].length;n++){  
                int M=m;  
                int N=n;  
                while(M>=(i-1) && N>=(j-1)){  
                    M=M-i+1;  
                    N=N-j+1;  
                }  
                if(M>=0 && M<i){  
                    if(N>=0 && N<j){  
                        if(bigLayout[m][n]==1){  
                            layout[M][N]=1;  
                        }else if(bigLayout[m][n]!=2){  
                            System.out.println("error:getLayout!!");  
                            System.exit(0);  
                        }  
                    }  
                }  
            }  
        }  
        return layout;  
    }  

    //获取layout，其中包括可行路径,可为null  
    private int[][] layoutUse(int[][] layout) {  
        if(layout[layout.length-1][layout[0].length-1]==1 || layout[0][0]==1)  
            return null;  
        if(layout[0][0]==2)  
            layout[0][0]=0;  
        else{  
            System.out.println("error:layoutUse01");  
            System.exit(0);  
        }  
        for(int i=0;i<layout.length;i++){  
            for(int j=0;j<layout[0].length;j++){  
                if(layout[i][j]==0){  
                    if((i+1)<layout.length && layout[i+1][j]==2){  
                        layout[i+1][j]=0;  
                    }  
                    if((j+1)<layout[0].length && layout[i][j+1]==2){  
                        layout[i][j+1]=0;  
                    }  
                }  
            }  
        }  

        return layout;  
    }  

    //获取layout，其中包括安全路径,可为null  
    private int[][] layoutCut(int[][] layout) {  
        if(layout==null)  
            return null;  
        if(layout[layout.length-1][layout[0].length-1]==0){  
            layout[layout.length-1][layout[0].length-1]=3;  
        }else{  
            return null;  
        }  
        for(int i=layout.length-1;i>=0;i--){  
            for(int j=layout[0].length-1;j>=0;j--){  
                if(layout[i][j]==3){  
                    if((i-1)>=0 && layout[i-1][j]==0){  
                        layout[i-1][j]=3;  
                    }  
                    if ((j-1)>=0 && layout[i][j-1]==0){  
                        layout[i][j-1]=3;  
                    }  
                }  
            }  
        }  
        return layout;  
    }  
}  
```
此后，我们要在可行路径中选一条输出。具体实现代码入下：
```java
package test;  
public class Look {  
    public void look(int matrix[][]){  
        int m=matrix.length;  
        int n=matrix[0].length;  
        int i=0;  
        int j=0;  
        while(j<=n&i<m){  
            if((j+1)<n && matrix[i][j+1]==3){  
                System.out.print("右 ");  
                j++;  
            }else{  
                i++;  
                if(i<m){  
                    System.out.print("下 ");  
                }     
            }  
        }  
    }  
}
```
## 运行测试
此后，我们要在可行路径中选一条输出。具体实现代码入下：
![input](http://img.my.csdn.net/uploads/201301/24/1359003988_2571.jpg)
其中灰色的`value`值后的值（本例为`FVterrainString=.....X..X...XX.XX.............X....XX...X.X.X.....X....X.X.......X
...X......X.....XXX.XX..X.........XXX......X....XX.....X.....X..X..X..X....X..X..XX.X.X..X.......X...XXX.XX...X...X.X.XX.XXXX.XX.X....X.X..XX..X...XX.............X.....X..XXX.XXX...XX..X..............X.X.....X.X....X.X.XXX.....X...........XX.X......X......XX..X.X..X..X....XX..X.X.XX...X...X.X...X.X.XX.XX..X..X.X..X..X......X..X..X....XX...X.X..............X...............X..X....XX..X..........X..X...X...X.X....XX...X......XX.....X...........X.XXXXX.......X..X..XXXX..X..........................X.X..X..X........X.....X..XX.X.X..X.XX..........XX.X..X.X......X.XX..XXX.XX.X.X.......X.X..........X........X.XX...XX....XX.X.XX..........XXXX....X...XXX.X.........X.X......X....X...............X.X.XXX..X..X.X..X.X...XX..XX.............X...........X......X.X.XX.....XX..X.....XXX....X.XX...XX...X.X.........X...............XX.....X......X...X.XXX.....XX.X.X.....X.....X....X............X.X....X....X......X..X.....XX..XX...................X....X......XX.........X.....X......X.X..XXXX.....XXX..........X.X.......X...........X.X.....X...........X.....X........X.........XX..XX.X...XX........X...X...XX.......X.XX....X...X....X........XX...XX............X.XX.X.....XX............XX..X......X.X..X......X.....X.X....X....X...XXXX.........X.XX.XXX.X......X.X.X...X........X.X.X........X...X.X..XX.X..X......X....X....X...X.......X..............X................X........X.......X.XX.XX...XXXX.X..X.XX.X..XX..X.X.........X...X.X...X...X.X..XX...XX........X.....XX...X..X..X.X....X...XX....XX....XX.X.X..XX...............X.....X...X....X.......X.......X..XX.X........XX...X..X..X..XX............X.X...X.XX...XX.....X..XX...X...............XX..XX.XX..X...X...X.......X........X.X.X...........X......X.....X.X......X....X.X..........X....X.......X............X.X......X.....X............XX..XX...X.X...XX......X.X...........X...X.X....X...X......XX....XX.X.XX.XXXX..X...........X...X.X......XX...XX.X...X.X....X.....X.X.XXX...XX..XXX....X...X...X.X.XX..XX.....X..XXXXXX.....X.XX...X.XX....XX.....X..X...XXX.....X.X.X.X..XX..X...X.XX.....X.............XX....X....X....X.X.......X..X.........X..XX......XXXXXX...X.........X...X....X...X.X.X..XX.XXX...XX.X.X.............X...XXX.........X.XXX.X........XX......X...XX..X.............XXX...XX.......X...........X.X..XX..X.....X...X.X...X........XX.XX...XXX..X.......X.X.X.....X....XXX.X.XX....X..XX.X.....X...X.....X.X...X.XX.X..X...XX.X....X.......X...XX...X......XX..X...X.....X......XXXX.X.....XX..X...X.........X.....X..X....XXX.....X........X..X..XX.XXX.....XX...........X........X...X.X..X..X.&FVinsMax=30&FVinsMin=18&FVboardX=51&FVboardY=51&FVlevel=96）`，“.”代表安全，"X"代表炸弹。其中`min`为`FVinsMin`，`max`为`FVinsMax`。这些就可以在运行软件中得知。    
现在编写运行代码如下：
```java
import java.util.Scanner;  
import runaway.Robot;  
import test.Look;  

public class Test {  

    public static void main(String[] args) {  
        String info;  
        int min;  
        int max;  
        while(true){  
            System.out.println("input::");  
            Scanner sc=new Scanner(System.in);  
            String value=sc.nextLine();  
            info=value.substring(value.indexOf("FVterrainString=")+16, value.indexOf("&FVinsMax="));  
            String Max=value.substring(value.indexOf("&FVinsMax=")+10, value.indexOf("&FVinsMin="));  
            String Min=value.substring(value.indexOf("&FVinsMin=")+10, value.indexOf("&FVboardX="));  
            min=Integer.valueOf(Min);  
            max=Integer.valueOf(Max);  
            Robot bo=new Robot();  
            int path[][]=bo.go(info,min,max);  
            if(path==null){  
                System.out.println("game over:null");  
            }  
            for(int [] x:path){  
                for(int y:x){  
                    System.out.print(y+"  ");  
                }  
                System.out.println("");  
            }  
            new Look().look(path);  
            System.out.println();  
        }  
    }  
}
```
运行上述代码，在input::后面输入在网页源码中获取的信息，并回车确认。这样既可以得到运行结果。如下图：
![out](http://img.my.csdn.net/uploads/201301/24/1359004754_2587.jpg)
根据运行结果，输入步骤的选择，最后就可以运行成功。输入并闯关成功的图片所示如下：     
![test](http://img.my.csdn.net/uploads/201301/24/1359005024_6196.jpg)

game over！！！

——fxleyu
20130115写于QQ空间
20130124在原有基础上增加`Look`类，实现结果的人性化显示。

### 后记
该文章是我写在CSDN上的，为了新建博客上填充写内容，整理到GitHub的Page中。此外，本文在原来的文章中做了简单的修改。

- 该文章的CDSN地址为：http://blog.csdn.net/fxleyu/article/details/8537721
- 该文章所说的文章地址为:http://www.hacker.org/runaway/index.php
