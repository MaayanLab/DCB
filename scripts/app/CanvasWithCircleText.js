define(['underscore','backbone','d3', 'Canvas'],function(_, Backbone, d3, Canvas){


function CanvasWithCircleText(args){
	this.constructorSuper = Canvas;
	this.constructorSuper.call(this,args);
	this.circle_color = [255,255,255];
	this.textSize = "2px";
	this.highlightColor = args.highlightColor || "rgb(255, 0, 255)";
	this.initialize();
}

// tobe: extend by two categories of methods: canvasMethodsWithCircleTextNew and canvasMethodsWithCircleTextOverwrite.

var canvasMethodsWithCircleText = {

	showAssociatedTiles:function(identities){
		this.removeAssociated();
		this.showAssociatedTilesSilently(identities);
		
	},

	showAssociatedTilesSilently:function(identities){
		
		this.removeHighlight();
		this.associatedTiles = identities;
		
		var self = this;
		var inputData = [];

		_.each(identities,function(val,key){
			var target = _.find(self.data,function(f){
				return f.identity == key;
			});
			if(target){
				target.color = val;
				inputData.push(target);
			}
		});
		

		var getTileXY = this.getTileXYFactory();

		this.svgG.selectAll('circle').data(inputData).enter()
				 .append('circle')
				 .attr("r", 2 / 5 * getTileXY.scale(1))
				 .attr("cx", function(d,i){return getTileXY.x(d.idx)+getTileXY.scale(0.5);})
			     .attr("cy", function(d,i){return getTileXY.y(d.idx)+getTileXY.scale(0.5);})
			     .style('opacity',0)
			     .attr('name','associated')
			     .on('mouseover',function(d,i){
								self.trigger("tile.mouseover",{d:d,i:i});
				 })
				 .on('click',function(d,i){
								self.trigger('tile.click',{d:d,i:i});
				  })		
				 .transition()
				 .duration(500)
				 .style('fill',function(d,i){return d.color})
				 .style('opacity',1);

		this.svgG.selectAll('[name=associated]').each(function(d,i){
				d3.select(this).append('title').text(d.identity);
		});

	},

	showCategory:function(tilesBelongToACategory){
		this.tilesBelongToACategory = tilesBelongToACategory;
		this.svgG.selectAll('rect').filter(function(d){
			var belongToACategory = _.contains(tilesBelongToACategory,d.identity);
			if(belongToACategory) d3.select(this).transition().duration(300).style('opacity',1);
			return !belongToACategory;
		})
		.transition()
		.duration(300)
		.style('opacity',0);
	},

	removeCategory: function(){
		this.tilesBelongToACategory = null;
		this.svgG.selectAll('rect').transition().style('opacity',1);
	},


	removeHighlight:function(){
		
		this.svgG.selectAll("[name=highlightedCircle]")
				 .transition()
				 .duration(400)
				 .style('opacity',0)
				 .remove();
		this.highlightedCircle = null;
		
	},

	resetStates:function(){
		this.removeAssociatedSilently();
		this.removeHighlight();

		this.tilesBelongToACategory = null;
		this.highlightedCircle = null;
		this.associatedTiles = null;
	},

	reset:function(){
		this.removeAssociated();
		this.removeHighlight();
		this.resetZoom();
	},

	removeAssociatedSilently:function(){
		this.svgG.selectAll("[name=associated]")
				 // .transition()
				 // .duration(400)
				 // .style('opacity',0)
				 .remove();
	},

	removeAssociated:function(){
		this.removeAssociatedSilently();
		this.associatedTiles = null;
		this.trigger("associatedRemoved");
		
	},



	toggleText:function(toggleSetting){
	// toggleSetting is an array of two elements: color and opacity


		if(!toggleSetting){
			this.svgG.selectAll('[name=label]').transition().style('opacity',0).remove();
			
		}else{
			if(!this.toggleSetting){
				var self = this;
				var getTileXY = self.getTileXYFactory();
				this.svgG.selectAll('text').data(this.data).enter()
					.append('svg:text')
					.attr('name','label')
					.attr("x", function(d,i){return getTileXY.x(d.idx)+getTileXY.scale(0.5);})
					.attr("y", function(d,i){return getTileXY.y(d.idx)+getTileXY.scale(0.5) + 2})
					.attr("text-anchor", "middle")
					.attr("fill", toggleSetting[0])
					.text(function(d){return d.identity})
					.style('opacity',0)
					.style('font-size',this.textSize)
					.style("cursor", "pointer")
					.on('mouseover',function(d,i){
						self.trigger("tile.mouseover",{d:d,i:i});
					})
					.on('click',function(d,i){
						self.trigger('tile.click',{d:d,i:i});
					})
					.transition().duration(300)
					.style('opacity',1);

			}else{
				this.svgG.selectAll('text').style('fill',toggleSetting[0]);

			}
		}

		this.toggleSetting = toggleSetting;
	},
	initialize:function(){
		this.on('tile.click',function(eventData){
			this.highlight(eventData.d);
		});

		this.addViewName();
		this.highlightedCircle = null;
		this.associatedTiles = null;
	
	},

	selectTile:function(eventData){
		tilePointer = _.find(this.data,function(e){
				return e.identity == eventData;
			});
		this.trigger("tile.click",{d:tilePointer});
	},

	highlight:function(tilePointer){
		// tilePointer could be a string or a object
		this.removeHighlight();
	
		if(typeof(tilePointer)=="string"){
			tilePointer = _.find(this.data,function(e){
				return e.identity == tilePointer;
			});
		}


		var self = this;
		this.highlightedCircle = tilePointer;
		
		var getTileXY = self.getTileXYFactory();

		this.svgG.append('circle').datum(tilePointer)
				 .attr('name','highlightedCircle')
				 .attr("r", 2 / 5 * getTileXY.scale(1))
				 .attr("cx", function(d,i){return getTileXY.x(d.idx)+getTileXY.scale(0.5);})
			     .attr("cy", function(d,i){return getTileXY.y(d.idx)+getTileXY.scale(0.5);})
			     .style('opacity',0)
			     .on('mouseover',function(d,i){
					self.trigger("tile.mouseover",{d:d,i:i});
				  })		
				 .transition()
				 .duration(500)
				 .style('opacity',1)
				 .style('fill',this.highlightColor);

		this.svgG.select('[name=highlightedCircle]').append('title')
				.text(function(d,i){return d.identity});

	},

	addViewName:function(){
		//@tobe
		this.viewNameEl = this.svg.append('g')
				.attr('transform','translate('+this.size/2+','+this.size/2+')')
				.attr('fill','white')
				.attr('text-anchor','middle')
				.attr('font-size',18)
				.style('cursor','default')
				.style('opacity',0)
				.style('display','none');
	},

	showViewName:function(){
		var texts = this.viewName.split('\n');
		var binding = this.viewNameEl.selectAll('text').data(texts);
		var prelength = 0;
		binding.exit().remove();
		binding.enter().append('text');
		this.viewNameEl.selectAll('text')
					   .text(function(d){return d})
					   .attr('dy',function(d,i){return (i+0.2)+"em"});

		return this.viewNameEl
					   .style('display','inline')
					   .transition()
					   .duration(50)
					   .style('opacity',1);
	},

	removeViewName:function(){
		this.viewNameEl.transition().duration(100).delay(700)
					   .each("end",function(){
					   		d3.select(this).style('display','none');
					   })
					   .style('opacity',0);

	}
};

_.extend(canvasMethodsWithCircleText,Canvas.prototype);

canvasMethodsWithCircleText.super = Canvas.prototype;

//@overwite changeData
canvasMethodsWithCircleText.changeData = function(data){

	this.viewName = data.viewName;
	this.shiftScale = data.shiftScale;

	// record any modification that has been done to the canvas.
	var states = {};
	states.highlightedCircle = this.highlightedCircle;
	states.associatedTiles = this.associatedTiles;
	states.toggleSetting = this.toggleSetting;
	states.tilesBelongToACategory = this.tilesBelongToACategory;

	if(this.highlightedCircle)
		this.removeHighlight();
	if(this.associatedTiles)
		this.removeAssociatedSilently();
	if(this.toggleSetting)
		this.toggleText(null);
	if(this.tilesBelongToACategory)
		this.removeCategory();

	var self = this;
	this.super.changeData.call(this,data.input).transition().duration(0).each('end',function(){
		if(states.highlightedCircle)
			self.highlight(states.highlightedCircle.identity);
		if(states.associatedTiles){
			self.showAssociatedTilesSilently(states.associatedTiles);
		}
		if(states.toggleSetting){
			self.toggleText(states.toggleSetting);
		}
		if(states.tilesBelongToACategory){
			self.showCategory(states.tilesBelongToACategory);
		}
		
	
		self.showViewName().each("end",function(){
				self.removeViewName();
		});
	});

	
};



_.extend(CanvasWithCircleText.prototype,canvasMethodsWithCircleText);

return CanvasWithCircleText;

});



