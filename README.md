# EasyImport.js


## 【项目概览】

**EasyImport.js** 能给 传统网页、**单页应用** 提供有力的**脚本异步加载、响应式适配、资源延迟加载**支持，并且拥有这一切的过程也很平滑、自然 ——

 1. 脚本加载**顺序即依赖** —— 沿用 **HTML 编程思维习惯**，替代 `<script />` 加载页面中**所有外置、内置 JavaScript 脚本**
 2. 书写形式**简洁明了** —— 充分运用 **原生 JavaScript 语法**，不自创小语法
 3. **jQuery API** 兼容 —— 基于 [iQuery][1] 开发，并开放给**应用开发者**使用，逻辑不复杂的网页无需再加载 jQuery 或 Zepto


## 【版本简史】

 - v1.3 Alpha  —— 2016年6月6日    首个支持 AMD 规范的版本
 - v1.2 Stable —— 2016年1月29日
   - **多媒体资源 延迟加载** 支持 背景图、动态插入元素
   - 遮罩层/模态框组件 移出并贡献给 [EasyWebUI][2] 项目，并适配其开放的 `loading` 通用 **加载进度事件**接口
   - 新增 全局异常监控（实验特性）
 - v1.1 Stable —— 2015年8月27日
   - **条件加载、异步队列 改为 更自然、灵活的 JS 对象字面量写法**，大幅精简 加载队列实现逻辑
   - 支持 `<img />`、`<iframe />` 延迟加载
   - 同时发布的 Modern 版 删去了 iQuery、EasyImport.js 中的 IE 8 兼容代码
 - v0.9 Stable —— 2015年5月10日   基于 iQuery（jQuery API 兼容库）重写核心代码
 - v0.6 Stable —— 2014年11月24日  首个开源版本（[发布博文][3]）
 - v0.4 Stable —— 2014年中期      首个功能稳定版


## 【核心特性】

 1. **JavaScript、HTML 并行加载** —— 所有脚本都可写在 `<head />` 中，但却不阻塞页面其它部分的加载，**代码结构清晰**而又**高性能**
 2. **内置 DOM Ready** —— 每组加载的最后一段脚本（无论内置回调、外置脚本）自动在 DOM Ready 后加载/执行，既靠谱又方便（`$(document).ready(function () {});` 之类的大包装可以完全不需要了）
 3. **JavaScript 异步加载** —— 无依赖的部分外置脚本只需用 `[ ]`（数组字面量）或 `{ }`（对象字面量，v1.1+ 支持）括起来即可异步
 4. **JavaScript 条件加载** —— 外置脚本可根据 自定义条件（v1.1+ 支持）**选择性加载**，模块化管理 JavaScript
 5. （v1.0+）支持 **大资源延迟加载** —— 把 HTML 源码中 `<img />`、`<iframe />` 的 src 属性替换为 `data-src` 即可被加载器识别
 6. **移动设备浏览器布局模式自适配** —— 自动检测并添加合适的各种 `<meta />` 标签，让网页源码以标准而通用的简洁思维编写，自然地实施**响应式设计**
 7. （v1.2+）全局异常监控（服务器端日志 需自行分析）
 8. （v1.2+）适配通用的 **加载进度事件接口** —— 方便适配美观的遮罩层，屏蔽丑陋的渲染过程


## 【平台支持】
 - 主流内核浏览器：IE 8~11、M$ Edge、Firefox 3+、Chrome、Safari、Opera
 - 国产马甲浏览器：傲游 2+、枫树、搜狗高速 3+、360安全/极速、猎豹、QQ 等（还可能有个别奇葩 Bug，恕无力一一测试……）
 - Android、iOS、Windows Phone、Symbian 等智能设备平台上的自带浏览器及其内核控件


## 【典型案例】

[**《i飞扬》电子杂志 HTML 5 在线版**][4]

以下**示例代码**用 **EasyImport.js v1.1+** 重构自[《i飞扬 19期》][5]的 HTML 源码 ——
```html
    <head>
    ......
    <script type="text/javascript" src="./Libs/EasyImport.js"></script>
    <script>
    var old_PC = (! $.browser.modern);

    ImportJS([
        {
            'jQuery.js':     old_PC,
            'jQuery2.js':    $.browser.modern
        },
        {
            'Turn.HTML4.js':           old_PC,
            'Turn.js':                 $.browser.modern,
            'Smooth_Scroll.js':        true,
            'jPlayer.js':              true,
            'jQuery.Hammer.js':        true,
            'jQuery.PageZoomer.js':    ($.browser.modern  &&  (! $.browser.mobile)),
            'Hover_Scroll.js':         (! $.browser.mobile)
        },
        'FY_iWeBook.js'
    ], function () {
        $('#iWB').iWeBook('#jPlayer_Box');
    });

    var duoshuoQuery= {short_name:  'fyscu'};
    ImportJS( ['http://static.duoshuo.com/embed.js'] );
    </script>
    ......
    </head>
```

## 【参与开发】

### （〇）环境搭建
 1. 安装 **Git**（比 SVN 更适合 **开源团队**）
 2. 安装 **Node.JS** 最新 LTS 版

### （一）从源码构建

UNIX-Shell、Windows-CMD 通用脚本 ——

```Shell
npm install -g requirejs
npm install -g uglify-js

mkdir ./EasyImport.js
git clone https://git.oschina.net/Tech_Query/EasyImport.js.git ./EasyImport.js

node r.js -o build/source.js
uglifyjs EasyImport.js -c -m -o EasyImport.min.js --source-map=EasyImport.min.map
```

## 【项目缘起】

　　我在做[《i飞扬》电子杂志 HTML5 在线版][4]的过程中，为了在不改变 **Web 前端程序猿的编程思维习惯**的前提下，保证整个 **WebApp 的好用、可靠**，自己开发了一个**【JavaScript 文件响应式异步加载器】**—— [EasyImport.js][6]。开始只是一段放在 HTML `<head />` 中的小脚本，没觉得是个多么复杂的东西。但随着应用的深入，要想做到自己定下的目标，**代码不断地迭代**，期间也因为严重的 Bug 而怀疑它的价值，所以有了后来的一次较大的局部重构。

　　但辛劳总会有收获 —— 个人更深刻地理解了 **JavaScript**、**DOM** 的一些细节，它本身也到了足够成熟的地步，作为几个**线上实用项目的基础库**，运行在很多人的浏览器中~



  [1]: http://git.oschina.net/Tech_Query/iQuery
  [2]: http://git.oschina.net/Tech_Query/EasyWebUI
  [3]: http://log.fyscu.com/index.php/archives/130/
  [4]: http://mag.fyscu.com
  [5]: http://mag.fyscu.com/iWB/iBookView.php?name=iFY&index=19
  [6]: http://bbs.fyscu.com/forum.php?mod=viewthread&tid=4808