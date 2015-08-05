//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v1.0  (2015-8-5)  Stable
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//            (C)2015    shiy2008@gmail.com
//


/* ---------- ECMAScript 5/6  Patch ---------- */
(function (BOM) {

    if (! console) {
        function _Notice_() {
            var iString = [ ];

            for (var i = 0;  i < arguments;  i++)
                iString.push( arguments[i].toString() );

            BOM.status = iString.join(' ');
        }
        BOM.console = {
            log:      _Notice_,
            info:     _Notice_,
            warn:     _Notice_,
            error:    _Notice_
        };
    }

    BOM.iRegExp = function (iString, Mode, Special_Char) {
        var iRegExp_Compiled = / /,
            iChar = ['/', '.'];

        if (Special_Char instanceof Array)
            iChar = iChar.concat(Special_Char);
        else if (Special_Char === null)
            iChar.length = 0;

        for (var i = 0; i < iChar.length; i++)
            iString = iString.replace(
                RegExp("([^\\\\])\\" + iChar[i], 'g'),  "$1\\" + iChar[i]
            );
        iRegExp_Compiled.compile(iString, Mode);

        return iRegExp_Compiled;
    };

    if (! ''.trim)
        var Blank_Char = BOM.iRegExp('(^\\s*)|(\\s*$)', 'g');
    else
        var _Trim_ = ''.trim;

    String.prototype.trim = function (iChar) {
        if (! iChar)
            return  Blank_Char ? this.replace(Blank_Char, '') : _Trim_.call(this);
        else {
            for (var i = 0, a = 0, b;  i < iChar.length;  i++) {
                if ((this[0] == iChar[i]) && (! a))
                    a = 1;
                if ((this[this.length - 1] == iChar[i]) && (! b))
                    b = -1;
            }
            return this.slice(a, b);
        }
    };

    if (! ''.repeat)
        String.prototype.repeat = function (Times) {
            return  (new Array(Times + 1)).join(this);
        };

    if (! [ ].indexOf)
        Array.prototype.indexOf = function () {
            for (var i = 0;  i < this.length;  i++)
                if (arguments[0] === this[i])
                    return i;

            return -1;
        };

    if (! Date.now)
        Date.now = function () {
            return  (new Date()).getTime();
        };

//  JSON Extension  v0.4

    BOM.JSON.format = function () {
        return  this.stringify(arguments[0], null, 4)
            .replace(/(\s+"[^"]+":) ([^\s]+)/g, '$1    $2');
    };

    BOM.JSON.parseAll = function (iJSON) {
        return  this.parse(iJSON,  function (iKey, iValue) {
                if (iKey && (typeof iValue == 'string'))  try {
                    return  BOM.JSON.parse(iValue);
                } catch (iError) { }

                return iValue;
            });
    };

//  New Window Fix  v0.3

    BOM.new_Window_Fix = function (Fix_More) {
        if (! this)  return false;

        try {
            var _Window_ = this.opener,
                This_DOM = this.document;

            if (_Window_ && (this.location.href == 'about:blank'))
                This_DOM.domain = _Window_.document.domain;

            if (! (_Window_ || this).$.browser.modern)
                This_DOM.head = This_DOM.documentElement.firstChild;
        } catch (iError) {
            return false;
        }
        if (Fix_More)
            Fix_More.call(this);

        return true;
    };

    BOM.new_Window_Fix();

})(self);


// ---------->  iQuery.js  <---------- //
(function (BOM, DOM) {

/* ---------- UA Check ---------- */
    var UA = navigator.userAgent;

    var is_Trident = UA.match(/MSIE (\d+)|Trident[^\)]+rv:(\d+)/i),
        is_Gecko = UA.match(/; rv:(\d+)[^\/]+Gecko\/\d+/),
        is_Webkit = UA.match(/AppleWebkit\/(\d+\.\d+)/i);
    var IE_Ver = is_Trident ? Number(is_Trident[1] || is_Trident[2]) : NaN,
        FF_Ver = is_Gecko ? Number(is_Gecko[1]) : NaN,
        WK_Ver = is_Webkit ? parseFloat(is_Webkit[1]) : NaN;

    var is_Pad = UA.match(/Tablet|Pad|Book|Android 3/i),
        is_Phone = UA.match(/Phone|Touch|Android 2|Symbian/i);
    var is_Mobile = (
            is_Pad || is_Phone || UA.match(/Mobile/i)
        ) && (! UA.match(/ PC /));

    var is_iOS = UA.match(/(iTouch|iPhone|iPad|iWatch);[^\)]+CPU[^\)]+OS (\d+_\d+)/i),
        is_Android = UA.match(/(Android |Silk\/)(\d+\.\d+)/i);

    var _Browser_ = {
            msie:             IE_Ver,
            ff:               FF_Ver,
            webkit:           WK_Ver,
            modern:           !  (IE_Ver < 9),
            mobile:           !! is_Mobile,
            pad:              !! is_Pad,
            phone:            !! is_Phone,
            ios:              is_iOS  ?  parseFloat( is_iOS[2].replace('_', '.') )  :  NaN,
            android:          is_Android ? parseFloat(is_Android[2]) : NaN,
            versionNumber:    IE_Ver || FF_Ver || WK_Ver
        };


/* ---------- Object Base ---------- */
    function _Each_(Arr_Obj, iEvery) {
        if (! Arr_Obj)  return;

        if (typeof Arr_Obj.length == 'number') {
            for (var i = 0;  i < Arr_Obj.length;  i++)
                if (iEvery.call(Arr_Obj[i], i, Arr_Obj[i]) === false)
                    break;
        } else  for (var iKey in Arr_Obj)
            if (iEvery.call(Arr_Obj[iKey], iKey, Arr_Obj[iKey]) === false)
                break;

        return Arr_Obj;
    }

    function _Extend_(iTarget) {
        iTarget = iTarget || (
            (arguments[1] instanceof Array)  ?  [ ]  :  { }
        );

        for (var i = 1;  i < arguments.length;  i++)
            for (var iKey in arguments[i])
                if (
                    Object.prototype.hasOwnProperty.call(arguments[i], iKey)  &&
                    (arguments[i][iKey] !== undefined)
                )
                    iTarget[iKey] = arguments[i][iKey];

        return iTarget;
    }

    function _inKey_() {
        var iObject = { };

        for (var i = 0;  i < arguments.length;  i++)
            iObject[arguments[i]] = true;

        return iObject;
    }

    var Type_Info = {
            Data:         _inKey_('String', 'Number', 'Boolean', 'Object', 'Null'),
            BOM:          _inKey_('Window', 'DOMWindow', 'global'),
            DOM:          {
                set:        _inKey_('Array', 'HTMLCollection', 'NodeList', 'jQuery', 'iQuery'),
                element:    _inKey_('Window', 'Document', 'HTMLElement'),
                root:       _inKey_('Document', 'Window')
            },
            DOM_Event:    _inKey_(
                'load', 'abort', 'error',
                'keydown', 'keypress', 'keyup',
                'mousedown', 'mouseup', 'mousemove',
                'mouseover', 'mouseout', 'mouseenter', 'mouseleave',
                'click', 'dblclick', 'scroll', 'mousewheel',
                'select', 'focus', 'blur', 'change', 'submit', 'reset',
                'DOMContentLoaded',
                'DOMAttrModified', 'DOMAttributeNameChanged',
                'DOMCharacterDataModified',
                'DOMElementNameChanged',
                'DOMNodeInserted', 'DOMNodeInsertedIntoDocument',
                'DOMNodeRemoved',  'DOMNodeRemovedFromDocument',
                'DOMSubtreeModified'
            ),
            Target:       _inKey_('_top', '_parent', '_self', '_blank')
        };

    function _Type_(iVar) {
        var iType = typeof iVar;

        iType = (iType == 'object') ? (
                (iVar && iVar.constructor.name) ||
                Object.prototype.toString.call(iVar).match(/\[object\s+([^\]]+)\]/i)[1]
            ) : (
                iType[0].toUpperCase() + iType.slice(1)
            );

        if (! iVar)  switch (true) {
            case (isNaN(iVar)  &&  (iVar !== iVar)):    return 'NaN';
            case (iVar === null):                       return 'Null';
            default:                                    return iType;
        }

        if (
            Type_Info.BOM[iType] ||
            ((iVar == iVar.document) && (iVar.document != iVar))
        )
            return 'Window';

        if (iVar.defaultView || iVar.documentElement)
            return 'Document';

        if (
            iType.match(/HTML\w+?Element$/) ||
            (typeof iVar.tagName == 'string')
        )
            return 'HTMLElement';

        if (
            (! _Browser_.modern) &&
            (iType == 'Object') &&
            (typeof iVar.length == 'number')
        )  try {
            iVar.item();
            try {
                iVar.namedItem();
                return 'HTMLCollection';
            } catch (iError) {
                return 'NodeList';
            }
        } catch (iError) { }

        return iType;
    }

    function Back_Track(iName, iCallback) {
        var iResult = [ ];

        for (var _This_ = this, _Next_, i = 0;  _This_[iName];  _This_ = _Next_, i++) {
            _Next_ = _This_[iName];
            iResult.push(_Next_);
            if ( iCallback )
                iCallback.call(_Next_, i, _Next_);
        }

        return iResult;
    }


