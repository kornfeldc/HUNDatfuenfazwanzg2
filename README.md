# HUNDatfuenfazwanzg2

To get started with development, create a new file 
`nogit\connection.php`
with following content
```php
<?php
function openDb() {
    $servername = "127.0.0.1:3307";
    $username = "";
    $password = "";
    $dbname = "";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}
?>
```