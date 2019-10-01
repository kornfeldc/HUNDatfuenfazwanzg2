<?php
//https://www.techiediaries.com/vuejs-php-mysql-rest-crud-api-tutorial/
include "../nogit/connection.php";

// Create and connection
$conn = openDb();

$login = $_GET["login"];
$pw = $_GET["pw"];

//https://www.php.net/manual/de/mysqli.prepare.php
$stmt = $conn->prepare("SELECT hash, og FROM user WHERE login=? and pw=?");
$stmt->bind_param("ss", $login, $pw);
$stmt->execute();
$res = $stmt->get_result();

$json = new \stdClass();
$json->status = "ok";
if ($res->num_rows == 1) {
    $row = $res->fetch_assoc();
    $json->hash = $row["hash"];
    $json->og = $row["og"];
}
else
$json->status = "nok";

header('Content-Type: application/json');
echo json_encode($json);
$conn->close();
?>