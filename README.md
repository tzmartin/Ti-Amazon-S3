# Ti Amazon S3

An app for uploading media to Amazon S3 using commonJS modules.

Obtain S3 credentials: https://aws-portal.amazon.com/gp/aws/developer/account/index.html?action=access-key

Upload an image, then visit the bucket: https://s3.amazonaws.com/BUCKETNAME/FILENAME.png

This app requires the following modules: SHA-AWS, UTF-8, Date (see modules folder).

## Images

![Screen: iPhone](https://img.skitch.com/20120309-pqhwb728kb8p2cakpk65tb9quh.jpg)

## Usage

How to use this module:

    var AWS = require('modules/amazon').load();
       
    AWS.config({
    	key: 'YOUR KEY',
    	secret: 'YOUR SECRET',
		bucket: 'YOUR BUCKET',
		GSM:' -0700',
		debug:true,
		onsendstream: function(e) {},
		error: function(e) {},
		success: function(e) {}
	});

    AWS.PUT(FILENAME);


## Known Issues:

Android compatibility.  Currently the app is not functional with Android.

## Requirements

-   Titanium SDK 1.8+

## License

@authors	
		
-   Terry Martin <martin@semanticpress.com>

@license    

Copyright (c) 2011, Semantic Press, Inc. <http://www.semanticpress.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.