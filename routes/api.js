var async = require('async');
var util = require('util');
var request = require('request');
var fs = require('fs');
var path = require('path');
var url = require('url');
var http = require('http');
var requirejs = require('requirejs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var BimServerClient = require('../bimServerJS/bimserverclient');
var flash = require('connect-flash');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); // the session is stored in a cookie, so we use this to parse it

// BIM Server Client Connection
var address = 'http://localhost:8082'
var client = new BimServerClient(address);

// use flash and session. 
app.use(express.cookieParser());
app.use(express.session({ cookie: { maxAge: 60000 }, secret: 'anne#'}));
app.use(flash());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// parse application/json
app.use(bodyParser.json());
//set ejs.
app.set("view engine", 'ejs');
app.set('views', __dirname + '/views');

//Global variables for storing data from BIMServer
var projectId=0;
var allProjects=[];
var subProjects=[];
var allUsers=[];

var AuthInterface = {
    login: function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        client.login(username, password, function() {
            console.log(client.token);
            //req.flash('info', 'Login successfully!');
            //res.redirect('/getAllProjects');//Redirect to another page when user successfully login.
            //res.end();
            return next(); //when login ok,callback run then goes to next() function so it is getloggedinuser. That is next() refer to getloggedinuser(), so getloggedinuser() become in the callback and the login() and getloggedinuser(). so they chain up.
        }, function(err) {
            console.log(err);
            req.flash('error', JSON.stringify(err));
            res.redirect('/login');
        })//,next();
    },

    getLoggedInUser: function(req, res, next) {
        // var username = req.body.username;
        // var password = req.body.password;
        client.call('AuthInterface', 'getLoggedInUser',{ },function(data) {
            console.log(data.userType);
            req.flash('info', JSON.stringify({"success":"Login successfully!" , "userType":data.userType}));//flash only accept string.
            res.redirect('/');//Redirect to another page when user successfully login.
            //res.end();
            //return next()
        }, function(err) {
            console.log(err);
            req.flash('error', JSON.stringify(err));
            res.redirect('/login');
        })
    }


    
};


var ServiceInterface = {
    addProject: function(req, res, next) {
        var projectName = req.body.projectName;
        var schema = req.body.schema;
        client.call('ServiceInterface', 'addProject', {
            projectName: projectName,
            schema: schema
        }, function(data) {
            console.log(data); // the return data from bimsever is json type.
            projectId = data.oid;
             //res.end();
            //return next()
        }, function(err) {
            console.log(err)
        });
    },

    addProjectAsSubProject:function(req, res, next) {
        var projectName = req.body.projectName;
        var schema = req.body.schema;
        client.call('ServiceInterface', 'addProjectAsSubProject', {
            projectName: projectName,
            parentPoid:projectId,
            schema: schema
        }, function(data) {
            console.log(data); // the return data from bimsever is json type.
             //res.end();
            //return next()
        }, function(err) {
            console.log(err)
        });
    },

    getAllProjects:function(req, res, next) {
        client.call('ServiceInterface', 'getAllProjects', {
            onlyTopLevel: "true",//true for get main projects, false for get all projects.
            onlyActive: "false"
        }, function(data) {
            console.log(data); // the return data from bimsever is Array[] including json type element.
            allProjects=data;
            res.render('pages/checkin',{projects:data,moduleName:["../partials/getAllProjects"]});
             //res.end();
            //return next()
        }, function(err) {
            console.log(err)
        });
    },

    getSubProjects:function(req, res, next) {
        client.call('ServiceInterface', 'getSubProjects', {
            poid:req.body.poid
        }, function(data) {
            console.log(data); // the return data from bimsever is Array[] including json type element.
            subProjects=data;
            res.render('pages/checkin',{subProjects:data,moduleName:["../partials/getSubProjects"]});
             //res.end();
            //return next()
        }, function(err) {
            console.log(err)
        });
    },

    addUserWithPassword:function(req, res, next) {
        client.call('ServiceInterface', 'addUserWithPassword', {
            username:req.body.username,
            password:req.body.password,
            name:req.body.name,
            type:req.body.type,
            selfRegistration:req.body.selfRegistration,
            resetUrl:req.body.resetUrl
        }, function(data) {
            console.log(data); // the return data from bimsever is json type.
            res.send("Register successfully!");
             //res.end();
            //return next()
        }, function(err) {
            console.log(err);
        });
    },

    getAllUsers:function(req, res, next) {
        client.call('ServiceInterface', 'getAllUsers', {
   
        }, function(data) {
            console.log(data); // the return data from bimsever is Array[] including json type element.
            res.render('pages/checkin',{users:data,moduleName:["../partials/getAllUsers"]});
            allUsers=data;
             //res.end();
            //return next()
        }, function(err) {
            console.log(err);
        });
    },

    addUserToProject:function(req, res, next) {
        client.call('ServiceInterface', 'addUserToProject', {
            uoid:req.body.uoid,
            poid:req.body.poid
        }, function(data) {
            console.log(data); // the return data from bimsever is json type.
             //res.end();
            //return next()
        }, function(err) {
            console.log(err);
        });
    },

    showUserAndProject:function(req, res, next) {
        res.render('pages/checkin',{users:allUsers,projects:allProjects,moduleName:["../partials/getAllProjects","../partials/getAllUsers","../partials/addUserToProject"]});
    },//This is user-defined for show users and projects. 

    showProjectsAndSubProjects:function(req, res, next) {
        res.render('pages/checkin',{projects:allProjects,subProjects:subProjects,moduleName:["../partials/getAllProjects","../partials/getSubProjects"]});
    },//This is user-defined for show projects and subproject form. 

    getSuggestedDeserializerForExtension: function(req,res,next) {
      //Write Function Here
    }
    //more....
};


exports.AuthInterface = AuthInterface;
exports.ServiceInterface = ServiceInterface;
