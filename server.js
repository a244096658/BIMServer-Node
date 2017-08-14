var express = require('express');
//var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var path = require('path');
var url = require('url');
var http = require('http');
var expressJwt = require('express-jwt');
var api = require('./routes/api');
var flash = require('connect-flash');
var app = express();
var requirejs = require('requirejs');
var XMLHttpRequest = require("xhr2");
var session = require('express-session');
var cookieParser = require('cookie-parser'); // the session is stored in a cookie, so we use this to parse it
var BimServerClient = require('./bimServerJS/bimserverclient');
var base64 = require('file-base64');
var mosca = require('mosca');

app.set('port', process.env.PORT || 4000);
//app.use(timeout timeout(600000));
// use flash and session.
app.use(express.cookieParser());
app.use(express.session({ cookie: { maxAge: 60000 }, secret: 'anne#'}));
app.use(flash());
//
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());  // simulate DELETE and PUT
app.use(app.router);
app.use(express.static(path.join(__dirname,'./public')));   // set the static files location /public/img will be /img for users.__dirname is D:\GitLibrary\BIMServer_Node\BIMServer-Node\
//app.use(fileUpload());
// use bodyparser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//set ejs.
app.set("view engine", 'ejs');
app.set('views', __dirname + '/views');
//Use fileupload from client side.

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
//Mosca setting
var moscaSettings = {
  //mosca (mqtt) port
  port: 1884,		
  //backend: pubsubsettings,	
  //Retain the offline message in memory
  persistence: {
    factory: mosca.persistence.Memory
  }
};

// GET Requests
app.get('/', function(req,res,next){
  res.render('pages/checkin',{message:req.flash('info'),messageUserType:req.session.userType});
//  req.session.userType=null;
});
app.get('/login', function(req,res,next){
  res.render('pages/mainLogin',{moduleName:["../partials/login"],message: req.flash('error')});
});
app.get('/createProject', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/createProject"],messageUserType:req.session.userType})});
app.get('/createSubProject', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/createSubProject"],messageUserType:req.session.userType})});
app.get('/register', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/register"],messageUserType:req.session.userType})});
app.get('/getAllProjects', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/getAllProjects"],messageUserType:req.session.userType })});
app.get('/getSubProjects', api.ServiceInterface.showProjectsAndSubProjects);
app.get('/getAllUsers', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/getAllUsers"],messageUserType:req.session.userType})});
app.get('/addUserToProject', api.ServiceInterface.showUserAndProject);
app.get('/getUsersProjects', function(req,res,next){
  res.render('pages/checkin',{moduleName:["../partials/getUsersProjects"],messageUserType:req.session.userType});
});
app.get('/checkin', function(req,res,next){
  res.render('pages/checkin',{moduleName:["../partials/checkin"],messageUserType:req.session.userType});
});
app.get('/getRevisionSummary', function(req,res,next){
  res.render('pages/checkin',{moduleName:["../partials/getRevisionSummary"],messageUserType:req.session.userType});
});



// POST Requests
app.post('/login', api.AuthInterface.login,api.AuthInterface.getLoggedInUser);
app.post('/createProject', api.ServiceInterface.addProject);
app.post('/createSubProject', api.ServiceInterface.addProjectAsSubProject);
app.post('/register', api.ServiceInterface.addUserWithPassword );
app.post('/getAllProjects', api.ServiceInterface.getAllProjects);
app.post('/getSubProjects', api.ServiceInterface.getSubProjects);
app.post('/getAllUsers', api.ServiceInterface.getAllUsers );
app.post('/addUserToProject', api.ServiceInterface.addUserToProject );
app.post('/getUsersProjects', api.ServiceInterface.getUsersProjects);
app.post('/checkin', api.ServiceInterface.getSuggestedDeserializerForExtension,api.ServiceInterface.checkin);
app.post('/getRevisionSummary', api.ServiceInterface.getAllRevisionsOfProject,api.ServiceInterface.getProjectByPoid,api.ServiceInterface.getRevisionSummary,api.PluginInterface.getSerializerByPluginClassName,api.ServiceInterface.download,api.ServiceInterface.downloadServlet,api.NotificationRegistryInterface.getProgress,api.Neo4j.batchMerge3,api.Neo4j.batchLabel,api.Neo4j.batchRel,api.ServiceInterface.cleanupLongAction);//

//create http server
var server = http.createServer(app);
//create mosca server 
var moscaServer = new mosca.Server(moscaSettings);
//Attach moscaServer onto httpServer
moscaServer.attachHttpServer(server);
//mosca server config
moscaServer.on('ready', setup);

moscaServer.on('clientConnected', function(client) {
	console.log('client connected', client.id);		
});
// fired when a message is received
moscaServer.on('published', function(packet, client) {
  console.log('Published', packet.topic, packet.payload.toString());
});
// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running on port '+'4000');
};


//http server config
server.setTimeout(600*1000);//unit is ms. 1s = 1000ms
server.listen(app.get('port'), function(req,res){
  console.log('Express server listening on port ' + app.get('port'));
});


