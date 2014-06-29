//tt=total time, rd=redirector time, dns=dns lookup time, con=tpc connection time, rq=first byte time, st=server time, rs= download time,
//dom=dom time, ld=load time, cnt= request count, sn=server name, cpu=server cpu, dsk= disk io, net=server network, asc=apdex setisfied count, atc= apdex tolerating count

function minmap() {
	var ts = this.ts;
	var apdexSatisfiedThreshold = 3000;
	var apdexToleratingThreshold = 4*apdexSatisfiedThreshold;
	
	ts.setMilliseconds(0);
	ts.setSeconds(0);
	
	var asc = 0;
	var atc = 0;
	if (this.tt <= apdexSatisfiedThreshold) {
		asc = 1;
	} else if (this.tt <= apdexToleratingThreshold) {
		atc = 1;
	}
	
	var value = {
		cnt: 1,
		tt: this.tt,
		rd: this.rd,
		dns: this.dns,
		con: this.con,
		rq: this.rq,
		st: this.st,
		rs: this.rs,
		dom: this.dom,
		ld: this.ld,
		asc: asc,
		atc: atc
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
		tt : this.value.tt,
		rd : this.value.rd,
		dns : this.value.dns,
		con : this.value.con,
		rq : this.value.rq,
		st : this.value.st,
		rs : this.value.rs,
		dom : this.value.dom,
		ld : this.value.ld,
		asc: this.value.asc,
		atc: this.value.atc
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
		tt : this.value.tt,
		rd : this.value.rd,
		dns : this.value.dns,
		con : this.value.con,
		rq : this.value.rq,
		st : this.value.st,
		rs : this.value.rs,
		dom : this.value.dom,
		ld : this.value.ld,
		asc: this.value.asc,
		atc: this.value.atc
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
	var tt = 0;
	var rd = 0;
	var dns = 0;
	var con = 0;
	var rq = 0;
	var st = 0;
	var rs = 0;
	var dom = 0;
	var ld = 0;
	var asc = 0;
	var atc = 0;
	
	values.forEach(function(value) {
		cnt += value.cnt;
		tt += value.cnt*value.tt;
		rd += value.cnt*value.rd;
		dns += value.cnt*value.dns;
		con += value.cnt*value.con;
		rq += value.cnt*value.rq;
		st += value.cnt*value.st;
		rs += value.cnt*value.rs;
		dom += value.cnt*value.dom;
		ld += value.cnt*value.ld;
		asc += value.asc;
		atc += value.atc;
	});
	return {
		cnt: cnt,
		tt: tt,
		rd: rd,
		dns: dns,
		con: con,
		rq: rq,
		st: st,
		rs: rs,
		dom: dom,
		ld: ld,
		asc: asc,
		atc: atc
	};
};

function finalize(key, value) {
	value.tt = Math.round(value.tt / value.cnt);
	value.rd = Math.round(value.rd / value.cnt);
	value.dns = Math.round(value.dns / value.cnt);
	value.con = Math.round(value.con / value.cnt);
	value.rq = Math.round(value.rq / value.cnt);
	value.st = Math.round(value.st / value.cnt);
	value.rs = Math.round(value.rs / value.cnt);
	value.dom = Math.round(value.dom / value.cnt);
	value.ld = Math.round(value.ld / value.cnt);
	return value;
};

exports.minmap = minmap;
exports.hourmap = hourmap;
exports.daymap = daymap;
exports.reduce = reduce;
exports.finalize = finalize;