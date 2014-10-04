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
    $.__views.__alloyId1 = Ti.UI.createButton({
        title: "Close",
        id: "__alloyId1"
    });
    closeWin ? $.__views.__alloyId1.addEventListener("click", closeWin) : __defers["$.__views.__alloyId1!click!closeWin"] = true;
    $.__views.win.rightNavButton = $.__views.__alloyId1;
    $.__views.webview = Ti.UI.createWebView({
        id: "webview"
    });
    $.__views.win.add($.__views.webview);
    onLoad ? $.__views.webview.addEventListener("load", onLoad) : __defers["$.__views.webview!load!onLoad"] = true;
    $.__views.nav = Ti.UI.iOS.createNavigationWindow({
        backgroundColor: "#fff",
        window: $.__views.win,
        id: "nav"
    });
    $.__views.nav && $.addTopLevelView($.__views.nav);
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
    var closeWin = function() {
        $.nav ? $.nav.close() : $.win.close();
    };
    __defers["$.__views.__alloyId1!click!closeWin"] && $.__views.__alloyId1.addEventListener("click", closeWin);
    __defers["$.__views.webview!load!onLoad"] && $.__views.webview.addEventListener("load", onLoad);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;