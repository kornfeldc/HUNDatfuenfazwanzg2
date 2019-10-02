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
        $id = $_GET['id'];

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

    case 'POST':
        $id = $_POST['id'];
        
        $personId = valueFromPost("personId", null);
        $credit = valueFromPost("credit", 0);
        $isBought = boolFromPost("isBought");
        $saleId = valueFromPost("saleId", null);
        $date = valueFromPost("date", null);
        
        if(isInsert()) {
            $stmt = $conn->prepare("INSERT INTO credit_history (og, personId, credit, isBought, saleId, date) values (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sidiis", $og, $personId, $credit, $isBought, $saleId, $date);
        }
        else {
            $stmt = $conn->prepare("UPDATE credit_history SET personId=?, credit=?, isBought=?, saleId=?, date=? WHERE id=? and og=?");
            $stmt->bind_param("idiisis", $personId, $credit, $isBought, $saleId, $date, $id, $og);
        }

        echoExecuteAsJson($stmt);
        break;
}
$conn->close();
?>