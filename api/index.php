<?php
header('Content-Type: application/json; charset=utf-8', true);

function explodeInput($inString) {
  $exploded = explode('/', ltrim($inString, '/'));
  $result = array();
  
  $result['queryType'] = $exploded[1];
  
  if($exploded[1] != 'area') {
    $result['queryBy'] = $exploded[2];
    $result['queryString'] = $exploded[3];
  }
  return $result;
}

function parseQueryString(&$inString) {
  $exploded = explode(',', $inString);
  // var_dump($exploded);
  return $exploded;
}

function loadBusLineDataByCode(&$inArray) {
  $PATH = '../routes/';
  // echo file_get_contents($PATH . $inArray[0] . '.json');
  $result = array();
  $sizeofArray = sizeof($inArray);
  for($i = 0; $i < $sizeofArray; $i++) {
    if(file_exists($PATH . $inArray[$i] . '.json')) {
      $temp = file_get_contents($PATH . $inArray[$i] . '.json');
      array_push($result, json_decode($temp));
    }
  }
  return $result;
}

function loadBusStopDataById(&$inIdArray, &$inStopsArray) {
  
  $result = array();
  $sizeofIdsArray = sizeof($inIdArray);
  for($i = 0; $i < $sizeofIdsArray; $i++) {
    $index = searchBusStopById($inStopsArray, $inIdArray[$i]);
    if(-1 != $index) {
      array_push($result, $inStopsArray[$index]);
    }
  }
  return $result;
}

function searchBusStopById(&$inStopsArray, $inId) {
  $busStopsCount = sizeof($inStopsArray);
  for($i = 0; $i < $busStopsCount; $i++) {
    // var_dump($inStopsArray[$i]['id']);
    if($inStopsArray[$i]['id'] == $inId) {
      return $i;
    }
  }
  return -1;
}

// echo $_GET['q'];
$request = null;
$request = explodeInput(rawurldecode ($_GET['q']));
$loadData = null;

$output = array();
$output['status'] = 'ok';

if($request['queryType'] == 'area') {
  
  $output['data'] = json_decode(file_get_contents('../routes/area.json'));
  
} else if($request['queryType'] == 'busLine') {
  // $routesArray = json_decode(file_get_contents('../routes/allroutes.json'), true);
  // var_dump($routesArray);
  $loadData = parseQueryString($request['queryString']);
  if($request['queryBy'] == 'code') {
    $output['data'] = loadBusLineDataByCode($loadData);
  } else if($request['queryBy'] == 'id') {
    
  }
  
} else if($request['queryType'] == 'busStop') {
  $stopsArrayObject = json_decode(file_get_contents('../stops/allbusstop.json'), true);
  // var_dump($stopsArrayObject);
  $loadData = parseQueryString($request['queryString']);
  if($request['queryBy'] == 'code') {
    
  } else if($request['queryBy'] == 'id') {
    $output['data'] = loadBusStopDataById($loadData, $stopsArrayObject);
  }
}

echo json_encode($output);
?>