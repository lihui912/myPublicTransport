var HCL = HCL || {};
HCL.tools = HCL.tools || {};

HCL.tools.generateRapidUrl = function(inJson) {
  // console.log(inJson);
  var routesData = inJson.data.routes;
  var routesCount = inJson.data.routes.length;

  var prefix = "http://jp.myrapid.com.my/query/route?&route=";
  var outputFragment = document.createDocumentFragment();
  
  var outputStr = "";
  var domHolder = document.getElementById("displayResult");
  
  
  for(var i = 0; i < routesCount; i++) {
    outputStr = "wget -O " + routesData[i].code + ".json ";
    
    outputStr += encodeURI(prefix + routesData[i].code);

    console.log(outputStr);
    
    var outputRow = document.createElement("span");
    outputRow.textContent = outputStr;
    
    var domBr = document.createElement("br");
    
    outputFragment.appendChild(outputRow);
    outputFragment.appendChild(domBr);
  }
  
  domHolder.appendChild(outputFragment);
  
  
}

HCL.tools.generateGoogleMapsDirectionUrl = function(inJson) {
  var prefix = "https://maps.googleapis.com/maps/api/directions/json?key=AIzaSyBJ0FvyHxnOmZiku0gdfsvA6Yx8-urIckw&mode=transit&transit_mode=bus&departure_time=1422172800&";
  
  var originLatLng = "";
  var destinationLatLng = "";
  
  var routeLength = inJson.routes.length;

  if(routeLength != 2) {
    document.error("routeLength = " + routeLength);
    return;
  }
  
  var domHolder = document.getElementById("displayResult");
  var outputFragment = document.createDocumentFragment();
  
  for(var i = 0; i < routeLength; i++) {
    var thisRoute = inJson.routes[i].route[0];
    var thisRouteCode = thisRoute.route.code;
    var thisRouteStops = thisRoute.stops;
    var firstIndex = 0;
    var lastIndex = thisRouteStops.length - 1;

    originLatLng = thisRouteStops[0].location[0] + "," + thisRouteStops[0].location[1];
    
    destinationLatLng = thisRouteStops[lastIndex].location[0] + "," + thisRouteStops[lastIndex].location[1];
    
    var ahref = prefix + "origin=" + originLatLng + "&destination=" + destinationLatLng;
    
    var aDom = document.createElement("a");
    aDom.href = ahref;
    aDom.textContent = thisRouteCode + " " + i + " " + ahref;
    var domBr = document.createElement("br");
    outputFragment.appendChild(aDom);
    outputFragment.appendChild(domBr);
  }
  domHolder.appendChild(outputFragment);
}

HCL.tools.busStopsAnalyz = [];
HCL.tools.analyzBusStopsLines = function(inJson) {
  
  var routeLength = inJson.routes.length;
  
  if(routeLength != 2) {
    document.error("routeLength = " + routeLength);
    return;
  }
  
  for(var i = 0; i < routeLength; i++) {
    
    var thisLeg = inJson.routes[i].route[0];
    var thisRouteCode = thisLeg.route.code;
    var thisLegStops = thisLeg.stops;
    var thisLegStopsLength = thisLegStops.length;
    
    for(var j = 0; j < thisLegStopsLength; j++) {
      var busStopIndex = HCL.tools.searchBusStop(thisLegStops[j].code);
      if(busStopIndex === false) {
        busStopIndex = HCL.tools.addBusStop(thisLegStops[j]);
      }
      if(HCL.tools.searchBusLineInBusStop(busStopIndex, thisRouteCode) === false) {
        HCL.tools.addBusLineToBusStop(busStopIndex, thisRouteCode);
      }
    }
  }
}

HCL.tools.searchBusStop = function(inCode) {
  var busStopsArray = HCL.tools.busStopsAnalyz;
  var arrayLength = busStopsArray.length;
  
  for(var i = 0; i < arrayLength; i++) {
    if(busStopsArray[i].code == inCode) {
      return i;
    }
  }
  return false;
}

