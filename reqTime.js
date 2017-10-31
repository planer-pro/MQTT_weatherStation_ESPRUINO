var http = require("http");

//var timeURL = 'http://api.timezonedb.com/v2/get-time-zone?format=json&by=zone&zone=Europe/Minsk&key=5CZHRPQ83HOC';
var timeURL = 'http://api.ipify.org/';

setInterval(function () {
    http.get(timeURL, function (res) {
        res.on('data', function (data) {
            /*var timeNow = JSON.parse(data);
            timeNow = "" + timeNow.formatted;*/
            console.log(data);
        });
    }).on('error', function () {
        console.log("no inet");
    });
}, 2000);