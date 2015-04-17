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
  /*
  if(routeLength != 2) {
    document.error("routeLength = " + routeLength);
    return;
  }
  */
  for(var i = 0; i < routeLength; i++) {
    
    var thisLeg = inJson.routes[i].route[0];
    var thisRouteCode = thisLeg.route.code;
    var thisLegStops = thisLeg.stops;
    var thisLegStopsLength = thisLegStops.length;
    
    for(var j = 0; j < thisLegStopsLength; j++) {
      var busStopIndex = HCL.tools.searchBusStop(thisLegStops[j].code, i);
      if(busStopIndex === HCL.busLine.cache.NOTFOUND) {
        busStopIndex = HCL.tools.addBusStop(thisLegStops[j]);
      }
      if(HCL.tools.searchBusLineInBusStop(busStopIndex, thisRouteCode, i) === HCL.busLine.cache.NOTFOUND) {
        HCL.tools.addBusLineToBusStop(busStopIndex, thisRouteCode, i);
      }
    }
  }
}

HCL.tools.searchBusStop = function(inCode) {
  var busStopsArray = HCL.tools.busStopsAnalyz;
  var arrayLength = busStopsArray.length;
  console.log("searchBusStop code:", inCode);
  for(var i = 0; i < arrayLength; i++) {
    if(busStopsArray[i].code == inCode) {
      return i;
    }
  }
  return HCL.busLine.cache.NOTFOUND;
}

HCL.tools.addBusStop = function(inBusObject) {
  var busStopsArray = HCL.tools.busStopsAnalyz;
  
  inBusObject.busLine = [];
  
  return HCL.tools.busStopsAnalyz.push(inBusObject) - 1;
}

HCL.tools.addBusLineToBusStop = function(inBusStopIndex, inBusLineCode, inDirection) {
  var thisBusStop = HCL.tools.busStopsAnalyz[inBusStopIndex];
  
  thisBusStop.busLine.push({"code" : inBusLineCode, "direction" : inDirection});
}

HCL.tools.searchBusLineInBusStop = function(inBusStopIndex, inBusLineCode, inDirection) {
  var thisBusStop = HCL.tools.busStopsAnalyz[inBusStopIndex];
  
  var thisStopLineLength = thisBusStop.busLine.length;
  
  for(var i = 0; i < thisStopLineLength; i++) {
    if(thisBusStop.busLine[i].code == inBusLineCode && thisBusStop.busLine[i].direction == inDirection) {
      return i;
    }
  }
  return HCL.busLine.cache.NOTFOUND;
}

HCL.tools.loadAllBusLine = function() {
  var busLineCache = HCL.area.cache;
  var busLineCacheLength = busLineCache.length;
  
  for(var i = 0; i < busLineCacheLength; i++) {
    HCL.busLine.loadRouteData(busLineCache[i].code, function(inJson) {
      HCL.tools.analyzBusStopsLines(inJson);
    });
  }
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
  var index = HCL.busStop.searchBusStop(inBusObject.getId())
  if(-1 == index) {
    index = HCL.busStop.cache.push(inBusObject) - 1;
  }
  return index;
};

HCL.busStop.searchBusStop = function(inId) {
  var busStopsArray = HCL.busStop.cache;
  var arrayLength = busStopsArray.length;
  
  for(var i = 0; i < arrayLength; i++) {
    if(busStopsArray[i].getId() == inId) {
      return i;
    }
  }
  return -1;
};

HCL.busStop.displayMarkerByIndex = function(inIndex) {
  HCL.busStop.cache[inIndex].displayMarker();
};

HCL.busStop.hideMarkerbyIndex = function(inIndex) {
  HCL.busStop.cache[inIndex].hideMarker();
};

