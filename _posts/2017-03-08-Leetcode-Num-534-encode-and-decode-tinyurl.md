---
layout   : post
title    : "【LeetCode】 #534 Lonely Pixel II"
date     : 2017-03-08 22:55:00
author   : fxleyu
tags:
    - LeetCode
    - Python
---
# Description
TinyURL is a URL shortening service where you enter a URL such as `https://leetcode.com/problems/design-tinyurl` and it returns a short URL such as `http://tinyurl.com/4e9iAk`.

Design the `encode` and `decode` methods for the TinyURL service. There is no restriction on how your encode/decode algorithm should work. You just need to ensure that a URL can be encoded to a tiny URL and the tiny URL can be decoded to the original URL.

## Python
- 下面是我提交的AC代码，运行时间是`152ms`

```python
import random

class Codec:
    STRING = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    map = {}

    def encode(self, longUrl):
        """Encodes a URL to a shortened URL.
        :type longUrl: str
        :rtype: str
        """
        tag = self.gen_tag()
        self.map[tag] = longUrl
        return "http://tinyurl.com/" + tag

    def gen_tag(self):
        tag = self.gen_random_str()
        while self.map.has_key(tag):
            tag = self.gen_random_str()
        return tag

    def gen_random_str(self):
        result = ""
        for i in xrange(6):
            result += self.STRING[random.randint(0,61)]
        return result

    def decode(self, shortUrl):
        """Decodes a shortened URL to its original URL.
        :type shortUrl: str
        :rtype: str
        """
        return self.map[shortUrl[-6:]]
```
