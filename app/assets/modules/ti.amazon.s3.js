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
 * Date library
 *
*/

var JSDate = function() {
  return {
    MONTH_NAMES: new Array(
  		'January',
  		'February',
  		'March',
  		'April',
  		'May',
  		'June',
  		'July',
  		'August',
  		'September',
  		'October',
  		'November',
  		'December',
  		'Jan','Feb',
  		'Mar',
  		'Apr',
  		'May',
  		'Jun',
  		'Jul',
  		'Aug',
  		'Sep',
  		'Oct',
  		'Nov',
  		'Dec'
  	),

  	DAY_NAMES: new Array(
  		'Sunday',
  		'Monday',
  		'Tuesday',
  		'Wednesday',
  		'Thursday',
  		'Friday',
  		'Saturday',
  		'Sun',
  		'Mon',
  		'Tue',
  		'Wed',
  		'Thu',
  		'Fri',
  		'Sat'
  	),

  	LZ: function(x) {return(x<0||x>9?"":"0")+x;},

  	/* 
  	 * isDate ( date_string, format_string )
  	 * Returns true if date string matches format of format string and
  	 * is a valid date. Else returns false.
  	 * It is recommended that you trim whitespace around the value before
  	 * passing it to this function, as whitespace is NOT ignored!
  	*/
  	isDate: function(val,format) {
  		var date=this.getDateFromFormat(val,format);
  		if (date==0) { return false; }
  		return true;
  	},

  	/* 
  	 * compareDates(date1,date1format,date2,date2format)
  	 *   Compare two date strings to see which is greater.
  	 *   Returns:
  	 *   1 if date1 is greater than date2
  	 *   0 if date2 is greater than date1 of if they are the same
  	 *  -1 if either of the dates is in an invalid format
  	*/
  	compareDates: function(date1,dateformat1,date2,dateformat2) {
  		var d1=this.getDateFromFormat(date1,dateformat1);
  		var d2=this.getDateFromFormat(date2,dateformat2);
  		if (d1==0 || d2==0) {
  			return -1;
  			}
  		else if (d1 > d2) {
  			return 1;
  			}
  		return 0;
  	},

  	/* 
  	 * formatDate (date_object, format)
  	 * Returns a date in the output format specified.
  	 * The format string uses the same abbreviations as in getDateFromFormat()
  	*/
  	formatDate: function(date,format) {
  		format=format+"";
  		var result="";
  		var i_format=0;
  		var c="";
  		var token="";
  		var y=date.getYear()+"";
  		var M=date.getMonth()+1;
  		var d=date.getDate();
  		var E=date.getDay();
  		var H=date.getHours();
  		var m=date.getMinutes();
  		var s=date.getSeconds();
  		var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
  		// Convert real date parts into formatted versions
  		var value=new Object();
  		if (y.length < 4) {y=""+(y-0+1900);}
  		value["y"]=""+y;
  		value["yyyy"]=y;
  		value["yy"]=y.substring(2,4);
  		value["M"]=M;
  		value["MM"]=this.LZ(M);
  		value["MMM"]=this.MONTH_NAMES[M-1];
  		value["NNN"]=this.MONTH_NAMES[M+11];
  		value["d"]=d;
  		value["dd"]=this.LZ(d);
  		value["E"]=this.DAY_NAMES[E+7];
  		value["EE"]=this.DAY_NAMES[E];
  		value["H"]=H;
  		value["HH"]=this.LZ(H);
  		if (H==0){value["h"]=12;}
  		else if (H>12){value["h"]=H-12;}
  		else {value["h"]=H;}
  		value["hh"]=this.LZ(value["h"]);
  		if (H>11){value["K"]=H-12;} else {value["K"]=H;}
  		value["k"]=H+1;
  		value["KK"]=this.LZ(value["K"]);
  		value["kk"]=this.LZ(value["k"]);
  		if (H > 11) { value["a"]="PM"; }
  		else { value["a"]="AM"; }
  		value["m"]=m;
  		value["mm"]=this.LZ(m);
  		value["s"]=s;
  		value["ss"]=this.LZ(s);
  		while (i_format < format.length) {
  			c=format.charAt(i_format);
  			token="";
  			while ((format.charAt(i_format)==c) && (i_format < format.length)) {
  				token += format.charAt(i_format++);
  				}
  			if (value[token] != null) { result=result + value[token]; }
  			else { result=result + token; }
  			}
  		return result;
  	},

  	/* 
  	 * Utility functions for parsing in getDateFromFormat()
  	*/
  	_isInteger: function(val) {
  		var digits="1234567890";
  		for (var i=0; i < val.length; i++) {
  			if (digits.indexOf(val.charAt(i))==-1) { return false; }
  			}
  		return true;
  	},

  	_getInt: function(str,i,minlength,maxlength) {
  		for (var x=maxlength; x>=minlength; x--) {
  			var token=str.substring(i,i+x);
  			if (token.length < minlength) { return null; }
  			if (this._isInteger(token)) { return token; }
  			}
  		return null;
  	},

  	/* 
  	 * getDateFromFormat( date_string , format_string )
  	 *
  	 * This function takes a date string and a format string. It matches
  	 * If the date string matches the format string, it returns the 
  	 * getTime() of the date. If it does not match, it returns 0.
  	*/
  	getDateFromFormat: function(val,format) {
  		val=val+"";
  		format=format+"";
  		var i_val=0;
  		var i_format=0;
  		var c="";
  		var token="";
  		var token2="";
  		var x,y;
  		var now=new Date();
  		var year=now.getYear();
  		var month=now.getMonth()+1;
  		var date=1;
  		var hh=now.getHours();
  		var mm=now.getMinutes();
  		var ss=now.getSeconds();
  		var ampm="";

  		while (i_format < format.length) {
  			// Get next token from format string
  			c=format.charAt(i_format);
  			token="";
  			while ((format.charAt(i_format)==c) && (i_format < format.length)) {
  				token += format.charAt(i_format++);
  				}
  			// Extract contents of value based on format token
  			if (token=="yyyy" || token=="yy" || token=="y") {
  				if (token=="yyyy") { x=4;y=4; }
  				if (token=="yy")   { x=2;y=2; }
  				if (token=="y")    { x=2;y=4; }
  				year=_getInt(val,i_val,x,y);
  				if (year==null) { return 0; }
  				i_val += year.length;
  				if (year.length==2) {
  					if (year > 70) { year=1900+(year-0); }
  					else { year=2000+(year-0); }
  					}
  				}
  			else if (token=="MMM"||token=="NNN"){
  				month=0;
  				for (var i=0; i<this.MONTH_NAMES.length; i++) {
  					var month_name=this.MONTH_NAMES[i];
  					if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
  						if (token=="MMM"||(token=="NNN"&&i>11)) {
  							month=i+1;
  							if (month>12) { month -= 12; }
  							i_val += month_name.length;
  							break;
  							}
  						}
  					}
  				if ((month < 1)||(month>12)){return 0;}
  				}
  			else if (token=="EE"||token=="E"){
  				for (var i=0; i<this.DAY_NAMES.length; i++) {
  					var day_name=this.DAY_NAMES[i];
  					if (val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()) {
  						i_val += day_name.length;
  						break;
  						}
  					}
  				}
  			else if (token=="MM"||token=="M") {
  				month=this._getInt(val,i_val,token.length,2);
  				if(month==null||(month<1)||(month>12)){return 0;}
  				i_val+=month.length;}
  			else if (token=="dd"||token=="d") {
  				date=this._getInt(val,i_val,token.length,2);
  				if(date==null||(date<1)||(date>31)){return 0;}
  				i_val+=date.length;}
  			else if (token=="hh"||token=="h") {
  				hh=this._getInt(val,i_val,token.length,2);
  				if(hh==null||(hh<1)||(hh>12)){return 0;}
  				i_val+=hh.length;}
  			else if (token=="HH"||token=="H") {
  				hh=this._getInt(val,i_val,token.length,2);
  				if(hh==null||(hh<0)||(hh>23)){return 0;}
  				i_val+=hh.length;}
  			else if (token=="KK"||token=="K") {
  				hh=this._getInt(val,i_val,token.length,2);
  				if(hh==null||(hh<0)||(hh>11)){return 0;}
  				i_val+=hh.length;}
  			else if (token=="kk"||token=="k") {
  				hh=this._getInt(val,i_val,token.length,2);
  				if(hh==null||(hh<1)||(hh>24)){return 0;}
  				i_val+=hh.length;hh--;}
  			else if (token=="mm"||token=="m") {
  				mm=this._getInt(val,i_val,token.length,2);
  				if(mm==null||(mm<0)||(mm>59)){return 0;}
  				i_val+=mm.length;}
  			else if (token=="ss"||token=="s") {
  				ss=this._getInt(val,i_val,token.length,2);
  				if(ss==null||(ss<0)||(ss>59)){return 0;}
  				i_val+=ss.length;}
  			else if (token=="a") {
  				if (val.substring(i_val,i_val+2).toLowerCase()=="am") {ampm="AM";}
  				else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {ampm="PM";}
  				else {return 0;}
  				i_val+=2;}
  			else {
  				if (val.substring(i_val,i_val+token.length)!=token) {return 0;}
  				else {i_val+=token.length;}
  				}
  			}
  		// If there are any trailing characters left in the value, it doesn't match
  		if (i_val != val.length) { return 0; }
  		// Is date valid for month?
  		if (month==2) {
  			// Check for leap year
  			if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
  				if (date > 29){ return 0; }
  			}
  			else { if (date > 28) { return 0; } }
  			}
  		if ((month==4)||(month==6)||(month==9)||(month==11)) {
  			if (date > 30) { return 0; }
  			}
  		// Correct hours value
  		if (hh<12 && ampm=="PM") { hh=hh-0+12; }
  		else if (hh>11 && ampm=="AM") { hh-=12; }
  		var newdate=new Date(year,month-1,date,hh,mm,ss);
  		return newdate.getTime();
  	},

  	/*
  	 * parseDate( date_string [, prefer_euro_format] )
  	 *
  	 * This function takes a date string and tries to match it to a
  	 * number of possible date formats to get the value. It will try to
  	 * match against the following international formats, in this order:
  	 * y-M-d   MMM d, y   MMM d,y   y-MMM-d   d-MMM-y  MMM d
  	 * M/d/y   M-d-y      M.d.y     MMM-d     M/d      M-d
  	 * d/M/y   d-M-y      d.M.y     d-MMM     d/M      d-M
  	 * A second argument may be passed to instruct the method to search
  	 * for formats like d/M/y (european format) before M/d/y (American).
  	 * Returns a Date object or null if no patterns match.
  	*/
  	parseDate: function(val) {
  		var preferEuro=(arguments.length==2)?arguments[1]:false;
  		generalFormats=new Array('y-M-d','MMM d, y','MMM d,y','y-MMM-d','d-MMM-y','MMM d');
  		monthFirst=new Array('M/d/y','M-d-y','M.d.y','MMM-d','M/d','M-d');
  		dateFirst =new Array('d/M/y','d-M-y','d.M.y','d-MMM','d/M','d-M');
  		var checkList=new Array('generalFormats',preferEuro?'dateFirst':'monthFirst',preferEuro?'monthFirst':'dateFirst');
  		var d=null;
  		for (var i=0; i<checkList.length; i++) {
  			var l=window[checkList[i]];
  			for (var j=0; j<l.length; j++) {
  				d=this.getDateFromFormat(val,l[j]);
  				if (d!=0) { return new Date(d); }
  				}
  			}
  		return null;
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
    timeout:Module.timeout,
    cache: false,
    onreadystatechange: function() {
      if (this.status == 400){
        this.abort();
      }
    }
  });
  
  /*
   * Import SHA
   */
  this.SHA = new SHA();
  this.Utf8 = new UTF8();
  this.Date = new JSDate();
  
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
		
	if (_args.key) { Module.APIKey = _args.key; }
	if (_args.secret) { Module.SecretKey = _args.secret; }
	if (_args.bucket) { Module.AWSBucketName = _args.bucket; }
	if (_args.fileName) { Module.fileName = _args.fileName; }
	if (_args.timeout) { Module.timeout = _args.timeout; }
	if (_args.debug) { Module.debug = _args.debug; }
		
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
		
		this.fileURL = 'https://s3.amazonaws.com/'+Module.AWSBucketName+'/' + Module.fileName;
		
		this.log('File: '+this.fileURL);
		
		this.http.open('PUT', this.fileURL, true);
		
		var curDate = this.Date.formatDate(new Date(),'E, d MMM dd yyyy HH:mm:ss') + this.GSM;
		var StringToSign = 'PUT\n\n\n'+fileContents.mimeType+'\n' + curDate + '\n/'+this.AWSBucketName+'/' + this.fileName;
		
		var AWSAccessKeyID = 'AWS ' + this.APIKey + ':';
		var AWSSignature = this.SHA.b64_hmac_sha1(this.SecretKey, this.Utf8.encode(StringToSign));
		var AWSAuthHeader = AWSAccessKeyID.concat(AWSSignature);
		
		this.http.setRequestHeader('Authorization', Ti.Utils.base64encode(AWSAuthHeader).toString()); 
		this.http.setRequestHeader('Content-Type', fileContents.mimeType);
		this.http.setRequestHeader('Content-Length', uploadFile.size);
		this.http.setRequestHeader('Host', 's3.amazonaws.com');
		this.http.setRequestHeader('Date', curDate);
		this.http.setRequestHeader('Accept-Encoding', 'gzip');
		this.http.setRequestHeader('Proxy-Connection','close');
		this.http.setRequestHeader('User-Agent','Appcelerator Titanium/1.8.1.v20120126144634 (iPhone/5.0.1; iPhone OS; en_US;');
		
		this.http.send(fileContents);
};



module.exports = new Module();