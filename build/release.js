({
    baseUrl:                    '../source',
    name:                       'EasyImport',
    out:                        '../release/EasyImport.min.js',
    generateSourceMaps:         true,
    preserveLicenseComments:    false,
    wrap:                       {
        startFile:    'xWrap_0.frag',
        endFile:      'xWrap_1.frag'
    }
});