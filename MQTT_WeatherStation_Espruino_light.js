var wifi = require("Wifi");

I2C1.setup({ scl: 5, sda: 4 });//bme280 pins

var bme;
var server = "server";
var options = {
    //client_id: "bme280_sens",
    //keep_alive: 60,
    port: port,
    //clean_session: true,
    username: "user",
    password: "pass"
    //protocol_name: "MQTT",
    //protocol_level: 4
};

//var mqtt = require("MQTT").create(server, options);
var mqtt = require("https://github.com/olliephillips/tinyMQTT/blob/master/tinyMQTT.min.js").create(server, options);

wifi.on('connected', function (details) {
    bme = require("BME280").connect(I2C1);
    mqtt.connect();

});

var id;

var tempOld;
var humOld;
var pressOld;

var temp_act;
var hum_act;
var press_act;
var alt_act;

var tempCalibr = -3.0;
var humCalibr = 11.0;
var pressCalibr = 0.0;

var seaLevelPressure = 101325;//default sea level pressure

mqtt.on('connected', function () {
    mqtt.subscribe("outdoor/sensors/bme280_getState");
    //mqtt.subscribe("outdoor/sensors/bme280_getIp");

    id = setInterval(function () {
        bme.readRawData();

        temp_act = ((bme.calibration_T(bme.temp_raw) / 100.0) + tempCalibr).toFixed(2);
        hum_act = ((bme.calibration_H(bme.hum_raw) / 1024.0) + humCalibr).toFixed(0);
        press_act = ((bme.calibration_P(bme.pres_raw) / 100.0) + pressCalibr).toFixed(2);
        alt_act = (1000.0 * (seaLevelPressure - (press_act * 100)) / 3386.3752577878).toFixed(2);

        if (temp_act != tempOld) {
            mqtt.publish("outdoor/sensors/bme280_temp", temp_act);
            tempOld = temp_act;
        }
        if (hum_act != humOld) {
            mqtt.publish("outdoor/sensors/bme280_hum", hum_act);
            humOld = hum_act;
        }
        if (press_act != pressOld) {
            mqtt.publish("outdoor/sensors/bme280_press", press_act);
            mqtt.publish("outdoor/sensors/bme280_alt", alt_act);
            pressOld = press_act;
        }

        digitalPulse(2, 0, [60, 60, 60]);//led indicator MQTT transmit

    }, 4000);
});

mqtt.on('message', function (pub) {
    if (pub.topic == "outdoor/sensors/bme280_getState" && pub.message == "1") {
        mqtt.publish("outdoor/sensors/bme280_temp", temp_act);
        mqtt.publish("outdoor/sensors/bme280_hum", hum_act);
        mqtt.publish("outdoor/sensors/bme280_press", press_act);
        mqtt.publish("outdoor/sensors/bme280_alt", alt_act);
    }

    /*if (pub.topic == "outdoor/sensors/bme280_timeNow" && pub.message == "1") {
        mqtt.publish("outdoor/sensors/bme280_temp", timeNow);
    }*/
});

mqtt.on('disconnected', function () {
    clearInterval(id);
    digitalWrite(2, 0);//led indicator MQTT disconnected
    mqtt.connect();
});