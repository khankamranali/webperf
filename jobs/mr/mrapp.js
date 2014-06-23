const
	mr = require('./mrjob');
	cron = require('cron');
	logger = require('morgan'),
	mongo = require('mongoskin');


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

var cronJob = cron.job("0/10 * * * * *", function(){
    init(function() { 
		runMinMR(function() {
			runHourMR(function() {
				runDayMR( function() {
					console.log('All MR finished.');
					console.log('----------------');
	});});});});
}); 

cronJob.start();

var runMinMR = function(callback) {
		console.log('Starting Min MR.');
		db.collection('conf').findOne( function (err, conf) {
			var startTime = new Date();
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
					db.collection('conf').update({}, {'$set':{min: startTime}}, function(err) {
						if (err) {
							console.log('Error updating min in conf collection.');
						}
					});
					callback();
				}
			}) ;
		});
};

var runHourMR = function(callback) {
		console.log('Starting Hour MR.');
		db.collection('conf').findOne( function (err, conf) {
			var startTime = new Date();
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
					db.collection('conf').update({}, {'$set':{hour: startTime}}, function(err) {
						if (err) {
							console.log('Error updating hour in conf collection.');
						}
					});
					callback();
				}
			}) ;
		});
};

var runDayMR = function(callback) {
		console.log('Starting Day MR.');
		db.collection('conf').findOne( function (err, conf) {
			var startTime = new Date();
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
					db.collection('conf').update({}, {'$set':{day: startTime}}, function(err) {
						if (err) {
							console.log('Error updating day in conf collection.');
						}
					});
					callback();
				}
			}) ;
		});
};

// create required collections and create indexes
var  init = function(callback) {
	// create conf table which is required to run MR jobs
	db.collection('conf').find().toArray(function(err, result) {
		if (err) throw err;
		if (result.length < 1) {
			var row = {day: new Date(0), hour: new Date(0), min: new Date(0)};
			db.collection('conf').insert( row, function (err) {
				if (err) throw err;
			});
		}
	});
	
	// Create indexes
	db.collection('page').ensureIndex({'ts':-1}, function(err, result) {
		if (err) throw err;
	});
	
	db.collection('page.min').ensureIndex({'_id.app':1, '_id.ts':-1, '_id.ctr':1, '_id.pg':1}, function(err, result) {
		if (err) throw err;
	});
	db.collection('page.min').ensureIndex({'_id.app':1, '_id.ts':-1, '_id.pg':1}, function(err, result) {
		if (err) throw err;
	});
	db.collection('page.hour').ensureIndex({'_id.app':1, '_id.ts':-1, '_id.ctr':1, '_id.pg':1}, function(err, result) {
		if (err) throw err;
	});
	db.collection('page.hour').ensureIndex({'_id.app':1, '_id.ts':-1, '_id.pg':1}, function(err, result) {
		if (err) throw err;
	});

	db.collection('page.day').ensureIndex({'_id.app':1, '_id.ts':-1, '_id.ctr':1, '_id.pg':1}, function(err, result) {
		if (err) throw err;
	});
	db.collection('page.day').ensureIndex({'_id.app':1, '_id.ts':-1, '_id.pg':1}, function(err, result) {
		if (err) throw err;
	});
	db.collection('page.day').ensureIndex({'_id.app':1, '_id.ts':-1, 'value.tt':1}, function(err, result) {
		if (err) throw err;
	});
	callback();
};