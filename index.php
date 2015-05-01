<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="chrome=1">
<meta name="description" content="Collection of Malaysia public transport map.">
<title>myPublicTransport</title>
<!--
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAHIEuoOSbdKXPYgqE_35ckq75tjVbXi7A"></script>
-->
<link type="text/css" rel="stylesheet" href="css/style.css" />
<script src="js/jquery.js"></script>
<script src="js/main.js"></script>
<script src="js/bus.js"></script>
<script src="js/busleg.js"></script>
<script src="js/busstop.js"></script>
<script src="js/buscontrol.js"></script>
<script src="js/mapcontroller.js"></script>
<script src="js/utils.js"></script>
<script src="js/ui.js"></script>
<script>
// ====================================

// ====================================
function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = '//maps.googleapis.com/maps/api/js?key=AIzaSyAHIEuoOSbdKXPYgqE_35ckq75tjVbXi7A&v=3.18&libraries=geometry&callback=initialize';

  document.body.appendChild(script);
}

function initialize(){

  HCL.UI.history = new HCL.UI.historyClass();
  var urlObject = HCL.UI.history.parseUrl();
  
  // Control map canvas size --- start
  // Must be done before initialize map
  var mapOuterContainer = document.getElementById("outer-map-canvas");
  mapOuterContainer.style.width = (window.innerWidth - 300) + "px";
  window.addEventListener("resize", function(event) {
    mapOuterContainer.style.width = (window.innerWidth - 300) + "px";
  });
  // Control map canvas size --- send
  
  
  try{
    HCL.map = new MapController();
    
    if(urlObject && urlObject.map) {
      var urlMap = urlObject.map.split(',');
      HCL.map.initializeMap("map-canvas", {lat: urlMap[0], lng: urlMap[1], zoom: urlMap[2]});
    } else {
      HCL.map.initializeMap("map-canvas");
    }
  } catch(e) {console.error(e);}
  
  HCL.busLine.loadData(HCL.busLine.generateDOMRows);
  
  HCL.searchController = HCL.searchController || new HCL.UI.search("inSearch");
  
  // preload images
  var image = [];
  image[0] = new Image();
  image[1] = new Image();
  image[2] = new Image();
  image[0].src = "//maps.gstatic.com/mapfiles/ms2/micons/green-dot.png";
  image[1].src = "//maps.gstatic.com/mapfiles/ms2/micons/pink-dot.png";
  image[2].src = "//maps.gstatic.com/mapfiles/ms2/micons/ltblue-dot.png";
  
  var lhash = location.hash;
  lhash = lhash.substr(1).split(',');
  
  // HCL.map._map.setZoom(lhash[2] * 1);
  // HCL.map._map.setCenter(new google.maps.LatLng(lhash[0], lhash[1]));
}
window.onload = loadScript;
// ====================================

</script>



<script>
function searchBusLine(inString) {
  HCL.map.searchBusLine(inString, searchBusLineCallback);
}

function searchBusLineCallback(data) {
  console.log(data);
  HCL.map.setSearchResultReady();
  HCL.map.setSearchResult(data);
  
  var busLineObj = new BusLine(data);
  // busLineObj.extractData();
  HCL.busLine.addToCache({"routeCode": busLineObj._routeCode, "data": busLineObj});
}


function busLineClick(e) {
  console.log(this, e);
  var lineCode = this.id.split('_')[1];
  var busLine = null;
  for(var i = 0; i < HCL.busLine.cache.length; i++) {
    if(HCL.busLine.cache[i].routeCode == lineCode) {
      busLine = HCL.busLine.cache[i].data;
      break;
    }
  }
  console.log(busLine);
  busLine.buildBusLine();
  busLine.displayBusLine();
}

</script>
<script>
/*
function attachListeners() {
  var aArray = document.getElementById("businfodisplay").getElementsByTagName("a");
  for(var i = 0; i < aArray.length; i++) {
    if(aArray[i].id.split("_").length != 2) {continue;}
    aArray[i].addEventListener("click", eventListener);
  }
}

function attachListeners() {
  var spanArray = document.getElementById("businfodisplay").getElementsByTagName("span");
  for(var i = 0; i < spanArray.length; i++) {
    var strId = spanArray[i].id;
    if(strId.indexOf("busAreaTitle_") != 0) {continue;}
    spanArray[i].addEventListener("click", eventListener);
  }
}
*/
/*
function eventListener(event) {
  var idArray = event.target.id.split("_");
  
  if(idArray[0] == "both") {
    HCL.busLine.toggleDisplay(idArray[1], HCL.busLine.direction.BOTH);
  } else if(idArray[0] == "depart") {
    HCL.busLine.toggleDisplay(idArray[1], HCL.busLine.direction.DEPART);
  } else if(idArray[0] == "return") {
    HCL.busLine.toggleDisplay(idArray[1], HCL.busLine.direction.RETURN);
  }

}
*/

</script>
<script>

