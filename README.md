# Ti Amazon S3

Upload media files directly to an Amazon S3 bucket using signed URLs and [Amazon's REST API](http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html).  This app contains a JavaScript module that simplifies the authorization flow and makes is EASY PEASY!

## Example

    Alloy.Globals.AWS = require('modules/ti.amazon.s3');
       
    Alloy.Globals.AWS.PUT({
    	key: 'YOUR KEY',
    	secret: 'YOUR SECRET',
		bucket: 'YOUR BUCKET',
		GSM:' -0700',
		debug:true,
		onsendstream: function(e) {},
		error: function(e) {},
		success: function(e) {
			Ti.API.info('DONE!!')
		}
	});

![test](https://raw.githubusercontent.com/tzmartin/Ti-Amazon-S3/master/screencast.gif)

[Watch the Vimeo link](http://vimeo.com/107978881)

Note: This is a complete rewrite. If you used this project in the past, delete the old one and import this one.

A single module file lives in the ```app/assets/modules/``` directory.

![Assets folder](https://monosnap.com/image/ytTb2RNWPYd6h5NdfJMUTnPpT0679V.png)

**Alternatively**

You can compile this JavaScript file into a native module and ship it as a static binary.  If you're interested, download this zip file [ti.amazon.s3-iphone-1.1.0.zip](https://raw.githubusercontent.com/tzmartin/Ti-Amazon-S3/master/dist/ti.amazon.s3-iphone-1.1.0.zip) and add it to your ```tiapp.xml```.

Instatiate it using ```require('ti.amazon.s3');```.

### Changelog

- 10-2-2014
	- Complete app rewrite to 3.4.0.GA SDK
	- Demo app now runs Alloy 1.4
	- Removed additional module depencies. Now it's a single commonJS file.
	- Simplified constructor and removed ```config``` and ```load``` methods.  Now just pass properties to ```PUT```.
- 3-8-2012
	- Initial release

## Amazon Configuration

[Obtain S3 credentials](https://aws-portal.amazon.com/gp/aws/developer/account/index.html?action=access-key) and set a bucket policy.  You can use Amazon's [policy generator](http://awspolicygen.s3.amazonaws.com/policygen.html) if needed.  Simply save this policy to your bucket properties.  Here's a tutorial if needed:[http://www.jppinto.com/2011/12/access-denied-to-file-amazon-s3-bucket/](http://www.jppinto.com/2011/12/access-denied-to-file-amazon-s3-bucket/).

Login to your console here: [https://console.aws.amazon.com/s3/home](https://console.aws.amazon.com/s3/home)

Here's an example policy:

```
{
  "Id": "Policy1412292920796",
  "Statement": [
    {
      "Sid": "Stmt1412292914309",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::tzmartin.com.files/*",
      "Principal": {
        "AWS": [
          "*"
        ]
      }
    }
  ]
}
```

Upload an image, then visit the bucket: https://s3.amazonaws.com/BUCKETNAME/FILENAME.png

### Known Issues:

Android fails to upload properly. 400 server response.

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