
var neo4j = require("neo4j-driver").v1;
// Change the password if needed
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "250daowohao"));
var session = driver.session();

/* IOT configuration.
  1. This name in MATCH can be guid. When bimsurfer component is clicked, guid is fired.
  2. Connect as: ifcEntity <--> temperature <--> sensorId
  3. During subscribion, click a component it will check downstream if has IOT or not.
  4. In publish. Give sensor as a object has properties {name:temperature,id:001}. Also make 
     auto-generate topicId for publish.

*/
var query2="MATCH (s:Space{ name: 'A204' }),(p:Project { name: '0001' }), path = shortestPath((s)-[*..15]-(p)) RETURN path";

session
    .run(query2)
    .then(function(results){
        //result.msg = "success";
        //result.responseData = results.records;
        //res.json(result);
        var path = results.records[0]._fields[0].segments;
        // console.log(path.length);
        // var node1 = path[0].start.properties.name;
        // var node2 = path[0].end.properties.name;
        // var node3 = path[1].end.properties.name;
        // var node4 = path[2].end.properties.name;
        // var node5 = path[3].end.properties.name;
        // var topicPath = `${node5}/${node4}/${node3}/${node2}/${node1}`
        
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
        var topicPath=topicArray.join("/");
        console.log(topicPath);
        session.close();
    })
    .catch(function(error) {
        console.log(error);
        result.msg = "error";
        // result.responseData = error;
        // res.json(result);
    });

//session.close();
























//template
//     var username = req.body.username;
//     var bimToken = req.body.token;


//     var url = "http://" + bimConf.domain + ":" + bimConf.port + "/json";
//     var error = '';
//     var result = {};
//     request({
//         url: url,
//         method: "POST",
//         json: true,
//         headers: {
//             "content-type": "application/json",
//             accept: 'application/json, text/javascript, */*; q=0.01'
//         },
//         body: {
//             "token" : bimToken,            
//             "request" : {
//                 "interface" : "ServiceInterface",
//                 "method" : "getUserByUserName",
//                 "parameters":{
//                     username : username
//                 }
//             }
//         }
//     }, function(err, resp, body) {
//         console.log("getting User by name from BIM Server...");
//         console.log(err);
//         error = err;
        
//         if (!err && resp.statusCode == 200) {
//             result.response = body;
//             result.msg = 'success';
//         }
//         else{
//             result.response = error;
//             result.msg = 'error';
//         }
//         res.json(result);
//     });


// //getAllRevisionsOfProject
// var bimToken = req.body.token;
// var poid = req.body.poid;
// {
//   "token" : bimToken,
//   "request": {
//     "interface": "ServiceInterface", 
//     "method": "getAllRevisionsOfProject", 
//     "parameters": {
//       "poid": poid
//     }
//   }
// }

// //getProjectByPoid
// var bimToken = req.body.token;
// var poid = res.locals.poid;
// {
//   "token" : bimToken,    
//   "request": {
//     "interface": "ServiceInterface", 
//     "method": "getProjectByPoid", 
//     "parameters": {
//       "poid":poid 
//     }
//   }
// }

// //getRevisionSummary
// var bimToken = req.body.token;
// var roid = res.locals.roid;
// {
//   "token" : bimToken,    
//   "request": {
//     "interface": "ServiceInterface", 
//     "method": "getRevisionSummary", 
//     "parameters": {
//       "roid": roid
//     }
//   }
// }

// //download
// var bimToken = req.body.token;
// var roids = [res.locals.roid];
// var query = queryString;
// var serializerOid=res.locals.serializerOid;
// var sync=false;
// {
//   "token" : bimToken,
//   "request": {
//     "interface": "ServiceInterface", 
//     "method": "download", 
//     "parameters": {
//       "roids": roids,
//       "query": query,
//       "serializerOid": serializerOid,
//       "sync": sync
//     }
//   }
// }
// //cleanupLongAction
// var bimToken = req.body.token;
// var topicId=res.locals.topicId;
// {
//   "token" : bimToken,
//   "request": {
//     "interface": "ServiceInterface", 
//     "method": "cleanupLongAction", 
//     "parameters": {
//       "topicId": 
//     }
//   }
// }

