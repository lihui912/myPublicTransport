<?php
/* Borrowed from http://blog.boombatower.com/drupal-google-app-engine
*/
$path = parse_url($_SERVER['REQUEST_URI'],  PHP_URL_PATH);



if(dirname($path) == '/api' && pathinfo($path, PATHINFO_EXTENSION) == 'php') {
  $file = pathinfo($path, PATHINFO_BASENAME);
} else {
  $file = 'index.php';
  $_GET['q'] = $path;
}

// var_dump($_SERVER['SCRIPT_NAME'], $file, $_GET['q']);
require $file;
?>