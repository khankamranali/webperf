var mongo = require('mongoskin');

module.exports.db = function(){ 
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
	console.log('Mongodb connection done.');
	return db;
}