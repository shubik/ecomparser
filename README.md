# Ecomparser

Ecomparser is a Node.js library for parsing e-commerce web pages in order to retrieve the following data:

*   Product title
*   Canonical URL
*   Main image
*   Price
*   Price currency

## Installation

```js
npm install ecomparser
```

## Use cases

*   Grab product data from e-commerce web sites when user wants to share a product URL via your application (social network, gift registry, etc)
*   Parse pages from e-commerce web sites for your price aggregator

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
{ "hostname": "bt.rozetka.com.ua",
  "url": "http://bt.rozetka.com.ua/granchio-ecopan-88064-22/p151818/",
  "title": "Кастрюля GRANCHIO ECOPAN 88064 (2,2 л)",
  "image": "http://i1.rozetka.ua/goods/80716/record_80716239.jpg",
  "price": "292",
  "priceCurrency": "UAH" }
```

## Site data

In order for this library to run, site data needs to be defined. Ideally site data should be shared in the cloud and available via CDN, and maintained by the community, or maintained in a separate Git repository. In the mean time you need to have your own site data. Example data format is as follows:

```json
{
    "www.citrus.ua" : {
        "title" : {
            "selector"  : "meta[property=\"og:title\"]",
            "attr" : "content"
        },
        "url" : {
            "selector"  : "meta[property=\"og:url\"]",
            "attr" : "content"
        },
        "image" : {
            "selector"  : "meta[property=\"og:image\"]",
            "attr" : "content"
        },
        "price" : {
            "microdata" : "items.0.properties.offers.0.properties.price.0"
        },
        "priceCurrency" : {
            "microdata" : "items.0.properties.offers.0.properties.priceCurrency.0",
            "default"  : "UAH"
        }
    }
}
```

### Possible values

Ecomparser uses two types of looking for values: by DOM selectors using a very cool jQuery implementation [cheerio](https://github.com/cheeriojs/cheerio), or a handy microdata parser [microdata-node](https://github.com/Janpot/microdata-node).

*   `selector` is a jQuery-style selector, where root is the HTML document. By defaut value is taken from the element's `innerText` attribute
  *   `attr` is an optional param if you need to specify element property which contains the value (e.g. `content`, `src`, etc)
*   `microdata` is a namespace-like key to the parsed microdata object for microdata embedded into the page
  *   `default` is an optional default value used only for `priceCurrency` property. This is done because not all sites embed price currency info