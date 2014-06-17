var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongo = require('mongoskin');
var responseTime = require('./my_modules/response_time');

var mongodbConnectionString = "mongodb://localhost:27017/webperf"
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodbConnectionString = process.env.OPENSHIFT_MONGODB_DB_URL + 'webperf';
}
var db = mongo.db(mongodbConnectionString, {auto_reconnect: true, native_parser: true});
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  db.authenticate('admin', '6WPBZjxMQyys', function(err, res) {
	console.log('Mongodb connection auth passed.');
  });
}

var session      = require('express-session');
var sessionstore = require('sessionstore');
var flash = require('connect-flash');
var passport = require('passport');

var ui = require('./routes/ui');
var pageResponseQuery = require('./routes/page-response-query');
var tag = require('./routes/tag');
var login = require('./routes/login');
var pageResponseAnalysis = require('./routes/page-response-chart');
var pageViewAnalysis = require('./routes/page-response-analysis');
var analysisOnWorldMap = require('./routes/page-response-heatmap');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(session({ secret: 'keyboard cat', name: 'sid', store: sessionstore.createSessionStore(), cookie: { secure: false }}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(responseTime());  
// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});
//append request and session to use directly in views and avoid passing around in every controller
app.use(function(req, res, next) {
    res.locals.req = req;
	res.locals.res = res;
    next(null, req, res);
});


app.use('/', ui);
app.use('/', login);
app.use('/page-response-query', pageResponseQuery);
app.use('/tag', tag);
app.use('/page-response-chart', pageResponseAnalysis);
app.use('/page-response-analysis', pageViewAnalysis);
app.use('/page-response-heatmap', analysisOnWorldMap);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
