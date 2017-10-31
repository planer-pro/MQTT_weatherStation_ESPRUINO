var mqtt = require("https://github.com/olliephillips/tinyMQTT/blob/master/tinyMQTT.min.js").create(server, {
	username: "username",
	password: "password",
	port: 8883
});

wifi.on('connected', function (details) {
    mqtt.connect();
});

mqtt.on("connected", function(){
	mqtt.subscribe("espruino/test");
});

mqtt.on("message", function(msg){
	console.log(msg.topic);
	console.log(msg.message);
});

mqtt.on("published", function(){
	console.log("message sent");
});

mqtt.on("disconnected", function(){
    console.log("disconnected");
    mqtt.connect();
});