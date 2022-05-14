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

    /*
    case 'GET':
        $id = @$_GET['id'];

        if(isset($id)) {
            $stmt = $conn->prepare("SELECT * FROM credit_history WHERE og=? and id=?");
            $stmt->bind_param("si", $og, $id);
        }
        else {
            $stmt = $conn->prepare("SELECT * FROM credit_history WHERE og=?");
            $stmt->bind_param("s", $og);
        }
        echoQueryAsJson($id, $stmt);
        break;
    */

    case 'POST':
        $p = array();
        array_push($p,getParameter("personId", "i", valueFromPost("personId", null)));
        array_push($p,getParameter("credit", "d", valueFromPost("credit", 0)));
        array_push($p,getParameter("isBought", "i", boolFromPost("isBought")));
        array_push($p,getParameter("saleId", "i", valueFromPost("saleId", null)));
        array_push($p,getParameter("date", "s", valueFromPost("date", null)));
        executeAndReturn($conn, $p, "credit_history");
        break;
}
$conn->close();
?>