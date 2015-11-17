({
    baseUrl: "./app",
    paths: {
        underscore: "../lib/underscore-min",
		backbone: "../lib/backbone-min",
		d3: "../lib/d3.min",
		jquery: "../lib/jquery-1.8.2.min",
		requireLib:"../require",
    },
    shim:{

	'backbone':{
		deps:['underscore','jquery'],
		exports: 'Backbone'
	},

	'underscore':{
		exports:'_'
	},

	'jquery':{
		exports:'$'
	},

	'd3':{
		exports:'d3'
	},
},
	include:"requireLib",
    name: "../main",
    out: "main-built.js"
})