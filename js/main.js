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

/**
 *  Return index in the cache
 */
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

HCL.busStop.toggleDisplayMarkerById = function(inId) {
  
};

HCL.busStop.displayMarkerById = function(inId) {
  
  
};

HCL.busStop.hideMarkerById = function(inId) {
  
  
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

HCL.busStop.forcedHideAllMarker = function(inExceptStopId) {
  var busStopsArray = HCL.busStop.cache;
  var arrayLength = busStopsArray.length;
  console.log("forcedHideAllMarker", inExceptStopId);
  for(var i = 0; i < arrayLength; i++) {
    if(undefined != inExceptStopId) {
      if(busStopsArray[i].getId() == inExceptStopId) {
        continue;
      }
    }
    busStopsArray[i].forcedHideMarker();
  }
}

HCL.busStop.loadStopData = function(inArray) {
  
  
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "api/busStop/id/" + inArray.toString(),
    success: function(inJson) {
      console.log(inJson);
      if(!inJson.data) {
        console.error("Some error here.");
        return ;
      }
      var dataLength = inJson.data.length;
      for(var i = 0; i < dataLength; i++) {
        var thisStop = inJson.data[i];
        var cacheIndex = HCL.busStop.searchBusStop(thisStop.id);
        
        HCL.busStop.cache[cacheIndex].loadMoreData(thisStop);
      }

    },
    error: function(xhr, status, errorThrown) {
      console.error("error");
    }
  });
}

