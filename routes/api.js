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


// BIM Server Client Connection
var address = 'http://localhost:8082'
var client = new BimServerClient(address);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}))
// parse application/json
app.use(bodyParser.json())
//set ejs.
app.set("view engine", 'ejs');
app.set('views', __dirname + '/views');

//Global variables for storing data from BIMServer
var projectId=0;
var allProjects=[];
var allUsers=[];


var AuthInterface = {
    login: function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        client.login(username, password, function() {
            console.log(client.token);
            //res.end();
            //return next()
        }, function(err) {
            console.log(err);
        })
    }
    //more...
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
            onlyTopLevel: "false",
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

    getSuggestedDeserializerForExtension: function(req,res,next) {
      //Write Function Here
    }
    //more....
};


exports.AuthInterface = AuthInterface;
exports.ServiceInterface = ServiceInterface;
