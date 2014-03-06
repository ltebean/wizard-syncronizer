var Repo = require("../repo.js");
var api = require("../api.js");
var config = require("../config.js");

var conf = config.loadConfig();


exports.login = function(options) {
	var env = options.env;
	var name = options.username;
	var password = options.password;
	if (!env) {
		console.log("you must specify the env {alpha|beta|product}");
		return;
	}
	if (!name || !password) {
		console.log("name or password cannot be null");
		return;
	}
	console.log("login...")
	api[env].login(name, password, function(err,user) {
		if(err){
			console.log("login failed:"+err.message);
			return;
		}
		if (!user) {
			console.log("login failed");
			return;
		} 
		conf.user = user
		config.saveConfig(conf);
		console.log("login success");
	});
}