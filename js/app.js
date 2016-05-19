'use strict';
require([
	'angular'
], function (angular) {
	require([
		'js/app/controllers/DesignController',
		'js/app/PdpServices',
		'js/app/directives/PdpDirectives',
	], function (DesignController, PdpServices, PdpDirectives) {
		angular
			.module('pdpAngularApp', [PdpServices, PdpDirectives])
			.controller('DesignController', DesignController);
		//Start angular app
		angular.bootstrap(document, ['pdpAngularApp']);		
		//Start pdp app
		require(['pdp','customjQueryScript'], function(pdp, customScript) {
		    var pdpObj = pdp();
		    console.info(pdpObj);
		});	
		//Test fabric render
		require(['app/load-sample-canvas'], function() {
			
		})
	});	
});
