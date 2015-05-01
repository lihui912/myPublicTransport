function BusLine(inMap, inJson) {
  this._originalData = inJson;
  this._map = inMap;
  this._name = "";
  this._routeCode = "";   // ex: B103
  this._routeId   = -1;
  this._routeType = -1;
  this._operator = "";    // ex: RapidKL
  this._legs = [];        // A route contains 2 legs: departs leg and return leg, store index only
  this._busStops = [];
  this._busStops[HCL.busLine.direction.DEPART] = [];    // stores bus stops index
  this._busStops[HCL.busLine.direction.RETURN] = [];
  
  this.extractData();
  try {
    this.buildBusLine();
  } catch(error) {
    console.error(error);
  }
  try {
    this.buildBusStops();
  } catch(error) {
    console.error(error);
  }
  // console.log(this);
  
}

BusLine.prototype.showConsole = function() {
  console.log(this);
}

BusLine.prototype.setMap = function(inMap) {
  console.log("setMap", inMap);
  this._map = inMap;
}

BusLine.prototype.getRouteCode = function() {
  return this._routeCode;
}

BusLine.prototype.getOperator = function() {
  return this._operator;
}

BusLine.prototype.setOperator = function(inOperator) {
  this._operator = inOperator.trim();
}

BusLine.prototype.extractData = function() {
  // original JSON data: this._originalData
/* Some BET line has only 1 leg.
  // A bus line has 2 legs, verify 1st!
  if(2 != this._originalData.routes.length) {
    throw Error("A bus line must have 2 legs!");
    return undefined;
  }
*/
  var routeLeg, busStop;
  var singleLeg;//, thisRoute;
  
  var busStopIds = []; // for loading extra data
  
  var routeInfo = this._originalData.routes[0].route[0].route;

  this._name      = routeInfo.name;
  this._routeCode = routeInfo.code;
  this._routeId   = routeInfo.id;
  this._routeType = routeInfo.type;
  
  for(var i = 0; i < this._originalData.routes.length; i++) {
    singleLeg = this._originalData.routes[i];
    thisLeg = singleLeg.route[0];
    
    var thisLegDirection = HCL.busLine.direction.UNKNOWN;
    if(i == 0) {
      thisLegDirection = HCL.busLine.direction.DEPART;
    } else if(i == 1) {
      thisLegDirection = HCL.busLine.direction.RETURN;
    }

    var busLegIndex = HCL.busLeg.searchBusLeg(routeInfo.code, thisLegDirection);
    if(-1 != busLegIndex) {
      // this leg was created before
      console.info("bus leg was created at index: ", busLegIndex);
      continue;
    }
    
    routeLeg = new RouteLeg(thisLeg.trip.id, thisLeg.trip.headsign, routeInfo.code);
    routeLeg.setMap(this._map);
    routeLeg.setDirection(thisLegDirection);
    routeLeg.setRouteCode(this._routeCode);
    routeLeg.setRouteId(this._routeId);
    console.log(this._routeCode, thisLegDirection, thisLeg.stops.length);

    for(var j = 0; j < thisLeg.stops.length; j++) {
      bstop = thisLeg.stops[j];
      routeLeg.addVertex(bstop.location);
      // busStop = new BusStop(bstop.code, bstop.id, bstop.location, bstop.name);
      var busStopIndex = HCL.busStop.searchBusStop(bstop.id);
      // console.log("busstop", bstop.id,  "found: ", busStopIndex);
      if(-1 != busStopIndex) {
        HCL.busStop.cache[busStopIndex].addBusLine(routeInfo.id, routeInfo.code, thisLegDirection);
        this._busStops[i][j] = busStopIndex;
        continue;
      }
      busStop = null;
      busStop = new HCL.busStop.BusStop();
      busStop.setCode(bstop.code);
      busStop.setId(bstop.id); busStopIds.push(bstop.id);
      busStop.setLatLng(bstop.location[HCL.location.LATITUDE], bstop.location[HCL.location.LONGITUDE]);
      busStop.setName(bstop.name);
      busStop.setMap(this._map);
      if(j == 0 || j == thisLeg.stops.length - 1) {
        // Add a flag is the stop is the start stop or last stop
        busStop.setIsTerminal();
      }
      busStop.addBusLine(routeInfo.id, routeInfo.code, thisLegDirection);
      busStopIndex = HCL.busStop.addBusStop(busStop);   // all bus stops are stored in this global array
      this._busStops[i][j] = busStopIndex;
      
      
    }

    // this._legs[i] = routeLeg;
    busLegIndex = HCL.busLeg.addBusLeg(routeLeg);
    this._legs[i] = busLegIndex;
  }
  HCL.busStop.loadStopData(busStopIds);
}

