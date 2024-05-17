<?php
//https://www.techiediaries.com/vuejs-php-mysql-rest-crud-api-tutorial/
include "../nogit/connection.php";
include "api.php";

// Create and connection
$conn = openDb();

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

switch($method) {
    case 'GET':
        $link = @$_GET['link'];

        if(isset($link)) {
            $stmt = $conn->prepare("SELECT rc.date, rc.link, (select count(*) from rob_course_person rcp where rcp.robCourseId = rc.id) personCount, rc.maxPersons FROM rob_course rc WHERE link=?");
            $stmt->bind_param("s", $link);
        }
        echoQueryAsJson($link, $stmt);
        break;
    case 'POST':
        $link = @$_GET['link'];
        
        $stmt = $conn->prepare("SELECT rc.id, (select count(*) from rob_course_person rcp where rcp.robCourseId = rc.id) personCount, rc.maxPersons FROM rob_course rc WHERE link=? limit 1");
        $stmt->bind_param('s', $link);
        $stmt->execute();
        $result = $stmt->get_result();
        $value = $result->fetch_object();
        
        if(is_null($value)) {
             header('HTTP/1.1 400 Bad Request');
             echo json_encode(array('message' => 'Kurs nicht gefunden'));
             exit();
        }
        
        $robCourseId = $value->id;
        $personCount = $value->personCount;
        $maxPersons = $value->maxPersons;
        
        // if personCount is same as maxPersons then return an error, otherwise continiue
        if ($personCount >= $maxPersons) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(array('message' => 'Der Kurs ist leider bereits ausgebucht'));
            exit();
        }
        
        $p = array();
        array_push($p,getParameter("robCourseId", "i", $robCourseId));
        array_push($p,getParameter("personName", "s", valueFromPost("personName", "")));
        array_push($p,getParameter("dogName", "s", valueFromPost("dogName", "")));

        executeAndReturn($conn, $p, "rob_course_person");
        break;
}
$conn->close();
?>