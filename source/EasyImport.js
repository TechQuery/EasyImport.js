define(['iQuery'],  function ($) {

    var BOM = self,  DOM = self.document;

/* ----------- Standard Mode Meta Patches ----------- */

    var $_Meta = [ ],  $_Head = $('head');

    if ($.browser.mobile) {
        if ($.browser.modern)
            $_Meta.push(
                $('<meta />', {
                    name:       "viewport",
                    content:    [
                        'width' + '=' + (
                            BOM.navigator.userAgent.match(
                                /MicroMessenger|UCBrowser|UCWeb/i
                            )  ?
                            320  :  'device-width'
                        ),
                        'initial-scale=1.0',
                        'minimum-scale=1.0',
                        'maximum-scale=1.0',
                        'user-scalable=no',
                        'target-densitydpi=medium-dpi'
                    ].join(',')
                })[0]
            );
        else
            $_Meta = $_Meta.concat([
                $('<meta />', {
                    name:       'MobileOptimized',
                    content:    320
                })[0],
                $('<meta />', {
                    name:       'HandheldFriendly',
                    content:    'true'
                })[0]
            ]);
    }
    if ($.browser.msie)
        $_Meta.push(
            $('<meta />', {
                'http-equiv':    'X-UA-Compatible',
                content:         'IE=Edge, Chrome=1'
            })[0]
        );

    $_Meta = $($_Meta);

    if (! $('head meta').slice(-1).after($_Meta).length)
        $_Head.find('link, title, script').eq(0).before($_Meta);


/* ---------- Loading Queue ---------- */

    var Root_Path = (function ($_Script) {
            for (var i = 0, iPath;  i < $_Script.length;  i++) {
                iPath = $_Script[i].src.match(
                    /(.+)[^\/]*EasyImport[^\/]*\.js[^\/]*$/i
                );
                if (iPath)  return iPath[1];
            }
        })( $('head > script') );

    function Queue_Filter(iList) {
        for (var i = 0, _Group_;  i < iList.length;  i++) {
            _Group_ = iList[i];

            if (typeof _Group_ == 'string') {
                iList[i] = { };
                iList[i][_Group_] = true;
            }
            if ($.isPlainObject( iList[i] )) {
                _Group_ = [ ];

                for (var iScript in iList[i])
                    if ( iList[i][iScript] )  _Group_.push(iScript);

                iList[i] = _Group_;
            }
            for (var j = 0;  j < _Group_.length;  j++)
                if (! _Group_[j].match(/^(\w+:)?\/\//))
                    _Group_[j] = Root_Path + _Group_[j];
        }

        return iList;
    }

/* ---------- DOM Cache ---------- */

    var $_Script = $('<script />', {
            type:       'text/javascript',
            charset:    'UTF-8',
            'class':    'EasyImport'
        }),
        $_BOM = $(BOM),  $_DOM = $(DOM);


/* ---------- DOM Load-Engine ---------- */

    function DOM_Load(iOrder, iFinal) {
        if (! iOrder[0]) {
            iFinal();
            return;
        }

        var This_Call = arguments;

        if ((! iOrder[1]) && (this !== DOM)) {
            $_DOM.ready(function () {
                This_Call.callee.apply(this, This_Call);
            });
            return;
        }

        var This_Group = 0;

        function _Next_() {
            if ( iOrder[0][++This_Group] )  return;

            if (typeof this != 'function')
                $(this).data('Load_During',  $.end( $.fileName(this.src) ));

            iOrder.shift();
            This_Call.callee.apply(this, This_Call);
        }

        for (var i = 0, iScript;  (iOrder[0] && (i < iOrder[0].length));  i++) {
            iScript = iOrder[0][i];

            $_Head.trigger({
                type:      'loading',
                detail:    0,
                data:      'Web Loading ...'
            });
            if (typeof iScript == 'function') {
                iScript();
                _Next_.call(iScript);
                continue;
            }
            $_Script.clone().one('load', _Next_)
                .attr('src', iScript).appendTo($_Head);

            $.start( $.fileName(iScript) );
        }
    }
/* ----------- Open API ----------- */

    var Load_Times = 0;

    function Load_End() {
        $(DOM.body).trigger({
            type:      'loading',
            detail:    1
        });

        if ( Load_Times++ )  return;

        var iTimer = $.browser.modern && (! $.browser.ios) && BOM.performance.timing;

        var Async_Time = (! iTimer) ? $.end('DOM_Ready') : (
                (iTimer.domContentLoadedEventEnd - iTimer.navigationStart) / 1000
            ),
            Sync_Time = $_DOM.data('Load_During');
        $('head > script.EasyImport').each(function () {
            Sync_Time += $(this).data('Load_During') || 0;
        });
        console.info([
            '[ EasyImport.js ]  Time Statistics',
            '  Async Sum:    ' + Async_Time.toFixed(3) + ' s',
            '  Sync Sum:     ' + Sync_Time.toFixed(3) + ' s',
            '  Saving:       ' + (
                ((Sync_Time - Async_Time) / Sync_Time) * 100
            ).toFixed(2) + ' %'
        ].join("\n\n"));
    }

    BOM.ImportJS = function () {
        var Func_Args = $.makeArray(arguments),
            JS_List,  CallBack;

        Root_Path = (typeof Func_Args[0] == 'string') ?
            Func_Args.shift() : Root_Path;
        if (Func_Args[0] instanceof Array)
            JS_List = Func_Args.shift();
        else
            throw "Format of Importing List isn't currect !";
        CallBack = (typeof Func_Args[0] == 'function') ?
            Func_Args.shift() : null;


        var JS_Item = Queue_Filter(JS_List);
        if (CallBack)  JS_Item.push( [CallBack] );

        if (! JS_Item[0].length)  return;

        DOM_Load(JS_Item, Load_End);
    };

/* ----------- Practical Extension ----------- */

    /* ----- Lazy Loading  v0.2 ----- */

    function Scroll_Queue() {
        this.$_ViewPort = $(arguments[0] || BOM);
        this.vpHeight = this.$_ViewPort.height();
        this.count = 0;
        this.finish = [ ];
    }

    Scroll_Queue.prototype.watch = function () {
        var _This_ = this,  $_DOM = $(this.$_ViewPort[0].document);

        this.$_ViewPort.scroll(function () {
            var iLazy = _This_[ $_DOM.scrollTop() ];
            if (! iLazy)  return;

            for (var i = 0;  i < iLazy.length;  i++)
                if (
                    ($.inArray(iLazy[i], this.finish)  ==  -1)  &&
                    (false  ===  _This_.onScroll( iLazy[i] ))
                ) {
                    this.finish.push( iLazy[i] );

                    if (--_This_.count == 0)
                        _This_.$_ViewPort.unbind('scroll', arguments.callee);
                }
        });
    };

    Scroll_Queue.prototype.register = function (Item) {
        if (! Item)  return;

        Item = $.likeArray(Item) ? Item : [Item];

        if ((! this.count)  &&  Item.length)  this.watch();

        for (var i = 0, Off_Top, iNO;  i < Item.length;  i++) {
            Off_Top = $(Item[i]).offset().top;

            iNO = Math.round(
                (Off_Top < this.vpHeight)  ?  0  :  (Off_Top - this.vpHeight)
            );
            for (;  iNO < Off_Top;  iNO++)
                if (! this[iNO])
                    this[iNO] = [ Item[i] ];
                else
                    this[iNO].push( Item[i] );
        }
        this.count += Item.length;
    };

    $_DOM.ready(function () {
        var iQueue = new Scroll_Queue(),  Lazy_Tag = $.makeSet('IMG', 'IFRAME');

        iQueue.onScroll = function (iLazy) {
            if ( iLazy.dataset.src )
                iLazy.src = iLazy.dataset.src;
            else
                iLazy.style.backgroundImage = iLazy.dataset.background;
        };

        if ( $.browser.modern )
            this.addEventListener('DOMNodeInserted',  function () {
                var iTarget = arguments[0].target;

                if (iTarget.nodeType != 1)  return;

                if (iTarget.tagName in Lazy_Tag) {
                    if (! iTarget.dataset.src)  return;
                } else if (! iTarget.dataset.background)
                    return;

                iQueue.register( iTarget );
            });

        iQueue.register(
            $('img[data-src], iframe[data-src], *[data-background]', this.body)
        );
    });

    /* ----- Remote Error Log  v0.2 ----- */

    //  Thanks "raphealguo" --- http://rapheal.sinaapp.com/2014/11/06/javascript-error-monitor/

    var Console_URL = $('head link[rel="console"]').attr('href');

    BOM.onerror = function (iMessage, iURL, iLine, iColumn, iError){
        if (! Console_URL)  return;

        $.wait(0,  function () {
            var iData = {
                    message:    iMessage,
                    url:        iURL,
                    line:       iLine,
                    column:
                        iColumn  ||  (BOM.event && BOM.event.errorCharacter)  ||  0
                };

            if (iError)  iData.stack = String(iError.stack || iError.stacktrace);

            $[iData.stack ? 'post' : 'get'](Console_URL, iData);
        });

        return true;
    };

});