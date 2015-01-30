/*
 * A Titanium Mobile commonJS module for interacting with Amazon S3
 * 
 * Obtain S3 credentials here:
 * https://aws-portal.amazon.com/gp/aws/developer/account/index.html?action=access-key
 *
 * Author: Terry Martin
 * Copyright: Semantic Press, Inc.
 *
 * Libraries used:
 * - Date.js: http://www.mattkruse.com
 * - sha-aws.js: http://aws.amazon.com/code/Amazon-S3/3236824658053653
 * - UTF8.js: http://www.webtoolkit.info/javascript-utf8.html
 *
 */


/*
 *
 * sha-aws.js
 *
*/
 
var SHA = function SHA() {

 /*
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	this.hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
	this.b64pad = "=";  /* base-64 pad character. "=" for strict RFC compliance   */
	this.chrsz = 8;     /* bits per input character. 8 - ASCII; 16 - Unicode      */

	/*
	 * These are the functions you'll usually want to call
	 * They take string arguments and return either hex or base-64 encoded strings
	 */
	this.hex_sha1 = function(s){
		return this.binb2hex(this.core_sha1(this.str2binb(s),s.length * this.chrsz));
	};

	this.b64_sha1 = function(s){
		return this.binb2b64(this.core_sha1(this.str2binb(s),s.length * this.chrsz));
	};
	this.str_sha1 = function(s){
		return this.binb2str(this.core_sha1(this.str2binb(s),s.length * this.chrsz));
	};
	this.hex_hmac_sha1 = function(key, data){ 
		return this.binb2hex(this.core_hmac_sha1(key, data));
	};
	this.b64_hmac_sha1 = function(key, data){ 
		return this.binb2b64(this.core_hmac_sha1(key, data));
	};
	this.str_hmac_sha1 = function(key, data){ 
		return this.binb2str(this.core_hmac_sha1(key, data));
	};

	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	this.sha1_vm_test = function() {
	  return this.hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
	};

	/*
	 * Calculate the SHA-1 of an array of big-endian words, and a bit length
	 */
	this.core_sha1 = function(x, len) {
	  /* append padding */
	  x[len >> 5] |= 0x80 << (24 - len % 32);
	  x[((len + 64 >> 9) << 4) + 15] = len;

	  var w = Array(80);
	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;
	  var e = -1009589776;

	  for(var i = 0; i < x.length; i += 16) {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;
	    var olde = e;

	    for(var j = 0; j < 80; j++) {
	      if(j < 16) w[j] = x[i + j];
	      else w[j] = this.rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
	      var t = this.safe_add(this.safe_add(this.rol(a, 5), this.sha1_ft(j, b, c, d)),
	              this.safe_add(this.safe_add(e, w[j]), this.sha1_kt(j)));
	      e = d;
	      d = c;
	      c = this.rol(b, 30);
	      b = a;
	      a = t;
	    }

	    a = this.safe_add(a, olda);
	    b = this.safe_add(b, oldb);
	    c = this.safe_add(c, oldc);
	    d = this.safe_add(d, oldd);
	    e = this.safe_add(e, olde);
	  }
	  return Array(a, b, c, d, e);
	};

	/*
	 * Perform the appropriate triplet combination function for the current
	 * iteration
	 */
	this.sha1_ft = function(t, b, c, d) {
	  if(t < 20) return (b & c) | ((~b) & d);
	  if(t < 40) return b ^ c ^ d;
	  if(t < 60) return (b & c) | (b & d) | (c & d);
	  return b ^ c ^ d;
	};

	/*
	 * Determine the appropriate additive constant for the current iteration
	 */
	this.sha1_kt = function(t) {
	  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	         (t < 60) ? -1894007588 : -899497514;
	};

	/*
	 * Calculate the HMAC-SHA1 of a key and some data
	 */
	this.core_hmac_sha1 = function(key, data) {
	  var bkey = this.str2binb(key);
	  if(bkey.length > 16) bkey = this.core_sha1(bkey, key.length * this.chrsz);

	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++) {
	    ipad[i] = bkey[i] ^ 0x36363636;
	    opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }

	  var hash = this.core_sha1(ipad.concat(this.str2binb(data)), 512 + data.length * this.chrsz);
	  return this.core_sha1(opad.concat(hash), 512 + 160);
	};

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	this.safe_add = function(x, y) {
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	};

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	this.rol = function(num, cnt) {
	  return (num << cnt) | (num >>> (32 - cnt));
	};

	/*
	 * Convert an 8-bit or 16-bit string to an array of big-endian words
	 * In 8-bit function, characters >255 have their hi-byte silently ignored.
	 */
	this.str2binb = function(str) {
	  var bin = Array();
	  var mask = (1 << this.chrsz) - 1;
	  for(var i = 0; i < str.length * this.chrsz; i += this.chrsz)
	    bin[i>>5] |= (str.charCodeAt(i / this.chrsz) & mask) << (32 - this.chrsz - i%32);
	  return bin;
	};

	/*
	 * Convert an array of big-endian words to a string
	 */
	this.binb2str = function(bin) {
	  var str = "";
	  var mask = (1 << this.chrsz) - 1;
	  for(var i = 0; i < bin.length * 32; i += this.chrsz)
	    str += String.fromCharCode((bin[i>>5] >>> (32 - this.chrsz - i%32)) & mask);
	  return str;
	};

	/*
	 * Convert an array of big-endian words to a hex string.
	 */
	this.binb2hex = function(binarray) {
	  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i++) {
	    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
	           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
	  }
	  return str;
	};

	/*
	 * Convert an array of big-endian words to a base-64 string
	 */
	this.binb2b64 = function(binarray) {
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i += 3) {
	    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
	                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
	                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
	    for(var j = 0; j < 4; j++) {
	      if(i * 8 + j * 6 > binarray.length * 32) str += this.b64pad;
	      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
	    }
	  }
	  return str;
	};

};


