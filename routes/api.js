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
var base64 = require('file-base64');
var needle = require('needle');
var async = require('async');
var app = express();
var BimServerClient = require('../bimServerJS/bimserverclient');
var BIMServerConfigure=require('../configure/BIMServerConfigure');
var IFCparameterMapping = BIMServerConfigure.IFCparameterMapping;
var flash = require('connect-flash');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); // the session is stored in a cookie, so we use this to parse it
var ProgressBar = require('progress');
var https = require('https');
var neo4j = require("neo4j-driver").v1;
// Change the password if needed
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "250daowohao"));
var session = driver.session();

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
app.use(express.static(path.join(__dirname,'../public'))); //Must use path.join()
//app.use(fileUpload());
//set ejs.
app.set("view engine", 'ejs');
app.set('views', __dirname + '/views');//May be wrong.
//Use fileupload from client side.

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
        //var IFCfile = req.files.IFCfile.data;
        console.log(req.files);
        fs.readFile(req.files.IFCfile.path, function(err,data){
            var uploadPath = path.join(__dirname,'../public',req.files.IFCfile.name);
            fs.writeFile(uploadPath,data,function(err){
                console.log(err);
            })
        })
        client.call('ServiceInterface', 'getSuggestedDeserializerForExtension', {
            extension:"ifc",//file.extension,
            poid:req.body.poid
        }, function(data) {
            console.log(data); // the return data from bimsever is Array[] including json type element.
            res.locals.deserializerOid = data.oid;
            return next();
        }, function(err) {
            console.log(err)
        });
    },

    checkin:function(req, res, next) {
        base64.encode(path.join(__dirname,'../public',req.files.IFCfile.name), function(err, base64String) {
            client.call('ServiceInterface', 'checkin', {
                poid:req.body.poid,
                comment:req.body.comment,
                deserializerOid: res.locals.deserializerOid,
                fileSize:req.files.IFCfile.size,//This three processed in server by just file address passed in .
                fileName:req.files.IFCfile.name,
                data:base64String,//calculate the file base64.
                merge:req.body.merge,
                sync:req.body.sync
            }, function(data) {
                console.log('checkin result: '+data); // the return data from bimsever is a topicId

            }, function(err) {
                console.log(err)
            });

        });
    },

    getAllRevisionsOfProject:function(req, res, next) {
        client.call('ServiceInterface', 'getAllRevisionsOfProject', {
            poid:req.body.poid
        }, function(data) {
            //console.log(data); // the return data from bimsever is Array[] including json type element.
            res.locals.poid = data[data.length-1].projectId;//return data is a array. projectId in each element is same.
            //console.log(data.projectId);
            return next();

        }, function(err) {
            console.log(err)
        });
    },

    getProjectByPoid:function(req, res, next) {
        client.call('ServiceInterface', 'getProjectByPoid', {
            poid:res.locals.poid
        }, function(data) {
            //console.log(data); // the return data from bimsever is Array[] including json type element.
            res.locals.roid = data.revisions[data.revisions.length-1];//We need the last revision in the array.
            return next();

        }, function(err) {
            console.log(err)
        });
    },


    getRevisionSummary:function(req, res, next) {
        client.call('ServiceInterface', 'getRevisionSummary', {
            roid:res.locals.roid
        }, function(data) {
            //console.log(data); // the return data from bimsever is Array[] including IFCGroups.
            res.locals.revisionSummary = data;
            return next();

        }, function(err) {
            console.log(err)
        });
    },

    //Generate download topicId, for later downloaddata use.
    download:function(req, res, next) {
        //revisionSummary List :[IFCEntities,IFCRelationships,IFCPromitive,Rest]
        var IFCGroupName=[];
            //IFCEntities
            for(var j in res.locals.revisionSummary.list[0].types){
                IFCGroupName.push(res.locals.revisionSummary.list[0].types[j].name);
            };
            //IFCRel
            for(var k in res.locals.revisionSummary.list[1].types){
                if(res.locals.revisionSummary.list[1].types[k].name!=="IfcRelDefinesByProperties"&&res.locals.revisionSummary.list[1].types[k].name!=="IfcRelDefinesByType"&&res.locals.revisionSummary.list[1].types[k].name!=="IfcRelAssociatesMaterial"){ //omit more rels here.
                    IFCGroupName.push(res.locals.revisionSummary.list[1].types[k].name);
                };
            };
        //BIMQL
        var queryString=JSON.stringify({"types":IFCGroupName});
        //BIMQL sample
        //var query1 = '{"types": ["IfcDoor","IfcSpace", "IfcWindow","IfcBeam","IfcBuilding","IfcRelContainedInSpatialStructure"]}' 

        client.call('ServiceInterface', 'download', {
            roids:[res.locals.roid],//This roids type should be array.
            query:queryString,
            serializerOid:res.locals.serializerOid,
            sync:false

        }, function(data) {
            res.locals.topicId=data;
            return next();

        }, function(err) {
            console.log(err)
        });
    },


    //Download option1: using BIMSie api. Data response is base64 encoded. It is slow and cause block sometimes when processing large files.
    getDownloadData:function(req, res, next) {
        client.call('ServiceInterface', 'getDownloadData', {
            topicId:res.locals.topicId
        }, function(data) {
            var IFCEntities=new Buffer(data.file, 'base64').toString('ascii');//
            console.log('getting downloaded data');
            //res.render('pages/checkin',{IFCEntities:JSON.parse(IFCEntities),moduleName:["../partials/getRevisionSummary"],messageUserType:req.session.userType});
            return next();
        }, function(err) {
            console.log(err)
        });
    },


    //Download option2: using direct HTTP request. Data response is json. It has better ability when processing large files. We used this optiom because IT IS FASTER
    downloadServlet:function(req, res, next) {
        var data = {token:client.token,topicId:res.locals.topicId,serializerOid:res.locals.serializerOid};
        var url = `http://localhost:8082/download?token=${data.token}&serializerOid=${data.serializerOid}]&topicId=${data.topicId}`;
        //Seperate IFCEntities and IFCRels.
        var IFCEntitiesArray=[];
        var IFCRelationshipsArray=[];
        //Make HTTP call by needle
        needle.get(url, function(error, response) {
            if (!error && response.statusCode == 200){
                //response.body is json type with structure of: {objects:[...]}. It is not base64 so different from the response data using api call.
                var IFCData = response.body;
                for(var i in IFCData.objects){
                    if(IFCData.objects[i]._t.includes('IfcRel',0)){
                        IFCRelationshipsArray.push(IFCData.objects[i]);
                    }else{
                        IFCEntitiesArray.push(IFCData.objects[i]);
                    }
                };
                /*Process ifcentity name: 
                    1. Rename ifcentity's name as ifcgroup_index if they dont have a name defined
                    2. Replace backslash \ to underscore _.
                */
                var index=0;
                var IFCGroupUpdate="";
                for(var e in IFCEntitiesArray){
                    if(IFCEntitiesArray[e].Name===null || IFCEntitiesArray[e].Name===undefined || typeof IFCEntitiesArray[e].Name==="undefined" ||IFCEntitiesArray[e].Name.length===0 || IFCEntitiesArray[e].Name.replace(/\s/g,'').length===0 ){
                        if(IFCGroupUpdate==="" || IFCEntitiesArray[e]._t===IFCGroupUpdate ){
                            IFCGroupUpdate=IFCEntitiesArray[e]._t;
                            index+=1;
                        }
                        else if(IFCEntitiesArray[e]._t!==IFCGroupUpdate){
                            IFCGroupUpdate=IFCEntitiesArray[e]._t;
                            index=1;
                        }
                        IFCEntitiesArray[e].Name=`${IFCparameterMapping[IFCEntitiesArray[e]._t]}_${index}`;
                    }
                    // else if(IFCEntitiesArray[e].Name.match(/\\/)){
                    //     IFCEntitiesArray[e].Name.replace(/\\/g,"_");
                    // }
                };
                //res.render('pages/checkin',{IFCEntities:IFCData,moduleName:["../partials/getRevisionSummary"],messageUserType:req.session.userType});
                res.locals.IFCEntitiesArray=IFCEntitiesArray;
                res.locals.IFCRelationshipsArray=IFCRelationshipsArray;
                //IFCEntitiesOidArray include all IFCEntities oid.
                var IFCEntitiesOidArray=[];
                for(var i in IFCEntitiesArray){
                    IFCEntitiesOidArray.push(IFCEntitiesArray[i]._i);
                };
                res.locals.IFCEntitiesOidArray=IFCEntitiesOidArray;
                return next();
            }else if(error){console.log(error)}
            });
    },

    //Cleanup the download cache
    cleanupLongAction:function(req, res) {
        client.call('ServiceInterface', 'cleanupLongAction', {
            topicId:res.locals.topicId
        }, function(data) {
            // the return data from bimsever is empty.
            console.log('cleanupLongAction successfully!');
            res.end();
        }, function(err) {
            console.log(err)
        });
    },
};


 var PluginInterface={
     //Get download serializer
     getSerializerByPluginClassName:function(req, res, next) {
        client.call('PluginInterface', 'getSerializerByPluginClassName', {
            pluginClassName:"org.bimserver.serializers.JsonStreamingSerializerPlugin"
        }, function(data) {
            res.locals.serializerOid = data.oid;
            return next();
        }, function(err) {
            console.log(err)
        });
    },
 }


 var NotificationRegistryInterface={
    //Get action progress
    registerProgressHandler:function(req, res, next) {
        client.call("NotificationRegistryInterface", "registerProgressHandler", {topicId: res.locals.topicId, endPointId: client.webSocket.endPointId}, function(){
            client.call("NotificationRegistryInterface", "getProgress", {
                topicId: res.locals.topicId
            }, function(data){
                console.log('The title is '+data.title+', the state is '+data.state);
            });
        });
    },

    //Get progress state by topicId. e.g: checkin, download...
    getProgress:function(req, res, next) {
        client.call("NotificationRegistryInterface", "getProgress", {
            topicId: res.locals.topicId
        }, function(data){
            console.log(data);
            return next();
        }, function(err) {
            console.log(err)
        });
    },
 }

 var Neo4j={

     //Origin function for creating nodes/labels/rels/deleting duplicated rels.
     batchMerge:function(req, res, next) {
        var batchNodesArray=[];
        var batchLabelsArray=[]
        var batchRelArray=[];
        var internalIdArray = [];//Neo4j internalId of all IFCEntities
        var oidArray=[];//oids of all IFCEntities

        //Step1: Merge nodes.
        for(var i in res.locals.IFCEntitiesArray){
            batchNodesArray.push({
            method: 'POST',
            to: '/cypher',
            body:
                //It is required to use quote "" or '' to cover the value.
                { query: `MERGE(n { name:"${res.locals.IFCEntitiesArray[i].Name}",oid:"${res.locals.IFCEntitiesArray[i]._i.toString()}",guid:"${res.locals.IFCEntitiesArray[i].GlobalId}" })   RETURN n`
                },
            id: parseInt(i) });//id has to be number type
            oidArray.push(res.locals.IFCEntitiesArray[i]._i.toString());//correct. string type.
        };

        var options = { method: 'POST',
        url: 'http://localhost:7474/db/data/batch',
        headers:
        { 
            'cache-control': 'no-cache',
            'x-stream': 'true',
            authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
            'content-type': 'application/json;charset=UTF-8',
            accept: 'application/json;charset=UTF-8' },
        body: batchNodesArray,
        json: true };
        //Step1: Make HTTP REST call
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            var responseArray = body;
            //Generate internalIdArray
            for(var i in responseArray){
                internalIdArray.push(responseArray[i].body.data[0][0].metadata.id);//correct
            };
            //Generate assign label content
            for(var i in res.locals.IFCEntitiesArray){
                batchLabelsArray.push({
                    method: 'POST', to: `/node/${internalIdArray[i]}/labels`, id: parseInt(i), body: IFCparameterMapping[res.locals.IFCEntitiesArray[i]._t]});
            };

            //Step2: Assign label to nodes by batch. As a callback in step1
            var options2 = { method: 'POST',
            url: 'http://localhost:7474/db/data/batch',
            headers:
            {
                'cache-control': 'no-cache',
                'x-stream': 'true',
                authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
                'content-type': 'application/json;charset=UTF-8',
                accept: 'application/json;charset=UTF-8' },
            body: batchLabelsArray,
            json: true };
                request(options2,function(error,response,body){
                    if(error) throw new Error(error);

                    //Step3: Create relationships by batch. As a callback in step2
                    for(var i in  res.locals.IFCRelationshipsArray){
                        var RelatedName, RelatingName;
                        for (var key in res.locals.IFCRelationshipsArray[i]) {
                            if (key.match(/^_rRelated/)){
                                RelatedName =key;
                            }else if (key.match(/^_rRelating/)){
                                RelatingName =key;
                            };
                        };
                            if(RelatedName && RelatingName && Array.isArray(IFCRelSubArray[i][RelatedName]) && IFCRelSubArray[i][RelatedName] && IFCRelSubArray[i][RelatingName]){
                                for(var j in res.locals.IFCRelationshipsArray[i][RelatedName]){
                                    //Check if the Related/Relating object are belong to IFCEntities.
                                    if(res.locals.IFCEntitiesOidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatedName][j])!==-1&&res.locals.IFCEntitiesOidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatingName])!==-1){

                                        var indexOidRelatedObj =oidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatedName][j].toString());
                                        var internalIdRelatedObj = internalIdArray[indexOidRelatedObj];
                                        var indexOidRelatingdObj =oidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatingName].toString());
                                        var internalIdRelatingObj = internalIdArray[indexOidRelatingdObj];

                                        batchRelArray.push({
                                            method : "POST",
                                            to : `/node/${internalIdRelatedObj}/relationships`,
                                            id : parseInt(i),
                                            body : {
                                                to : `/node/${internalIdRelatingObj}`,
                                                data : {//relationship properties.e.g: since : "2010"
                                                },
                                                type : `${IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].forward}`
                                                }
                                            });

                                        batchRelArray.push({
                                            method : "POST",
                                            to : `/node/${internalIdRelatingObj}/relationships`,
                                            id : parseInt(i),
                                            body : {
                                                to : `/node/${internalIdRelatedObj}`,
                                                data : {//relationship properties.e.g: since : "2010"
                                                },
                                                type : `${IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].back}`
                                                }
                                            });
                                    };
                                };
                            } else if(RelatedName && RelatingName && !Array.isArray(IFCRelSubArray[i][RelatedName]) && IFCRelSubArray[i][RelatedName] && IFCRelSubArray[i][RelatingName] ){
                                    //Check if the Related/Relating object are belong to IFCEntities.
                                    if(res.locals.IFCEntitiesOidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatedName])!==-1&&res.locals.IFCEntitiesOidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatingName])!==-1){

                                        var indexOidRelatedObj =oidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatedName].toString());
                                        var internalIdRelatedObj = internalIdArray[indexOidRelatedObj];
                                        var indexOidRelatingdObj =oidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatingName].toString());
                                        var internalIdRelatingObj = internalIdArray[indexOidRelatingdObj];

                                        batchRelArray.push({
                                            method : "POST",
                                            to : `/node/${internalIdRelatedObj}/relationships`,
                                            id : parseInt(i),
                                            body : {
                                                to : `/node/${internalIdRelatingObj}`,
                                                data : {//relationship properties.e.g: since : "2010"
                                                },
                                                type : `${IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].forward}`//IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].forward
                                                }
                                            });

                                        batchRelArray.push({
                                            method : "POST",
                                            to : `/node/${internalIdRelatingObj}/relationships`,
                                            id : parseInt(i),
                                            body : {
                                                to : `/node/${internalIdRelatedObj}`,
                                                data : {//relationship properties.e.g: since : "2010"
                                                },
                                                type : `${IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].back}`//IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].back
                                                }
                                            });
                                    };
                            };
                    };

                    var options3 = { method: 'POST',
                    url: 'http://localhost:7474/db/data/batch',
                    headers:
                    {
                        'cache-control': 'no-cache',
                        'x-stream': 'true',
                        authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
                        'content-type': 'application/json;charset=UTF-8',
                        accept: 'application/json;charset=UTF-8' },
                    body: batchRelArray,
                    json: true };
                        request(options3,function(error,response,body){
                            if(error) throw new Error(error);

                                //Step4: Delete duplicated relationships
                                var options4 = { method: 'POST',
                                url: 'http://localhost:7474/db/data/batch',
                                headers:
                                { 
                                    'cache-control': 'no-cache',
                                    authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
                                    'content-type': 'application/json;charset=UTF-8',
                                    accept: 'application/json;charset=UTF-8' },
                                body:[{ method: 'POST',
                                        to: '/cypher',
                                        body: { query: 'start r=relationship(*) match (s)-[r]->(e) with s,e,type(r) as typ, tail(collect(r)) as coll foreach(x in coll | delete x)' },
                                        id: 0 } ],
                                        json: true };
                                request(options4,function(error,response,body){
                                    if(error) throw new Error(error);
                                    console.log("Neo4j data create successfully");
                                    res.end();
                                });
                        });
                });
        });
    },


    //Create uniqueness nodes
    batchMerge2:function(req, res, next) {
        var batchNodesArray=[];
        var batchLabelsArray=[];
        var batchRelArray=[];
        var responseArray = [];
        var internalIdArray = [];
        var oidArray = [];
        //Make IFCEntities batch body.
        for(var i in res.locals.IFCEntitiesArray){
            batchNodesArray.push({
            method: 'POST',
            to: '/index/node/concept?uniqueness=get_or_create',
            body:
               {key: 'oid',
                value: res.locals.IFCEntitiesArray[i]._i.toString(),
                properties: { name: res.locals.IFCEntitiesArray[i].Name, oid:res.locals.IFCEntitiesArray[i]._i, guid:res.locals.IFCEntitiesArray[i].GlobalId }
               },
            id: parseInt(i) });
            //Create oid array. Identical to internalId array.
            oidArray.push(res.locals.IFCEntitiesArray[i]._i.toString());//correct. string type.

        };
        //Options for IFCEntities batch.
        var options = { method: 'POST',
        url: 'http://localhost:7474/db/data/batch',
        headers:
        { 'postman-token': '9a92b3ce-492f-6c72-a262-ab09fdca6163',
            'cache-control': 'no-cache',
            'x-stream': 'true',
            authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
            'content-type': 'application/json;charset=UTF-8',
            accept: 'application/json;charset=UTF-8' },
        body: batchNodesArray,
        json: true };
        //Execute IFCEntities batch.
        request(options, function (error, response, data) {
            if (error) throw new Error(error);
            console.log(Array.isArray(data));
            responseArray = data;
            //console.log(body1[2].body);
            //Generate internalIdArray
            for(var i in responseArray){
                internalIdArray.push(responseArray[i].body.metadata.id);//correct
            };
            //Create assign label content
            for(var i in res.locals.IFCEntitiesArray){
                batchLabelsArray.push({
                    method: 'POST', to: `/node/${internalIdArray[i]}/labels`, id: parseInt(i), body: IFCparameterMapping[res.locals.IFCEntitiesArray[i]._t]});
            };
            //Step2: Assign label to nodes by batch.
            var options2 = { method: 'POST',
            url: 'http://localhost:7474/db/data/batch',
            headers:
            { 'postman-token': '9a92b3ce-492f-6c72-a262-ab09fdca6163',
                'cache-control': 'no-cache',
                'x-stream': 'true',
                authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
                'content-type': 'application/json;charset=UTF-8',
                accept: 'application/json;charset=UTF-8' },
            body: batchLabelsArray,
            json: true };
                request(options2,function(error,response,body){
                    if(error) throw new Error(error);
                    //Step3: Create relationships by batch
                    for(var i in  res.locals.IFCRelationshipsArray){
                        var RelatedName, RelatingName;
                        for (var key in res.locals.IFCRelationshipsArray[i]) {
                            if (key.match(/^_rRelated/)){
                                RelatedName =key;
                            }else if (key.match(/^_rRelating/)){
                                RelatingName =key;
                            };
                        };

                            if(typeof RelatedName != 'undefined' &&typeof RelatingName != 'undefined'&&Array.isArray(res.locals.IFCRelationshipsArray[i][RelatedName])){
                                for(var j in res.locals.IFCRelationshipsArray[i][RelatedName]){
                                    //Check if the Related/Relating object are belong to IFCEntities.
                                    if(res.locals.IFCEntitiesOidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatedName][j])!==-1&&res.locals.IFCEntitiesOidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatingName])!==-1){
                                        var indexOidRelatedObj =oidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatedName][j].toString());
                                        var internalIdRelatedObj = internalIdArray[indexOidRelatedObj];
                                        var indexOidRelatingdObj =oidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatingName].toString());
                                        var internalIdRelatingObj = internalIdArray[indexOidRelatingdObj];

                                        batchRelArray.push({
                                            method : "POST",
                                            to : `/node/${internalIdRelatedObj}/relationships`,
                                            id : parseInt(i),
                                            body : {
                                                to : `/node/${internalIdRelatingObj}`,
                                                data : {//relationship properties.e.g: since : "2010"
                                                },
                                                type : `${IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].forward}`//IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].forward
                                                }
                                            });

                                        batchRelArray.push({
                                            method : "POST",
                                            to : `/node/${internalIdRelatingObj}/relationships`,
                                            id : parseInt(i),
                                            body : {
                                                to : `/node/${internalIdRelatedObj}`,
                                                data : {//relationship properties.e.g: since : "2010"
                                                },
                                                type : `${IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].back}`//IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].back
                                                }
                                            });
                                    };
                                };
                            } else if(typeof RelatedName != 'undefined' &&typeof RelatingName != 'undefined'&&!Array.isArray(res.locals.IFCRelationshipsArray[i][RelatedName])){
                                    //Check if the Related/Relating object are belong to IFCEntities.
                                    if(res.locals.IFCEntitiesOidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatedName])!==-1&&res.locals.IFCEntitiesOidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatingName])!==-1){
                                        var indexOidRelatedObj =oidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatedName].toString());
                                        var internalIdRelatedObj = internalIdArray[indexOidRelatedObj];
                                        var indexOidRelatingdObj =oidArray.indexOf(res.locals.IFCRelationshipsArray[i][RelatingName].toString());
                                        var internalIdRelatingObj = internalIdArray[indexOidRelatingdObj];

                                        batchRelArray.push({
                                            method : "POST",
                                            to : `/node/${internalIdRelatedObj}/relationships`,
                                            id : parseInt(i),
                                            body : {
                                                to : `/node/${internalIdRelatingObj}`,
                                                data : {//relationship properties.e.g: since : "2010"
                                                },
                                                type : `${IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].forward}`//IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].forward
                                                }
                                            });

                                        batchRelArray.push({
                                            method : "POST",
                                            to : `/node/${internalIdRelatingObj}/relationships`,
                                            id : parseInt(i),
                                            body : {
                                                to : `/node/${internalIdRelatedObj}`,
                                                data : {//relationship properties.e.g: since : "2010"
                                                },
                                                type : `${IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].back}`//IFCparameterMapping[res.locals.IFCRelationshipsArray[i]._t].back
                                                }
                                            });
                                    };
                            };
                    };
                    var options3 = { method: 'POST',
                    url: 'http://localhost:7474/db/data/batch',
                    headers:
                    { 'postman-token': '9a92b3ce-492f-6c72-a262-ab09fdca6163',
                        'cache-control': 'no-cache',
                        'x-stream': 'true',
                        authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
                        'content-type': 'application/json;charset=UTF-8',
                        accept: 'application/json;charset=UTF-8' },
                    body: batchRelArray,
                    json: true };
                        request(options3,function(error,response,body){
                            if(error) throw new Error(error);
                            //console.log(body);
                            console.log("Neo4j data create successfully");
                            return next();

                                // //Delete duplicated relationships
                                // var options4 = { method: 'POST',
                                // url: 'http://localhost:7474/db/data/batch',
                                // headers:
                                // { 'postman-token': '9a92b3ce-492f-6c72-a262-ab09fdca6163',
                                //     'cache-control': 'no-cache',
                                //     authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
                                //     'content-type': 'application/json;charset=UTF-8',
                                //     accept: 'application/json;charset=UTF-8' },
                                // body:[{ method: 'POST',
                                //         to: '/cypher',
                                //         body: { query: 'start r=relationship(*) match (s)-[r]->(e) with s,e,type(r) as typ, tail(collect(r)) as coll foreach(x in coll | delete x)' },
                                //         id: 0 } ],
                                //         json: true };
                                // request(options4,function(error,response,body){
                                //     if(error) throw new Error(error);
                                //     console.log("Neo4j data create successfully");
                                //     return next();
                                //     //res.end();
                                // });
                        });
                });
        });
    },

    //Create uniqueness nodes slice by slice
    batchMerge3:function(req, res, next) {
        //inherit previous data
        var IfcEntityArray=res.locals.IFCEntitiesArray;
        //Configure
        var dataLength = IfcEntityArray.length;
        var totalSteps = 20;
        var step=0;
        var sliceLength = Math.floor(dataLength/totalSteps);
        var remainder = dataLength % 10;
        var start=0
        var end = 0;
        //Sub data
        var IFCEntitiesSubArray= [];
        //Generate data
        var internalIdArray = [];
        var oidArray = [];
        //async.whilst is the way to loop async function. for or while dont make sense.
        async.whilst(
            function() {
                return step <= totalSteps;
            },
            function(callback) {
                var batchNodesArray=[];
                start=end;
                if(step<totalSteps){
                    end+=sliceLength;
                }else if(step=totalSteps){
                    end =dataLength;
                };
                console.log(start+"  "+end);
                IFCEntitiesSubArray= IfcEntityArray.slice(start,end);

                //Make IFCEntities batch body.
                for(var i in  IFCEntitiesSubArray){
                    batchNodesArray.push({
                    method: 'POST',
                    to: '/index/node/concept?uniqueness=get_or_create',
                    body:
                    {key: 'oid',
                        value:  IFCEntitiesSubArray[i]._i.toString(),
                        properties: { name:  IFCEntitiesSubArray[i].Name, oid: IFCEntitiesSubArray[i]._i, guid: IFCEntitiesSubArray[i].GlobalId }
                    },
                    id: parseInt(i) });

                    //Create oid array. Identical/one to one map to internalId array.
                    oidArray.push( IFCEntitiesSubArray[i]._i.toString());//correct. string type.
                };
                //Options for IFCEntities batch.
                var options = { method: 'POST',
                url: 'http://localhost:7474/db/data/batch',
                headers:
                { 
                    'cache-control': 'no-cache',
                    'x-stream': 'true',
                    authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
                    'content-type': 'application/json;charset=UTF-8',
                    accept: 'application/json;charset=UTF-8' },
                body: batchNodesArray,
                json: true };
                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                    if (!error && res.statusCode == 200) {
                    var responseArray = body;
                    for(var i in responseArray){
                        internalIdArray.push(responseArray[i].body.metadata.id);//correct
                    };

                    };
                    step+=1;

                    callback(null,null);
                });

            },
            function(err) {
                if(err){
                    console.log(err)
                }else if(!err){
                    console.log("nodes created "+"number of nodes are: "+internalIdArray.length);
                    res.locals.internalIdArray=internalIdArray;
                    res.locals.oidArray=oidArray;
                    return next();
                }
            }
        );
},

    //Assign lable to nodes slice by slice
    batchLabel:function(req, res, next) {
        //inherit previous data
        var IfcEntityArray=res.locals.IFCEntitiesArray;
        var internalIdArray = res.locals.internalIdArray;
        //Configure
        var dataLength = IfcEntityArray.length;
        var totalSteps = 20;
        var step=0;
        var sliceLength = Math.floor(dataLength/totalSteps);
        var remainder = dataLength % 10;
        var start=0
        var end = 0;
        //Sub data
        var IFCEntitiesSubArray= [];
        var internalIdSubArray=[];
        //Generate data
        var labelNumber=0;
        async.whilst(
            function() {
                return step <= totalSteps;
            },
            function(callback) {
                var batchLabelsArray=[];
                start=end;
                if(step<totalSteps){
                    end+=sliceLength;
                }else if(step=totalSteps){
                    end =dataLength;
                };
                console.log(start+"  "+end);

                IFCEntitiesSubArray= IfcEntityArray.slice(start,end);
                internalIdSubArray = internalIdArray.slice(start,end);

                for(var i in  IFCEntitiesSubArray){
                    batchLabelsArray.push({
                        method: 'POST',
                        to: `/node/${internalIdSubArray[i]}/labels`,
                        id: parseInt(i),
                        body: IFCparameterMapping[ IFCEntitiesSubArray[i]._t]});
                };

                //Step2: Assign label to nodes by batch.
                var options2 = { method: 'POST',
                url: 'http://localhost:7474/db/data/batch',
                headers:
                { 
                    'cache-control': 'no-cache',
                    'x-stream': 'true',
                    authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
                    'content-type': 'application/json;charset=UTF-8',
                    accept: 'application/json;charset=UTF-8' },
                body: batchLabelsArray,
                json: true };
                request(options2,function(error,response,body){
                    if(error) throw new Error(error);
                    step+=1;
                    labelNumber+=body.length;
                    callback(null,null);
                });
            },
            function(err) {
                if(err){
                    console.log(err)
                }else if(!err){
                    console.log("label created "+"number of labels are: "+labelNumber);
                    return next();
                }
            }
        );
    },

    //Create uniqueness rels slice by slice
    batchRel:function(req, res, next) {
        //inherit previous data
        var IfcRelArray = res.locals.IFCRelationshipsArray;
        var IfcEntityArray=res.locals.IFCEntitiesArray;
        var oidArray = res.locals.oidArray;
        //var oidArray2 = res.locals.IFCEntitiesOidArray;
        var internalIdArray = res.locals.internalIdArray;
        //Configure
        var dataLength = IfcRelArray.length;
        var totalSteps = 100;
        var step=0;
        var sliceLength = Math.floor(dataLength/totalSteps);
        var remainder = dataLength % 10;
        var start=0
        var end = 0;
        //Sub data
        var IFCRelSubArray= [];
        //Generate data
        var relNumber=0;

        async.whilst(
            function() {
                return step <= totalSteps;
            },
            function(callback) {
                var batchRelArray=[];
                start=end;
                if(step<totalSteps){
                    end+=sliceLength;
                }else if(step=totalSteps){
                    end =dataLength;
                };
                console.log(start+"  "+end);

                IFCRelSubArray= IfcRelArray.slice(start,end);
                for(var i in  IFCRelSubArray){
                    var RelatedName, RelatingName;
                    for (var key in IFCRelSubArray[i]) {
                        if (key.match(/^_rRelated/)){
                            RelatedName =key;
                        }else if (key.match(/^_rRelating/)){
                            RelatingName =key;
                        };
                    };

                        if(typeof RelatedName != 'undefined' &&typeof RelatingName != 'undefined'&&Array.isArray(IFCRelSubArray[i][RelatedName])){
                            for(var j in IFCRelSubArray[i][RelatedName]){
                                //Check if the Related/Relating object are belong to IFCEntities.
                                if(oidArray.indexOf(IFCRelSubArray[i][RelatedName][j].toString())!==-1&&oidArray.indexOf(IFCRelSubArray[i][RelatingName].toString())!==-1){
                                    var indexOidRelatedObj =oidArray.indexOf(IFCRelSubArray[i][RelatedName][j].toString());
                                    var internalIdRelatedObj = internalIdArray[indexOidRelatedObj];
                                    var indexOidRelatingdObj =oidArray.indexOf(IFCRelSubArray[i][RelatingName].toString());
                                    var internalIdRelatingObj = internalIdArray[indexOidRelatingdObj];

                                    batchRelArray.push({
                                        method: 'POST',
                                        to: '/index/relationship/IfcRel?uniqueness=get_or_create',
                                        id: parseInt(i),
                                        body: {
                                            key: 'oid',
                                            value: `${IFCRelSubArray[i]._i.toString()}_${internalIdRelatedObj.toString()}_${internalIdRelatingObj.toString()}`,
                                            start: `/node/${internalIdRelatedObj}`,
                                            end: `/node/${internalIdRelatingObj}`,
                                            type: `${IFCparameterMapping[IFCRelSubArray[i]._t].forward}` }
                                        });

                                    batchRelArray.push({
                                        method: 'POST',
                                        to: '/index/relationship/IfcRel?uniqueness=get_or_create',
                                        id: parseInt(i),
                                        body: {
                                            key: 'oid',
                                            value: `${IFCRelSubArray[i]._i.toString()}_${internalIdRelatingObj.toString()}_${internalIdRelatedObj.toString()}`,
                                            start: `/node/${internalIdRelatingObj}`,
                                            end: `/node/${internalIdRelatedObj}`,
                                            type: `${IFCparameterMapping[IFCRelSubArray[i]._t].back}` }
                                        });
                                };
                            };
                        }else if(typeof RelatedName != 'undefined' &&typeof RelatingName != 'undefined'&&!Array.isArray(IFCRelSubArray[i][RelatedName])){
                                //Check if the Related/Relating object are belong to IFCEntities.
                                if(oidArray.indexOf(IFCRelSubArray[i][RelatedName].toString())!==-1&&oidArray.indexOf(IFCRelSubArray[i][RelatingName].toString())!==-1){
                                    var indexOidRelatedObj =oidArray.indexOf(IFCRelSubArray[i][RelatedName].toString());
                                    var internalIdRelatedObj = internalIdArray[indexOidRelatedObj];
                                    var indexOidRelatingdObj =oidArray.indexOf(IFCRelSubArray[i][RelatingName].toString());
                                    var internalIdRelatingObj = internalIdArray[indexOidRelatingdObj];

                                    batchRelArray.push({
                                        method: 'POST',
                                        to: '/index/relationship/IfcRel?uniqueness=get_or_create',
                                        id: parseInt(i),
                                        body: {
                                            key: 'oid',
                                            value: `${IFCRelSubArray[i]._i.toString()}_${internalIdRelatedObj.toString()}_${internalIdRelatingObj.toString()}`,
                                            start: `/node/${internalIdRelatedObj}`,
                                            end: `/node/${internalIdRelatingObj}`,
                                            type: `${IFCparameterMapping[IFCRelSubArray[i]._t].forward}` }
                                        });

                                    batchRelArray.push({
                                        method: 'POST',
                                        to: '/index/relationship/IfcRel?uniqueness=get_or_create',
                                        id: parseInt(i),
                                        body: {
                                            key: 'oid',
                                            value: `${IFCRelSubArray[i]._i.toString()}_${internalIdRelatingObj.toString()}_${internalIdRelatedObj.toString()}`,
                                            start: `/node/${internalIdRelatingObj}`,
                                            end: `/node/${internalIdRelatedObj}`,
                                            type: `${IFCparameterMapping[IFCRelSubArray[i]._t].back}` }
                                        });
                                };
                        };
                };

                var options3 = { method: 'POST',
                url: 'http://localhost:7474/db/data/batch',
                headers:
                {
                    'cache-control': 'no-cache',
                    'x-stream': 'true',
                    authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
                    'content-type': 'application/json;charset=UTF-8',
                    accept: 'application/json;charset=UTF-8' },
                body: batchRelArray,
                json: true };

                    request(options3,function(error,response,body){
                        if(error) throw new Error(error);
                        step+=1;
                        relNumber+=body.length;
                        callback(null,null);
                    });
                },
            function(err) {
                if(err){
                    console.log(err)
                }else if(!err){
                    console.log("Relationships created "+"the numbers of Relationships are: "+relNumber);
                    return next();
                }
            }
        );
    }
    }


exports.AuthInterface = AuthInterface;
exports.ServiceInterface = ServiceInterface;
exports.PluginInterface = PluginInterface;
exports.NotificationRegistryInterface=NotificationRegistryInterface;
exports.Neo4j=Neo4j;