// //getSerializerByPluginClassName
// var bimToken = req.body.token;
// var pluginClassName="org.bimserver.serializers.JsonStreamingSerializerPlugin";
// {
//   "token" : bimToken,
//   "request": {
//     "interface": "PluginInterface", 
//     "method": "getSerializerByPluginClassName", 
//     "parameters": {
//       "pluginClassName": pluginClassName
//     }
//   }
// }

// //getProgress
// var bimToken = req.body.token;
// var topicId=res.locals.topicId;
// {
//   "token" : bimToken,
//   "request": {
//     "interface": "NotificationRegistryInterface", 
//     "method": "getProgress", 
//     "parameters": {
//       "topicId": topicId
//     }
//   }
// }

//











// var i =0;


// function loop(text,callback){

//     while(i<10){
//     i+=1;
//     console.log(text);
//     };

//     process.nextTick(function(){
//         callback(text);
//         console.log("Final line");
//     });

// var request = require("request");

//res.locals.IFCEntitiesArray
// var IfcEntityArray=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];
// var dataLength = IfcEntityArray.length;
// var totalSteps = 10;
// var step=0;
// var sliceLength = Math.floor(dataLength/totalSteps);
// var remainder = dataLength % 10;

// var start=0
// var end = 0;

// var subArray= [];

// while(step<totalSteps){
    
//     step+=1;
    
    
//     //console.log(step);

//     start=end;
//     if(step<10){
//         end+=sliceLength;
//     }else if(step=10){
//         end =dataLength;

//     };
//     console.log(start+"  "+end);
    

//     subArray= IfcEntityArray.slice(start,end);
//     console.log(subArray);
    
    

// // };
// var async = require('async');

// function getUserEvents(callback) {
//     var tab = [];
//     var i = 0;

//     async.whilst(
//         function() {
//             return i < 100;
//         },
//         function(cb) {
//             request("mysite/list?page=" + i, function(err, res, body) {
//                 if (!err && res.statusCode == 200) {
//                     tab.push(JSON.parse(body));
//                 }
//                 i++;
//                 cb();
//             });
//         },
//         function(err) {
//             // finish processing pages 0-99
//             callback(tab)
//         }
//     );
// }






