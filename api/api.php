<?php
function getOg($conn) {
    $hash = $_GET["hash"];
    if(!isset($hash))
        $hash = $_POST["hash"];
    //https://www.php.net/manual/de/mysqli.prepare.php
    $stmt = $conn->prepare("SELECT og FROM user WHERE hash=?");
    $stmt->bind_param("s", $hash);
    $stmt->execute();
    $res = $stmt->get_result();
    $og = null;
    if ($res->num_rows == 1) {
        $row = $res->fetch_assoc();
        $og = $row["og"];
    }
    return $og;
}

function isInsert() {
    $id = $_POST['id'];
    return !isset($id) || $id=='_';
}

function boolFromPost($str) {
    return $_POST[$str] == "true" || $_POST[$str] == "1" || $_POST[$str] == 1 ? 1 : 0;
}

function valueFromPost($str, $def) {
    $val = $_POST[$str];
    if(!isset($val) || $val == "")
        $val = $def;
    return $val;
}

function echoQueryAsJson($id,$stmt) {
    $stmt->execute();
    $res = $stmt->get_result();
    if (!$id) echo '[';
    for ($i=0 ; $i<mysqli_num_rows($res) ; $i++) {
        echo ($i>0?',':'').json_encode(mysqli_fetch_object($res));
    }
    if (!$id) echo ']';
}

function echoExecuteAsJson($conn,$stmt,$isInsert) {
    if($stmt->execute())  {
        if($isInsert) {
            $last_id = $conn->insert_id;
            echoStatus(true, "", $last_id);    
        }
        else if(isset($_POST['id']))
            echoStatus(true, "", $_POST['id']);    
        else
            echoStatus(true, "", "");

    }
    else 
        echoStatus(false, $stmt->error, "");
}

function echoStatus($ok, $message, $id) {
    $status = new \stdClass();
    $status->status = $ok ? "ok" : "nok";
    if(isset($message) && $message != "")
        $status->message = $message;
    if(isset($id) && $id != "")
        $status->id = $id;
    echo(json_encode($status));
}
?>