/*
 *
 * UTF8.js
 *
*/
var UTF8 = function() {
  return {
    // public method for url encoding
  	encode : function (string) {
  		string = string.replace(/\r\n/g,"\n");
  		var utftext = "";

  		for (var n = 0; n < string.length; n++) {

  			var c = string.charCodeAt(n);

  			if (c < 128) {
  				utftext += String.fromCharCode(c);
  			}
  			else if((c > 127) && (c < 2048)) {
  				utftext += String.fromCharCode((c >> 6) | 192);
  				utftext += String.fromCharCode((c & 63) | 128);
  			}
  			else {
  				utftext += String.fromCharCode((c >> 12) | 224);
  				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
  				utftext += String.fromCharCode((c & 63) | 128);
  			}

  		}

  		return utftext;
  	},

  	// public method for url decoding
  	decode : function (utftext) {
  		var string = "";
  		var i = 0;
  		var c = c1 = c2 = 0;

  		while ( i < utftext.length ) {

  			c = utftext.charCodeAt(i);

  			if (c < 128) {
  				string += String.fromCharCode(c);
  				i++;
  			}
  			else if((c > 191) && (c < 224)) {
  				c2 = utftext.charCodeAt(i+1);
  				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
  				i += 2;
  			}
  			else {
  				c2 = utftext.charCodeAt(i+1);
  				c3 = utftext.charCodeAt(i+2);
  				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
  				i += 3;
  			}

  		}

  		return string;
  	}
  };
};


/*
 *
 * Module Class
 *
*/

