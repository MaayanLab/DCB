define(['jquery','underscore','backbone','d3','Fisher'],function($, _, Backbone, d3,Fisher){

// global master control object. Hold all data.

// function dataModel(){
// 	throw new Error("abstract object"); 
// 	this.survivalRate = [{cellLine:null,drug:null,rate:null},]; //sorted by rate.
// 	this.cellLines.info = {cellLineName1:tissue,};
// 	this.cellLines.categories = {category1:color,};
// 	this.cellLines.categoryCanvas = [texts:{},weight:{}];
// 	this.cellLines.sensitiveScoreCanvas = [];
// 	this.cellLines.geneExpressionCanvas = [];
//  this.cellLines.viewNames = {structureCanvas:,sensitiveScoreCanvas:}
// 	this.drugs.info = {drug:target}
// 	this.drugs.sensitiveScoreCanvas = {color:,scaleExponent:,input:[]};
// 	this.drugs.structureCanvas = {color:,scaleExponent:,input:[]};
// 	this.drugs.targetCanvas = {color:,scaleExponent:,input:[]};
// 	this.drugs.geneExpressionCanvas = {color:,scaleExponent:,input:[]};
//  this.drugs.viewNames = {structureCanvas:'Structure\nView'}
// }



var g = {
	datasets:{},
	currentDataset:null,
	cellLineAssociationPercentage:null,
	drugAssociationPercentage:null,
	drugCanvasClicked:false,
	cellLineCanvasClicked:false,
	current:{},

	initialize:function(datasetID){
		this.cellLineAssociationPercentage = parseFloat(d3.select("#filterCellLine").property("value"));
		this.drugAssociationPercentage = parseFloat(d3.select("#filterDrug").property("value"));
		this.changeDataset(datasetID);
		this.associatedColorScale = d3.scale.linear()	
									.domain([0,1])
									.range([255, 0])
									.clamp(true);
		this.fisher = new Fisher;

		// unique time identifier for different users for download results.
		this.timeStamp = (new Date).getTime().toString();
		this.currentResults = null;
		this.current.drugCanvasView = "sensitiveScoreCanvas";
		this.current.cellLineCanvasView = 'categoryCanvas';
	},

	resetState:function(){
		this.drugCanvasClicked = false;
		this.cellLineCanvasClicked = false;
		this.currentResults = null;
		this.trigger("resultsRemoved");
	},

	getAssociatedCellLines:function(drug){
		// survivalRate already be sorted
		var matchedCellLines = _.filter(this.currentDataset.survivalRate,function(obj){
			return obj.drug == drug;
		});
		var self = this;
		var associatedCount = Math.floor(matchedCellLines.length*this.cellLineAssociationPercentage/100);
		var associatedCellLines = {};
		var associatedCellLinesArr = [];
		_.each(matchedCellLines,function(e,i){
			if(i<associatedCount) {
				var color = Math.floor(self.associatedColorScale(e.rate));
				associatedCellLines[e.cellLine] = "rgb("+[color,color,color].join(',')+")";
				associatedCellLinesArr.push(e);
			}
		});

		// for downloading purpose.
		var results = {};
		results.timeStamp = this.timeStamp;
		results.arr = associatedCellLinesArr;
		results.filterPercentage = this.cellLineAssociationPercentage;
		results.type = "associatedCellLines";
		results.identity = drug;
		this.currentResults = results;

		return associatedCellLines;
	},

	getAssociatedDrugs:function(cellLine){
		// survivalRate already be sorted
		var matchedDrugs = _.filter(this.currentDataset.survivalRate,function(obj){
			return obj.cellLine == cellLine;
		});
		var self = this;
		var associatedCount = Math.floor(matchedDrugs.length*this.drugAssociationPercentage/100);
		var associatedDrugs = {};
		var associatedDrugsArr = []; // to be used in download results
		_.each(matchedDrugs,function(e,i){
			if(i<associatedCount) {
				var color = Math.floor(self.associatedColorScale(e.rate));
				associatedDrugs[e.drug] = "rgb("+[color,color,color].join(',')+")";
				associatedDrugsArr.push(e);
			}
		});

		// for downloading purpose.
		var results = {};
		results.timeStamp = this.timeStamp;
		results.arr = associatedDrugsArr;
		results.filterPercentage = this.drugAssociationPercentage;
		results.type = "associatedDrugs";
		results.identity = cellLine;
		this.currentResults = results;

		return associatedDrugs;
	},

	sendAssociatedCellLines:function(eventData){
		this.drugCanvasClicked = true;
		this.clickedDrug = eventData;
		if(this.cellLineCanvasClicked){
			this.trigger('g.drugCanvasRemvoeAssociated');
			this.cellLineCanvasClicked = false;
		}else{
			this.trigger("resultsComputed");
		}
		
		var associatedCellLines = this.getAssociatedCellLines(eventData.d.identity);
		this.trigger("g.associatedCellLinesSent",associatedCellLines);


		var pvalues = this.getCategoriesPvalues(associatedCellLines);
		this.trigger("g.CategoriesPvaluesSent",pvalues);

		// other properties of currentResults should be set in this.getAssociatedCellLines
		this.currentResults.categories = Object.keys(this.currentDataset.cellLines.categories).sort();
		this.currentResults.pvalues = pvalues;
	},

	getCategoriesPvalues:function(associatedCellLines){
		
		var categories = Object.keys(this.currentDataset.cellLines.categories).sort();
		var currentCellLines = this.currentDataset.cellLines.info;
		var d_pre = Object.keys(currentCellLines).length;
		var associatedCellLinesArr = Object.keys(associatedCellLines);
		var b_pre = associatedCellLinesArr.length;
		var self = this;
		var pvalues = [];
		_.each(categories,function(category,i){
			var categoryCellLines = [];
			_.each(currentCellLines,function(val,key){
				if(val==category)
					categoryCellLines.push(key);
			});

			var c = categoryCellLines.length;
			var a = _.intersection(associatedCellLinesArr,categoryCellLines).length;
			var pval = self.fisher.fisherExact_Right(a,b_pre-a,c,d_pre-c);
			pvalues.push(pval);
		});

		return pvalues;


	},

	sendAssociatedDrugs:function(eventData){
		this.cellLineCanvasClicked = true;
		this.clickedCellLine = eventData;
		if(this.drugCanvasClicked){
			this.trigger('g.cellLineCanvasRemvoeAssociated');
			this.drugCanvasClicked = false;
		}else{
			this.trigger("resultsComputed");
		}
		this.trigger('cellLineCanvasRemoveAssociated');
		var associatedDrugs = this.getAssociatedDrugs(eventData.d.identity);
		this.trigger("g.associatedDrugsSent",associatedDrugs);
	},


	getResults:function(){
		var self = this;
		if(this.currentResults.type=="associatedCellLines")
			this.currentResults.cellLines = this.currentDataset.cellLines.info;
		$.post('download/saveToServer.php',{data:JSON.stringify(this.currentResults)},function(){
				window.location="download/forceDownload.php?timeStamp=" + self.timeStamp;
		});
		
	},

	setCellLineAssociationPercentage:function(eventData){
		this.cellLineAssociationPercentage = parseFloat(eventData);
		if(this.drugCanvasClicked) this.sendAssociatedCellLines(this.clickedDrug);
	},

	setDrugAssociationPercentage:function(eventData){
		this.drugAssociationPercentage = parseFloat(eventData);
		if(this.cellLineCanvasClicked) this.sendAssociatedDrugs(this.clickedCellLine);
	},

	revealTileCategory:function(eventData){
		var tileIdentity = eventData.d.identity;
		this.trigger("tileCatetoryRevealed",this.currentDataset.cellLines.info[tileIdentity]);
	},

	revealCategoryCellLines:function(eventData){
		var category = eventData;
		var categoryCellLines = [];
		_.each(this.currentDataset.cellLines.info,function(val,key){
			if(val==category) categoryCellLines.push(key);
		});
		this.trigger("categoryCellLinesRevealed",categoryCellLines);
	},


	convertCanvasFormat:function(canvas){
		var input = canvas.input;
		var color = canvas.color;
		var scaleExponent = canvas.scaleExponent;

		var res = [];
		var comp = [];
		var redundantCounter = 0;
		var colorScale = d3.scale.pow().exponent(scaleExponent)
						.domain([_.min(input.weights),_.max(input.weights)])
						.range(["black",color]);
		input.texts.forEach(function(e,i){
			var temp = {};
			temp.identity = e;
			temp.idx = i;
			temp.color = colorScale(input.weights[i]);
			if(comp.indexOf(e)!=-1){
				temp.joinID = 'redundant'+redundantCounter;
				redundantCounter++;
			}else{
				temp.joinID = e;
				comp.push(e);
			}
			res.push(temp);
		});
		return [res,colorScale];

	},

	prepareDrugCanvasData:function(){
		var self = this;
		var data = {},
			currentDrugCanvasView = self.currentDataset.drugs[this.current.drugCanvasView];
	
		var output = this.convertCanvasFormat(currentDrugCanvasView);
		data.input = output[0];
		this.current.drugCanvasWeightScale = output[1];

		data.viewName = self.currentDataset.drugs.viewNames[this.current.drugCanvasView];
		data.shiftScale = self.currentDataset.drugs.canvasShiftScale;
		return data;
	},

	prepareDrugCanvasLegendData:function(){
			var scale = this.current.drugCanvasWeightScale,
				domain = scale.domain();

			var count = 10;
			var unit = (domain[1]-domain[0])/count
			var colors = _.map(_.range(0,count),function(e){
				return scale(domain[0]+e*unit);
			});
			var data = {};
			data.colors = colors;
			// round to first digit
			data.valueRange = [Math.round(domain[0]*10)/10,Math.round(domain[1]*10)/10];

			return data;
		},

	
	changeDrugCanvasView:function(eventData){
		this.current.drugCanvasView = eventData;
		this.trigger("drugCanvasViewChanged",this.prepareDrugCanvasData());
		this.trigger("drugCanvasLegendViewChanged",this.prepareDrugCanvasLegendData());
		this.trigger("drugCanvasClusteringLabelChanged",this.currentDataset.drugs.viewClusteringLabels[this.current.drugCanvasView]);

	},

	prepareCellLineCanvasData:function(){
		var self = this,
		currentCanvas = this.currentDataset.cellLines[this.current.cellLineCanvasView],
		data = {};
		// data.identities = currentCanvas.input.texts;

		// generate data.colors
		if(this.current.cellLineCanvasView=="categoryCanvas"){
			var identities = currentCanvas.input.texts;
			var colors = _.map(identities,function(e){
				var colorVal = self.currentDataset.cellLines.categories[self.currentDataset.cellLines.info[e]];
				// convert [val,val,val] to string
				return "rgb(" + colorVal.join(',') + ")";
			});
			var res = [];
			var comp = [];
			var redundantCounter = 0;
			identities.forEach(function(e,i){
				var temp = {};
				temp.identity = e;
				temp.idx = i;
				temp.color = colors[i];
				if(comp.indexOf(e)!=-1){
					temp.joinID = 'redundant'+redundantCounter;
					redundantCounter++;
				}else{
					temp.joinID = e;
					comp.push(e);
				}
				res.push(temp);
			});
			data.input = res;
		}else{

			var output = this.convertCanvasFormat(currentCanvas);
			data.input = output[0];
			this.current.cellLineCanvasWeightScale = output[1];

		}


		data.viewName = self.currentDataset.cellLines.viewNames[this.current.cellLineCanvasView];
		data.shiftScale = self.currentDataset.cellLines.canvasShiftScale;
		return data;

	},


	prepareCellLineCanvasLegendData:function(){
		data = {};
		if(this.current.cellLineCanvasView=="categoryCanvas"){
			data.display = 'none';
			return data;
		}else{
			var scale = this.current.cellLineCanvasWeightScale,
				domain = scale.domain();

			var count = 25;
			var unit = (domain[1]-domain[0])/count
			var colors = _.map(_.range(0,count),function(e){
				return scale(domain[0]+e*unit);
			});
			var data = {};
			data.colors = colors;
			// round to first digit
			var round = function(num){
				return Math.round(num*10)/10;
			}
			data.valueRange = [round(domain[0]), round(d3.mean(domain)),round(domain[1])];
			data.display = "inline"

			return data;

		}

	},

	changeCellLineCanvasView:function(eventData){
		this.current.cellLineCanvasView = eventData;
		this.trigger("cellLineCanvasViewChanged",this.prepareCellLineCanvasData());
		this.trigger("cellLineCanvasLegendViewChanged",this.prepareCellLineCanvasLegendData());
		this.trigger("cellLineCanvasClusteringLabelChanged",this.currentDataset.cellLines.viewClusteringLabels[this.current.cellLineCanvasView]);

	},



	changeDataset:function(datasetID){
		var self = this;

		var prepareCellLineLegendData = function(){
			var data = {};
			data.identities = Object.keys(self.currentDataset.cellLines.categories).sort();
			data.colors = _.map(data.identities,function(identity){
				var colorVal = self.currentDataset.cellLines.categories[identity];
				return "rgb(" + colorVal.join(',') + ")";
			});

			return data;
		}

		var sendEvents = function(){
			self.trigger('g.datasetChanged->cellLineCanvas',self.prepareCellLineCanvasData());
			self.trigger('g.datasetChanged->cellLineLegend',prepareCellLineLegendData());
			self.trigger('g.datasetChanged->cellLineCanvasLegend',self.prepareCellLineCanvasLegendData());
			self.trigger('g.datasetChanged->cellLineCanvasClusteringLabel',self.currentDataset.cellLines.viewClusteringLabels[self.current.cellLineCanvasView])

			self.trigger('g.datasetChanged->drugCanvas',self.prepareDrugCanvasData());
			self.trigger('g.datasetChanged->drugCanvasLegend',self.prepareDrugCanvasLegendData());
			self.trigger('g.datasetChanged->drugCanvasClusteringLabel',self.currentDataset.drugs.viewClusteringLabels[self.current.drugCanvasView])


			self.trigger('g.datasetChanged->drugSelect',Object.keys(self.currentDataset.drugs.info).sort());
			self.trigger('g.datasetChanged->cellLineCategorySelect',Object.keys(self.currentDataset.cellLines.categories).sort());
		};


		if(this.datasets[datasetID]){
			this.currentDataset = this.datasets[datasetID];
			sendEvents();
		}else{
			d3.json('data/'+datasetID+'.json',function(data){
				self.datasets[datasetID] = data;
				self.currentDataset = self.datasets[datasetID];
				sendEvents();
			});
		}
	},

}

_.extend(g,Backbone.Events);


return g;

});
