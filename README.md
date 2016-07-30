# Ti Amazon S3

A CommonJS module for Amazon S3.



Module location: `/blob/master/app/assets/modules/ti.amazon.s3.js`

*This is a mobile app test case, built using Appcelerator Alloy / Titanium Mobile SDK.*

```
Version: v1.1
Tested: Titanium SDK v5.3.1.GA
```

![test](https://raw.githubusercontent.com/tzmartin/Ti-Amazon-S3/master/screencast.gif)

[Watch the Vimeo link](http://vimeo.com/107978881)

## Description

Upload media files directly to an Amazon S3 bucket using signed URLs and [Amazon's REST API](http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html).  This app contains a JavaScript module that simplifies the authorization flow and makes is EASY PEASY LEMON SQUEEZY!

## Example Apps

|   |  App | Publisher  | Description  | 
|---|---|---|---|
|  [![Whichiscooler](http://a3.mzstatic.com/us/r30/Purple20/v4/84/4f/9a/844f9a97-d1af-2bd8-9a38-d2e43f4ed525/icon90x90.png)](https://itunes.apple.com/us/app/whichiscooler/id971389872?mt=8#) |  **Whichiscooler** | [S. Marston Maddox](http://www.whichiscooler.com/)  |  Whichiscooler is a tool to discover and share the coolest things.
 |

[Add your app](https://github.com/tzmartin/Ti-Amazon-S3/issues/new)

## How to Use

    Alloy.Globals.AWS = require('modules/ti.amazon.s3');

    Alloy.Globals.AWS.PUT({
    	key: 'YOUR KEY',
    	secret: 'YOUR SECRET',
		bucket: 'YOUR BUCKET',
		GSM:' -0700',
		debug:true,
		fileName: FILE_TO_UPLOAD,
		uploadDir: 'PATH_TO_UPLOAD_DIR_ON_S3',
		timeout: 99000,
		onsendstream: function(e) {},
		error: function(e) {},
		success: function(e) {
			Ti.API.info('DONE!!')
		}
	});

Note: This is a complete rewrite. If you used this project in the past, delete the old one and import this one.

A single module file lives in the ```app/assets/modules/``` directory.

![Assets folder](https://monosnap.com/image/ytTb2RNWPYd6h5NdfJMUTnPpT0679V.png)

**Alternatively**

You can compile this JavaScript file into a native module and ship it as a static binary.  If you're interested, download this zip file [ti.amazon.s3-iphone-1.1.0.zip](https://raw.githubusercontent.com/tzmartin/Ti-Amazon-S3/master/dist/ti.amazon.s3-iphone-1.1.0.zip) and add it to your ```tiapp.xml```.

Instatiate it using ```require('ti.amazon.s3');```.

## Requirements

### Amazon Configuration

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

![Easy Peasy Lemon Squeezy](https://www.supergaminator.com/Content/images/assets/GameAssets/game_317/game_317_logo_800x364_DEFAULT.png)

### Titanium SDK Compilation

You must have the following requirements to compile this app:

- A valid Appcelerator Platform account (free or paid):
	- [Sign up](http://www.appcelerator.com/signup) for an Appcelerator Platform account
- [Appcelerator Studio](https://platform.appcelerator.com/#/product/studio) should be installed and ready for use
- The latest Titanium SDK installation ([requirements](http://docs.appcelerator.com/platform/latest/#!/guide/Prerequisites))
- [Oracle JDK](http://docs.appcelerator.com/platform/latest/#!/guide/Installing_Oracle_JDK)
- [Node.js](http://docs.appcelerator.com/platform/latest/#!/guide/Installing_Node): required for the Titanium command-line tools like the CLI, Alloy and Arrow.
- iOS and/or Android SDK installation

*Note: To minimize the risk of problems, please refer to the [Titanium Compatibility Matrix](http://docs.appcelerator.com/platform/latest/#!/guide/Titanium_Compatibility_Matrix) whenever you make changes to your Titanium environment.*

### Changelog

- 07-29-2016
  - Update README: add example app
  - Bump to Ti SDK v5.3.1.GA
- 05-13-2015
	- Android works! (Fixed: Android fails to upload properly. 400 server response.)
  - Bump Ti SDK v5.2.2.GA
- 10-2-2014
	- Complete app rewrite to 3.4.0.GA SDK
	- Demo app now runs Alloy 1.4
	- Removed additional module depencies. Now it's a single commonJS file.
	- Simplified constructor and removed ```config``` and ```load``` methods.  Now just pass properties to ```PUT```.
- 3-8-2012
	- Initial release

### Known Issues:

**[Create a ticket](https://github.com/tzmartin/Ti-Amazon-S3/issues/new)**

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