function GoogleDirectionData(inData) {
  this._data = null;
  this._originalData = inData;

  this._startLocation = null;
  this._endLocation   = null;
  this._coarsePoints = null;
  this._finePoints   = null;
  this._distance     = 0;   // unit in meters
  this._bounds       = null;
  
  this._copyrights   = "";
  
  this.parseData();
}

GoogleDirectionData.prototype.setData = function(inData) {
  this._originalData = inData;
  this.parseData();
}

GoogleDirectionData.prototype.parseData = function() {

  var originalDataObj = JSON.parse(this._originalData);
  var thisRoute = originalDataObj.routes[0];

  var data = {};

  this._bounds        = thisRoute.bounds;
  this._distance      = thisRoute.legs[0].steps[0].distance.value;
  this._copyrights    = thisRoute.copyrights;
  data.coarsePolyline = thisRoute.overview_polyline.points;
  data.finePolyline   = thisRoute.legs[0].steps[0].polyline.points;
  this._startLocation = thisRoute.legs[0].start_location;
  this._endLocation   = thisRoute.legs[0].end_location;

  this._data = data;

  if(google && google.maps) {
    this._coarsePoints = google.maps.geometry.encoding.decodePath(data.coarsePolyline);

    this._finePoints = google.maps.geometry.encoding.decodePath(data.finePolyline);
  }
  console.log(this._data);
}

GoogleDirectionData.prototype.getCoarsePolyline = function() {
  return this._coarsePoints;
}

GoogleDirectionData.prototype.getFinePolyline = function() {
  return this._finePoints;
}

GoogleDirectionData.prototype.getStartLocation = function() {
  return this._startLocation;
}

GoogleDirectionData.prototype.getEndLocation = function() {
  return this._endLocation;
}

GoogleDirectionData.prototype.getCopyrights = function() {
  return this._copyrights;
}

GoogleDirectionData.prototype.toString = function() {
  console.log(this._data);
  return "From [" + this._startLocation.lat + "," + this._startLocation.lng + "] to [" + this._endLocation.lat + "," + this._endLocation.lng + "] in distance of " + this._distance / 1000 + " km. Copyrights: " + this._copyrights;
}
</script>
<script>
/*
function generateDOMRow(inBusLineCode, inTitle) {
  var rootSpan = document.createElement("span");
  
  var aBoth   = document.createElement("a");
  var aDepart = document.createElement("a");
  var aReturn = document.createElement("a");
  
  var spanTitle = document.createElement("span");
  
  aBoth.id   = "both_" + inBusLineCode.trim();
  aDepart.id = "depart_" + inBusLineCode.trim();
  aReturn.id = "return_" + inBusLineCode.trim();
  
  aBoth.textContent   = "B ";
  aDepart.textContent = "D ";
  aReturn.textContent = "R ";
  
  spanTitle.textContent = inTitle.trim();
  
  aBoth.addEventListener("click", eventListener);
  aDepart.addEventListener("click", eventListener);
  aReturn.addEventListener("click", eventListener);
  
  rootSpan.appendChild(aBoth);
  rootSpan.appendChild(aDepart);
  rootSpan.appendChild(aReturn);
  rootSpan.appendChild(spanTitle);
  
  //console.log(rootSpan);
  return rootSpan;
}
*/
</script>
</head>
<body style="height: 100%;">
<div id="content-container">
<div id="tools" style="font-family: monospace;">
  <div>
    Zoom: <span id="displayZoom"></span><br>
    Clicked at: <span id="displayClicked"></span><br>
    Center: <span id="displayCenter"></span><br>
    Lat: <span id="displayLat"></span><br>
    Lng: <span id="displayLng"></span><br>
    BusStop: <span id="displayBusStop"></span><br>
    BusLines: <span id="displayBusLines"></span>
  </div>
  <div id="search">
    <input type="text" id="inSearch" placeholder="bus stop name or bus line code"></input><button type="button" id="inSearchButton">Search</button>
    <div id="displaySearchResult">
      <div id="displaySearchResultBusStop"></div>
      <hr>
      <div id="displaySearchResultBusLine"></div>
    </div>
  </div>

  <hr>
  <div id="businfodisplay">
    <span id="busAreaTitle_1">Area 1</span><div id="busAreaContainer_1"></div>
    <span id="busAreaTitle_2">Area 2</span><div id="busAreaContainer_2"></div>
    <span id="busAreaTitle_3">Area 3</span><div id="busAreaContainer_3"></div>
    <span id="busAreaTitle_4">Area 4</span><div id="busAreaContainer_4"></div>
    <span id="busAreaTitle_5">Area 5</span><div id="busAreaContainer_5"></div>
    <span id="busAreaTitle_6">Area 6</span><div id="busAreaContainer_6"></div>
  </div>

  <!--
  <div id="displayCopyright"><span>This site was created by Chin Li Hui. All bus routes are credits to RapidKL.</span></div>
-->
</div>
<div id="outer-map-canvas">
  <div id="map-canvas"></div>
</div>

  
</div>


</body>

</html>