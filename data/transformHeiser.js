fs = require('fs');
us = require('underscore');

fs.readFile('heiser.js',function(err,data){
	content = data.toString();
	eval(content);

	dataModel = {};
	dataModel.survivalRate = [];
	us.each(drugsHarvard,function(val,key){
		us.each(val,function(e,i){
			var temp = {};
			temp.drug = key;
			temp.cellLine = e[0];
			temp.rate = e[1];
			dataModel.survivalRate.push(temp);
		});
	});

	dataModel.survivalRate = us.sortBy(dataModel.survivalRate,function(obj){
		return obj.rate;
	});



	dataModel.cellLines = {};
	dataModel.cellLines.info = {};
	us.each(cancer,function(val,key){
		us.each(val,function(e){
			dataModel.cellLines.info[e] = key;
		});
	});



	dataModel.cellLines.categories = {};
	var _cancerColors = [[129, 160, 103],[204, 55, 97],[208, 177, 120]];

	categories = Object.keys(cancer).sort();
	//mannually modificate the first name
	us.each(categories,function(e,i){
		dataModel.cellLines.categories[e] = _cancerColors[i];
	});


	dataModel.cellLines.categoryCanvas = {};
	dataModel.cellLines.categoryCanvas.input = canvas_data;

	dataModel.cellLines.viewNames = {categoryCanvas:"Category View",
								  sensitiveScoreCanvas:"Sensitive Score\nView",
								geneExpressionCanvas:"Gene Expression View",
								mutationCanvas:"Mutation Canvas"};

	dataModel.cellLines.viewClusteringLabels = {
							categoryCanvas:"tissue",
							sensitiveScoreCanvas:"sensitivity to drugs",
							geneExpressionCanvas:"gene expression profiles",
							mutationCanvas:"gene mutations"
						};


	



	dataModel.drugs = {};
	dataModel.drugs.info = {};
	dataModel.drugs.sensitiveScoreCanvas = {};
	dataModel.drugs.sensitiveScoreCanvas.input = drugCanvas;
	dataModel.drugs.sensitiveScoreCanvas.color = "rgb(45, 170, 179)";
	dataModel.drugs.sensitiveScoreCanvas.scaleExponent = 1;
	drugs = Object.keys(drugsHarvard);
	us.each(drugs,function(drug){
		dataModel.drugs.info[drug] = {};
	});


	dataModel.drugs.viewClusteringLabels = {
							sensitiveScoreCanvas:"efficacy to cell-lines",
							structureCanvas:"structure",
							targetCanvas:"target protein",
							perturbationCanvas:"LINCS gene expression profiles",
						};

	
	dataModel.drugs.viewNames = {sensitiveScoreCanvas:"Sensitive\nScore View",
								  structureCanvas:"Structure\nView", targetCanvas:"Target\nView",
								  perturbationCanvas:"Perturbation\nView"};

	fs.readFile('74subtype_drugs_flipped_significance_scores_matrix_add_missing.json',function(err,datax){
		dataModel.drugs.structureCanvas = {};
		dataModel.drugs.structureCanvas.input = JSON.parse(datax.toString());
		dataModel.drugs.structureCanvas.color = "rgb(246, 132, 35)";
		dataModel.drugs.structureCanvas.scaleExponent = 4;

		fs.readFile("heiser_data_no_cutoff.json",function(err,data){
			dataModel.cellLines.sensitiveScoreCanvas = {};
			dataModel.cellLines.sensitiveScoreCanvas.input = JSON.parse(data.toString());
			dataModel.cellLines.sensitiveScoreCanvas.color = "rgb(45, 170, 179)";
			dataModel.cellLines.sensitiveScoreCanvas.scaleExponent = 4;


			fs.readFile("../../drug_target_canvas/output_Heiser.json",function(err,data){
				dataModel.drugs.targetCanvas = {};
				dataModel.drugs.targetCanvas.input = JSON.parse(data.toString());
				dataModel.drugs.targetCanvas.color= "rgb(160, 103, 160)";
				dataModel.drugs.targetCanvas.scaleExponent = 0.5;


				fs.readFile("../../CellLineCanvases/heiser_canvas.json",function(err,data){
					dataModel.cellLines.geneExpressionCanvas = {};
					dataModel.cellLines.geneExpressionCanvas.input = JSON.parse(data.toString());
					dataModel.cellLines.geneExpressionCanvas.color = "rgb(246, 132, 35)";
					dataModel.cellLines.geneExpressionCanvas.scaleExponent = 1;

					fs.readFile("../../LincsDrugPertCanvases/heis_lincsdrugperts_MCF7_6hr_10uM_canvas.json",function(err,data){
						dataModel.drugs.perturbationCanvas = {};
						dataModel.drugs.perturbationCanvas.input = JSON.parse(data.toString());
						dataModel.drugs.perturbationCanvas.color= "rgb(226, 109, 140)";
						dataModel.drugs.perturbationCanvas.scaleExponent = 1;

						fs.readFile("mutHeiser_flipped_1000_significance_scores_matrix.json",function(err,data){
							dataModel.cellLines.mutationCanvas = {};
							dataModel.cellLines.mutationCanvas.input = JSON.parse(data.toString());
							dataModel.cellLines.mutationCanvas.color = "rgb(160, 103, 160)";
							dataModel.cellLines.mutationCanvas.scaleExponent = 1;

							fs.writeFile('heiser.json',JSON.stringify(dataModel));
						});
					});
				});

				
			});
		});
	});


			


	

});



