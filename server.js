var Repo = require("./repo.js");
var API = require("./api.js");
var config = require("./config.js");
var args = require('optimist').argv;
var cp = require('child_process');

var conf = config.loadConfig();
var action = args.action;
var env = args.env;


if (!action) {
	console.log("you must specify the action");
	return;
}
if (!env) {
	console.log("you must specify the env");
	return;
}

var apiPool = {
	alpha: new API("alpha.wizard.dp"),
	beta: new API("wizard.dp"),
	product: new API("wizard.dp")
}

if (action == "login") {
	var name = args.name;
	var password = args.password;
	if (!name || !password) {
		console.log("name or password cannot be null");
		return;
	}
	var api = apiPool[env];
	console.log("login...")
	api.login(name, password, function(user) {
		if (user) {
			conf.user = user
			config.saveConfig(conf);
			console.log("login success");
		} else {
			console.log("login failed");
		}
	});

} else if (action == "commit") {
	var widgetName = args.widget;
	var comment = args.comment;
	if (!conf) {
		console.log("you must first login");
		return;
	}
	if (!widgetName) {
		console.log("you must specify the widget");
		return;
	}
	var baseDir=conf.baseDir||"/Users/ltebean/Desktop/java workspace/shop-web/src/main/resources";

	commitFromDir(baseDir);

	function commitFromDir(baseDir) {
		var user = conf.user;
		var api = apiPool[env];
		var repo = new Repo(baseDir);
		repo.loadWidget("relatedDeal", function(widget) {
			if (!widget) {
				console.log("widget not found");
				return;
			}
			console.log("updoading widget: " + widgetName + "...");
			api.commit(user, widget, comment, function(code) {
				if (code == 200) {
					console.log("updoad success");
				} else {
					console.log("updoad failed");
				}
			});
		})
	}
}