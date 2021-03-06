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
                        'credit' as type,
                        0 amount,
                        ifnull(ch.credit,0) as credit, 
                        ch.saleId,
                        ch.date
                    FROM credit_history ch
                    WHERE ch.saleId IS NULL
                    AND ch.personId = ?
                    
                    UNION
                    
                    SELECT
                        'sale' as type,
                        ifnull(s.articleSum,0) as amount,
                        ifnull(ch2.credit,0) as credit,
                        s.id saleId,
                        s.saleDate as date
                    FROM sale s
                    LEFT OUTER JOIN credit_history ch2 ON ch2.saleId = s.id
                    WHERE s.personId = ?
                    ANd s.og = ?
                    
                    ORDER BY date DESC
                ");
            $stmt->bind_param("iis", $personId, $personId, $og);
        }
        echoQueryAsJson(null, $stmt);
        break;
}
$conn->close();
?>