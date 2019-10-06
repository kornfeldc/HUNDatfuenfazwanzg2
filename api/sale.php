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

        if(isDelete()) {
            $stmt = $conn->prepare("delete from sale_article where saleId = ?"); $stmt->bind_param("i", $id); $stmt->execute();
            $stmt = $conn->prepare("delete from sale where id = ?"); $stmt->execute();
            echoStatus(true, "", "");
        }
        else {
            $p = array();
            array_push($p,getParameter("og", "s", $og));
            array_push($p,getParameter("personId", "i", valueFromPost("personId", null)));
            array_push($p,getParameter("personName", "s", valueFromPost("personName", "")));
            array_push($p,getParameter("saleDate", "s", valueFromPost("saleDate", null)));
            array_push($p,getParameter("payDate", "s", valueFromPost("payDate", null)));
            array_push($p,getParameter("toPay", "d", $_POST["toPay"]));
            array_push($p,getParameter("toReturn", "d", $_POST["toReturn"]));
            array_push($p,getParameter("inclTip", "d", $_POST["inclTip"]));
            array_push($p,getParameter("given", "d", $_POST["given"]));
            array_push($p,getParameter("articleSum", "d", $_POST["articleSum"]));
            array_push($p,getParameter("addAdditionalCredit", "d", $_POST["addAdditionalCredit"]));
            array_push($p,getParameter("usedCredit", "d", boolFromPost("usedCredit")));
            executeAndReturn($conn, $p, "sale");
        }

        break;
}
$conn->close();
?>