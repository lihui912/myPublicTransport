var HCL = HCL || {};
HCL.map = HCL.map || {};
HCL.busLine = HCL.busLine || {};
HCL.busLine.cache = [];
HCL.busLine.cache.NOTFOUND = -1;

HCL.busLine.direction = {};
HCL.busLine.direction.UNKNOWN = -2;
HCL.busLine.direction.BOTH   = -1;
HCL.busLine.direction.DEPART = 0;
HCL.busLine.direction.RETURN = 1;

HCL.location = HCL.location || {};
HCL.location.LATITUDE  = 0;
HCL.location.LONGITUDE = 1;

HCL.area = HCL.area || {};
HCL.area.unparsedCache = HCL.area.unparsedCache || [];
HCL.area.parsedCache = HCL.area.parsedCache || [];
HCL.area.cache = HCL.area.cache || [];

HCL.busLine.addToCache = function(inObj) {
  var searchResult = HCL.busLine.searchCache(inObj._routeCode);
  if(searchResult == HCL.busLine.cache.NOTFOUND) {
    return HCL.busLine.cache.push(inObj) - 1;  // return the index
  } else {
    return searchResult;
  }
  
  
};

HCL.busLine.searchCache = function(inRouteCode) {
  var cache = HCL.busLine.cache;
  var cacheLength = cache.length;
  for(var i = 0; i < cacheLength; i++) {
    if(cache[i]._routeCode == inRouteCode) {
      // console.log("BusLine " + inRouteCode + " found at index " + i);
      return i;  // return the index
    }
  }
  return HCL.busLine.cache.NOTFOUND;
}

HCL.busLine.loadBusLine = function(inRouteCode, inCallback, inDirection) {
  var searchResult = HCL.busLine.searchCache(inRouteCode);
  if(searchResult > HCL.busLine.cache.NOTFOUND) {
    console.log("BusLine " + inRouteCode + " found at index " + searchResult);
    return searchResult;
  }
  console.log("BusLine " + inRouteCode + " not found. Load from server.");
  $.ajax({
    url: "routes/" + inRouteCode + ".json",
    type: "GET",
    dataType: "json",
    success: function(inJson) {
      // console.log(inJson);
      var busLine = new BusLine(HCL.map._map, inJson);
      
      var busLineIndex = HCL.busLine.addToCache(busLine);
      console.log("busLineIndex: " + busLineIndex);
      inCallback(inRouteCode, inDirection);
      return busLineIndex;
    },
    error: function(xhr, status, errorThrown) {
      console.error(arguments);
    }
  });
}


HCL.busLine.toggleDisplay = function(inRouteCode, inDirection) {
  console.log("toggleDisplay", inRouteCode, inDirection);
  var busLineIndex = HCL.busLine.searchCache(inRouteCode);
  if(busLineIndex == HCL.busLine.cache.NOTFOUND) {
    HCL.busLine.loadBusLine(inRouteCode, HCL.busLine._toggleDisplay, inDirection);
  } else {
    HCL.busLine._toggleDisplay(inRouteCode, inDirection);
  }
}

HCL.busLine._toggleDisplay = function(inRouteCode, inDirection) {
  var busLineIndex = HCL.busLine.searchCache(inRouteCode);
  var thisLine = HCL.busLine.cache[busLineIndex];
  thisLine.toggleDisplay(inDirection);
}

HCL.busLine.hideBusLine = function(inRouteCode, inDirection) {
  var busLineIndex = HCL.busLine.searchCache(inRouteCode);
  var thisLine = HCL.busLine.cache[busLineIndex];
  thisLine.removeBusLine(inDirection);
}



HCL.busLine.loadData = function(inCallback) {
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "routes/area.json",
    success: function(inJson) {
      inCallback(inJson);

    },
    error: function(xhr, status, errorThrown) {
      console.error("error");
    }
  });

}

