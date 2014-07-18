if (typeof window.addEventListener === "function" && window.performance) {
    window.addEventListener('load', function() {
        return setTimeout(function() {
            return wpa();
        }, 100);
    }, false);
}

var wpa = function() {
	//var CONF = {app:window.location.hostname, host:"localhost", protocol:window.location.protocol, httpsport:"3443", httpport:"3000"};
	var CONF = {app:window.location.hostname, host:"webperf-khankamranali.rhcloud.com", protocol:window.location.protocol, httpsport:"443", httpport:"80"};

	var PT = function(pg) {	return {app:CONF.app, pg:pg, tt:0, rd:0, dns:0, con:0, rq:0, rs:0, dom:0, ld:0, st:0, sn:'Unknown'}};
	
	//pathname without query string
	var pt = new PT(window.location.pathname.split('?')[0]);	
		
	//Set browser performance data
	var t = performance.timing;
	pt.tt =  t.loadEventEnd - t.navigationStart;
	pt.rd = t.redirectEnd - t.redirectStart;
	pt.dns = t.domainLookupEnd - t.domainLookupStart;
	pt.con = t.connectEnd - t.connectStart;
	pt.rq = t.responseStart - t.requestStart;
	pt.rs = t.responseEnd - t.responseStart;
	pt.dom  = t.loadEventStart - t.responseEnd;
	pt.ld  = t.loadEventEnd - t.loadEventStart;
	
	//Set server performance data
	var serverTime = readCookie('wpa-st');
	serverTime = serverTime ? serverTime : 0;
	var serverName = readCookie('wpa-sn');
	serverName = serverName ? serverName : 'Unknown';
	pt.st = serverTime;
	pt.sn = serverName;
	sendBeckonCORSRequest(pt);
		
	oXMLHttpRequest = window.XMLHttpRequest;
	window.XMLHttpRequest = function() {
		var req, oOpen, oSend, wpaStartTime, wpaFirstByteTime;
        req = new oXMLHttpRequest;
	
        try {
			oOpen = req.open;
			req.open = function(type, url, async) {
				try {
					//remove query string from url
					req.requestUrl=arguments[1].split('?')[0];
					req.addEventListener('readystatechange', readyStateChangeListener, false);
				} catch (e) {
					log.error("WPA error:", e);
				}
				return oOpen.apply(req, arguments);
			};
        
			oSend = req.send;
			req.send = function() {
				wpaStartTime = Date.now();
				return oSend.apply(req, arguments);
			};
		} catch (e) {
            log.error("WPA error:", e);
        }
			
		var readyStateChangeListener = function (progress) {
			try {
				//ignore Beckon request
				if (progress.target.isBeckon) {
					return;
				}
				if(progress.target.readyState==2) {
					wpaFirstByteTime = Date.now();
				} else if(progress.target.readyState==4) {
					//todo read wpa-st and wpa-sn cookie from XMLHttpRequest response and set it in pt.
					var c = req.getAllResponseHeaders();
					var pt = new PT(progress.target.requestUrl);
					var now = Date.now();
					pt.tt = Math.round(now - wpaStartTime);
					pt.rq = Math.round(wpaFirstByteTime - wpaStartTime);
					pt.rs = Math.round(now - wpaFirstByteTime);
					sendBeckonCORSRequest(pt);
				}
			} catch (e) {
				console.log(e);
			}
		};
			
        return req;
    };
		
	function sendBeckonCORSRequest(pt) {
		try {
			var method = 'GET';
			var url = createBeckonUrl(pt);
			var xhr = new XMLHttpRequest();
			if ("withCredentials" in xhr) {
				xhr.open(method, url, true);
			} else if (typeof XDomainRequest != "undefined") {
				xhr = new XDomainRequest();
				xhr.open(method, url);
			} else {
				return;
			}
			xhr.isBeckon = true;
			xhr.send(null);
		} catch (e) {
			console.log(e);
		}

		function createBeckonUrl(pt) {
			var port = CONF.protocol=="https:" ? CONF.httpsport :	CONF.httpport;
			var url = CONF.protocol+"//"+CONF.host+":"+port+"/tag/page?"
			  +"app="+pt.app
			  +"&pg="+pt.pg
			  +"&tt="+pt.tt
			  +"&rd="+pt.rd
			  +"&dns="+pt.dns
			  +"&con="+pt.con
			  +"&rq="+pt.rq
			  +"&rs="+pt.rs
			  +"&dom="+pt.dom
			  +"&ld="+pt.ld
			  +"&st="+pt.st
			  +"&sn="+pt.sn;
			return url;
		}
	};
	
	function readCookie(key) {
		var result;
		return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null;
	};
};