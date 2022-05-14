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
        $personId = @$_GET['personId'];
        
        if(isset($id)) {
            $stmt = $conn->prepare("SELECT * FROM course_history WHERE id=?");
            $stmt->bind_param("i", $id);
        }
        else {
            $stmt = $conn->prepare("SELECT * FROM course_history WHERE personId=? ORDER BY date DESC, id DESC");
             $stmt->bind_param("i", $personId);
        }
        echoQueryAsJson($id, $stmt);
        break;

    case 'POST':
        $p = array();
        array_push($p,getParameter("personId", "i", valueFromPost("personId", null)));
        array_push($p,getParameter("courses", "d", valueFromPost("courses", 0)));
        array_push($p,getParameter("date", "s", valueFromPost("date", null)));
        executeAndReturn($conn, $p, "course_history");
        
        //recalculate courseCount
        $stmt = $conn->prepare("update person p set courseCount = (select sum(ch.courses) from course_history ch where ch.personId = p.id) where p.id = ?"); 
        $stmt->bind_param("i", valueFromPost("personId", null));
        $stmt->execute();  
        break;
}
$conn->close();
?>