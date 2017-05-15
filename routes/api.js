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
var app = express();
var BimServerClient = require('../bimServerJS/bimserverclient');
var flash = require('connect-flash');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); // the session is stored in a cookie, so we use this to parse it
var ProgressBar = require('progress');
var https = require('https');
var neo4j = require("neo4j-driver").v1;
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
            next();
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
            console.log(data); // the return data from bimsever is Array[] including json type element.
            res.locals.poid = data[data.length-1].projectId;//return data is a array. projectId in each element is same.
            //console.log(data.projectId);
            next();
        
        }, function(err) {
            console.log(err)
        });

    },

    getProjectByPoid:function(req, res, next) {   
        client.call('ServiceInterface', 'getProjectByPoid', {
            poid:res.locals.poid
        }, function(data) {
            console.log(data); // the return data from bimsever is Array[] including json type element.
            res.locals.roid = data.revisions[data.revisions.length-1];//We need the last revision in the array.
            next();
        
        }, function(err) {
            console.log(err)
        });



    },


    getRevisionSummary:function(req, res, next) {   
        client.call('ServiceInterface', 'getRevisionSummary', {
            roid:res.locals.roid
        }, function(data) {
            console.log(data); // the return data from bimsever is Array[] including IFCGroups.
            res.locals.revisionSummary = data;
            next();
        
        }, function(err) {
            console.log(err)
        });
    },

    //Generate download topicId, for later downloaddata use. 
    download:function(req, res, next) {
        //revisionSummary List :[IFCEntities,IFCRelationships,IFCPromitive,Rest]
        var IFCGroupName=[];   
        for(var i in res.locals.revisionSummary.list){ 
            for(var j in res.locals.revisionSummary.list[0].types){ 
                IFCGroupName.push(res.locals.revisionSummary.list[0].types[j].name);
            } 
        };

        //Full IFC types query sometimes get stuck but sometimes just smoothly execute. Not sure why?
        var querystring=JSON.stringify({"types":IFCGroupName});

        console.log(querystring);

        var query1 = '{"types": ["IfcDoor", "IfcWindow","IfcBeam","IfcBuilding","IfcRelContainedInSpatialStructure"]}' // {"types": ["IfcDoor", "IfcWindow"]}  //Current use: {"queries":[{"type":"IfcSpace"}]}
        //var queryBase64 = new Buffer(query1).toString('base64');

        client.call('ServiceInterface', 'download', {
            roids:[res.locals.roid],//This roids type should be array.
            query:query1,//"{\"queries\":[{\"type\":\"IfcSpace\"},{\"type\":\"IfcSlab\"}]}",
            serializerOid:res.locals.serializerOid,
            sync:false

        }, function(data) {
            console.log(data); // the return data from bimsever is a topicId.
            res.locals.topicId=data;
            next();
        
        }, function(err) {
            console.log(err)
        });

    },


    //Download option1: using BIMSie api. Data response is base64 encoded. It is slow and cause block sometimes when processing large files.
    getDownloadData:function(req, res, next) {
        client.call('ServiceInterface', 'getDownloadData', {
            topicId:res.locals.topicId
        }, function(data) {

            //client.registerProgressHandler(res.locals.topicId,function(a,b){console.log(b)}); 
            
            var IFCEntities=new Buffer(data.file, 'base64').toString('ascii');//
            console.log('getting downloaded data');
            console.log(data.file.length);
            console.log(IFCEntities);//data is{file:base64 data}. So data.file is the base64 encoded IFCEntities data, then we decode base64 to utf8 string.         
            //res.render('pages/checkin',{IFCEntities:JSON.parse(IFCEntities),moduleName:["../partials/getRevisionSummary"],messageUserType:req.session.userType});
            next();
        
        }, function(err) {
            console.log(err)
        });

    },


    //Download option2: using direct HTTP request. Data response is json. It has better ability when processing large files.
    downloadServlet:function(req, res, next) {
        var data = {token:client.token,topicId:res.locals.topicId,serializerOid:res.locals.serializerOid};
        var url = `http://localhost:8082/download?token=${data.token}&serializerOid=${data.serializerOid}]&topicId=${data.topicId}`;
        
        //Array of json object.
        var IFCEntitiesArray=[];
        var IFCRelationshipsArray=[];
        //var path=`/download?token=${data.token}&serializerOid=${data.serializerOid}]&topicId=${data.topicId}`
        //Download option2, HTTP download, response data is json type instead of base64 encoded which is by getDownloadData() method. 
        needle.get(url, function(error, response) {
            if (!error && response.statusCode == 200){
                //console.log(response.body);//it is {objects:[...]}, it is json format not base64 so different from the response data using api call.
                var IFCData = response.body;//response.body is json type.Data strcture is: {objects:[...]}
                for(var i in IFCData.objects){
                    if(IFCData.objects[i]._t.includes('IfcRel',0)){
                        IFCRelationshipsArray.push(IFCData.objects[i]);
                    }else{
                        IFCEntitiesArray.push(IFCData.objects[i]);
                    }
                }
                
                //res.render to html as table.
                res.render('pages/checkin',{IFCEntities:IFCData,moduleName:["../partials/getRevisionSummary"],messageUserType:req.session.userType});
                res.locals.IFCEntitiesArray=IFCEntitiesArray;
                res.locals.IFCRelationshipsArray=IFCRelationshipsArray;
                console.log(IFCEntitiesArray);
                console.log('------------IFCEntities above------------------IFCRelations below-----------------------')
                console.log(IFCRelationshipsArray);

                fs.writeFile(path.join(__dirname,'../public','IFCData.txt'),JSON.stringify(IFCData),function(err){
                    console.log(err);
                });  

                // fs.writeFile(path.join(__dirname,'../public','IFCEntities.txt'),IFCEntitiesArray.join(','),function(err){
                //     console.log(err);
                // });
                // fs.writeFile(path.join(__dirname,'../public','IFCRelationships.txt'),IFCRelationshipsArray.join(','),function(err){
                //     console.log(err);
                // });              

                next();
            }else if(error){console.log(error)}
            });

    },

    cleanupLongAction:function(req, res, next) {
        client.call('ServiceInterface', 'cleanupLongAction', {
            topicId:res.locals.topicId
        }, function(data) {
            console.log(data); // the return data from bimsever is empty.
            console.log('cleanupLongAction successfully!');
            
        }, function(err) {
            console.log(err)
        });

    },



};




 var PluginInterface={
     getSerializerByPluginClassName:function(req, res, next) {   
        client.call('PluginInterface', 'getSerializerByPluginClassName', {
            pluginClassName:"org.bimserver.serializers.JsonStreamingSerializerPlugin"
        }, function(data) {
            console.log(data); // the return data from bimsever is Array[] including json type element.
            res.locals.serializerOid = data.oid;
            next();
        
        }, function(err) {
            console.log(err)
        });

    },


 }

 var NotificationRegistryInterface={

    registerProgressHandler:function(req, res, next) {
        client.call("NotificationRegistryInterface", "registerProgressHandler", {topicId: res.locals.topicId, endPointId: client.webSocket.endPointId}, function(){
            next();
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
            console.log( res.locals.topicId);
            next();
        }, function(err) {
            console.log(err)
        });
 


    },

 }

 var Neo4j={
     cypherMerge:function(req, res, next) {
         session.run.then.then();
        session
        .run(" MERGE (n:Student {   Name:{nameParam} ,ID:{iDParam} ,Material:{materialParam} ,Load:{loadParam} ,Design:{designParam}  }) ",{nameParam:name, iDParam:iD, materialParam:material, loadParam:load, designParam:design}  )
        .then(function(){
            return session.run( "MATCH (m:Student)   RETURN m.Name AS ti" )       
        })
        .then(function(result){
            // for(var i in result.records){
            //   dataArray.push(  result.records[i].get("ti") ); //Push the single data into dataArray
            //   console.log(result.records[i].get("ti") +"The datatype is "+ typeof result.records[i].get("ti") )
            // }; 

            // console.log(dataArray);
            // dataString = dataArray.join(' ');//Swtich the array to string, with connect symbol " " --> <space>
            // responseDataString = JSON.stringify({"Name":dataString});//Transfer the Json data to its string format.

            session.close();
            //driver.close();

            console.log("Cypher works");//Catch the running time here for compare neo4j efficient.

        })
        .catch(function (error) {
            console.log(error);
        });       

    },



 }

 

 			 
 


exports.AuthInterface = AuthInterface;
exports.ServiceInterface = ServiceInterface;
exports.PluginInterface = PluginInterface;
exports.NotificationRegistryInterface=NotificationRegistryInterface;