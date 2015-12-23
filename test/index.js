var ecommparse = require('../index');
var result = ecommparse('http://www.citrus.ua/shop/goods/tabletpc/262/248181');

result.done(function(val) {
    console.log('Done!', val);
});