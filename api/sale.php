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
        $openedSaleForPersonId = @$_GET['openedSaleForPersonId'];

        if(isset($id)) {
            $stmt = $conn->prepare("
                SELECT 
                    s.*,
                    CASE WHEN mp.id IS NOT NULL THEN mp.credit ELSE p.credit END personCredit
                FROM sale s 
                LEFT OUTER JOIN person p ON s.personId = p.id
                LEFT OUTER JOIN person mp ON p.mainPersonId = mp.id
                WHERE s.og=? and s.id=?");
            $stmt->bind_param("si", $og, $id);
        }
        else if(isset($openedSaleForPersonId)) {
            $stmt = $conn->prepare("
                SELECT 
                    s.*,
                    CASE WHEN mp.id IS NOT NULL THEN mp.credit ELSE p.credit END personCredit
                FROM sale s
                LEFT OUTER JOIN person p ON s.personId = p.id
                LEFT OUTER JOIN person mp ON p.mainPersonId = mp.id
                WHERE s.og=? 
                  and s.personId=? 
                  and s.payDate is null");
            $stmt->bind_param("si", $og, $openedSaleForPersonId);
        }
        else {
            $sql = "
                SELECT 
                    s.*,
                    CASE WHEN mp.id IS NOT NULL THEN mp.credit ELSE p.credit END personCredit
                FROM sale s
                LEFT OUTER JOIN person p ON s.personId = p.id
                LEFT OUTER JOIN person mp ON p.mainPersonId = mp.id
                WHERE s.og=?
                ";
            $b = "s";
            $p = array($og);

            $day = @$_GET['day'];
            if(isset($day)) {
                $sql = $sql." and (s.saleDate=? or (DATE(?) = DATE(NOW()) and s.payDate is null))";
                $b = $b."ss";
                array_push($p,$day);
                array_push($p,$day);
            }

            $stmt = $conn->prepare($sql);
            $stmt->bind_param($b, ...$p);
        }
        echoQueryAsJson($id, $stmt);
        break;

    case 'POST':
        $id = @$_POST['id'];

        if(isDelete()) {

            //when deleting sale, revert credit related entries
            $stmt = $conn->prepare("SELECT id, personId, credit FROM credit_history WHERE saleId = ?"); 
            $stmt->bind_param("i", $id); 
            $stmt->execute();
            $res = $stmt->get_result();
            for ($i=0 ; $i<mysqli_num_rows($res) ; $i++) {
                $obj = mysqli_fetch_object($res);

                $stmt2 = $conn->prepare("UPDATE person SET credit = coalesce(credit,0) - ? WHERE id = ?");
                $stmt2->bind_param("di", $obj->credit, $obj->personId); 
                $stmt2->execute();

                $stmt3 = $conn->prepare("DELETE FROM credit_history WHERE id = ?");
                $stmt3->bind_param("i", $obj->id); 
                $stmt3->execute();
            }

            $stmt = $conn->prepare("delete from sale_article where saleId = ?"); $stmt->bind_param("i", $id); $stmt->execute();
            $stmt = $conn->prepare("delete from sale where id = ?");  $stmt->bind_param("i", $id); $stmt->execute();
            echoStatus(true, "", "");
            recalculate($conn, $og);
        }
        else {
            $p = array();
            array_push($p,getParameter("og", "s", $og));
            array_push($p,getParameter("personId", "i", valueFromPost("personId", null)));
            array_push($p,getParameter("personName", "s", valueFromPost("personName", "")));
            array_push($p,getParameter("saleDate", "s", valueFromPost("saleDate", null)));
            array_push($p,getParameter("payDate", "s", valueFromPost("payDate", null)));
            array_push($p,getParameter("toPay", "d", @$_POST["toPay"]));
            array_push($p,getParameter("toReturn", "d", @$_POST["toReturn"]));
            array_push($p,getParameter("inclTip", "d", @$_POST["inclTip"]));
            array_push($p,getParameter("given", "d", @$_POST["given"]));
            array_push($p,getParameter("articleSum", "d", @$_POST["articleSum"]));
            array_push($p,getParameter("addAdditionalCredit", "d", @$_POST["addAdditionalCredit"]));
            array_push($p,getParameter("usedCredit", "d", boolFromPost("usedCredit")));
            array_push($p,getParameter("extId", "s", @$_POST['extId']));
            executeAndReturn($conn, $p, "sale");
        }

        break;
}
$conn->close();
?>