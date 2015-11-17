fs = require('fs');
us = require('underscore');

fs.readFile('ccle.js',function(err,data){
	content = data.toString();
	eval(content);

	var cleanCellNames = function(cellName){
		// capital and remove any \W letter
		if(typeof(cellName)=='string'){
			return cellName.replace(/\W/g,'').toUpperCase();
		}else{
			// if array
			return us.map(cellName,function(name){
				return name.replace(/\W/g,'').toUpperCase();
			});
		}
	}

	dataModel = {};
	dataModel.survivalRate = [];
	us.each(drugsHarvard,function(val,key){
		us.each(val,function(e,i){
			var temp = {};
			temp.drug = key;
			temp.cellLine = cleanCellNames(e[0]);
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
			dataModel.cellLines.info[cleanCellNames(e)] = key;
		});
	});



	dataModel.cellLines.categories = {};
	var _cancerColors = [[220, 136, 136], [208, 177, 120], [204,55,97],
									[219,129,57], [0, 160, 160], [103, 103, 160], [129, 160, 103], [0, 160, 160],
									[204,55,97], [103, 160, 103], [160, 103, 160], [0, 160, 160],
									[219,129,57], [129, 160, 103], [160, 103, 129], [160, 27, 129],
									[129, 160, 27], [160, 103, 160], [204,55,97], [204, 55, 97],
									[160, 160, 27], [219, 129, 57], [220, 136, 136]];
	categories = Object.keys(cancer).sort();
	us.each(categories,function(e,i){
		dataModel.cellLines.categories[e] = _cancerColors[i];
	});


	dataModel.cellLines.categoryCanvas = {};
	dataModel.cellLines.categoryCanvas.input = canvas_data;
	dataModel.cellLines.categoryCanvas.input.texts = cleanCellNames(dataModel.cellLines.categoryCanvas.input.texts);

	dataModel.cellLines.viewNames = {categoryCanvas:"Category View",
								  sensitiveScoreCanvas:"Sensitive Score\nView",
								  geneExpressionCanvas:"Gene Expression View",
								  mutationCanvas:"Mutation View"};


	dataModel.drugs = {};
	dataModel.drugs.info = {};
	dataModel.drugs.sensitiveScoreCanvas = {};
	dataModel.drugs.sensitiveScoreCanvas.input = drugCanvas;

	dataModel.drugs.sensitiveScoreCanvas.color = "rgb(45, 170, 179)";
	dataModel.drugs.sensitiveScoreCanvas.scaleExponent = 7;
	drugs = Object.keys(drugsHarvard);
	us.each(drugs,function(drug){
		dataModel.drugs.info[drug] = {};
	});


	dataModel.cellLines.viewClusteringLabels = {
							categoryCanvas:"tissue",
							sensitiveScoreCanvas:"sensitivity to drugs",
							geneExpressionCanvas:"gene expression profiles",
							mutationCanvas:"gene mutations"
						};
						
	dataModel.drugs.viewClusteringLabels = {
							sensitiveScoreCanvas:"efficacy to cell-lines",
							structureCanvas:"structure",
							targetCanvas:"target protein",
							perturbationCanvas:"LINCS gene expression profiles",
						};

	
	dataModel.drugs.viewNames = {sensitiveScoreCanvas:"Sensitive\nScore View",
								  structureCanvas:"Structure\nView", targetCanvas:"Target\nView",
								  perturbationCanvas:"Perturbation\nView"};

	fs.readFile('24CCLE_drugs_flipped_significance_scores_matrix.json',function(err,datax){
		dataModel.drugs.structureCanvas = {};
		dataModel.drugs.structureCanvas.input = JSON.parse(datax.toString());
		dataModel.drugs.structureCanvas.color = "rgb(246, 132, 35)";
		dataModel.drugs.structureCanvas.scaleExponent = 4;

		fs.readFile("ccle_cellLine_sensitive_score_LOG_similarity_mat.json",function(err,data){
			dataModel.cellLines.sensitiveScoreCanvas = {};
			dataModel.cellLines.sensitiveScoreCanvas.input = JSON.parse(data.toString());
			dataModel.cellLines.sensitiveScoreCanvas.input.texts = cleanCellNames(dataModel.cellLines.sensitiveScoreCanvas.input.texts);
			dataModel.cellLines.sensitiveScoreCanvas.color = "rgb(45, 170, 179)";
			dataModel.cellLines.sensitiveScoreCanvas.scaleExponent = 4;


			fs.readFile("../../drug_target_canvas/output_CCLE.json",function(err,data){
				dataModel.drugs.targetCanvas = {};
				dataModel.drugs.targetCanvas.input = JSON.parse(data.toString());
				dataModel.drugs.targetCanvas.color= "rgb(160, 103, 160)";
				dataModel.drugs.targetCanvas.scaleExponent = 1;

				fs.readFile("../../CellLineCanvases/barretina_ccle_canvas.json",function(err,data){
					dataModel.cellLines.geneExpressionCanvas = {};
					dataModel.cellLines.geneExpressionCanvas.input = JSON.parse(data.toString());
					dataModel.cellLines.geneExpressionCanvas.input.texts = cleanCellNames(dataModel.cellLines.geneExpressionCanvas.input.texts);
					dataModel.cellLines.geneExpressionCanvas.color = "rgb(246, 132, 35)";
					dataModel.cellLines.geneExpressionCanvas.scaleExponent = 1;

					fs.readFile('mutsCCLE_flipped_1000_significance_scores_matrix.json',function(err,data){
						dataModel.cellLines.mutationCanvas = {};
						dataModel.cellLines.mutationCanvas.input = JSON.parse(data.toString());
						dataModel.cellLines.mutationCanvas.color = "rgb(160, 103, 160)";
						dataModel.cellLines.mutationCanvas.scaleExponent = 5;

						fs.readFile('../../LincsDrugPertCanvases/ccle_lincsdrugperts_MCF7_6hr_10uM_canvas.json',function(err,data){
							dataModel.drugs.perturbationCanvas = {};
							dataModel.drugs.perturbationCanvas.input = JSON.parse(data.toString());
							dataModel.drugs.perturbationCanvas.color = "rgb(226, 109, 140)";
							dataModel.drugs.perturbationCanvas.scaleExponent = 1;

							fs.writeFile('ccle.json',JSON.stringify(dataModel));
						});
					});

					
				});

				
			});
		});
	});


			


	

});



