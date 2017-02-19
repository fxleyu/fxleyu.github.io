---
layout   : post
title    : "我的恋爱算法"
date     : 2013-05-14 19:59:00
author   : fxleyu
tags:
    - 生活
    - 算法
---
感觉，恋爱好难啊，为此写出了我心中的恋爱算法，希望可以给予我和认同我观点的人以指导。
恋爱算法：
```
love(girl)  
        if I don't feel girl likes me  
            return false;  
        TIME = girlValue(girl);  
        while (time <= TIME)  
            state = myAction(girl);  
            if(isMyGirlFriend(girl))  
                return true;  
            switch (state)  
                case MAXLIKE    :   
                    return showTheLove(girl);  
                case LOVE       :  
                    if(showTheLove(girl))  
                        return true;  
                    else  
                        return showLove(newGirl);  
            TIME = girlValue(girl);  
        return false;  

    grilValue(girl)  
        value + = matchDreamGirl(girl);  
        value + = levelOfCencerningMe(girl);  
        value + = feedbackOfMyAction(girl);  
        value + = condition(girl);  
        return value;  

    myAction(gril)  
        //I take the actions  
        ....  
        return myState;  

    showTheLove(girl)  
        return the girl's feeling about my showing the love  

    matchDreamGirl(girl)  
        // fxyuer is my dream girl  
        return the level of girl matching fxyuer;  

    levelOfCencerningMe(girl)  
        return the level of girl cencerning me;  

    feedbackOfMyAction(girl)  
        return the girl's feedback of my action;  

    condition(girl)  
        //like different cities/different ideas/different attitudes/...  
        return the condition of girl;
```
这就是我的恋爱算法，由于实践原因，会有bug，希望各位可以提出意见。不甚感激！
——fxleyu

### 后记
该文章是我写在CSDN上的，为了新建博客上填充写内容，整理到GitHub的Page中。此外，本文在原来的文章中做了简单的修改。

看完这篇文章，感觉自己当时好幼稚啊。哈哈......
fxleyu @ xi'an
2017-02-19

- 该文章的CDSN地址为：http://blog.csdn.net/fxleyu/article/details/8927222
