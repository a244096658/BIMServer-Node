var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://127.0.0.1:1884')//mqtt://test.mosquitto.org
var neo4j = require("neo4j-driver").v1;
// Change the password if needed
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "250daowohao"));
var session = driver.session();
var async = require('async');


var topicPath="";
//Auto generating IOT topic.
//Switch this name to guid.
var query="MATCH (s:Space{ name: {nameParam} }),(p:Project { name: '0001' }), path = shortestPath((s)-[*..15]-(p)) RETURN path";

//Session run is a unsync function.
session
    .run(query,{nameParam:"R301"})
    .then(function(results){
        //result.msg = "success";
        //result.responseData = results.records;
        //res.json(result);
        var path = results.records[0]._fields[0].segments;   
        //topicPath is : project/site/building/floor/space/temperature/sensor
        var topicArray=[];
        for(var i=path.length-1;i>=0;i+=-1){
          if(i>0){
            topicArray.push(path[i].end.properties.name);
          }
          else if(i===0){
            topicArray.push(path[i].end.properties.name);
            topicArray.push(path[i].start.properties.name);
          }
        }
        //subscribe all hierarchy under this space component.
        topicPath=topicArray.join("/")+'/#';
        console.log(topicPath);
        //When get topicPath then client subscribe it. 
        client.subscribe(topicPath);
        session.close();
    })
    .catch(function(error) {
        console.log(error);
        result.msg = "error";
        // result.responseData = error;
        // res.json(result);
    });



client.on('connect', function () {
  //client.subscribe('myHome/temperature');
  console.log("connected to Mosca broker!");
});
 


client.on('message', function (topic, message) {
  // message is Buffer
  //console.log(topic); 
  console.log(message.toString());
  //console.log(message);
  //client.end()
});