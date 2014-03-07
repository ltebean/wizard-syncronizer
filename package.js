var fs = require('fs');
var api = require("./api.js");
var async = require('async');
var config = require("./config.js");
var yaml = require('js-yaml');
var Client = require('ftp');
var moment = require('moment');
var request = require('request');

exports.pack = function(projectDir, callback) {
	var user = config.loadConfig().user;
	var basePackage = projectDir + "/src/main/resources/widget";

	async.waterfall([
		function loadAllWidget(cb) {
			console.log("loading all widgets");
			api['product'].loadAllWidget(function(err, allWidget) {
				cb(err, allWidget);
			});
		},
		function writeWidgetToLocal(allWidget, cb) {
			console.log(allWidget.length + " widget loaded");
			deleteFolderRecursive(projectDir + "/src/main/resources/widget");
			for (var i = allWidget.length - 1; i >= 0; i--) {
				var widget = allWidget[i];
				console.log("writing: " + widget.name + "...");
				writeWidget(basePackage, widget);
			};
			cb(null);
		},
		function packageWar(cb) {
			console.log("start mvn package...");
			var cp = require('child_process');
			var command = 'mvn package -Denv=product -DskipTests -f ' + projectDir + "/pom.xml";
			console.log(command);
			cp.exec(command, {}, function(err, stdout, stderr) {
				console.log(stdout);
				console.log(stderr);
				cb(null);
			});
		},
		function publishToFTP(cb) {
			console.log("prepare to push to FTP...");
			var client = new Client();
			client.on('ready', function() {
				console.log("connected");
				var localPath = projectDir + "/target/shop-web-product-2.1.9.war";
				var tag = "wizard-" + moment().format('YYYY-MM-DD_hh-mm-ss');
				var remotePath = "/product-shop-web/" + moment().format('YYYY-MM-DD_hh-mm-ss');
				console.log("transfer:" + localPath + " to:" + remotePath);
				client.mkdir(remotePath, true, function(err) {
					if (err) return cb(err);
					console.log("begin putting file...")
					client.put(localPath, remotePath+"/shop-web-product-2.1.9.war", function(err) {
						if (err) throw err;
						client.end();
						console.log("transfer success");
						console.log("connection ended");
						cb(null,tag,remotePath+"/shop-web-product-2.1.9.war");
					});
				});

			});
			client.connect({
				host: "10.1.1.81",
				user: "qaupload",
				password: "uploadwar"
			});
		},
		function registerToButton(tag, remotePath, cb) {
			console.log("register to button...")
			request({
					url: "http://code.dianpingoa.com/api/v3/op/packing/edit",
					method: "get",
					qs: {
						"private_token": "i4_gpfPbFT3a6gzR2qYIcg",
						"module_names": "shop-web",
						"branch_name": "master",
						"tag": tag,
						"war_urls": JSON.stringify({
							"shop-web": remotePath
						})
					},
					headers: {
						"Content-type": "application/json"
					}

				}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
						console.log("register to button success")
						cb(null)
					} else {
						cb(error);
					}
				}

			);
		}
	], function done(err) {
		callback(err);
	});
}

function writeWidget(path, widget) {
	if (widget.modes.display.code) {
		fs.writeFileSync(path + "/" + widget.name + ".groovy", widget.modes.display.code);
	}
	if (widget.modes.display.script) {
		fs.writeFileSync(path + "/" + widget.name + ".js", widget.modes.display.script);
	}
	if (widget.modes.display.template) {
		fs.writeFileSync(path + "/" + widget.name + ".ftl", widget.modes.display.template);
	}
	if (widget.layoutName || widget.layoutRule) {
		var content = yaml.dump({
			layoutName: widget.layoutName || "",
			layoutRule: widget.layoutRule || "",
			parentWidgetName: widget.parentWidgetName || ""
		});
		fs.writeFileSync(path + "/" + widget.name + ".widget", content);
	}

}

var deleteFolderRecursive = function(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index) {
			var curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				if (file.indexOf(".layout") != -1) {
					//console.log(file);
				} else {
					fs.unlinkSync(curPath);
				}
			}
		});
	}
};