const express = require('express')
const https = require('https')
const http = require('http')
const app = express()
const port = 8081

// server side, I use express.js.
// server only gets ajax from client, call api, parse result, return data which is needed for client
// 1. use express.static to set path to static resource, like image, css, js. In this way, could use 
//    url to get static resource(unnecessary for this proj)

const ebay_key = 'YimingLi-csci571h-PRD-2a6d0a603-ae320f66'
const google_key = 'AIzaSyAe98ZgzyxL-Y_yDJwyUxLZNIAYiOLhCkE'
const google_engine = '017216013711347458427:ibzu5g17jz8'
const facebook_key = '316200389071168'
const geoname_username = 'liyiming'

var category2id = {
    "art": "550",
    "baby": "2984",
    "books": "267",
    "clothings": "11450",
    "computers": "58058",
    "health": "26395",
    "music": "11233",
    "video": "1249",
};

var last_keyword_result = {};

const ebay_keyword_url = 'http://svcs.ebay.com/services/search/FindingService/v1?'
const ebay_item_url = 'http://open.api.ebay.com/shopping?'
const ebay_similar_url = 'http://svcs.ebay.com/MerchandisingService?'
const google_photos_url = 'https://www.googleapis.com/customsearch/v1?'
const geoname_postalcode_url = 'http://api.geonames.org/postalCodeSearchJSON?'

app.use(express.static(__dirname + '/node_modules'));

app.get('/', (req, res) => res.sendfile('index.html'));
app.get('/index.css', (req, res) => res.sendfile('index.css'));
app.get('/index.js', (req, res) => res.sendfile('index.js'));
app.get('/searchProducts', (req, res) => res.sendfile('index.html'));
app.get('/search_keyword', (req, res) => ebay_search_keyword(req, res));
app.get('/search_item', (req, res) => ebay_search_item(req, res));
app.get('/search_similar', (req, res) => ebay_search_similar(req, res));
app.get('/search_photos', (req, res) => google_search_photos(req, res));
app.get('/postalcode', (req, res) => geoname_postalcode(req, res));


var server = app.listen(port, function(){
    console.log(`express.js app listening on port ${port}!`);
});


