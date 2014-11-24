//
//                >>>  EasyImport.js  <<<
//
//
//      [Version]    v0.6  (2014-11-17)  Stable
//
//      [Usage]      Only for loading JavaScript files in Single-Page Web,
//                   no Inherit support for Frames.
//
//
//              (C)2013-2014    SCU FYclub-RDD
//

(function (BOM, DOM) {
    var UA = navigator.userAgent,
        RootPath,  JS_List,  CallBack,
        EIJS = {
            AsyncJS:    [],
            DOM_Ready:  []
        };
// ----------- Inner Basic Member ----------- //
    var is_IE = UA.match(/MSIE (\d)|Trident[^\)]+rv:(\d+)/i),
        is_Webkit = UA.match(/Webkit/i);
    var IE_Ver = is_IE ? Number(is_IE[1] || is_IE[2]) : NaN;
    var old_IE = IE_Ver && (IE_Ver < 9),
        is_Pad = UA.match(/Tablet|Pad|Book|Android 3/i),
        is_Phone = UA.match(/Phone|Touch|Android 2|Symbian/i);
    var is_Mobile = (
            is_Pad || is_Phone || UA.match(/Mobile/i)
        ) && (! UA.match(/ PC /));

    function DOM_Loaded_Event(DOM_E, CB_Func) {
        if (!old_IE) DOM_E.addEventListener('load', CB_Func, false);
        else DOM_E.attachEvent('onreadystatechange', function () {
            if (DOM_E.readyState.match(/loaded|complete/))
                CB_Func.call(DOM_E);
        });
    }
    function DOM_Ready_Event(_CB) {
        if (!old_IE)  DOM.addEventListener('DOMContentLoaded', _CB, false);
        else if (self !== top)
            DOM_Loaded_Event(DOM, _CB);
        else  (function () {
            try {
                DOM.documentElement.doScroll('left');
                _CB.call(DOM);
            } catch (Err) { setTimeout(arguments.callee, 1); }
        })();
    }
    function $_TN(HTML_Elements, TagName) {
        return HTML_Elements.getElementsByTagName(TagName);
    }
    function NewTag(TagName, AttrList) {
        var NE = DOM.createElement(TagName);
        if (AttrList)  for (var AK in AttrList) {
            if (IE_Ver && (AK == 'class'))
                NE.className = AttrList[AK];
            NE.setAttribute(AK, AttrList[AK]);
        }
        return NE;
    }

    var DOM_Head = $_TN(DOM, 'head')[0];
    var DOM_Title = $_TN(DOM_Head, 'title')[0];
// ----------- Standard Mode Meta Patches ----------- //
    DOM_Head.appendChild(
        NewTag('meta', {
            'http-equiv':    'Window-Target',
            content:         '_top'
        })
    );
    if (is_Mobile) {
        if (! old_IE) {
            var is_WeChat = UA.match(/MicroMessenger/i),
                is_UCWeb = UA.match(/UCBrowser|UCWeb/i);
            DOM_Head.insertBefore(
                NewTag('meta', {
                    name:       "viewport",
                    content:    [
                        [
                            'width',
                            (is_Phone && (is_WeChat || is_UCWeb)) ?
                                320 : 'device-width'
                        ].join('='),
                        'initial-scale=1.0',
                        'minimum-scale=1.0',
                        'target-densitydpi=medium-dpi'
                    ].join(',')
                }),
                DOM_Title
            );
        } else  DOM_Head.insertBefore(
            NewTag('meta', {
                name:    'MobileOptimized',
                content:    320
            }),
            DOM_Title
        );
        DOM_Head.insertBefore(
            NewTag('meta', {
                name:       'HandheldFriendly',
                content:    'true'
            }),
            DOM_Title
        );
    }
    if (IE_Ver)  DOM_Head.appendChild(
        NewTag('meta', {
            'http-equiv':    'X-UA-Compatible',
            content:         'IE=Edge, Chrome=1'
        })
    );

// ----------- Inner Logic Module ----------- //
    function xImport(JS_URL, CB_Func) {
        var SE = NewTag('script', {
            type:       'text/javascript',
            charset:    'UTF-8',
            src:        JS_URL
        });
        if (CB_Func) DOM_Loaded_Event(SE, CB_Func);
        return $_TN(DOM, 'head')[0].appendChild(SE);
    }
    function LI_Add(LQ, RP, FN) {
        if (! FN.match(/^http(s)?:\/\//))  FN = RP + FN;
        LQ.push( { URL:  FN } );
    }
    function SL_Set(RP, List0) {
        for (var i = 0; i < List0.length; i++)
            if (!(List0[i] instanceof Array))  List0[i] = [List0[i]];
        var List1 = [];
        for (var i = 0, k = 0; i < List0.length; i++) {
            List1[k] = [];
            for (var j = 0, _URL; j < List0[i].length; j++) {
                if (typeof List0[i][j] == 'string')
                    LI_Add(List1[k], RP, List0[i][j]);
                else {
                    var _Rule = {
                        old_PC:    old_IE,
                        Mobile:    is_Mobile,
                        Phone:     is_Phone,
                        Pad:       is_Pad
                    },  no_Break = true;
                    for (RI in _Rule)  if (_Rule[RI]) {
                        if (List0[i][j][RI] === false)
                            no_Break = false;
                        else if (List0[i][j][RI])
                            LI_Add(List1[k], RP, List0[i][j][RI]);
                        break;
                    }
                }
                if (no_Break && !List1[k][j] && List0[i][j].new_PC)
                    LI_Add(List1[k], RP, List0[i][j].new_PC);
            }
            if (List1[k].length) k++;
        }
        return List1;
    }
    function CB_Set(List, Index) {
        var Item = List[Index + 1];
        if (Item[0].CallBack) {
            var AJSQ = EIJS.AsyncJS;
            var AJS_NO = AJSQ.push(0) - 1;
            var AJS_CB = function () {
                if (++AJSQ[AJS_NO] == Item.length)
                    Item[0].CallBack();
            };
        }
        return  function TF_Import() {
            for (var n = 0; n < Item.length; n++)
                xImport(Item[n].URL, AJS_CB);
        };
    }
    function CB_Chain(JS_RC, Final_CB) {
        var DRQ = EIJS.DOM_Ready;
        var DRQ_NO = DRQ.push(0) - 1;
        for (var k = JS_RC.length - 2, l = 0; k > -2; k--, l++) {
            if (! l) {
                if (Final_CB) {
                    JS_RC[k+1][0]['CallBack'] = function (iEvent) {
                        if (++DRQ[DRQ_NO] == 2)  Final_CB.apply(self);
                    };
                    DOM_Ready_Event(JS_RC[k+1][0].CallBack);
                } else if (k > -1) {
                    var Last_Script = JS_RC[k+1][0].URL;
                    JS_RC[k][0]['CallBack'] = function (iEvent) {
                        if (++DRQ[DRQ_NO] == 2)  xImport(Last_Script);
                    };
                    DOM_Ready_Event(JS_RC[k][0].CallBack);
                    continue;
                }
            }
            if (k > -1)  JS_RC[k][0]['CallBack'] = CB_Set(JS_RC, k);
        }
    }

// ----------- Open API ----------- //
    BOM.ImportJS = function () {
        var Func_Args = Array.prototype.slice.call(arguments, 0);

        if (typeof Func_Args[0] == 'string')
            RootPath = Func_Args.shift();
        else  RootPath = $_TN(DOM, 'script')[0].src.replace(
            /[^\/]*EasyImport[^\/]*\.js[^\/]*$/i,  ''
        );
        if (Func_Args[0] instanceof Array)
            JS_List = Func_Args.shift();
        else  throw "Format of Importing List isn't currect !";
        if (typeof Func_Args[0] == 'function')
            CallBack = Func_Args.shift();
        else  CallBack = null;

        var JS_Item = SL_Set(RootPath, JS_List);
        if (! JS_Item[0].length) return;
        CB_Chain(JS_Item, CallBack);
        xImport(JS_Item[0][0].URL, JS_Item[0][0].CallBack);
    };

    BOM.ImportJS.UA = {
        IE:        !! old_IE,
        Modern:    !  old_IE,
        Mobile:    !! is_Mobile,
        Pad:       !! is_Pad,
        Phone:     !! is_Phone
    };
})(window, document);