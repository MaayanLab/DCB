requirejs.config({

baseUrl: 'scripts/app',

paths: {
	underscore: "../lib/underscore-min",
	backbone: "../lib/backbone-min",
	d3: "../lib/d3.min",
	jquery: "../lib/jquery-1.8.2.min",
},

shim:{

	'backbone':{
		deps:['underscore','jquery'],
		exports: 'Backbone'
	},

	'underscore':{
		exports:'_'
	},

	'jquery':{
		exports:'$'
	},

	'd3':{
		exports:'d3'
	},
}

});


var cc;

require(['Button','CanvasWithCircleText','CellLineLegend','DynamicTextDisplay','g','ScaleBar','Select','Slider','textLabel'],
	function(Button,CanvasWithCircleText,Legend,DynamicTextDisplay,g,ScaleBar,Select,SliderWithIndicator,textLabelToggle){

//define controlers
	var drugSelect = new Select({ID:"selectDrug1",eventName:"drugSelected",noneOption:"Select Drug"});

	var cellLineCategorySelect = new Select({ID:"cancer",eventName:"cellLineCategorySelected",noneOption:"Filter by Cell Category"});
	var datasetSelect = new Select({ID:"dataSelection",eventName:"datasetSelected"});
	datasetSelect.populate([{text:'MGH/Sanger Dataset',value:'mgh'},{text:'CCLE Dataset',value:'ccle'},{text:'Heiser Dataset',value:'heiser'}]);

	var cellLineFilterSlider = new SliderWithIndicator({ID:"filterCellLine",eventName:"cellLineFilterChanged",indicatorID:"filterValue"});
	var drugFilterSlider = new SliderWithIndicator({ID:"filterDrug",eventName:"drugFilterSliderChanged",indicatorID:"indicatorDrugFilter"});

	var resetButton = new Button({ID:"clearButton",eventName:"reset"});
	var downloadButton = new Button({ID:"download",eventName:"download"});
	downloadButton.disable();

	var drugCanvasSensitiveScoreViewRadioButton = new Button({ID:"drugCanvasSensitiveScoreView",eventName:"viewSelected",data:"sensitiveScoreCanvas"});
	var drugCanvasStructureViewRadioButton = new Button({ID:"drugCanvasStructureView",eventName:"viewSelected",data:"structureCanvas"});
	var drugCanvasTargetViewRadioButton = new Button({ID:"drugCanvasTargetView",eventName:"viewSelected",data:"targetCanvas"});
	var drugCanvasPerturbationViewRadioButton = new Button({ID:"drugCanvasPerturbationView",eventName:"viewSelected",data:"perturbationCanvas"});


	var cellLineCanvasSensitiveScoreViewRadioButton = new Button({ID:"cellLineCanvasSensitiveScoreView",eventName:"viewSelected",data:"sensitiveScoreCanvas"});
	var cellLineCanvasCategoryViewRadioButton = new Button({ID:"cellLineCanvasCategoryView",eventName:"viewSelected",data:"categoryCanvas"});
	var cellLineCanvasGeneExpressionViewRadioButton = new Button({ID:"cellLineCanvasGeneExpressionView",eventName:"viewSelected",data:"geneExpressionCanvas"});
	var cellLineCanvasMutationViewRadioButton = new Button({ID:"cellLineCanvasMutationView",eventName:"viewSelected",data:"mutationCanvas"});


//define displayers
	var cellLineCanvas = new CanvasWithCircleText({stageSize:350,containerID:"cancerView"});
	var drugCanvas = new CanvasWithCircleText({highlightColor:"rgb(255,255,255)",stageSize:125,containerID:"drugCanvas",shiftScale:7});
	var cellLineLegend = new Legend({containerID:"cellLineLegend",width:90,height:350});

	var drugCanvasLegend = new ScaleBar({width:115,height:18,containerID:'drugCanvasLegend',label:"Clustering Fitness",fontSize:13});
	var cellLineCanvasLegend = new ScaleBar({width:320,height:18,containerID:'cellLineCanvasLegend',label:"Clustering Fitness",display:'none'});

	var cellLineCanvasClusteringLabel = new DynamicTextDisplay({ID:'cellLineCanvasClusteringLabel'});
	var drugCanvasClusteringLabel = new DynamicTextDisplay({ID:'drugCanvasClusteringLabel'});

	cc = cellLineCanvas;

//define interactions

	// g.datasetChanged events
	cellLineCanvas.listenTo(g,"g.datasetChanged->cellLineCanvas",function(eventData){
		cellLineCanvas.resetStates();
		cellLineCanvas.changeData(eventData);
	});
	cellLineLegend.listenTo(g,"g.datasetChanged->cellLineLegend",cellLineLegend.changeData);
	cellLineCanvasLegend.listenTo(g,'g.datasetChanged->cellLineCanvasLegend',cellLineCanvasLegend.changeData);
	cellLineCanvasClusteringLabel.listenTo(g,'g.datasetChanged->cellLineCanvasClusteringLabel',cellLineCanvasClusteringLabel.changeText);

	drugCanvas.listenTo(g,'g.datasetChanged->drugCanvas',function(eventData){
		drugCanvas.resetStates();
		drugCanvas.changeData(eventData);
	});
	drugCanvasLegend.listenTo(g,'g.datasetChanged->drugCanvasLegend',drugCanvasLegend.changeData);
	drugCanvasClusteringLabel.listenTo(g,'g.datasetChanged->drugCanvasClusteringLabel',drugCanvasClusteringLabel.changeText);

	cellLineCategorySelect.listenTo(g,"g.datasetChanged->cellLineCategorySelect",cellLineCategorySelect.populate);
	drugSelect.listenTo(g,"g.datasetChanged->drugSelect",drugSelect.populate);

	g.initialize('mgh');
	g.listenTo(datasetSelect,'datasetSelected',g.changeDataset);


	// cellLineLegend canvas mouseover events
	g.listenTo(cellLineCanvas,"tile.mouseover",g.revealTileCategory);
	cellLineLegend.listenTo(g,"tileCatetoryRevealed",cellLineLegend.highlight);
	cellLineLegend.listenTo(cellLineCanvas,'canvas.mouseout',cellLineLegend.reset);


	// show category event;
	cellLineCategorySelect.listenTo(cellLineLegend,'category.click',cellLineCategorySelect.setOption);
	g.listenTo(cellLineCategorySelect,"cellLineCategorySelected",g.revealCategoryCellLines);
	cellLineCanvas.listenTo(g,"categoryCellLinesRevealed",cellLineCanvas.showCategory);

	cellLineCanvas.listenTo(cellLineCategorySelect,"noneOptionSelected",cellLineCanvas.removeCategory);


	// controlers orignated events
	cellLineCanvas.listenTo(textLabelToggle,"textLabelToggled",cellLineCanvas.toggleText);
	cellLineCanvas.listenTo(resetButton,"reset",cellLineCanvas.reset);
	drugCanvas.listenTo(resetButton,"reset",drugCanvas.reset);
	g.listenTo(resetButton,"reset",g.resetState);

	g.listenTo(cellLineFilterSlider,"cellLineFilterChanged",g.setCellLineAssociationPercentage);
	g.listenTo(drugFilterSlider,"drugFilterSliderChanged",g.setDrugAssociationPercentage);

	drugCanvas.listenTo(drugSelect,"drugSelected",drugCanvas.selectTile);
	drugSelect.listenTo(drugCanvas,"tile.click",function(eventData){
		drugSelect.setOptionSilently(eventData.d.identity);});

	resetButton.listenTo(drugSelect,'noneOptionSelected',resetButton.programmaticalClick);
	drugSelect.listenTo(resetButton,'reset',drugSelect.setToNoneOptionSilently);

	drugSelect.listenTo(g,"g.cellLineCanvasRemvoeAssociated",drugSelect.setToNoneOptionSilently);


	//drug and cellLine click events
	g.listenTo(drugCanvas,"tile.click",g.sendAssociatedCellLines);
	cellLineCanvas.listenTo(g,"g.associatedCellLinesSent",cellLineCanvas.showAssociatedTiles);
	cellLineLegend.listenTo(g,"g.CategoriesPvaluesSent",cellLineLegend.showAssociatedCategories);

	g.listenTo(cellLineCanvas,"tile.click",g.sendAssociatedDrugs);
	drugCanvas.listenTo(g,"g.associatedDrugsSent",drugCanvas.showAssociatedTiles);


	cellLineCanvas.listenTo(g,'g.cellLineCanvasRemvoeAssociated',cellLineCanvas.removeAssociated);
	// such intricacies imposed upon cellLineLegend is to prevent cellLegend.removeAssociatedCategories
	// and cellLegend.highlight/.reset from conflicting each other. The following lines basically say that
	// cellLineLegend stops listening to other events while executing cellLineLegend.removeAssociatedCategories.
	// other events are added back after the execution is finished.
	// CONSIDER add a stopListeningToAllTemporarily to backbone.js
	cellLineLegend.listenTo(cellLineCanvas,'associatedRemoved',function(){
				cellLineLegend.stopListening(g,"tileCatetoryRevealed");
				cellLineLegend.stopListening(cellLineCanvas,"canvas.mouseout");
				cellLineLegend.removeAssociatedCategories()
			});
	cellLineLegend.on("associatedCategoriesRemoved",function(){
		cellLineLegend.listenTo(g,"tileCatetoryRevealed",cellLineLegend.highlight);
		cellLineLegend.listenTo(cellLineCanvas,'canvas.mouseout',cellLineLegend.reset);
	});

	drugCanvas.listenTo(g,'g.drugCanvasRemvoeAssociated',drugCanvas.removeAssociated);


	//download result
	downloadButton.listenTo(g,"resultsComputed",downloadButton.enable);
	downloadButton.listenTo(g,"resultsRemoved",downloadButton.disable);
	g.listenTo(downloadButton,"download",g.getResults);



	//drugCanvasView Switch Events:
	g.listenTo(drugCanvasSensitiveScoreViewRadioButton,"viewSelected",g.changeDrugCanvasView);
	g.listenTo(drugCanvasStructureViewRadioButton,"viewSelected",g.changeDrugCanvasView);
	g.listenTo(drugCanvasTargetViewRadioButton,'viewSelected',g.changeDrugCanvasView);
	g.listenTo(drugCanvasPerturbationViewRadioButton,'viewSelected',g.changeDrugCanvasView);
	drugCanvasLegend.listenTo(g,'drugCanvasLegendViewChanged',drugCanvasLegend.changeData);
	drugCanvas.listenTo(g,"drugCanvasViewChanged",drugCanvas.changeData);
	drugCanvasClusteringLabel.listenTo(g,'drugCanvasClusteringLabelChanged',drugCanvasClusteringLabel.changeText);


	//cellLineCanvasView Switch Events:
	g.listenTo(cellLineCanvasCategoryViewRadioButton,"viewSelected",g.changeCellLineCanvasView);
	g.listenTo(cellLineCanvasSensitiveScoreViewRadioButton,"viewSelected",g.changeCellLineCanvasView);
	g.listenTo(cellLineCanvasGeneExpressionViewRadioButton,"viewSelected",g.changeCellLineCanvasView);
	g.listenTo(cellLineCanvasMutationViewRadioButton,"viewSelected",g.changeCellLineCanvasView);
	cellLineCanvasLegend.listenTo(g,'cellLineCanvasLegendViewChanged',cellLineCanvasLegend.changeData);
	cellLineCanvas.listenTo(g,"cellLineCanvasViewChanged",cellLineCanvas.changeData);
	cellLineCanvasClusteringLabel.listenTo(g,"cellLineCanvasClusteringLabelChanged",cellLineCanvasClusteringLabel.changeText);	

	
});


