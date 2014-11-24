#EasyImport.js

**发布博文** —— [http://log.fyscu.com/index.php/archives/130/][1]

v0.6（单页稳定版）
=============

　　这是 **EasyImport.js 首个功能完备的稳定版**，能给 **单页应用** 提供有力的**异步加载、响应式适配**支持，但不支持 **`<iframe />` 子页面的 JS、CSS 继承**（也就是说，它独立运行于每一个加载它的父/子页面中，不考虑关联页面的相互联系）。

　　它将提供**长期 Bug 修复的官方维护**，后续版本与本版的公共代码也将同步更新，但不会再改变代码的整体结构。而子页面继承将在下个稳定版给予集成~

【主要特性】
------
 1. 替代 `<script />` 加载 HTML 页面中**所有外置、内置 JavaScript 脚本**，但不改变原有“**顺序即依赖**”的前端编程习惯，且书写形式比原来更简洁
 2. 所有外置脚本都可写在 `<head />` 中，但却能与整个页面的其它部分**并行加载**，**代码结构清晰**而又**高性能**
 3. 最后一段脚本（无论内置回调、外置脚本）自动在 **DOM Ready** 后加载/执行，既靠谱又方便（`$(document).ready(function () {});` 之类的大包装可以完全不需要了）
 4. 无依赖的部分外置脚本只需用 `[]`（数组字面量）括起来就可以**异步加载**
 5. 外置脚本可以根据浏览器平台类型**选择性加载**，模块化管理 JavaScript
 6. **移动设备浏览器布局模式自适配**：添加其适用的各种 `<meta />` 标签，让网页源码以标准而通用的简洁思维编写，自然地实施**响应式设计**
 7. 浏览器级的 `<iframe />` 套用防御

【平台支持】
------
 - 主流内核浏览器：IE 7~11、Firefox 3+、Chrome、Safari、Opera
 - 国产马甲浏览器：傲游 2+、枫树、搜狗高速 3+、360安全/极速、猎豹、QQ 等（还可能有个别奇葩 Bug，恕无力一一测试……）
 - Android、iOS、Windows Phone、Symbian 等智能设备平台上的自带浏览器及其内核控件

【典型案例】
------
[http://mag.fyscu.com/iWB/iBookView.php?name=iFY&index=19][2]

以下**示例代码**摘抄自上述网页的 HTML 源码 ——

    <head>
    ......
    <script type="text/javascript" src="./Libs/EasyImport.js"></script>
    <script>
    ImportJS([
        {
            old_PC: 'jQuery.js',
            new_PC: 'jQuery2.js'
        },
        [{
            old_PC: 'Turn.HTML4.js',
            new_PC: 'Turn.js'
        },
        'Smooth_Scroll.js',
        'jPlayer.js',
        'jQuery.Hammer.js',
        {
            old_PC: false,
            new_PC: 'jQuery.PageZoomer.js',
            Mobile: false
        },
        {
            new_PC:    'Hover_Scroll.js',
            Mobile:    false
        }
        ],
        'FY_iWeBook.js'
    ], function () {
        $('#iWB').iWeBook('#jPlayer_Box');
    });

    var duoshuoQuery= {short_name:'fyscu'};
    ImportJS(['http://static.duoshuo.com/embed.js']);
    </script>
    ......
    </head>

【项目缘起】

　　我在做[《i飞扬》电子杂志 HTML5 在线版][3]的过程中，为了在不改变 **Web 前端程序猿的编程思维习惯**的前提下，保证整个 **WebApp 的好用、可靠**，自己开发了一个**【JavaScript 文件响应式异步加载器】**—— [EasyImport.js][4]。开始只是一段放在 HTML `<head />` 中的小脚本，没觉得是个多么复杂的东西。但随着应用的深入，要想做到自己定下的目标，**代码不断地迭代**，期间也因为严重的 Bug 而怀疑它的价值，所以有了后来的一次较大的局部重构。

　　但辛劳总会有收获 —— 个人更深刻地理解了 **JavaScript**、**DOM** 的一些细节，它本身也到了足够成熟的地步，作为几个**线上实用项目的基础库**，运行在很多人的浏览器中~



  [1]: http://log.fyscu.com/index.php/archives/130/
  [2]: http://mag.fyscu.com/iWB/iBookView.php?name=iFY&index=19
  [3]: http://mag.fyscu.com
  [4]: http://bbs.fyscu.com/forum.php?mod=viewthread&tid=4808