BusLine.prototype.getLeg = function(inI) {
  return this._legs[inI];
}

BusLine.prototype.buildBusStops = function() {
  var busStopsCache = HCL.busStop.cache;
  for(var i = 0; i < this._busStops.length; i++) {
    for(var j = 0; j < this._busStops[i].length; j++) {
      busStopsCache[this._busStops[i][j]].buildMarker();
    }
  }
}

BusLine.prototype.toggleDisplayBusStops = function(inDirection) {
  if(inDirection == HCL.busLine.direction.BOTH) {
    for(var i = 0; i < this._busStops.length; i++) {
      for(var j = 0; j < this._busStops[i].length; j++) {
        // console.log(i, j, this._busStops[i][j], this._legs[i]);
        HCL.busStop.toggleDisplayMarkerByIndex(this._busStops[i][j], this._legs[i]);
      }
    }
  } else {
    for(var j = 0; j < this._busStops[inDirection].length; j++) {
      HCL.busStop.toggleDisplayMarkerByIndex(this._busStops[inDirection][j], this._legs[inDirection]);
    }
  }
};

BusLine.prototype.displayBusStops = function(inDirection) {
  if(inDirection == HCL.busLine.direction.BOTH) {
    for(var i = 0; i < this._busStops.length; i++) {
      for(var j = 0; j < this._busStops[i].length; j++) {
        HCL.busStop.displayMarkerByIndex(this._busStops[i][j]);
      }
    }
  } else {
    for(var j = 0; j < this._busStops[inDirection].length; j++) {
      HCL.busStop.displayMarkerByIndex(this._busStops[inDirection][j]);
    }
  }
}

BusLine.prototype.hideBusStops = function(inDirection) {
  var busStopsCache = HCL.busStop.cache;
  if(inDirection == HCL.busLine.direction.BOTH) {
    for(var i = 0; i < this._busStops.length; i++) {
      for(var j = 0; j < this._busStops[i].length; j++) {
        busStopsCache[this._busStops[i][j]].removeMarker();
      }
    }
  } else {
    for(var j = 0; j < this._busStops[inDirection].length; j++) {
      busStopsCache[this._busStops[inDirection][j]].removeMarker();
    }
  }
}

BusLine.prototype.buildBusLine = function() {
  for(var i = 0; i < this._legs.length; i++) {
    HCL.busLeg.cache[this._legs[i]].buildPolyline();
  }
}

BusLine.prototype.displayBusLine = function(inDirection) {

  if(inDirection == HCL.busLine.direction.BOTH) {
    HCL.busLeg.cache[this._legs[HCL.busLine.direction.DEPART]].displayPolyline();
    HCL.busLeg.cache[this._legs[HCL.busLine.direction.RETURN]].displayPolyline();
  } else {
    HCL.busLeg.cache[this._legs[inDirection]].displayPolyline();
  }
}

BusLine.prototype.removeBusLine = function(inDirection) {
  if(inDirection == HCL.busLine.direction.BOTH) {
    HCL.busLeg.cache[this._legs[HCL.busLine.direction.DEPART]].removePolyline();
    HCL.busLeg.cache[this._legs[HCL.busLine.direction.RETURN]].removePolyline();
  } else {
    HCL.busLeg.cache[this._legs[inDirection]].removePolyline();
  }
}

BusLine.prototype.isDisplaying = function() {
  return (HCL.busLeg.cache[this._legs[HCL.busLine.direction.DEPART]].isDisplaying()  || HCL.busLeg.cache[this._legs[HCL.busLine.direction.RETURN]].isDisplaying());
}

BusLine.prototype.toggleDisplay = function(inDirection, inDisplayStops) {
  if(inDirection == HCL.busLine.direction.BOTH) {
    HCL.busLeg.cache[this._legs[HCL.busLine.direction.DEPART]].toggleDisplay();
    if(HCL.busLeg.cache[this._legs[HCL.busLine.direction.RETURN]]){
      HCL.busLeg.cache[this._legs[HCL.busLine.direction.RETURN]].toggleDisplay();
    }
  } else {
    HCL.busLeg.cache[this._legs[inDirection]].toggleDisplay();
  }
  if(inDisplayStops == false) {
  } else {
    this.toggleDisplayBusStops(inDirection);
  }
}

BusLine.prototype.printLegs = function() {
  // this function is not working
  var str = "";
  str += this._legs[0].printStops();
  str += this._legs[1].printStops();
  
  var dom = document.getElementById('businfodisplay');
  dom.textContent = str;
}

