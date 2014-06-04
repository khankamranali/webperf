#!/usr/bin/env node
var debug = require('debug')('wpd');
var app = require('./app');
var https = require('https');
var http = require('http');
var fs = require('fs');

var options = {
  key: fs.readFileSync('./ssl/localhost.key'),
  cert: fs.readFileSync('./ssl/localhost.cert')
};

var port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

http.createServer(app).listen(port, ip, function () {
  console.log( "Listening on ip=" + ip + ", port=" + port )
});

//https.createServer(options, app).listen(3443);
//console.log('Server listening on http:3000 and https:3443 ports.');

var mrapp = require('./jobs/mr/mrapp');