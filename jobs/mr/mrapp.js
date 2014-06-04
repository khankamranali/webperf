const
	mr = require('./mrjob');
	cron = require('cron');
	logger = require('morgan'),
	mongo = require('mongoskin');


var mongodbConnectionString = "mongodb://localhost:27017/webperf"
var db = mongo.db(mongodbConnectionString, {auto_reconnect: true, native_parser: true});

var cronJob = cron.job("0/10 * * * * *", function(){
    runMinMR(function() {
			runHourMR(function() {
				runDayMR( function() {
					console.log('All MR finished.');
					console.log('----------------');
		});});});
}); 

cronJob.start();

function runMinMR(callback) {
		console.log('Starting Min MR.');
		db.collection('conf').findOne( function (err, conf) {
			var ts = conf.min;
			ts.setMilliseconds(0);
			ts.setSeconds(0);
			var options = {query:{"ts":{$gte:ts}}, out:{merge:"page.min"}, finalize: mr.finalize};
			db.collection('page').mapReduce(mr.minmap, mr.reduce, options, function(err){
				if (err){
					console.log('Min MR Error:'+err);
					throw err;
				} else {
					console.log('Min MR Finished.');
					//update min timestamp
					db.collection('conf').update({}, {'$set':{min: new Date()}}, function(err) {
						if (err) {
							console.log('Error updating min in conf collection.');
						}
					});
					callback();
				}
			}) ;
		});
};

function runHourMR(callback) {
		console.log('Starting Hour MR.');
		db.collection('conf').findOne( function (err, conf) {
			var ts = conf.hour;
			ts.setMilliseconds(0);
			ts.setSeconds(0);
			ts.setMinutes(0);
			var options = {query:{"_id.ts":{$gte:ts}}, out:{merge:"page.hour"}, finalize: mr.finalize};
			db.collection('page.min').mapReduce(mr.hourmap, mr.reduce, options, function(err){
				if (err){
					console.log('Hour MR Error:'+err);
				} else {
					console.log('Hour MR Finished.');
					//update min timestamp
					db.collection('conf').update({}, {'$set':{hour: new Date()}}, function(err) {
						if (err) {
							console.log('Error updating hour in conf collection.');
						}
					});
					callback();
				}
			}) ;
		});
};

function runDayMR(callback) {
		console.log('Starting Day MR.');
		db.collection('conf').findOne( function (err, conf) {
			var ts = conf.day;
			ts.setMilliseconds(0);
			ts.setSeconds(0);
			ts.setMinutes(0);
			ts.setHours(0);
			var options = {query:{"_id.ts":{$gte:ts}}, out:{merge:"page.day"}, finalize: mr.finalize};
			db.collection('page.hour').mapReduce(mr.daymap, mr.reduce, options, function(err){
				if (err){
					console.log('Day MR Error:'+err);
				} else {
					console.log('Day MR Finished.');
					//update min timestamp
					db.collection('conf').update({}, {'$set':{day: new Date()}}, function(err) {
						if (err) {
							console.log('Error updating day in conf collection.');
						}
					});
					callback();
				}
			}) ;
		});
};