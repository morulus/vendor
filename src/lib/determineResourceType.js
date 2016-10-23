var imagesRegExpr = require('./regExprImageExt.js');
var resourceTypeMap = require('./constResourceTypes.js');

/*
Определяет тип ресурса
*/
module.exports = function(pure, force) {
    if (force&&!~resourceTypeMap.indexOf(force)) return resourceTypeMap.indexOf(force);
    // Js file
    if (pure.substr(pure.length-3, 3).toLowerCase()=='.js') {
       return 1;
    } else if (pure.substr(pure.length-4, 4).toLowerCase()=='.css') {
        return 2;
    } else if (pure.substr(pure.length-5, 5).toLowerCase()=='.json') {
       return 4;
    } else if (imagesRegExpr.test(pure)) {
       return 5;
    } else if (pure.lastIndexOf('.')>pure.lastIndexOf('/')) {
        return 0;
    } else {
        return false;
    }
};