var Module = function() {
  this.APIKey = false;
  this.SecretKey = false;
  this.AWSBucketName = false;
  this.GSM = ' -0700';
  this.fileName = false;
  this.timeout = 99000;
  this.debug = false;
	
  this.http = Ti.Network.createHTTPClient({
    timeout: 99000,
    cache: false,
    onreadystatechange: function() {
      Ti.API.info(this.status);
      if (this.status == 400){
        this.abort();
      }
    },
    onerror: function() {
        Ti.API.error(this.status);
    }
  });
  
  /*
   * Import SHA
   */
  this.SHA = new SHA();
  this.Utf8 = new UTF8();
  
  this.abort = function() {
    if (typeof this.http.abort == 'function') {
      this.log('Aborting HTTP client');
      this.http.abort();
    } else {
      this.log('Nothing to abort.');
    }
  };
  
  this.log = function(str) {
 
  	if (Module.debug) {
  		Ti.API.info(str);
  	}
  };
  
};

Module.prototype.PUT = function(_args) {

	this.fileName = _args.fileName;
	var uploadDir = _args.uploadDir;
	var region = _args.region;
		
	if (_args.key) { Module.APIKey = _args.key; }
	if (_args.secret) { Module.SecretKey = _args.secret; }
	if (_args.bucket) { Module.AWSBucketName = _args.bucket; }
	if (_args.fileName) { Module.fileName = _args.fileName; }
	if (_args.timeout) { Module.timeout = _args.timeout; }
	if (_args.debug) { Module.debug = _args.debug; }
	if (_args.GSM) { Module.GSM = _args.GSM; }
		
	/*
  	 * Create HTTP Object
  	 */
  	 this.http.setTimeout(Module.timeout);
     
     if (Ti.Platform.osname == 'android') {
        this.http.onload = _args.success;  
        this.http.onsendstream = _args.onsendstream;
        this.http.ondatastream = _args.ondatastream;
        this.http.onerror = _args.error;       
     } else {
        this.http.setOnsendstream(_args.onsendstream);
        this.http.setOndatastream(_args.ondatastream);
        this.http.setOnload(_args.success);
        this.http.setOnerror(_args.error);
     }
		
	/*
  	 * Get File Object
  	 */
		var uploadFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, _args.fileName);
		var fileContents = uploadFile.read();
				
		if (!uploadFile.exists()){
		   alert('File not found. Please check that ' + Module.fileName + ' exists in your Data directory.');
		   return;
		}
		
		this.fileURL = 'https://s3-' + region + '.amazonaws.com' + Module.AWSBucketName + uploadDir + Module.fileName;
		
		this.log('File: '+this.fileURL);
		
		this.http.open('PUT', this.fileURL, true);
		
		var Moment = require('alloy/moment');
		var curDate = Moment().format('ddd, D MMMM YYYY HH:mm:ss') + Module.GSM;
		var StringToSign = ''+'PUT\n\n'+''+fileContents.mimeType+'\n' + '' + curDate + '\n/'+''+Module.AWSBucketName + uploadDir + Module.fileName;

		var AWSAccessKeyID = 'AWS ' + Module.APIKey + ':';
		var AWSSignature = this.SHA.b64_hmac_sha1(Module.SecretKey, this.Utf8.encode(StringToSign));
		var AWSAuthHeader = AWSAccessKeyID.concat(AWSSignature);
		
		this.http.setRequestHeader('Authorization', AWSAuthHeader); 
		if (OS_IOS) {
			this.http.setRequestHeader('Content-Length', uploadFile.size);
		}
		this.http.setRequestHeader('Content-Type', fileContents.mimeType);
		this.http.setRequestHeader('Host', Module.AWSBucketName+'.s3.amazonaws.com');
		this.http.setRequestHeader('Date', curDate);
		this.http.setRequestHeader('Accept-Encoding', 'gzip');
		this.http.setRequestHeader('Proxy-Connection','close');
		this.http.setRequestHeader('User-Agent','Appcelerator Titanium/1.8.1.v20120126144634 (iPhone/5.0.1; iPhone OS; en_US;');

		this.http.send(fileContents);
};



module.exports = new Module();
