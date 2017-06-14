var mosca = require('mosca')

//Set backend e.g:mosquitto, mongoDB for mosca.
var pubsubsettings = {
  type: 'mqtt',
  json: false,
  mqtt: require('mqtt'),
  host: '127.0.0.1',
  port: 1883
};

var moscaSettings = {
  port: 1884,			//mosca (mqtt) port
  backend: pubsubsettings,	//pubsubsettings is the object we created above
  //Retain the offline message in memory
  persistence: {
    factory: mosca.persistence.Memory
  },
  http: {
    port: 3000,
    bundle: true,
    static: './'
  }

};


var server = new mosca.Server(moscaSettings);
//This code can acheive offline/retain message. A .ldb file is created automatically.
// var db = new mosca.persistence.LevelUp({ path: "./mydb" });
// db.wire(server);

server.on('ready', setup);

server.on('clientConnected', function(client) {
	console.log('client connected', client.id);		
});

// fired when a message is received
server.on('published', function(packet, client) {
  console.log('Published', packet.topic, packet.payload);
});

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running')
};

// for(var key in mosca.persistence){
//   console.log(key);

// };

// console.log(mosca.persistence.getFactory());