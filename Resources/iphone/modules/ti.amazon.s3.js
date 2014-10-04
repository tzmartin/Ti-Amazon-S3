var SHA = function() {
    this.hexcase = 0;
    this.b64pad = "=";
    this.chrsz = 8;
    this.hex_sha1 = function(s) {
        return this.binb2hex(this.core_sha1(this.str2binb(s), s.length * this.chrsz));
    };
    this.b64_sha1 = function(s) {
        return this.binb2b64(this.core_sha1(this.str2binb(s), s.length * this.chrsz));
    };
    this.str_sha1 = function(s) {
        return this.binb2str(this.core_sha1(this.str2binb(s), s.length * this.chrsz));
    };
    this.hex_hmac_sha1 = function(key, data) {
        return this.binb2hex(this.core_hmac_sha1(key, data));
    };
    this.b64_hmac_sha1 = function(key, data) {
        return this.binb2b64(this.core_hmac_sha1(key, data));
    };
    this.str_hmac_sha1 = function(key, data) {
        return this.binb2str(this.core_hmac_sha1(key, data));
    };
    this.sha1_vm_test = function() {
        return "a9993e364706816aba3e25717850c26c9cd0d89d" == this.hex_sha1("abc");
    };
    this.core_sha1 = function(x, len) {
        x[len >> 5] |= 128 << 24 - len % 32;
        x[(len + 64 >> 9 << 4) + 15] = len;
        var w = Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;
        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;
            for (var j = 0; 80 > j; j++) {
                w[j] = 16 > j ? x[i + j] : this.rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = this.safe_add(this.safe_add(this.rol(a, 5), this.sha1_ft(j, b, c, d)), this.safe_add(this.safe_add(e, w[j]), this.sha1_kt(j)));
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
    this.sha1_ft = function(t, b, c, d) {
        if (20 > t) return b & c | ~b & d;
        if (40 > t) return b ^ c ^ d;
        if (60 > t) return b & c | b & d | c & d;
        return b ^ c ^ d;
    };
    this.sha1_kt = function(t) {
        return 20 > t ? 1518500249 : 40 > t ? 1859775393 : 60 > t ? -1894007588 : -899497514;
    };
    this.core_hmac_sha1 = function(key, data) {
        var bkey = this.str2binb(key);
        bkey.length > 16 && (bkey = this.core_sha1(bkey, key.length * this.chrsz));
        var ipad = Array(16), opad = Array(16);
        for (var i = 0; 16 > i; i++) {
            ipad[i] = 909522486 ^ bkey[i];
            opad[i] = 1549556828 ^ bkey[i];
        }
        var hash = this.core_sha1(ipad.concat(this.str2binb(data)), 512 + data.length * this.chrsz);
        return this.core_sha1(opad.concat(hash), 672);
    };
    this.safe_add = function(x, y) {
        var lsw = (65535 & x) + (65535 & y);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return msw << 16 | 65535 & lsw;
    };
    this.rol = function(num, cnt) {
        return num << cnt | num >>> 32 - cnt;
    };
    this.str2binb = function(str) {
        var bin = Array();
        var mask = (1 << this.chrsz) - 1;
        for (var i = 0; i < str.length * this.chrsz; i += this.chrsz) bin[i >> 5] |= (str.charCodeAt(i / this.chrsz) & mask) << 32 - this.chrsz - i % 32;
        return bin;
    };
    this.binb2str = function(bin) {
        var str = "";
        var mask = (1 << this.chrsz) - 1;
        for (var i = 0; i < 32 * bin.length; i += this.chrsz) str += String.fromCharCode(bin[i >> 5] >>> 32 - this.chrsz - i % 32 & mask);
        return str;
    };
    this.binb2hex = function(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < 4 * binarray.length; i++) str += hex_tab.charAt(binarray[i >> 2] >> 8 * (3 - i % 4) + 4 & 15) + hex_tab.charAt(binarray[i >> 2] >> 8 * (3 - i % 4) & 15);
        return str;
    };
    this.binb2b64 = function(binarray) {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var str = "";
        for (var i = 0; i < 4 * binarray.length; i += 3) {
            var triplet = (binarray[i >> 2] >> 8 * (3 - i % 4) & 255) << 16 | (binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4) & 255) << 8 | binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4) & 255;
            for (var j = 0; 4 > j; j++) str += 8 * i + 6 * j > 32 * binarray.length ? this.b64pad : tab.charAt(triplet >> 6 * (3 - j) & 63);
        }
        return str;
    };
};

