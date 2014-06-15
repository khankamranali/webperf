window.onload = function(){

	//var CONF = {app:window.location.hostname, host:"localhost", protocol:window.location.protocol, httpsport:"3443", httpport:"3000"};
	var CONF = {app:window.location.hostname, host:"webperf-khankamranali.rhcloud.com", protocol:window.location.protocol, httpsport:"443", httpport:"80"};

	addXMLRequestHook();
	
	var PT = function(pg)	{this.app=CONF.app; this.pg=pg; this.tt=0;
							this.rd=0; this.dns=0; this.con=0; this.rq=0;
							this.rs=0; this.dom=0; this.ld=0; this.st=0;
							this.sn='Unknown';
							};
	
	setTimeout(function(){
		//pathname without query string
		var pt = new PT(window.location.pathname.split('?')[0]);
		
		var serverTime = readCookie('wpa-st');
		serverTime = serverTime ? serverTime : 0;
		
		var serverName = readCookie('wpa-sn');
		serverName = serverName ? serverName : 'Unknown';
		
		if (window.performance) {
			var t = performance.timing;
			pt.tt =  t.loadEventEnd - t.navigationStart;
			pt.rd = t.redirectEnd - t.redirectStart;
			pt.dns = t.domainLookupEnd - t.domainLookupStart;
			pt.con = t.connectEnd - t.connectStart;
			pt.rq = t.responseStart - t.requestStart;
			pt.rs = t.responseEnd - t.responseStart;
			pt.dom  = t.loadEventStart - t.responseEnd;
			pt.ld  = t.loadEventEnd - t.loadEventStart;
			pt.st = serverTime;
			pt.sn = serverName;
		}
		sendBeckonCORSRequest(pt);
	}, 0);
	
	function readCookie(key) {
		var result;
		return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null;
	}
	
	function sendBeckonCORSRequest(pt) {
		try {
			var method = 'GET';
			var url = createBeckonUrl(pt);
			var xhr = new XMLHttpRequest();
			if ("withCredentials" in xhr) {
				// Check if the XMLHttpRequest object has a "withCredentials" property.
				// "withCredentials" only exists on XMLHTTPRequest2 objects.
				xhr.open(method, url, true);
			} else if (typeof XDomainRequest != "undefined") {
				// Otherwise, check if XDomainRequest.
				// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
				xhr = new XDomainRequest();
				xhr.open(method, url);
			} else {
				// Otherwise, CORS is not supported by the browser.
				xhr = null;
			}
			if (xhr!=null) {
				xhr.isBeckon = true;
				xhr.send(null);
			}
		} catch (err) {
			console.log(err);
		}

		function createBeckonUrl(pt) {
			var port;
			if (CONF.protocol=="https:") {
				port = CONF.httpsport;
			} else {
				port = CONF.httpport;
			}
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
	
	function addXMLRequestHook() {
		oldSend = XMLHttpRequest.prototype.send;
		oldOpen = XMLHttpRequest.prototype.open;
		
	    // override the native send()
	    XMLHttpRequest.prototype.send = function() {
			try {				
				this.addEventListener('readystatechange', readyStateChangeListener(), false);
			} catch (err) {
				console.log(err);
			}
			oldSend.apply(this, arguments);
	    };
	    
	    // override the native open()
	    XMLHttpRequest.prototype.open = function() {
			//remove query string from url
	    	this.requestUrl=arguments[1].split('?')[0];
	        oldOpen.apply(this, arguments);
	    };
	    
	    var readyStateChangeListener = function () {
	    	var startTime = Date.now();
	    	var listen = function (progress) {
				try {
					//ignore Beckon request
					if (progress.target.isBeckon) {
						return;
					}
					if(progress.target.readyState==4) {
						//todo read wpa-st and wpa-sn cookie from XMLHttpRequest response and set it in pt.
						var pt = new PT(progress.target.requestUrl);
						pt.tt = Math.round(Date.now()-startTime);	
						sendBeckonCORSRequest(pt);
					}
				} catch (err) {
					console.log(err);
				}
	    	};
	    	return listen;
	    };
	};
};