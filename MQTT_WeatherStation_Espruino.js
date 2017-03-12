I2C1.setup({scl: 5, sda: 4});

var bme = require("BME280").connect(I2C1);
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
    protocol_level: 4,
};

var mqtt = require("MQTT").create(server, options);

wifi.on('connected', function (details) {
    mqtt.connect();
});

var id;

mqtt.on('connected', function () {
    id = setInterval(function () {
        bme.readRawData();

        var temp_cal = bme.calibration_T(bme.temp_raw);
        var press_cal = bme.calibration_P(bme.pres_raw);
        var hum_cal = bme.calibration_H(bme.hum_raw);
        var temp_act = temp_cal / 100.0;
        var press_act = press_cal / 100.0;
        var hum_act = hum_cal / 1024.0;
        //var alt_act = press_act * 0.75;//wrong calculate

        mqtt.publish("outdoor/sensors/bme280_temp", temp_act);
        mqtt.publish("outdoor/sensors/bme280_hum", hum_act);
        mqtt.publish("outdoor/sensors/bme280_press", press_act);
    }, 2000);
});

mqtt.on('disconnected', function () {
    clearInterval(id);
    mqtt.connect();
});