HCL.tools.addBusStop = function(inBusObject) {
  var busStopsArray = HCL.tools.busStopsAnalyz;
  
  inBusObject.busLine = [];
  
  return HCL.tools.busStopsAnalyz.push(inBusObject) - 1;
}

HCL.tools.addBusLineToBusStop = function(inBusStopIndex, inBusLineCode) {
  var thisBusStop = HCL.tools.busStopsAnalyz[inBusStopIndex];
  
  thisBusStop.busLine.push(inBusLineCode);
}

HCL.tools.searchBusLineInBusStop = function(inBusStopIndex, inBusLineCode) {
  var thisBusStop = HCL.tools.busStopsAnalyz[inBusStopIndex];
  
  var thisStopLineLength = thisBusStop.busLine.length;
  
  for(var i = 0; i < thisStopLineLength; i++) {
    if(thisBusStop.busLine[i] == inBusLineCode) {
      return true;
    }
  }
  return false;
}

HCL.tools.test1 = function(inA, inB) {
  var a = inA;
  var b = inB;
  
  function fsetA(inA) {
    a = inA;
  }
  
  return {
    setA: fsetA,
    setB: function (inB) {
      b = inB;
    },
    add: function () {
      return a + b;
    }
  }
  
}

HCL.busStop = HCL.busStop || {};
HCL.busStop.cache = HCL.busStop.cache || [];

HCL.busStop.addBusStop = function(inBusObject) {
  var index = HCL.busStop.searchBusStop(inBusObject.getCode())
  if(-1 == index) {
    index = HCL.busStop.cache.push(inBusObject) - 1;
  }
  return index;
};

HCL.busStop.searchBusStop = function(inCode) {
  var busStopsArray = HCL.busStop.cache;
  var arrayLength = busStopsArray.length;
  
  for(var i = 0; i < arrayLength; i++) {
    if(busStopsArray[i].getCode() == inCode) {
      return i;
    }
  }
  return -1;
};

HCL.busStop.displayAllMarker = function() {
  var busStopsArray = HCL.busStop.cache;
  var arrayLength = busStopsArray.length;

  for(var i = 0; i < arrayLength; i++) {
    busStopsArray[i].displayMarker();
  }
};

HCL.busStop.hideAllMarker = function() {
  var busStopsArray = HCL.busStop.cache;
  var arrayLength = busStopsArray.length;

  for(var i = 0; i < arrayLength; i++) {
    busStopsArray[i].hideMarker();
  }
};

HCL.busStop.toggleDisplayAllMarker = function () {
  var busStopsArray = HCL.busStop.cache;
  var arrayLength = busStopsArray.length;

  for(var i = 0; i < arrayLength; i++) {
    busStopsArray[i].toggleDisplayMarker();
  }
};

