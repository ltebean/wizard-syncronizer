#!/usr/bin/env node

var Repo = require("../repo.js");
var API = require("../api.js");
var config = require("../config.js");
var fs = require("fs");
var package = require("../package.js")

var conf = config.loadConfig();

exports.sync = function(options,cb) {
	var widgetName = options.widgetName;
	var env = options.env;
	var comment = options.comment;
	var branch = options.branch;

	var info="";

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
	if (!branch) {
		console.log("you must specify a branch");
		return;
	}
	deleteTempDirectory();
	var tempDirectory = createTempDirectory();
	var cp = require('child_process');
	console.log("create temp directory: " + tempDirectory);
	var api = API.getAPI(env);

	api.loadWidgetExtInfo(user, widgetName, function(extInfo) {
		cloneAndSync(extInfo);
	})

	function cloneAndSync(extInfo) {
		var command = 'git clone ' + extInfo.gitURL + " -b " + branch + " " + tempDirectory;
		logAndAppend(msg,info)

		cp.exec(command, {}, function(err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			var projectDir = tempDirectory;
			if (conf.baseDir) {
				//tempDirectory = tempDirectory + "/" + conf.baseDir
			}
			var repo = new Repo(tempDirectory);

			commitWidget(widgetName,function done() {
				if (env == "product") {
					// package.pack(projectDir, function() {
					// 	deleteTempDirectory();
					// 	console.log("delete temp directory success");
					// })
					cb && cb(info);
				} else {
					deleteTempDirectory();
					console.log("delete temp directory success");
					cb && cb(info);
				}
			});

			function commitWidget(widgetName,cb) {

				repo.loadWidget(widgetName, function(widget) {
					if (!widget) {
						logAndAppend("widget not found: " + widgetName,info)
						return cb();
					}
					logAndAppend("updoading widget: " + widgetName + "...",info);
					info+=msg＋"\n";
					api.commit(user, widget,comment, options.clearCache , function(code) {
						if (code == 200) {
							logAndAppend("updoad " + widgetName + " success",info)
						} else {
							logAndAppend("updoad " + widgetName + " failed",info)
						}
						cb("done");
					});

				})
			}
		});
	}

}

function logAndAppend(msg,info){
	console.log(msg);
	info+=msg＋"\n";
}

function createTempDirectory() {
	var path = config.getWizardHome() + "/temp";
	fs.mkdirSync(path);
	return path;
}

function deleteTempDirectory() {
	var path = config.getWizardHome() + "/temp";
	deleteFolderRecursive(path);
}

var deleteFolderRecursive = function(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index) {
			var curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};