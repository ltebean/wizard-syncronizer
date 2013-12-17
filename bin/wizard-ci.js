var express = require('express') ;
var http = require('http'); 
var util = require("util");
var Repo = require("../repo.js");

var syncronizer=require("./wizard-sync.js");

exports.serve=function(options){
	var port=options.port||3000;
	server.listen(port); 
	console.log("ci server listening on port: "+port);
}


var app=express();
app.configure(function () {
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(app.router);	
	app.use(function(err, req, res, next){
		res.send(500, { error: err.message});
	});
});

app.post('/ci/sync', function(req,res){
	syncronizer.sync({
    	widgetName:req.body.widgetName,
    	comment:req.body.comment,
    	env:req.body.env,
    	branch:req.body.branch
    });
    res.send(200);
}); 


var server=http.createServer(app);

