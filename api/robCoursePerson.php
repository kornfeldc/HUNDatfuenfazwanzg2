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
            $stmt = $conn->prepare("SELECT * FROM rob_course_person rcp WHERE robCourseId = ?");
            $stmt->bind_param("i", $id);
        }
        echoQueryAsJson(null, $stmt);
        break;

    case 'POST':
        $id = @$_POST['id'];

        if(isDelete()) {
            $stmt = $conn->prepare("delete from rob_course_person where id = ?");  $stmt->bind_param("i", $id); $stmt->execute();
            echoStatus(true, "", "");
        }
    break;
}
$conn->close();
?>