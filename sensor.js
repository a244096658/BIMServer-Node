var mqtt = require('mqtt')
//NB:Change ip when broker is from cloud;
var client  = mqtt.connect('ws://127.0.0.1:4000');//mqtt://127.0.0.1:1884. Both ws://.. and mqtt:// ports works.
var async = require('async');
var neo4j = require("neo4j-driver").v1;
// Change the password if needed
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "250daowohao"));
var session = driver.session();

var sensorList={
    sensor1:{name:"sensor1",type:"temperature"},
    sensor2:{name:"sensor2",type:"temperature"}
};
//Auto generating IOT topic
var query="MATCH (s:Sensor{ name: {nameParam} }),(p:Project { name: '0001' }), path = shortestPath((s)-[*..15]-(p)) RETURN path";
var topicPath="";

session
    .run(query,{nameParam:sensorList.sensor2.name})
    .then(function(results){
        var path = results.records[0]._fields[0].segments;
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
        topicPath=topicArray.join("/");
        console.log(topicPath);
        session.close();
    })
    .catch(function(error) {
        console.log(error);
    });


var count = 0;
// One client is one Respiberry board, there can be multiple sensors attached on it. 
// So one client can publish multiple topics. Because one sensor is corresponed to one topic.

setTimeout(function(){
    async.whilst(
        function () { return count < 1000; },//Here is the presumed "timeout" issue. Because we manually define only run 100 times for client publish.
        function (callback) {
            count++;
            setTimeout(function () {
                callback(null, count);
            }, 2000);
            var temperature = (Math.random()*60).toFixed(2);
            //var humidity = (Math.random()*100).toFixed(2);
            //Number is not accepted. String is accept. (Json, xml may also ok)
            client.publish(topicPath, temperature.toString(),{qos:1,retain:true});
            //client.publish('myHome/humidity', humidity.toString(),{qos:1,retain:true});
            console.log("topic is "+topicPath+" temperature: "+temperature);
            //console.log("humidity: "+humidity);

        },
        function (err, n) {
            // 5 seconds have passed, n = 5
        }
    );
},5000)



 