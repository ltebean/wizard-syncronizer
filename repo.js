var walk = require('walk');
var fs = require('fs');
var yaml = require('js-yaml');

function Repo(baseDir) {
	this.baseDir = baseDir;
	this.walker = walk.walk(baseDir, {
		followLinks: false,
		filters: ["target", "WEB-INF"]
	});
}

Repo.prototype.loadWidget = function(widgetName, cb) {
	var widget = {
		name: widgetName,
		parentWidgetName: "",
		layoutName: "",
		layoutRule: "",
		modes: {
			display: {
				code: "",
				template: "",
				script: ""
			}

		}
	}
	var files = [];
	console.log("searching from path: " + this.baseDir);
	this.walker.on('file', function(root, fileStats, next) {
		// Add this file to the list of files
		//console.log(root);
		if (fileStats.name.indexOf(widgetName) != -1) {
			files.push(root + '/' + fileStats.name);
		}
		next();

	});

	this.walker.on('end', function() {
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			if (file.indexOf(widgetName + ".groovy") != -1) {
				console.log("found: " + file);
				widget.modes.display.code = fs.readFileSync(file).toString();
			} else if (file.indexOf(widgetName + ".ftl") != -1) {
				console.log("found: " + file);
				widget.modes.display.template = fs.readFileSync(file).toString();
			} else if (file.indexOf(widgetName + ".js") != -1) {
				console.log("found: " + file);
				widget.modes.display.script = fs.readFileSync(file).toString();
			} else if (file.indexOf(widgetName + ".widget") != -1) {
				console.log("found: " + file);
				var config = yaml.load(fs.readFileSync(file).toString())
				widget.parentWidgetName = config.parentWidgetName || "";
				widget.layoutName = config.layoutName || "";
				widget.layoutRule = config.layoutRule || "";
			}
		}
		if(widget.modes.display.code){
			cb(widget);
		}else{
			cb();
		}
	});
};

exports = module.exports = Repo;