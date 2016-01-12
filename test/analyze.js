var ecomparser = require('../index');



var pages = [
    { url: "http://www.citrus.ua/shop/goods/tabletpc/262/248181", price: 23299, title: 'Apple iPad mini 4 128Gb WiFi+4G Gold (MK782)' },
    { url: "http://a-techno.com.ua/72767.html", price: 52599, title: 'Apple A1418 iMac (MK452UA/A)' },
    { url: "http://comfy.ua/televizor-finlux-32-flyr-274s.html", price: 15199, title: 'Телевизор LG 43LF590V' },
    { url: "http://www.mobilluck.com.ua/katalog/LCDTV/Saturn/Saturn-LED46KF-334620.html", price: 12786, title: 'LED телевизор Saturn LED46KF' }
    // { url: "http://www.notus.com.ua/Apple-iMac-215-4K-display-MK452-NEW-2015", price: 42554 },
    // { url: "http://portativ.ua/product_98429.html", price: 43383 },
    // { url: "http://xclusive.com.ua/catalog/macbook/mk452.html", price: 42549 },
    // { url: "http://maclove.com.ua/catalog/261355/245048/70298", price: 42375 },
    // { url: "http://www.sokol.ua/monoblok-apple-imac-a1418-mk452ua-a-065b9/p702209/", price: 52599 },
    // { url: "http://foxmart.ua/kompyoutery/apple-imac-a1418-mk452uaa.html", price: 52599 },
    // { url: "http://pcshop.ua/Monoblok_Apple_iMac_MK452.aspx", price: 42760 },
    // { url: "http://tid.ua/mikrovolnovaya-pech-gorenje-mo-17-dw-(mo17dw)", price: 1499 },
    // { url: "http://myphone.kh.ua/monoblok-apple-imac-215-with-retina-4k-display-mk452-2015/", price: 43899 },
    // { url: "http://chooser.com.ua/monoblok-apple-imac-215-with-retina-4k-display-mk452-2015", price: 46280 },
    // { url: "http://vivostore.ua/product/apple-new-imac-21-5-retina-mk452-2015", price: 42790 },
    // { url: "https://store.iland.ua/apple-computers/personal-computers/imac/imac-21-5-retina-4-k-core-i5-3-1ghz-quad-core-8gb-1tb-intel-iris-pro-6200-mk452.html", price: 2147 },
    // { url: "http://solvo.com.ua/products/apple-imac-215-with-retina-4k-display-mk452-2015", price: 42994 },
    // { url: "http://www.mrfix.com.ua/product/apple-imac-215-with-retina-4k-display-mk452/", price: 44333 },
    // { url: "http://mcstore.com.ua/catalog/imac_21_5/apple_imac_21_5_new_mk452/", price: 43915 },
    // { url: "http://www.ozon.ru/context/detail/id/18037252/", price: 2999 }
]



pages.forEach(function(page) {
    var test = ecomparser.analyze(page.url);

    test.done(function(data) {

        var priceData = ecomparser.findAttributes(data, page.price, page['title']);
        console.log('\nPRODUCT DATA:', page.url, priceData);

    }, function(err) {
        console.log(err.toString());
    });
});



