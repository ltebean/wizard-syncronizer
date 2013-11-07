var request = require("request");

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

API.prototype.commit = function(user, widget, comment, cb) {
	var domain = this.domain;
	var cookie=request.cookie("u=" + user.id);
	var jar = request.jar()
	jar.add(cookie)
	var content = {
		widget: widget,
		comment: comment
	}
	request({
		url: "http://" + domain + "/admin/api/widget/commit",
		headers: {
			"Content-type": "application/json"
		},
		jar:jar,
		method: "POST",
		body: JSON.stringify(content)
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			cb(200)
		} else {
			cb(403);
		}
	});
}

exports = module.exports = API;