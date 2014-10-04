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
    this.__controllerPath = "browser";
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
    $.__views.win = Ti.UI.createWindow({
        title: "Image Browser",
        backgroundColor: "#fff",
        id: "win"
    });
    $.__views.win && $.addTopLevelView($.__views.win);
    $.__views.webview = Ti.UI.createWebView({
        id: "webview"
    });
    $.__views.win.add($.__views.webview);
    onLoad ? $.__views.webview.addEventListener("load", onLoad) : __defers["$.__views.webview!load!onLoad"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    $.webview.url = args.url || Alloy.Globals.defaultImage;
    var onLoad = function() {
        Ti.UI.createAlertDialog({
            title: "Loaded Image",
            message: $.webview.url
        }).show();
    };
    __defers["$.__views.webview!load!onLoad"] && $.__views.webview.addEventListener("load", onLoad);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;