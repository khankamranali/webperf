var express = require('express');
var router = express.Router();
var moment = require('moment');

/* GET home page. */
router.get('/home', ensureAuthenticated,function(req, res) {
  res.render('home', { title: 'Home'});
});

/* GET home page. */
router.get('/', function(req, res) {
  res.redirect('/home');
});


/* GET page response time query page. */
router.get('/page-response-query', ensureAuthenticated,function(req, res) {
  res.render('page-response-query', { title: 'Home', moment: moment });
});

/* GET page response time analysis page. */
router.get('/page-response-analysis', ensureAuthenticated,function(req, res) {
  res.render('page-response-analysis', { moment: moment });
});

/* GET page response time analysis page. */
router.get('/page-view-analysis', ensureAuthenticated,function(req, res) {
  res.render('page-view-analysis', { moment: moment });
});

/* GET page response time analysis page. */
router.get('/analysis-on-worldmap', ensureAuthenticated,function(req, res) {
  res.render('analysis-on-worldmap', { moment: moment });
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
module.exports = router;
