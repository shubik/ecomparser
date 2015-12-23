var HTMLParser = require('fast-html-parser'),
    request = require('request'),
    microdataParser = require('microdata-node'),
    URLParser = require('url');


var url = 'http://www.citrus.ua/shop/goods/tabletpc/262/248181',
    hostname = URLParser.parse(url).hostname;

console.log(hostname);

request('http://www.citrus.ua/shop/goods/tabletpc/262/248181', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // console.log(body);
        var parsed = HTMLParser.parse(body);
        // console.log(parsed.querySelector('.product_price'));
        var json = microdataParser.toJson(body);
        console.log(json.items[0].properties.offers[0].properties.price[0]);
        console.log(json.items[0].properties.offers[0].properties.priceCurrency[0]);
    }
});