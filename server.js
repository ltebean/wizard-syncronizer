 var Client = require('ftp');
  var fs = require('fs');

  var c = new Client();
  c.on('ready', function() {
  	console.log("ready");
    c.put('/product-shop-web/', 'foo.remote-copy.txt', function(err) {
      if (err) throw err;
      c.end();
    });
  });
  // connect to localhost:21 as anonymous
  c.connect({
  	host:"10.1.1.81",
  	user:"qaupload",
  	password:"uploadwar"
  });