// var j = {
//   "objects": [
//     {
//       "_i": 3686269727,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "0w3_QDbcUyJOW17xoKKrPP",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1215824710,
//       "_rRelatedObjects": [
//         1216872573
//       ]
//     },
//     {
//       "_i": 3686335263,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "3KXBRXUzWbIxgbbtp$oMaJ",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1216872573,
//       "_rRelatedObjects": [
//         1216348263
//       ]
//     },
//     {
//       "_i": 3686400799,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "1H8N7KNYGCGB_AjSf8rFsq",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1216348263,
//       "_rRelatedObjects": [
//         1371865687,
//         1371931223,
//         1371996759,
//         1372062295,
//         1372127831,
//         1372193367,
//         1372258903,
//         1372324439,
//         1372389975
//       ]
//     },
//     {
//       "_i": 3686466335,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "0MqInTDHdSJRqmUjnb$1ka",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1371865687,
//       "_rRelatedObjects": [
//         159252974,
//         159318510,
//         159384046,
//         159449582,
//         159515118,
//         159580654,
//         159646190,
//         159711726,
//         159777262,
//         159842798,
//         159908334
//       ]
//     },
//     {
//       "_i": 3686531871,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "2i3HSIadM6GuwZ$2gtprh1",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1371931223,
//       "_rRelatedObjects": [
//         159973870,
//         160039406,
//         160104942,
//         160170478,
//         160236014,
//         160301550,
//         160367086,
//         160432622,
//         160498158,
//         160563694,
//         160629230,
//         160694766,
//         160760302,
//         160825838,
//         160891374,
//         160956910,
//         161022446,
//         161087982,
//         161153518,
//         161219054,
//         161284590,
//         161350126,
//         161415662,
//         161481198,
//         161546734,
//         161612270,
//         161677806,
//         161743342,
//         161808878,
//         161874414,
//         161939950,
//         162005486,
//         162071022,
//         162136558,
//         162202094,
//         162267630,
//         162333166,
//         162398702,
//         162464238,
//         162529774,
//         162595310,
//         162660846,
//         162726382,
//         162791918,
//         162857454,
//         162922990,
//         162988526,
//         163054062,
//         163119598,
//         163185134,
//         163250670,
//         163316206,
//         163381742,
//         163447278,
//         163512814,
//         163578350,
//         163643886,
//         163709422,
//         163774958,
//         163840494,
//         163906030,
//         163971566,
//         164037102,
//         164102638,
//         164168174,
//         164233710,
//         164299246,
//         164364782,
//         164430318,
//         164495854,
//         164561390,
//         164626926,
//         164692462,
//         164757998,
//         164823534,
//         164889070,
//         164954606,
//         165020142,
//         165085678,
//         165151214,
//         165216750,
//         165282286,
//         165347822,
//         165413358,
//         165478894,
//         165544430,
//         165609966,
//         165675502,
//         165741038,
//         165806574,
//         165872110,
//         165937646,
//         166003182,
//         166068718,
//         166134254,
//         166199790,
//         166265326,
//         166330862,
//         166396398,
//         166461934,
//         166527470,
//         166593006
//       ]
//     },
//     {
//       "_i": 3686597407,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "0gptobPVCxIOwlfXEhwiiD",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1371996759,
//       "_rRelatedObjects": [
//         166658542,
//         166724078,
//         166789614,
//         166855150,
//         166920686,
//         166986222,
//         167051758,
//         167117294,
//         167182830,
//         167248366,
//         167313902,
//         167379438,
//         167444974,
//         167510510,
//         167576046,
//         167641582,
//         167707118,
//         167772654,
//         167838190,
//         167903726,
//         167969262,
//         168034798,
//         168100334,
//         168165870,
//         168231406,
//         168296942,
//         168362478,
//         168428014,
//         168493550,
//         168559086,
//         168624622,
//         168690158,
//         168755694,
//         168821230,
//         168886766,
//         168952302,
//         169017838,
//         169083374,
//         169148910,
//         169214446,
//         169279982,
//         169345518,
//         169411054,
//         169476590,
//         169542126,
//         169607662,
//         169673198,
//         169738734,
//         169804270,
//         169869806,
//         169935342,
//         170000878,
//         170066414,
//         170131950,
//         170197486,
//         170263022,
//         170328558,
//         170394094,
//         170459630,
//         170525166,
//         170590702,
//         170656238,
//         170721774,
//         170787310,
//         170852846,
//         170918382,
//         170983918,
//         171049454,
//         171114990,
//         171180526,
//         171246062,
//         171311598,
//         171377134,
//         171442670,
//         171508206,
//         171573742,
//         171639278,
//         171704814,
//         171770350,
//         171835886,
//         171901422,
//         171966958
//       ]
//     },
//     {
//       "_i": 3686662943,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "2t7dybxg1GGggiuWtpX9C1",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1372062295,
//       "_rRelatedObjects": [
//         172032494,
//         172098030,
//         172163566,
//         172229102,
//         172294638,
//         172360174,
//         172425710,
//         172491246,
//         172556782,
//         172622318,
//         172687854,
//         172753390,
//         172818926,
//         172884462,
//         172949998,
//         173015534,
//         173081070,
//         173146606,
//         173212142,
//         173277678,
//         173343214,
//         173408750,
//         173474286,
//         173539822,
//         173605358,
//         173670894,
//         173736430,
//         173801966,
//         173867502,
//         173933038,
//         173998574,
//         174064110,
//         174129646,
//         174195182,
//         174260718,
//         174326254,
//         174391790,
//         174457326,
//         174522862,
//         174588398,
//         174653934,
//         174719470,
//         174785006,
//         174850542,
//         174916078,
//         174981614,
//         175047150,
//         175112686,
//         175178222,
//         175243758,
//         175309294,
//         175374830,
//         175440366,
//         175505902,
//         175571438,
//         175636974,
//         175702510,
//         175768046,
//         175833582,
//         175899118,
//         175964654,
//         176030190,
//         176095726,
//         176161262,
//         176226798,
//         176292334,
//         176357870,
//         176423406,
//         176488942,
//         176554478,
//         176620014,
//         176685550,
//         176751086,
//         176816622,
//         176882158,
//         176947694,
//         177013230,
//         177078766,
//         177144302,
//         177209838,
//         177275374,
//         177340910,
//         177406446,
//         177471982,
//         177537518,
//         177603054,
//         177668590,
//         177734126,
//         177799662,
//         177865198,
//         177930734,
//         177996270
//       ]
//     },
//     {
//       "_i": 3686728479,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "0Sh_UnZWNWHwvhk3Y0nkBJ",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1372127831,
//       "_rRelatedObjects": [
//         178061806,
//         178127342,
//         178192878,
//         178258414,
//         178323950,
//         178389486,
//         178455022,
//         178520558,
//         178586094,
//         178651630,
//         178717166,
//         178782702,
//         178848238,
//         178913774,
//         178979310,
//         179044846,
//         179110382,
//         179175918,
//         179241454,
//         179306990,
//         179372526,
//         179438062,
//         179503598,
//         179569134,
//         179634670,
//         179700206,
//         179765742,
//         179831278,
//         179896814,
//         179962350,
//         180027886,
//         180093422,
//         180158958,
//         180224494,
//         180290030,
//         180355566,
//         180421102,
//         180486638,
//         180552174,
//         180617710,
//         180683246,
//         180748782,
//         180814318,
//         180879854,
//         180945390,
//         181010926,
//         181076462,
//         181141998,
//         181207534,
//         181273070,
//         181338606,
//         181404142,
//         181469678,
//         181535214,
//         181600750,
//         181666286,
//         181731822,
//         181797358,
//         181862894,
//         181928430,
//         181993966,
//         182059502,
//         182125038,
//         182190574,
//         182256110,
//         182321646,
//         182387182,
//         182452718,
//         182518254,
//         182583790,
//         182649326,
//         182714862,
//         182780398,
//         182845934,
//         182911470,
//         182977006,
//         183042542,
//         183108078,
//         183173614,
//         183239150,
//         183304686,
//         183370222,
//         183435758,
//         183501294,
//         183566830,
//         183632366
//       ]
//     },
//     {
//       "_i": 3686794015,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "0zlDxn5llgGv8M_zdS97To",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1372193367,
//       "_rRelatedObjects": [
//         183697902,
//         183763438,
//         183828974,
//         183894510,
//         183960046,
//         184025582,
//         184091118,
//         184156654,
//         184222190,
//         184287726,
//         184353262,
//         184418798,
//         184484334,
//         184549870,
//         184615406,
//         184680942,
//         184746478,
//         184812014,
//         184877550,
//         184943086,
//         185008622,
//         185074158,
//         185139694,
//         185205230,
//         185270766,
//         185336302,
//         185401838,
//         185467374,
//         185532910,
//         185598446,
//         185663982,
//         185729518,
//         185795054,
//         185860590,
//         185926126,
//         185991662,
//         186057198,
//         186122734,
//         186188270,
//         186253806,
//         186319342,
//         186384878,
//         186450414,
//         186515950,
//         186581486,
//         186647022,
//         186712558,
//         186778094,
//         186843630,
//         186909166,
//         186974702,
//         187040238,
//         187105774,
//         187171310,
//         187236846,
//         187302382,
//         187367918,
//         187433454,
//         187498990,
//         187564526,
//         187630062,
//         187695598,
//         187761134,
//         187826670
//       ]
//     },
//     {
//       "_i": 3686859551,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "3Mf$cueIrYHBGVcD23AzOZ",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1372258903,
//       "_rRelatedObjects": [
//         187892206,
//         187957742,
//         188023278,
//         188088814,
//         188154350,
//         188219886,
//         188285422,
//         188350958,
//         188416494,
//         188482030,
//         188547566,
//         188613102,
//         188678638,
//         188744174,
//         188809710,
//         188875246,
//         188940782,
//         189006318,
//         189071854,
//         189137390,
//         189202926,
//         189268462,
//         189333998,
//         189399534,
//         189465070,
//         189530606,
//         189596142,
//         189661678,
//         189727214,
//         189792750,
//         189858286,
//         189923822,
//         189989358,
//         190054894,
//         190120430,
//         190185966,
//         190251502,
//         190317038,
//         190382574,
//         190448110,
//         190513646,
//         190579182,
//         190644718,
//         190710254,
//         190775790,
//         190841326,
//         190906862,
//         190972398,
//         191037934,
//         191103470,
//         191169006,
//         191234542,
//         191300078,
//         191365614,
//         191431150,
//         191496686,
//         191562222,
//         191627758,
//         191693294,
//         191758830,
//         191824366,
//         191889902,
//         191955438,
//         192020974
//       ]
//     },
//     {
//       "_i": 3686925087,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "0P59N5jBjcHAZL1nOWCWtm",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1372324439,
//       "_rRelatedObjects": [
//         192086510,
//         192152046,
//         192217582,
//         192283118,
//         192348654,
//         192414190,
//         192479726,
//         192545262,
//         192610798,
//         192676334,
//         192741870,
//         192807406,
//         192872942,
//         192938478,
//         193004014,
//         193069550,
//         193135086,
//         193200622,
//         193266158,
//         193331694,
//         193397230,
//         193462766,
//         193528302,
//         193593838,
//         193659374,
//         193724910,
//         193790446,
//         193855982,
//         193921518,
//         193987054,
//         194052590,
//         194118126,
//         194183662,
//         194249198,
//         194314734,
//         194380270,
//         194445806,
//         194511342,
//         194576878,
//         194642414,
//         194707950,
//         194773486,
//         194839022,
//         194904558,
//         194970094,
//         195035630,
//         195101166,
//         195166702,
//         195232238,
//         195297774,
//         195363310,
//         195428846,
//         195494382,
//         195559918,
//         195625454,
//         195690990,
//         195756526,
//         195822062,
//         195887598,
//         195953134,
//         196018670
//       ]
//     },
//     {
//       "_i": 3686990623,
//       "_t": "IfcRelAggregates",
//       "_s": 1,
//       "GlobalId": "0EWcDKCb$nIwuDirLx86qO",
//       "_rOwnerHistory": 1427899091,
//       "_rRelatingObject": 1372389975,
//       "_rRelatedObjects": [
//         196084206,
//         196149742,
//         196215278,
//         196280814,
//         196346350,
//         196411886,
//         196477422,
//         196542958,
//         196608494,
//         196674030,
//         196739566
//       ]
//     }
//   ]
// };



