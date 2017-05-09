var express = require('express');
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
app.get('/', function(req,res,next){res.render('pages/checkin')});
app.get('/login', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/login"]})});
app.get('/createProject', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/createProject"]})});
app.get('/createSubProject', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/createSubProject"]})});
app.get('/register', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/register"]})});
app.get('/getAllProjects', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/getAllProjects"]})});
app.get('/getAllUsers', function(req,res,next){res.render('pages/checkin',{moduleName:["../partials/getAllUsers"]})});
app.get('/addUserToProject', api.ServiceInterface.showUserAndProject);



// POST Requests
app.post('/login', api.AuthInterface.login);
app.post('/createProject', api.ServiceInterface.addProject);
app.post('/createSubProject', api.ServiceInterface.addProjectAsSubProject);
app.post('/register', api.ServiceInterface.addUserWithPassword );
app.post('/getAllProjects', api.ServiceInterface.getAllProjects);
app.post('/getAllUsers', api.ServiceInterface.getAllUsers ); 
app.post('/addUserToProject', api.ServiceInterface.addUserToProject );

//Server start
http.createServer(app).listen(app.get('port'), function(req,res){
  console.log('Express server listening on port ' + app.get('port'));
});
