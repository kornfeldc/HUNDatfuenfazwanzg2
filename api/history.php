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
                        ch.id,
                        'credit' as type,
                        0 amount,
                        ifnull(ch.credit,0) as credit, 
                        ch.saleId,
                        ch.date,
                        ch.date as additionalDate
                    FROM credit_history ch
                    WHERE ch.saleId IS NULL
                    AND ch.personId = ?
                    
                    UNION
                    
                    SELECT
                        s.id, 
                        'sale' as type,
                        ifnull(s.articleSum,0) as amount,
                        ifnull(ch2.credit,0) as credit,
                        s.id saleId,
                        s.payDate as date,
                        s.saleDate as additionalDate
                    FROM sale s
                    LEFT OUTER JOIN credit_history ch2 ON ch2.saleId = s.id
                    WHERE s.personId = ?
                    ANd s.og = ?
                    AND s.payDate is not null
                    
                    ORDER BY date DESC, id DESC
                ");
            $stmt->bind_param("iis", $personId, $personId, $og);
        }
        echoQueryAsJson(null, $stmt);
        break;
}
$conn->close();
?>