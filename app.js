const express = require('express')
const app = express()
const port = 8000

// server side, I use express.js.
// server only gets ajax from client, call api, parse result, return data which is needed for client
// 1. use express.static to set path to static resource, like image, css, js. In this way, could use 
//    url to get static resource(unnecessary for this proj)

const ebay_key = 'YimingLi-csci571h-PRD-2a6d0a603-ae320f66'
const google_key = 'AIzaSyAe98ZgzyxL-Y_yDJwyUxLZNIAYiOLhCkE'
const google_engine = '017216013711347458427:6m1-yskpuj8'
const facebook_key = '316200389071168'

// app.get('/', (req, res) => res.send('Hello World!'))
app.get('/', (req, res) => res.send(test()))

app.get('/searchProducts', function(req, res) {
    res.sendfile('index.html');
});

app.get('/index.css', function(req, res) {
    res.sendfile('index.css');
});

app.get('/index.js', function(req, res) {
    res.sendfile('index.js');
});

app.get('/search', function(req, res){
    console.log(req);
    res.send('search return')
});


var server = app.listen(port, function(){
    console.log(`Example app listening on port ${port}!`);
});

function test(){
    return 'hello world'
}

function ebay_search(){

}

function facebook_post(){

}

// https://www.googleapis.com/customsearch/v1?q=iphone&cx=017216013711347458427:6m1-yskpuj8&imgSize=huge&imgType=news&num=8&searchType=image&key=AIzaSyAe98ZgzyxL-Y_yDJwyUxLZNIAYiOLhCkE

function google_image(){
 

}

// var server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))