HCL.busStop.BusStop = function() {
  var _code = "";
  var _id = 0;
  var _name = "";
  var _lat = 0.0;
  var _lng = 0.0;
  
  var _map = null;
  var _marker = null;
  var _markerOptions = {};
  var _markerIsDisplaying = false;
  
  var _busLines = [];
  
  function _setCode(inCode) {
    _code = inCode;
  };
  
  function _getCode() {
    return _code;
  }
  
  function _setId(inId) {
    _id = inId;
  };
  
  function _setName(inName) {
    _name = inName.trim();
  };
  
  function _getName() {
    return _name;
  }
  
  function _setLatLng(inLat, inLng) {
    _lat = inLat;
    _lng = inLng;
  };
  
  function _getLatLng() {
    return [_lat, _lng];
  }
  
  function _setMap(inMap) {
    _map = inMap;
  }
  
  function _buildMarker() {
    _markerOptions.title = _name;
    _markerOptions.icon = 'https://maps.gstatic.com/mapfiles/ms2/micons/pink-dot.png';
    try {
      _marker = new google.maps.Marker();
      _markerOptions.position = new google.maps.LatLng(_lat, _lng);
      _marker.setOptions(_markerOptions);
      google.maps.event.addListener(HCL.map._map, 'zoom_changed', function(){
        
        var zoom = HCL.map._map.getZoom();
        console.log("zoom changed: ", zoom);
        if(zoom > 15) {
          _markerOptions.icon = 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png';
        } else {
          _markerOptions.icon = 'https://maps.gstatic.com/mapfiles/ms2/micons/pink-dot.png';
        }
        _marker.setOptions(_markerOptions);
      });
    } catch (error) {
      console.error(error);
    }
  }
  
  function _changeMarkerOptions(inObj) {
    // TODO
    _marker.setOptions(_markerOptions);
  }
  
  function _displayMarker() {
    if(_markerIsDisplaying === true) { return; }
    _marker.setMap(_map);
    _markerIsDisplaying = false;
  }
  
  function _hideMarker() {
    if(_markerIsDisplaying === false) { return; }
    _marker.setMap(null);
    _markerIsDisplaying = false;
  }
  
  function _toggleDisplayMarker() {
    if(_markerIsDisplaying === true) {
      _hideMarker();
    } else {
      _displayMarker();
    }
  };
  
  function _addBusLine(inLineCode, inDirection) {
    //example: {lineCode: "B123", direction: 1}
    if(inLineCode == undefined) { console.error("Line code must be defined."); return; }
    if(inDirection == undefined) { console.error("Direction must be defined."); return; }
    
    var index = _searchBusLine(inLineCode, inDirection);
    if(-1 == index) {
      index = _busLines.push({lineCode: inLineCode, direction: inDirection}) - 1;
    }
    return index;
  };
  
  function _searchBusLine(inLineCode, inDirection) {
    var arrayLength = _busLines.length;
    
    for(var i = 0; i < arrayLength; i++) {
     if(_busLines[i].lineCode == inLineCode && _busLines[i].direction == inDirection) {
       return i;
     } 
    }
    return -1;
  };
  
  function _toString() {
    return "BusStop " + _name + " code: " + _code + " at " + _lat + "," + _lng + ".";
  };
  
  return {
    setCode: _setCode,
    getCode: _getCode,
    setId: _setId,
    setName: _setName,
    getName: _getName,
    setLatLng: _setLatLng,
    getLatLng: _getLatLng,
    setMap: _setMap,
    buildMarker: _buildMarker,
    displayMarker: _displayMarker,
    hideMarker: _hideMarker,
    toggleDisplayMarker: _toggleDisplayMarker,
    addBusLine: _addBusLine,
    searchBusLine: _searchBusLine,
    toString: _toString
  };
};

HCL.lineLeg = HCL.lineLeg || {};

HCL.lineLeg.LineLeg = function(inId, inHeadsign) {
  var _id = inId;
  var _headsign = inHeadsign;
  var _direction = HCL.busLine.direction.UNKNOWN;
  
  var _coarsePolyline = "";
  var _finePolyline = "";
  
  var _finePolylineString = ""
  
  var _coarsePolylineVertex = [];
  var _finePolylineVertex = [];
  
  var _map = null;
  
  
  
  function _setMap(inMap) {
    _map = inMap;
  };
  
  function _setDirection(inDirection) {
    _direction = inDirection;
  };
  
  function _addVertex(inLatLng) {
    // inLatLng = [3.14, 1.41]
    
  };
  
  function _setFinePolyline(inPolylineString) {
    _finePolylineString = inPolylineString;
    
    var decodedArray = [];
    try {
      decodedArray = google.maps.geometry.encoding.decodePath(inPolylineString);
    } catch(error) { console.error(error); }
    
    if(decodedArray.length > 0) {
      for(var i = 0; i < decodedArray.length; i++) {
        _finePolylineVertex.push([decodedArray[i].lat(), decodedArray[i].lng()]);
      }
    }
  };
  
  function _buildPolyline() {
    
  }
  
  return {
    setMap: _setMap
  };
};