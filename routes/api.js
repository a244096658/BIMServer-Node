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
var fileUpload = require('express-fileupload');
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
//Use fileupload from client side.
app.use(fileUpload());

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
            return next(); //when login ok,callback run then goes to next() function so it is getloggedinuser. That is next() refer to getloggedinuser(), so getloggedinuser() become in the callback and the login() and getloggedinuser(). so they chain up.
        }, function(err) {
            console.log(err);
            req.flash('error', JSON.stringify(err));
            res.redirect('/login');
        })//,next();
    },

    getLoggedInUser: function(req, res, next) {
        client.call('AuthInterface', 'getLoggedInUser',{ },function(data) {
            req.flash('info', "Welcome "+ data.name +", login successfully!");//flash for pass login info. flash only accept string but become an array. Thus, req.flash('info') is an array.
            req.session.userType=data.userType;//Session for pass userType
            req.session.uoid = data.oid;//Session for pass userId
            res.redirect('/');//Redirect to another page when user successfully login.
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
            res.render('pages/checkin',{projects:data,moduleName:["../partials/getAllProjects"],messageUserType:req.session.userType});
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
            res.render('pages/checkin',{subProjects:data,moduleName:["../partials/getSubProjects"],messageUserType:req.session.userType});
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
            res.render('pages/checkin',{users:data,moduleName:["../partials/getAllUsers"],messageUserType:req.session.userType});
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
        res.render('pages/checkin',{users:allUsers,projects:allProjects,moduleName:["../partials/getAllProjects","../partials/getAllUsers","../partials/addUserToProject"],messageUserType:req.session.userType});
    },//This is user-defined for show users and projects.

    showProjectsAndSubProjects:function(req, res, next) {
        res.render('pages/checkin',{projects:allProjects,subProjects:subProjects,moduleName:["../partials/getAllProjects","../partials/getSubProjects"],messageUserType:req.session.userType});
    },//This is user-defined for show projects and subproject form.

    getUsersProjects:function(req, res, next) {
        client.call('ServiceInterface', 'getUsersProjects', {
            uoid:req.session.uoid
        }, function(data) {
            console.log(data); // the return data from bimsever is Array[] including json type element.
            //var userProjects=data;
            res.render('pages/checkin',{userProjects:data,moduleName:["../partials/getUsersProjects"],messageUserType:req.session.userType});
             //res.end();
            //return next()
        }, function(err) {
            console.log(err)
        });
    },

    getSuggestedDeserializerForExtension: function(req, res, next) {
        client.call('ServiceInterface', 'getSuggestedDeserializerForExtension', {   
            extension:"ifc",//file.extension,
            poid:req.body.poid
        }, function(data) {
            console.log(data); // the return data from bimsever is Array[] including json type element.
            var deserializerOid = data.oid;
            return next();
        }, function(err) {
            console.log(err)
        });
    },


    checkin:function(req, res, next) {
        // var stats = fs.statSync(path.parse(req.body.file));
        // var readFile=fs.readFileSync(path.parse(req.body.file));
        
        console.log(req.files.IFCfile.data);

        // client.call('ServiceInterface', 'checkin', {
        //     poid:req.body.poid,
        //     comment:req.body.comment,
        //     deserializerOid:deserializerOid,
        //     fileSize:stats.size,//This three processed in server by just file address passed in . 
        //     fileName:path.parse(req.body.file).name,
        //     data:new Buffer(readFile).toString('base64'),//calculate the file base64.
        //     merge:req.body.merge,
        //     sync:req.body.sync
        // }, function(data) {
        //     console.log(data); // the return data from bimsever is Array[] including json type element.
           
        // }, function(err) {
        //     console.log(err)
        // });
    }


};


exports.AuthInterface = AuthInterface;
exports.ServiceInterface = ServiceInterface;
