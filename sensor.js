var mqtt = require('mqtt')
var client  = mqtt.connect('tcp://broker.mqttdashboard.com:1883')//mqtt://test.mosquitto.org
var async = require('async');
 


var count = 0;

async.whilst(
    function () { return count < 100; },
    function (callback) {
        count++;
        setTimeout(function () {
            callback(null, count);
        }, 1000);
        console.log('test');
        var temperature = (Math.random()*30).toFixed(2);
        //Number is not accepted. String is accept. (Json, xml may also ok)
        client.publish('myHome/temperature', temperature.toString());

    },
    function (err, n) {
        // 5 seconds have passed, n = 5
    }
);
//client.end(); 



 