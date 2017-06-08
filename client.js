var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://127.0.0.1:1884')//mqtt://test.mosquitto.org

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