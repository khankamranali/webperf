function minmap() {
	var ts = this.ts;
	ts.setMilliseconds(0);
	ts.setSeconds(0);
	
	var pcnt = 0;
	if (this.tt > 0) {
		pcnt = 1;
	}
	
	var value = {
		cnt : 1,
		pcnt : pcnt,
		tt : this.tt,
		rd : this.rd,
		dns : this.dns,
		con : this.con,
		rq : this.rq,
		st : this.st,
		rs : this.rs,
		dom : this.dom,
		ld : this.ld,
	};
	emit({
		app : this.app,
		pg : this.pg,
		ctr: this.ctr,
		sn: this.sn,
		ts : ts
	}, value);
};

function hourmap() {
	var ts = this._id.ts;
	ts.setMilliseconds(0);
	ts.setSeconds(0);
	ts.setMinutes(0);
	
	var value = {
		cnt : this.value.cnt,
		pcnt : this.value.pcnt,
		tt : this.value.tt,
		rd : this.value.rd,
		dns : this.value.dns,
		con : this.value.con,
		rq : this.value.rq,
		st : this.value.st,
		rs : this.value.rs,
		dom : this.value.dom,
		ld : this.value.ld,
	};
	emit({
		app : this._id.app,
		pg : this._id.pg,
		ctr : this._id.ctr,
		sn: this._id.sn,
		ts : ts
	}, value);
};

function daymap() {
	var ts = this._id.ts;
	ts.setMilliseconds(0);
	ts.setSeconds(0);
	ts.setMinutes(0);
	ts.setHours(0);

	var value = {
		cnt : this.value.cnt,
		pcnt : this.value.pcnt,
		tt : this.value.tt,
		rd : this.value.rd,
		dns : this.value.dns,
		con : this.value.con,
		rq : this.value.rq,
		st : this.value.st,
		rs : this.value.rs,
		dom : this.value.dom,
		ld : this.value.ld,
	};
	emit({
		app : this._id.app,
		pg : this._id.pg,
		ctr : this._id.ctr,
		sn: this._id.sn,
		ts : ts
	}, value);
};

function reduce(key, values) {
	var cnt = 0;
	var pcnt = 0;
	var tt = 0;
	var rd = 0;
	var dns = 0;
	var con = 0;
	var rq = 0;
	var st = 0;
	var rs = 0;
	var dom = 0;
	var ld = 0;
	values.forEach(function(value) {
		cnt += value.cnt;
		pcnt += value.pcnt;
		tt += value.tt;
		rd += value.rd;
		dns += value.dns;
		con += value.con;
		rq += value.rq;
		st += value.st;
		rs += value.rs;
		dom += value.dom;
		ld += value.ld;
	});
	return {
		cnt : cnt,
		pcnt : pcnt,
		tt : tt,
		rd : rd,
		dns : dns,
		con : con,
		rq : rq,
		st : st,
		rs : rs,
		dom : dom,
		ld : ld,
	};
};

function finalize(key, value) {
	if (value.pcnt>0) {
		value.tt = Math.round(value.tt / value.pcnt);
		value.rd = Math.round(value.rd / value.pcnt);
		value.dns = Math.round(value.dns / value.pcnt);
		value.con = Math.round(value.con / value.pcnt);
		value.rq = Math.round(value.rq / value.pcnt);
		value.st = Math.round(value.st / value.pcnt);
		value.rs = Math.round(value.rs / value.pcnt);
		value.dom = Math.round(value.dom / value.pcnt);
		value.ld = Math.round(value.ld / value.pcnt);
	}
	return value;
};

exports.minmap = minmap;
exports.hourmap = hourmap;
exports.daymap = daymap;
exports.reduce = reduce;
exports.finalize = finalize;