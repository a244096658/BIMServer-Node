var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var url = require('url');
var http = require('http');
var expressJwt = require('express-jwt');
var routes = require('./routes');
var api = require('./routes/api');
var flash = require('connect-flash');
var app = express();
var requirejs = require('requirejs');
var XMLHttpRequest = require("xhr2");

//BIMServer Dependencies
// var BimServerApiPromise = require('./bimServerJS/bimserverapipromise');
// var BimServerApiWebSocket = require('./bimServerJS/bimserverapiwebsocket');
var BimServerClient = require('./bimServerJS/bimserverclient');
// var ifc2x3 = require('./bimServerJS/ifc2x3tc1');
// var ifc4 = require('./bimServerJS/ifc4');
// var Model = require('./bimServerJS/model');
// var translations = require('./bimServerJS/translations_en');
// comment -1

app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
//app.use('/api', expressJwt({secret: 'secret-anne'}));
app.use(express.json());
app.use(express.urlencoded());
//for use with sessions
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());  // simulate DELETE and PUT
app.use(express.session({ cookie: { maxAge: 60000 }, secret: 'anne#'}));
// use flash messages
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname , '/public')));  // set the static files location /public/img will be /img for users

//app.use(express.static({root: path.join(__dirname, './public')}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//API Main Page
app.get('/', function(req,res,next){
  res.sendfile('./public/index.html');
});

// API BIMServer Login
app.get('/login', function(req,res){
  res.sendfile('./public/login.html')
});

app.post('/login', api.AuthInterface.login);


// API BIMServer createproject
app.get('/createProject', function(req,res){
  res.sendfile('./public/createProject.html');
});

app.post('/createProject', api.ServiceInterface.addProject);


//Server start
http.createServer(app).listen(app.get('port'), function(req,res){
  console.log('Express server listening on port ' + app.get('port'));
});


 