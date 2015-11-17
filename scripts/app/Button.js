define(['underscore','backbone','d3'],function(_, Backbone, d3){


function Button(args){
	this.el = d3.select('#'+args.ID);
	this.eventName = args.eventName;
	this.data = args.data;
	this.initialize();
}	


var buttonMethods = {
	initialize:function(){
		var self = this;
		this.el.on('click',function(){self.trigger(self.eventName,self.data);});
		
	},

	programmaticalClick:function(){
		this.trigger(this.eventName,this.data);
	},

	disable:function(){
		this.el.property('disabled',true);
	},

	enable:function(){
		this.el.property('disabled',false);
	},
}


_.extend(buttonMethods,Backbone.Events);
_.extend(Button.prototype,buttonMethods);

return Button;

});