HCL.busLine.loadRouteData = function(inRouteCode, inCallback) {
  inRouteCode = inRouteCode.toUpperCase();
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "routes/" + inRouteCode + ".json",
    success: function(inJson) {
      console.log(inJson);
      inCallback(inJson);

    },
    error: function(xhr, status, errorThrown) {
      console.error("error");
    }
  });
}

HCL.busLine.generateDOMRows = function(inJson) {
  console.log(inJson);
  var routesData = inJson.data.routes;
  var routesCount = inJson.data.routes.length;
  var routesAreas = inJson.data.areas;
  
  //generate DOM fragments;
  var areaContainers = [];
  var tempDomFragments = [];
  for(var j = 0; j < routesAreas.length; j++) {
    areaContainers[routesAreas[j]] = document.getElementById("busAreaContainer_" + routesAreas[j]);
    tempDomFragments[routesAreas[j]] = document.createDocumentFragment();
  }
  
  for(var i = 0; i < routesCount; i++) {
    HCL.area.cache.push(routesData[i]);
    tempDomFragments[routesData[i].area].appendChild(HCL.busLine._generateDOMRow(routesData[i].code, routesData[i].title));
    if(i < routesCount - 1) {
      tempDomFragments[routesData[i].area].appendChild(document.createElement("br"));
    }
  }
  
  // push dom fragments to dom
  for(var j = 0; j < routesAreas.length; j++) {
    areaContainers[routesAreas[j]].appendChild(tempDomFragments[routesAreas[j]]);
  }
}

HCL.busLine._generateDOMRow = function(inBusLineCode, inTitle) {
  var rootSpan = document.createElement("span");
  
  var aBoth   = document.createElement("a");
  var aDepart = document.createElement("a");
  var aReturn = document.createElement("a");
  
  var spanTitle = document.createElement("span");
  
  aBoth.id   = "both_" + inBusLineCode.trim();
  aDepart.id = "depart_" + inBusLineCode.trim();
  aReturn.id = "return_" + inBusLineCode.trim();
  
  aBoth.textContent   = "双 ";
  aDepart.textContent = "去 ";
  aReturn.textContent = "回 ";
  
  spanTitle.textContent = inTitle.trim();
  
  aBoth.addEventListener("click", this.eventListener);
  aDepart.addEventListener("click", this.eventListener);
  aReturn.addEventListener("click", this.eventListener);
  
  rootSpan.appendChild(aBoth);
  rootSpan.appendChild(aDepart);
  rootSpan.appendChild(aReturn);
  rootSpan.appendChild(spanTitle);
  
  //console.log(rootSpan);
  return rootSpan;
}

HCL.busLine.eventListener = function(event) {
  var idArray = event.target.id.split("_");
  if(idArray[0] == "both") {
    HCL.busLine.toggleDisplay(idArray[1], HCL.busLine.direction.BOTH);
  } else if(idArray[0] == "depart") {
    HCL.busLine.toggleDisplay(idArray[1], HCL.busLine.direction.DEPART);
  } else if(idArray[0] == "return") {
    HCL.busLine.toggleDisplay(idArray[1], HCL.busLine.direction.RETURN);
  }
}

HCL.area.parseArea = function() {
  var unparsedCache = HCL.area.unparsedCache;
  var cacheLength = unparsedCache.length;
  
  var result = {};
  result.status = "OK";
  result.data = {};
  result.data.routes = [];
  
  for(var j = 0; j < cacheLength; j++) {
    var thisAreaData = unparsedCache[j].data;
    var thisAreaCode = thisAreaData.area.split(" ")[1] * 1;
    var thisAreaRoutes = thisAreaData.routes;
    var thisAreaRoutesLength = thisAreaRoutes.length;
// console.log("thisAreaRoutesLength", thisAreaRoutesLength);
    for(var i = 0; i < thisAreaRoutesLength; i++) {
      var newObj = {};
      var item = thisAreaRoutes[i];
      newObj.code = item.code;
      newObj.title = item.title;
      newObj.area = thisAreaCode;
      
      result.data.routes.push(newObj);
    }
    
  }
  console.log(result);
  return result;
}