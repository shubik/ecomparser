var ecomparser = require('../index');




// var test = ecomparser.analize('http://www.5ok.com.ua/holodilniki/delfa-dbf-150.html');
var test = ecomparser.analize('http://www.citrus.ua/shop/goods/tabletpc/262/248181');

test.done(function(data) {
    // console.log('charset:', data.charset, 'og:', data.opengraph, 'schema:', data.schema, 'URL:', data.url, 'img:', data.image);
    // console.log('HTML:', data.html);

    ecomparser.findPrice(data, 23799);


}, function(err) {
    console.log(err.toString());
});