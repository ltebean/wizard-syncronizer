var express = require('express');
var http = require('http');
var util = require("util");
var Repo = require("../repo.js");
var async = require("async");
var syncronizer = require("./wizard-sync.js");
var config = require("../config.js");
var API = require("../api.js");

var user = config.loadConfig().user;

exports.serve = function(options) {
	var port = options.port || 3000;
	server.listen(port);
	console.log("ci server listening on port: " + port);
}


var app = express();
app.configure(function() {
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(function(err, req, res, next) {
		res.send(500, {
			error: err.message
		});
	});
});

app.post('/admin/ci/sync', function(req, res) {
	syncronizer.sync({
		widgetName: req.body.widgetName,
		comment: req.body.comment,
		env: req.body.env,
		branch: req.body.branch,
		clearCache: req.body.clearCache,
		appNames: req.body.appNames || "all"
	}, function(msg) {
		res.send({
			"msg": msg
		});
	});
});

app.post('/admin/ci/sync/widgetExtInfo', function(req, res) {
	var envs = ['alpha', 'beta', 'pre', 'product'];
	var info = "";
	async.eachSeries(envs, function(env,cb) {
		API.getAPI(env).createWidget(req.body, function(err) {
			if (err) {
				info += env + ":failed \n"
			} else {
				info += env + ":success \n"
			}
			cb(null);
		})
	}, function(err) {
		res.send(info)
	})
});


var server = http.createServer(app);