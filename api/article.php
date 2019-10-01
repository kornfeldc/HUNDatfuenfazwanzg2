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
            $stmt = $conn->prepare("SELECT * FROM article a WHERE og=? and id=?");
            $stmt->bind_param("si", $og, $id);
        }
        else {
            $stmt = $conn->prepare("SELECT * FROM article a WHERE og=?");
            $stmt->bind_param("s", $og);
        }
        echoQueryAsJson($id, $stmt);
        break;

    case 'POST':
        $id = $_POST['id'];
        $title = $_POST['title'];
        $price = $_POST['price'];
        $isFavorite = boolFromPost("isFavorite");
        $type = $_POST['type'];

        if(isInsert()) {
            $stmt = $conn->prepare("INSERT INTO article (og, title, price, isFavorite, type) values (?, ?, ?, ?, ?)");
            $stmt->bind_param("ssdis", $og, $title, $price, $isFavorite, $type);
        }
        else {
            $stmt = $conn->prepare("UPDATE article SET title=?, price=?, isFavorite=?, type=? WHERE id=? and og=?");
            $stmt->bind_param("sdisis", $title, $price, $isFavorite, $type, $id, $og);
        }

        echoExecuteAsJson($stmt);
        break;
}
$conn->close();
?>