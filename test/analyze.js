var ecomparser = require('../index');




// var test = ecomparser.analize('http://www.5ok.com.ua/holodilniki/delfa-dbf-150.html');
// http://www.citrus.ua/shop/goods/tabletpc/262/248181
// http://a-techno.com.ua/72767.html
// http://myphone.kh.ua/monoblok-apple-imac-215-with-retina-4k-display-mk452-2015/
// http://vivostore.ua/product/apple-new-imac-21-5-retina-mk452-2015
// http://foxmart.ua/kompyoutery/apple-imac-a1418-mk452uaa.html

var test = ecomparser.analyze('http://xclusive.com.ua/catalog/macbook/mk452.html');

test.done(function(data) {
    // console.log('charset:', data.charset, 'og:', data.opengraph, 'schema:', data.schema, 'URL:', data.url, 'img:', data.image);

    var priceData = ecomparser.findPrice(data, 42549);
    console.log('priceData:', priceData);

}, function(err) {
    console.log(err.toString());
});