# fxleyu.github.io

这是我的[个人博客](https://fxleyu.github.io/)，记录技术学习、读书和生活。

## 基础组件

页面由项目自己的 Jekyll 模板、原生 CSS 和 JavaScript 组成。浏览器无需前端框架或第三方 JavaScript 运行时。静态资源使用 [esbuild](https://esbuild.github.io/) 编译和压缩，npm 只有这一个直接开发依赖。

项目使用以下工具链，本地开发与 GitHub Actions 共用版本声明和锁文件：

| 组件 | 版本 | 版本来源 |
| --- | --- | --- |
| [Ruby](https://www.ruby-lang.org/en/downloads/) | 4.0.6 | `.ruby-version`，由 `Gemfile` 校验 |
| [Node.js](https://nodejs.org/en/about/previous-releases) | 26.8.1 | `.node-version` |
| [npm](https://www.npmjs.com/package/npm) | 12.0.2 | `package.json` 的 `packageManager` |
| [Bundler](https://rubygems.org/gems/bundler) | 4.0.20 | `Gemfile.lock` 的 `BUNDLED WITH` |
| [Jekyll](https://jekyllrb.com/docs/) | 4.4.1 | `Gemfile` 与 `Gemfile.lock` |
| [esbuild](https://github.com/evanw/esbuild/releases) | 0.28.2 | `package-lock.json` |

Liquid、Rouge 等间接依赖遵循 Jekyll 支持的版本范围，并由 `Gemfile.lock` 锁定。资源构建工具和内容引擎可以分别升级；升级时同步更新版本声明、锁文件及生成资源，并检查历史文章的渲染与地址。

站点通过自定义 GitHub Actions 构建并发布，以使用项目声明的 Jekyll 版本。[GitHub Pages 默认构建环境](https://pages.github.com/versions/)不会自动跟随 `Gemfile` 升级到 Jekyll 4。

## 安装与运行

先在项目目录启用 `.ruby-version` 和 `.node-version` 指定的版本。推荐使用已有的 Ruby／Node.js 版本管理器；例如已安装并初始化 `rbenv`（含 `ruby-build`）和 `nvm` 时：

```sh
rbenv install -s "$(cat .ruby-version)"
rbenv shell "$(cat .ruby-version)"
nvm install "$(cat .node-version)"
nvm use "$(cat .node-version)"
```

已通过其他版本管理器或独立安装启用相同版本，可直接继续。不要用 macOS 自带的 Ruby 2.6 运行本项目，也无需替换系统 Ruby 或使用 `sudo`。

在选定的 Ruby／Node.js 环境中安装项目依赖：

```sh
ruby --version
node --version
npm install --global npm@12.0.2
gem install bundler --version 4.0.20 --no-document
npm ci
bundle _4.0.20_ config set --local path vendor/bundle
bundle _4.0.20_ install
```

`npm` 和 Bundler 安装到当前版本管理器选择的运行时中，项目 Ruby 依赖安装到 `vendor/bundle/`。每次开启新终端后，先确认已启用对应的 Ruby 和 Node.js 版本，再运行项目命令。首次安装成功后保留锁文件，日常安装使用 `npm ci` 与 `bundle install`。

macOS 从源码安装 Ruby 时，如果原生依赖编译失败且 `ruby -rrbconfig -e 'puts RbConfig::CONFIG["CXX"]'` 输出 `false`，需要先修正 Ruby 的 C++ 编译器配置。已安装 Command Line Tools 的环境可在重新安装 Ruby 时指定 SDK 头文件：

```sh
CXX=clang++ CXXFLAGS="-isystem $(xcrun --show-sdk-path)/usr/include/c++/v1" rbenv install "$(cat .ruby-version)"
```

常用命令：

```sh
npm run build          # 编译 CSS / JS，然后生成完整 _site/
npm run build:assets   # 只编译 CSS / JS，修改前端时可单独运行
npm run build:posts    # 同步文章包中的配图到发布目录
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
| 文章与配图源文件 | `_posts/年份/日期-文章标识/` |
| 自动生成的文章配图 | `assets/posts/年份/日期-文章标识/images/` |
| 新文章与配图同步脚本 | `scripts/posts.mjs` |
| 离线缓存入口 | `sw.js` |

修改源码后运行 `npm run build` 和 `npm run check`。`assets/dist/` 中的五个压缩资源与源码一同提交；CI 会先校验这些产物与源码一致，再构建站点。脚本只监听资源输入，输出内容未变时不重写文件，避免生成文件触发循环重建。`sw.js` 保持根路径，随 Jekyll 原样复制。

请保留文章 front matter、现有时区及 `permalink: pretty` 的地址语义，检查52篇历史文章和 `/page2/` 的链接兼容后再调整相关配置。构建目录 `_site/` 与本地依赖不会提交。

## Apple 风格界面与阅读主题

全站采用以阅读为主的 Apple 风格：系统字体、蓝色操作色、浅灰内容分组，以及仅用于导航的半透明背景。没有新增主题或 UI 框架依赖。

`assets/css/reading.css` 定义色彩、字体和正文基础；`navigation.css` 提供导航行为布局；`apple.css` 定义首页与共享视觉；`interior.css` 定义文章、归档、搜索、个人信息及状态页面。样式统一由 `site.css` 导入并编译，日常修改这些源码即可。

文章目录在宽屏右侧随正文滚动，1280px 以下回到正文前方并默认折叠；没有有效章节标题时使用单栏。关闭 JavaScript 后仍能阅读完整正文、浏览归档和使用个人信息页签。

关于页职业时间线来自 `about.md` 开头的 `careers`，由 `_includes/career-timeline.html` 渲染。个人页分节使用 `markdown="1"`，保留显式标题 ID 以兼容已有章节链接；社交账号继续在 `_config.yml` 中配置。

首页展示三篇精选和最近八篇文章，完整时间线在归档页，历史 `/page2/` 地址继续可用。编辑 `_data/reading.yml` 的 `featured` 可更换精选文章及摘要；使用文章的发布 URL，避免按源文件日期猜测地址。

精选条目可用 `display_title` 和 `display_emphasis` 设置卡片标题与重点词；不设置时使用原文章标题。日期、文章数、年份范围和分页均从 Jekyll 数据生成。

`topics` 定义技术、阅读、生活三个主题：先匹配标签，再由明确的 `urls` 覆盖，未匹配文章归入技术。归档使用 `?topic=`，历史 `?tag=` 链接继续兼容。主题只是阅读入口，不修改文章原标签。

独立搜索页支持标题、标签及全文；结果展示命中片段并突出关键词。搜索索引由 Jekyll 生成，更新文章后重新构建即可。目录定位、代码复制、原图链接和响应式表格由原生 JavaScript 渐进增强。

## 写文章与管理配图

每篇文章拥有一个文件夹，按年份整理，文件夹使用原文章文件名（不含 `.md`），保留同日期文章原有的排序。Markdown 与 `images/` 一起移动、备份；共享头像等站点图片继续放在 `img/`：

```text
_posts/
  2020/
    2020-05-16-learn-clean-architecture/
      2020-05-16-learn-clean-architecture.md
      images/
        ca.png
```

创建文章（最后的日期可省略，默认本机当天）：

```sh
npm run new:post -- learning-java "学习 Java" 2026-09-08
```

在新文章的 `images/` 放入图片，Markdown 使用相对地址，编辑器可直接预览：

```md
![架构示意图](images/architecture.png)
```

唯一编辑源是 `_posts/` 中的文章包。`npm run build` 会把配图同步到 `assets/posts/`，`npm start` 和 `npm run dev` 会监听配图新增、修改及删除。输出内容未变不会重写，删除源图会清理对应产物；生成文件不要手工修改。`npm run check` 会检测未同步的图片。

Jekyll 原生递归读取 `_posts/` 子目录，配置中的 `_posts/**/images/**` 排除规则防止它把日期目录下的源图片误识别为文章。图片产物与 `assets/dist/` 一样随源码提交，由 CI 校验并随站点发布，无需自定义 Jekyll 插件。共享正文模板将相对图片地址转换为站点地址，RSS 使用完整绝对地址，支持 `baseurl`。四个历史 `/img/2019-05/`、`/img/2020-05/` 图片地址由脚本生成兼容副本，保留已订阅 RSS 和旧链接。

配图来源、文件 SHA-256 和待补外链见 [图片迁移记录](docs/image-migration.json)。

升级 esbuild 时先查询版本，再更新和验证：

```sh
npm view esbuild version
npm install --save-dev esbuild@latest
npm install-scripts approve esbuild
npm run build
npm run check
```

npm 12 使用 `allowScripts` 管理依赖安装脚本。本项目仅允许锁定版本的 esbuild 安装脚本；升级 esbuild 时同步更新该版本条目。

## 访问统计

访问数据在[百度统计](https://tongji.baidu.com/)查看。登录后选择「风雪乐雨的博客 / fxleyu.github.io」，站点编号为 `23517469`。该站点于 2026-09-10 重新创建，从新代码上线后开始累计，旧统计 ID 的历史数据不会自动迁入。

- 「网站概况 / 趋势分析」：浏览量（PV）、访客数（UV）及变化趋势。
- 「实时访客」：检查近期访问是否进入统计。
- 「全部来源」：搜索引擎、外部链接及直接访问。
- 「受访页面」：各篇文章的访问情况。

跟踪 ID 配置在 `_config.yml` 的 `baidu_analytics`，设置为空字符串可关闭统计。仅 `JEKYLL_ENV=production` 构建会输出统计代码，且浏览器域名必须与 `site.url` 一致；本地开发和本地预览不加载统计脚本。代码通过公共页头加载，每页一次。

部署后可在「使用设置 → 代码安装检查」检查首页。新代码的报告可能需要约 20 分钟更新，以百度统计后台提示为准。

## GitHub Pages 部署

工作流位于 [`.github/workflows/pages.yml`](.github/workflows/pages.yml)。仓库 **Settings → Pages → Build and deployment → Source** 应设为 **GitHub Actions**。

推送 `master`、向 `master` 发起 Pull Request 或手动运行工作流时，构建任务会：

1. 根据 `.node-version`、`.ruby-version` 和 `packageManager` 准备工具链，使用 `Gemfile.lock` 指定的 Bundler。
2. 执行 `npm ci`；Ruby 安装步骤通过 `bundler-cache` 按锁文件执行 `bundle install`。
3. 执行 `npm run check`，检查行为测试、压缩资源与文章配图是否同步。
4. 在 `JEKYLL_ENV=production` 下执行 `npm run build`，生成 `_site/`。
5. 对 `master` 的非 Pull Request 运行上传 `_site/`，由依赖构建任务的部署任务发布到 GitHub Pages。

Pull Request 只验证构建，不发布。`_site/` 作为 Actions 产物上传，不提交到仓库；`assets/dist/` 和生成的文章配图仍需提交。修改前端或升级 esbuild 后，先在本地重新生成产物，再提交源码和产物，避免 CI 在校验阶段因资源不同步而失败。部署状态可在仓库 Actions 的 **Build and deploy Pages** 运行记录与 `github-pages` 环境中查看。

## 离线阅读

Service Worker 仅处理同源 GET 请求。在线时优先获取当前页面与资源，断网后读取本版本缓存；未访问过的文章显示离线提示页。修改页面外壳或预缓存资源时，同步更新 `sw.js` 的缓存版本及资源清单。新版本成功安装后才接管页面并清理旧版本缓存。
