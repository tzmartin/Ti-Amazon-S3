/*
 *
 * Controller Vars
 *
*/

var args = arguments[0] || {};

$.webview.url = args.url||Alloy.Globals.defaultImage;

/*
 *
 * Controller Functions
 *
*/

var onLoad = function() {
    Ti.UI.createAlertDialog({
        title:'Loaded Image',
        message: $.webview.url
    }).show();
};
var closeWin = function() {
   
    if ($.nav) {
        $.nav.close();
    } else {
        $.win.close();
    }

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