HCL.busStop.toggleDisplayMarkerByIndex = function(inBusStopIndex, inLegIndex) {
  // console.log("busStop toggleDisplayMarkerByIndex: ", inBusStopIndex, inLegIndex);
  HCL.busStop.cache[inBusStopIndex].toggleDisplayMarker(inLegIndex);
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
  var _isTerminal = false;
  
  var _map = null;
  var _marker = null;
  var _markerOptions = {};
  var _markerIsDisplaying = false;
  var _markerIsBuilt = false;
  var _markerIcon = null;
  
  var _busLines = [];
  var _displayingBusLegs = [];
  
  var _listenerZoomChanged = null;
  
  function _setCode(inCode) {
    _code = inCode.trim();
  };
  
  function _getCode() {
    return _code;
  }
  
  function _setId(inId) {
    _id = inId;
  };
  
  function _getId() {
    return _id;
  }
  
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
  
  function _setIsTerminal() {
    _isTerminal = true;
  }
  
  function _setMap(inMap) {
    _map = inMap;
  }
  
  function _buildMarker() {
    if(_markerIsBuilt == true) {return;}
    
    _markerOptions.title = _name;
    try {
      _marker = new google.maps.Marker();
      _markerOptions.position = new google.maps.LatLng(_lat, _lng);
      
      var zoom = HCL.map._map.getZoom();
      if(zoom > 15) {
        _markerOptions.icon = '//maps.gstatic.com/mapfiles/ms2/micons/green-dot.png';
      } else {
        _markerOptions.icon = '//maps.gstatic.com/mapfiles/ms2/micons/pink-dot.png';
      }
      _marker.setOptions(_markerOptions);
      _markerIsBuilt = true;
      
      _markerIcon = _marker.getIcon();

     
      google.maps.event.addListener(_marker, 'mouseover', function(event) {
        var domDisplayStopName = document.getElementById("displayBusStop");
        domDisplayStopName.textContent = _name + " " + _getBusLineString();
        
        _markerIcon = _marker.getIcon();
        _markerOptions.icon = '//maps.gstatic.com/mapfiles/ms2/micons/ltblue-dot.png';
        _marker.setOptions(_markerOptions);
      });
      
      google.maps.event.addListener(_marker, 'mouseout', function(event) {
        
        _markerOptions.icon = _markerIcon;
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
  
  function _displayMarker(inBusLegIndex) {// console.log(inBusLegIndex);
    if(_markerIsDisplaying === true) {
      var index = _displayingBusLegs.indexOf(inBusLegIndex);
      // console.log(inBusLegIndex, "at index: ", index);
      if(-1 != index) {
        return;  // bus leg is already in list
      } else if(-1 == index) {
        _displayingBusLegs.push(inBusLegIndex);
        // bus stop is displaying, add bus leg into list
        return;
      }
    }
    _displayingBusLegs.push(inBusLegIndex);
    try {
      _marker.setMap(_map);
    } catch(error) {
      console.error(error);
    }
    
    _markerIsDisplaying = true;
    /*
    _listenerZoomChanged = google.maps.event.addListener(HCL.map._map, 'zoom_changed', function(){
      
      var zoom = HCL.map._map.getZoom();
      console.log("zoom changed: ", zoom);
      if(zoom > 15) {
        _markerOptions.icon = '//maps.gstatic.com/mapfiles/ms2/micons/green-dot.png';
      } else {
        _markerOptions.icon = '//maps.gstatic.com/mapfiles/ms2/micons/pink-dot.png';
      }
      
      _marker.setOptions(_markerOptions);
      _markerIcon = _marker.getIcon();
    });
    */
  }
  
  function _hideMarker(inBusLegIndex) { // console.log("_hideMarker", inBusLegIndex); //console.trace();
    if(_markerIsDisplaying === false) { return; }
    // console.log(_displayingBusLegs);
    var index = _displayingBusLegs.indexOf(inBusLegIndex);
    var removed = _displayingBusLegs.splice(index, 1);  // remove 1 item at index
    // console.log("_displayingBusLegs.length", _displayingBusLegs.length, "removed", removed, _displayingBusLegs);
    if(_displayingBusLegs.length > 0) { return; }
    
    try {
      _marker.setMap(null);
    } catch(error) {console.error(error);}
    _markerIsDisplaying = false;
    
    // google.maps.event.removeListener(_listenerZoomChanged);
  }
  
  function _toggleDisplayMarker(inBusLegIndex) {
    
    
    var index = _displayingBusLegs.indexOf(inBusLegIndex);
    // console.log("_markerIsDisplaying: ", _markerIsDisplaying, inBusLegIndex, "at index", index);
    if(-1 < index) {
      // already in list, so hide it
      _hideMarker(inBusLegIndex);
    } else if(-1 == index) {
      // not found in list, so display it
      _displayMarker(inBusLegIndex);
    }
    /*
    if(_markerIsDisplaying === true) {
      _hideMarker(inBusLegIndex);
    } else {
      _displayMarker(inBusLegIndex);
    }
    */
  };
  
  function _showDisplayingBusLegs() {
    return _displayingBusLegs.toString();
  };
  
  function _addBusLine(inLineCode, inDirection) {
    //example: {lineCode: "B123", direction: 1}
    if(inLineCode == undefined) { console.error("Line code must be defined."); return; }
    if(inDirection == undefined) { console.error("Direction must be defined."); return; }
    
    var index = _searchBusLine(inLineCode, inDirection);
    if(-1 == index) {
      index = _busLines.push({lineCode: inLineCode, direction: inDirection}) - 1;
    }
    // console.log("busstop", _id, "_addBusLine", inLineCode, "inDirection", inDirection, "at index", index);
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
  
  function _getBusLineString() {
    var outputStr = "";
    for(var i = 0; i < _busLines.length; i++) {
      outputStr += _busLines[i].lineCode;
      outputStr += "_";
      outputStr += _busLines[i].direction;
      outputStr += " ";
    }
    return outputStr.trim();
  };
  
  function _getBusLine() {
    return _busLines;
  };
  
  function _evZoomChanged(inZoom) {
    // this function is called by MapController when zoom changed occurred
    // do whatever when zoom changed
    
    if(inZoom < 13) {
      if(_isTerminal == true) {
        _marker.setVisible(true);
      } else if(_isTerminal == false) {
        _marker.setVisible(false);
      }
    } else {
      _marker.setVisible(true);
    }
      
    
    if(inZoom > 15) {
      _markerOptions.icon = '//maps.gstatic.com/mapfiles/ms2/micons/green-dot.png';
    } else {
      _markerOptions.icon = '//maps.gstatic.com/mapfiles/ms2/micons/pink-dot.png';
    }
    
    _marker.setOptions(_markerOptions);
    _markerIcon = _marker.getIcon();
  
  };
  
  function _evIdle(inZoom, inBound) {
    var thisLatLng = _getLatLng();
    var isInBound = inBound.contains(new google.maps.LatLng(thisLatLng[HCL.location.LATITUDE], thisLatLng[HCL.location.LONGITUDE]));
  
    if(isInBound == true) {
      _marker.setVisible(true);
    } else if(isInBound == false) {
      _marker.setVisible(false);
    }
    _marker.setOptions(_markerOptions);

  }
  
  function _toString() {
    return "BusStop " + _name + " code: " + _code + " at " + _lat + "," + _lng + ".";
  };
  
  return {
    setCode: _setCode,
    getCode: _getCode,
    setId: _setId,
    getId: _getId,
    setName: _setName,
    getName: _getName,
    setLatLng: _setLatLng,
    getLatLng: _getLatLng,
    setIsTerminal: _setIsTerminal,
    setMap: _setMap,
    buildMarker: _buildMarker,
    displayMarker: _displayMarker,
    hideMarker: _hideMarker,
    toggleDisplayMarker: _toggleDisplayMarker,
    showDisplayingBusLegs: _showDisplayingBusLegs,
    addBusLine: _addBusLine,
    searchBusLine: _searchBusLine,
    getBusLine: _getBusLine,
    getBusLineString: _getBusLineString,
    evZoomChanged: _evZoomChanged,
    evIdle: _evIdle,
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

HCL.busLeg = HCL.busLeg || {};
HCL.busLeg.cache = HCL.busLeg.cache || [];

HCL.busLeg.addBusLeg = function(inBusLeg) {
  var index = HCL.busLeg.searchBusLeg(inBusLeg.getRouteCode(), inBusLeg.getDirection());
  if(-1 == index) {
    index =  HCL.busLeg.cache.push(inBusLeg) - 1;
  }
  return index;
};

HCL.busLeg.searchBusLeg = function(inLineCode, inDirection) {
  var cacheArray = HCL.busLeg.cache;
  var cacheLength = cacheArray.length;
  
  var tmpRouteCode = "";
  var tmpDirection = "";
  for(var i = 0; i < cacheLength; i++) {
    tmpDirection = cacheArray[i].getDirection();
    tmpRouteCode = cacheArray[i].getRouteCode();
    
    if(tmpRouteCode == inLineCode && inDirection == tmpRouteCode) {
      return i;
    }
  }
  return -1;
};

HCL.busLeg.displayBugLegByIndex = function(inIndex) {
  if(HCL.busLeg.cache[inIndex] == undefined) {
    console.error("Index " + inIndex + " has nothing here!");
    return;
  }
  
  HCL.busLeg.cache[inIndex].displayPolyline();
};