function ebay_search_keyword(req, res){
    // console.log(req.query);
    // call ebay search keyword api
    var param = req.query;
    var url = ebay_keyword_url;
    // {   categpry: 'computers',
    //     distance: 'aaa',
    //     free: 'false',
    //     from: 'location', // no need for this in ebay api
    //     keyword: 'dasdasd',
    //     local: 'true',
    //     new: 'false',
    //     unspecified: 'true',
    //     used: 'false',
    //     zipcode: '' }

    // http://svcs.ebay.com/services/search/FindingService/v1?
    // OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0
    // &SECURITY-APPNAME=[APP- ID]&RESPONSE-DATA-FORMAT=JSON&REST- PAYLOAD
    // &paginationInput.entriesPerPage=50&keywords=iphone&buyerPostalCode=90007
    // &itemFilter(0).name=MaxDistance&itemFilter(0).value=10
    // &itemFilter(1).name=FreeShipping Only&itemFilter(1).value=true
    // &itemFilter(2).name=LocalPickupOnly&itemFilter(2).value=true
    // &itemFilter(3).name=HideDuplicateItems&itemFilter(3).value=true
    // &itemFilter(4).name=Condition&itemFilter(4).value(0)=New
    // &itemFilter(4).value(1)=Used&itemFilter(4).value(2)=Unspecified
    // &outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo

    url += 'OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0';
    url += '&SECURITY-APPNAME=' + ebay_key;
    url += '&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=50';
    url += '&keywords=' + param.keyword;
    url += '&buyerPostalCode=' + param.zipcode;
    if(param.categpry != 'all'){
        url += '&categoryId=' + category2id[param.categpry];
    }
    url += '&itemFilter(0).name=MaxDistance&itemFilter(0).value=' + param.distance;
    url += '&itemFilter(1).name=FreeShipping Only&itemFilter(1).value=' + param.free;
    url += '&itemFilter(2).name=LocalPickupOnly&itemFilter(2).value=' + param.local;
    url += '&itemFilter(3).name=HideDuplicateItems&itemFilter(3).value=true';
    var counter = 0;
    if(param.new == 'true') counter += 1;
    if(param.used == 'true') counter += 1;
    if(param.unspecified == 'true') counter += 1;
    if(counter > 0){
        var i = 0;
        url += '&itemFilter(4).name=Condition';
        if(param.new == 'true'){
            url += '&itemFilter(4).value('+i.toString()+')=New';
            i += 1;
        }
        if(param.used == 'true'){
            url += '&itemFilter(4).value('+i.toString()+')=Used';
            i += 1;
        } 
        if(param.unspecified == 'true'){
            url += '&itemFilter(4).value('+i.toString()+')=Unspecified';
            i += 1;
        } 
    }
    url += '&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo';

    http.get(url, (resp) => {
        const { statusCode } = resp;
        const contentType = resp.headers['content-type'];
        // console.log(contentType)

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        }
        // text/plain;charset=UTF-8
        else if (!/^text\/plain/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                            `Expected text/plain but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            resp.resume();
            return;
        }

        // resp.setEncoding('utf8');
        let rawData = '';
        resp.on('data', (chunk) => { rawData += chunk; });
        resp.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                var items = parsedData.findItemsAdvancedResponse[0].searchResult[0].item;
                // save a map for last searched items: id2obj
                last_keyword_result = {};
                var cols = [];
                // handle no records
                for(var i = 0; i < items.length; i++){
                    var col = {};
                    var item = items[i];
                    last_keyword_result[item.itemId[0]] = item;
                    col["id"] = item.itemId[0];
                    col["index"] = (i+1).toString();
                    if(item.hasOwnProperty('galleryURL')) col["image"] = item.galleryURL[0];
                    else col["image"] = "";
                    if(item.title[0].length > 35){
                        col["title"] = item.title[0].substring(0, 35);
                        var pos = col["title"].length;
                        while(col["title"][pos] != ' ') pos = pos-1;
                        col["title"] = col["title"].substring(0, pos+1) + '...';
                    }
                    else{
                        col["title"] = item.title[0];
                    }
                    col["tooltip"] = item.title[0];
                    col["price"] = '$'+item.sellingStatus[0].currentPrice[0].__value__;
                    if(item.hasOwnProperty('shippingInfo')) col["shipping"] = 'N/A';
                    else if(item.shippingInfo[0].shippingServiceCost[0].__value__ == '0') col["shipping"] = 'Free Shipping';
                    else col["shipping"] = '$'+item.shippingInfo[0].shippingServiceCost[0].__value__;
                    col["zip"] = item.postalCode[0];
                    col["seller"] = item.sellerInfo[0].sellerUserName[0];
                    cols.push(col);
                }
                // console.log(items.slice(-1))
                // console.log(cols.slice(-1))
                // console.log(parsedData);
                res.send(cols)
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
    // res.send(req.query)
}

function ebay_search_item(req, res){
    // console.log(req.query);
    // call ebay search item api
    var param = req.query;
    var url = ebay_item_url;

    // http://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=[APP-ID]
    //                                  &siteid=0&version=967&ItemID=132961484706
    //                                  &IncludeSelector=Description,Details,ItemSpecifics
    url += 'callname=GetSingleItem&responseencoding=JSON';
    url += '&appid=' + ebay_key;
    url += '&siteid=0&version=967&ItemID=' + param.id;
    url += '&IncludeSelector=Description,Details,ItemSpecifics';

    // console.log(url)

    http.get(url, (resp) => {
        const { statusCode } = resp;
        const contentType = resp.headers['content-type'];
        // console.log(contentType)

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        }
        // text/plain;charset=UTF-8
        else if (!/^text\/plain/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                            `Expected text/plain but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            resp.resume();
            return;
        }

        // resp.setEncoding('utf8');
        let rawData = '';
        resp.on('data', (chunk) => { rawData += chunk; });
        resp.on('end', () => {
            // console.log(rawData);
            try {
                const parsedData = JSON.parse(rawData);
                // console.log(parsedData);
                var item = parsedData.Item;
                var ans = {};
                var product = {};
                product["title"] = item.Title;
                product["id"] = item.ItemID;
                product["images"] = item.PictureURL;
                product["subtitle"] = item.Subtitle;
                product["price"] = "$" + item.CurrentPrice.Value.toString();
                product["location"] = item.Location;
                product["returnpolicy"] = item.ReturnPolicy.ReturnsAccepted + " Within " + item.ReturnPolicy.ReturnsWithin;
                product["specifics"] = item.ItemSpecifics.NameValueList;
                product["natureserchurl"] = item.ViewItemURLForNaturalSearch;
                ans["product"] = product;

                // // call google api
                // var photos = [];

                // last_keyword_result to get shipping info
                var id = item.ItemID;
                var shipping_info = last_keyword_result[id].shippingInfo[0]
                var shipping = {};
                shipping["cost"] = (shipping_info.shippingServiceCost[0].__value__ == '0.0'? 'Free Shipping': '$'+shipping_info.shippingServiceCost[0].__value__);
                shipping["location"] = shipping_info.shipToLocations[0];
                shipping["handle_time"] = shipping_info.handlingTime[0] + ' Day';
                shipping["expedited"] = shipping_info.expeditedShipping[0];
                shipping["oneday"] = shipping_info.oneDayShippingAvailable[0];
                shipping["return"] = last_keyword_result[id].returnsAccepted[0];
                ans["shipping"] = shipping;

                var seller = {};
                seller["feedback"] = item.Seller.FeedbackScore;
                seller["popularity"] = item.Seller.PositiveFeedbackPercent;
                // change rating to color
                seller["rating"] = item.Seller.FeedbackRatingStar.toLowerCase();
                seller["toprated"] = item.Seller.TopRatedSeller;
                seller["store"] = item.Storefront.StoreName;
                seller["title"] = item.Storefront.StoreName.replace(/ /g,'').toUpperCase();
                seller["at"] = item.Storefront.StoreURL;
                ans["seller"] = seller;

                // // call ebay similar api
                // var similar = ebay_search_similar(id);
                // console.log(similar);

                res.send(ans);
                // console.log(ans);
                
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
    // res.send(req.query)
}

function ebay_search_similar(req, res){
    var param = req.query;
    var url = ebay_similar_url;
    url += 'OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0';
    url += '&CONSUMER-ID=' + ebay_key;
    url += '&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId=' + param.id;
    url += '&maxResults=20';

    http.get(url, (resp) => {
        const { statusCode } = resp;
        const contentType = resp.headers['content-type'];
        // console.log(contentType)

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        }
        // application/json;charset=utf-8
        else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                            `Expected text/plain but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            resp.resume();
            return;
        }

        // resp.setEncoding('utf8');
        let rawData = '';
        resp.on('data', (chunk) => { rawData += chunk; });
        resp.on('end', () => {
            // console.log(rawData);
            try {
                const parsedData = JSON.parse(rawData);
                items = parsedData.getSimilarItemsResponse.itemRecommendations.item;
                var ans = [];
                for(var i = 0; i < items.length; i++){
                    var item = items[i];
                    var cur = {};
                    cur["name"] = item.title;
                    cur["image"] = item.imageURL;
                    cur["url"] = item.viewItemURL;
                    cur["price"] = "$"+item.buyItNowPrice.__value__;
                    cur["shipping"] = "$"+item.shippingCost.__value__;
                    cur["days"] = item.timeLeft.substring(item.timeLeft.indexOf("P")+1, item.timeLeft.indexOf("D"));
                    ans.push(cur);
                }
                // console.log(items.slice(-1));
                res.send(ans);
                // console.log(similar_items)
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}

// https://www.googleapis.com/customsearch/v1?q=iphone&cx=017216013711347458427:6m1-yskpuj8
//                                           &imgSize=huge&imgType=news&num=8&searchType=image
//                                           &key=AIzaSyAe98ZgzyxL-Y_yDJwyUxLZNIAYiOLhCkE

function google_search_photos(req, res){
    var param = req.query;
    var url = google_photos_url;
    url += 'q=' + param.title;
    url += '&cx=' + google_engine;
    url += '&imgSize=huge&imgType=news&num=8&searchType=image';
    url += '&key=' + google_key;

    https.get(url, (resp) => {
        const { statusCode } = resp;
        const contentType = resp.headers['content-type'];
        // console.log(contentType)

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        }
        // application/json;charset=utf-8
        else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                            `Expected text/plain but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            resp.resume();
            return;
        }

        // resp.setEncoding('utf8');
        let rawData = '';
        resp.on('data', (chunk) => { rawData += chunk; });
        resp.on('end', () => {
            // console.log(rawData);
            try {
                const parsedData = JSON.parse(rawData);
                var items = parsedData.items;
                var ans = [];
                for(var i = 0; i < items.length; i++){
                    ans.push(items[i].link);
                }
                res.send(ans);
                // console.log(similar_items)
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}

// http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=900&username=liyiming&country=US&maxRows=5
function geoname_postalcode(req, res){
    //postalcode_startsWith=900&username=[Usern ame]&country=US&maxRows=5
    var param = req.query;
    var url = geoname_postalcode_url;
    url += 'postalcode_startsWith=' + param.code;
    url += '&username=' + geoname_username;
    url += '&country=US&maxRows=5';

    http.get(url, (resp) => {
        const { statusCode } = resp;
        const contentType = resp.headers['content-type'];
        // console.log(contentType)

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        }
        // application/json;charset=utf-8
        else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                            `Expected text/plain but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            resp.resume();
            return;
        }

        // resp.setEncoding('utf8');
        let rawData = '';
        resp.on('data', (chunk) => { rawData += chunk; });
        resp.on('end', () => {
            // console.log(rawData);
            try {
                const parsedData = JSON.parse(rawData);
                var ans = [];
                for(var i = 0; i < parsedData.postalCodes.length; i++){
                    ans.push(parsedData.postalCodes[i].postalCode);
                }
                res.send(ans);
                // console.log(similar_items)
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}

function facebook_post(){

}



// var server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))