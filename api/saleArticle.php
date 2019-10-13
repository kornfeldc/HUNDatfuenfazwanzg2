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
        $id = @$_GET['id'];

        if(isset($id)) {
            $stmt = $conn->prepare("SELECT * FROM sale_article WHERE og=? and id=?");
            $stmt->bind_param("si", $og, $id);
        }
        else {
            $sql = "SELECT sa.* FROM sale_article sa JOIN sale s ON sa.saleId = s.id WHERE sa.og=?";
            $b = "s";
            $p = array($og);

            $day = @$_GET['day'];
            if(isset($day)) {
                $sql = $sql." and (s.saleDate=? or (DATE(?) = DATE(NOW()) and s.payDate is null))";
                $b = $b."ss";
                array_push($p,$day);
                array_push($p,$day);
            }

            $saleId = @$_GET['saleId'];
            if(isset($saleId)) {
                $sql = $sql." and s.id=?";
                $b = $b."i";
                array_push($p,@$_GET['saleId']);
            }

            $stmt = $conn->prepare($sql);
            $stmt->bind_param($b, ...$p);
        }

        echoQueryAsJson($id, $stmt);
        break;

    case 'POST':
        $amount = @$_POST["amount"];
        if(!isInsert() && $amount == 0) {
            $stmt = $conn->prepare("DELETE FROM sale_article WHERE id=? and og=?");
            $stmt->bind_param("is", $id, $og);
            echoExecuteAsJson($conn,$stmt,isInsert());
        }
        else if($amount != 0) {
            $p = array();
            array_push($p,getParameter("og", "s", $og));
            array_push($p,getParameter("articleId", "i", valueFromPost("articleId", null)));
            array_push($p,getParameter("articleTitle", "s", valueFromPost("articleTitle", "")));
            array_push($p,getParameter("articlePrice", "d", @$_POST["articlePrice"]));
            array_push($p,getParameter("amount", "d", @$_POST["amount"]));
            array_push($p,getParameter("saleId", "i", valueFromPost("saleId", null)));
            executeAndReturn($conn, $p, "sale_article");
        }

        $blockCalculation = @$_POST["blockCalculation"];
        if(!isset($blockCalculation) || $blockCalculation != -1)
            recalculate($conn, $og);
       
        break;
}
$conn->close();
?>