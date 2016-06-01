//
//                >>>  EasyImport.js  <<<
//
//
//      [Version]    v1.3  (2016-06-01)  Alpha
//
//      [Usage]      A Asynchronous & Responsive Loader
//                   for Resource File in Web Browser.
//
//
//            (C)2013-2016    SCU FYclub-RDD
//


define('EasyImport',  ['iQuery'],  function ($) {

    var BOM = self,  DOM = self.document;

    var iDependence = { };

    BOM.define = function () {
        var iArgs = $.makeArray(arguments);

        var iModule = (typeof iArgs.slice(-1)[0] == 'function')  &&  iArgs.pop();
        var iDepend = (iArgs.slice(-1)[0] instanceof Array)  &&  iArgs.pop();
        var iName = (typeof iArgs.slice(-1)[0] == 'string')  &&  iArgs.pop();

        if (! iName)
            iName = $.fileName(DOM.scripts[DOM.scripts.length - 1].src)
                .split('.').slice(0, -1).join('.');

        iDependence[iName] = {
            dependence:    iDepend  ||  [ ],
            defination:    iModule,
            executed:      false,
            export:        null
        };

        $.each(iDependence,  function () {
            var iRequire = [ ];

            for (var i = 0, _Module_;  this.dependence[i];  i++) {
                _Module_ = iDependence[ this.dependence[i] ];

                if (! _Module_)
                    return  $('<script />').attr('src', this.dependence[i])
                        .appendTo('head');

                if (! _Module_.executed)
                    return arguments.callee.call(_Module_);

                iRequire[i] = _Module_.export;
            }

            this.export = this.defination.apply(BOM, iRequire);
        });
    };

    BOM.define.amd = 'EasyImport.js';

    BOM.require = function () {
        BOM.define.apply(BOM, arguments);
    };

});