// var num=0;

// for(var i in j.objects){
//     num+=j.objects[i]._rRelatedObjects.length
// }
// console.log(num*2);

// var request = require("request");

// var options = { method: 'POST',
//   url: 'http://localhost:7474/db/data/batch',
//   headers: 
//    { 'postman-token': '0aa490f7-1ce9-a510-d4cd-4d152f3adb9a',
//      'cache-control': 'no-cache',
//      'x-stream': 'true',
//      authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
//      accept: 'application/json;charset=UTF-8',
//      'content-type': 'application/json' },
//   body: 
//    [ { method: 'POST',
//        to: '/index/node/concept?uniqueness=get_or_create',
//        id: 0,
//        body: { key: 'nom', value: '123', properties: { nom: '123', age: 23 } } },
//      { method: 'POST',
//        to: '/index/node/concept?uniqueness=get_or_create',
//        id: 1,
//        body: { key: 'nom', value: '456', properties: { nom: '456', age: 30 } } },
//      { method: 'POST', to: '{1}/labels', body: 'STUDENT', id: 3 },
//      { method: 'POST',
//        to: '/cypher',
//        id: 1,
//        body: 
//         { query: 'START a=node:concept(nom={aVal}), b=node:concept(nom={bVal}) MERGE (b)-[r:est]->(a)  ',
//           params: { aVal: '123', bVal: '456' } } } ],
//   json: true };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   console.log(body);
// });








