var mosca = require('mosca')

//Set backend e.g:mosquitto, mongoDB for mosca.Here we set mosquitto as backend.
var pubsubsettings = {
  type: 'mqtt',
  json: false,
  mqtt: require('mqtt'),
  host: '127.0.0.1',
  port: 1883
};

var port=4000;
var moscaSettings = {
  //mosca (mqtt) port
  port: 1884,		
  backend: pubsubsettings,	
  //Retain the offline message in memory
  persistence: {
    factory: mosca.persistence.Memory
  },
  //port for WebSocket.
  http: {
    port: port,
    bundle: true,
    static: './'
  }

};


var server = new mosca.Server(moscaSettings);
//This code can also acheive offline/retain message. A .ldb file is created automatically.
// var db = new mosca.persistence.LevelUp({ path: "./mydb" });
// db.wire(server);

server.on('ready', setup);

server.on('clientConnected', function(client) {
	console.log('client connected', client.id);		
});

// fired when a message is received
server.on('published', function(packet, client) {
  console.log('Published', packet.topic, packet.payload.toString());
});

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running on port '+port)
};

 