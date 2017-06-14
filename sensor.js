var mqtt = require('mqtt')
//NB:Change ip when sensor is from cloud;
var client  = mqtt.connect('mqtt://127.0.0.1:1884')//mqtt://test.mosquitto.org
var async = require('async');
 


var count = 0;

async.whilst(
    function () { return count < 100; },
    function (callback) {
        count++;
        setTimeout(function () {
            callback(null, count);
        }, 2000);
        var temperature = (Math.random()*60).toFixed(2);
        //Number is not accepted. String is accept. (Json, xml may also ok)
        client.publish('myHome/temperature', temperature.toString(),{qos:1,retain:true});
        console.log("temperature: "+temperature);

    },
    function (err, n) {
        // 5 seconds have passed, n = 5
    }
);
//client.end(); 



 