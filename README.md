# fxleyu.github.io

这是我的[个人博客](https://fxleyu.github.io/)，记录技术学习、读书和生活。

## 基础组件

页面由项目自己的 Jekyll 模板、原生 CSS 和 JavaScript 组成。浏览器无需前端框架或第三方 JavaScript 运行时。静态资源使用 [esbuild](https://esbuild.github.io/) 编译和压缩，npm 只有这一个直接开发依赖。

- Node.js 22 或更高版本。
- esbuild 0.28.2（2026-09-08 向 npm 官方 registry 核实的最新稳定版本，确切依赖由 `package-lock.json` 锁定）。
- Jekyll 3.10 与 Bundler 2.4.22，保持当前 [GitHub Pages 默认构建版本](https://pages.github.com/versions/)兼容。

资源构建工具和内容引擎可以分别升级。当前 Jekyll 官方最新稳定版为 [4.4.1](https://jekyllrb.com/news/2025/01/29/jekyll-4-4-1-released/)，需要 Ruby 2.7 或更高版本，官方建议 Ruby 3.2+；迁移它应同时配置自定义 Pages 构建，不能仅修改 Gemfile 后继续假定线上默认构建会使用 Jekyll 4。本项目当前保留经过验证的 Jekyll 3.10 配置。

## 安装与运行

首次安装：

```sh
npm ci
gem install bundler -v 2.4.22 --no-document
bundle config set --local path vendor/bundle
bundle install
```

常用命令：

```sh
npm run build          # 编译 CSS / JS，然后生成完整 _site/
npm run build:assets   # 只编译 CSS / JS，修改前端时可单独运行
npm start              # 编译资源后启动 http://127.0.0.1:4000
npm run dev            # 同时监听 CSS / JS 和 Jekyll 内容变更
npm run check          # 验证构建行为，并核对提交的资源产物是否与源码一致
```

`npm start` 监听文章和模板变更；持续修改 CSS / JS 时使用 `npm run dev`。停止预览按 `Ctrl+C`，脚本会一并停止资源监听器、Jekyll 及其子进程。需要改端口可运行 `npm run dev -- --port 4001`。

## 目录与迭代方式

| 内容 | 路径 |
| --- | --- |
| 页面模板 | `_layouts/`、`_includes/` |
| 样式源码 | `assets/css/site.css` |
| 交互源码 | `assets/js/` |
| 提交的资源产物 | `assets/dist/` |
| 资源与站点构建脚本 | `scripts/assets.mjs`、`scripts/site.mjs` |
| 文章 | `_posts/` |
| 离线缓存入口 | `sw.js` |

修改源码后运行 `npm run build` 和 `npm run check`。`assets/dist/` 中的五个压缩资源与源码一同提交，兼容现有 GitHub Pages 构建；Pages 默认不会运行 npm。脚本只监听资源输入，输出内容未变时不重写文件，避免生成文件触发循环重建。`sw.js` 保持根路径，随 Jekyll 原样复制。

请保留文章 front matter、现有时区及 `permalink: pretty` 的地址语义，检查52篇历史文章和 `/page2/` 的链接兼容后再调整相关配置。构建目录 `_site/` 与本地依赖不会提交。

升级 esbuild 时先查询版本，再更新和验证：

```sh
npm view esbuild version
npm install --save-dev esbuild@latest
npm run build
npm run check
```

## macOS 自带 Ruby 的隔离安装

本次验证使用 Ruby 2.6.10。如果系统 gem 目录不可写，可将 Bundler 安装在项目目录，无需 `sudo` 或修改系统 Ruby：

```sh
export GEM_HOME="$PWD/.bundle/gems"
export GEM_PATH="$GEM_HOME"
export PATH="$GEM_HOME/bin:$PATH"
gem install bundler -v 2.4.22 --install-dir "$GEM_HOME" --no-document
bundle config set --local path vendor/bundle
bundle install
```

新终端重新执行前三行环境设置后即可构建。若 Ruby 2.6 编译 `eventmachine` 时提示缺少 `iostream`，可在已安装 Command Line Tools 的 macOS 上使用：

```sh
BUNDLE_BUILD__EVENTMACHINE="--with-cppflags=-I$(xcrun --show-sdk-path)/usr/include/c++/v1" bundle install
```

## 离线阅读

Service Worker 仅处理同源 GET 请求。在线时优先获取当前页面与资源，断网后读取本版本缓存；未访问过的文章显示离线提示页。修改页面外壳或预缓存资源时，同步更新 `sw.js` 的缓存版本及资源清单。新版本成功安装后才接管页面并清理旧版本缓存。