var UTF8 = function() {
    return {
        encode: function(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (128 > c) utftext += String.fromCharCode(c); else if (c > 127 && 2048 > c) {
                    utftext += String.fromCharCode(c >> 6 | 192);
                    utftext += String.fromCharCode(63 & c | 128);
                } else {
                    utftext += String.fromCharCode(c >> 12 | 224);
                    utftext += String.fromCharCode(c >> 6 & 63 | 128);
                    utftext += String.fromCharCode(63 & c | 128);
                }
            }
            return utftext;
        },
        decode: function(utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (128 > c) {
                    string += String.fromCharCode(c);
                    i++;
                } else if (c > 191 && 224 > c) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode((31 & c) << 6 | 63 & c2);
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode((15 & c) << 12 | (63 & c2) << 6 | 63 & c3);
                    i += 3;
                }
            }
            return string;
        }
    };
};

var JSDate = function() {
    return {
        MONTH_NAMES: new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"),
        DAY_NAMES: new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"),
        LZ: function(x) {
            return (0 > x || x > 9 ? "" : "0") + x;
        },
        isDate: function(val, format) {
            var date = this.getDateFromFormat(val, format);
            if (0 == date) return false;
            return true;
        },
        compareDates: function(date1, dateformat1, date2, dateformat2) {
            var d1 = this.getDateFromFormat(date1, dateformat1);
            var d2 = this.getDateFromFormat(date2, dateformat2);
            if (0 == d1 || 0 == d2) return -1;
            if (d1 > d2) return 1;
            return 0;
        },
        formatDate: function(date, format) {
            format += "";
            var result = "";
            var i_format = 0;
            var c = "";
            var token = "";
            var y = date.getYear() + "";
            var M = date.getMonth() + 1;
            var d = date.getDate();
            var E = date.getDay();
            var H = date.getHours();
            var m = date.getMinutes();
            var s = date.getSeconds();
            var H;
            var value = new Object();
            y.length < 4 && (y = "" + (y - 0 + 1900));
            value["y"] = "" + y;
            value["yyyy"] = y;
            value["yy"] = y.substring(2, 4);
            value["M"] = M;
            value["MM"] = this.LZ(M);
            value["MMM"] = this.MONTH_NAMES[M - 1];
            value["NNN"] = this.MONTH_NAMES[M + 11];
            value["d"] = d;
            value["dd"] = this.LZ(d);
            value["E"] = this.DAY_NAMES[E + 7];
            value["EE"] = this.DAY_NAMES[E];
            value["H"] = H;
            value["HH"] = this.LZ(H);
            value["h"] = 0 == H ? 12 : H > 12 ? H - 12 : H;
            value["hh"] = this.LZ(value["h"]);
            value["K"] = H > 11 ? H - 12 : H;
            value["k"] = H + 1;
            value["KK"] = this.LZ(value["K"]);
            value["kk"] = this.LZ(value["k"]);
            value["a"] = H > 11 ? "PM" : "AM";
            value["m"] = m;
            value["mm"] = this.LZ(m);
            value["s"] = s;
            value["ss"] = this.LZ(s);
            while (i_format < format.length) {
                c = format.charAt(i_format);
                token = "";
                while (format.charAt(i_format) == c && i_format < format.length) token += format.charAt(i_format++);
                result += null != value[token] ? value[token] : token;
            }
            return result;
        },
        _isInteger: function(val) {
            var digits = "1234567890";
            for (var i = 0; i < val.length; i++) if (-1 == digits.indexOf(val.charAt(i))) return false;
            return true;
        },
        _getInt: function(str, i, minlength, maxlength) {
            for (var x = maxlength; x >= minlength; x--) {
                var token = str.substring(i, i + x);
                if (token.length < minlength) return null;
                if (this._isInteger(token)) return token;
            }
            return null;
        },
        getDateFromFormat: function(val, format) {
            val += "";
            format += "";
            var i_val = 0;
            var i_format = 0;
            var c = "";
            var token = "";
            var x, y;
            var now = new Date();
            var year = now.getYear();
            var month = now.getMonth() + 1;
            var date = 1;
            var hh = now.getHours();
            var mm = now.getMinutes();
            var ss = now.getSeconds();
            var ampm = "";
            while (i_format < format.length) {
                c = format.charAt(i_format);
                token = "";
                while (format.charAt(i_format) == c && i_format < format.length) token += format.charAt(i_format++);
                if ("yyyy" == token || "yy" == token || "y" == token) {
                    if ("yyyy" == token) {
                        x = 4;
                        y = 4;
                    }
                    if ("yy" == token) {
                        x = 2;
                        y = 2;
                    }
                    if ("y" == token) {
                        x = 2;
                        y = 4;
                    }
                    year = _getInt(val, i_val, x, y);
                    if (null == year) return 0;
                    i_val += year.length;
                    2 == year.length && (year = year > 70 ? 1900 + (year - 0) : 2e3 + (year - 0));
                } else if ("MMM" == token || "NNN" == token) {
                    month = 0;
                    for (var i = 0; i < this.MONTH_NAMES.length; i++) {
                        var month_name = this.MONTH_NAMES[i];
                        if (val.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase() && ("MMM" == token || "NNN" == token && i > 11)) {
                            month = i + 1;
                            month > 12 && (month -= 12);
                            i_val += month_name.length;
                            break;
                        }
                    }
                    if (1 > month || month > 12) return 0;
                } else if ("EE" == token || "E" == token) for (var i = 0; i < this.DAY_NAMES.length; i++) {
                    var day_name = this.DAY_NAMES[i];
                    if (val.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
                        i_val += day_name.length;
                        break;
                    }
                } else if ("MM" == token || "M" == token) {
                    month = this._getInt(val, i_val, token.length, 2);
                    if (null == month || 1 > month || month > 12) return 0;
                    i_val += month.length;
                } else if ("dd" == token || "d" == token) {
                    date = this._getInt(val, i_val, token.length, 2);
                    if (null == date || 1 > date || date > 31) return 0;
                    i_val += date.length;
                } else if ("hh" == token || "h" == token) {
                    hh = this._getInt(val, i_val, token.length, 2);
                    if (null == hh || 1 > hh || hh > 12) return 0;
                    i_val += hh.length;
                } else if ("HH" == token || "H" == token) {
                    hh = this._getInt(val, i_val, token.length, 2);
                    if (null == hh || 0 > hh || hh > 23) return 0;
                    i_val += hh.length;
                } else if ("KK" == token || "K" == token) {
                    hh = this._getInt(val, i_val, token.length, 2);
                    if (null == hh || 0 > hh || hh > 11) return 0;
                    i_val += hh.length;
                } else if ("kk" == token || "k" == token) {
                    hh = this._getInt(val, i_val, token.length, 2);
                    if (null == hh || 1 > hh || hh > 24) return 0;
                    i_val += hh.length;
                    hh--;
                } else if ("mm" == token || "m" == token) {
                    mm = this._getInt(val, i_val, token.length, 2);
                    if (null == mm || 0 > mm || mm > 59) return 0;
                    i_val += mm.length;
                } else if ("ss" == token || "s" == token) {
                    ss = this._getInt(val, i_val, token.length, 2);
                    if (null == ss || 0 > ss || ss > 59) return 0;
                    i_val += ss.length;
                } else if ("a" == token) {
                    if ("am" == val.substring(i_val, i_val + 2).toLowerCase()) ampm = "AM"; else {
                        if ("pm" != val.substring(i_val, i_val + 2).toLowerCase()) return 0;
                        ampm = "PM";
                    }
                    i_val += 2;
                } else {
                    if (val.substring(i_val, i_val + token.length) != token) return 0;
                    i_val += token.length;
                }
            }
            if (i_val != val.length) return 0;
            if (2 == month) if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
                if (date > 29) return 0;
            } else if (date > 28) return 0;
            if ((4 == month || 6 == month || 9 == month || 11 == month) && date > 30) return 0;
            12 > hh && "PM" == ampm ? hh = hh - 0 + 12 : hh > 11 && "AM" == ampm && (hh -= 12);
            var newdate = new Date(year, month - 1, date, hh, mm, ss);
            return newdate.getTime();
        },
        parseDate: function(val) {
            var preferEuro = 2 == arguments.length ? arguments[1] : false;
            generalFormats = new Array("y-M-d", "MMM d, y", "MMM d,y", "y-MMM-d", "d-MMM-y", "MMM d");
            monthFirst = new Array("M/d/y", "M-d-y", "M.d.y", "MMM-d", "M/d", "M-d");
            dateFirst = new Array("d/M/y", "d-M-y", "d.M.y", "d-MMM", "d/M", "d-M");
            var checkList = new Array("generalFormats", preferEuro ? "dateFirst" : "monthFirst", preferEuro ? "monthFirst" : "dateFirst");
            var d = null;
            for (var i = 0; i < checkList.length; i++) {
                var l = window[checkList[i]];
                for (var j = 0; j < l.length; j++) {
                    d = this.getDateFromFormat(val, l[j]);
                    if (0 != d) return new Date(d);
                }
            }
            return null;
        }
    };
};