HCL.busStop.BusStopController = function(inId, inCode, inName, inLat, inLng, inMap) {
  
  
  function _displayBusStop() {
    
  }
  
  function _hideBusStop() {
    
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
  var _listenerMouseOver = null;
  var _listenerMouseOut = null;
  var _listenerMouseClick = null;
  
  
  
  function _setCode(inCode) {
    _code = inCode.trim();
  };
  
  function _getCode() {
    return _code;
  }
  
  function _setId(inId) {
    _id = inId;
    // HCL.busLine.loadStopData(inId, _loadMoreData);
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
  
  function _loadMoreData(inJson) {
    // console.log(inJson.busLine.length);
    var allLegs = inJson.busLine;
    var legsCount = inJson.busLine.length;
    for(var i = 0; i < legsCount; i++) {
      _addBusLine(allLegs[i].id, allLegs[i].code, allLegs[i].direction);
    }
  }
  
  function _buildMarker() {
    if(_markerIsBuilt == true) {return;}
    
    _markerOptions.title = _name;
    try {
      _marker = new google.maps.Marker();
      _markerOptions.position = new google.maps.LatLng(_lat, _lng);
      _markerOptions.clickable = true;
      var zoom = HCL.map._map.getZoom();
      if(zoom > 15) {
        _markerOptions.icon = '//maps.gstatic.com/mapfiles/ms2/micons/green-dot.png';
      } else {
        _markerOptions.icon = '//maps.gstatic.com/mapfiles/ms2/micons/pink-dot.png';
      }
      _marker.setOptions(_markerOptions);
      _markerIsBuilt = true;
      
      _markerIcon = _marker.getIcon();
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
      _listenerMouseOver = google.maps.event.addListener(_marker, 'mouseover', function(event) {
        var domDisplayStopName = document.getElementById("displayBusStop");
        var domDisplayBusLines = document.getElementById("displayBusLines");
        
        domDisplayStopName.textContent = _name;
        domDisplayBusLines.textContent = _getBusLineString();
        
        _markerIcon = _marker.getIcon();
        _markerOptions.icon = '//maps.gstatic.com/mapfiles/ms2/micons/ltblue-dot.png';
        _marker.setOptions(_markerOptions);
      });
      
      _listenerMouseOut = google.maps.event.addListener(_marker, 'mouseout', function(event) {
        
        _markerOptions.icon = _markerIcon;
        _marker.setOptions(_markerOptions);
      });
      
      _listenerMouseClick = google.maps.event.addListener(_marker, 'click', function(event) {
        // event.latLng
        // load bus legs
        // HCL.busLeg.searchBusLegById();
        console.log(event, "clicked");
        HCL.busStop.forcedHideAllMarker(_getId());
        console.log(_getBusLine());
        var arrayBusLine = _getBusLine();
        var arrayLength = arrayBusLine.length;
        for(var i = 0; i < arrayLength; i++) {
          console.log(arrayBusLine[i]);
          HCL.busLine.toggleDisplay(arrayBusLine[i].lineCode, arrayBusLine[i].direction, false);
        }
      });

    } catch(error) {
      console.error(error);
    }
    
    _markerIsDisplaying = true;
  }
  
  function _hideMarker(inBusLegIndex) {
    if(_markerIsDisplaying === false) { return; }
    // console.trace();console.log(arguments);
    var index = _displayingBusLegs.indexOf(inBusLegIndex);
    var removed = _displayingBusLegs.splice(index, 1);  // remove 1 item at "index"
    
    if(_displayingBusLegs.length > 0) { return; }
    
    try {
      _marker.setMap(null);
      google.maps.event.removeListener(_listenerMouseOver);
      google.maps.event.removeListener(_listenerMouseOut);
    } catch(error) {console.error(error);}
    _markerIsDisplaying = false;
    
  }
  
  function _toggleDisplayMarker(inBusLegIndex) {
    var index = _displayingBusLegs.indexOf(inBusLegIndex);

    if(-1 < index) {
      // already in list, so hide it
      _hideMarker(inBusLegIndex);
    } else if(-1 == index) {
      // not found in list, so display it
      _displayMarker(inBusLegIndex);
    }
  };
  
  function _forcedHideMarker() {
    if(_markerIsDisplaying === false) { return; }
    _displayingBusLegs.length = 0;
    try {
      _marker.setMap(null);
      google.maps.event.removeListener(_listenerMouseOver);
      google.maps.event.removeListener(_listenerMouseOut);

    } catch(error) {console.error(error);}
    _markerIsDisplaying = false;
  }
  
  function _isDisplaying() {
    return _markerIsDisplaying;
  };
  
  function _showDisplayingBusLegs() {
    return _displayingBusLegs.toString();
  };
  
  function _toggleDisplayBusLeg(inIndex) {
    if(_isDisplayingBusLeg) {
      _hideBusLeg(inIndex);
    } else {
      _displayBusLeg(inIndex);
    }
  }
  
  function _displayBusLeg(inIndex) {
    HCL.busLeg.displayBusLegByIndex(inIndex);
    
  }
  
  function _hideBusLeg(inIndex) {
    HCL.busLeg.hideBusLegByIndex(inIndex);
  }
  
  function _displayBusLegById(inId, inDirection) {
    
  }
  
  function _addBusLine(inLineId, inLineCode, inDirection) {
    // console.log(arguments);console.trace()
    //example: {lineCode: "B123", direction: 1}
    if(inLineCode == undefined) { console.error("Line code must be defined."); return; }
    if(inDirection == undefined) { console.error("Direction must be defined."); return; }
    
    var index = _searchBusLineById(inLineId, inDirection);
    if(-1 == index) {
      index = _busLines.push({"lineId": inLineId, "lineCode": inLineCode, "direction": inDirection}) - 1;
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
  
  function _searchBusLineById(inLineId, inDirection) {
    var arrayLength = _busLines.length;
    
    for(var i = 0; i < arrayLength; i++) {
     if(_busLines[i].lineId == inLineId && _busLines[i].direction == inDirection) {
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
    // return "BusStop " + _name + " code: " + _code + " at " + _lat + "," + _lng + ".";
    return JSON.serialize(this);
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
    forcedHideMarker: _forcedHideMarker,
    toggleDisplayMarker: _toggleDisplayMarker,
    showDisplayingBusLegs: _showDisplayingBusLegs,
    loadMoreData: _loadMoreData,
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

HCL.busLeg.searchBusLegById = function(inRouteId, inDirection) {
  var cacheArray = HCL.busLeg.cache;
  var cacheLength = cacheArray.length;
  
  for(var i = 0; i < cacheLength; i++) {
    console.log(cacheArray[i])
    if(cacheArray[i].getRouteId() == inRouteId && cacheArray[i].getDirection() == inDirection) {
      return i;
    }
  }
  
  return -1;
};

HCL.busLeg.displayBusLegByIndex = function(inIndex) {
  if(HCL.busLeg.cache[inIndex] == undefined) {
    console.error("Index " + inIndex + " has nothing here!");
    return;
  }
  
  HCL.busLeg.cache[inIndex].displayPolyline();
};

HCL.busLeg.hideBusLegByIndex = function(inIndex) {
  if(HCL.busLeg.cache[inIndex] == undefined) {
    console.error("Index " + inIndex + " has nothing here!");
    return;
  }
  
  HCL.busLeg.cache[inIndex].removePolyline();

}
