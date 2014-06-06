var express = require('express');
var router = express.Router();
var moment = require('moment');

router.get('/q', function(req, res) {
	var fromTs = moment(req.query.fromTs).toDate();
	var toTs = moment(req.query.toTs).add('days', 1).toDate();
	var coll = req.query.interval;
	var field = req.query.field;
	var fun = req.query.fun;
	
	var app = req.session.app;
	
	//build match
	var match = {$match: {"_id.ts" : { $gte: fromTs, $lte: toTs }, "_id.app":app }};
	
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