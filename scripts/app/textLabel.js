define(['underscore','backbone','d3'],function(_, Backbone, d3){


var textLabelToggle = {
	el:d3.select("#textToggle"),
	initialize:function(){
		var settings = [["rgb(255,255,255)", 1], ["rgb(0,0,0)", 1],
							null];
		var self = this;
		this.el.on("change",function(){
			var sI = self.el.property("selectedIndex");
			console.log('trigger');
			self.trigger("textLabelToggled",settings[sI]);
		});
	},
};
_.extend(textLabelToggle,Backbone.Events);
textLabelToggle.initialize();

return textLabelToggle;

});