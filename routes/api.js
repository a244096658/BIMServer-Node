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


var AuthInterface = {
    login: function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        client.login(username, password, function() {
            var token = client.token
            console.log(client.token);
            res.redirect('/createProject'); // cilent has a property of token. which is assigned value during .login function.
            return next()
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
            //give user some response, so user will know they create project ok.
            res.send("ok!");
            return next()
        }, function(err) {
            console.log(err)
        });
    },
    getSuggestedDeserializerForExtension: function(req,res,next) {
      //Write Function Here
    }
    //more....
};

exports.AuthInterface = AuthInterface;
exports.ServiceInterface = ServiceInterface;
