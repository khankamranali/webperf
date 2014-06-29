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
							   asc: {$sum: "$value.asc"},
							   atc: {$sum: "$value.atc"},
							 }
					},
					{ $sort: { "_id": 1 } },
					{	$project: 
							{
							   _id: 0,
							   ts: "$_id",
							   cnt : 1, 
							   asc: 1,
							   atc: 1
							}
					}
				];
	
	req.db.collection(coll).aggregate( pipeline, function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			result.forEach( function(entry) {
				entry.apdx = (entry.asc + (entry.atc/2))/entry.cnt;
				entry.apdx = entry.apdx.toFixed(2);
				entry.afc = Math.floor(((entry.cnt-(entry.asc+entry.atc))/entry.cnt)*100);
				entry.asc = Math.floor((entry.asc/entry.cnt)*100);
				entry.atc = Math.floor((entry.atc/entry.cnt)*100);
			});
			res.json(result);
		}
	});
});

module.exports = router;
