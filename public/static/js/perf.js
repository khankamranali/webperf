

window.onload=function(){

	var CONF = {app:"WebPerf", host:"tap-localhost", protocol:window.location.protocol, httpsport:"3443", httpport:"3000"};
	
	addXMLRequestHook();
	
	function PT(pg) {
		this.t = {app:CONF.app, pg:pg, tt:0, rd:0, dns:0, con:0, rq:0, rs:0, dom:0, ld:0 };	
	};
	
	setTimeout(function(){
		//pathname without query string
		var pt = new PT(window.location.pathname.split('?')[0]);
		
		if (window.performance) {
			var t = performance.timing;
			pt.t.tt =  t.loadEventEnd - t.navigationStart;
			pt.t.rd = t.redirectEnd - t.redirectStart;
			pt.t.dns = t.domainLookupEnd - t.domainLookupStart;
			pt.t.con = t.connectEnd - t.connectStart;
			pt.t.rq = t.responseStart - t.requestStart;
			pt.t.rs = t.responseEnd - t.responseStart;
			pt.t.dom  = t.loadEventStart - t.responseEnd;
			pt.t.ld  = t.loadEventEnd - t.loadEventStart;
		}
		
		var url = createBeckonUrl(pt.t);
		var xhr = createBeckonCORSRequest("GET", url);
		xhr.send(null);
	}, 0);
	
	function createBeckonCORSRequest(method, url) {
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
		  xhr.isBeckon = true;
		  return xhr;
	};
	
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
		  +"&ld="+pt.ld;
		return url;
	}
	
	function addXMLRequestHook() {
		
		oldSend = XMLHttpRequest.prototype.send;
		oldOpen = XMLHttpRequest.prototype.open;
		
	    // override the native send()
	    XMLHttpRequest.prototype.send = function() {
	        oldSend.apply(this, arguments);
	        this.addEventListener('readystatechange', readyStateChangeListener(), false);
	    };
	    
	    // override the native open()
	    XMLHttpRequest.prototype.open = function() {
			//remove query string from url
	    	this.requestUrl=arguments[1].split('?')[0];
	        oldOpen.apply(this, arguments);
	        
	    };
	    
	    function readyStateChangeListener() {
	    	this.startTime = now();
	    	
	    	function listen(progress) {
	    		//ignore Beckon request
	    		if (progress.target.isBeckon) {
	    			return;
	    		}
	    		
	    		if(progress.target.readyState==4) {
	    			var pt = new PT(progress.target.requestUrl);
	    			pt.t.tt = Math.round(now()-startTime);
	    			
	    			var url = createBeckonUrl(pt.t);
	    			var xhr = createBeckonCORSRequest("GET", url);
	    			xhr.send(null);
	    		}
	    	};
	    	return listen;
	    };
	};
	
	function now() {
		return 	performance.now() || 
				performance.mozNow() || 
				performance.msNow() || 
				performance.oNow() || 
				performance.webkitNow() || 
				Date.now(); /*none found - fallback to browser default */
	};
};