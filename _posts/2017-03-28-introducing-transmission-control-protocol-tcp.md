---
layout   : post
title    : "也谈谈TCP"
date     : 2017-03-28 19:28:00
author   : fxleyu
tags:
    - 计算机网络
---
TCP 是一种重要的协议，其基于网络层协议（例如 IP），为应用层协议（例如HTTP、SMTP等）提供服务。在这里，将简要、较全面的记录一些TCP这种协议。

# 一、概述
TCP，Transmission Control Protocol，其中文全称是传输控制协议。该协议为应用层协议提供一种面向连接的、可靠的服务。

在这里，本文将介绍 TCP 中的基本概念、其数据结构、其连接过程以及其特点。

# 二、基本概念

应用层协议把数据交由 TCP 来进行网络间的传送，TCP 会把数据分割为大小不一的块，具体依据当前情景。这个数据块也就是 TCP 保持追踪的独立的数据传输单元，也被称为报文段（segment）。

为了跟踪应用层协议交于的数据，TCP 协议会把数据的每一个字节进行编号，该编号被称为字节号。该编号的起始数字并不一定从0开始，而是在[0, (2^32)-1]中间选择一个作为数据的第一个字节号。

在通常情况下，把报文段中的第一个字节号称为序号（Sequence number，Seq）。而把期待对方传送的下一个字节号称为确认号（Acknowledgment number ，Ack）。

接收窗口是对方发送的包含确认的报文段中所给出的值。   
拥塞窗口是由网络为了避免拥塞而确定的值。

为了平滑的完成TCP的操作，大多数的TCP实现必须完成如下四种计时器：
- 重传计时器
- 持久计时器
- 保活计时器
- 时间等待计时器

