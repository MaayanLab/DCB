<?php
    header('Content-Disposition: attachment; filename="results.txt"');
    header('Content-Type: text/h323');

    $timeStamp = $_GET["timeStamp"];
    $filename = "results_" . $timeStamp . ".txt" ;

    $fp = fopen($filename, "r");
    fpassthru($fp);
    fclose($fp);
    // delete the file 
    unlink($filename);
?>