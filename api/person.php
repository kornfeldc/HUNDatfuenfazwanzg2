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
        $p = array();
        array_push($p,getParameter("og", "s", $og));
        array_push($p,getParameter("firstName", "s", $_POST['firstName']));
        array_push($p,getParameter("lastName", "s", $_POST['lastName']));
        array_push($p,getParameter("isMember", "i", boolFromPost("isMember")));
        array_push($p,getParameter("mainPersonId", "i", valueFromPost("mainPersonId", null)));
        array_push($p,getParameter("personGroup", "s", $_POST['personGroup']));
        array_push($p,getParameter("credit", "d", valueFromPost("credit", 0)));
        array_push($p,getParameter("phone", "s", $_POST['phone']));
        array_push($p,getParameter("email", "s", $_POST['email']));

        executeAndReturn($conn, $p, "person");
        break;
}
$conn->close();
?>