/* ---------- DOM Info Operator - Get first, Set all. ---------- */
    var _Get_Set_ = {
            Get_Name_Type:    _inKey_('String', 'Array')
        };

    function _Operator_(iType, iElement, iName, iValue) {
        if ((! iName) || (iValue === null)) {
            if (_Get_Set_[iType].clear)
                for (var i = 0;  i < iElement.length;  i++)
                    _Get_Set_[iType].clear(iElement[i], iName);
            return iElement;
        }
        if ((iValue === undefined) && (_Type_(iName) in _Get_Set_.Get_Name_Type)) {
            if (! iElement.length)
                return;
            else if (typeof iName == 'string')
                return  _Get_Set_[iType].get(iElement[0], iName);
            else {
                var iData = { };
                for (var i = 0;  i < iName.length;  i++)
                    iData[iName[i]] = _Get_Set_[iType].get(iElement[0], iName[i]);
                return iData;
            }
        } else {
            var iResult;

            if (typeof iName == 'string') {
                if (typeof iValue == 'function') {
                    for (var i = 0;  i < iElement.length;  i++)
                        iResult = _Get_Set_[iType].set(iElement[i], iName, iValue.call(
                            iElement[i],  i,  _Get_Set_[iType].get(iElement[i], iName)
                        ));
                    return  iResult || iElement;
                } else {
                    iResult = { };
                    iResult[iName] = iValue;
                    iName = iResult;
                    iResult = undefined;
                }
            }
            for (var i = 0;  i < iElement.length;  i++)
                for (var iKey in iName)
                    iResult = _Get_Set_[iType].set(iElement[i], iKey, iName[iKey]);

            return  iResult || iElement;
        }
    }

    /* ----- DOM Content ----- */
    _Get_Set_.innerText = {
        set:    function (iElement, iText) {
            switch ( iElement.tagName.toLowerCase() ) {
                case 'style':     if (! _Browser_.modern) {
                    iElement.styleSheet.cssText = iText;
                    return;
                }
                case 'script':    if (! _Browser_.modern) {
                    iElement.text = iText;
                    return;
                }
                case '':          {
                    iElement.appendChild( DOM.createTextNode(iText) );
                    return;
                }
            }
            iElement[_Browser_.ff ? 'textContent' : 'innerText'] = iText;
        },
        get:    _Browser_.ff ?
            function (iElement) {
                var TextRange = iElement.ownerDocument.createRange();
                TextRange.selectNodeContents(iElement);
                return TextRange.toString();
            } :
            function (iElement) {
                return iElement.innerText;
            }
    };

    _Get_Set_.innerHTML = {
        set:    function (iElement, iHTML) {
            var IE_Scope = iHTML.toString().match(
                    /^[^<]*<\s*(head|meta|title|link|style|script|noscript|(!--[^>]*--))[^>]*>/i
                );

            if (_Browser_.modern || (! IE_Scope))
                iElement.innerHTML = iHTML;
            else {
                iElement.innerHTML = 'IE_Scope' + iHTML;
                var iChild = iElement.childNodes;
                iChild[0].nodeValue = iChild[0].nodeValue.slice(8);
                if (! iChild[0].nodeValue.length)
                    iElement.removeChild(iChild[0]);
            }

            return iElement.childNodes;
        }
    }

    /* ----- DOM Style ----- */
    var IE_CSS_Filter = (! _Browser_.modern),
        Code_Indent = (_Browser_.modern  ?  ''  :  ' '.repeat(4));

    function toHexInt(iDec, iLength) {
        var iHex = parseInt( Number(iDec).toFixed(0) ).toString(16);

        if (iLength && (iLength > iHex.length))
            iHex = '0'.repeat(iLength - iHex.length) + iHex;

        return iHex;
    }

    function RGB_Hex(iRed, iGreen, iBlue) {
        var iArgs = _Extend_([ ], arguments);

        if ((iArgs.length == 1) && (typeof iArgs[0] == 'string'))
            iArgs = iArgs[0].replace(/rgb\(([^\)]+)\)/i, '$1').replace(/,\s*/g, ',').split(',');

        for (var i = 0; i < 3; i++)
            iArgs[i] = toHexInt(iArgs[i], 2);
        return iArgs.join('');
    }

    _Get_Set_.Style = {
        PX_Needed:    _inKey_(
            'width',  'min-width',  'max-width',
            'height', 'min-height', 'max-height',
            'margin', 'padding',
            'top',    'left',
            'border-radius'
        ),
        get:          function (iElement, iName) {
            if ((! iElement) || (_Type_(iElement) in Type_Info.DOM.root))
                return null;

            var iScale = 1;

            if (IE_CSS_Filter)
                switch (iName) {
                    case 'opacity':    {
                        iName = 'filter';
                        iScale = 100;
                    }
                }

            var iStyle = IE_CSS_Filter ?
                    iElement.currentStyle.getAttribute(iName) :
                    DOM.defaultView.getComputedStyle(iElement, null).getPropertyValue(iName);

            if ((_Type_(iStyle) == 'Number') || (! iStyle))
                return iStyle;

            var iNumber = parseFloat(iStyle);

            return  isNaN(iNumber) ? iStyle : (iNumber / iScale);
        },
        set:          function (iElement, iName, iValue) {
            if (_Type_(iElement) in Type_Info.DOM.root)  return false;

            if (IE_CSS_Filter) {
                var iString = '',  iWrapper,  iScale = 1,  iConvert;
                if (typeof iValue == 'string')
                    var iRGBA = iValue.match(/\s*rgba\(([^\)]+),\s*(\d\.\d+)\)/i);

                if (iName == 'opacity') {
                    iName = 'filter';
                    iWrapper = 'progid:DXImageTransform.Microsoft.Alpha(opacity={n})';
                    iScale = 100;
                } else if (!! iRGBA) {
                    iString = iValue.replace(iRGBA[0], '');
                    if (iString)
                        iString += arguments.callee(arguments[0], iName, iString);
                    if (iName != 'background')
                        iString += arguments.callee(
                            arguments[0],
                            (iName.indexOf('-color') > -1) ? iName : (iName + '-color'),
                            'rgb(' + iRGBA[1] + ')'
                        );
                    iName = 'filter';
                    iWrapper = 'progid:DXImageTransform.Microsoft.Gradient(startColorStr=#{n},endColorStr=#{n})';
                    iConvert = function (iAlpha, iRGB) {
                        return  toHexInt(parseFloat(iAlpha) * 256, 2) + RGB_Hex(iRGB);
                    };
                }
            }

            if ((! isNaN( Number(iValue) ))  &&  this.PX_Needed[iName])
                iValue += 'px';
            if (iWrapper)
                iValue = iWrapper.replace(/\{n\}/g,  iConvert ?
                      iConvert(iRGBA[2], iRGBA[1]) :
                      (iValue * iScale)
                );

            if (iElement)
                iElement.style[
                    IE_CSS_Filter ? 'setAttribute' : 'setProperty'
                ](
                    iName,
                    (_Browser_.msie != 9) ? iValue : iValue.toString(),
                    'important'
                );
            else  return [
                    iString ? (iString + ";\n") : ''
                ].concat([
                    iName,  ':',  Code_Indent,  iValue
                ]).join('');
        }
    };

    /* ----- DOM Attribute ----- */
    _Get_Set_.Attribute = {
        alias:    {
            'class':    'className',
            'for':      'htmlFor'
        },
        get:      function (iElement, iName) {
            return  (_Type_(iElement) in Type_Info.DOM.root) ?
                    null : iElement.getAttribute(
                        _Browser_.modern  ?  iName  :  (this.alias[iName] || iName)
                    );
        },
        set:      function (iElement, iName, iValue) {
            if (_Type_(iElement) in Type_Info.DOM.root)
                return false;

            if ((! _Browser_.modern) && this.alias[iName])
                iElement[ this.alias[iName] ] = iValue;
            else
                iElement.setAttribute(iName, iValue);
        },
        clear:    function (iElement, iName) {
            iElement.removeAttribute(
                _Browser_.modern  ?  iName  :  (this.alias[iName] || iName)
            );
        }
    };

    /* ----- DOM Property ----- */
    _Get_Set_.Property = {
        alias:    _Get_Set_.Attribute.alias,
        get:      function (iElement, iName) {
            return  iElement[
                    _Browser_.modern  ?  iName  :  (this.alias[iName] || iName)
                ];
        },
        set:      function (iElement, iName, iValue) {
            iElement[this.alias[iName] || iName] = iValue;
        }
    };

    /* ----- DOM Data ----- */
    _Get_Set_.Data = {
        _Data_:    [ ],
        set:       function (iElement, iName, iValue) {
            if (_Type_(iElement.dataIndex) != 'Number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            this._Data_[iElement.dataIndex][iName] = iValue;
        },
        get:       function (iElement, iName) {
            if (_Type_(iElement.dataIndex) != 'Number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            var iData = (this._Data_[iElement.dataIndex] || { })[iName];

            if (iData)
                return iData;
            else  try {
                return  _Operator_('Attribute', [iElement],  'data-' + iName);
            } catch (iError) {
                return null;
            }
        },
        clear:     function (iElement, iName) {
            if (typeof iElement.dataIndex != 'number')  return;

            if (iName)
                this._Data_[iElement.dataIndex][iName] = null;
            else
                this._Data_[iElement.dataIndex] = null;
        },
        clone:     function (iOld, iNew) {
            iNew.dataIndex = this._Data_.push({ }) - 1;
            return _Extend_(
                    this._Data_[iNew.dataIndex],
                    this._Data_[iOld.dataIndex]
                )._event_;
        }
    };

    /* ----- DOM Offset ----- */
    function DOM_Offset() {
        var iOffset = {
                left:    this[0].offsetLeft,
                top:     this[0].offsetTop
            };

        Back_Track.call('offsetParent', function () {
            iOffset.left += this.offsetLeft;
            iOffset.top += this.offsetTop;
        });

        return iOffset;
    }


/* ---------- DOM Event ---------- */
    _Operator_('Data',  [BOM],  '_timer_',  { });

    var _Time_ = {
            _Root_:     BOM,
            now:        Date.now,
            every:      function (iSecond, iCallback) {
                var _BOM_ = this._Root_,
                    iTimeOut = (iSecond || 1) * 1000,
                    iTimer, iReturn, Index = 0,
                    iStart = this.now(), iDuring;

                iTimer = _BOM_.setTimeout(function () {
                    iDuring = (Date.now() - iStart) / 1000;
                    iReturn = iCallback.call(_BOM_, ++Index, iDuring);
                    if ((typeof iReturn == 'undefined') || iReturn)
                        _BOM_.setTimeout(arguments.callee, iTimeOut);
                }, iTimeOut);

                return iTimer;
            },
            wait:       function (iSecond, iCallback) {
                return  this.every(iSecond, function () {
                    iCallback.apply(this, arguments);
                    return false;
                });
            },
            start:      function (iName) {
                var _This_ = this,  Time_Stamp;

                _Operator_('Data', [BOM], '_timer_',  function (_Index_, iTimer) {
                    iTimer = iTimer || { };
                    Time_Stamp = iTimer[iName] = _This_.now();
                    return iTimer;
                });

                return Time_Stamp;
            },
            end:        function () {
                var iTimer = _Operator_('Data', [BOM], '_timer_');
                return  (this.now() - iTimer[arguments[0]]) / 1000;
            },
            guid:       function () {
                return  [
                        (arguments[0] || 'guid'),  '_',
                        this.now().toString(16),
                        Math.random().toString(16).slice(2)
                    ].join('');
            }
        };

    /* ----- Event Proxy Layer ----- */
    function Event_Trigger(iType, iName, iData) {
        _Operator_('Data', this, '_trigger_', iData);

        for (var i = 0, iEvent;  i < this.length;  i++) {
            iEvent = DOM.createEvent(iType);
            iEvent[
                'init' + (
                    (iType == 'HTMLEvents') ? 'Event' : iType
                )
            ](iName, true, true, 0);
            this[i].dispatchEvent(iEvent);
        }

        return this;
    }

    function Proxy_Handler(iEvent) {
        var iHandler = _Operator_('Data', [this], '_event_')[iEvent.type],
            iReturn,
            Trigger_Data = _Operator_('Data', [this], '_trigger_');

        if (! iHandler)  return;

        for (var i = 0, _Return_;  i < iHandler.length;  i++) {
            if ( iHandler[i] )
                _Return_ = iHandler[i].apply(
                    this,  _Extend_([ ], arguments).concat(Trigger_Data)
                );
            else if (iHandler[i] === false)
                _Return_ = false;
            else
                continue;

            if (iReturn !== false)  iReturn = _Return_;
        }

        _Operator_('Data', [this], '_trigger_', null);

        if (iReturn === false) {
            iEvent.preventDefault();
            iEvent.stopPropagation();
        }
    }

/* ---------- DOM Traversal ---------- */
    function _Parents_() {
        var _GUID_ = _Time_.guid('parent');

        for (var i = 0;  i < this.length;  i++)
            Back_Track.call(this[i],  'parentNode',  function () {
                _Operator_('Attribute',  [this],  _GUID_,  function (_Index_, iTimes) {
                    return  iTimes ? (parseInt(iTimes) + 1) : 1
                });
            });

        return _GUID_;
    }


/* ---------- DOM Constructor ---------- */
    function DOM_Create(TagName, AttrList) {
        var iNew,  iTag = TagName.match(/<\s*\w+[^>]*>/g);

        if (! iTag)  return [
                DOM.createTextNode(TagName)
            ];

        var iAttr = iTag.length && TagName.match(/<\s*\w+\s+\w+[^>]*>/g);

        if ((iTag.length > 1) || iAttr) {
            iNew = _Get_Set_.innerHTML.set(
                DOM.createElement('div'),  TagName
            );

            if ((iNew.length != 1)  ||  (iNew[0].nodeType != 1))
                return iNew;
        } else
            iNew = [DOM.createElement(
                TagName.match(/<\s*(\w+)[^>]*>/)[1]
            )];

        if (AttrList)  for (var AK in AttrList) {
            var iValue = AttrList[AK];
            try {
                switch (AK) {
                    case 'text':     _Get_Set_.innerText.set(iNew[0], iValue);  break;
                    case 'html':     _Get_Set_.innerHTML.set(iNew[0], iValue);  break;
                    case 'style':    if (_Type_(iValue) == 'Object') {
                        _Operator_('Style', iNew, iValue);
                        break;
                    }
                    default:         _Operator_('Attribute', iNew, AK, iValue);
                }
            } catch (iError) {
                console.error(iError);
            }
        }

        return iNew;
    }


/* ---------- DOM Selector ---------- */
    var iPseudo = {
            ':visible':    {
                feature:    {
                    display:    'none',
                    width:      0,
                    height:     0
                },
                filter:     function (iElement) {
                    var iStyle = _Operator_('Style', [iElement], [
                            'display', 'width', 'height'
                        ]);

                    for (var iKey in iStyle)
                        if (iStyle[iKey] === this.feature[iKey])
                            return false;
                    return true;
                }
            },
            ':button':     {
                feature:    _inKey_('button', 'image', 'submit', 'reset'),
                filter:     function (iElement) {
                    var iTag = iElement.tagName.toLowerCase();

                    if ((iTag == 'button') || (
                        (iTag == 'input') &&
                        (iElement.type.toLowerCase() in this.feature)
                    ))
                        return true;
                    else
                        return false;
                }
            },
            ':header':     {
                filter:    function () {
                    return  (arguments[0] instanceof HTMLHeadingElement);
                }
            },
            ':input':      {
                feature:    _inKey_('input', 'textarea', 'button', 'select'),
                filter:     function () {
                    return  (arguments[0].tagName.toLowerCase() in this.feature);
                }
            }
        };

    iPseudo[':hidden'] = {
        filter:    function () {
            return  (! iPseudo[':visible'].filter(arguments[0]));
        }
    };

    for (var _Pseudo_ in iPseudo)
        iPseudo[_Pseudo_].regexp = BOM.iRegExp(
            '(.*?)' + _Pseudo_ + "([>\\+~\\s]*.*)",  undefined,  null
        );

    var _Concat_ = function () {
            var iArgs = _Extend_([ ], arguments);

            for (var i = 0;  i < iArgs.length;  i++)
                if (
                    (typeof iArgs[i].length == 'number')  &&
                    (! (_Type_(iArgs[i]) in Type_Info.DOM.element))
                )
                    iArgs[i] = _Extend_([ ], iArgs[i]);

            return  Array.prototype.concat.apply(iArgs.shift(), iArgs);
        };

    function DOM_Search(iRoot, iSelector) {
        var _Self_ = arguments.callee,  iSet = [ ];

        _Each_(iSelector.split(/\s*,\s*/),  function () {
            try {
                iSet = _Concat_(iSet,  iRoot.querySelectorAll(arguments[1] || '*'));
            } catch (iError) {
                var _Selector_;
                for (var _Pseudo_ in iPseudo) {
                    _Selector_ = arguments[1].match(iPseudo[_Pseudo_].regexp);
                    if (_Selector_ && (_Selector_.length > 1))
                        break;
                }
                var Set_0 = _Self_(
                        iRoot,  _Selector_[1] + (_Selector_[1].match(/[>\+~]\s*$/) ? '*' : '')
                    ),
                    Set_1 = [ ];
                for (var i = 0;  i < Set_0.length;  i++)
                    if ( iPseudo[_Pseudo_].filter(Set_0[i]) ) {
                        if (_Selector_[2])
                            Set_1 = Set_1.concat(
                                _Self_(Set_0[i],  '*' + _Selector_[2])
                            );
                        else
                            Set_1.push(Set_0[i]);
                    }
                for (var i = Set_1.length - 1;  i > 0;  i--)
                    if (Set_1.indexOf(Set_1[i]) < i)
                        Set_1[i] = null;

                iSet = iSet.concat(Set_1);
            }
        });

        return iSet;
    }


/* ---------- XML Module ---------- */
    if (_Browser_.msie < 9)
        var IE_DOMParser = (function (MS_Version) {
                for (var i = 0; i < MS_Version.length; i++)  try {
                    new ActiveXObject( MS_Version[i] );
                    return MS_Version[i];
                } catch (iError) { }
            })([
                'MSXML2.DOMDocument.6.0',
                'MSXML2.DOMDocument.5.0',
                'MSXML2.DOMDocument.4.0',
                'MSXML2.DOMDocument.3.0',
                'MSXML2.DOMDocument',
                'Microsoft.XMLDOM'
            ]);

    function XML_Parse(iString) {
        iString = iString.trim();
        if ((iString[0] != '<') || (iString[iString.length - 1] != '>'))
            throw 'Illegal XML Format...';

        var iXML;

        if (DOMParser) {
            iXML = (new DOMParser()).parseFromString(iString, 'text/xml');
            var iError = iXML.getElementsByTagName('parsererror');
            if (iError.length) {
                throw  new SyntaxError(1, 'Incorrect XML Syntax !');
                console.log(iError[0]);
            }
            iXML.cookie;    //  for old WebKit core to throw Error
        } else {
            iXML = new ActiveXObject( IE_DOMParser );
            iXML.async = false;
            iXML.loadXML(iString);
            if (iXML.parseError.errorCode) {
                throw  new SyntaxError(iXML.parseError, 'Incorrect XML Syntax !');
                console.log(iXML.parseError.reason);
            }
        }
        return iXML;
    }


/* ---------- jQuery API ---------- */
    BOM.iQuery = function (Element_Set, iContext) {
        /* ----- Global Wrapper ----- */
        var _Self_ = arguments.callee;

        if (! (this instanceof _Self_))
            return  new _Self_(Element_Set, iContext);
        if (Element_Set instanceof _Self_)
            return  Element_Set;

        /* ----- Constructor ----- */
        this.length = 0;

        if (! Element_Set) return;

        if (typeof Element_Set == 'string') {
            if (Element_Set[0] != '<') {
                this.context = iContext || DOM;
                this.selector = Element_Set;
                Element_Set = DOM_Search(this.context, Element_Set);
            } else
                Element_Set = DOM_Create(
                    Element_Set,  (_Type_(iContext) == 'Object') && iContext
                );
        }
        this.add( Element_Set );
    };

    var $ = BOM.iQuery;
    $.fn = $.prototype;

    $.fn.add = function (Element_Set) {
        var iType = _Type_(Element_Set);

        if (iType == 'String')
            Element_Set = $(Element_Set, arguments[1]);
        else if (iType in Type_Info.DOM.element)
            Element_Set = [ Element_Set ];

        if (typeof Element_Set.length == 'number') {
            for (var i = 0;  i < Element_Set.length;  i++)
                if (Element_Set[i] && (
                    (Element_Set[i].nodeType == 1) ||
                    (_Type_(Element_Set[i]) in Type_Info.DOM.root)
                ))
                    Array.prototype.push.call(this, Element_Set[i]);

            if (this.length == 1)
                this.context = this[0].ownerDocument;
        }

        return this;
    };

    if (typeof BOM.jQuery != 'function') {
        BOM.jQuery = BOM.iQuery;
        BOM.$ = $;
    }

    /* ----- iQuery Static Method ----- */
    _Extend_($, {
        browser:          _Browser_,
        type:             _Type_,
        isPlainObject:    function (iValue) {
            return  iValue && (iValue.constructor === Object);
        },
        isEmptyObject:    function () {
            for (var iKey in arguments[0])
                return false;
            return true;
        },
        isData:           function () {
            return  (this.type(arguments[0]) in Type_Info.Data);
        },
        each:             _Each_,
        extend:           _Extend_,
        makeArray:        function () {
            return  this.extend([ ], arguments[0]);
        },
        inArray:          function () {
            return  Array.prototype.indexOf.call(arguments[0], arguments[1]);
        },
        contains:         function (iParent, iChild) {
            if (! iChild)  return false;

            if ($.browser.modern)
                return  !!(iParent.compareDocumentPosition(iChild) & 16);
            else
                return  (iParent !== iChild) && iParent.contains(iChild);
        },
        trim:             function () {
            return  arguments[0].trim();
        },
        parseJSON:        BOM.JSON.parse,
        parseXML:         XML_Parse,
        param:            function (iObject) {
            var iParameter = [ ],  iValue;

            if ( $.isPlainObject(iObject) )
                for (var iName in iObject) {
                    iValue = iObject[iName];

                    if ( $.isPlainObject(iValue) )
                        iValue = BOM.JSON.stringify(iValue);
                    else if (! $.isData(iValue))
                        continue;

                    iParameter.push(iName + '=' + iValue);
                }
            else if (iObject instanceof $)
                for (var i = 0;  i < iObject.length;  i++)
                    iParameter.push(iObject[i].name + '=' + iObject[i].value);

            return iParameter.join('&');
        },
        paramJSON:        function (Args_Str) {
            Args_Str = (Args_Str || BOM.location.search).match(/[^\?&\s]+/g);
            if (! Args_Str)  return { };

            var _Args_ = {
                    toString:    function () {
                        return  BOM.JSON.format(this);
                    }
                };

            for (var i = 0, iValue; i < Args_Str.length; i++) {
                Args_Str[i] = Args_Str[i].split('=');

                iValue = BOM.decodeURIComponent(
                    Args_Str[i].slice(1).join('=')
                );
                try {
                    iValue = BOM.JSON.parse(iValue);
                } catch (iError) { }

                _Args_[ Args_Str[i][0] ] = iValue;
            }

            return  Args_Str.length ? _Args_ : { };
        },
        fileName:         function () {
            return  (arguments[0] || BOM.location.pathname)
                    .split('?')[0].split('/').slice(-1)[0];
        },
        data:             function (iElement, iName, iValue) {
            return  _Operator_('Data', [iElement], iName, iValue);
        }
    });

    _Extend_($, _Time_);

    /* ----- iQuery Instance Method ----- */
    _Extend_($.fn, {
        splice:             Array.prototype.splice,
        jquery:             '1.9.1',
        iquery:             '1.0',
        pushStack:          function () {
            var $_New = $(arguments[0]);
            $_New.prevObject = this;
            return $_New;
        },
        eq:                 function () {
            return  this.pushStack( this[arguments[0]] );
        },
        index:              function (iTarget) {
            if (! iTarget)
                return  Back_Track.call(
                        this[0],
                        ($.browser.msie < 9) ? 'previousSibling' : 'previousElementSibling'
                    ).length;

            var iType = $.type(iTarget);
            switch (true) {
                case (iType == 'String'):
                    return  $.inArray($(iTarget), this[0]);
                case (iType in Type_Info.DOM.set):    {
                    iTarget = iTarget[0];
                    iType = $.type(iTarget);
                }
                case (iType in Type_Info.DOM.element):
                    return  $.inArray(this, iTarget);
            }
            return -1;
        },
        slice:              function () {
            return  this.pushStack( [ ].slice.apply(this, arguments) );
        },
        each:               function () {
            $.each(this, arguments[0]);

            return this;
        },
        is:                 function (iSelector) {
            return  (
                    $.inArray(
                        $(iSelector,  this[0] && this[0].parentNode),
                        this[0]
                    ) > -1
                );
        },
        filter:             function (iSelector) {
            var $_Filter = $(iSelector),
                $_Result = [ ];

            if ( $_Filter.length ) {
                for (var i = 0;  i < this.length;  i++)
                    if ($.inArray($_Filter, this[i]) > -1)
                        $_Result.push( this[i] );
            }

            return this.pushStack($_Result);
        },
        not:                function () {
            var $_Not = $(arguments[0]),
                $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                if ($.inArray($_Not, this[i]) < 0)
                    $_Result.push(this[i]);

            return this.pushStack($_Result);
        },
        attr:               function () {
            return  _Operator_('Attribute', this, arguments[0], arguments[1]);
        },
        removeAttr:         function (iAttr) {
            iAttr = iAttr.trim().split(/\s+/);

            for (var i = 0;  i < iAttr.length;  i++)
                this.attr(iAttr[i], null);

            return this;
        },
        prop:               function () {
            return  _Operator_('Property', this, arguments[0], arguments[1]);
        },
        data:               function () {
            return  _Operator_('Data', this, arguments[0], arguments[1]);
        },
        addBack:            function () {
            var _GUID_ = $.guid();

            var $_Result = $(
                    _Concat_(this, this.prevObject)
                ).attr('iquery', _GUID_);

            return  this.pushStack(
                    $('*[iquery="' + _GUID_ + '"]').removeAttr('iquery')
                );
        },
        parent:             function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                if ($.inArray($_Result, this[i].parentNode) == -1)
                    $_Result.push( this[i].parentNode );

            $_Result = $($_Result);
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return this.pushStack($_Result);
        },
        parents:            function () {
            var _GUID_ = _Parents_.call(this);
            var $_Result = $('*[' + _GUID_ + ']').removeAttr(_GUID_);
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  this.pushStack( Array.prototype.reverse.call($_Result) );
        },
        sameParents:        function () {
            var _GUID_ = _Parents_.call(this);
            var iTimes = $(DOM.documentElement).attr(_GUID_);

            var $_Result = $(['*[', _GUID_, '="', iTimes, '"]'].join(''))
                    .removeAttr(_GUID_);

            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  this.pushStack( Array.prototype.reverse.call($_Result) );
        },
        parentsUntil:       function () {
            return  this.parents().not(
                    $(arguments[0]).parents().addBack()
                );
        },
        children:           function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = _Concat_($_Result, this[i].children);

            $_Result = $($_Result);
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return this.pushStack($_Result);
        },
        contents:           function () {
            var $_Result = [ ],
                Type_Filter = parseInt(arguments[0]);

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    (this[i].tagName.toLowerCase() != 'iframe') ?
                        $.makeArray(this[i].childNodes) : this[i].contentWindow.document
                );

            if ($.type(Type_Filter) == 'Number')
                for (var i = 0;  i < $_Result.length;  i++)
                    if ($_Result[i].nodeType != Type_Filter)
                        $_Result[i] = null;

            return this.pushStack($_Result);
        },
        siblings:           function () {
            var _GUID_ = $.guid();
            var $_This = this.prop('iQuery_ID', _GUID_);

            var $_Result = this.parent().children();
            for (var i = 0;  i < $_Result.length;  i++)
                if ($_Result[i].iQuery_ID == _GUID_)
                    $_Result[i] = $_Result[i].iQuery_ID = null;

            $_Result = $( $.makeArray($_Result) );
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return this.pushStack($_Result);
        },
        find:               function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = _Concat_($_Result,  $(arguments[0], this[i]));

            return this.pushStack($_Result);
        },
        detach:             function () {
            for (var i = 0;  i < this.length;  i++)
                if (this[i].parentNode)
                    this[i].parentNode.removeChild(this[i]);

            return this;
        },
        remove:             function () {
            return this.detach().data();
        },
        empty:              function () {
            this.children().remove();

            for (var i = 0, iChild;  i < this.length;  i++) {
                iChild = this[i].childNodes;
                for (var j = 0;  j < iChild.length;  j++)
                    this[i].removeChild(iChild[j]);
            }

            return this;
        },
        text:               function (iText) {
            var iGetter = (! $.isData(iText)),  iResult = [ ];

            if (! iGetter)  this.empty();

            for (var i = 0;  i < this.length;  i++)
                if (iGetter)
                    iResult.push( _Get_Set_.innerText.get(this[i]) );
                else
                    _Get_Set_.innerText.set(this[i], iText);

            return  iResult.length ? iResult.join('') : this;
        },
        html:               function (iHTML) {
            if (! $.isData(iHTML))
                return this[0].innerHTML;

            this.empty();

            for (var i = 0;  i < this.length;  i++)
                _Get_Set_.innerHTML.set(this[i], iHTML);

            return  this;
        },
        css:                function () {
            return  _Operator_('Style', this, arguments[0], arguments[1]);
        },
        hide:               function () {
            for (var i = 0, $_This;  i < this.length;  i++) {
                $_This = $(this[i]);
                $_This.data('display', $_This.css('display'))
                    .css('display', 'none');
            }
            return this;
        },
        show:               function () {
            for (var i = 0, $_This;  i < this.length;  i++) {
                $_This = $(this[i]);
                $_This.css({
                    display:       $_This.data('display') || 'origin',
                    visibility:    'visible',
                    opacity:       1
                });
            }
            return this;
        },
        width:              function () {
            switch ( $.type(this[0]) ) {
                case 'Document':    return  Math.max(
                        DOM.documentElement.scrollWidth,
                        DOM.body.scrollWidth
                    );  break;
                case 'Window':      return  BOM.innerWidth || Math.max(
                        DOM.documentElement.clientWidth,
                        DOM.body.clientWidth
                    );  break;
                default:            return  this.css('width', arguments[0]);
            }
        },
        height:             function () {
            switch ( $.type(this[0]) ) {
                case 'Document':    return  Math.max(
                        DOM.documentElement.scrollHeight,
                        DOM.body.scrollHeight
                    );  break;
                case 'Window':      return  BOM.innerHeight || Math.max(
                        DOM.documentElement.clientHeight,
                        DOM.body.clientHeight
                    );  break;
                default:            return  this.css('height', arguments[0]);
            }
        },
        position:           function () {
            return  {
                    left:    this[0].offsetLeft,
                    top:     this[0].offsetTop
                };
        },
        offset:             DOM_Offset,
        addClass:           function (new_Class) {
            if (typeof new_Class != 'string')  return this;

            new_Class = new_Class.trim().split(/\s+/);

            return  this.attr('class',  function (_Index_, old_Class) {
                    old_Class = (old_Class || '').trim().split(/\s+/);

                    for (var i = 0;  i < new_Class.length;  i++)
                        if ($.inArray(old_Class, new_Class[i]) == -1)
                            old_Class.push( new_Class[i] );

                    return  old_Class.join(' ').trim();
                });
        },
        removeClass:        function (iClass) {
            if (typeof iClass != 'string')  return this;

            iClass = iClass.trim().split(/\s+/);

            return  this.attr('class',  function (_Index_, old_Class) {
                    old_Class = (old_Class || '').trim().split(/\s+/);
                    if (! old_Class[0])  return;

                    for (var i = 0;  i < old_Class.length;  i++)
                        if ($.inArray(iClass, old_Class[i]) > -1)
                            delete old_Class[i];

                    return  old_Class.join(' ').trim();
                });
        },
        hasClass:           function (iClass) {
            if (typeof iClass != 'string')  return false;

            iClass = iClass.trim();

            if (! DOM.documentElement.classList)
                return  ((' ' + this.attr('class') + ' ').indexOf(' ' + iClass + ' ') > -1);
            else
                return  this[0].classList.contains(iClass);
        },
        bind:               function (iType, iCallback) {
            iType = iType.trim().split(/\s+/);

            return  this.each(function () {
                    var $_This = $(this);

                    for (var i = 0, Event_Data;  i < iType.length;  i++) {
                        Event_Data = $_This.data('_event_') || { };

                        if (! Event_Data[iType[i]]) {
                            Event_Data[iType[i]] = [ ];
                            this.addEventListener(iType[i], Proxy_Handler);
                        }
                        Event_Data[iType[i]].push(iCallback);

                        $_This.data('_event_', Event_Data);
                    }
                });
        },
        unbind:             function (iType, iCallback) {
            iType = iType.trim().split(/\s+/);

            return  this.each(function () {
                    var $_This = $(this);

                    for (var i = 0, Event_Data, This_Event;  i < iType.length;  i++) {
                        Event_Data = $_This.data('_event_') || { };
                        This_Event = Event_Data[iType[i]];

                        if (iCallback)
                            This_Event.splice(This_Event.indexOf(iCallback), 1);
                        if ((! iCallback) || (! This_Event.length))
                            Event_Data[iType[i]] = null;
                        if (! Event_Data[iType[i]])
                            this.removeEventListener(iType[i], Proxy_Handler);

                        $_This.data('_event_', Event_Data);
                    }
                });
        },
        on:                 function (iType, iFilter, iCallback) {
            if (typeof iFilter != 'string')
                return  this.bind.apply(this, arguments);
            else
                return  this.bind(iType, function () {
                        var iArgs = $.makeArray(arguments);

                        var $_Filter = $(iFilter, this),
                            $_Target = $(iArgs[0].target),
                            iReturn;

                        var $_Patch = $_Target.parents();
                        Array.prototype.unshift.call($_Patch, $_Target[0]);

                        for (var i = 0, _Return_;  i < $_Patch.length;  i++) {
                            if ($_Patch[i] === this)  break;
                            if ($.inArray($_Filter, $_Patch[i]) == -1)  continue;

                            if (iArgs[1] === null)
                                iArgs = [ iArgs[0] ].concat( $($_Patch[i]).data('_trigger_') );
                            _Return_ = iCallback.apply($_Patch[i], iArgs);
                            if (iReturn !== false)
                                iReturn = _Return_;
                        }

                        return iReturn;
                    });
        },
        one:                function () {
            var iArgs = $.makeArray(arguments);
            var iCallback = iArgs[iArgs.length - 1];

            iArgs.splice(-1,  1,  function () {
                $.fn.unbind.apply($(this), iArgs);

                return  iCallback.apply(this, arguments);
            });

            return  this.on.apply(this, iArgs);
        },
        trigger:            function (iType, iData) {
            if (typeof iType != 'string') {
                var iEvent = iType;
                iType = iEvent.type;
            }
            return Event_Trigger.call(
                    this,
                    (iType in Type_Info.DOM_Event) ? 'HTMLEvents' : 'CustomEvent',
                    iType,
                    iData
                );
        },
        triggerHandler:     function () {
            var iHandler = $(this[0]).data('_event_'),  iReturn;
            iHandler = iHandler && iHandler[arguments[0]];

            if (! iHandler)  return;

            for (var i = 0;  i < iHandler.length;  i++)
                iReturn = iHandler[i].apply(
                    this[0],  _Concat_([ ], arguments)
                );

            return iReturn;
        },
        clone:              function (iDeep) {
            var $_Result = [ ];

            for (var i = 0, iEvent;  i < this.length;  i++) {
                $_Result[i] = this[i].cloneNode(iDeep);
                iEvent = _Get_Set_.Data.clone(this[i], $_Result[i]);

                for (var iType in iEvent)
                    iNew.addEventListener(iType, Proxy_Handler, false);
            }

            return this.pushStack($_Result);
        },
        append:             function () {
            var $_Child = $(arguments[0], arguments[1]),
                DOM_Cache = DOM.createDocumentFragment();

            return  this.each(function (Index) {
                    var _Child_ = Index ? $_Child.clone(true) : $_Child,
                        _Cache_ = DOM_Cache.cloneNode();

                    for (var i = 0;  i < _Child_.length;  i++)
                        _Cache_.appendChild( _Child_[i] );

                    this.appendChild(_Cache_);
                });
        },
        appendTo:           function () {
            $(arguments[0], arguments[1]).append(this);

            return  this;
        },
        before:             function () {
            var $_Brother = $(arguments[0], arguments[1]),
                DOM_Cache = DOM.createDocumentFragment();

            return  this.each(function (Index) {
                    var _Brother_ = Index ? $_Brother.clone(true) : $_Brother,
                        _Cache_ = DOM_Cache.cloneNode();

                    for (var i = 0;  i < _Brother_.length;  i++)
                        _Cache_.appendChild( _Brother_[i] );

                    this.parentNode.insertBefore(_Cache_, this);
                });
        },
        prepend:            function () {
            if (this.length) {
                if (! this[0].children.length)
                    $.fn.append.apply(this, arguments);
                else
                    $.fn.before.apply($(this[0].children[0]), arguments);
            }
            return this;
        },
        prependTo:          function () {
            $(arguments[0], arguments[1]).prepend(this);

            return  this;
        },
        val:                function () {
            if (! $.isData(arguments[0]))
                return  this[0] && this[0].value;
            else
                return  this.attr('value', arguments[0]);
        },
        serializeArray:     function () {
            var $_Value = this.find('*[name]').not(':button, [disabled]'),
                iValue = [ ];

            for (var i = 0;  i < $_Value.length;  i++) {
                if ($_Value[i].type.match(/radio|checkbox/i)  &&  (! $_Value[i].checked))
                    continue;

                iValue.push({
                    name:     $_Value[i].name,
                    value:    $_Value[i].value
                });
            }

            return iValue;
        }
    });

    /* ----- HTTP Client ----- */
    function X_Domain(Target_URL) {
        var iLocation = BOM.location;
        Target_URL = Target_URL.match(/^(\w+?(s)?:)?\/\/([\w\d:]+@)?([^\/\:\@]+)(:(\d+))?/);

        if (! Target_URL)  return false;
        if (Target_URL[1] && (Target_URL[1] != iLocation.protocol))  return true;
        if (Target_URL[4] && (Target_URL[4] != iLocation.hostname))  return true;
        var iPort = iLocation.port || (
                (iLocation.protocol == 'http:') && 80
            ) || (
                (iLocation.protocol == 'https:') && 443
            );
        if (Target_URL[6] && (Target_URL[6] != iPort))  return true;
    }

    var XHR_Open = XMLHttpRequest.prototype.open;
    var XHR_Proto = {
            open:           function () {
                var iXHR = this,
                    XHR_XD = X_Domain(arguments[1]);

                this[XHR_XD ? 'onload' : 'onreadystatechange'] = function () {
                    if (! (XHR_XD || (iXHR.readyState == 4)))  return;

                    if (typeof iXHR.onready == 'function')
                        iXHR.onready.call(iXHR, iXHR.responseAny());
                    iXHR = null;
                };
                XHR_Open.apply(this, arguments);

                this.requestArgs = arguments;
            },
            responseAny:    function () {
                var iContent = this.responseText,
                    iType = this.responseType || 'text/plain';

                switch ( iType.split('/')[1] ) {
                    case 'plain':    ;
                    case 'json':     {
                        var _Content_ = iContent.trim();
                        try {
                            iContent = BOM.JSON.parseAll(_Content_);
                        } catch (iError) {
                            if ($.browser.msie != 9)  try {
                                iContent = $.parseXML(_Content_);
                            } catch (iError) { }
                        }
                        break;
                    }
                    case 'xml':      iContent = this.responseXML;
                }

                return iContent;
            },
            timeOut:        function (TimeOut_Seconds, TimeOut_Callback) {
                var iXHR = this;

                $.wait(TimeOut_Seconds, function () {
                    iXHR.onreadystatechange = null;
                    iXHR.abort();
                    TimeOut_Callback.call(iXHR);
                });
            },
            retry:          function (Wait_Seconds) {
                var iXHR = this;

                $.wait(Wait_Seconds, function () {
                    iXHR.open.apply(iXHR, iXHR.requestArgs);
                });
            }
        };

    $.extend(XMLHttpRequest.prototype, XHR_Proto);

    if ($.browser.msie < 10) {
        XHR_Proto.setRequestHeader = function () {
            console.warn("IE 8/9 XDR doesn't support Changing HTTP Headers...");
        };
        $.extend(BOM.XDomainRequest.prototype, XHR_Proto);
    }

    function ECDS_Post(iCallback) {
        var $_Button = this.find(':button').attr('disabled', true),
            iTarget = this.attr('target');
        if ((! iTarget) || (iTarget in Type_Info.Target)) {
            iTarget = $.guid('iframe');
            this.attr('target', iTarget);
        }

        var $_iFrame = $('iframe[name="' + iTarget + '"]');
        if (! $_iFrame.length)
            $_iFrame = $('<iframe />', {
                frameBorder:          0,
                allowTransparency:    true,
                name:                 iTarget
            });

        var $_This = this;
        $_iFrame.hide().appendTo( this.parent() ).on('load', function () {
            $_Button.prop('disabled', false);
            try {
                var $_Content = $(this).contents();
                iCallback.call(
                    $_This[0],  $_Content.find('body').text(),  $_Content
                );
            } catch (iError) { }
        });
        this.submit();
    }

    function iHTTP(iURL, iData, iCallback) {
        if ($.type(iData) == 'HTMLElement') {
            var $_Form = $(iData);
            iData = { };

            if ($_Form[0].tagName.toLowerCase() == 'form') {
                if (! $_Form.find('input[type="file"]').length) {
                    var _Data_ = $_Form.serializeArray();
                    for (var i = 0;  i < _Data_.length;  i++)
                        iData[_Data_[i].name] = _Data_[i].value;
                } else {
                    if (! ($.browser.msie < 10))
                        iData = new FormData($_Form[0]);
                    else {
                        ECDS_Post.call($_Form, iCallback);
                        return;
                    }
                }
            }
        }
        if ( $.isPlainObject(iData) )
            iData = BOM.encodeURI( $.param(iData || { }) );

        var HTTP_Client = new BOM[
                (X_Domain(iURL) && ($.browser.msie < 10))  ?  'XDomainRequest' : 'XMLHttpRequest'
            ]();
        HTTP_Client.onready = iCallback;
        HTTP_Client.open(iData ? 'POST' : 'GET',  iURL,  true);
        HTTP_Client.withCredentials = true;
        if (typeof iData == 'string')
            HTTP_Client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        HTTP_Client.setRequestHeader('Accept', '*/*');
        HTTP_Client.send(iData);

        return HTTP_Client;
    }

    $.extend($, {
        JSONP:    { },
        get:      function (iURL, iData, iCallback) {
            iURL = iURL.split('?');
            iURL[1] = iURL.slice(1).join('?');
            iURL.length = 2;

            if (typeof iData == 'function') {
                iCallback = iData;
                iData = { };
            }

            var iArgs = $.paramJSON(iURL[1]),
                iJSONP = iURL[1].match(/(\w+)=\?/);

            if (iJSONP) {
                var JSONP_GUID = $.guid();
                this.JSONP[JSONP_GUID] = iCallback;
                iArgs[iJSONP[1]] = 'iQuery.JSONP.' + JSONP_GUID;
            }

            iURL = iURL[0] + '?' + $.param(
                $.extend(iArgs,  iData,  {_: $.now()})
            );
            if (! iJSONP)
                return  iHTTP(iURL, null, iCallback);

            $('<script />', {
                src:       iURL,
                onload:    function () {
                    var $_JSONP = $(this);

                    $.wait(1,  function () {
                        delete $.JSONP[JSONP_GUID];
                        $_JSONP.remove();
                    });
                }
            }).appendTo(DOM.head);
        },
        post:     iHTTP
    });

    $.getJSON = $.get;

    /* ----- Event ShortCut ----- */
    $.fn.off = $.fn.unbind;

    var iShortCut = $.extend(_inKey_('tap', 'press', 'swipe'),  Type_Info.DOM_Event),
        no_ShortCut = _inKey_(
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousewheel',
            'load', 'DOMContentLoaded',
            'DOMAttrModified', 'DOMAttributeNameChanged',
            'DOMCharacterDataModified',
            'DOMElementNameChanged',
            'DOMNodeInserted', 'DOMNodeInsertedIntoDocument',
            'DOMNodeRemoved',  'DOMNodeRemovedFromDocument',
            'DOMSubtreeModified'
        );

    function Event_Method(iName) {
        return  function () {
                if (! arguments[0]) {
                    for (var i = 0;  i < this.length;  i++)  try {
                        this[i][iName]();
                    } catch (iError) {
                        $(this[i]).trigger(iName);
                    }
                } else
                    this.bind(iName, arguments[0]);

                return this;
            };
    }

    for (var iName in iShortCut)
        if (! (iName in no_ShortCut))
            $.fn[iName] = Event_Method(iName);

    if ($.browser.mobile)  $.fn.click = $.fn.tap;

