<?php
	$jsonData = $_POST['data'];
	
    $data = json_decode(str_replace('\\', '', $jsonData));
    $filename = 'results_' . $data->timeStamp . '.txt';
    if($data->type=="associatedCellLines"){
    	$wStr = sprintf("drug name: %s \n\n",$data->identity);
    	$wStr = $wStr . sprintf("%d%% Associated CellLines: \n",$data->filterPercentage);
    	$wStr = $wStr . sprintf("CellLine\tCategory\tSensitive_Score\n");
    	$cellLines = (array) $data->cellLines;
    	foreach($data->arr as $item){
    		$wStr = $wStr . sprintf("%s\t%s\t%f\n",$item->cellLine,$cellLines[$item->cellLine],1-$item->rate);
    	}

    	$wStr = $wStr . "\n";

    	$wStr = $wStr . "Category p-values:\n";
    	$i = 0;
    	$pvalues = (array) $data->pvalues;

    	foreach($data->categories as $category){
    		$wStr = $wStr . sprintf("%s\t%f\n",$category,$pvalues[$i]);
    		$i++;
    	}
    }else{
    	$wStr = sprintf("cellLine name: %s \n\n",$data->identity);
    	$wStr = $wStr . sprintf("%d%% Associated Drugs: \n",$data->filterPercentage);
    	$wStr = $wStr . sprintf("Drug\tSensitive_Score\n");
    	foreach($data->arr as $item){
    		$wStr = $wStr . sprintf("%s\t%f\n",$item->drug,1-$item->rate);
    	}

    	$wStr = $wStr . "\n";
    }
    $fp = fopen($filename, 'w');
    fwrite($fp, $wStr);
    fclose($fp);
?>