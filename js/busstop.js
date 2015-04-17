/**
  Deprecated! use main.js
*/
function BusStop(inCode, inId, inLocation, inName) {
  this._code = inCode;
  this._id   = inId;
  this._name = inName;
  this._lat  = inLocation[0];
  this._lng  = inLocation[1];
  this._isTerminal = false;
  this._markerIsDisplaying = false;
}

BusStop.prototype.setCode = function(inCode) {
  this._code = inCode.trim();
}

BusStop.prototype.getCode = function() {
  return this._code;
}

BusStop.prototype.setId = function(inId) {
  if(isNaN(1 * inId)) throw TypeError();
  this._id = inId;
}

BusStop.prototype.getId = function() {
  return this._id;
}

BusStop.prototype.setName = function(inName) {
  this._name = inName.trim();
}

BusStop.prototype.getName = function() {
  return this._name;
}

/**
 Set way point.
 */
BusStop.prototype.setIsWp = function(inIsWp) {
  if(!inIsWp) {
    this._isWp = false;
  } else {
    this._isWp = true;
  }
}

BusStop.prototype.getIsWp = function() {
  return this._isWp;
}

BusStop.prototype.setLatLng = function(inLatLng) {
  this._lat = inLatLng[0];
  this._lng = inLatLng[1];
}

BusStop.prototype.getLatLng = function() {
  return [this._lat, this._lng];
}

BusStop.prototype.setIsTerminal = function() {
  this._isTerminal = true;
}

BusStop.prototype.buildMarker = function() {
  this._marker = new google.maps.Marker();
  this._markerOptions = {};
  
  this._markerOptions.position = new google.maps.LatLng(this._lat, this._lng);
  this._markerOptions.title = this._name;
  
  this._marker.setOptions(this._markerOptions);
  // google.maps.event.addListener(this._marker, 'mouseover', function(event) {console.log(event); event.latLng.toString();});
  
  // google.maps.event.addListener(this._marker, 'mouseout', function(event) {console.log(event); event.latLng.toString();});
}

BusStop.prototype.displayMarker = function(inMap) {
  if(this._markerIsDisplaying == true) {return;}
  this._marker.setMap(inMap);
  this._markerIsDisplaying = true;
}

BusStop.prototype.removeMarker = function() {
  if(this._markerIsDisplaying == false) {return;}
  this._marker.setMap(null);
  this._markerIsDisplaying = false;
}

BusStop.prototype.toString = function() {
  return [this._id, this._code, this._isTerminal, this._lat, this._lng, this._name].join('|');
}

BusStop.prototype.getObject = function() {
  return {id: this._id, code: this._code, isTerminal: this._isTerminal, lat: this._lat, lng: this._lng, name: this._name};
}