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
        $p = array();
        array_push($p,getParameter("og", "s", $og));
        array_push($p,getParameter("title", "s", @$_POST['title']));
        array_push($p,getParameter("price", "d", @$_POST['price']));
        array_push($p,getParameter("isFavorite", "i", boolFromPost("isFavorite")));
        array_push($p,getParameter("isActive", "i", boolFromPost("isActive")));
        array_push($p,getParameter("type", "s", @$_POST['type']));
        array_push($p,getParameter("extId", "s", @$_POST['extId']));
        executeAndReturn($conn, $p, "article");
        break;
}
$conn->close();
?>