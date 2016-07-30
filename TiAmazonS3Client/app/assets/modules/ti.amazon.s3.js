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
 * Forge SHA
 *
 */
 (function(){

 var forge = {};
 var util = forge.util = forge.util || {};




 /* ==================================================== */
 /* ========== copy of forge/util-ByteStringBuffer.js == */
 /* ==================================================== */

 // define isArrayBuffer
 util.isArrayBuffer = function(x) {
   return typeof ArrayBuffer !== 'undefined' && x instanceof ArrayBuffer;
 };

 // define isArrayBufferView
 util.isArrayBufferView = function(x) {
   return x && util.isArrayBuffer(x.buffer) && x.byteLength !== undefined;
 };

 // TODO: set ByteBuffer to best available backing
 util.ByteBuffer = ByteStringBuffer;

 /** Buffer w/BinaryString backing */

 /**
  * Constructor for a binary string backed byte buffer.
  *
  * @param [b] the bytes to wrap (either encoded as string, one byte per
  *          character, or as an ArrayBuffer or Typed Array).
  */
 function ByteStringBuffer(b) {
   // TODO: update to match DataBuffer API

   // the data in this buffer
   this.data = '';
   // the pointer for reading from this buffer
   this.read = 0;

   if(typeof b === 'string') {
     this.data = b;
   } else if(util.isArrayBuffer(b) || util.isArrayBufferView(b)) {
     // convert native buffer to forge buffer
     // FIXME: support native buffers internally instead
     var arr = new Uint8Array(b);
     try {
       this.data = String.fromCharCode.apply(null, arr);
     } catch(e) {
       for(var i = 0; i < arr.length; ++i) {
         this.putByte(arr[i]);
       }
     }
   } else if(b instanceof ByteStringBuffer ||
     (typeof b === 'object' && typeof b.data === 'string' &&
     typeof b.read === 'number')) {
     // copy existing buffer
     this.data = b.data;
     this.read = b.read;
   }

   // used for v8 optimization
   this._constructedStringLength = 0;
 }
 util.ByteStringBuffer = ByteStringBuffer;

 /* Note: This is an optimization for V8-based browsers. When V8 concatenates
   a string, the strings are only joined logically using a "cons string" or
   "constructed/concatenated string". These containers keep references to one
   another and can result in very large memory usage. For example, if a 2MB
   string is constructed by concatenating 4 bytes together at a time, the
   memory usage will be ~44MB; so ~22x increase. The strings are only joined
   together when an operation requiring their joining takes place, such as
   substr(). This function is called when adding data to this buffer to ensure
   these types of strings are periodically joined to reduce the memory
   footprint. */
 var _MAX_CONSTRUCTED_STRING_LENGTH = 4096;
 util.ByteStringBuffer.prototype._optimizeConstructedString = function(x) {
   this._constructedStringLength += x;
   if(this._constructedStringLength > _MAX_CONSTRUCTED_STRING_LENGTH) {
     // this substr() should cause the constructed string to join
     this.data.substr(0, 1);
     this._constructedStringLength = 0;
   }
 };

 /**
  * Gets the number of bytes in this buffer.
  *
  * @return the number of bytes in this buffer.
  */
 util.ByteStringBuffer.prototype.length = function() {
   return this.data.length - this.read;
 };

 /**
  * Gets whether or not this buffer is empty.
  *
  * @return true if this buffer is empty, false if not.
  */
 util.ByteStringBuffer.prototype.isEmpty = function() {
   return this.length() <= 0;
 };

 /**
  * Puts a byte in this buffer.
  *
  * @param b the byte to put.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putByte = function(b) {
   return this.putBytes(String.fromCharCode(b));
 };

 /**
  * Puts a byte in this buffer N times.
  *
  * @param b the byte to put.
  * @param n the number of bytes of value b to put.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.fillWithByte = function(b, n) {
   b = String.fromCharCode(b);
   var d = this.data;
   while(n > 0) {
     if(n & 1) {
       d += b;
     }
     n >>>= 1;
     if(n > 0) {
       b += b;
     }
   }
   this.data = d;
   this._optimizeConstructedString(n);
   return this;
 };

 /**
  * Puts bytes in this buffer.
  *
  * @param bytes the bytes (as a UTF-8 encoded string) to put.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putBytes = function(bytes) {
   this.data += bytes;
   this._optimizeConstructedString(bytes.length);
   return this;
 };

 /**
  * Puts a UTF-16 encoded string into this buffer.
  *
  * @param str the string to put.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putString = function(str) {
   return this.putBytes(util.encodeUtf8(str));
 };

 /**
  * Puts a 16-bit integer in this buffer in big-endian order.
  *
  * @param i the 16-bit integer.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putInt16 = function(i) {
   return this.putBytes(
     String.fromCharCode(i >> 8 & 0xFF) +
     String.fromCharCode(i & 0xFF));
 };

 /**
  * Puts a 24-bit integer in this buffer in big-endian order.
  *
  * @param i the 24-bit integer.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putInt24 = function(i) {
   return this.putBytes(
     String.fromCharCode(i >> 16 & 0xFF) +
     String.fromCharCode(i >> 8 & 0xFF) +
     String.fromCharCode(i & 0xFF));
 };

 /**
  * Puts a 32-bit integer in this buffer in big-endian order.
  *
  * @param i the 32-bit integer.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putInt32 = function(i) {
   return this.putBytes(
     String.fromCharCode(i >> 24 & 0xFF) +
     String.fromCharCode(i >> 16 & 0xFF) +
     String.fromCharCode(i >> 8 & 0xFF) +
     String.fromCharCode(i & 0xFF));
 };

 /**
  * Puts a 16-bit integer in this buffer in little-endian order.
  *
  * @param i the 16-bit integer.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putInt16Le = function(i) {
   return this.putBytes(
     String.fromCharCode(i & 0xFF) +
     String.fromCharCode(i >> 8 & 0xFF));
 };

 /**
  * Puts a 24-bit integer in this buffer in little-endian order.
  *
  * @param i the 24-bit integer.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putInt24Le = function(i) {
   return this.putBytes(
     String.fromCharCode(i & 0xFF) +
     String.fromCharCode(i >> 8 & 0xFF) +
     String.fromCharCode(i >> 16 & 0xFF));
 };

 /**
  * Puts a 32-bit integer in this buffer in little-endian order.
  *
  * @param i the 32-bit integer.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putInt32Le = function(i) {
   return this.putBytes(
     String.fromCharCode(i & 0xFF) +
     String.fromCharCode(i >> 8 & 0xFF) +
     String.fromCharCode(i >> 16 & 0xFF) +
     String.fromCharCode(i >> 24 & 0xFF));
 };

 /**
  * Puts an n-bit integer in this buffer in big-endian order.
  *
  * @param i the n-bit integer.
  * @param n the number of bits in the integer.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putInt = function(i, n) {
   var bytes = '';
   do {
     n -= 8;
     bytes += String.fromCharCode((i >> n) & 0xFF);
   } while(n > 0);
   return this.putBytes(bytes);
 };

 /**
  * Puts a signed n-bit integer in this buffer in big-endian order. Two's
  * complement representation is used.
  *
  * @param i the n-bit integer.
  * @param n the number of bits in the integer.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putSignedInt = function(i, n) {
   if(i < 0) {
     i += 2 << (n - 1);
   }
   return this.putInt(i, n);
 };

 /**
  * Puts the given buffer into this buffer.
  *
  * @param buffer the buffer to put into this one.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.putBuffer = function(buffer) {
   return this.putBytes(buffer.getBytes());
 };

 /**
  * Gets a byte from this buffer and advances the read pointer by 1.
  *
  * @return the byte.
  */
 util.ByteStringBuffer.prototype.getByte = function() {
   return this.data.charCodeAt(this.read++);
 };

 /**
  * Gets a uint16 from this buffer in big-endian order and advances the read
  * pointer by 2.
  *
  * @return the uint16.
  */
 util.ByteStringBuffer.prototype.getInt16 = function() {
   var rval = (
     this.data.charCodeAt(this.read) << 8 ^
     this.data.charCodeAt(this.read + 1));
   this.read += 2;
   return rval;
 };

 /**
  * Gets a uint24 from this buffer in big-endian order and advances the read
  * pointer by 3.
  *
  * @return the uint24.
  */
 util.ByteStringBuffer.prototype.getInt24 = function() {
   var rval = (
     this.data.charCodeAt(this.read) << 16 ^
     this.data.charCodeAt(this.read + 1) << 8 ^
     this.data.charCodeAt(this.read + 2));
   this.read += 3;
   return rval;
 };

 /**
  * Gets a uint32 from this buffer in big-endian order and advances the read
  * pointer by 4.
  *
  * @return the word.
  */
 util.ByteStringBuffer.prototype.getInt32 = function() {
   var rval = (
     this.data.charCodeAt(this.read) << 24 ^
     this.data.charCodeAt(this.read + 1) << 16 ^
     this.data.charCodeAt(this.read + 2) << 8 ^
     this.data.charCodeAt(this.read + 3));
   this.read += 4;
   return rval;
 };

 /**
  * Gets a uint16 from this buffer in little-endian order and advances the read
  * pointer by 2.
  *
  * @return the uint16.
  */
 util.ByteStringBuffer.prototype.getInt16Le = function() {
   var rval = (
     this.data.charCodeAt(this.read) ^
     this.data.charCodeAt(this.read + 1) << 8);
   this.read += 2;
   return rval;
 };

 /**
  * Gets a uint24 from this buffer in little-endian order and advances the read
  * pointer by 3.
  *
  * @return the uint24.
  */
 util.ByteStringBuffer.prototype.getInt24Le = function() {
   var rval = (
     this.data.charCodeAt(this.read) ^
     this.data.charCodeAt(this.read + 1) << 8 ^
     this.data.charCodeAt(this.read + 2) << 16);
   this.read += 3;
   return rval;
 };

 /**
  * Gets a uint32 from this buffer in little-endian order and advances the read
  * pointer by 4.
  *
  * @return the word.
  */
 util.ByteStringBuffer.prototype.getInt32Le = function() {
   var rval = (
     this.data.charCodeAt(this.read) ^
     this.data.charCodeAt(this.read + 1) << 8 ^
     this.data.charCodeAt(this.read + 2) << 16 ^
     this.data.charCodeAt(this.read + 3) << 24);
   this.read += 4;
   return rval;
 };

 /**
  * Gets an n-bit integer from this buffer in big-endian order and advances the
  * read pointer by n/8.
  *
  * @param n the number of bits in the integer.
  *
  * @return the integer.
  */
 util.ByteStringBuffer.prototype.getInt = function(n) {
   var rval = 0;
   do {
     rval = (rval << 8) + this.data.charCodeAt(this.read++);
     n -= 8;
   } while(n > 0);
   return rval;
 };

 /**
  * Gets a signed n-bit integer from this buffer in big-endian order, using
  * two's complement, and advances the read pointer by n/8.
  *
  * @param n the number of bits in the integer.
  *
  * @return the integer.
  */
 util.ByteStringBuffer.prototype.getSignedInt = function(n) {
   var x = this.getInt(n);
   var max = 2 << (n - 2);
   if(x >= max) {
     x -= max << 1;
   }
   return x;
 };

 /**
  * Reads bytes out into a UTF-8 string and clears them from the buffer.
  *
  * @param count the number of bytes to read, undefined or null for all.
  *
  * @return a UTF-8 string of bytes.
  */
 util.ByteStringBuffer.prototype.getBytes = function(count) {
   var rval;
   if(count) {
     // read count bytes
     count = Math.min(this.length(), count);
     rval = this.data.slice(this.read, this.read + count);
     this.read += count;
   } else if(count === 0) {
     rval = '';
   } else {
     // read all bytes, optimize to only copy when needed
     rval = (this.read === 0) ? this.data : this.data.slice(this.read);
     this.clear();
   }
   return rval;
 };

 /**
  * Gets a UTF-8 encoded string of the bytes from this buffer without modifying
  * the read pointer.
  *
  * @param count the number of bytes to get, omit to get all.
  *
  * @return a string full of UTF-8 encoded characters.
  */
 util.ByteStringBuffer.prototype.bytes = function(count) {
   return (typeof(count) === 'undefined' ?
     this.data.slice(this.read) :
     this.data.slice(this.read, this.read + count));
 };

 /**
  * Gets a byte at the given index without modifying the read pointer.
  *
  * @param i the byte index.
  *
  * @return the byte.
  */
 util.ByteStringBuffer.prototype.at = function(i) {
   return this.data.charCodeAt(this.read + i);
 };

 /**
  * Puts a byte at the given index without modifying the read pointer.
  *
  * @param i the byte index.
  * @param b the byte to put.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.setAt = function(i, b) {
   this.data = this.data.substr(0, this.read + i) +
     String.fromCharCode(b) +
     this.data.substr(this.read + i + 1);
   return this;
 };

 /**
  * Gets the last byte without modifying the read pointer.
  *
  * @return the last byte.
  */
 util.ByteStringBuffer.prototype.last = function() {
   return this.data.charCodeAt(this.data.length - 1);
 };

 /**
  * Creates a copy of this buffer.
  *
  * @return the copy.
  */
 util.ByteStringBuffer.prototype.copy = function() {
   var c = util.createBuffer(this.data);
   c.read = this.read;
   return c;
 };

 /**
  * Compacts this buffer.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.compact = function() {
   if(this.read > 0) {
     this.data = this.data.slice(this.read);
     this.read = 0;
   }
   return this;
 };

 /**
  * Clears this buffer.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.clear = function() {
   this.data = '';
   this.read = 0;
   return this;
 };

 /**
  * Shortens this buffer by triming bytes off of the end of this buffer.
  *
  * @param count the number of bytes to trim off.
  *
  * @return this buffer.
  */
 util.ByteStringBuffer.prototype.truncate = function(count) {
   var len = Math.max(0, this.length() - count);
   this.data = this.data.substr(this.read, len);
   this.read = 0;
   return this;
 };

 /**
  * Converts this buffer to a hexadecimal string.
  *
  * @return a hexadecimal string.
  */
 util.ByteStringBuffer.prototype.toHex = function() {
   var rval = '';
   for(var i = this.read; i < this.data.length; ++i) {
     var b = this.data.charCodeAt(i);
     if(b < 16) {
       rval += '0';
     }
     rval += b.toString(16);
   }
   return rval;
 };

 /**
  * Converts this buffer to a UTF-16 string (standard JavaScript string).
  *
  * @return a UTF-16 string.
  */
 util.ByteStringBuffer.prototype.toString = function() {
   return util.decodeUtf8(this.bytes());
 };

 /** End Buffer w/BinaryString backing */


 /** Buffer w/UInt8Array backing */

 /**
  * FIXME: Experimental. Do not use yet.
  *
  * Constructor for an ArrayBuffer-backed byte buffer.
  *
  * The buffer may be constructed from a string, an ArrayBuffer, DataView, or a
  * TypedArray.
  *
  * If a string is given, its encoding should be provided as an option,
  * otherwise it will default to 'binary'. A 'binary' string is encoded such
  * that each character is one byte in length and size.
  *
  * If an ArrayBuffer, DataView, or TypedArray is given, it will be used
  * *directly* without any copying. Note that, if a write to the buffer requires
  * more space, the buffer will allocate a new backing ArrayBuffer to
  * accommodate. The starting read and write offsets for the buffer may be
  * given as options.
  *
  * @param [b] the initial bytes for this buffer.
  * @param options the options to use:
  *          [readOffset] the starting read offset to use (default: 0).
  *          [writeOffset] the starting write offset to use (default: the
  *            length of the first parameter).
  *          [growSize] the minimum amount, in bytes, to grow the buffer by to
  *            accommodate writes (default: 1024).
  *          [encoding] the encoding ('binary', 'utf8', 'utf16', 'hex') for the
  *            first parameter, if it is a string (default: 'binary').
  */
 /** End Buffer w/UInt8Array backing */




 /* ==================================================== */
 /* ========== copy of forge/util-rest.js ============== */
 /* ==================================================== */

 /**
  * Creates a buffer that stores bytes. A value may be given to put into the
  * buffer that is either a string of bytes or a UTF-16 string that will
  * be encoded using UTF-8 (to do the latter, specify 'utf8' as the encoding).
  *
  * @param [input] the bytes to wrap (as a string) or a UTF-16 string to encode
  *          as UTF-8.
  * @param [encoding] (default: 'raw', other: 'utf8').
  */
 util.createBuffer = function(input, encoding) {
   // TODO: deprecate, use new ByteBuffer() instead
   encoding = encoding || 'raw';
   if(input !== undefined && encoding === 'utf8') {
     input = util.encodeUtf8(input);
   }
   return new util.ByteBuffer(input);
 };

 /**
  * Fills a string with a particular value. If you want the string to be a byte
  * string, pass in String.fromCharCode(theByte).
  *
  * @param c the character to fill the string with, use String.fromCharCode
  *          to fill the string with a byte value.
  * @param n the number of characters of value c to fill with.
  *
  * @return the filled string.
  */
 util.fillString = function(c, n) {
   var s = '';
   while(n > 0) {
     if(n & 1) {
       s += c;
     }
     n >>>= 1;
     if(n > 0) {
       c += c;
     }
   }
   return s;
 };

 /**
  * UTF-8 encodes the given UTF-16 encoded string (a standard JavaScript
  * string). Non-ASCII characters will be encoded as multiple bytes according
  * to UTF-8.
  *
  * @param str the string to encode.
  *
  * @return the UTF-8 encoded string.
  */
 util.encodeUtf8 = function(str) {
   return unescape(encodeURIComponent(str));
 };

 /**
  * Decodes a UTF-8 encoded string into a UTF-16 string.
  *
  * @param str the string to decode.
  *
  * @return the UTF-16 encoded string (standard JavaScript string).
  */
 util.decodeUtf8 = function(str) {
   return decodeURIComponent(escape(str));
 };




 /* ==================================================== */
 /* ========== copy of forge/sha256.js ================= */
 /* ==================================================== */

 var sha256 = forge.sha256 = forge.sha256 || {};
 forge.md = forge.md || {};
 forge.md.algorithms = forge.md.algorithms || {};
 forge.md.sha256 = forge.md.algorithms.sha256 = sha256;

 /**
  * Creates a SHA-256 message digest object.
  *
  * @return a message digest object.
  */
 sha256.create = function() {
   // do initialization as necessary
   if(!_initialized) {
     _init();
   }

   // SHA-256 state contains eight 32-bit integers
   var _state = null;

   // input buffer
   var _input = forge.util.createBuffer();

   // used for word storage
   var _w = new Array(64);

   // message digest object
   var md = {
     algorithm: 'sha256',
     blockLength: 64,
     digestLength: 32,
     // 56-bit length of message so far (does not including padding)
     messageLength: 0,
     // true 64-bit message length as two 32-bit ints
     messageLength64: [0, 0]
   };

   /**
    * Starts the digest.
    *
    * @return this digest object.
    */
   md.start = function() {
     md.messageLength = 0;
     md.messageLength64 = [0, 0];
     _input = forge.util.createBuffer();
     _state = {
       h0: 0x6A09E667,
       h1: 0xBB67AE85,
       h2: 0x3C6EF372,
       h3: 0xA54FF53A,
       h4: 0x510E527F,
       h5: 0x9B05688C,
       h6: 0x1F83D9AB,
       h7: 0x5BE0CD19
     };
     return md;
   };
   // start digest automatically for first time
   md.start();

   /**
    * Updates the digest with the given message input. The given input can
    * treated as raw input (no encoding will be applied) or an encoding of
    * 'utf8' maybe given to encode the input using UTF-8.
    *
    * @param msg the message input to update with.
    * @param encoding the encoding to use (default: 'raw', other: 'utf8').
    *
    * @return this digest object.
    */
   md.update = function(msg, encoding) {
     if(encoding === 'utf8') {
       msg = forge.util.encodeUtf8(msg);
     }

     // update message length
     md.messageLength += msg.length;
     md.messageLength64[0] += (msg.length / 0x100000000) >>> 0;
     md.messageLength64[1] += msg.length >>> 0;

     // add bytes to input buffer
     _input.putBytes(msg);

     // process bytes
     _update(_state, _w, _input);

     // compact input buffer every 2K or if empty
     if(_input.read > 2048 || _input.length() === 0) {
       _input.compact();
     }

     return md;
   };

   /**
    * Produces the digest.
    *
    * @return a byte buffer containing the digest value.
    */
   md.digest = function() {
     /* Note: Here we copy the remaining bytes in the input buffer and
     add the appropriate SHA-256 padding. Then we do the final update
     on a copy of the state so that if the user wants to get
     intermediate digests they can do so. */

     /* Determine the number of bytes that must be added to the message
     to ensure its length is congruent to 448 mod 512. In other words,
     the data to be digested must be a multiple of 512 bits (or 128 bytes).
     This data includes the message, some padding, and the length of the
     message. Since the length of the message will be encoded as 8 bytes (64
     bits), that means that the last segment of the data must have 56 bytes
     (448 bits) of message and padding. Therefore, the length of the message
     plus the padding must be congruent to 448 mod 512 because
     512 - 128 = 448.

     In order to fill up the message length it must be filled with
     padding that begins with 1 bit followed by all 0 bits. Padding
     must *always* be present, so if the message length is already
     congruent to 448 mod 512, then 512 padding bits must be added. */

     // 512 bits == 64 bytes, 448 bits == 56 bytes, 64 bits = 8 bytes
     // _padding starts with 1 byte with first bit is set in it which
     // is byte value 128, then there may be up to 63 other pad bytes
     var padBytes = forge.util.createBuffer();
     padBytes.putBytes(_input.bytes());
     // 64 - (remaining msg + 8 bytes msg length) mod 64
     padBytes.putBytes(
       _padding.substr(0, 64 - ((md.messageLength64[1] + 8) & 0x3F)));

     /* Now append length of the message. The length is appended in bits
     as a 64-bit number in big-endian order. Since we store the length in
     bytes, we must multiply the 64-bit length by 8 (or left shift by 3). */
     padBytes.putInt32(
       (md.messageLength64[0] << 3) | (md.messageLength64[0] >>> 28));
     padBytes.putInt32(md.messageLength64[1] << 3);
     var s2 = {
       h0: _state.h0,
       h1: _state.h1,
       h2: _state.h2,
       h3: _state.h3,
       h4: _state.h4,
       h5: _state.h5,
       h6: _state.h6,
       h7: _state.h7
     };
     _update(s2, _w, padBytes);
     var rval = forge.util.createBuffer();
     rval.putInt32(s2.h0);
     rval.putInt32(s2.h1);
     rval.putInt32(s2.h2);
     rval.putInt32(s2.h3);
     rval.putInt32(s2.h4);
     rval.putInt32(s2.h5);
     rval.putInt32(s2.h6);
     rval.putInt32(s2.h7);
     return rval;
   };

   return md;
 };

 // sha-256 padding bytes not initialized yet
 var _padding = null;
 var _initialized = false;

 // table of constants
 var _k = null;

 /**
  * Initializes the constant tables.
  */
 function _init() {
   // create padding
   _padding = String.fromCharCode(128);
   _padding += forge.util.fillString(String.fromCharCode(0x00), 64);

   // create K table for SHA-256
   _k = [
     0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
     0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
     0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
     0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
     0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
     0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
     0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
     0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
     0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
     0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
     0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
     0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
     0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
     0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
     0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
     0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

   // now initialized
   _initialized = true;
 }

 /**
  * Updates a SHA-256 state with the given byte buffer.
  *
  * @param s the SHA-256 state to update.
  * @param w the array to use to store words.
  * @param bytes the byte buffer to update with.
  */
 function _update(s, w, bytes) {
   // consume 512 bit (64 byte) chunks
   var t1, t2, s0, s1, ch, maj, i, a, b, c, d, e, f, g, h;
   var len = bytes.length();
   while(len >= 64) {
     // the w array will be populated with sixteen 32-bit big-endian words
     // and then extended into 64 32-bit words according to SHA-256
     for(i = 0; i < 16; ++i) {
       w[i] = bytes.getInt32();
     }
     for(; i < 64; ++i) {
       // XOR word 2 words ago rot right 17, rot right 19, shft right 10
       t1 = w[i - 2];
       t1 =
         ((t1 >>> 17) | (t1 << 15)) ^
         ((t1 >>> 19) | (t1 << 13)) ^
         (t1 >>> 10);
       // XOR word 15 words ago rot right 7, rot right 18, shft right 3
       t2 = w[i - 15];
       t2 =
         ((t2 >>> 7) | (t2 << 25)) ^
         ((t2 >>> 18) | (t2 << 14)) ^
         (t2 >>> 3);
       // sum(t1, word 7 ago, t2, word 16 ago) modulo 2^32
       w[i] = (t1 + w[i - 7] + t2 + w[i - 16]) | 0;
     }

     // initialize hash value for this chunk
     a = s.h0;
     b = s.h1;
     c = s.h2;
     d = s.h3;
     e = s.h4;
     f = s.h5;
     g = s.h6;
     h = s.h7;

     // round function
     for(i = 0; i < 64; ++i) {
       // Sum1(e)
       s1 =
         ((e >>> 6) | (e << 26)) ^
         ((e >>> 11) | (e << 21)) ^
         ((e >>> 25) | (e << 7));
       // Ch(e, f, g) (optimized the same way as SHA-1)
       ch = g ^ (e & (f ^ g));
       // Sum0(a)
       s0 =
         ((a >>> 2) | (a << 30)) ^
         ((a >>> 13) | (a << 19)) ^
         ((a >>> 22) | (a << 10));
       // Maj(a, b, c) (optimized the same way as SHA-1)
       maj = (a & b) | (c & (a ^ b));

       // main algorithm
       t1 = h + s1 + ch + _k[i] + w[i];
       t2 = s0 + maj;
       h = g;
       g = f;
       f = e;
       e = (d + t1) | 0;
       d = c;
       c = b;
       b = a;
       a = (t1 + t2) | 0;
     }

     // update hash state
     s.h0 = (s.h0 + a) | 0;
     s.h1 = (s.h1 + b) | 0;
     s.h2 = (s.h2 + c) | 0;
     s.h3 = (s.h3 + d) | 0;
     s.h4 = (s.h4 + e) | 0;
     s.h5 = (s.h5 + f) | 0;
     s.h6 = (s.h6 + g) | 0;
     s.h7 = (s.h7 + h) | 0;
     len -= 64;
   }
 }




 /* ==================================================== */
 /* ========== copy of hasWideChar.js ================== */
 /* ==================================================== */

 /* custom written function to determine if string is ASCII or UTF-8 */
 util.hasWideChar = function(str) {
     for( var i = 0; i < str.length; i++ ){
         if ( str.charCodeAt(i) >>> 8 ) return true;
     }
     return false;
 };




 /* ==================================================== */
 /* ========== copy of wrapper.js ====================== */
 /* ==================================================== */

 // custom written wrapper
 // automatically sets encoding to ASCII or UTF-8
 forge_sha256 = function(str) {
     var md = forge.md.sha256.create();
     md.update(
         str,
         util.hasWideChar(str)?'utf8':undefined);
     return md.digest().toHex();
 };




 })();

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

		this.fileURL = 'https://s3.amazonaws.com/' + Module.AWSBucketName + uploadDir + Module.fileName;

		this.log('File: '+this.fileURL);

		this.http.open('PUT', this.fileURL, true);

		var Moment = require('alloy/moment');
		var curDate = Moment().toDate().toUTCString();

		//var curDate = Moment().add(30, 'minutes').format('ddd, D MMMM YYYY HH:mm:ss');

    var expires = new Date();
    expires.setMinutes(expires.getMinutes() + 300);
    var epoch = Math.floor(expires.getTime()/1000);

		var StringToSign = ''+'PUT\n\n'+''+fileContents.mimeType+'\n' + '' + curDate + '\n/'+''+Module.AWSBucketName + uploadDir + Module.fileName;

		var AWSAccessKeyID = 'AWS ' + Module.APIKey + ':';
		var AWSSignature = this.SHA.b64_hmac_sha1(Module.SecretKey, this.Utf8.encode(StringToSign));
		var AWSAuthHeader = AWSAccessKeyID.concat(AWSSignature);
		this.http.setRequestHeader('Authorization', AWSAuthHeader);
		if (OS_IOS) {
			this.http.setRequestHeader('Content-Length', uploadFile.size);
		}
		this.http.setRequestHeader('Content-Type', fileContents.mimeType);
		this.http.setRequestHeader('Host', 's3.amazonaws.com');
		this.http.setRequestHeader('Date', curDate);
		this.http.setRequestHeader('Accept-Encoding', 'gzip');
		this.http.setRequestHeader('Proxy-Connection','close');
		//this.http.setRequestHeader('User-Agent','Appcelerator Titanium/1.8.1.v20120126144634 (iPhone/5.0.1; iPhone OS; en_US;');

		this.http.send(fileContents);
};



module.exports = new Module();
