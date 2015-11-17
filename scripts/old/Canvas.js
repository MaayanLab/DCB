function Canvas(args){
	this.size = args.stageSize;
	this.svg = d3.select('#'+args.containerID).append('svg')
										   .attr('width',this.size)
										   .attr('height',this.size);
	this.name = args.name;

	// start of adding zoom functionality
	var _zoomLayer = this.svg.attr("pointer-events", "all")
					.append('svg:g')
					.call(d3.behavior.zoom().on("zoom", _redraw))

	_zoomLayer.append("rect")
				.attr("width", this.size)
				.attr("height",this.size)
				.attr("fill", "black");

	var self = this;
	function _redraw(){
		// Allows panning and zooming of the canvas.
		if (d3.event.scale <= 1){
			d3.event.scale = 1;
			d3.event.translate = [0,0];
			_zoomLayer.call(d3.behavior.zoom().on("zoom", null))
						.call(d3.behavior.zoom().on("zoom", _redraw));


		}

		self.svgG.attr("transform", "translate(" + d3.event.translate + ")"
		  	+ " scale(" + d3.event.scale + ")");
	}

    self.svgG = _zoomLayer.append('svg:g'); 
	// end of adding zoom functionality

}



	var canvasMethods = {
		fill: function(colors){
			var self = this;
			this.tiles.style('fill',function(d,i){
				return colors?colors[i]:self.data.colors[i];
			});
		},

		tileCountEachRow: function(){return Math.sqrt(this.data.identities.length)},

		tileWidthScale: function(){ return d3.scale.linear()
										.domain([0,this.tileCountEachRow()])
											.range([0,this.size])},

		changeData: function(inputData){
			var self = this;
			this.svgG.selectAll('*').remove();
			this.data = inputData;
			var scale = this.tileWidthScale();
			var tilesPerRow = this.tileCountEachRow();
			this.svgG.selectAll('rect').data(this.data.identities).enter()
							.append('rect')
							.attr("x", function(d,i){return scale(i%tilesPerRow)})
							.attr("y", function(d,i){return scale(Math.floor(i/tilesPerRow))})
							.attr("width",scale(1))
							.attr("height",scale(1))
							.on('mouseover',function(d,i){
								self.trigger("tile.mouseover",{d:d,i:i});
							})
							.on('click',function(d,i){
								self.trigger('tile.click',{d:d,i:i});
							})
							.style("cursor","pointer")
							.append("title")
							.text(function(d){return d});
			this.tiles = this.svgG.selectAll('rect');
			this.svgG.on('mouseout',function(){
				self.trigger('canvas.mouseout');
			});
			this.fill();
		},
	}



_.extend(canvasMethods,Backbone.Events);
_.extend(Canvas.prototype,canvasMethods);





