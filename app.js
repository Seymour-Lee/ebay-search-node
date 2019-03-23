const express = require('express')
const app = express()
const port = 8000

// server side, I use express.js.
// server only gets ajax from client, call api, parse result, return data which is needed for client
// 1. use express.static to set path to static resource, like image, css, js. In this way, could use 
//    url to get static resource(unnecessary for this proj)


app.get('/', (req, res) => res.send('Hello World!'))

app.get('/searchProducts', function(req, res) {
    res.sendfile('index.html');
});

app.get('/index.css', function(req, res) {
    res.sendfile('index.css');
});

app.get('/index.js', function(req, res) {
    res.sendfile('index.js');
});


var server = app.listen(port, function(){
    console.log(`Example app listening on port ${port}!`);
});

// var server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))