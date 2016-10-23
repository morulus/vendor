var regExprDomain = require('./regExprDomain.js');

module.exports = function(url) {
    url=url.split('\\').join('/');
    if (regExprDomain.test(url)) {
    	var protodomen = regExprDomain.exec(url);
        return protodomen[1]+'://'+protodomen[2]+'/';
    } else {

        return window.location.origin+'/';
    }
};