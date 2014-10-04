function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.main = Ti.UI.createWindow({
        backgroundColor: "#fff",
        id: "main"
    });
    $.__views.main && $.addTopLevelView($.__views.main);
    $.__views.content = Ti.UI.createView({
        top: 0,
        layout: "vertical",
        id: "content"
    });
    $.__views.main.add($.__views.content);
    $.__views.title = Ti.UI.createLabel({
        text: "S3 Upload Demo",
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        top: 40,
        color: "#000",
        font: {
            fontSize: 24,
            fontFamily: "Helvetica",
            fontWeight: "bold"
        },
        id: "title"
    });
    $.__views.content.add($.__views.title);
    $.__views.myImageView = Ti.UI.createImageView({
        image: Alloy.Globals.defaultImage,
        top: 30,
        height: 250,
        width: 250,
        id: "myImageView"
    });
    $.__views.content.add($.__views.myImageView);
    openFile ? $.__views.myImageView.addEventListener("click", openFile) : __defers["$.__views.myImageView!click!openFile"] = true;
    $.__views.ind = Ti.UI.createProgressBar({
        opacity: 1,
        width: 200,
        height: 30,
        min: 0,
        max: 1,
        value: 0,
        style: Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
        top: 35,
        message: "Uploading File",
        font: {
            fontSize: 13,
            fontWeight: "bold"
        },
        color: "#333",
        id: "ind"
    });
    $.__views.content.add($.__views.ind);
    $.__views.btnUpload = Ti.UI.createButton({
        title: "Upload Something",
        top: 0,
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        font: {
            fontSize: 26,
            fontWeight: "bold"
        },
        id: "btnUpload"
    });
    $.__views.content.add($.__views.btnUpload);
    uploadFile ? $.__views.btnUpload.addEventListener("click", uploadFile) : __defers["$.__views.btnUpload!click!uploadFile"] = true;
    $.__views.progress = Ti.UI.createView({
        top: 98,
        width: 250,
        height: 250,
        opacity: 0,
        id: "progress"
    });
    $.__views.main.add($.__views.progress);
    abortHTTP ? $.__views.progress.addEventListener("click", abortHTTP) : __defers["$.__views.progress!click!abortHTTP"] = true;
    $.__views.progressImage = Ti.UI.createImageView({
        image: "images/s01.gif",
        width: 150,
        height: 150,
        id: "progressImage"
    });
    $.__views.progress.add($.__views.progressImage);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var imageArr = [];
    for (var x = 1; 12 >= x; x++) imageArr.push("/images/s" + x + ".gif");
    $.progressImage.images = imageArr;
    var toggleProgress = function(state) {
        if (state) {
            $.progressImage.start();
            $.progress.animate({
                opacity: 1,
                duration: 500
            });
            $.myImageView.animate({
                opacity: .05,
                duration: 500
            });
        } else {
            $.progressImage.stop();
            $.progress.animate({
                opacity: 0,
                duration: 500
            });
            $.myImageView.animate({
                opacity: 1,
                duration: 500
            });
        }
    };
    var uploadFile = function() {
        toggleProgress(true);
        Ti.Media.openPhotoGallery({
            error: function(e) {
                Ti.API.error(e);
                toggleProgress(false);
            },
            cancel: function() {
                toggleProgress(false);
            },
            success: function(e) {
                $.ind.message = "Uploading Image";
                $.ind.opacity = 1;
                $.ind.show();
                var d = new Date();
                var f = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, d.getTime() + ".png");
                f.write(e.media);
                Alloy.Globals.AWS.PUT({
                    fileName: f.name,
                    bucket: "tzmartin.com.files",
                    debug: true,
                    onsendstream: function(e) {
                        $.ind.value = e.progress;
                    },
                    error: function() {
                        alert("Error: Response " + this.status);
                        400 == this.status && Alloy.Globals.AWS.abort();
                        toggleProgress(false);
                    },
                    success: function() {
                        if (400 == this.status) {
                            Alloy.Globals.AWS.abort();
                            $.ind.message = "Error: " + this.status;
                        } else {
                            $.ind.message = " Success!";
                            $.myImageView.image = Alloy.Globals.AWS.fileURL;
                        }
                        setTimeout(function() {
                            toggleProgress(false);
                            $.ind.animate({
                                opacity: 0,
                                duration: 500
                            }, function() {
                                $.ind.hide();
                                $.ind.value = 0;
                            });
                        }, 1200);
                    }
                });
            }
        });
    };
    var openFile = function() {
        Ti.API.info("Opening " + $.myImageView.image);
        var win = Alloy.createController("browser", {
            url: $.myImageView.image
        }).getView();
        win.open({
            modal: true
        });
    };
    var abortHTTP = function() {
        Alloy.Globals.AWS.abort();
    };
    $.main.open();
    __defers["$.__views.myImageView!click!openFile"] && $.__views.myImageView.addEventListener("click", openFile);
    __defers["$.__views.btnUpload!click!uploadFile"] && $.__views.btnUpload.addEventListener("click", uploadFile);
    __defers["$.__views.progress!click!abortHTTP"] && $.__views.progress.addEventListener("click", abortHTTP);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;