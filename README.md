# Ecomparser

Ecomparser is a library for parsing e-commerce web pages in order to retrieve the following data:

*   Product title
*   Canonical URL
*   Main image
*   Price
*   Price currency

## Sample usage

```js
var ecomparser = require('../index'),
    siteData   = require('./data.json');

var rozetka = ecomparser('http://bt.rozetka.com.ua/granchio-ecopan-88064-22/p151818/', siteData);

rozetka.done(function(data) {
    console.log(data);
}, function(err) {
    console.log('Failed!', err);
});
```

This will output the following:

```json
{ hostname: 'bt.rozetka.com.ua',
  url: 'http://bt.rozetka.com.ua/granchio-ecopan-88064-22/p151818/',
  title: 'Кастрюля GRANCHIO ECOPAN 88064 (2,2 л)',
  image: 'http://i1.rozetka.ua/goods/80716/record_80716239.jpg',
  price: '292',
  priceCurrency: 'UAH' }
```

## Site data

In order for this library to run, site data needs to be defined. Ideally site data should be shared in the cloud and available via CDN, and maintained by the community, or maintained in a separate Git repository. In the mean time you need to have your own site data. Data format is as follows:

