var ecommparse = require('../index'),
    siteData   = require('../templates/data.json');



var citrus = ecommparse('http://www.citrus.ua/shop/goods/tabletpc/262/248181', siteData);

citrus.done(function(val) {
    console.log('Done!', val);
}, function(err) {
    console.log('Failed!', err);
});



var allo = ecommparse('http://allo.ua/ru/products/mobile/apple-iphone-6-16gb-gold.html', siteData);

allo.done(function(val) {
    console.log('Done!', val);
}, function(err) {
    console.log('Failed!', err);
});


var amazon = ecommparse('http://www.amazon.com/gp/product/B015JK0BTK/ref=s9_simh_gw_p79_d5_i1?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=desktop-1&pf_rd_r=11HDJCTPTR0DD05Q9EMH&pf_rd_t=36701&pf_rd_p=2079475242&pf_rd_i=desktop', siteData);

amazon.done(function(val) {
    console.log('Done!', val);
}, function(err) {
    console.log('Failed!', err);
});