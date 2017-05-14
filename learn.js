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

  


// }

// loop("what",function(a){console.log( a+" a fuck")});

var ProgressBar = require('progress');
var https = require('https');
var needle = require('needle');
var request = require('request');
var http = require('http');
var base64 = require('file-base64');

var data = {token:'ccd33d1dc43cece67f983aca88996bc7b7467eca820378b5346f676fb6395c5cad97f7aa192b214720a03bd7b816a726',topicId:300,serializerOid:262182};

var url = `http://localhost:8082/download?token=${data.token}&serializerOid=${data.serializerOid}]&topicId=${data.topicId}`;

var path=`/download?token=${data.token}&serializerOid=${data.serializerOid}]&topicId=${data.topicId}`


 
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

