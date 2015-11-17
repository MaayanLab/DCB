define(['underscore','backbone','d3'],function(_, Backbone, d3){


function Canvas(args){
	this.size = args.stageSize;
	this.svg = d3.select('#'+args.containerID).append('svg')
										   .attr('width',this.size)
										   .attr('height',this.size);
	this.name = args.name;

	this.shiftX = this.properShift(args.shiftX||0);
	this.shiftY = this.properShift(args.shiftY||0);
	this.shiftScale = args.shiftScale||10;

	// start of adding zoom functionality
	this.zoomScale = 1;
	var zoom = d3.behavior.zoom().on("zoom", _redraw);
	var _zoomLayer = this.svg.attr("pointer-events", "all")
					.append('svg:g')
					.call(zoom)

	_zoomLayer.append("rect")
				.attr("width", this.size)
				.attr("height",this.size)
				.attr("fill", "black");

	var self = this;
	function _redraw(){
		// Allows panning and zooming of the canvas.
		if (d3.event.scale <= 1){
			d3.event.scale = 1;
			self.zoomScale = 1;
			d3.event.translate = [0,0];
			_zoomLayer.call(d3.behavior.zoom().on("zoom", null))
						.call(d3.behavior.zoom().on("zoom", _redraw));


		}
		self.zoomScale = d3.event.scale;
		self.svgG.attr("transform", "translate(" + d3.event.translate + ")"
		  	+ " scale(" + d3.event.scale + ")");
	}

    self.svgG = _zoomLayer.append('svg:g'); 
	// end of adding zoom functionality

	this.resetZoom = function(){
		zoom.scale(1).translate([0,0]);
		zoom.event(_zoomLayer);
	}



	//add drag to shift view functionality when zoomScale==1
	var drag = d3.behavior.drag().on("drag",shiftView);
	this.svgG.call(drag);

	function shiftView(){
		if(self.zoomScale==1){
			deltaX = Math.round(d3.event.dx/self.shiftScale);
			deltaY = Math.round(d3.event.dy/self.shiftScale);
			self.shiftX = self.properShift(self.shiftX+deltaX);
			self.shiftY = self.properShift(self.shiftY+deltaY);

			var getTileXY = self.getTileXYFactory();
			self.svgG.selectAll('rect')
			.attr("x", function(d,i){
							return getTileXY.x(d.idx);
						})
					.attr("y", function(d,i){
							return getTileXY.y(d.idx);
						});

			self.svgG.selectAll('circle')
			 .attr("cx", function(d,i){return getTileXY.x(d.idx)+getTileXY.scale(0.5);})
			     .attr("cy", function(d,i){return getTileXY.y(d.idx)+getTileXY.scale(0.5);});
		}
	}

}



	var canvasMethods = {

		tileCountEachRow: function(){return Math.sqrt(this.data.length)},

		tileWidthScale: function(){ return d3.scale.linear()
										.domain([0,this.tileCountEachRow()])
											.range([0,this.size])},

		initializeData:function(inputData){
			this.svgG.on('mouseout',function(){
				self.trigger('canvas.mouseout');
			});
			var self = this;
			this.data = inputData;
			var getTileXY = self.getTileXYFactory();

			this.svgG.selectAll('rect').data(inputData)
					.enter().append('rect')
					.attr("x", function(d,i){
						return getTileXY.x(d.idx);
					})
					.attr("y", function(d,i){
						return getTileXY.y(d.idx);
					})
					.style('fill',function(d,i){
						return d.color;
					})
					.attr("width",getTileXY.scale(1))
					.attr("height",getTileXY.scale(1))
					.on('mouseover',function(d,i){
								self.trigger("tile.mouseover",{d:d,i:i});
						})
					.on('click',function(d,i){
								self.trigger('tile.click',{d:d,i:i});
					})
					.append("title")
					.text(function(d){return d.identity;});
		},

		changeData:function(inputData){
			if(!this.data){
				this.initializeData(inputData);
				return this.svgG;
			}


			var self = this;
			this.data = inputData;
			var getTileXY = this.getTileXYFactory();

			var join = this.svgG.selectAll('rect').data(inputData,function(d){return d.joinID});
			join.exit().remove();
			join.enter().append('rect').attr('width',getTileXY.scale(1))
										.attr('height',getTileXY.scale(1))
										.style('opacity',0);

				join.on('mouseover',function(d,i){
								self.trigger("tile.mouseover",{d:d,i:i});
						})
					.on('click',function(d,i){
								self.trigger('tile.click',{d:d,i:i});
					})
					.each(function(d,i){
						var tile = d3.select(this);
						if(tile.select('title')[0][0]){
							tile.select('title').text(d.identity);
						}else{
							tile.append('title').text(d.identity);
						}
					});
			// var t = this.svgG.transition().duration(3000);

			return this.svgG.transition().duration(2000).each(function(){
			   	self.svgG.transition().selectAll('rect')
					.attr("x", function(d,i){
							return getTileXY.x(d.idx);
						})
					.attr("y", function(d,i){
							return getTileXY.y(d.idx);
						})
					.style('fill',function(d,i){
						return d.color;
					})
					.attr('width',getTileXY.scale(1))
					.attr('height',getTileXY.scale(1))
					.style('opacity',1);

			});

			
		},

		getTileXYFactory:function(){
			var scale = this.tileWidthScale();
			var tilesPerRow = this.tileCountEachRow();
			var getTile = {};
			var self = this;
			
			getTile.x = function(idx){return scale((idx+self.shiftX)%tilesPerRow);}
			getTile.y = function(idx){return scale((Math.floor(idx/tilesPerRow)+self.shiftY)%tilesPerRow);}
			getTile.scale = scale;

			return getTile;
		},

		properShift:function(shift){
			return shift>=0?shift:this.tileCountEachRow()+shift
		},

		// setShiftScale:function(){
		// 	this.shiftScale = this.size/this.tileCountEachRow()-3.5;
		// }

	}




_.extend(canvasMethods,Backbone.Events);
_.extend(Canvas.prototype,canvasMethods);


return Canvas;

});