var Module = function() {
    this.APIKey = "AKIAIM2WVXLMFPV3PJMA";
    this.SecretKey = "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";
    this.AWSBucketName = false;
    this.GSM = " -0700";
    this.fileName = false;
    this.timeout = 99e3;
    this.debug = false;
    this.http = Ti.Network.createHTTPClient({
        timeout: Module.timeout,
        cache: false,
        onreadystatechange: function() {
            400 == this.status && this.abort();
        }
    });
    this.SHA = new SHA();
    this.Utf8 = new UTF8();
    this.Date = new JSDate();
    this.abort = function() {
        if ("function" == typeof this.http.abort) {
            this.log("Aborting HTTP client");
            this.http.abort();
        } else this.log("Nothing to abort.");
    };
    this.log = function(str) {
        Module.debug && Ti.API.info(str);
    };
};

Module.prototype.PUT = function(_args) {
    this.fileName = _args.fileName;
    _args.key && (Module.APIKey = _args.key);
    _args.secret && (Module.SecretKey = _args.secret);
    _args.bucket && (Module.AWSBucketName = _args.bucket);
    _args.fileName && (Module.fileName = _args.fileName);
    _args.timeout && (Module.timeout = _args.timeout);
    _args.debug && (Module.debug = _args.debug);
    this.http.setTimeout(Module.timeout);
    if ("android" == Ti.Platform.osname) {
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
    var uploadFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, _args.fileName);
    var fileContents = uploadFile.read();
    if (!uploadFile.exists()) {
        alert("File not found. Please check that " + Module.fileName + " exists in your Data directory.");
        return;
    }
    this.fileURL = "https://s3.amazonaws.com/" + Module.AWSBucketName + "/" + Module.fileName;
    this.log("File: " + this.fileURL);
    this.http.open("PUT", this.fileURL, true);
    var curDate = this.Date.formatDate(new Date(), "E, d MMM dd yyyy HH:mm:ss") + this.GSM;
    var StringToSign = "PUT\n\n\n" + fileContents.mimeType + "\n" + curDate + "\n/" + this.AWSBucketName + "/" + this.fileName;
    var AWSAccessKeyID = "AWS " + this.APIKey + ":";
    var AWSSignature = this.SHA.b64_hmac_sha1(this.SecretKey, this.Utf8.encode(StringToSign));
    var AWSAuthHeader = AWSAccessKeyID.concat(AWSSignature);
    this.http.setRequestHeader("Authorization", Ti.Utils.base64encode(AWSAuthHeader).toString());
    this.http.setRequestHeader("Content-Type", fileContents.mimeType);
    this.http.setRequestHeader("Content-Length", uploadFile.size);
    this.http.setRequestHeader("Host", "s3.amazonaws.com");
    this.http.setRequestHeader("Date", curDate);
    this.http.setRequestHeader("Accept-Encoding", "gzip");
    this.http.setRequestHeader("Proxy-Connection", "close");
    this.http.setRequestHeader("User-Agent", "Appcelerator Titanium/1.8.1.v20120126144634 (iPhone/5.0.1; iPhone OS; en_US;");
    this.http.send(fileContents);
};

module.exports = new Module();