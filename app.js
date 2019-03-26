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
const google_engine = '017216013711347458427:6m1-yskpuj8'
const facebook_key = '316200389071168'

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

const ebay_keyword_url = 'http://svcs.ebay.com/services/search/FindingService/v1?'

app.use(express.static(__dirname + '/node_modules'));

app.get('/', (req, res) => res.send(test()));
app.get('/index.css', (req, res) => res.sendfile('index.css'));
app.get('/index.js', (req, res) => res.sendfile('index.js'));
app.get('/searchProducts', (req, res) => res.sendfile('index.html'));
app.get('/search_keyword', (req, res) => ebay_search_keyword(req, res));

app.get('/search_item', function(req, res){
    console.log(req.query);
    // call ebay search item api
    res.send(req.query)
});

var server = app.listen(port, function(){
    console.log(`express.js app listening on port ${port}!`);
});

function test(){
    return 'hello world'
}

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
                var cols = [];
                // handle no records
                for(var i = 0; i < items.length; i++){
                    var col = {};
                    var item = items[i];
                    col["index"] = (i+1).toString();
                    if(item.hasOwnProperty('galleryURL')) col["image"] = item.galleryURL[0];
                    else col["image"] = "";
                    col["title"] = item.title;
                    col["price"] = item.sellingStatus[0].currentPrice[0].__value__;
                    if(item.hasOwnProperty('shippingInfo')) col["shipping"] = 'N/A';
                    else if(item.shippingInfo[0].shippingServiceCost[0].__value__ == '0') col["shipping"] = 'Free Shipping';
                    else col["shipping"] = item.shippingInfo[0].shippingServiceCost[0].__value__;
                    col["zip"] = item.postalCode;
                    col["seller"] = item.sellerInfo[0].sellerUserName[0];
                    cols.push(col);
                }
                console.log(cols[49])
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

function facebook_post(){

}

// https://www.googleapis.com/customsearch/v1?q=iphone&cx=017216013711347458427:6m1-yskpuj8&imgSize=huge&imgType=news&num=8&searchType=image&key=AIzaSyAe98ZgzyxL-Y_yDJwyUxLZNIAYiOLhCkE

function google_image(){
 

}

// var server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))