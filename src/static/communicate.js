let sendData = function() {
	console.log("in sendData");
	socket.emit("readyToStart", 42)
};