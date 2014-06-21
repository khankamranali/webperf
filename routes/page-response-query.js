var express = require('express');
var router = express.Router();
var moment = require('moment');

/* Day range */
router.get('/dayrange', ensureAuthenticated, function(req, res) {
	var fromTs = moment(req.query.fromTs.trim()).toDate();
	var toTs = moment(req.query.toTs.trim()).toDate();
	var app = req.session.app;
	
	var pipeline = [
					{ 	$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.app":app} },
					{ 	$group :
							 { _id : "$_id.pg",
							   pcnt : { $sum: "$value.pcnt" }, 
							   tt: {$avg: "$value.tt"},
							   rd: {$avg: "$value.rd"},
							   dns: {$avg: "$value.dns"},
							   con: {$avg: "$value.con"},
							   rq: {$avg: "$value.rq"},
							   st: {$avg: "$value.st"},
							   rs: {$avg: "$value.rs"},
							   dom: {$avg: "$value.dom"},
							   ld: {$avg: "$value.ld"}
							 }
					}, 
					{	$project: 
							{
							   _id: 0,
							   pg: "$_id",
							   pcnt : 1, 
							   tt: 1,
							   rd: 1,
							   dns: 1,
							   con: 1,
							   rq: 1,
							   st: 1,
							   rs: 1,
							   dom: 1,
							   ld: 1
							}
					}
				];
	
	req.db.collection('page.day').aggregate( pipeline, function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			result.forEach( function(entry) {
				entry.ctr=null;
				entry.ts=moment(fromTs).format("YYYY-MM-DDTHH:mm")+' - '+moment(toTs).format("YYYY-MM-DDTHH:mm");
				entry.tableType="DAY_RANGE";
				entry.tt = Math.floor(entry.tt);
				entry.rd = Math.floor(entry.rd);
				entry.dns = Math.floor(entry.dns);
				entry.con = Math.floor(entry.con);
				entry.rq = Math.floor(entry.rq);
				entry.st = Math.floor(entry.st);
				entry.rs = Math.floor(entry.rs);
				entry.dom = Math.floor(entry.dom);
				entry.ld = Math.floor(entry.ld);
			});
			res.json({sEcho:1, iTotalRecords:result.length, iTotalDisplayRecords:result.length, aaData:result});
		}
	});
});

/* Page day range */
router.get('/page/dayrange', ensureAuthenticated, function(req, res) {
	var fromTs = moment(req.query.fromTs).toDate();
	var toTs = moment(req.query.toTs).toDate();
	var pg = req.query.page;
	var app = req.session.app;
	
	var pipeline = [
					{ 	$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.pg":pg, "_id.app":app } },
					{ 	$group :
							 { _id : {"pg":"$_id.pg", "ctr":"$_id.ctr" },
							   pcnt : { $sum : "$value.pcnt" }, 
							   tt: {$avg: "$value.tt"},
							   rd: {$avg: "$value.rd"},
							   dns: {$avg: "$value.dns"},
							   con: {$avg: "$value.con"},
							   rq: {$avg: "$value.rq"},
							   st: {$avg: "$value.st"},
							   rs: {$avg: "$value.rs"},
							   dom: {$avg: "$value.dom"},
							   ld: {$avg: "$value.ld"}
							 }
					}, 
					{	$project: 
							{
							   _id: 0,
							   pg: "$_id.pg",
							   ctr: "$_id.ctr",
							   pcnt : 1, 
							   tt: 1,
							   rd: 1,
							   dns: 1,
							   con: 1,
							   rq: 1,
							   st:1,
							   rs: 1,
							   dom: 1,
							   ld: 1
							}
					}
				];
	
	req.db.collection('page.day').aggregate( pipeline, function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			result.forEach( function(entry) {
				entry.ts=moment(fromTs).format("YYYY-MM-DDTHH:mm")+' - '+moment(toTs).format("YYYY-MM-DDTHH:mm");
				entry.tableType="PAGE_DAY_RANGE"
				entry.tt = Math.floor(entry.tt);
				entry.rd = Math.floor(entry.rd);
				entry.dns = Math.floor(entry.dns);
				entry.con = Math.floor(entry.con);
				entry.rq = Math.floor(entry.rq);
				entry.st = Math.floor(entry.st);
				entry.rs = Math.floor(entry.rs);
				entry.dom = Math.floor(entry.dom);
				entry.ld = Math.floor(entry.ld);
			});
			res.json({sEcho:1, iTotalRecords:result.length, iTotalDisplayRecords:result.length, aaData:result});
		}
	});
});

/* Page country day */
router.get('/page/country/day', ensureAuthenticated, function(req, res) {
	var fromTs = moment(req.query.fromTs).toDate();
	var toTs = moment(req.query.toTs).toDate();
	var pg = req.query.page;
	var ctr = req.query.country;
	var app = req.session.app;
	
	var where = {"_id.ts": {"$gte": fromTs, "$lte": toTs}, "_id.pg": pg, "_id.ctr": ctr, "_id.app":app};
	
	req.db.collection('page.day').find(where).toArray(function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			newResult = []
			result.forEach( function(entry) {
				var e = entry.value;
				e.pg = entry._id.pg;
				e.ctr = entry._id.ctr;
				e.ts = moment(entry._id.ts).format("YYYY-MM-DDTHH:mm");
				e.tableType="PAGE_COUNTRY_DAY"
				newResult.push(e);
			});
			res.json({sEcho:1, iTotalRecords:result.length, iTotalDisplayRecords:result.length, aaData:newResult});
		}
	});
});

/* Page country hour */
router.get('/page/country/hour', ensureAuthenticated, function(req, res) {
	var fromTs = moment(req.query.fromTs).toDate();
	var toTs = moment(req.query.toTs).toDate();
	var pg = req.query.page;
	var ctr = req.query.country;
	var app = req.session.app;
	
	var where = {"_id.ts": {"$gte": fromTs, "$lte": toTs}, "_id.pg": pg, "_id.ctr": ctr, "_id.app":app};
	
	req.db.collection('page.hour').find(where).toArray(function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			newResult = []
			result.forEach( function(entry) {
				console.log(entry);
				var e = entry.value;
				e.pg = entry._id.pg;
				e.ctr = entry._id.ctr;
				e.ts = moment(entry._id.ts).format("YYYY-MM-DDTHH:mm");
				e.tableType="PAGE_COUNTRY_HOUR"
				newResult.push(e);
			});
			res.json({sEcho:1, iTotalRecords:result.length, iTotalDisplayRecords:result.length, aaData:newResult});
		}
	});
});


/* Page country minute */
router.get('/page/country/min', ensureAuthenticated, function(req, res) {
	var fromTs = moment(req.query.fromTs).toDate();
	var toTs = moment(req.query.toTs).toDate();
	var pg = req.query.page;
	var ctr = req.query.country;
	var app = req.session.app;
	
	var where = {"_id.ts": {"$gte": fromTs, "$lte": toTs}, "_id.pg": pg, "_id.ctr": ctr, "_id.app":app};
	
	req.db.collection('page.min').find(where).toArray(function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			newResult = []
			result.forEach( function(entry) {
				console.log(entry);
				var e = entry.value;
				e.pg = entry._id.pg;
				e.ctr = entry._id.ctr;
				e.ts = moment(entry._id.ts).format("YYYY-MM-DDTHH:mm");
				e.tableType="PAGE_COUNTRY_MIN"
				newResult.push(e);
			});
			res.json({sEcho:1, iTotalRecords:result.length, iTotalDisplayRecords:result.length, aaData:newResult});
		}
	});
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
