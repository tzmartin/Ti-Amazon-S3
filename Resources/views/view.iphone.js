var _OBJ = {
	view: Titanium.UI.createWindow({backgroundColor:'#fff'}),
	
	logo: Ti.UI.createImageView({
		width:177,
		height:107,
		top:5,
		image:'images/header.png'
	}),
	
	imageView: Ti.UI.createImageView({
		image:'http://semanticpress.com/images/no-image-s3demo.jpg',
		left:'auto',
		top:130,
		height:250,
		width:250
	}),
	
	ind: Titanium.UI.createProgressBar({
		opacity:1,
		width:200,
		height:50,
		min:0,
		max:1,
		value:0,
		style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
		bottom:35,
		message:'Uploading Image',
		font:{fontSize:13, fontWeight:'bold'},
		color:'#333'
	})
};

// Add Events

_OBJ.imageView.addEventListener('click', function() { 
	var a = Titanium.UI.createAlertDialog({
		title:'Select Option',
		buttonNames: ['New Upload','Open Link','Cancel'],
		message:'You can upload a new photo or open a link to an existing one.'
	});
	a.show();
	a.addEventListener('click', function(e) {
		if (e.index == 0) {
			Ti.Media.openPhotoGallery({
				success:function(e) {
					
					// Reset Ind
					_OBJ.ind.message = 'Uploading Image';
					_OBJ.ind.opacity = 1;
					_OBJ.ind.show();
					
					// File
					var d = new Date();
					var FILENAME = d.getTime()+'.png';

					var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,FILENAME);
					f.write(e.media);

					App.AWS.PUT(FILENAME);
				}
			});
		}
		if (e.index == 1) {
			Titanium.Platform.openURL(_OBJ.imageView.image);
		}
	});
});


// Construct View

_OBJ.view.add(_OBJ.ind);
_OBJ.view.add(_OBJ.logo);
_OBJ.view.add(_OBJ.imageView);


// Configure AWS Object

App.AWS.config({
	key: '14RBJQ0VK4WMERTD6SG2',
	secret: '5Wa/odVzuT6CbxDQXnowiOwdKU81/ol0QHL6VO5p',
	bucket: 'bucket001.sempress',
	GSM:' -0700',
	debug:true,
	onsendstream: function(e) {
		_OBJ.ind.value = e.progress ;
		Ti.API.info('PROGRESS: ' + e.progress);
	},
	error: function() {
		
	},
	success: function(e) {
			
		_OBJ.ind.message = 'Success!';
		_OBJ.imageView.image = App.AWS.fileURL;
		
		// Hide Indicator
		setTimeout(function() {
			_OBJ.ind.animate({opacity:0,duration:500},function() {
				_OBJ.ind.hide();
				_OBJ.ind.value = 0;
			});
		},1200);
	}
});

exports.load = function() {
	return _OBJ.view;
};