/* ---------- jQuery+  v3.9 ---------- */

    /* ----- 远程 Console  v0.1 ----- */

    //  Thank for raphealguo --- http://rapheal.sinaapp.com/2014/11/06/javascript-error-monitor/

    var Console_URL = $('head link[rel="console"]').attr('href');

    BOM.onerror = function (iMessage, iURL, iLine, iColumn, iError){
        $.wait(0,  function () {
            var iData = {
                    message:    iMessage,
                    url:        iURL,
                    line:       iLine,
                    column:     iColumn  ||  (BOM.event && BOM.event.errorCharacter)  ||  0
                };

            if (iError && iError.stack)
                iData.stack = (iError.stack || iError.stacktrace).toString();

            if (Console_URL) {
                if (iData.stack)
                    $.post(Console_URL, iData);
                else
                    $.get(Console_URL, iData);
            }
        });

        return true;
    };

    /* ----- Hash 算法集合（浏览器原生） v0.1 ----- */

    //  Thank for "emu" --- http://blog.csdn.net/emu/article/details/39618297

    function BufferToString(iBuffer){
        var iDataView = new DataView(iBuffer),
            iResult = [ ];

        for (var i = 0, iTemp;  i < iBuffer.byteLength;  i += 4) {
            iTemp = iDataView.getUint32(i).toString(16);
            iResult.push(
                ((iTemp.length == 8) ? '' : '0') + iTemp
            );
        }
        return iResult.join('');
    }

    $.dataHash = function (iAlgorithm, iData, iCallback, iFailback) {
        var iCrypto = BOM.crypto || BOM.msCrypto;
        var iSubtle = iCrypto.subtle || iCrypto.webkitSubtle;

        iAlgorithm = iAlgorithm || 'SHA-512';
        iFailback = iFailback || iCallback;

        try {
            iData = iData.split('');
            for (var i = 0;  i < iData.length;  i++)
                iData[i] = iData[i].charCodeAt(0);

            var iPromise = iSubtle.digest(
                    {name:  iAlgorithm},
                    new Uint8Array(iData)
                );

            if(typeof iPromise.then == 'function')
                iPromise.then(
                    function() {
                        iCallback.call(this, BufferToString(arguments[0]));
                    },
                    iFailback
                );
            else
                iPromise.oncomplete = function(){
                    iCallback.call(this,  BufferToString( arguments[0].target.result ));
                };
        } catch (iError) {
            iFailback(iError);
        }
    };

    /* ----- CSS 规则操作  v0.7 ----- */

    function CSS_Rule2Text(iRule) {
        var Rule_Text = [''],  Rule_Block,  _Rule_Block_;

        $.each(iRule,  function (iSelector) {
            Rule_Block = iSelector + ' {';
            _Rule_Block_ = [ ];

            for (var iAttribute in this)
                _Rule_Block_.push(
                    _Operator_('Style', [null], iAttribute, this[iAttribute])
                        .replace(/^(\w)/m,  Code_Indent + '$1')
                );

            Rule_Text.push(
                [Rule_Block, _Rule_Block_.join(";\n"), '}'].join("\n")
            );
        });
        Rule_Text.push('');

        return Rule_Text.join("\n");
    }

    $.cssRule = function (iMedia, iRule) {
        if (typeof iMedia != 'string') {
            iRule = iMedia;
            iMedia = null;
        }

        var CSS_Text = CSS_Rule2Text(iRule);
        if (iMedia)  CSS_Text = [
                '@media ' + iMedia + ' {',
                CSS_Text.replace(/\n/m, "\n    "),
                '}'
            ].join("\n");

        var $_Style = $('<style />', {
                type:       'text/css',
                'class':    'jQuery_CSS-Rule'
            });

        if ($.browser.modern)
            $_Style.html(CSS_Text);
        else
            $_Style[0].styleSheet.cssText = CSS_Text;

        $_Style.appendTo(DOM.head);

        return $_Style[0].sheet;
    };

    $.fn.cssRule = function (iRule, iCallback) {
        return  this.each(function () {
                var $_This = $(this);
                var _GUID_ = $_This.data('css') || $.guid();

                $(this).attr('data-css', _GUID_);
                for (var iSelector in iRule) {
                    iRule['*[data-css="' + _GUID_ + '"]' + iSelector] = iRule[iSelector];
                    delete iRule[iSelector];
                }

                var iSheet = $.cssRule(iRule);

                if (iCallback)
                    iCallback.call(this, iSheet);
            });
    };

    var Pseudo_RE = /:{1,2}[\w\-]+/g;

    $.cssPseudo = function () {
        var Pseudo_Rule = [ ];

        $.each(arguments[0] || DOM.styleSheets,  function () {
            var iRule = this.cssRules;
            if (! iRule)  return;

            for (var i = 0, iPseudo;  i < iRule.length;  i++)
                if (! iRule[i].cssRules) {
                    iPseudo = iRule[i].cssText.match(Pseudo_RE);
                    if (! iPseudo)  continue;

                    for (var j = 0;  j < iPseudo.length;  j++)
                        iPseudo[j] = iPseudo[j].split(':').slice(-1)[0];
                    iRule[i].pseudo = iPseudo;
                    iRule[i].selectorText = iRule[i].selectorText ||
                        iRule[i].cssText.match(/^(.+?)\s*\{/)[1];
                    Pseudo_Rule.push(iRule[i]);
                } else
                    arguments.callee.call(iRule[i], i, iRule[i]);
        });

        return Pseudo_Rule;
    };

    /* ----- DOM UI 数据读写  v0.3 ----- */
    function Value_Operator(iValue, iResource) {
        var $_This = $(this),  iReturn;

        switch ( this.tagName.toLowerCase() ) {
            case 'img':      {
                iReturn = $_This.one('load',  function () {
                    $(this).trigger('Ready');
                }).addClass('jQuery_Loading').attr('src', iValue);
                iResource.count++ ;
                console.log(this);
            }  break;
            case 'input':    iReturn = $_This.attr('value', iValue);  break;
            default:         {
                var _Set_ = iValue || $.isData(iValue),
                    End_Element = (! this.children.length),
                    _BGI_ = (typeof iValue == 'string') && iValue.match(/^\w+:\/\/[^\/]+/);

                if (_Set_) {
                    if ((! End_Element) && _BGI_)
                        $_This.css('background-image',  'url("' + iValue + '")');
                    else
                        $_This.html(iValue);
                } else {
                    _BGI_ = $_This.css('background-image').match(/^url\(('|")?([^'"]+)('|")?\)/);
                    _BGI_ = _BGI_ && _BGI_[2];
                    iReturn = End_Element ? $_This.text() : _BGI_;
                    iReturn = $.isData(iReturn) ? iReturn : _BGI_;
                }
            }
        }
        return iReturn;
    }

    $.fn.value = function (iFiller) {
        if (! iFiller)
            return Value_Operator.call(this[0]);
        else if ( $.isPlainObject(iFiller) )
            var Data_Set = true;

        var $_This = this,
            Resource_Ready = {count:  0};

        this.on('Ready',  'img.jQuery_Loading',  function () {
            $(this).removeClass('jQuery_Loading');
            if (--Resource_Ready.count == 0)
                $_This.trigger('Ready');
            console.log(Resource_Ready.count, this);
            return false;
        });

        for (var i = 0, iName;  i < this.length;  i++) {
            iName = this[i].getAttribute('name');

            Value_Operator.call(
                this[i],
                Data_Set  ?  iFiller[iName]  :  iFiller.call(this[i], iName),
                Resource_Ready
            );
        }
        return this;
    };

    /* ----- jQuery 选择符合法性判断  v0.1 ----- */

    $.is_Selector = function (iString) {
        if (! iString)  return false;

        iString = $.trim(
            iString.replace(/([^\.])(\.|#|\[|:){1,2}[^\.#\[:\s>\+~]+/, '$1')
        );
        if (! iString)  return true;

        if ($('<' + iString + ' />')[0] instanceof HTMLUnknownElement)
            return false;
        return true;
    };

    /* ----- jQuery 对象 所在页面 URL 路径  v0.1 ----- */

    $.fn.pagePath = function () {
        var _PP = this[0].baseURI || this[0].ownerDocument.URL;
        _PP = _PP.split('/');
        if (_PP.length > 3) _PP.pop();
        _PP.push('');
        return _PP.join('/');
    };

    /* ----- jQuery 元素 z-index 独立方法  v0.2 ----- */

    function Get_zIndex($_DOM) {
        var _zIndex_ = $_DOM.css('z-index');
        if (_zIndex_ != 'auto')  return parseInt(_zIndex_);

        var $_Parents = $_DOM.parents();
        _zIndex_ = 0;

        $_Parents.each(function () {
            var _Index_ = $(this).css('z-index');

            _zIndex_ = _zIndex_ + (
                (_Index_ == 'auto')  ?  1  :  _Index_
            );
        });

        return ++_zIndex_;
    }

    function Set_zIndex() {
        var $_This = $(this),  _Index_ = 0;

        $_This.siblings().addBack().filter(':visible').each(function () {
            _Index_ = Math.max(_Index_, Get_zIndex( $(this) ));
        });
        $_This.css('z-index', ++_Index_);
    }

    $.fn.zIndex = function (new_Index) {
        if (! $.isData(new_Index))
            return  Get_zIndex(this.eq(0));
        else if (new_Index == '+')
            return  this.each(Set_zIndex);
        else
            return  this.css('z-index',  parseInt(new_Index) || 'auto');
    };

    /* ----- Form 元素 无刷新提交  v0.4 ----- */
    $.fn.post = function (iCallback) {
        if (! this.length)  return this;

        var $_Form = (
                (this[0].tagName.toLowerCase() == 'form') ?
                    this : this.find('form')
            ).eq(0);
        if (! $_Form.length)  return this;

        var $_Button = $_Form.find(':button').attr('disabled', true);
        $_Form.one('submit',  function (iEvent) {
            iEvent.preventDefault();
            iEvent.stopPropagation();
            $_Button.attr('disabled', true);

            if ( this.checkValidity() )
                $.post(this.action,  this,  function () {
                    $_Button.prop('disabled', false);
                    iCallback.call($_Form[0], arguments[0]);
                });
            else
                $_Button.prop('disabled', false);
        });
        $_Button.prop('disabled', false);

        return this;
    };

})(self, self.document);


 
/* ----- W3C Event Shim ----- */
(function (BOM, DOM, $) {

    if ( $.browser.modern )  return;

    BOM.HTMLEvents = function (iEvent) {
        $.extend(this, DOM.createEventObject());

        if (! iEvent)  return;
        
        $.extend(this, {
            type:               iEvent.type,
            target:             iEvent.srcElement,
            which:              (iEvent.type && (iEvent.type.slice(0, 3) == 'key'))  ?
                iEvent.keyCode  :  [0, 1, 3, 0, 2, 0, 0, 0][iEvent.button],
            relatedTarget:      ({
                mouseover:     iEvent.fromElement,
                mouseout:      iEvent.toElement,
                mouseenter:    iEvent.fromElement || iEvent.toElement,
                mouseleave:    iEvent.toElement || iEvent.fromElement
            })[iEvent.type],
            bubbles:            true,
            eventPhase:         3,
            view:               BOM,
            isTrusted:          false,
            propertyName:       iEvent.propertyName
        });
    };

    $.extend(BOM.HTMLEvents.prototype, {
        initEvent:          function () {
            $.extend(this, {
                type:          arguments[0],
                bubbles:       !! arguments[1],
                cancelable:    !! arguments[2]
            });
        },
        preventDefault:     function () {
            BOM.event.returnValue = false;
            this.defaultPrevented = true;
        },
        stopPropagation:    function () {
            BOM.event.cancelBubble = true;
        }
    });

    BOM.CustomEvent = function () {
        BOM.HTMLEvents.call(this, arguments[0]);
    };
    BOM.CustomEvent.prototype = new BOM.HTMLEvents();
    BOM.CustomEvent.prototype.initCustomEvent = function () {
        $.extend(this, {
            type:          arguments[0],
            bubbles:       !! arguments[1],
            cancelable:    !! arguments[2],
            detail:        arguments[3] || 0
        });
    };

    DOM.createEvent = function () {
        return  new BOM[arguments[0]]();
    };

    function IE_Event_Handler(iElement, iCallback) {
        return  function () {
                var iEvent = new HTMLEvents(BOM.event),  Loaded;

                switch (iEvent.type) {
                    case 'readystatechange':    iEvent.type = 'load';
//                      Loaded = iElement.readyState.match(/loaded|complete/);  break;
                    case 'load':
                        Loaded = (iElement.readyState == 'loaded');  break;
                    case 'propertychange':      {
                        var iType = iEvent.propertyName.match(/^on(.+)/i);
                        if (iType && iElement.attributes[iEvent.propertyName].expando)
                            iEvent.type = iType[1];
                        else {
                            iEvent.type = 'DOMAttrModified';
                            iEvent.attrName = iEvent.propertyName;
                        }
                    }
                    default:                    Loaded = true;
                }
                if (Loaded  &&  (typeof iCallback == 'function'))
                    iCallback.call(iElement, iEvent);
            };
    }

    function IE_Event_Type(iType) {
        var $_This = $(this);

        if (! (('on' + iType) in this.constructor.prototype)) {
            if (! $_This.data('custom-event')) {
                $_This.data('custom-event', true);
                return 'propertychange';
            } else
                return '';
        } else if (($.type(this) != 'Window') && (iType == 'load'))
            return 'readystatechange';

        return iType;
    }

    var IE_Event_Method = {
            addEventListener:       function (iType, iCallback) {
                var $_This = $(this);

                //  Custom DOM Event
                var _Type_ = 'on' + iType;
                if (! (_Type_ in this.constructor.prototype))
                    if (! $_This.attr(_Type_))
                        $_This.attr(_Type_, $.now());

                iType = IE_Event_Type.call(this, iType);

                //  DOM Content Loading
                var This_DOM = ($.type(this) == 'Document') ?
                        this : (this.ownerDocument || this.document);
                if (iCallback && (iType == 'DOMContentLoaded')) {
                    if (BOM !== BOM.top)  iType = 'load';
                    else {
                        $.every(0.01, function () {
                            try {
                                This_DOM.documentElement.doScroll('left');
                                iCallback.call(This_DOM, BOM.event);
                                return false;
                            } catch (iError) {
                                return;
                            }
                        });
                        return;
                    }
                }
                if (! iType) return;

                $_This.data('ie-handler',  function (_Index_, iHandler) {
                    iHandler = iHandler || {
                        user:     [ ],
                        proxy:    [ ]
                    };
                    iHandler.user.push(iCallback);
                    iHandler.proxy.push( IE_Event_Handler(this, iCallback) );
                    this.attachEvent(
                        'on' + iType,  iHandler.proxy[iHandler.proxy.length - 1]
                    );
                    return iHandler;
                });
            },
            removeEventListener:    function (iType, iCallback) {
                iType = IE_Event_Type.call(this, iType);

                if (! iType) return;

                var iHandler = $(this).data('ie-handler');
                iHandler = iHandler.proxy[ iHandler.user.indexOf(iCallback) ];
                if (iHandler)
                    this.detachEvent('on' + iType,  iHandler);
            },
            dispatchEvent:          function (iEvent) {
                var $_This = $(this);
                var iType = 'on' + iEvent.type,
                    iOffset = $_This.offset();

                $.extend(iEvent, {
                    clientX:    iOffset.left,
                    clientY:    iOffset.top
                });

                if (iType in this.constructor.prototype)
                    this.fireEvent(iType, iEvent);
                else
                    $_This.attr(iType, $.now());
            }
        };

    $.extend(Element.prototype, IE_Event_Method);
    $.extend(DOM, IE_Event_Method);
    $.extend(BOM, IE_Event_Method);

})(self, self.document, self.iQuery);



/* ---------- Complex Events ---------- */
(function (BOM, DOM, $) {

    /* ----- DOM Ready ----- */
    var $_DOM = $(DOM);
    $.start('DOM_Ready');

    function DOM_Ready_Event() {
        if (DOM.isReady) return;

        var _DOM_Ready_ = (DOM.readyState == 'complete') &&
                DOM.body  &&  DOM.body.lastChild  &&  DOM.getElementById;

        if ((this !== DOM) && (! _DOM_Ready_))
            return;

        DOM.isReady = true;
        BOM.clearTimeout( $_DOM.data('Ready_Timer') );
        $_DOM.data('Load_During', $.end('DOM_Ready'))
            .data('Ready_Event', arguments[0]);
        console.info('[DOM Ready Event]');
        console.log(this, arguments);

        $_DOM.trigger('ready');

        return false;
    }

    $_DOM.data('Ready_Timer',  $.every(0.5, DOM_Ready_Event));
    $_DOM.one('DOMContentLoaded', DOM_Ready_Event);
    $(BOM).one('load', DOM_Ready_Event);

    $.fn.ready = function (iCallback) {
        if ($.type(this[0]) != 'Document')
            throw 'The Ready Method is only used for Document Object !';

        if (! DOM.isReady)
            $_DOM.one('ready', iCallback);
        else
            iCallback.call(this[0],  $.data(DOM, 'Ready_Event'));

        return this;
    };

    /* ----- Mouse Hover ----- */
    var _Float_ = {
            absolute:    true,
            fixed:       true
        };

    $.fn.hover = function (iEnter, iLeave) {
        return  this.bind('mouseover', function () {
                if (
                    $.contains(this, arguments[0].relatedTarget) ||
                    ($(arguments[0].target).css('position') in _Float_)
                )
                    return false;
                iEnter.apply(this, arguments);
            }).bind('mouseout', function () {
                if (
                    $.contains(this, arguments[0].relatedTarget) ||
                    ($(arguments[0].target).css('position') in _Float_)
                )
                    return false;
                (iLeave || iEnter).apply(this, arguments);
            });
    };

    /* ----- Single Finger Touch ----- */
    function get_Touch(iEvent) {
        if (! iEvent.timeStamp)
            iEvent.timeStamp = $.now();

        if (! $.browser.mobile)  return iEvent;

        try {
            return iEvent.changedTouches[0];
        } catch (iError) {
            return iEvent.touches[0];
        }
    }

    var Touch_Data;

    $(DOM).bind(
        $.browser.mobile ? 'touchstart MSPointerDown' : 'mousedown',
        function (iEvent) {
            var iTouch = get_Touch(iEvent);

            Touch_Data = {
                pX:      iTouch.pageX,
                pY:      iTouch.pageY,
                time:    iEvent.timeStamp
            };
        }
    ).bind(
        $.browser.mobile ? 'touchend touchcancel MSPointerUp' : 'mouseup',
        function (iEvent) {
            if (! Touch_Data)  return;

            var iTouch = get_Touch(iEvent);

            var swipeLeft = Touch_Data.pX - iTouch.pageX,
                swipeTop = Touch_Data.pY - iTouch.pageY,
                iTime = iEvent.timeStamp - Touch_Data.time;

            if (Math.max(Math.abs(swipeLeft), Math.abs(swipeTop)) > 20)
                $(iEvent.target).trigger('swipe',  [swipeLeft, swipeTop]);
            else
                $(iEvent.target).trigger((iTime > 300) ? 'press' : 'tap');
        }
    );

})(self, self.document, self.iQuery);



/* ---------- HTML 5 Form Shim ---------- */
(function ($) {

    if ($.browser.modern && (! $.browser.ios))  return;

    function Value_Check() {
        var $_This = $(this);

        if ((typeof $_This.attr('required') == 'string')  &&  (! this.value))
            return false;

        var iRegEx = $_This.attr('pattern');
        if (iRegEx)  try {
            return  RegExp(iRegEx).test(this.value);
        } catch (iError) { }

        if ((this.tagName.toLowerCase() == 'input')  &&  (this.type == 'number')) {
            var iNumber = Number(this.value),
                iMin = Number( $_This.attr('min') );
            if (
                isNaN(iNumber)  ||
                (iNumber < iMin)  ||
                (iNumber > Number( $_This.attr('max') ))  ||
                ((iNumber - iMin)  %  Number( $_This.attr('step') ))
            )
                return false;
        }

        return true;
    }

    HTMLInputElement.prototype.checkValidity = Value_Check;
    HTMLSelectElement.prototype.checkValidity = Value_Check;
    HTMLTextAreaElement.prototype.checkValidity = Value_Check;

    HTMLFormElement.prototype.checkValidity = function () {
        var $_Input = $('*[name]:input', this);

        for (var i = 0;  i < $_Input.length;  i++)
            if (! $_Input[i].checkValidity())
                return false;
        return true;
    };

})(self.iQuery);



/* ---------- History API Shim ---------- */
(function (BOM, DOM, $) {

    if (! ($.browser.msie < 10))  return;

    var _State_ = [
            [null, DOM.title, DOM.URL]
        ],
        _Pushing_ = false,
        $_BOM = $(BOM);

    BOM.history.pushState = function (iState, iTitle, iURL) {
        for (var iKey in iState)
            if (! $.isData(iState[iKey]))
                throw ReferenceError("The History State can't be Complex Object !");

        if (typeof iTitle != 'string')
            throw TypeError("The History State needs a Title String !");

        DOM.title = iTitle;
        _Pushing_ = true;
        BOM.location.hash = '_' + (_State_.push(arguments) - 1);
    };

    BOM.history.replaceState = function () {
        _State_ = [ ];
        this.pushState.apply(this, arguments);
    };

    $_BOM.on('hashchange',  function () {
        if (_Pushing_) {
            _Pushing_ = false;
            return;
        }

        var iState = _State_[ BOM.location.hash.slice(2) ];
        if (! iState)  return;

        BOM.history.state = iState[0];
        DOM.title = iState[1];

        $_BOM.trigger('popstate');
    });

})(self, self.document, self.iQuery);



/* ---------- DOM/CSS Animation ---------- */
(function ($) {

    var FPS = 20;

    function KeyFrame(iStart, iEnd, During_Second) {
        During_Second = Number(During_Second) || 1;

        var iKF = [ ],  KF_Sum = FPS * During_Second;
        var iStep = (iEnd - iStart) / KF_Sum;

        for (var i = 0, KFV = iStart; i < KF_Sum; i++) {
            KFV += iStep;
            iKF.push(Number( KFV.toFixed(2) ));
        }
        return iKF;
    }

    $.fn.animate = function (CSS_Final, During_Second) {
        var $_This = this;

        $_This.data('animate', 1);

        $.each(CSS_Final,  function (iName) {
            var iKeyFrame = KeyFrame($_This.css(iName), this, During_Second);

            $.every(1 / FPS,  function () {
                if ($_This.data('animate') && iKeyFrame.length)
                    $_This.css(iName, iKeyFrame.shift());
                else {
                    iKeyFrame = null;
                    return false;
                }
            });
        });

        return $_This;
    };

    $.fx = {interval:  1000 / FPS};

    /* ----- CSS 3 Animation ----- */
    $('head script').eq(0).before('<link />', {
        rel:     'stylesheet',
        type:    'text/css',
        href:    'http://cdn.bootcss.com/animate.css/3.3.0/animate.min.css'
    });

    var Animate_End = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

    $.fn.cssAnimate = function (iType) {
        var _Args_ = $.makeArray(arguments).slice(1);

        var iDuring = (! isNaN(parseFloat(_Args_[0]))) && _Args_.shift();
        var iCallback = (typeof _Args_[0] == 'function') && _Args_.shift();
        var iLoop = _Args_[0];

        var iClass = 'animated ' + iType + (iLoop ? ' infinite' : '');

        this.bind(Animate_End,  function () {
            $(this).off(Animate_End).removeClass(iClass);

            if (iCallback)
                iCallback.apply(this, arguments);
        });

        if (iDuring) {
            iDuring = (iDuring / 1000) + 's';
            this.cssRule({
                ' ': {
                       '-moz-animation-duration':    iDuring,
                    '-webkit-animation-duration':    iDuring,
                         '-o-animation-duration':    iDuring,
                        '-ms-animation-duration':    iDuring,
                            'animation-duration':    iDuring,
                }
            });
        }

        return  this.removeClass('animated').addClass(iClass);
    };

    /* ----- Animation ShortCut ----- */
    var CSS_Animation = [
            'fadeIn', 'fadeOut'
        ];

    function iAnimate(iType) {
        return  function (iCallback, iDuring, iLoop) {
                return  this.cssAnimate(iType, iCallback, iDuring, iLoop);
            };
    }

    for (var i = 0;  i < CSS_Animation.length;  i++)
        $.fn[ CSS_Animation[i] ] = iAnimate( CSS_Animation[i] );

    $.fn.stop = function () {
        return  this.data('animate', 0).removeClass('animated');
    };

})(self.iQuery);



/* ---------- Smart HTML Loading ---------- */
(function (DOM, $) {

    $.fn.load = function (iURL, iData, iCallback) {
        var $_This = this;

        iURL = iURL.trim().split(/\s+/);
        iURL[1] = iURL.slice(1).join(' ');
        iURL.length = 2;
        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }

        function Append_Back() {
            $_This.children().fadeOut();
            $(arguments[0]).appendTo( $_This.empty() ).fadeIn();

            if (typeof iCallback == 'function')
                for (var i = 0;  i < $_This.length;  i++)
                    iCallback.apply($_This[i], arguments);
        }

        function Load_Back(iHTML) {
            if (! iHTML.match(/<\s*(html|head|body)[^>]*>/i)) {
                Append_Back.apply(this, arguments);
                return;
            }

            var _Context_ = [this, $.makeArray(arguments)];

            $('<iframe />', {
                style:    'display: none'
            }).one('load',  function () {
                var $_iFrame = $(this),
                    _DOM_ = this.contentWindow.document;

                $.every(0.04,  function () {
                    if (! (_DOM_.body && _DOM_.body.childNodes.length))
                        return;

                    var $_Content = $(iURL[1] || 'body > *',  _DOM_);
                    if (! $_Content.length)
                        $_Content = _DOM_.body.childNodes;

                    Append_Back.apply(
                        _Context_[0],
                        _Context_[1].splice(0,  1,  $('head style', _DOM_).add($_Content))
                    );

                    $_iFrame.remove();
                    return false;
                });
                _DOM_.write(iHTML);
                _DOM_.close();
            }).appendTo(DOM.body);
        }

        if (! iData)
            $.get(iURL[0], Load_Back);
        else
            $.post(iURL[0], iData, Load_Back);

        return this;
    };

})(self.document, self.iQuery);