# 三、数据结构
![tcp](http://wx4.sinaimg.cn/mw1024/5f4b7840ly1fe2y9q0qglj20x70d9ab2.jpg)

- 来源连接端口（16位长）－辨识发送连接端口
- 目的连接端口（16位长）－辨识接收连接端口
- 序列号（seq，32位长）
  - 如果含有同步化旗标（SYN），则此为最初的序列号；第一个数据比特的序列码为本序列号加一。
  - 如果没有同步化旗标（SYN），则此为第一个数据比特的序列码。
- 确认号（ack，32位长）—期望收到的数据的开始序列号。也即已经收到的数据的字节长度加1。
- 报头长度（4位长）—以4字节为单位计算出的数据段开始地址的偏移值。
- 保留—须置0
- 标志符
  - URG—为1表示高优先级数据包，紧急指针字段有效。
  - ACK—为1表示确认号字段有效
  - PSH—为1表示是带有PUSH标志的数据，指示接收方应该尽快将这个报文段交给应用层而不用等待缓冲区装满。
  - RST—为1表示出现严重差错。可能需要重现创建TCP连接。还可以用于拒绝非法的报文段和拒绝连接请求。
  - SYN—为1表示这是连接请求或是连接接受请求，用于创建连接和使顺序号同步
  - FIN—为1表示发送方没有数据要传输了，要求释放连接。
- 窗口（WIN，16位长）—表示从确认号开始，本报文的源方可以接收的字节数，即源方接收窗口大小。用于流量控制。
- 校验和（Checksum，16位长）—对整个的TCP报文段，包括TCP头部和TCP数据，以16位字进行计算所得。这是一个强制性的字段。
- 紧急指针（16位长）—本报文段中的紧急数据的最后一个字节的序号。
- 选项字段—最多40字节。每个选项的开始是1字节的kind字段，说明选项的类型。
  - 0：选项表结束（1字节）
  - 1：无操作（1字节）用于选项字段之间的字边界对齐。
  - 2：最大报文段长度（4字节，Maximum Segment Size，MSS）通常在创建连接而设置SYN标志的数据包中指明这个选项，指明本端所能接收的最大长度的报文段。通常将MSS设置为（MTU-40）字节，携带TCP报文段的IP数据报的长度就不会超过MTU，从而避免本机发生IP分片。只能出现在同步报文段中，否则将被忽略。
  - 3：窗口扩大因子（4字节，wscale），取值0-14。用来把TCP的窗口的值左移的位数。只能出现在同步报文段中，否则将被忽略。这是因为现在的TCP接收数据缓冲区（接收窗口）的长度通常大于65535字节。
  - 4：sackOK—发送端支持并同意使用SACK选项。
  - 5：SACK实际工作的选项。
  - 8：时间戳（10字节，TCP Timestamps Option，TSopt）
    - 发送端的时间戳（Timestamp Value field，TSval，4字节）
    - 时间戳回显应答（Timestamp Echo Reply field，TSecr，4字节）

# 四、TCP连接
## 4.1 连接建立
TCP 的连接过程被称为 三向握手（three-way handshake），其结构如下：
![three-way-handshake](http://wx4.sinaimg.cn/mw1024/5f4b7840ly1fe2xqqeaogj20wa03baa7.jpg)

- SYN 报文段不携带任何数据，但是它消耗一个序列号。
- SYN+ACK 报文段不屑但任何数据，但其同样消耗一个序列号。
- ACK 报文段如果不携带任何数据，其不消耗序列号。

## 4.2 数据传送

- 推送数据
- 紧急数据

传输数据时，其必须设置推送位（PSH）

## 4.3 连接终止

## 4.4 连接复位
- 拒绝连接请求
- 异常终止连接
- 终止空闲连接

## 4.5 状态转换图
由于需要清楚地掌握在连接建立、连接终止以及数据传送时所发生的所有不同事件，TCP 软件是以有限状态机的形式来实现的。现在给出了状态间转换的图：   
![Tcp_state_diagram](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tcp_state_diagram_fixed_new.svg/1084px-Tcp_state_diagram_fixed_new.svg.png)

**状态编码**    
下表为TCP状态码列表，以S指代服务器，C指代客户端，S&C表示两者，S/C表示两者之一：    
- LISTEN S    
等待从任意远程TCP端口的连接请求。侦听状态。
- SYN-SENT C    
在发送连接请求后等待匹配的连接请求。通过connect()函数向服务器发出一个同步（SYNC）信号后进入此状态。
- SYN-RECEIVED S    
已经收到并发送同步（SYNC）信号之后等待确认（ACK）请求。
- ESTABLISHED S&C    
连接已经打开，收到的数据可以发送给用户。数据传输步骤的正常情况。此时连接两端是平等的。
- FIN-WAIT-1 S&C    
主动关闭端调用close（）函数发出FIN请求包，表示本方的数据发送全部结束，等待TCP连接另一端的确认包或FIN请求包。
- FIN-WAIT-2 S&C    
主动关闭端在FIN-WAIT-1状态下收到确认包，进入等待远程TCP的连接终止请求的半关闭状态。这时可以接收数据，但不再发送数据。
- CLOSE-WAIT S&C    
被动关闭端接到FIN后，就发出ACK以回应FIN请求，并进入等待本地用户的连接终止请求的半关闭状态。这时可以发送数据，但不再接收数据。
- CLOSING S&C    
在发出FIN后，又收到对方发来的FIN后，进入等待对方对连接终止（FIN）的确认（ACK）的状态。少见。
- LAST-ACK S&C    
被动关闭端全部数据发送完成之后，向主动关闭端发送FIN，进入等待确认包的状态。
- TIME-WAIT S/C    
主动关闭端接收到FIN后，就发送ACK包，等待足够时间以确保被动关闭端收到了终止请求的确认包。【按照RFC 793，一个连接可以在TIME-WAIT保证最大四分钟，即最大分段寿命（maximum segment lifetime）的2倍】
- CLOSED S&C    
完全没有连接。


# 五、TCP独特性
## 5.1 流量控制
**流量控制** 对源点在收到从终点发来的确认之前可以发送的数据量进行管制。

TCP在缓存（用来暂时存放从应用程序传递来并准备发送的数据）上定义一个窗口。TCP 发送数据的多少由这个窗口协议定义。

为了完成流量控制，TCP 使用**滑动窗口协议**。

窗口可以展开、合拢或缩回。这三种活动受接收方而不是发送方控制，同时也却决于网络中的拥塞情况。展开窗口表示窗口右沿向右移动，也就是允许从缓存中发送更多新的字节；合拢窗口表示窗口左沿向右移，也就是表示某些字节被确认；缩回窗口表示窗口右沿向左移，这是非常不希望出现的情况。

> 滑动窗口用来使传输更加有效，同时也用来控制数据的流动，使得终点不至于因数据过量而瘫痪。TCP 的滑动窗口使面向字节的。

窗口大小取决于两个值的最小值：接收窗口（rwnd）和拥塞窗口（cwnd）。`wnd = min(rwnd,cwnd)`

为了保证不会出现窗口缩回，必须保证
> 新的ack + 新的rwnd >= 上一个ack + 上一个rwnd

> 为了避免缩回发送端窗口，接收端必须等待，直到在缓存中由更多的空间可以使用。

接收端可以用发送 rwnd 为0的报文段来暂时关闭窗口。（窗口关闭）

关于TCP滑动窗口的一些要点：
- 窗口大小是 rwnd 和 cwnd 中的较小的一个。
- 源点并非必须要发送整个窗口大小的数据。
- 接收端可以使窗口展开或合拢，但不应使它缩回。
- 终点可以在任何时刻发送确认，只要这不会引起窗口的缩回。
- 接收端可以暂时关闭窗口；但发送端永远可以在窗口关闭后发送一个字节的报文段（为了探测probing，用于防止死锁）

糊涂窗口综合症；    
在滑动窗口的操作中可能出现一个严重的问题，这就是发送应用程序产生数据很慢，或者接收应用消耗数据很慢，或者两者都有。不管是上述情况的哪一种，都使发送数据的报文端很小，这就引起操作效率的降低。因为每一个报文段至少由40字节的消耗（20字节的IP首部，20字节的TCP首部）。该问题称为糊涂窗口综合症。

为了解决发送端的问题，出现了Nagle算法，该算法是一种 TCP 协议的优化。
> A TCP/IP optimization called the Nagle Algorithm can also limit data transfer speed on a connection. The Nagle Algorithm is designed to reduce protocol overhead for applications that send small amounts of data, such as Telnet, which sends a single character at a time. Rather than immediately send a packet with lots of header and little data, the stack waits for more data from the application, or an acknowledgment, before proceeding.

其算法具体描述如下：
```
if there is new data to send
  if the window size >= MSS and available data is >= MSS
    send complete MSS segment now
  else
    if there is unconfirmed data still in the pipe
      enqueue data in the buffer until an acknowledge is received
    else
      send data immediately
    end if
  end if
end if
```
其有满足：网络上由传送的数据（ack也算），或者当前没有数据

为了解决接收端的问题：
- **Clark解决方案** 在数据到达就发送确认，但在缓存以及由足够大的空间放入最大长度的报文段之前，或者缓存空间的一半以及变空之前，一直都宣布窗口值为零
- **推迟确认** 当报文段到达时并不立即发送确认。优点：减少通信量；缺点：可能导致重发。

这些方法都可以防止发送端窗口展开，防止多余数据传送。

## 5.2 差错检测
## 5.3 拥塞控制
# 六、总结

# 参考资料
- [1] [书籍] TCP/IP 协议族（第三版）
- [2] [网址] https://en.wikipedia.org/wiki/Transmission_Control_Protocol
- [3] [网址] https://zh.wikipedia.org/wiki/传输控制协议
