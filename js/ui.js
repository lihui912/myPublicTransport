HCL.UI = HCL.UI || {};

HCL.UI.UI = function() {
  
  return {
    
  };
};

HCL.UI.locationBar = function() {
  
  return {
    
  };
};

HCL.UI.search = function(inInputDomId, inOutputDomId) {
  var inputDom = document.getElementById(inInputDomId);
  var outputDom = document.getElementById(inOutputDomId);
  
  /**
    Return array of bus line index.
  */
  function _searchBusLineByCode(inString) {
    if(inString.length == 0) { return []; }
    var regexp = new RegExp(inString, "ig");
    var arrayCache = HCL.busLine.cache;
    var arrayLength = arrayCache.length;
    var result = [];
    var tempCode = "";
    var tempResult = -1;
   
    for(var i = 0; i < arrayLength; i++) {
      tempCode = arrayCache[i].getRouteCode();
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
  
  return {
    searchBusLineByCode: _searchBusLineByCode,
    searchBusStopByName: _searchBusStopByName
  };
}