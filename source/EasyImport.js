//
//                >>>  EasyImport.js  <<<
//
//
//      [Version]    v1.3  (2016-06-03)  Alpha
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

    function New_Module(iPath, iName, iDepend, iModule) {
        AMD_Module[iPath] = {
            name:        iName  ||  $.fileName(iPath),
            parents:     iDepend  ||  [ ],
            children:    { }
        };

        if (typeof iModule == 'function')
            AMD_Module[iPath].defination = iModule;
        else if ($.isPlainObject( iModule ))
            $.extend(AMD_Module[iPath], {
                executed:    true,
                export:      iModule
            });
    }

    function AMD_Load(iPath) {
        var iRequire = [ ];

        for (var i = 0, _Module_;  this.parents[i];  i++) {
            _Module_ = AMD_Module[ this.parents[i] ];

            if (! _Module_) {
                New_Module( this.parents[i] );

                $('<script />').attr('src',  this.parents[i] + '.js')
                    .appendTo('head');
            } else if (! _Module_.executed) {
                if (! (iPath in _Module_.children))
                    _Module_.children[iPath] = true;
            } else
                iRequire[i] = _Module_.export;
        }

        if (iRequire.length < this.parents.length)  return;

        if ((! this.executed)  &&  this.defination) {
            this.export = this.defination.apply(BOM, iRequire);
            this.executed = true;

            console.log('AMD load:  ' + iPath + '.js');
        }
    }

    BOM.define = function () {
        var iArgs = $.makeArray(arguments);

        var iName = (typeof iArgs[0] == 'string')  &&  iArgs.shift();
        var iDepend = (iArgs[0] instanceof Array)  &&  iArgs.shift();
        var iModule = iArgs[0];

        var iPath = This_Script().replace(/\.js(\?.*)?/, '');

        New_Module(iPath, iName, iDepend, iModule);

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