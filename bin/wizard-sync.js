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

	api.loadWidgetExtInfo(widgetName, function(extInfo) {
		cloneAndSync(extInfo);
	})

	function cloneAndSync(extInfo) {
		var command = 'git clone ' + extInfo.gitURL + " -b " + branch + " " + tempDirectory;
		info+=logAndReturn(command);

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
						info+=logAndReturn("widget not found: " + widgetName)
						return cb();
					}
					info+=logAndReturn("uploading widget: " + widgetName + "...");
					
					api.commit({
						widget:widget,
						comment:comment,
						clearCache:options.clearCache||true,
						appNames:options.appNames||"all",
					}, function(code) {
						if (code == 200) {
							info+=logAndReturn("upload " + widgetName + " success")
						} else {
							info+=logAndReturn("upload " + widgetName + " failed: "+code)
						}
						cb("done");
					});

				})
			}
		});
	}

}

function logAndReturn(msg){
	console.log(msg);
	return msg+"\n";
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