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
            $stmt = $conn->prepare("SELECT * FROM sale_article WHERE og=?");
            $stmt->bind_param("s", $og);
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