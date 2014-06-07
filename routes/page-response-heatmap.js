var express = require('express');
var router = express.Router();
var moment = require('moment');

router.get('/q', function(req, res) {
	var fromTs = moment(req.query.fromTs.trim()).toDate();
	var toTs = moment(req.query.toTs.trim()).add('days', 1).toDate();
	var coll = 'page.day';
	var field = req.query.field.trim();
	var fun = req.query.fun.trim();
	
	var app = req.session.app;
	
	//build match
	var pg = req.query.pg.trim();
	var match = { 	$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.app":app } };
	if (pg != 'all') {
		match = { 	$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.app":app, "_id.pg":pg} };
	}
	
	// build group
	var group = { $group:{ 
						   _id: '$_id.ctr'
						}
				};
	var o = {}
	o[fun] = '$value.'+field;
	group.$group[field] = o;
		
	var pipeline = 	[
					match,
					group
					];
	
	console.log(pipeline);
	
	req.db.collection(coll).aggregate( pipeline, function (err, result) {
		if(err) {
			res.json({err:err});
		} else {
			var mapData={};
			result.forEach( function(entry) {
				mapData[entry._id] = entry[field];
			});
			res.json(mapData);
		}
	});
});

module.exports = router;