// var request = require("request");

// var options = { method: 'POST',
//   url: 'http://localhost:7474/db/data/cypher',
//   headers: 
//    { 'postman-token': '98b6e51a-afbe-2dac-a3c4-5767125eede1',
//      'cache-control': 'no-cache',
//      authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
//      'content-type': 'application/json',
//      accept: 'application/json; charset=UTF-8' },
//   body: 
//    { query: 'UNWIND {props} AS properties MERGE (n) SET n = properties RETURN n',
//      params: 
//       { props: 
//          [ { name: 'Andres', position: 'Developer' },
//            { name: 'Michael', position: 'Developer' } ] } },
//   json: true };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   //console.log(body);
//   for(var i in body.data){
//    console.log(body.data[i][0].metadata.id);//correct
// };
// });



// var options = { method: 'POST',
//   url: 'http://localhost:7474/db/data/batch',
//   headers: 
//    { 'postman-token': '9a92b3ce-492f-6c72-a262-ab09fdca6163',
//      'cache-control': 'no-cache',
//      authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
//      'content-type': 'application/json',
//      accept: 'application/json;charset=UTF-8' },
//   body: 
//    [ { method: 'POST',
//        to: '/cypher',
//        body: 
//         { query: 'MERGE(n:label  {name:{userId1}, position:{userId2}, oid:{userId2} })   RETURN n',
//           params: { userId1: '21000001', userId2: '21000002' } },
//        id: 0 } ],
//   json: true };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   console.log(body);
// });

