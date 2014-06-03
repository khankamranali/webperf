#!/usr/bin/env node
var debug = require('debug')('wpd');
var app = require('../app');
var https = require('https');
var http = require('http');
var fs = require('fs');

var options = {
  key: fs.readFileSync('./ssl/localhost.key'),
  cert: fs.readFileSync('./ssl/localhost.cert')
};

http.createServer(app).listen(3000);
https.createServer(options, app).listen(3443);
console.log('Server listening on http:3000 and https:3443 ports.');

