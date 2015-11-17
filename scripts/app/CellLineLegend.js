define(['underscore','backbone','d3'],function(_, Backbone, d3){

//{containerID:,width:,height:,}
function Legend(args){
	this.containerID = args.containerID;
	this.width = args.width;
	this.height = args.height;
	this.svg = d3.select('#'+this.containerID).append("svg")
							.attr("width", this.width)
							.attr("height", this.height)
							.style("cursor", "pointer");
}

legendMethods = {

	showAssociatedCategories:function(pvalues){
		var self = this;
		this.rects.each(function(d,idx){

			d3.select(this).transition().duration(300).attr("width", function(d,i){
					var val = (pvalues[i] > 1) ? 0 : 1 - pvalues[idx];
					return val * self.width;
				})
				.attr("opacity", 1);

		});

		this.svg.append("line")
				.attr("x1", 0.95 * self.width - 1)
				.attr("x2", 0.95 * self.width - 1)
				.attr("y1", 0)
				.attr("y2", this.height)
				.attr("stroke", "black")
				.attr("stroke-width", "1px")
				.append("title")
				.text("pvalue = 0.05");

	},

	removeAssociatedCategories:function(){
		var self = this;
		var rectCount = this.data.identities.length;
		this.rects.transition()
				  .duration(300)
				  .attr("width",this.width)
				  .each("end",function(d,i){
						if(i==rectCount-1){
							self.trigger('associatedCategoriesRemoved');
						}
				   });
		this.svg.select('line').remove();

	},


	highlight:function(rectIdentity){
		this.rects.filter(function(d){
				if(d!=rectIdentity)
					return true;
				else{
					d3.select(this).transition().delay(150).duration(300).style('opacity',1);
					return false;
				}
				   })
				  .transition()
				  .duration(300)
				  .style("opacity",0.25);
	},

	reset:function(){
		this.rects.transition().duration(150).style('opacity',1);
	},

	changeData:function(inputData){
		this.svg.selectAll('*').remove();
		this.data = inputData;
		this.scale = d3.scale.linear()
							.domain([0, this.data.identities.length])
							.range([0, this.height]);
		var self = this;
		this.svg.selectAll("rect").data(this.data.identities).enter().append("svg:rect")
					.attr("width", self.width)
					.attr("height", self.scale(1))
					.attr("fill", function(d, i){ return self.data.colors[i]})
					.attr("y", function(d, i){return self.scale(i)})
					.attr("x", 0)
					.on("click",function(d,i){
						self.trigger("category.click",d)
					})
					.append("title")
					.text("Double-click to filter by cancer type.");

		this.svg.selectAll("text").data(this.data.identities).enter().append("svg:text")
					.style("font-size", "10px")
					.text(function(d){return d})
					.attr("x", 4)
					.attr("y", function(d,i){return (self.scale(i + .5) + 3)})
					.on("click",function(d,i){
						self.trigger("category.click",d)
					})
					.style("cursor", "pointer")
					.append("title")
					.text("Click to filter by cancer type.");

		this.rects = this.svg.selectAll("rect");
	},
}


_.extend(legendMethods,Backbone.Events);
_.extend(Legend.prototype,legendMethods);

return Legend;

});