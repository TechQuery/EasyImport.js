//
//                >>>  EasyImport.js  <<<
//
//
//      [Version]    v1.3  (2016-06-06)  Alpha
//
//      [Usage]      A Asynchronous & Responsive Loader
//                   for Resource File in Web Browser.
//
//
//            (C)2013-2016    SCU FYclub-RDD
//


define('EasyImport',  ['iQuery'],  function ($) {

    var BOM = self,  DOM = self.document;

    var AMD_Module = { },  Root_Path = DOM.currentScript.src.replace(/[^\/]+$/, '');

    function AbsolutePath(iPath) {
        iPath = (iPath.match(/^(\w+:)?\/\//) ? '' : Root_Path)  +  iPath;

        return  iPath.replace(/(\/[^\/]+\/)(\.{1,2})\//,  function () {
            return  (arguments[2].length == 1)  ?  arguments[1]  :  '/';
        });
    }

    function InnerRequire() {
        if (typeof arguments[0] == 'string')
            return  AMD_Module[AbsolutePath( arguments[0] )].exports;

        BOM.require.apply(BOM, arguments);
    }

    function New_Module(iPath, iName, iDepend, iModule) {
        var _Module_ = AMD_Module[iPath] = {
                name:        iName  ||  $.fileName(iPath),
                parents:     iDepend  ||  [ ],
                children:    { }
            };

        if ($.isPlainObject( iModule ))
            return  $.extend(_Module_, {
                executed:    true,
                exports:     iModule
            });

        if (typeof iModule != 'function')  return;

        _Module_.defination = iModule;

        var iRequire = iModule.toString().match(
                /=\s*require\(\s*('|")\S+('|")\s*\)/g
            );
        if (iRequire)
            _Module_.parents = _Module_.parents.concat(
                $.map(iRequire,  function () {
                    return arguments[0].split(/'|"/)[1];
                })
            );
        _Module_.parents = $.map(_Module_.parents, AbsolutePath);
    }

    function AMD_Load(iPath) {
        var iRequire = [ ];

        for (var i = 0, _Module_;  this.parents[i];  i++)
            switch ( this.parents[i] ) {
                case 'require':    iRequire[i] = InnerRequire;    break;
                case 'exports':    iRequire[i] = this.exports;    break;
                case 'iQuery':     iRequire[i] = $;               break;
                default:           {
                    _Module_ = AMD_Module[ this.parents[i] ];

                    if (! _Module_) {
                        New_Module( this.parents[i] );

                        $('<script />').attr('src',  this.parents[i] + '.js')
                            .appendTo('head');
                    } else if (! _Module_.executed) {
                        if (! (iPath in _Module_.children))
                            _Module_.children[iPath] = true;
                    } else
                        iRequire[i] = _Module_.exports;
                }
            }
        if (iRequire.length < this.parents.length)  return;

        if ((! this.executed)  &&  this.defination) {
            this.exports = this.defination.apply(BOM, iRequire);
            this.executed = true;

            console.log('[' + Date.now() + '] AMD load:  ' + iPath + '.js');
        }
    }

    BOM.define = function () {
        var iArgs = $.makeArray(arguments),
            iPath = DOM.currentScript.src.replace(/\.js(\?.*)?/, '');

        New_Module(
            iPath,
            (typeof iArgs[0] == 'string')  &&  iArgs.shift(),
            (iArgs[0] instanceof Array)  &&  iArgs.shift(),
            iArgs[0]
        );

        $.each($.extend({ }, AMD_Module),  AMD_Load);
    };

    BOM.define.amd = 'EasyImport.js';

    BOM.require = function () {
        BOM.define.apply(BOM, arguments);
    };

});