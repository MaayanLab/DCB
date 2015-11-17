define(['underscore','backbone','d3'],function(_, Backbone, d3){


function Slider(args){
	this.el = d3.select('#'+args.ID);
	this.eventName = args.eventName;
	// // attrs: min, max, step, value, title
	// this.attrs = args.attrs;

}


var sliderMethods = {
	initialize: function(){
		var self = this;
		this.el.on("change",function(){
			var val = self.el.property("value");
			self.trigger(self.eventName,val)
		});
	}
}

_.extend(sliderMethods,Backbone.Events);
_.extend(Slider.prototype,sliderMethods);



function SliderWithIndicator(args){
	Slider.call(this,args);
	this.indicator = d3.select('#'+args.indicatorID);
	this.initialize();
}


var sliderMethodsWithIndicator = {}
_.extend(sliderMethodsWithIndicator,sliderMethods);

sliderMethodsWithIndicator.super = sliderMethods;

//@overwrite initialize;
sliderMethodsWithIndicator.initialize = function(){
	this.super.initialize.call(this);
	this.on(this.eventName,function(val){
		this.indicator.text(val);
	});

}

_.extend(SliderWithIndicator.prototype,sliderMethodsWithIndicator);

return SliderWithIndicator;

});