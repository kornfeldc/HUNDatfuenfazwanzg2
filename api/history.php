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
        $personId = @$_GET['personId'];

        if(isset($personId)) {
            $stmt = $conn->prepare("
                SELECT 
                    'credit' type,
                    h.saleId,
                    h.date,
                    h.credit amount,
                    h.isBought
                FROM credit_history h 
                JOIN person p ON p.id = h.personId
                LEFT OUTER JOIN sale s ON s.id = h.saleId
                WHERE p.og=? and p.id=?
                
                UNION

                SELECT
                    'sale' type,
                    s.id saleId,
                    s.saleDate date,
                    s.articleSum amount,
                    null isBought
                FROM sale s
                JOIN person p ON p.id = s.personId
                WHERE s.og=? AND p.id=?
                
                ORDER BY date DESC
                ");
            $stmt->bind_param("sisi", $og, $personId, $og, $personId);
        }
        echoQueryAsJson(null, $stmt);
        break;
}
$conn->close();
?>