define(['underscore','backbone','d3'],function(_, Backbone, d3){


function Select(args){
	this.el = d3.select('#'+args.ID);
	this.eventName = args.eventName;
	// undefined if void.
	this.noneOption = args.noneOption;
	this.initialize();
}

var selectMethods = {
	populate:function(data){
		var inputData;
		if(typeof(data[0])=='string'){
			var arr = this.noneOption?[this.noneOption].concat(data):data;
			inputData = _.map(arr,function(e){
				var obj = {};
				obj.text = e;
				obj.value = e;
				return obj;
			});
		}else{
			var self = this;
			inputData = this.noneOption?[{text:self.noneOption,value:self.noneOption}].concat(data):data;
		}
		var options = this.el.selectAll("option").data(inputData);
		options.exit().remove();
		options.enter().append("option");
		this.el.selectAll("option")
			   .text(function(d,i){return(d.text)})
			   .attr("value", function(d){ return d.value});
		//display the first element.
		this.el.select('option').property('selected',true);
	},

	setOption:function(option){
		this.el.selectAll('option').filter(function(d){return d.value==option})
								   .property('selected',true);
		this.onChange();
	},

	setOptionSilently:function(option){
		this.el.selectAll('option').filter(function(d){return d.value==option})
								   .property('selected',true);
	},

	setToNoneOptionSilently:function(){
		this.setOptionSilently(this.noneOption);
	},

	setToNoneOption:function(){
		this.setOption(this.noneOption);
	},

	initialize:function(){
		var self = this;
		_.bind(this.onChange,this);
		this.el.on("change",function(){
			self.onChange.apply(self);
		});
	},

	onChange:function(){
		var val = this.el.selectAll('option')
				.filter(function(){return d3.select(this).property("selected")})
				.property('value');
			if(this.noneOption&&(val==this.noneOption))
				this.trigger("noneOptionSelected");
			else
				this.trigger(this.eventName,val);
	}
}

_.extend(selectMethods,Backbone.Events);
_.extend(Select.prototype,selectMethods);


return Select;
});
