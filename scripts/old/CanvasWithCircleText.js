
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
		this.circles.each(function(d,i){
			var color = identities[d];
			var el = d3.select(this);
			if(color){
				el.style('fill',color).style('opacity',1);
			}else{
				el.style('fill',this.circle_color).style('opacity',0);
			}
		});

	},

	showCategory:function(tilesBelongToACategory){
		this.tilesBelongToACategory = tilesBelongToACategory;
		this.tiles.filter(function(d){
			var belongToACategory = _.contains(tilesBelongToACategory,d);
			if(belongToACategory) d3.select(this).style('opacity',1);
			return !belongToACategory;
		})
		.style('opacity',0);
	},

	removeCategory: function(){
		this.tilesBelongToACategory = null;
		this.tiles.style('opacity',1);
	},


	removeHighlight:function(){
		
		this.svgG.selectAll("[name=highlightedCircle]")
				 .attr('name','')
				 .transition()
				 .duration(400)
				 .style('opacity',0)
				 .style('fill',this.circle_color);
		this.highlightedCircle = null;
		
	},

	resetStates:function(){
		this.tilesBelongToACategory = null;
		this.highlightedCircle = null;
		this.associatedTiles = null;
	},

	reset:function(){
		this.removeAssociated();
		this.removeHighlight();
	},

	removeAssociated:function(){
		this.circles.filter(function(){return d3.select(this).attr('name')!='highlightedCircle'})
					.style('opacity',0);
		this.associatedTiles = null;
		this.trigger("associatedRemoved");
		
	},



	toggleText:function(toggleSetting){
	// toggleSetting is an array of two elements: color and opacity
		console.log('here',toggleSetting);
		this.texts.attr("fill",toggleSetting[0])
			 	.attr("opacity",toggleSetting[1]);
	},
	initialize:function(){
		this.on('tile.click',function(eventData){
			this.highlight(eventData.i||eventData.d);
		});

		this.addViewName();
		this.highlightedCircle = null;
		this.associatedTiles = null;
	
	},

	selectTile:function(eventData){
		this.trigger("tile.click",{d:eventData});
	},

	highlight:function(tilePointer){
		this.highlightedCircle = tilePointer;

		// tilePointer could either be identity(d) or index(i)

		// reset previous highlighted tile if any.
		this.svgG.select("[name=highlightedCircle]")
				 .attr('name','')
				 .transition()
				 .duration(400)
				 .style('opacity',0)
				 .style('fill',this.circle_color);

		this.circles.filter(function(d,i){
						if(typeof(tilePointer)=='number')
							return i==tilePointer;
						else
							return d==tilePointer;
					})
					.attr('name','highlightedCircle')
					.transition()
					.duration(500)
					.style('opacity',1)
					.style('fill',this.highlightColor);
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
					   .duration(100)
					   .style('opacity',1);
	},

	removeViewName:function(){
		this.viewNameEl.transition().duration(200).delay(700)
					   .each("end",function(){
					   		d3.select(this).style('display','none');
					   })
					   .style('opacity',0);

	}
};

_.extend(canvasMethodsWithCircleText,canvasMethods);

canvasMethodsWithCircleText.super = canvasMethods;

//@overwite changeData
canvasMethodsWithCircleText.changeData = function(data){
	this.viewName = data.viewName;

	this.viewName = data.viewName;

	this.super.changeData.call(this,data);

	var scale = this.tileWidthScale();
	var tilesPerRow = this.tileCountEachRow();
	var self = this;
	

	this.svgG.selectAll("circle").data(this.data.identities)
			.enter().append("svg:circle")
			.attr("r", 2 / 5 * scale(1))
			.attr("cx", function(d,i){return scale(i%tilesPerRow + 0.5)})
			.attr("cy", function(d,i){return scale(Math.floor(i/tilesPerRow) + 0.5)})			
			.attr("fill", this.circle_color)
			.attr("opacity", 0)
			.on('mouseover',function(d,i){
				self.trigger("tile.mouseover",{d:self.data.identities[i],i:i});
			})
			.on('click',function(d,i){
				self.trigger('tile.click',{d:self.data.identities[i],i:i});
			})
			.style("cursor", "pointer")
			.append("title")
			.text(function(d){return d});
		

    this.svgG.selectAll("text").data(this.data.identities)
			.enter().append("svg:text")
			.attr("class", "texts")
			.attr("x", function(d,i){return scale(i%tilesPerRow + 0.5)})
			.attr("y", function(d,i){return scale(Math.floor(i/tilesPerRow) + 0.5) + 2})
			.attr("text-anchor", "middle")
			.attr("fill", "rgb(255,255,255)")
			.attr("opacity",0)
			.style("font-size", this.textSize)
			.on('mouseover',function(d,i){
				self.trigger("tile.mouseover",{d:self.data.identities[i],i:i});
			})
			.on('click',function(d,i){
				self.trigger('tile.click',{d:self.data.identities[i],i:i});
			})
			.style("cursor", "pointer")
			.style("font-family", "Arial")
			.text(function(d){return d;})
			.append("title")
			.text(function(d){return d;});

	this.circles = this.svgG.selectAll("circle"),
	this.texts = this.svgG.selectAll("text");

	var self = this;
	this.showViewName().each("end",function(){
		self.removeViewName();
	});


	if(this.highlightedCircle)
		this.highlight(this.highlightedCircle);
	if(this.associatedTiles)
		this.showAssociatedTilesSilently(this.associatedTiles);
	if(this.tilesBelongToACategory)
		this.showCategory(this.tilesBelongToACategory);

};


canvasMethodsWithCircleText.toggleText = function(toggleSetting){
	// toggleSetting is an array of two elements: color and opacity
	console.log('here',toggleSetting);
	this.texts.attr("fill",toggleSetting[0])
			 .attr("opacity",toggleSetting[1]);
	this.initialize();
};


_.extend(CanvasWithCircleText.prototype,canvasMethodsWithCircleText);



