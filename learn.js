var i =0;


function loop(text,callback){

    while(i<10){
    i+=1;
    console.log(text);
    };

    process.nextTick(function(){
        callback(text);
        console.log("Final line");
    });

  


}

loop("what",function(a){console.log( a+" a fuck")});





// function loop(text,callback){

//     while(i<10){
//     i+=1;
//     console.log(text);
//     };

//     callback(text);

// }

// loop("what",function(a){console.log( a+" a fuck")});


// console.log("Final line");

