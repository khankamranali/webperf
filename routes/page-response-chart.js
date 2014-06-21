var express = require('express');
var router = express.Router();
var moment = require('moment');

/* Day range */
router.get('/q', function(req, res) {
	var fromTs = moment(req.query.fromTs.trim()).toDate();
	var toTs = moment(req.query.toTs.trim()).add('days', 1).toDate();
	var coll = req.query.interval.trim();
	var app = req.session.app;
	var pg = req.query.pg.trim();
	var country = req.query.country.trim();

	var match = { 	$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.app":app } };
	if (pg != 'all') {
		match = { 	$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.app":app, "_id.pg":pg} };
	}
	if (country!='all') {
		match.$match['_id.ctr'] = country;
	}
	
	var pipeline = [
					match,
					{ 	$group :
							 { 
							   _id: {year: { $year: "$_id.ts" }, month: { $month: "$_id.ts" }, day: {$dayOfMonth: "$_id.ts"}, hour: {$hour: "$_id.ts"}, minute: {$minute: "$_id.ts"}},
							   cnt: {$sum : "$value.cnt" }, 
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
					{ $sort: { "_id": 1 } },
					{	$project: 
							{
							   _id: 0,
							   ts: "$_id",
							   cnt : 1, 
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
	
	req.db.collection(coll).aggregate( pipeline, function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			res.json(result);
		}
	});
});

module.exports = router;
