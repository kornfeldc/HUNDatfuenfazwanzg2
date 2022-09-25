<?php
function isInsert() {
    $id = @$_POST['id'];
    return !isset($id) || $id=='_';
}

function isDelete() {
    $id = @$_POST['id'];
    $delete = @$_POST['delete'];
    return isset($id) && $id!='_' && isset($delete) && $delete == "1";
}

function boolFromPost($str) {
    return @$_POST[$str] == "true" || @$_POST[$str] == "1" || @$_POST[$str] == 1 ? 1 : 0;
}

function valueFromPost($str, $def) {
    $val = @$_POST[$str];
    if(!isset($val) || $val == "")
        $val = $def;
    return $val;
}

function echoQueryAsJson($id,$stmt) {
    $stmt->execute();
    $res = $stmt->get_result();

    ob_start('ob_gzhandler');

    if (!$id) echo '[';
    for ($i=0 ; $i<mysqli_num_rows($res) ; $i++) {
        echo ($i>0?',':'').json_encode(mysqli_fetch_object($res));
    }
    if (!$id) echo ']';
    http_response_code(200);
}

function echoExecuteAsJson($conn,$stmt,$isInsert) {
    if($stmt->execute())  {
        $id = @$_POST['id'];
        if($isInsert) {
            $last_id = $conn->insert_id;
            echoStatus(true, "", $last_id);    
        }
        else if(isset($id))
            echoStatus(true, "", $id);    
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
    
    ob_start('ob_gzhandler');
    echo(json_encode($status));
    http_response_code(200);
}

function getParameter($name, $type, $value) {
    $p = new \stdClass(); 
    $p->name=$name; 
    $p->type=$type;
    $p->value=$value;
    return $p;
}

function genereateStatement($parameterArray, $tableName) {
    $b = "";
    $p = array();

    $ret = new \stdClass();
    $ret->sql = "";
    $ret->b = "";
    $ret->p = array();

    if(isInsert()) {
        $ret->sql = "INSERT INTO " . $tableName . " (";
        
        foreach ($parameterArray as $parameter) {
            if($parameter->name != "id") {
                $ret->sql = $ret->sql . $parameter->name . ",";
                $ret->b = $ret->b . $parameter->type;
                array_push($ret->p, $parameter->value);
            }
        }
        $ret->sql = substr_replace($ret->sql ,"", -1);

        $ret->sql = $ret->sql . ") VALUES ("; 
        foreach ($parameterArray as $parameter) {
            $ret->sql = $ret->sql . "?,";
        }
        $ret->sql = substr_replace($ret->sql ,"", -1);
        $ret->sql = $ret->sql . ")";
    }
    else {
        $ret->sql = "UPDATE " . $tableName . " SET ";

        $og = "";
        foreach ($parameterArray as $parameter) {
             if($parameter->name != "id" && $parameter->name != "og") {
                 $ret->sql = $ret->sql . $parameter->name . " = ?,";
                 $ret->b = $ret->b . $parameter->type;
                 array_push($ret->p, $parameter->value);
            }
             else if($parameter->name = "og") 
                 $og = $parameter->value;
        }
        $ret->sql = substr_replace($ret->sql ,"", -1);
        $ret->sql = $ret->sql . " WHERE id = ? AND og = ?";
        $ret->b = $ret->b . "is";
        array_push($ret->p, @$_POST["id"]);
        array_push($ret->p, $og);
    }

    return $ret;
}

function executeAndReturn($conn, $p, $tableName) {
    $obj = genereateStatement($p, $tableName);
    //echo($obj->sql);
    //echo("b:".$obj->b);
    $stmt = $conn->prepare($obj->sql);
    $stmt->bind_param($obj->b, ...$obj->p);
    echoExecuteAsJson($conn,$stmt,isInsert());
}


?>