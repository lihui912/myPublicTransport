var fs = require('fs');

var index = [];
var error = [];
var totalStops = 0;
var filesWritten = 0;


function readFile() {
  var json = null;
console.log("readFile");
  fs.readFile("busstop.json", {"encoding": "utf-8", flag: "r"}, function(err, data) {
    if (err) {
      console.log("error");
      return;
    }
    json = JSON.parse(data);
    totalStops = json.length;
    console.log("Total stops: " + totalStops);
    
    for(var i = 0; i < totalStops; i++) {
      singlelize(i, json[i]);
    }

  });
  /*
*/
}

function singlelize(inIndex, inObject) {
  var fileName = inObject.id + ".json";
  var stopName = inObject.name;
  var stopId = inObject.id;
  
  index.push({"id": stopId, "name": stopName, "filename": fileName});
  
  var outputString = JSON.stringify(inObject);
  console.log(inIndex + ".\t " + fileName + " to be written. " + stopName);
  // console.log({"i": stopId, "name": stopName, "filename": fileName});
  
  writeFile(fileName, stopName, outputString);
}

function writeFile(inFileName, inStopName, inString) {
  fs.writeFileSync(inFileName, inString);
  /*
  fs.writeFile(inFileName, inString, function(err) {
    if(err) {
      error.push(inFileName);
      console.error(err);
      console.log("error");
    } else {
      filesWritten++;
      console.log(filesWritten + ".\t" + inFileName + " is written! " + inStopName);
      
      if(filesWritten == totalStops) {
        // console.log(index);
        fs.writeFile("index.json", JSON.stringify(index), function(err) {
          if(err) {
            console.error("Error write index file!");
          } else {
            console.log("All files are written, everything is done!");
          }
        });
      }
    }
  });
  */
}

readFile();