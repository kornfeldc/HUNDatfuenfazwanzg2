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
            $stmt = $conn->prepare("SELECT * FROM sale WHERE og=? and id=?");
            $stmt->bind_param("si", $og, $id);
        }
        else {
            $sql = "SELECT * FROM sale WHERE og=?";
            $b = "s";
            $p = array($og);

            if(isset($_GET['day'])) {
                $sql = $sql." and saleDate=?";
                $b = $b."s";
                array_push($p,$_GET['day']);
            }

            $stmt = $conn->prepare($sql);
            $stmt->bind_param($b, ...$p);
        }
        echoQueryAsJson($id, $stmt);
        break;

    case 'POST':
        $id = $_POST['id'];
        
        $personId = valueFromPost("personId", null);
        $personName = valueFromPost("personName", "");
        $saleDate = valueFromPost("saleDate", null);
        $payDate = valueFromPost("payDate", null);
        $toPay = $_POST["toPay"];
        $toReturn = $_POST["toReturn"];
        $inclTip = $_POST["inclTip"];
        $given = $_POST["given"];
        $articleSum = $_POST["articleSum"];
        $addAdditionalCredit = $_POST["addAdditionalCredit"];
        $usedCredit = boolFromPost("usedCredit");

        if(isInsert()) {
            $stmt = $conn->prepare("INSERT INTO sale (og, personId, personName, saleDate, payDate, toPay, toReturn, inclTip, given, articleSum, addAdditionalCredit, usedCredit) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sisssddddddi", $og, $personId, $personName, $saleDate, $payDate, $toPay, $toReturn, $inclTip, $given, $articleSum, $addAdditionalCredit, $usedCredit);
        }
        else {
            $stmt = $conn->prepare("UPDATE sale SET personId=?, personName=?, saleDate=?, payDate=?, toPay=?, toReturn=?, inclTip=?, given=?, articleSum=?, addAdditionalCredit=?, usedCredit=? WHERE id=? and og=?");
            $stmt->bind_param("isssddddddiis", $personId, $personName, $saleDate, $payDate, $toPay, $toReturn, $inclTip, $given, $articleSum, $addAdditionalCredit, $usedCredit, $id, $og);
        }

        echoExecuteAsJson($conn,$stmt,isInsert());
        break;
}
$conn->close();
?>