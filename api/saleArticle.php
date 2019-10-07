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
        $id = $_GET['id'];

        if(isset($id)) {
            $stmt = $conn->prepare("SELECT * FROM sale_article WHERE og=? and id=?");
            $stmt->bind_param("si", $og, $id);
        }
        else {
            $sql = "SELECT sa.* FROM sale_article sa JOIN sale s ON sa.saleId = s.id WHERE sa.og=?";
            $b = "s";
            $p = array($og);

            if(isset($_GET['day'])) {
                $sql = $sql." and s.saleDate=?";
                $b = $b."s";
                array_push($p,$_GET['day']);
            }

            if(isset($_GET['saleId'])) {
                $sql = $sql." and s.id=?";
                $b = $b."i";
                array_push($p,$_GET['saleId']);
            }

            $stmt = $conn->prepare($sql);
            $stmt->bind_param($b, ...$p);
        }

        echoQueryAsJson($id, $stmt);
        break;

    case 'POST':
        $amount = $_POST["amount"];
        if(!isInsert() && $amount == 0) {
            $stmt = $conn->prepare("DELETE FROM sale_article WHERE id=? and og=?");
            $stmt->bind_param("is", $id, $og);
            echoExecuteAsJson($conn,$stmt,isInsert());
        }
        else if($amount != 0) {
            $p = array();
            array_push($p,getParameter("og", "s", $og));
            array_push($p,getParameter("articleId", "i", valueFromPost("articleId", null)));
            array_push($p,getParameter("articleTitle", "s", valueFromPost("articleTitle", "")));
            array_push($p,getParameter("articlePrice", "d", $_POST["articlePrice"]));
            array_push($p,getParameter("amount", "d", $_POST["amount"]));
            array_push($p,getParameter("saleId", "i", valueFromPost("saleId", null)));
            executeAndReturn($conn, $p, "sale_article");
        }

        //update person sale count (possible improving performance by just updating this person instead of all)
        $stmt = $conn->prepare("update person p set p.saleCount = (select count(*) from sale s where s.personId = p.id) where p.og = ?");  $stmt->bind_param("s", $og); $stmt->execute();
        $stmt = $conn->prepare("update person p set p.saleSum = (select sum(s.articleSum) from sale s where s.personId = p.id) where p.og = ?");  $stmt->bind_param("s", $og); $stmt->execute();

        $stmt = $conn->prepare("
            insert ignore into person_article_usage 
                (personId, articleId, amount) 
                (
                        select 
                            s.personId, sa.articleId, sum(sa.amount)
                        from sale_article sa 
                        join sale s on s.id = sa.saleId 
                        group by s.personId, sa.articleId
                )"); 
        $stmt->execute();
        $stmt = $conn->prepare("
            update person_article_usage pa 
            inner join (
                select s.personId, sa.articleId, sum(sa.amount) as amount
                from sale s
                join sale_article sa on sa.saleId = s.id
                group by s.personId, sa.articleId
            ) su ON pa.articleId = su.articleId AND pa.personId = su.personId
            set pa.amount = su.amount"); 
        $stmt->execute();

        //update sale_day
        $stmt = $conn->prepare("
                insert ignore into sale_day (og, day, payed, toPay)
                (
                    select 
                        og, saleDate, sum(case when payDate is not null then articleSum else 0 end), sum(case when payDate is null then articleSum else 0 end)
                    from sale
                    group by og, saleDate
                )
        ");
        $stmt->execute();
        $stmt = $conn->prepare("
                update sale_day sd
                inner join (
                    select 
                        og, saleDate, sum(case when payDate is not null then articleSum else 0 end) payed, sum(case when payDate is null then articleSum else 0 end) toPay
                    from sale
                    group by og, saleDate
                ) x on x.og = sd.og and x.saleDate = sd.day
                set sd.payed = x.payed, sd.toPay = x.toPay
        ");
        $stmt->execute();

        break;
}
$conn->close();
?>