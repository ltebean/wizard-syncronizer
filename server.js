 var Client = require('ftp');
  var fs = require('fs');

  var c = new Client({
  	host:"10.1.1.81"
  });
  c.on('ready', function() {
  	console.log("ready");
    c.put('foo.txt', 'foo.remote-copy.txt', function(err) {
      if (err) throw err;
      c.end();
    });
  });
  // connect to localhost:21 as anonymous
  c.connect();