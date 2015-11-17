define(['underscore','backbone','d3'],function(_, Backbone, d3){


function DynamicTextDisplay(args){

	this.el = d3.select('#'+args.ID);
}

var dynamicTextDisplayMethods = {
	changeText:function(eventData){
		if(eventData!=this.el.text()){
			this.el.transition().duration(500).style('opacity',0).each('end',function(){
				d3.select(this).text(eventData).transition().delay(1500).duration(200).style('opacity',1);
			});
		}
	},
}


_.extend(dynamicTextDisplayMethods,Backbone.Events);
_.extend(DynamicTextDisplay.prototype,dynamicTextDisplayMethods);

return DynamicTextDisplay;

});