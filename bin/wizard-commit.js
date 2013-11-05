#!/usr/bin/env node

var Repo = require("../repo.js");
var API = require("../api.js");
var config = require("../config.js");

var conf = config.loadConfig();

var apiPool = {
	alpha: new API("alpha.wizard.dp"),
	beta: new API("wizard.dp"),
	product: new API("wizard.dp")
}


exports.commit = function(options) {
	var widgetName = options.widgetName;
	var env = options.env;
	var comment = options.comment;
	if (!conf) {
		console.log("you must first login");
		return;
	}
	var user = conf.user;
	if (!user) {
		console.log("you must first login");
		return;
	}
	if (!widgetName) {
		console.log("you must specify the widget");
		return;
	}
	if (!env) {
		console.log("you must specify the env {alpha|beta|product}");
		return;
	}
	if (!comment) {
		console.log("you must enter the comment");
		return;
	}

	var baseDir = conf.baseDir || "/Users/ltebean/Desktop/java workspace/shop-web/src/main/resources";

	commitFromDir(baseDir);

	function commitFromDir(baseDir) {

		var api = apiPool[env];
		var repo = new Repo(baseDir);
		repo.loadWidget(widgetName, function(widget) {
			if (!widget) {
				console.log("widget not found: " + widgetName);
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