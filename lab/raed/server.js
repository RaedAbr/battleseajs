let http = require('http');
let fs = require('fs');
let url = require("url");

// Chargement du fichier index.html affiché au client
let server = http.createServer(function(req, res) {
	let pathname = url.parse(req.url).pathname;
	console.log("Request for " + pathname + " received.");

	if (pathname === "/") {
		fs.readFile('./index.html', 'utf-8', function(error, content) {
			res.writeHead(200, {"Content-Type": "text/html"});
			res.end(content);
		});
	}
	else if (pathname === "/script.js") {
		fs.readFile('./script.js', 'utf-8', function(error, content) {
			res.writeHead(200, {"Content-Type": "text/javascript"});
			res.end(content);
		});
	}
  // Chrome automatically sends a requests for favicons
  // Looks like https://code.google.com/p/chromium/issues/detail?id=39402 isn't
  // fixed or this is a regression.
  if(req.url.indexOf('favicon.ico') != -1) {
    res.statusCode = 404
    return
  }
	
});

// Chargement de socket.io
let io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket, message) {

	// Dès qu'on reçoit un "message" (clic sur le bouton), on le note dans la console
	socket.on('message', function (message) {
		console.log(message);
		socket.broadcast.emit('message', message);
	});
	
});


server.listen(8080);