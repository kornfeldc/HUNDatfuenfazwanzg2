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
            $stmt = $conn->prepare("SELECT p.*, (SELECT GROUP_CONCAT(CONCAT(p2.lastName,' ',p2.firstName) SEPARATOR ', ') FROM person p2 WHERE p2.mainPersonId = p.mainPersonId and p2.og = p.og) relatedNames FROM person p WHERE p.og=? and p.id=?");
            $stmt->bind_param("si", $og, $id);
        }
        else {
            $stmt = $conn->prepare("SELECT p.*, (SELECT GROUP_CONCAT(CONCAT(p2.lastName,' ',p2.firstName) SEPARATOR ', ') FROM person p2 WHERE p2.mainPersonId = p.mainPersonId and p2.og = p.og) relatedNames FROM person p WHERE p.og=?");
            $stmt->bind_param("s", $og);
        }
        echoQueryAsJson($id, $stmt);
        break;

    case 'POST':
        $p = array();
        array_push($p,getParameter("og", "s", $og));
        array_push($p,getParameter("firstName", "s", @$_POST['firstName']));
        array_push($p,getParameter("lastName", "s", @$_POST['lastName']));
        array_push($p,getParameter("isMember", "i", boolFromPost("isMember")));
        array_push($p,getParameter("isActive", "i", boolFromPost("isActive")));
        array_push($p,getParameter("mainPersonId", "i", valueFromPost("mainPersonId", null)));
        array_push($p,getParameter("personGroup", "s", @$_POST['personGroup']));
        array_push($p,getParameter("credit", "d", valueFromPost("credit", 0)));
        array_push($p,getParameter("phone", "s", @$_POST['phone']));
        array_push($p,getParameter("email", "s", @$_POST['email']));
        array_push($p,getParameter("extId", "s", @$_POST['extId']));

        if(isInsert()) {
            array_push($p,getParameter("saleCount", "i", 0));
            array_push($p,getParameter("saleSum", "i", 0));
        }

        executeAndReturn($conn, $p, "person");

        //fix related persons
        $stmt = $conn->prepare("update person p set mainPersonId = null where length(personGroup)=0 and og=?"); 
        $stmt->bind_param("s", $og);
        $stmt->execute();
        $stmt = $conn->prepare("
            update person p
            set mainPersonId = (select min(id) from (select * from person) p2 where length(p2.personGroup)>0 and p2.personGroup = p.personGroup and p2.og = ?)
            where og=? and length(p.personGroup)>0");
        $stmt->bind_param("ss", $og, $og);
        $stmt->execute();

        //move credit to mainPerson
        $stmt = $conn->prepare("
            update person p
            set p.credit = COALESCE(p.credit,0) + COALESCE((select SUM(COALESCE(p2.credit,0)) from (select * from person) p2 where length(p2.personGroup)>0 and p2.personGroup = p.personGroup and p2.og=? and p2.id != p.id),0)
            where og=? and length(p.personGroup)>0 and mainPersonId = id");
        $stmt->bind_param("ss", $og, $og);
        $stmt->execute();

        //remove credit from non mainPerson
        $stmt = $conn->prepare("
            update person 
            set credit = 0
            where og=? and COALESCE(mainPersonId,id) != id");
        $stmt->bind_param("s", $og);
        $stmt->execute();

        break;
}
$conn->close();
?>