I2C1.setup({scl: 5, sda: 4});//bme280 pins

var bme;
var wifi = require("Wifi");

var server = "serv";
var options = {
    client_id: "bme280_sens",
    keep_alive: 60,
    port: 12345,
    clean_session: true,
    username: "user",
    password: "pass",
    protocol_name: "MQTT",
    protocol_level: 4
};

var mqtt = require("MQTT").create(server, options);

wifi.on('connected', function (details) {
    bme = require("BME280").connect(I2C1);
    mqtt.connect();
});

var id;

var tempOld;
var humOld;
var pressOld;

var tempCalibr = 0.0;
var humCalibr = 0.0;
var pressCalibr = 0.0;

var seaLevel = 1013;//default sea level pressure

mqtt.on('connected', function () {
    id = setInterval(function () {
        bme.readRawData();

        var temp_act = ((bme.calibration_T(bme.temp_raw) / 100.0) + tempCalibr).toFixed(2);
        var hum_act = ((bme.calibration_H(bme.hum_raw) / 1024.0) + humCalibr).toFixed(0);
        var press_act = ((bme.calibration_P(bme.pres_raw) / 100.0) + pressCalibr).toFixed(2);
        var alt_act = (44330.0 * (1.0 - Math.pow(press_act / seaLevel, 0.1903))).toFixed(2);

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

mqtt.on('disconnected', function () {
    clearInterval(id);
    digitalWrite(2, 0);//led indicator MQTT disconnected
    mqtt.connect();
});