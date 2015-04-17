function RouteLeg(inId, inHeadSign, inRouteCode) {
  this._map = null;
  
  this._pathString = "";
  this._id = inId;
  this._headSign = inHeadSign;
  this._routeCode = "";
  this._vertex = [];
  try {
  this._bounds = new google.maps.LatLngBounds();
  } catch(error) {console.error(error);}
  this._direction = "";
  this._polylineIsDisplaying = false;
  
  this._polylineString = null;
}

RouteLeg.prototype.convertPathStringToArray = function() {
  // call google maps javascript api
}

RouteLeg.prototype.setMap = function(inMap) {
  // console.log(inMap);
  this._map = inMap;
}

RouteLeg.prototype.setLegId = function(inId) {
  this._id = inId;
}

RouteLeg.prototype.getLegId = function() {
  return this._id;
}

RouteLeg.prototype.setHeadSign = function(inHeadSign) {
  this._headSign = inHeadSign;
}

RouteLeg.prototype.getHeadSign = function() {
  return this._headSign;
}

RouteLeg.prototype.getRouteCode = function() {
  return this._routeCode;
};

RouteLeg.prototype.addVertex = function(inLatLng) {
  try{
    this._bounds.extend(new google.maps.LatLng(inLatLng[HCL.location.LATITUDE], inLatLng[HCL.location.LONGITUDE]));
  } catch(error) {console.error(error);}
  // console.log("LegId", this._id, "bounds", this._bounds.toString());
  this._vertex.push(inLatLng);
}

RouteLeg.prototype.setPolyline = function(inPolylineString) {
  this._polylineString = inPolylineString;
  console.log(inPolylineString);
  var decodedArray = [];
  decodedArray = google.maps.geometry.encoding.decodePath(inPolylineString);
  console.log(decodedArray);
  if(decodedArray.length > 0) {
    for(var i = 0; i < decodedArray.length; i++) {
      this.addVertex([decodedArray[i].lat(), decodedArray[i].lng()]);
    }
  }
}
/*
RouteLeg.prototype.getStop = function(inI) {
  return this._stops[inI];
}
*/
/*
RouteLeg.prototype.getNextStop = function() {
  if(this._currentStopIndex < this._stops.length) {
    return this._stops[this._currentStopIndex++];
  } else {
    this._currentStopIndex = 0;
    return this._stops[this._currentStopIndex++];
  }
}
*/
RouteLeg.prototype.buildPolyline = function() {
  
  this._polyline = new google.maps.Polyline();
  this._polylineOptions = {};
  
  this._polylineOptions.geodesic = true;
  this._polylineOptions.strokeOpacity = 0.75;
  this._polylineOptions.strokeWeight = 2.0;
  this._polylineOptions.strokeColor = (this._direction == 0) ? Utils.Color.RED : Utils.Color.GREEN;
  
  this._polylineOptions.path = [];
  var stopLatLng;
  for(var i = 0; i < this._vertex.length; i++) {
    stopLatLng = this._vertex[i];
    this._polylineOptions.path.push(new google.maps.LatLng(stopLatLng[0], stopLatLng[1]));
    
  }
  
  this._polylineOptions.icons = [{
    icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW},
    repeat: '35px',
    offset: '100%'
  }];
  
  this._polyline.setOptions(this._polylineOptions);
  
  // google.maps.event.addListener(this._polyline, 'click', function(event) {console.log(event);});
  // google.maps.event.addListener(this._polyline, 'mouseover', function(event) {console.log(event);});
}

RouteLeg.prototype.displayPolyline = function() {
  if(this._polylineIsDisplaying == true) {return;}
  try {
    this._polyline.setMap(this._map);
  } catch(error) {console.error(error);}
  this._polylineIsDisplaying = true;
  // console.log("displayPolyline", this._polylineIsDisplaying);
}

RouteLeg.prototype.removePolyline = function() {
  if(this._polylineIsDisplaying == false) {return;}
  try {
    this._polyline.setMap(null);
  } catch(error) {console.error(error);}
  this._polylineIsDisplaying = false;
}

RouteLeg.prototype.toggleDisplay = function() {
  // console.log("toggleDisplay", this._polylineIsDisplaying);
  if(this._polylineIsDisplaying) {
    this.removePolyline();
  } else {
    this.displayPolyline();
  }
}

RouteLeg.prototype.isDisplaying = function() {
  return this._polylineIsDisplaying;
}

RouteLeg.prototype.setDirection = function(inDirection) {
  this._direction = inDirection;
}

RouteLeg.prototype.getDirection = function() {
  return this._direction;
};

RouteLeg.prototype.setRouteCode = function(inRouteCode) {
  this._routeCode = inRouteCode;
}

RouteLeg.prototype.evZoomChanged = function(inZoom) {
  // do whatever when zoom changed
  
}

RouteLeg.prototype.evIdle = function(inZoom, inBounds) {
  // var isInBounds = inBounds.contain(this._bounds);
  
  var isInBounds = this._bounds.intersects(inBounds);
  
  if(isInBounds == true) {
    this._polyline.setVisible(true);
  } else {
    this._polyline.setVisible(false);
  }
  
  // console.log("evIdle LegId", this._id, "isVisible", this._polyline.getVisible());
}
/*
RouteLeg.prototype.printStops = function() {
  var stopCount = this._stops.length;
  var tempArr = [], tempBusStopObj;
  var str = "";
  for(var i = 0; i < stopCount; i++) {
    tempArr.push(i + 1);
    tempArr.push(this._routeCode);
    tempArr.push(this._direction);
    
    tempBusStopObj = this._stops[i].getObject();
    tempArr.push(tempBusStopObj.id);
    tempArr.push(tempBusStopObj.code);
    tempArr.push(String(tempBusStopObj.isTerminal).toUpperCase());
    tempArr.push(tempBusStopObj.lat);
    tempArr.push(tempBusStopObj.lng);
    tempArr.push("\"" + tempBusStopObj.name + "\"");
    str += tempArr.join(",");
    str += '\n';
    tempArr.length = 0;
  }
  console.log(str);
  return str;
}
*/