/* ----- 模态框/遮罩层（全局） v0.4 ----- */
(function (BOM, DOM, $) {

    BOM.iShadowCover = {
        $_DOM:     $('<div class="Cover"><div /></div>'),
        CSS:       {
            'body > .Cover': {
                position:      'fixed',
                'z-index':     2000000010,
                top:           0,
                left:          0,
                width:         '100%',
                height:        '100%',
                background:    'rgba(0, 0, 0, 0.7)',
                display:       'table'
            },
            'body > .Cover > *': {
                display:             'table-cell',
                'vertical-align':    'middle',
                'text-align':        'center'
            }
        },
        closed:    true,
        init:      function () {
            var _This_ = BOM.iShadowCover;

            if (this == _This_) return;

            $.cssRule(_This_.CSS);

            _This_.$_DOM.click(function () {
                if (! _This_.locked) {
                    if (arguments[0].target.parentNode === this)
                        _This_.close();
                } else
                    _This_.Content.focus();
            });
        },
        open:      function (iContent, iStyle, closeCB) {
            this.locked = ($.type(iContent) == 'Window');

            if (! this.locked) {
                if (! this.closed)  this.close();
                $(this.$_DOM[0].firstChild).append(iContent);
            } else
                this.Content = iContent;

            if (iStyle) {
                var _This_ = this;
                this.$_DOM.cssRule(iStyle,  function () {
                    _This_.$_CSS = $(arguments[0].ownerNode);
                });
            }
            this.$_DOM.height( $(BOM).height() ).prependTo(DOM.body);

            this.closed = false;
            this.onclose = closeCB;

            return iContent;
        },
        close:     function () {
            if (this.closed) return;

            this.$_DOM.detach();
            $(this.$_DOM[0].firstChild).empty();
            if (this.$_CSS && this.$_CSS[0].parentNode)
                this.$_CSS.remove();

            this.closed = true;
            if (this.onclose)
                this.onclose.call(this.$_DOM[0]);
        }
    };

    $(DOM).ready(BOM.iShadowCover.init).keydown(function () {
        if (BOM.iShadowCover.closed) return;

        if (! BOM.iShadowCover.locked) {
            if (arguments[0].which == 27)
                BOM.iShadowCover.close();
        } else
            BOM.iShadowCover.Content.focus();
    });

    function iOpen(iURL, Scale, iCallback) {
        Scale = (Scale > 0) ? Scale : 3;
        var Size = {
            height:    BOM.screen.height / Scale,
            width:     BOM.screen.width / Scale
        };
        var Top = (BOM.screen.height - Size.height) / 2,
            Left = (BOM.screen.width - Size.width) / 2;

        BOM.alert("请留意本网页浏览器的“弹出窗口拦截”提示，当被禁止时请点选【允许】，然后可能需要重做之前的操作。");
        var new_Window = BOM.open(iURL, '_blank', [
            'top=' + Top,               'left=' + Left,
            'height=' + Size.height,    'width=' + Size.width,
            'resizable=no,menubar=no,toolbar=no,location=no,status=no,scrollbars=no'
        ].join(','));

        BOM.new_Window_Fix.call(new_Window, function () {
            $('link[rel~="shortcut"], link[rel~="icon"], link[rel~="bookmark"]')
                .add('<base target="_self" />')
                .appendTo(this.document.head);

            $(this.document).keydown(function (iEvent) {
                var iKeyCode = iEvent.which;

                if (
                    (iKeyCode == 122) ||                       //  F11
                    (iKeyCode == 116) ||                       //  (Ctrl + )F5
                    (iEvent.ctrlKey && (iKeyCode == 82)) ||    //  Ctrl + R
                    (iEvent.ctrlKey && (iKeyCode == 78)) ||    //  Ctrl + N
                    (iEvent.shiftKey && (iKeyCode == 121))     //  Shift + F10
                )
                    return false;
            }).bind('contextmenu', function () {
                return false;
            }).mousedown(function () {
                if (arguments[0].which == 3)
                    return false;
            });
        });

        if (iCallback)
            $.every(0.2, function () {
                if (new_Window.closed) {
                    iCallback.call(BOM, new_Window);
                    return false;
                }
            });
        return new_Window;
    }

    var old_MD = BOM.showModalDialog;

    BOM.showModalDialog = function () {
        if (! arguments.length)
            throw 'A URL Argument is needed unless...';
        else
            var iArgs = $.makeArray(arguments);

        var iContent = iArgs.shift();
        var iScale = (typeof iArgs[0] == 'number') && iArgs.shift();
        var iStyle = $.isPlainObject(iArgs[0]) && iArgs.shift();
        var CloseBack = (typeof iArgs[0] == 'function') && iArgs.shift();

        if (typeof iArgs[0] == 'string')
            return old_MD.apply(BOM, arguments);

        if (typeof iContent == 'string') {
            if (! iContent.match(/^(\w+:)?\/\/[\w\d\.:@]+/)) {
                var iTitle = iContent;
                iContent = 'about:blank';
            }
            iContent = BOM.iShadowCover.open(
                iOpen(iContent, iScale, CloseBack)
            );
            $.every(0.2, function () {
                if (iContent.closed) {
                    BOM.iShadowCover.close();
                    return false;
                }
            });
            $(BOM).bind('unload', function () {
                iContent.close();
            });
            BOM.new_Window_Fix.call(iContent, function () {
                this.iTime = {
                    _Root_:    this,
                    now:       $.now,
                    every:     $.every,
                    wait:      $.wait
                };

                this.iTime.every(0.2, function () {
                    if (! this.opener) {
                        this.close();
                        return false;
                    }
                });
                if (iTitle)
                    $(this.document.head).append('<title />', {text:  iTitle});
            });
        } else
            BOM.iShadowCover.open(iContent, iStyle, CloseBack);

        return iContent;
    };

})(self, self.document, self.iQuery);


