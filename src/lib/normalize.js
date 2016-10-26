var domain = require('./domain.js');
var httpmin_expr_protocol = require('./regExprUrlProtocol.js');

module.exports = function(url) {

    var protocol,domain;
    url=url.split('\\').join('/');
    if (httpmin_expr_protocol.test(url)) {
        var protdom = httpmin_expr_protocol.exec(url);

        protocol=protdom[1];
        domain=protdom[2];
    } else {
        
        protocol='http';
        domain=url;
    }

    var firstSlash = domain.substr(0,1)==='/';
    var urlp = domain.split('/');

    var res = [];
    for (var i = 0;i<urlp.length;++i) {
        if (urlp[i]==='') continue;
        if (urlp[i]==='.') continue;
        if (urlp[i]==='..') { res.pop(); continue; }
        res.push(urlp[i]);
    }
    
    if (firstSlash) {
        return '/'+res.join('/');
    } else {
        return protocol+'://'+res.join('/');
    }
};