// //

// var request = require("request");

// var options = { method: 'POST',
//   url: 'http://localhost:7474/db/data/batch',
//   headers: 
//    { 'postman-token': '00e6e995-86ac-6463-7883-931a3121b7c8',
//      'cache-control': 'no-cache',
//      authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
//      'content-type': 'application/json',
//      accept: 'application/json; charset=UTF-8' },
//   body: 
//    [ { method: 'POST', to: '/node', id: 0, body: { name: 'bob' } },
//      { method: 'POST', to: '/node', id: 1, body: { age: 12 } },
    
//      { method: 'POST',
//        to: '{0}/relationships',
//        id: 3,
//        body: { to: '{1}', data: { since: '2010' }, type: 'KNOWS' } },
//      { method: 'POST',
//        to: '/index/relationship/my_rels',
//        id: 4,
//        body: { key: 'since', value: '2010', uri: '{3}' } },
//      {
//         method : "POST",
//         to : "/cypher",
//         body : {
//         query : "MERGE(n:label  {name:{userId1}, position:{userId2}, oid:{userId2} })   RETURN n",
//         params : {"userId1":"21000001", "userId2":"21000002","label":"Friend"}
//         },
//         id : 8
//     },
//     { method: 'POST', to: '/cypher/8/labels', id: 7, body: 'STUDENT' }  ],
//   json: true };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   console.log(body);
// });

// console.log(options)


// var request = require("request");

