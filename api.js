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
				return cb(null,JSON.parse(body))
			} else {
				return cb(new Error(response.statusCode),null);
			}
		}

	)
};

API.prototype.commitWidget = function(options, cb) {
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
			return cb(null,null)
		} else {
			return cb(new Error(response.statusCode),null);
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
			return cb(null,JSON.parse(body))
		} else {
			return cb(new Error(response.statusCode),null);
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
			return cb(null,JSON.parse(body))
		} else {
			return cb(new Error(response.statusCode),null);
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
			return cb(null,JSON.parse(body));
		} else {
			return cb(new Error(response.statusCode),null);
		}
	});
}

API.prototype.proxy=function(req,cb){
	var domain = this.domain;
	var cookie=request.cookie("u=" + req.cookies.u);
	var jar = request.jar()
	jar.add(cookie)
	
	request({
		url: "http://" + domain + req.originalUrl,
		headers: {
			"Content-type": "application/json"
		},
		jar:jar,
		method: req.method,
		body: JSON.stringify(req.body)
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			return cb(null,body);
		} else {
			return cb(new Error(response.statusCode),null);
		}
	});
}


function getUser(){
	return config.loadConfig().user;
}

module.exports = {
	alpha: new API("alpha.wizard.dp"),
	beta: new API("beta.wizard.dp"),
	pre: new API("ppe.wizard.dp"),
	product: new API("wizard.dp")
}
