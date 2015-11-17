define(['underscore','backbone','d3'],function(_, Backbone, d3){


//{width:,height:,containterID:,colors:,valueRange:,}

function ScaleBar(args){
	this.width = args.width;
	this.height = args.height;
	this.containerID = args.containerID;
	this.padding = 10;
	this.stageWidth = this.width+this.padding;
	this.svg = d3.select('#'+args.containerID).append('svg')
										   .attr('width',this.stageWidth)
										   .attr('height',this.height);
	
	this.colors = args.colors;
	this.fontSize = args.fontSize||18;
	this.valueRange = args.valueRange||[0,1];
	this.label = args.label;
	this.display = args.display;
	this.initialize();
}


var scaleBarMethods = {

	addLabel:function(){
		this.svg.append('text')
				.text(this.label)
				.attr('fill','white')
				.attr('text-anchor','middle')
				.attr('font-size',this.fontSize)
				.attr('x',this.stageWidth/2)
				.style('cursor','default')
				.attr('y',this.height-2)
				.style('opacity',0)
				.on('mouseover',function(){
					d3.select(this).transition().duration(200).style('opacity',1);
				}).on('mouseout',function(){
					d3.select(this).transition().duration(500).style('opacity',0);
				});
	},

	initialize:function(){
		this.gradientID = this.containerID+'Gradient';
		this.rect = this.svg.append('rect')
							.attr('width',this.width)
							.attr('height',this.height)
							.attr('transform','translate('+this.padding/2+',0)');
		this.gradient = this.svg.append('defs')
					.append('linearGradient')
					.attr('id',this.gradientID);
		if(this.colors)
			this.changeData(this.colors);
		if(this.valueRange)
			this.addLegend();
		if(this.label)
			this.addLabel();
		if(this.display)
			this.svg.style('display',this.display);
	},

	changeBar:function(colors){
		this.colors = colors;
		var colorCount = this.colors.length;
		var offsetScale = d3.scale.linear().domain([0,colorCount-1])
								 .range([0,100]);
		var binding = this.gradient.selectAll('stop').data(this.colors);
		binding.exit().remove();
		binding.enter().append('stop');
		this.gradient.selectAll('stop').attr('offset',function(d,i){return offsetScale(i)+'%'})
			.attr('stop-color',function(d,i){return d});
			
		this.rect.attr('fill','url(#'+this.gradientID+')');
	},

	addLegend:function(valueRange){
		if(this.svg.attr('height')==this.height){
			this.svg.attr('height',this.height+20);
		}
		this.valueRange = valueRange||this.valueRange;
		var axisXPadding = 4;
		this.scale = d3.scale.ordinal().domain(this.valueRange).range([0,this.width-axisXPadding]);
		this.axis = d3.svg.axis().scale(this.scale).orient("bottom").tickPadding([3]);
		var axisTy = this.height+3;
		this.axisG = this.svg.append('g').attr("transform","translate("+(axisXPadding/2+this.padding/2)+","+axisTy+")")
                        .attr("class","axis");
	    this.axisG.call(this.axis)
				  .selectAll('text')
				  .attr('style','font-size:8px')
				   .attr('text-anchor','middle');

	},

	changeAxis:function(valueRange){
		this.valueRange = valueRange;
		this.scale.domain(this.valueRange);
		this.axis.scale(this.scale);
		this.axisG.selectAll('*').remove();
		this.axisG.call(this.axis)
				   .selectAll('text')
				  .attr('style','font-size:8px')
				   .attr('text-anchor','middle');
	},

	changeData:function(eventData){
		// console.log(eventData);
		if(eventData.display){
			this.svg.style('display',eventData.display);
			if(eventData.display=='none')
				//end changeData function immediately
				return;
		}
		

		this.changeBar(eventData.colors);
		this.changeAxis(eventData.valueRange);
	},	
}


_.extend(scaleBarMethods,Backbone.Events);
_.extend(ScaleBar.prototype,scaleBarMethods);

return ScaleBar;

});