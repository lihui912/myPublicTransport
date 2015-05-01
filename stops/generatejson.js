var fs = require('fs');


function readFile(inFileName) {
  var data = null;
  // console.log(inFileName);
  data = JSON.parse(fs.readFileSync(inFileName, {"encoding": "utf-8", flag: "r"}));
  // console.log(data);
  return data;
}

function writeFile(inFileName, inData) {
  console.log("Writting file " + inFileName);
  fs.writeFileSync(inFileName, inData);
}

function getRouteId(inObject) {
  return inObject.routes[0].route[0].route.id;
}

function findBusRouteId(inRouteCode) {
  for(var k = 0; k < allRoutesLength; k++) {
    if(allRoutesData[k].code == inRouteCode) {
      return allRoutesData[k].id;
    }
  }
  console.error("not found");
  return -1;
}

function getRouteStops(inRouteObject) {
  var count = 0;
  
  var thisLineId   = inRouteObject.routes[0].route[0].route.id;
  var thisLineCode = inRouteObject.routes[0].route[0].route.code;
  
  console.log(thisLineId + " " + thisLineCode + " " + inRouteObject.routes.length)
  for(var i = 0; i < inRouteObject.routes.length; i++) {
    var thisLegStops = inRouteObject.routes[i].route[0].stops;  //array
    var stopsCount = thisLegStops.length;
    for(var j = 0 ; j < stopsCount; j++) {
      delete thisLegStops[j].line;
      
      if(!thisLegStops[j].busLine) {
        thisLegStops[j].busLine = [];
      }
      // if(thisLineId == 25) {console.log(i, j, stopsCount, thisLegStops[j].id);}
      var busStopIndex = searchBusStopFromCache(thisLegStops[j].id);
      if(-1 == busStopIndex) {
        busStopIndex = addBusStopToCache(thisLegStops[j]);
      }
      var searchLineResultIndex = searchBusLineInBusStop(busStopIndex, thisLineId, i);
      if(-1 == searchLineResultIndex) {
        searchLineResultIndex = addBusLineToBusStop(busStopIndex, thisLineId, thisLineCode, i);
      }
      count++;
    }
  }
  console.log(thisLineCode + " processed " + count + " stops.");
}

function searchBusStopFromCache(inStopId) {
  var cache = allBusStops;
  var cacheLength = allBusStops.length;
  
  for(var i = 0; i < cacheLength; i++) {
    var thisStop = cache[i];
    if(thisStop.id == inStopId) {
      return i;
    }
  }
  return -1;
}

function addBusStopToCache(inStopObject) {
  return allBusStops.push(inStopObject) - 1;
}

function searchBusLineInBusStop(inStopIndex, inLineId, inDirection) {
  // var index = searchBusStopFromCache(inStopId);
  var thisStop = allBusStops[inStopIndex];
  // console.log(thisStop);
  for(var i = 0; i < thisStop.busLine.length; i++) {
    if(thisStop.busLine[i].id == inLineId && thisStop.busLine[i].direction == inDirection) {
      return i;
    }
  }
  return -1;
}

function addBusLineToBusStop(inStopIndex, inLineId, inLineCode, inDirection) {
  var thisStop = allBusStops[inStopIndex];
  return thisStop.busLine.push({"id" : inLineId, "code" : inLineCode, "direction" : inDirection}) - 1;
}


var allRoutesData = "";
var allRoutesLength = 0;

var allRoutesObject = [];

var allBusStops = [];

function main() {
  var allRoutesObj = readFile("../routes/area.json");
  allRoutesData = allRoutesObj.data.routes;
  allRoutesLength = allRoutesObj.data.routes.length;
  
  
  // console.log(allRoutesLength);
  for(var i = 0; i < allRoutesLength; i++) {
    // console.log(i, allRoutesData[i].code);
    var singleRouteObj = readFile("../routes/" + allRoutesData[i].code + ".json");
    var id = getRouteId(singleRouteObj);
    allRoutesData[i].id = id;
    allRoutesObject.push(singleRouteObj);
    
    
    getRouteStops(singleRouteObj);
    
    
    
    
    
    // console.log(id);
    // console.log(allRoutesObj.data.routes[i]);
    // filename convert from code to id
    // writeFile("../routes/" + id + ".json", JSON.stringify(singleRouteObj));
  }
  writeFile("../routes/allroutes.json", JSON.stringify(allRoutesObject));
  writeFile("allbusstop.json", JSON.stringify(allBusStops));
  
  
  // writeFile("../routes/area.json", JSON.stringify(allRoutesObj));
  
  // var allBusStopObj = readFile("busstop.json");
  // var allBusStopLength = allBusStopObj.length;

  // console.log(allBusStopLength);
  /*
  var newArray = [];
  
  for(var i = 0; i < allBusStopLength; i++) {
    var thisBusLines = allBusStopObj[i].busLine;
    var thisBusLinesLength = thisBusLines.length;
    
    for(var j = 0; j < thisBusLinesLength; j++) {
      var thisBusLineId = findBusRouteId(thisBusLines[j].code);
      if(-1 == thisBusLineId) {
        continue;
      } else {
        thisBusLines[j].id = thisBusLineId;
      }
    }
    console.log(allBusStopObj[i].id + ".json");
    
    // writeFile(allBusStopObj[i].id + ".json", JSON.stringify(allBusStopObj[i]));
    
    newArray.push({"id": allBusStopObj[i].id, "name": allBusStopObj[i].name});
  }
  
  console.log(newArray.length);
  writeFile("index.json", JSON.stringify(newArray));
  
  */
}



// readFile("busstop.json");
main();