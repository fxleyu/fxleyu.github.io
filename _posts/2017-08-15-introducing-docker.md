---
layout   : post
title    : "学习Docker"
date     : 2017-08-15 23:21:00
author   : fxleyu
tags:
    - Docker
    - Java
---


```shell
$ sudo docker pull hello-world
Using default tag: latest
Error response from daemon: Get https://registry-1.docker.io/v2/library/hello-world/manifests/latest: Get https://auth.docker.io/token?scope=repository%3Alibrary%2Fhello-world%3Apull&servicegistry.docker.io: net/http: request canceled while waiting for connection (Client.Timeout exceeded while awaiting headers)

[OR]
Using default tag: latest
Pulling repository docker.io/library/hello-world
Get https://registry-1.docker.io/v1/repositories/library/hello-world/tags/latest: net/http: TLS handshake timeout

$ sudo docker pull hub.c.163.com/library/hello-world:latest
latest: Pulling from library/hello-world
7a9d05de7670: Pull complete
Digest: sha256:7391d42f476e10480a3da94f15233703f6c6abcd9b5165e390121f867039a6df
Status: Downloaded newer image for hub.c.163.com/library/hello-world:latest
```
