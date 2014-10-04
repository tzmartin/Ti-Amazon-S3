var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

Alloy.Globals.AWS = require("modules/ti.amazon.s3");

Alloy.Globals.defaultImage = "https://s3.amazonaws.com/tzmartin.com.files/astronaut-astronomy-discovery-2156.jpg";

Alloy.createController("index");