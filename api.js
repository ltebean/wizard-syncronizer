var request = require("request");
var config = require("./config.js");

function API(domain) {
	this.domain = domain;
}

API.prototype.login = function(name, password, cb) {
	var domain = this.domain;
	request({
			url: "http://" + domain + "/admin/api/user/login",
			method: "POST",
			body: JSON.stringify({
				"name": name,
				"password": password,
			}),
			headers: {
				"Content-type": "application/json"
			}

		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				cb(JSON.parse(body))
			} else {
				cb();
			}
		}

	)
};

API.prototype.commit = function(options, cb) {
	var domain = this.domain;
	var cookie=request.cookie("u=" + getUser().id);
	var jar = request.jar()
	jar.add(cookie)	
	request({
		url: "http://" + domain + "/admin/api/widget/commit",
		headers: {
			"Content-type": "application/json"
		},
		jar:jar,
		method: "POST",
		body: JSON.stringify(options)
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			cb(200)
		} else {
			cb(response.statusCode);
		}
	});
}


API.prototype.loadWidgetExtInfo = function(widgetName,cb) {
	var domain = this.domain;
	var cookie=request.cookie("u=" + getUser().id);
	var jar = request.jar()
	jar.add(cookie)
	
	request({
		url: "http://" + domain + "/admin/api/widget/"+widgetName+"/extInfo",
		headers: {
			"Content-type": "application/json"
		},
		jar:jar,
		method: "GET"
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			cb(JSON.parse(body))
		} else {
			cb(403);
		}
	});
}

API.prototype.createWidget = function(widgetExtInfo,cb) {
	var domain = this.domain;
	var cookie=request.cookie("u=" + getUser().id);
	var jar = request.jar()
	jar.add(cookie)
	
	request({
		url: "http://" + domain + "/admin/api/widget/extInfo",
		headers: {
			"Content-type": "application/json"
		},
		jar:jar,
		method: "POST",
		body: JSON.stringify(widgetExtInfo)
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			cb(200);
		} else {
			cb(403);
		}
	});
}


API.prototype.loadAllWidget = function(cb) {
	var domain = this.domain;
	var cookie=request.cookie("u=" + getUser().id);
	var jar = request.jar()
	jar.add(cookie)
	
	request({
		url: "http://" + domain + "/admin/api/widget",
		headers: {
			"Content-type": "application/json"
		},
		jar:jar,
		method: "GET"
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			cb(JSON.parse(body))
		} else {
			cb(403);
		}
	});
}

API.prototype.loadAllLayout = function(cb) {
	var domain = this.domain;
	var cookie=request.cookie("u=" + getUser().id);
	var jar = request.jar()
	jar.add(cookie)
	
	request({
		url: "http://" + domain + "/admin/api/layout",
		headers: {
			"Content-type": "application/json"
		},
		jar:jar,
		method: "GET"
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			cb(JSON.parse(body));
		} else {
			cb(403);
		}
	});
}


function getUser(){
	return config.loadConfig().user;
}

var apiPool = {
	alpha: new API("alpha.wizard.dp"),
	beta: new API("beta.wizard.dp"),
	pre: new API("ppe.wizard.dp"),
	product: new API("wizard.dp")
}

exports.getAPI=function(env){
	return apiPool[env];
}