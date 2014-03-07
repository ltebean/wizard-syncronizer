var express = require('express');
var http = require('http');
var util = require("util");
var Repo = require("./repo.js");
var async = require("async");
var syncronizer = require("./bin/wizard-sync.js");
var config = require("./config.js");
var api = require("./api.js");
var request=require('request');

var user = config.loadConfig().user;
var envs = ['alpha', 'beta', 'pre', 'product'];

var app = express();
app.configure(function() {
	app.use(express.cookieParser());
	app.use(express.bodyParser());	
	app.use('/admin', express.static(__dirname + '/public'));
	app.use(app.router);
	app.use(function(req, res, next) {
		var env=req.headers['x-env']||'alpha'
		//console.log(env)
		if(req.method=='POST'){
			api[env].proxyPost(req.cookies.u,req.originalUrl,req.body,function(err,result){
				return res.send(result);
			})
		}else if(req.method=='GET'){
			api[env].proxyGet(req.cookies.u,req.originalUrl,function(err,result){
				return res.send(result);
			})
		}
	});

});

app.get('/',function (req,res){
	res.sendfile(__dirname+'/public/index.html')
})

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

//create widget
app.post('/admin/api/sync/widget/extinfo', function(req, res) {
	async.eachSeries(envs, function(env,cb) {
		api[env].createWidget(req.body, function(err) {
			cb(err);
		})
	}, function done(err) {
		if(err){
			return res.send("error: "+err.message)
		}else{
			return res.send("create "+req.body.name+" success" )
		}
	})
});

//update widget extInfo
app.post('/admin/api/sync/widget/:widgetName/extinfo', function(req, res) {
	async.eachSeries(envs, function(env,cb) {
		api[env].updateWidgetExtInfo(req.body, function(err) {
			cb(err);
		})
	}, function done(err) {
		if(err){
			return res.send("error: "+err.message)
		}else{
			return res.send("update "+req.body.name+" success" )
		}
	})
});

//delete widget
app.post('/admin/api/sync/widget/:widgetName/delete', function(req, res) {
	async.eachSeries(envs, function(env,cb) {
		api[env].deleteWidget(req.params.widgetName, function(err) {
			cb(err);
		})
	}, function done(err) {
		if(err){
			return res.send("error: "+err.message)
		}else{
			return res.send("delete "+req.params.widgetName+" success" )
		}
	})
});

//create layout
app.post('/admin/api/sync/layout/extInfo', function(req, res) {
	async.eachSeries(envs, function(env,cb) {
		api[env].createLayout(req.body, function(err) {
			cb(err);
		})
	}, function done(err) {
		if(err){
			return res.send("error: "+err.message)
		}else{
			return res.send("create "+req.body.name+" success" )
		}
	})
});


//update layout extInfo
app.post('/admin/api/sync/layout/:layoutName/extInfo', function(req, res) {
	async.eachSeries(envs, function(env,cb) {
		api[env].updateLayoutExtInfo(req.body, function(err) {
			cb(err);
		})
	}, function done(err) {
		if(err){
			return res.send("error: "+err.message)
		}else{
			return res.send("create "+req.body.name+" success" )
		}
	})
});

//delete layout
app.post('/admin/api/sync/layout/:layoutName/delete', function(req, res) {
	async.eachSeries(envs, function(env,cb) {
		api[env].deleteLayout(req.params.layoutName, function(err) {
			cb(err);
		})
	}, function done(err) {
		if(err){
			return res.send("error: "+err.message)
		}else{
			return res.send("delete "+req.params.layoutName+" success")
		}
	})
});


var server = http.createServer(app);
server.listen(3000);




