({
    baseUrl:                    '../source',
    name:                       'EasyImport',
    out:                        '../EasyImport.min.js',
    generateSourceMaps:         true,
    preserveLicenseComments:    false,
    onBuildWrite:    function (iName) {
        if (iName != 'EasyImport')  return arguments[2];

        return arguments[2]
            .replace(/^define[\s\S]+?(function \()[^\)]*/m,  "\n($1BOM, DOM, $")
            .replace(/\s+var BOM.+?;/, '')
            .replace(/\}\).$/,  "})(self, self.document, self.iQuery);");
    }
});