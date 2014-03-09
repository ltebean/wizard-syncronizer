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
		if(req.headers['x-sync']!='true'){
			return next();
		}	
		async.eachSeries(['alpha', 'beta', 'pre', 'product'], function(env,cb) {
			api[env].proxy(req,function(err,result){
				console.log(env+err)
				cb(err);
			})
		}, function done(err) {
			if(err){
				return res.send("error: "+err.message)
			}else{
				return res.send("success")
			}
		})						
	});
	app.use(function handleProxy(req, res, next) {
		var env=req.headers['x-env']||'alpha';
		//console.log(env)
		api[env].proxy(req,function(err,result){
			return res.send(result);
		})		
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




