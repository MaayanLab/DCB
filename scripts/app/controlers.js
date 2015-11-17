//@import Select.js





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
