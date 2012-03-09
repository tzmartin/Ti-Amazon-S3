var App = {
	osname:Ti.Platform.osname,
	AWS:require('modules/amazon').load(),
	ui:{
		win: Ti.UI.createWindow({
			backgroundColor:'white'
		})
	}
};

// Add View to Window
var view = require('views/view.'+App.osname).load();
App.ui.win.add(view);

// Open main view
App.ui.win.open();