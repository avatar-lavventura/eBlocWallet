var fs = require('fs');
var vhost = require('vhost');
var express = require('express');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('/etc/ssl/private/ssl-cert-snakeoil.key', 'utf8');
var certificate = fs.readFileSync('/etc/ssl/certs/ssl-cert-snakeoil.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var app = express();
app.use(vhost('rpc.myetherwallet.com', require('./index.js').app));
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
httpServer.listen(3002); //changed!
httpsServer.listen(443);
