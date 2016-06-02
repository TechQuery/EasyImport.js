//
//                >>>  EasyImport.js  <<<
//
//
//      [Version]    v1.3  (2016-06-02)  Alpha
//
//      [Usage]      A Asynchronous & Responsive Loader
//                   for Resource File in Web Browser.
//
//
//            (C)2013-2016    SCU FYclub-RDD
//


define('EasyImport',  ['iQuery'],  function ($) {

    var BOM = self,  DOM = self.document;

    function This_Script() {
        try {
            throw  new Error('Script_Name');
        } catch (iError) {
            return iError.stack.match(/\s+at\s+(http(s)?:\/\/\S+.js)/)[1];
        }
    }

    var AMD_Module = { },  Root_Path = This_Script().replace(/[^\/]+$/, '');

    function AMD_Load() {
        var iRequire = [ ];

        for (var i = 0, _Module_;  this.parents[i];  i++) {
            _Module_ = AMD_Module[ this.parents[i] ];

            if ((_Module_ || { }).executed) {
                iRequire[i] = _Module_.export;
                continue;
            }

            if (! _Module_) {
                $('<script />').attr('src',  this.parents[i] + '.js')
                    .appendTo('head');

                iRequire = null;
                continue;
            }

            _Module_.children.push( arguments[0] );

            return;
        }

        if (! iRequire)  return;

        if (! this.executed) {
            this.export = this.defination.apply(BOM, iRequire);
            this.executed = true;
        }
    }

    BOM.define = function () {
        var iArgs = $.makeArray(arguments);

        var iModule = (typeof iArgs.slice(-1)[0] == 'function')  &&  iArgs.pop();
        var iDepend = (iArgs.slice(-1)[0] instanceof Array)  &&  iArgs.pop();
        var iName = (typeof iArgs.slice(-1)[0] == 'string')  &&  iArgs.pop();

        var iPath = This_Script().replace(/\.js(\?.*)?/, '');

        AMD_Module[iPath] = {
            name:          iName  ||  $.fileName(iPath),
            parents:       iDepend  ||  [ ],
            children:      [ ],
            defination:    iModule,
            executed:      false,
            export:        null
        };

        AMD_Module[iPath].parents = $.map(
            AMD_Module[iPath].parents,
            function (_Path_) {
                _Path_ = (_Path_.match(/^(\w+:)?\/\//) ? '' : Root_Path)  +  _Path_;

                return  _Path_.replace(/(\/[^\/]+\/)(\.{1,2})\//,  function () {
                    return  (arguments[2].length == 1)  ?  arguments[1]  :  '/';
                });
            }
        );
        $.each($.extend({ }, AMD_Module),  AMD_Load);
    };

    BOM.define.amd = 'EasyImport.js';

    BOM.require = function () {
        BOM.define.apply(BOM, arguments);
    };

});