// var props =[ { name: 'Andres', position: 'Developer', label: 'PERSON' },
//            { name: 'Michael', position: 'Developer', label: 'TEACHER' } ];

// var options = { method: 'POST',
//   url: 'http://localhost:7474/db/data/cypher',
//   headers: 
//    { 'postman-token': '6872f596-0721-6ce5-5363-c199ab586a09',
//      'cache-control': 'no-cache',
//      authorization: 'Basic bmVvNGo6MjUwZGFvd29oYW8=',
//      'content-type': 'application/json',
//      accept: 'application/json; charset=UTF-8' },
//   body: 
//    { params: 
//       { props: props },
//      query: `UNWIND {props} AS properties  MERGE(n:${props.label}  {name:properties.name, position:properties.position})  RETURN n` },
//   json: true };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   console.log(body);
// });




// }

// loop("what",function(a){console.log( a+" a fuck")});

// var ProgressBar = require('progress');
// var https = require('https');
// var needle = require('needle');
// var request = require('request');
// var http = require('http');
// var base64 = require('file-base64');

// var data = {token:'ccd33d1dc43cece67f983aca88996bc7b7467eca820378b5346f676fb6395c5cad97f7aa192b214720a03bd7b816a726',topicId:300,serializerOid:262182};

// var url = `http://localhost:8082/download?token=${data.token}&serializerOid=${data.serializerOid}]&topicId=${data.topicId}`;

// var path=`/download?token=${data.token}&serializerOid=${data.serializerOid}]&topicId=${data.topicId}`


 
     //This one works.
    // needle.get(url, function(error, response) {
    // if (!error && response.statusCode == 200)
    //     console.log(response.body);//it is {objects:[...]}, it is json format not base64 so different from the response data using api call.
    // });








// var data = {token:'ccd33d1dc43cece67f983aca88996bc7b7467eca820378b5346f676fb6395c5cad97f7aa192b214720a03bd7b816a726',topicId:300,serializerOid:262182};

// var url = `http://localhost:8082/download?token=${data.token}&serializerOid=${data.serializerOid}]&topicId=${data.topicId}`;


    // request
    // .get(url)
    // .on('response', function(response) {
    //     console.log(response.statusCode); // 200 
    //     console.log(response.headers['content-type']); // 'image/png' 
    //     console.log(response)
    // })
    //.pipe(request.put('http://mysite.com/img.png'))



    // //This one works.
    // needle.get(url, function(error, response) {
    // if (!error && response.statusCode == 200)
    //     console.log(response.body);
    // });


    //This one works as well.
    // var options = {
    //   compressed         : true, // sets 'Accept-Encoding' to 'gzip,deflate' 
    //   follow_max         : 5,    // follow up to five redirects 
    //   rejectUnauthorized : true  // verify SSL certificate 
    // }
    
    // var stream = needle.get(url, options);
    
    // // read the chunks from the 'readable' event, so the stream gets consumed. 
    // stream.on('readable', function() {
    //   while (data = this.read()) {
    //     console.log(data);
    //   }
    // })
    
    // stream.on('done', function(err) {
    //   // if our request had an error, our 'done' event will tell us. 
    //   if (!err) console.log('Great success!');
    // })



    // headers: {
    //     'Content-Type': 'application/json;charset=utf-8',
    //     'Content-Length': Buffer.byteLength(postData)
