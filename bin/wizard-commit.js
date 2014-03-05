#!/usr/bin/env node

var Repo = require("../repo.js");
var API = require("../api.js");
var config = require("../config.js");
var async = require("async");
var conf = config.loadConfig();

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
		console.log("you must specify the env {alpha|beta|pre|product}");
		return;
	}
	if (!comment) {
		console.log("you must enter the comment");
		return;
	}

	async.waterfall([
		function loadWidget(cb) {
			var repo = new Repo(process.cwd());
			repo.loadWidget(widgetName, function(err, widget) {
				cb(err, widget);
			});
		},
		function commitWidget(widget, cb) {
			var api=API.getAPI(env);
			api.commit({
				widget: widget,
				comment: comment,
				clearCache: options.clearCache || true,
				appNames: options.appNames || "all",
			}, function(err) {
				cb(err);
			});
		}

	], function(err, result) {
		if(err){
			console.log("upload failed:"+err.messsage);
		}else{
			console.log("upload success");
		}
	})
}