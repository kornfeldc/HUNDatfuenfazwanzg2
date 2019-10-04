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
            $stmt = $conn->prepare("SELECT * FROM person WHERE og=? and id=?");
            $stmt->bind_param("si", $og, $id);
        }
        else {
            $stmt = $conn->prepare("SELECT * FROM person WHERE og=?");
            $stmt->bind_param("s", $og);
        }
        echoQueryAsJson($id, $stmt);
        break;

    case 'POST':
        $id = $_POST['id'];
        
        $firstName = $_POST['firstName'];
        $lastName = $_POST['lastName'];
        $isMember = boolFromPost("isMember");
        $mainPersonId = valueFromPost("mainPersonId", null);
        $personGroup = $_POST['personGroup'];
        $credit = valueFromPost("credit", 0);
        $saleCount = valueFromPost("saleCount", 0);
        $saleSum = valueFromPost("saleSum", 0);
        $topArticleCounts = valueFromPost("topArticleCounts", 0);
        $topSaleCount = valueFromPost("topSaleCount", 0);
        $topSaleSum = valueFromPost("topSaleSum", 0);
        $phone = $_POST['phone'];
        $email = $_POST['email'];

        if(isInsert()) {
            $stmt = $conn->prepare("INSERT INTO person (og, firstName, lastName, isMember, mainPersonId, personGroup, credit, saleCount, saleSum, topArticleCounts, topSaleCount, topSaleSum) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssiisdidiidss", $og, $firstName, $lastName, $isMember, $mainPersonId, $personGroup, $credit, $saleCount, $saleSum, $topArticleCounts, $topSaleCount, $topSaleSum, $phone, $email);
        }
        else {
            $stmt = $conn->prepare("UPDATE person SET firstName=?, lastName=?, isMember=?, mainPersonId=?, personGroup=?, phone=?, email=? WHERE id=? and og=?");
            $stmt->bind_param("ssiisssis", $firstName, $lastName, $isMember, $mainPersonId, $personGroup, $phone, $email, $id, $og);
        }

        echoExecuteAsJson($conn,$stmt,isInsert());
        break;
}
$conn->close();
?>