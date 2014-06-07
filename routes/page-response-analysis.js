var express = require('express');
var router = express.Router();
var moment = require('moment');

router.get('/q', function(req, res) {
	var fromTs = moment(req.query.fromTs.trim()).toDate();
	var toTs = moment(req.query.toTs.trim()).add('days', 1).toDate();
	var coll = req.query.interval.trim();
	var country = req.query.country.trim();
	var field = req.query.field.trim();
	var app = req.session.app;
	var pg = req.query.pg.trim();
	
	var match = { 	$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.app":app } };
	if (pg != 'all') {
		match = { 	$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.app":app, "_id.pg":pg} };
	}
	if (country!='all') {
		match.$match['_id.ctr'] = country;
	}
	
	// build group
	var group = { $group:{ 
						   _id: {year: { $year: "$_id.ts" }, month: { $month: "$_id.ts" }, day: {$dayOfMonth: "$_id.ts"}, hour: {$hour: "$_id.ts"}, minute: {$minute: "$_id.ts"}}
						}
				};
				
	if (field == 'cnt') {
		group.$group[field] = {$sum: '$value.'+field};
	} else {
		group.$group[field] = {$avg: '$value.'+field};
	}
	
	var project = 	{ $project: 
							{
							   _id: 0,
							   ts: "$_id",
							}
					};
	project.$project[field] = 1;
	
	var pipeline = [
					match,
					group,
					{ $sort: { "_id": 1 } },
					project
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