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
            $stmt = $conn->prepare("SELECT * FROM sale_article WHERE og=? and id=?");
            $stmt->bind_param("si", $og, $id);
        }
        else {
            $sql = "SELECT sa.* FROM sale_article sa JOIN sale s ON sa.saleId = s.id WHERE sa.og=?";
            $b = "s";
            $p = array($og);

            if(isset($_GET['date'])) {
                $sql = $sql." and s.date=?";
                $b = $b."s";
                array_push($p,$_GET['date']);
            }

            $stmt = $conn->prepare($sql);
            $stmt->bind_param($b, $p);
        }

        echoQueryAsJson($id, $stmt);
        break;

    case 'POST':
        $id = $_POST['id'];
        
        $articleId = valueFromPost("articleId", null);
        $articleTitle = valueFromPost("articleTitle", "");
        $articlePrice = valueFromPost("articlePrice", 0);
        $amount = valueFromPost("amount", 0);
        $saleId = valueFromPost("articleId", null);
        
        if(isInsert()) {
            $stmt = $conn->prepare("INSERT INTO sale_article (og, articleId, articleTitle, articlePrice, amount, saleId) values (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sisdii", $og, $articleId, $articleTitle, $articlePrice, $amount, $saleId);
        }
        else {
            $stmt = $conn->prepare("UPDATE sale_article SET articleId=?, articleTitle=?, articlePrice=?, amount=?, saleId=? WHERE id=? and og=?");
            $stmt->bind_param("isdiiis", $articleId, $articleTitle, $articlePrice, $amount, $saleId, $id, $og);
        }

        echoExecuteAsJson($stmt);
        break;
}
$conn->close();
?>