//
//                >>>  EasyImport.js  <<<
//
//
//      [Version]    v0.9  (2015-7-26)  Stable
//
//      [Usage]      Only for loading JavaScript files in Single-Page Web,
//                   no Inherit support for Frames.
//
//
//              (C)2013-2015    SCU FYclub-RDD
//


(function (BOM, DOM, $) {

/* ----------- Basic Data ----------- */
    var UA = navigator.userAgent,
        RE_FileName = BOM.iRegExp('^[^\\?]*?\\/?([^\\/\\?]+)(\\?.+)?$', undefined, null);

    var Root_Path = (function ($_Script) {
            for (var i = 0, iPath;  i < $_Script.length;  i++) {
                iPath = $_Script[i].src.match(
                    /(.+)[^\/]*EasyImport[^\/]*\.js[^\/]*$/i
                );
                if (iPath)  return iPath[1];
            }
        })( $('head > script') ),
        Load_Times = 0;

    var $_Head = $('head').append('<meta />', {
            'http-equiv':    'Window-Target',
            content:         '_top'
        }),
        $_Title = $('head title');



/* ----------- Standard Mode Meta Patches ----------- */
    if ($.browser.mobile) {
        if ($.browser.modern) {
            var is_WeChat = UA.match(/MicroMessenger/i),
                is_UCWeb = UA.match(/UCBrowser|UCWeb/i);
            $_Title.before('<meta />', {
                name:       "viewport",
                content:    [
                    'width' + '=' + (
                        ($.browser.mobile && (is_WeChat || is_UCWeb))  ?  320  :  'device-width'
                    ),
                    'initial-scale=1.0',
                    'minimum-scale=1.0',
                    'maximum-scale=1.0',
                    'user-scalable=no',
                    'target-densitydpi=medium-dpi'
                ].join(',')
            });
        } else
            $_Title.before(
                $('<meta />', {
                    name:       'MobileOptimized',
                    content:    320
                }).add('<meta />', {
                    name:       'HandheldFriendly',
                    content:    'true'
                })
            );
    }
    if ($.browser.msie)
        $_Head.append('<meta />', {
            'http-equiv':    'X-UA-Compatible',
            content:         'IE=Edge, Chrome=1'
        });


/* ---------- Loading Queue ---------- */
    var UA_Rule = {
            old_PC:    ! $.browser.modern,
            Mobile:    $.browser.mobile,
            Phone:     $.browser.phone,
            Pad:       $.browser.pad
        };

    function iQueue() {
        this.length = 0;
    }
    $.extend(iQueue.prototype, {
        push:        [ ].push,
        shift:       [ ].shift,
        splice:      [ ].splice,
        slice:       [ ].slice,
        newGroup:    function () {
            var _Length_;

            if ((! this.length) || this.slice(-1)[0].length) {
                _Length_ = this.push($.extend([ ],  {
                    loaded:    0
                }));
                this.lastGroup = this.slice(-1)[0];
            }
            return _Length_;
        },
        add:         function (iFileName) {
            if (! iFileName.match(/^http(s)?:\/\//))
                iFileName = Root_Path + iFileName;
            this[this.length - 1].push( iFileName );
        }
    });

    function Make_Queue(iList) {
        for (var i = 0; i < iList.length; i++)
            if (! (iList[i] instanceof Array))
                iList[i] = [iList[i]];

        var _Queue_ = new iQueue();
        for (var i = 0; i < iList.length; i++) {
            _Queue_.newGroup();
            for (var j = 0, _Item_; j < iList[i].length; j++) {
                _Item_ = iList[i][j];
                if (typeof _Item_ == 'string')
                    _Queue_.add(_Item_);
                else {
                    var no_Break = true;
                    for (RI in UA_Rule)  if (UA_Rule[RI]) {
                        if (_Item_[RI] === false)
                            no_Break = false;
                        else if (_Item_[RI])
                            _Queue_.add(_Item_[RI]);
                        break;
                    }
                }
                if (no_Break && (! _Queue_.lastGroup[j]) && _Item_.new_PC)
                    _Queue_.add(_Item_.new_PC);
            }
        }
        return _Queue_;
    }


/* ---------- DOM Template ---------- */
    var $_Script = $('<script />', {
            type:       'text/javascript',
            charset:    'UTF-8',
            'class':    'EasyImport'
        });


/* ---------- DOM Load-Engine ---------- */
    function DOM_Load(iOrder, iFinal) {
        if (! iOrder[0]) {
            iFinal();
            return;
        }

        var This_Call = arguments;

        if ((! iOrder[1]) && (this !== DOM)) {
            $(DOM).ready(function () {
                This_Call.callee.apply(this, This_Call);
            });
            return;
        }

        var This_Group = 0;

        function _Next_() {
            if ( iOrder[0][++This_Group] )  return;

            if (typeof this != 'function')
                $(this).data('Load_During', $.end(
                    this.src.match(RE_FileName)[1]
                ));
            iOrder.shift();
            This_Call.callee.apply(this, This_Call);
        }

        for (var i = 0, iScript;  (iOrder[0] && (i < iOrder[0].length));  i++) {
            iScript = iOrder[0][i];

            if (typeof iScript == 'function') {
                iScript();
                _Next_.call(iScript);
                continue;
            }
            $_Script.clone().one('load', _Next_).attr('src', iScript).appendTo($_Head);

            $.start( iScript.match(RE_FileName)[1] );
        }
    }

// ----------- Open API ----------- //
    $(DOM).ready(function () {
        BOM.showModalDialog($('<h1>Loading...</h1>'), {
            ' ': {
                background:    'darkgray'
            },
            ' h1': {
                color:    'white'
            }
        });
        $('body > .Cover').find('h1').cssAnimate('fadeIn', 2000, true);
    });


    function Load_End() {
        if ( Load_Times++ )  return;

        var iTimer = $.browser.modern  &&  (BOM.performance || { }).timing;

        var Async_Time = (! iTimer) ? $.end('DOM_Ready') : (
                (iTimer.domContentLoadedEventEnd - iTimer.navigationStart) / 1000
            ),
            Sync_Time = $(DOM).data('Load_During');
        $('head > script.EasyImport').each(function () {
            Sync_Time += $(this).data('Load_During');
        });
        console.info([
            '[ EasyImport.js ]  Time Statistics',
            '  Async Sum:    ' + Async_Time.toFixed(3) + ' s',
            '  Sync Sum:     ' + Sync_Time.toFixed(3) + ' s',
            '  Saving:       ' + (
                ((Sync_Time - Async_Time) / Sync_Time) * 100
            ).toFixed(2) + ' %'
        ].join("\n\n"));

        BOM.iShadowCover.close();

        $(DOM.body).trigger('ScriptLoad');
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


        var JS_Item = Make_Queue(JS_List);
        if (CallBack)  JS_Item.push([CallBack]);

        if (! JS_Item[0].length)  return;

        DOM_Load(JS_Item, Load_End);
    };

})(self, self.document, self.iQuery);