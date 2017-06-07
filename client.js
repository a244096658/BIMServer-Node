var mqtt = require('mqtt')
var client  = mqtt.connect('tcp://broker.mqttdashboard.com:1883')//mqtt://test.mosquitto.org

client.on('connect', function () {
  client.subscribe('myHome/temperature')
  //client.publish('presence', 'Hello liuxi mqtt')
})
 


client.on('message', function (topic, message) {
  // message is Buffer
  //console.log(topic); 
  console.log(message.toString());
  //console.log(message);
  //client.end()
})