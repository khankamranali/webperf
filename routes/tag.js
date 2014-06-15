var express = require('express');
var router = express.Router();
var maxmind = require('maxmind');

maxmind.init('./geodb/GeoIP.dat');
console.log('maxmind init done.');

/*  page performance timing tag*/
router.get('/:tag', function(req, res) {
	var pt = {};
	var tag = req.params.tag.trim();
	var data = req.query;
	
	if ( tag!='page' || data.app=='undefined' || data.pg=='undefined') {
		res.status(400);
		res.send('Invalid tag or app and pg values missing.');
		return;
	}
	
	pt.app = data.app;
	pt.pg = data.pg;
	pt.tt = parseInt(data.tt);
	pt.rd = parseInt(data.rd.trim());
	pt.dns = parseInt(data.dns.trim());
	pt.con = parseInt(data.con.trim());
	pt.rq = parseInt(data.rq.trim());
	pt.rs = parseInt(data.rs.trim());
	pt.dom = parseInt(data.dom.trim());
	pt.ld = parseInt(data.ld.trim());
	pt.st = parseInt(data.st.trim());
	pt.sn = data.sn.trim();
	
	//if total time is greater than 5 Min, then the data is corrupt ignore it
	if (isNaN(pt.tt)|| isNaN(pt.rd)|| isNaN(pt.dns) || isNaN(pt.con) || isNaN(pt.rq) || isNaN(pt.rs) || isNaN(pt.dom) || isNaN(pt.ld) || isNaN(pt.st) || pt.tt>300000) {
		// send no content http code.
		res.status(500);
		res.send('Incorrect performance data.');
		return;
	}
	
	// Add country code, timestamp and ip
	var country = maxmind.getCountry(req.ip.trim());
	pt.ts = new Date();
	pt.ctr = country.code;
	pt.ip = req.ip;
	
	req.db.collection(tag).insert( pt, function (err, result) {
		if(err) {
			res.json({err:err});
		}
		// send no content http code.
		res.status(204);
		res.send();
	});
});

module.exports = router;