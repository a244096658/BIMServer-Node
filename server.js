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
var BimServerClient = require('./bimServerJS/bimserverclient');

app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
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
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//set ejs.
app.set("view engine", 'ejs');
app.set('views', __dirname + '/views');

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// GET Requests
app.get('/', function(req,res,next){
  //res.sendfile('./public/index.html');
    res.render('home', {name:'ejs!'})
});
app.get('/login', function(req,res){
  res.sendfile('./public/login.html')
});
app.get('/createProject', function(req,res){
  res.sendfile('./public/createProject.html');
});

// POST Requests
app.post('/login', api.AuthInterface.login);
app.post('/createProject', api.ServiceInterface.addProject);

//Server start
http.createServer(app).listen(app.get('port'), function(req,res){
  console.log('Express server listening on port ' + app.get('port'));
});
