<?php
// https://github.com/rodneyrehm/CFPropertyList
namespace CFPropertyList;
require_once('CFPropertyList/CFPropertyList.php');

// header('Content-Type: application/json', true);

$url = "http://www.ctbsolutions.com.my/jsonp/?a=eta.aspx?bid=B0423&callback=jQ";
// $busstopxml = "http://www.rapidpg.com.my/iplanner/xml/BusStop-All.xml";
// $xmlstr = file_get_contents($busstopxml);

$xmlstr = file_get_contents($url);

$jsonObj = json_decode(substr($xmlstr, 3, -1), true);

// $xml = simplexml_load_string($jsonObj['a']);

$plist = new CFPropertyList();
$plist->parse($jsonObj['a']);

// $json = json_encode($xml);

// echo $json;

$json = json_encode($plist->toArray());

// $bytes = file_put_contents("../realtime/B0423.json", $json);

echo $json;

// var_dump(stat("../realtime/B0423.json"));

echo "------\n";
$xmlstr = file_get_contents("rapidpg.xml");
$xml = simplexml_load_string($xmlstr);
$jsonObj = json_encode($xml);
echo $jsonObj;
?>