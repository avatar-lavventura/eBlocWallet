var fs = require('fs');
var vhost = require('vhost');
var express = require('express');
var http = require('http');
var app = express();
app.use(vhost('79.123.177.145',         require('./index.js').app)); //changed!
app.use(vhost('ebloc.cmpe.boun.edu.tr', require('./index.js').app)); //changed!
//app.use(vhost('localhost', require('./index.js').app));
//app.use(vhost('127.0.0.1', require('./index.js').app));
var httpServer = http.createServer(app);
httpServer.listen(3002);//changed!
