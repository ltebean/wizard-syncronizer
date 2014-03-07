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

var app = express();
app.configure(function() {
	app.use(express.cookieParser());
	app.use(express.bodyParser());	
	app.use('/admin', express.static(__dirname + '/public'));
	app.use(app.router);
	app.use(function handleSync(req, res, next) {
		if(req.originalUrl.indexOf('/admin/api/sync')==-1){
			return next();
		}
		console.dir(req.path);
		var envs = ['alpha', 'beta', 'pre', 'product'];
		var url=req.originalUrl.replace("/admin/api/sync",'/admin/api');
		if(req.method=='POST'){
			async.eachSeries(envs, function(env,cb) {
				api[env].proxyPost(req.cookies.u,url,req.body,function(err,result){
					//console.log(env+":"+err)
					cb(err);
				})
			}, function done(err) {
				if(err){
					return res.send("error: "+err.message)
				}else{
					return res.send("success")
				}
			})				
		}else if(req.method=='GET'){
			async.eachSeries(envs, function(env,cb) {
				api[env].proxyGet(req.cookies.u,url,function(err,result){
					cb(err);
				})
			}, function done(err) {
				if(err){
					return res.send("error: "+err.message)
				}else{
					return res.send("success")
				}
			})			
		}	
	});
	app.use(function handleProxy(req, res, next) {
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

var server = http.createServer(app);
server.listen(3000);