//  token:'ccd33d1dc43cece67f983aca88996bc7b7467eca820378b5346f676fb6395c5cad97f7aa192b214720a03bd7b816a726',
//     topicId:299,





    // const postData = JSON.stringify(data);

    // const options = {
    // hostname: '',
    // port: 8082,
    // path: '/download',
    // method: 'GET',
    // headers: {
    //     'Content-Type': 'application/json;charset=utf-8',
    //     'Content-Length': Buffer.byteLength(postData)
    // }
    // };

    //  //base64.encode(path.join(__dirname,'../public',req.files.IFCfile.name), function(err, base64String) {});

    // const req = http.request(options, (res) => {
    // console.log(`STATUS: ${res.statusCode}`);
    // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    // res.setEncoding('utf8');
    // res.on('data', (chunk) => {
    //     base64.encode(chunk, function(err, base64String) {console.log(base64String)});
    //     console.log("chunk");
    //     //console.log(`BODY: ${chunk}`);
    // })
    // // .on('end', () => {
    // //     console.log('No more data in response.');
    // // });
    // });

    // req.on('error', (e) => {
    // console.error(`problem with request: ${e.message}`);
    // });

    // // write data to request body
    // req.write(postData);
    // req.end();
























    // var options = 
    // {
    // host: '',
    // port: 8082,
    // path: '/download',
    // method: 'GET',
   

    // };

    // var req = http.post(options,data, function(res) {
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));

    // // Buffer the body entirely for processing as a whole.
    // var bodyChunks = [];
    // res.on('data', function(chunk) {
    //     console.log('chunk is '+chunk);
    //     // You can process streamed parts here...
    //     bodyChunks.push(chunk);
    // }).on('end', function() {
    //     var body = Buffer.concat(bodyChunks);
    //     console.log('BODY: ' + body);
    //     // ...and/or process the entire body here.
    // })
    // });

    // req.on('error', function(e) {
    // console.log('ERROR: ' + e.message);
    // });
    // var options = 
    // {
    // host: '',
    // port: 8082,
    // path: '/download',
    // method: 'GET',
    // headers: {
    //     'Content-Type': 'application/json;charset=utf-8',
    //     'Content-Length': Buffer.byteLength(data)
    // }
    // };

    // var options={
    //     json:true
    // }

















    // needle.get('' + '/download', data, options, function(err, resp) {
    //   console.log(resp.body)
    // });

    // var data = {
    // token: 'ccd33d1dc43cece67f983aca88996bc7b7467eca820378b5346f676fb6395c5cad97f7aa192b214720a03bd7b816a726',
    // topicId: 297
    // };
    
    // needle
    // .get('http://localhost/8082/download', data, { json: true })
    // .on('readable', function() { console.log('deefe')/* eat your chunks */ })
    // .on('done', function() {
    //     console.log('Ready-o, friend-o.');
    // })


   // response.end();


    

// console.log(new Buffer("SGVsbG8gV29ybGQ=", 'base64').toString('utf8'));

// var str = '{"queries":[{"type":"IfcSpace"},{"type":"IfcSlab"}]}';
// var strbase = new Buffer(str).toString('base64');

// //console.log("{\"queries\":[{\"type\":\"IfcSpace\"},{\"type\":\"IfcSlab\"}]}");
// // {\"queries\":[{\"type\":\"IfcSpace\"},{\"type\":\"IfcSlab\"}]}: eyJxdWVyaWVzIjpbeyJ0eXBlIjoiSWZjU3BhY2UifSx7InR5cGUiOiJJZmNTbGFiIn1dfQ==
// //eyJxdWVyaWVzIjpbeyJ0eXBlIjoiSWZjU3BhY2UifSx7InR5cGUiOiJJZmNTbGFiIn1dfQ==
// //eyJxdWVyaWVzIjpbeyJ0eXBlIjoiSWZjU3BhY2UifSx7InR5cGUiOiJJZmNTbGFiIn1dfQ==
// //eyJxdWVyaWVzIjpbeyJ0eXBlIjoiSWZjU3BhY2UifSx7InR5cGUiOiJJZmNTbGFiIn1dfQ==
// //eyJxdWVyaWVzIjpbeyJ0eXBlIjoiSWZjU3BhY2UifSx7InR5cGUiOiJJZmNTbGFiIn1dfQ\
// console.log(strbase);


// function loop(text,callback){

//     while(i<10){
//     i+=1;
//     console.log(text);
//     };

//     callback(text);

// }

// loop("what",function(a){console.log( a+" a fuck")});


// console.log("Final line");

