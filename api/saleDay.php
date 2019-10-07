<?php
//https://www.techiediaries.com/vuejs-php-mysql-rest-crud-api-tutorial/
include "../nogit/connection.php";
include "api.php";

// Create and connection
$conn = openDb();
$og = getOg($conn);

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

switch($method) {
    case 'GET':
        $sql = "
            SELECT sd.* 
            FROM sale_day sd 
            WHERE sd.og=?
            ORDER BY sd.day DESC";
        $b = "s";
        $p = array($og);

        // if(isset($_GET['personId'])) {
        //     $sql = $sql." and personId=?";
        //     $b = $b."i";
        //     array_push($p,$_GET['personId']);
        // }

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($b, ...$p);
        echoQueryAsJson("", $stmt);
        break;
}
$conn->close();
?>