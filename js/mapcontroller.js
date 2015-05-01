function MapController() {
  this._map = {};
  this._mapCurrentOptions = {};
  this._mapLayerId = "";
  
  
  // this._searchResultDom = document.getElementById('search-result');
  // this._lastSearchResult = null;
  
  // this._searchResultReady = false;
  this._domZoom = document.getElementById("displayZoom");
  this._domLat = document.getElementById("displayLat");
  this._domLng = document.getElementById("displayLng");
  this._domClicked = document.getElementById("displayClicked");
  this._domCenter = document.getElementById("displayCenter");
}

MapController.prototype.defaultLocationOptions = function() {
  var KL = {};
  KL.center = new google.maps.LatLng(3.137632, 101.700417);
  KL.zoom   = 12;
  this._mapCurrentOptions = KL;
  return KL;
}

MapController.prototype.initializeMap = function(inDivId, inMapOptions) {
  this._mapLayerId = inDivId;
  if(inMapOptions) {
    this._mapCurrentOptions.zoom = parseInt(inMapOptions.zoom);
    this._mapCurrentOptions.center = new google.maps.LatLng(parseFloat(inMapOptions.lat), parseFloat(inMapOptions.lng));
    console.log(this._mapCurrentOptions);
    this._map = new google.maps.Map(document.getElementById(inDivId), this._mapCurrentOptions);
  } else {
    this._map = new google.maps.Map(document.getElementById(inDivId), this.defaultLocationOptions());
  }
  this.addListeners();
  
  
}

MapController.prototype.setOptions = function(inOptions) {
  if(!inOptions) {
    console.error("options is empty.");
    return;
  }
  console.log("setOptions");
  var newCenter = new google.maps.LatLng(inOptions.lat, inOptions.lng);
  var newZoom = inOptions.zoom;
  
  this._mapCurrentOptions.center = newCenter;
  this._mapCurrentOptions.zoom = newZoom;
  
  this._map.setOptions(this._mapCurrentOptions);
}

MapController.prototype.setZoom = function(inZoom) {
  
  this._map.setZoom = inZoom;
  this._mapCurrentOptions.zoom = inZoom;
}

MapController.prototype.setCenter = function(inLat, inLng) {
  this._map.panTo(inLat, inLng);
  this._mapCurrentOptions.center = this._map.getCenter();
}

MapController.prototype.addListeners = function() {
  var _mapObj = this._map;
  var _centerLatLng = _mapObj.getCenter();
  var _boundLatLng = _mapObj.getBounds();
  
  var domLat = this._domLat;
  var domLng = this._domLng;
  var domZoom = this._domZoom;
  var domClicked = this._domClicked;
  var domCenter = this._domCenter;
  
  var centerChangeTimer = null;
  var mouseMoveTimer = null;
  
  domZoom.textContent = this._mapCurrentOptions.zoom;
  
  google.maps.event.trigger(this._map, 'resize');

  // zoom_changed
  google.maps.event.addListener(this._map, 'zoom_changed', function() {
    var newZoom = _mapObj.getZoom();
    domZoom.textContent = newZoom;
    _boundLatLng = _mapObj.getBounds();
    // trigger busStop zoom event
    var busStopArray = HCL.busStop.cache;
    var busStopArrayLength = busStopArray.length;
    for(var i = 0; i < busStopArrayLength; i++) {
      busStopArray[i].evZoomChanged(newZoom);
    }
    console.log("zoom_changed");
    HCL.UI.history.update();
  });
  
  // 'idle' event is fired after panning or zooming
  google.maps.event.addListener(this._map, 'idle', function() {
    var newZoom = _mapObj.getZoom();
    var newBound = _mapObj.getBounds();
    _boundLatLng = newBound;
    
    var busStopArray = HCL.busStop.cache;
    var busStopArrayLength = busStopArray.length;
    for(var i = 0; i < busStopArrayLength; i++) {
      busStopArray[i].evIdle(newZoom, newBound);
    }
    
    var busLegArray = HCL.busLeg.cache;
    var busLegArrayLength = busLegArray.length;
    for(var i = 0; i < busLegArrayLength; i++) {
      busLegArray[i].evIdle(newZoom, newBound);
    }
    console.log("idle");
    // var newCenter = _mapObj.getCenter();
    // history.pushState({"lat": newCenter.lat(), "lng": newCenter.lng(), "zoom": newZoom}, document.title, "#" + newCenter.lat() + "," + newCenter.lng() +  "," + newZoom);
  });
  
  google.maps.event.addListener(this._map, 'click', function(event) {
    domClicked.textContent = event.latLng.toString();
    // event.latLng
    // hide everything
    // load bus stop at nearby
  });

  google.maps.event.addListener(this._map, 'mousemove', function(event){
    clearTimeout(mouseMoveTimer);
    mouseMoveTimer = setTimeout(function(){
      domLat.textContent = event.latLng.lat();
      domLng.textContent = event.latLng.lng();
    }, 10);
  });

  google.maps.event.addListener(this._map, 'resize', function() {
    _mapObj.setCenter(_centerLatLng);
    domCenter.textContent = _mapObj.getCenter().toString();
    _mapObj.fitBounds(_boundLatLng);
    _boundLatLng = _mapObj.getBounds();
    console.log("resize");
  });
  
  google.maps.event.addListener(this._map, 'center_changed', function() {
    clearTimeout(centerChangeTimer);
    centerChangeTimer = setTimeout(function(){
      _boundLatLng = _mapObj.getBounds();
      domCenter.textContent = _mapObj.getCenter().toString();
      console.log("center_changed");
      // HCL.UI.history.update();
    }, 100);
    
  });
};

MapController.prototype.getBounds = function() {
  return _mapObj.getBounds();
};


MapController.prototype.addObjectListener = function(inObject, inEventName, inCallback) {
  var listener = null;
  
  
  return listener;
};
