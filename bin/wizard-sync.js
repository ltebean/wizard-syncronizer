#!/usr/bin/env node

var Repo = require("../repo.js");
var api = require("../api.js");
var config = require("../config.js");
var fs = require("fs");
var async=require('async');

var conf = config.loadConfig();

exports.sync = function(options, callback) {
	var widgetName = options.widgetName;
	var env = options.env;
	var comment = options.comment;
	var branch = options.branch;

	var info = "";

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
	console.log("create temp directory: " + tempDirectory);

	var widgetExtInfo;
	async.waterfall([
		function loadWidgetExtInfo(cb) {
			api[env].loadWidgetExtInfo(widgetName, function(err, extInfo) {
				widgetExtInfo=extInfo;
				return cb(err, extInfo);
			});
		},
		function cloneGitRepo(widgetExtInfo,cb) {
			var command = 'git clone ' + widgetExtInfo.gitURL + " -b " + branch + " " + tempDirectory;
			info += logAndReturn(command);
			require('child_process').exec(command, {}, function(err, stdout, stderr) {
				console.log(stdout);
				console.log(stderr);
				return cb(err);
			})

		},
		function searchWidget(cb){
			var repo = new Repo(tempDirectory);
			repo.loadWidget(widgetName,function(err,widget){
				return cb(err,widget);
			});
		},
		function commitWidget(widget,cb){
			info += logAndReturn("uploading widget: " + widgetName + "...");
			api[env].commitWidget({
						widget: widget,
						comment: comment,
						clearCache: options.clearCache || true,
						appNames: options.appNames || "all",
					}, function(err) {
						return cb(err);
					});
		}
	], function done(err, result) {
		if(err){
			info += logAndReturn("sync error:" + err.message);
		}else{
			info += logAndReturn("upload " + widgetName + " success");
			if(env=='product'){
			//async task
				// require('../package.js').pack({
				// 	gitURL:widgetExtInfo.gitURL,
				// 	projectDir:tempDirectory
				// },function(err){
				// 	console.log(err);				
				// })
			}	
		}
		return callback && callback(info);
	})

}

function logAndReturn(msg) {
	console.log(msg);
	return msg + "\n";
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

function  deleteFolderRecursive(path) {
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