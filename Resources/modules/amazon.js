/*
 * A Titanium Mobile commonJS module for interacting with Amazon S3
 * 
 * Obtain S3 credentials here:
 * https://aws-portal.amazon.com/gp/aws/developer/account/index.html?action=access-key
 * 
 * Expected date format for AWS: 'Mon, 30 May 2011 17:00:00 -0700';
 * Note that S3 is case-sensitive so your file name must be an exact, case senstive match.
 *
 * Contributors: Terry Martin
 * Copyright: Semantic Press, Inc.
 */

var _OBJ = {
	APIKey: false, 				// Set your API Key Here
	SecretKey: false,			// Set your SECRET key here
	AWSBucketName: false,
	GSM:' -0700',
	fileName: false,
	fileURL:false,
	timeout: 99000,
	debug:false,
	
	log: function(_obj) {
		if (this.debug) {
			Ti.API.info(_obj);
		}
	},
	
	/*
	 * Import SHA
	 */
	SHA: require('modules/sha-aws').load(),
	Utf8: require('modules/UTF8').load(),
	Date: require('modules/date').load(),
	
	/*
	 * Create HTTP Object
	 */
	http: Ti.Network.createHTTPClient(),
	
	/*
	 * Convert an array of big-endian words to a hex string.
	 */
	PUT: function(f) {
		
		if (f) {
			this.fileName = f;
		}
 
		
		var uploadFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, _OBJ.fileName);
		var fileContents = uploadFile.read();
				
		if (!uploadFile.exists()){
		   alert('File not found. Please check that ' + _OBJ.fileName + ' exists in your Data directory.');
		   return;
		}
		
		_OBJ.fileURL = 'https://s3.amazonaws.com/'+_OBJ.AWSBucketName+'/' + _OBJ.fileName;
		
		_OBJ.log(_OBJ.fileURL);
		
		_OBJ.http.setTimeout(_OBJ.timeout);
		_OBJ.http.open('PUT', _OBJ.fileURL, false);
		
		var curDate = _OBJ.Date.formatDate(new Date(),'E, d MMM dd yyyy HH:mm:ss') + _OBJ.GSM;
		var StringToSign = 'PUT\n\n\n'+fileContents.mimeType+'\n' + curDate + '\n/'+_OBJ.AWSBucketName+'/' + _OBJ.fileName;
		
		var AWSAccessKeyID = 'AWS ' + _OBJ.APIKey + ':';
		var AWSSignature = _OBJ.SHA.b64_hmac_sha1(_OBJ.SecretKey, _OBJ.Utf8.encode(StringToSign));
		var AWSAuthHeader = AWSAccessKeyID.concat(AWSSignature);
		
		_OBJ.http.setRequestHeader('Authorization', Ti.Utils.base64encode(AWSAuthHeader).toString()); 
		_OBJ.http.setRequestHeader('Content-Type', fileContents.mimeType);
		_OBJ.http.setRequestHeader('Content-Length', uploadFile.size);
		_OBJ.http.setRequestHeader('Host', 's3.amazonaws.com');
		_OBJ.http.setRequestHeader('Date', curDate);
		_OBJ.http.setRequestHeader('Accept-Encoding', 'gzip');
		_OBJ.http.setRequestHeader('Proxy-Connection','close');
		_OBJ.http.setRequestHeader('User-Agent','Appcelerator Titanium/1.8.1.v20120126144634 (iPhone/5.0.1; iPhone OS; en_US;');

		_OBJ.http.send(fileContents);
	    
	},
	
	config: function(_args) {
		if (_args.key) { this.APIKey = _args.key; }
		if (_args.secret) { this.SecretKey = _args.secret; }
		if (_args.bucket) { this.AWSBucketName = _args.bucket; }
		if (_args.fileName) { this.fileName = _args.fileName; }
		if (_args.GSM) { this.GSM = _args.GSM; }
		if (_args.timeout) { this.timeout = _args.timeout; }
		if (_args.onsendstream) { this.http.onsendstream = _args.onsendstream; }
		if (_args.error) { this.http.onerror = _args.error; }
		if (_args.success) { this.http.onload = _args.success; }
		if (_args.debug) { this.debug = _args.debug; }
	}
};

exports.load = function() {
	
	// Set defaults
	_OBJ.http.onsendstream = function(e) { _OBJ.log('TEST1 - PROGRESS: ' + e.progress); };
	_OBJ.http.onload = function(e) { _OBJ.log('Success. Endpoint: '+_OBJ.fileURL); };
	
	return _OBJ;
};