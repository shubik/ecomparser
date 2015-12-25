var ecomparser = require('../index'),
    siteData   = require('./data.json');



// var amazon = ecomparser('http://www.amazon.com/gp/product/B00EQRN9VA/ref=s9_simh_gw_p107_d5_i3?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=desktop-3&pf_rd_r=137C2X1V7567Z9NSKR5G&pf_rd_t=36701&pf_rd_p=2084660942&pf_rd_i=desktop', siteData);

// amazon.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString(), err);
// });


// var citrus = ecomparser('http://www.citrus.ua/shop/goods/tabletpc/262/248181', siteData);

// citrus.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });



// var allo = ecomparser('http://allo.ua/ru/products/mobile/apple-iphone-6-16gb-gold.html', siteData);

// allo.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString(), err);
// });


// var rozetka = ecomparser('http://bt.rozetka.com.ua/granchio-ecopan-88064-22/p151818/', siteData);

// rozetka.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString(), err);
// });


// var foxtrot = ecomparser('http://www.foxtrot.com.ua/ru/shop/holodilniki_delfa_dbf-150.html', siteData);

// foxtrot.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString(), err);
// });


// var eldorado = ecomparser('http://www.eldorado.com.ua/offer_1366142/p1366142/', siteData);

// eldorado.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString(), err);
// });


// var fotomag = ecomparser('http://fotomag.com.ua/apple-ipad-mini-2-with-retina-display-32gb-wi-fi-4g-(me820tu-a)-space-grey-info.html', siteData);

// fotomag.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var fua = ecomparser('https://f.ua/philips/hd9046-90.html', siteData);

// fua.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var mobilluck = ecomparser('http://www.mobilluck.com.ua/katalog/LCDTV/Saturn/Saturn-LED46KF-334620.html', siteData);

// mobilluck.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var deshevshe = ecomparser('http://deshevshe.net.ua/monoblocks-asus/asus_zen_aio_pro_z240icgt_gj079x_90pt01e', siteData);

// deshevshe.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var comfy = ecomparser('http://comfy.ua/televizor-finlux-32-flyr-274s.html', siteData);

// comfy.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var promua = ecomparser('http://prom.ua/p160879155-zimnyaya-kurtka-puhovik.html', siteData);

// promua.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var ilounge = ecomparser('http://ilounge.com.ua/products/avtozaryadka-rock-dual-motor-aluminum-grey-kupit', siteData);

// ilounge.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var moyo = ecomparser('http://www.moyo.ua/mobilnyj-telefon-apple-iphone-6-16-gb-space-gray/73606.html', siteData);

// moyo.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var itbox = ecomparser('http://www.itbox.ua/product/Cifrovoy_fotoapparat_Canon_PowerShot_SX400_IS_Red_9769B012-p165404/', siteData);

// itbox.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var telemart = ecomparser('http://telemart.ua/products/fly-fs501-nimbus-3-black/', siteData);

// telemart.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var citycomua = ecomparser('http://city.com.ua/goods/tablets/asus-memo-pad-7-me70c-8gb-black.html', siteData);

// citycomua.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


// var styluscomua = ecomparser('http://stylus.com.ua/ru/products/details/221425/index.html', siteData);

// styluscomua.done(function(data) {
//     console.log(data);
// }, function(err) {
//     console.log(err.toString());
// });


var fiveok = ecomparser('http://www.5ok.com.ua/holodilniki/delfa-dbf-150.html', siteData);

fiveok.done(function(data) {
    console.log(data);
}, function(err) {
    console.log(err.toString());
});

var fiveokSchema = ecomparser.analize('http://www.5ok.com.ua/holodilniki/delfa-dbf-150.html');

fiveokSchema.done(function(data) {
    console.log(data);
}, function(err) {
    console.log(err.toString());
});