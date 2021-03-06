var express = require('express');
var router = express.Router();
var moment = require('moment');

/* Day range */
router.get('/dayrange', ensureAuthenticated, function(req, res) {
	var fromTs = moment(req.query.fromTs.trim()).toDate();
	var toTs = moment(req.query.toTs.trim()).toDate();
	var app = req.session.app;
	var tt = parseInt(req.query.tt.trim());
	
	var pipeline = [
					{ 	$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.app":app, "value.tt":{$gte:tt}} },
					{ 	$group :
							 { _id : "$_id.pg",
							   cnt : { $sum: "$value.cnt" }, 
							   tt: {$sum: {$multiply:["$value.tt", "$value.cnt"]}},
							   rd: {$sum: {$multiply:["$value.rd", "$value.cnt"]}},
							   dns: {$sum: {$multiply:["$value.dns", "$value.cnt"]}},
							   con: {$sum: {$multiply:["$value.con", "$value.cnt"]}},
							   rq: {$sum: {$multiply:["$value.rq", "$value.cnt"]}},
							   st: {$sum: {$multiply:["$value.st", "$value.cnt"]}},
							   rs: {$sum: {$multiply:["$value.rs", "$value.cnt"]}},
							   dom: {$sum: {$multiply:["$value.dom", "$value.cnt"]}},
							   ld: {$sum: {$multiply:["$value.ld", "$value.cnt"]}}
							 }
					}, 
					{	$project: 
							{
							   _id: 0,
							   pg: "$_id",
							   cnt : 1, 
							   tt: {$divide:["$tt","$cnt"]},
							   rd: {$divide:["$rd","$cnt"]},
							   dns: {$divide:["$dns","$cnt"]},
							   con: {$divide:["$con","$cnt"]},
							   rq: {$divide:["$rq","$cnt"]},
							   st: {$divide:["$st","$cnt"]},
							   rs: {$divide:["$rs","$cnt"]},
							   dom: {$divide:["$dom","$cnt"]},
							   ld: {$divide:["$ld","$cnt"]}
							}
					}
				];
	
	req.db.collection('page.day').aggregate( pipeline, function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			result.forEach( function(entry) {
				entry.ctr=null;
				entry.ts=moment(fromTs).format("YYYY-MM-DDTHH:mm Z")+' - '+moment(toTs).format("YYYY-MM-DDTHH:mm Z");
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
	var fromTs = moment(req.query.fromTs.trim(),'YYYY-MM-DDTHH:mm Z').toDate();
	var toTs = moment(req.query.toTs.trim(), 'YYYY-MM-DDTHH:mm Z').toDate();
	var pg = req.query.page.trim();
	var app = req.session.app;
	
	var pipeline = [
					{ 	$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.pg":pg, "_id.app":app } },
					{ 	$group :
							 { _id : {"pg":"$_id.pg", "ctr":"$_id.ctr" },
							   cnt : { $sum : "$value.cnt" }, 
							   tt: {$sum: {$multiply:["$value.tt", "$value.cnt"]}},
							   rd: {$sum: {$multiply:["$value.rd", "$value.cnt"]}},
							   dns: {$sum: {$multiply:["$value.dns", "$value.cnt"]}},
							   con: {$sum: {$multiply:["$value.con", "$value.cnt"]}},
							   rq: {$sum: {$multiply:["$value.rq", "$value.cnt"]}},
							   st: {$sum: {$multiply:["$value.st", "$value.cnt"]}},
							   rs: {$sum: {$multiply:["$value.rs", "$value.cnt"]}},
							   dom: {$sum: {$multiply:["$value.dom", "$value.cnt"]}},
							   ld: {$sum: {$multiply:["$value.ld", "$value.cnt"]}}
							 }
					}, 
					{	$project: 
							{
							   _id: 0,
							   pg: "$_id.pg",
							   ctr: "$_id.ctr",
							   cnt : 1, 
							   tt: {$divide:["$tt","$cnt"]},
							   rd: {$divide:["$rd","$cnt"]},
							   dns: {$divide:["$dns","$cnt"]},
							   con: {$divide:["$con","$cnt"]},
							   rq: {$divide:["$rq","$cnt"]},
							   st:{$divide:["$st","$cnt"]},
							   rs: {$divide:["$rs","$cnt"]},
							   dom: {$divide:["$dom","$cnt"]},
							   ld: {$divide:["$ld","$cnt"]}
							}
					}
				];
	
	req.db.collection('page.day').aggregate( pipeline, function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			result.forEach( function(entry) {
				entry.ts=moment(fromTs).format("YYYY-MM-DDTHH:mm Z")+' - '+moment(toTs).format("YYYY-MM-DDTHH:mm Z");
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
	var fromTs = moment(req.query.fromTs.trim(), 'YYYY-MM-DDTHH:mm Z').toDate();
	var toTs = moment(req.query.toTs.trim(), 'YYYY-MM-DDTHH:mm Z').toDate();
	var pg = req.query.page.trim();
	var ctr = req.query.country.trim();
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
				e.ts = moment(entry._id.ts).format("YYYY-MM-DDTHH:mm Z");
				e.tableType="PAGE_COUNTRY_DAY"
				newResult.push(e);
			});
			res.json({sEcho:1, iTotalRecords:result.length, iTotalDisplayRecords:result.length, aaData:newResult});
		}
	});
});

/* Page country hour */
router.get('/page/country/hour', ensureAuthenticated, function(req, res) {
	var fromTs = moment(req.query.fromTs.trim(), 'YYYY-MM-DDTHH:mm Z').toDate();
	var toTs = moment(req.query.toTs.trim(), 'YYYY-MM-DDTHH:mm Z').toDate();
	var pg = req.query.page.trim();
	var ctr = req.query.country.trim();
	var app = req.session.app;
	
	var where = {"_id.ts": {"$gte": fromTs, "$lte": toTs}, "_id.pg": pg, "_id.ctr": ctr, "_id.app":app};
	
	req.db.collection('page.hour').find(where).toArray(function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			newResult = []
			result.forEach( function(entry) {
				var e = entry.value;
				e.pg = entry._id.pg;
				e.ctr = entry._id.ctr;
				e.ts = moment(entry._id.ts).format("YYYY-MM-DDTHH:mm Z");
				e.tableType="PAGE_COUNTRY_HOUR"
				newResult.push(e);
			});
			res.json({sEcho:1, iTotalRecords:result.length, iTotalDisplayRecords:result.length, aaData:newResult});
		}
	});
});


/* Page country minute */
router.get('/page/country/min', ensureAuthenticated, function(req, res) {
	var fromTs = moment(req.query.fromTs.trim(), 'YYYY-MM-DDTHH:mm Z').toDate();
	var toTs = moment(req.query.toTs.trim(), 'YYYY-MM-DDTHH:mm Z').toDate();
	var pg = req.query.page.trim();
	var ctr = req.query.country.trim();
	var app = req.session.app;
	
	var where = {"_id.ts": {"$gte": fromTs, "$lte": toTs}, "_id.pg": pg, "_id.ctr": ctr, "_id.app":app};
	
	req.db.collection('page.min').find(where).toArray(function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			newResult = []
			result.forEach( function(entry) {
				var e = entry.value;
				e.pg = entry._id.pg;
				e.ctr = entry._id.ctr;
				e.ts = moment(entry._id.ts).format("YYYY-MM-DDTHH:mm Z");
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
