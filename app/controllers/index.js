/*
 *
 * Controller Vars
 *
*/

// Create loading images
var imageArr = [];
for (var x=1;x<=12;x++) {
    imageArr.push('/images/s'+x+'.gif');
}
$.progressImage.images = imageArr;

/*
 *
 * Controller Functions
 *
*/
var toggleProgress = function(state){
    if (state) {
        $.progressImage.start();
        $.progress.animate({opacity:1,duration:500});
        $.myImageView.animate({opacity:0.05,duration:500});
    } else {
        $.progressImage.stop();
        $.progress.animate({opacity:0,duration:500});
        $.myImageView.animate({opacity:1,duration:500});
    }
};
var uploadFile = function() {
    
    toggleProgress(true);
    
    // Open PhotoGallery
    Ti.Media.openPhotoGallery({
        error:function(e){
            Ti.API.error(e);
            toggleProgress(false);
        },        
        cancel:function(){
            toggleProgress(false);
        },
        success:function(e) {
            // Reset Indicator
            $.ind.message = 'Uploading Image';
            $.ind.opacity = 1;
            $.ind.show();
                    
            // Persist to filesystem
            var d = new Date();
            var f = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, d.getTime()+'.png');
            f.write(e.media);
                        
            // Upload to S3 Bucket
            Alloy.Globals.AWS.PUT({
                fileName: f.name,
                bucket: 'tzmartin.com.files',
                debug:true,
                onsendstream: function(e) {
                    $.ind.value = e.progress ;
                },
                error: function(e) {
                    alert('Error: Response '+this.status);
                    if (this.status == 400) {
                        Alloy.Globals.AWS.abort();
                    }
                    toggleProgress(false);
                },
                success: function(e) {
                    
                    // On android a success is fired for 400. This is a bug.
                    if (this.status == 400) {
                        Alloy.Globals.AWS.abort();
                        $.ind.message = 'Error: '+this.status;
                    } else {
                        $.ind.message = ' Success!';
                        $.myImageView.image = Alloy.Globals.AWS.fileURL;
                    }
                               
                    // Hide Indicator
                    setTimeout(function() {
                        toggleProgress(false);
                        $.ind.animate({opacity:0,duration:500},function() {
                            $.ind.hide();
                            $.ind.value = 0;
                        });
                    },1200);
                }
            });
        }
    });
};
var openFile = function() {
    Ti.API.info('Opening '+$.myImageView.image);
    var win = Alloy.createController('browser',{url:$.myImageView.image}).getView();
    win.open({modal:true});
};
var abortHTTP = function() {
    Alloy.Globals.AWS.abort();
};

/*
 *
 * Event Handlers
 *
*/

/*
 *
 * Event Listeners
 *
*/


/*
 *
 * Run...
 *
*/

$.main.open();
