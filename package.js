var fs = require('fs');
var api = require("./api.js");
var async = require('async');
var config = require("./config.js");
var yaml = require('js-yaml');
var Client = require('ftp');
var moment = require('moment');
var request = require('request');
var yaml = require('js-yaml');

var appConfig={
	"git@code.dianpingoa.com:apple/shop-web.git":{
		name:"shop-web",
		warName:"shop-web-product-2.1.9.war",
		token:"i4_gpfPbFT3a6gzR2qYIcg"
	},
	"git@code.dianpingoa.com:info/dpindex-web.git":{
		name:"dpindex-web",
		warName:"dpindex-web-product-1.0.0.war",
		token:"NuiwJ93028TkYoYq2_5s5A"
	},
	"git@code.dianpingoa.com:shoppic/shoppic-web.git":{
		name:"shppic-web",
		warName:"shoppic-web-product-4.2.0.war",
		token:"ZQX33FnHpwk1Sw4l87fVgg"
	}
}

exports.pack = function(options, callback) {
	var app = appConfig[options.gitURL];
	var projectDir = options.projectDir;
	var tag=options.tag||'wizard';

	async.waterfall([
		function writeWidgetToLocal(cb) {
			var configFilePath = projectDir + "/src/main/resources/wizard.yaml";
			try{
				var wizardConfig=yaml.load(fs.readFileSync(configFilePath).toString())
				wizardConfig.mode='local';
				wizardConfig.modeChecker='off';
				fs.unlinkSync(configFilePath);
				fs.writeFileSync(configFilePath, yaml.dump(wizardConfig,{ident:4}));
				return cb(null);
			} catch(err){
				return cb(err);
			}
		},
		function packageWar(cb) {
			console.log("start mvn package...");
			var cp = require('child_process');
			var command = '/usr/local/maven/bin/mvn -s /usr/local/maven/conf/settings.xml package -Denv=product -DskipTests -f ' + projectDir + "/pom.xml";
			console.log(command);
			cp.exec(command,function(err, stdout, stderr) {
				if(err||stderr){
					console.log(stderr);
					return cb(new Error("mvn package error"))

				}
				console.log(stdout);
				return cb(null);
			});
		},
		function publishToFTP(cb) {
			console.log("prepare to push to FTP...");
			var client = new Client();
			client.on('ready', function() {
				console.log("connected");
				var localPath = projectDir + "/target/"+app.warName;
				var remotePath = "/product-"+app.name+"/wizard-"+moment().format('YYYY-MM-DD_hh-mm-ss');

				console.log("transfer:" + localPath + " to:" + remotePath);
				client.mkdir(remotePath, true, function(err) {
					if (err) return cb(err);
					console.log("begin putting file...")
					client.put(localPath, remotePath+"/"+app.warName, function(err) {
						if (err) throw err;
						client.end();
						console.log("transfer success");
						console.log("connection ended");
						var buttonTag = tag+"-" + moment().format('MM-DD_hh-mm-ss');
						return cb(null,buttonTag,remotePath+"/"+app.warName);
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
			var warUrls={};
			warUrls[app.name]=remotePath;
			request({
					url: "http://code.dianpingoa.com/api/v3/op/packing/edit",
					method: "get",
					qs: {
						"private_token": app.token,
						"module_names": app.name,
						"branch_name": "master",
						"tag": tag,
						"war_urls": JSON.stringify(warUrls)
					},
					headers: {
						"Content-type": "application/json"
					}

				}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
						console.log("register to button success")
						return cb(null)
					} else {
						return cb(error);
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