HCL.UI = HCL.UI || {};


HCL.UI.UI = function() {
  
  return {
    
  };
};

HCL.UI.historyClass = function() {
  var _mapLat = 0.0;
  var _mapLng = 0.0;
  var _mapZoom = 1;
  
  var _urlObject = {};
  
  
  // _parseUrl();
  window.onpopstate = _onPopState;
  //history.replaceState({}, document.title, document.location.href);
  
  function _parseUrl() {
    var path = document.location.pathname;
    var searchStr = decodeURIComponent(document.location.search);
    path = path.substring(1);
    searchStr = searchStr.substring(1).split('&');
    var searchStrLength = searchStr.length;
    // console.log(searchStr[0].split('='));
    // console.log(path);
    var result = {};
    for(var i = 0; i < searchStrLength; i++) {
      var pair = searchStr[i].split('=');
      result[pair[0]] = pair[1];
    }
    _urlObject = result;
    console.log(result);
    return result;
  }
  
  function _serializeUrl() {
    var str = "";
    for(var key in _urlObject) {
      if(str != '') {
        str += '&';
      }
      str += key + '=' + _urlObject[key];
    }
    return str;
  }
  
  function _update(lat, lng, zoom) {
    if(lat && lng && zoom) {
      _mapLat = lat;
      _mapLng = lng;
      _mapZoom = zoom;
    } else {
      _mapLat = HCL.map._map.getCenter().lat().toFixed(6);
      _mapLng = HCL.map._map.getCenter().lng().toFixed(6);
      _mapZoom = HCL.map._map.getZoom();
    }
    console.log(_mapLat, _mapLng, _mapZoom);
    _pushState();
  }
  
  function _updateMap() {
    
  }
  
  function _pushState() {
    history.pushState({"lat": _mapLat, "lng": _mapLng, "zoom": _mapZoom}, document.title, "?map=" + _mapLat + "," + _mapLng + "," + _mapZoom);
  }
  
  function _onPopState(event) {
    console.log(event);
    var stateObj = event.state;
    HCL.map.setOptions({"lat": stateObj.lat, "lng": stateObj.lng, "zoom": stateObj.zoom});
  }
  
  return {
    parseUrl: _parseUrl,
    update: _update,
    updateMap: _updateMap,
    pushState: _pushState
    
  };
};

HCL.UI.search = function(inInputDomId, inOutputDomId) {
  var inputDom = document.getElementById(inInputDomId);
  var outputDom = document.getElementById(inOutputDomId);
  var outputBusStopDom = document.getElementById("displaySearchResultBusStop");
  var outputBusLineDom = document.getElementById("displaySearchResultBusLine");
  
  inputDom.addEventListener('input', _search);
  if(inputDom.value != "") {
    _search();
  }
  
  function _search() {
    var inputText = inputDom.value;
    console.log(inputText);
    var resultBusStops = null;
    var resultBusLines = null;
    if(inputText.length > 0) {
      // do search
      resultBusLines = _searchBusLineByCode(inputText);
      resultBusStops = _searchBusStopByName(inputText);
      // display on DOM
    } else {
      return;
    }
    console.log("search", inputText, resultBusStops, resultBusLines);
  }
  
  /**
    Return array of bus line index.
  */
  function _searchBusLineByCode(inString) {
    if(inString.length == 0) { return []; }
    var regexp = new RegExp(inString, "ig");
    // var arrayCache = HCL.busLine.cache;
    var arrayCache = HCL.area.cache;
    var arrayLength = arrayCache.length;
    var result = [];
    var tempCode = "";
    var tempResult = -1;
   
    for(var i = 0; i < arrayLength; i++) {
      // tempCode = arrayCache[i].getRouteCode();
      tempCode = arrayCache[i].code;
      tempResult = tempCode.search(regexp);
      if(-1 != tempResult) {
        result.push({"index" : i, "code" : tempCode});
      }
    }
    return result;
  };
  
  function _searchBusStopByName(inString) {
    if(inString.length == 0) { return []; }
    
    var regexp = new RegExp(inString, "ig");
    var arrayCache = HCL.busStop.cache;
    var arrayLength = arrayCache.length;
    var result = [];
    var tempName = "";
    var tempResult = -1;
    
    for(var i = 0; i < arrayLength; i++) {
      tempName = arrayCache[i].getName();
      tempResult = tempName.search(regexp);
      if(-1 != tempResult) {
        result.push({"index" : i, "name" : tempName});
      }
    }
    return result;
  };
  
  function _manipulateDomResult() {
    
  }
  
  function _clearDomResult() {
    if(true == outputBusStopDom.hasChildNodes()) {
      // remove childs
    }
    if(true == outputBusLineDom.hasChildNodes()) {
      // remove childs
    }
  }
  
  return {
    searchBusLineByCode: _searchBusLineByCode,
    searchBusStopByName: _searchBusStopByName
  };
}