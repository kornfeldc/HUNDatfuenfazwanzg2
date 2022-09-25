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
            $stmt = $conn->prepare("SELECT rc.*, (select count(*) from rob_course_person rcp where rcp.robCourseId = rc.id) personCount FROM rob_course rc WHERE og=? and id=?");
            $stmt->bind_param("si", $og, $id);
        }
        else {
            $stmt = $conn->prepare("SELECT rc.*, (select count(*) from rob_course_person rcp where rcp.robCourseId = rc.id) personCount  FROM rob_course rc WHERE og=? ORDER BY rc.date DESC");
            $stmt->bind_param("s", $og);
        }
        echoQueryAsJson($id, $stmt);
        break;

    case 'POST':
        $id = @$_POST['id'];

        if(isDelete()) {
            $stmt = $conn->prepare("delete from rob_course where id = ?");  $stmt->bind_param("i", $id); $stmt->execute();
            echoStatus(true, "", "");
        }
        else {
            $p = array();
            array_push($p,getParameter("og", "s", $og));
            array_push($p,getParameter("date", "s", valueFromPost("date", null)));
            array_push($p,getParameter("maxPersons", "i", valueFromPost("maxPersons", 6)));
            array_push($p,getParameter("link", "s", valueFromPost("link", null)));
            executeAndReturn($conn, $p, "rob_course");
        }
    break;
}
$conn->close();
?>