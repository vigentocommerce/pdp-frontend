'use strict';
require([
	'angular'
], function (angular) {
	require([
		'js/app/controllers/DesignController',
		'js/app/controllers/HiddenPopupController',
		'js/app/controllers/ToolboxController',
		'js/app/controllers/TextController',
		'js/app/PdpServices',
		'js/app/directives/PdpDirectives',
	], function (DesignController, HiddenPopupController, ToolboxController, TextController, PdpServices, PdpDirectives) {
		angular
			.module('pdpAngularApp', [PdpServices, PdpDirectives])
			.controller('HiddenPopupController', HiddenPopupController)
			.controller('ToolboxController', ToolboxController)
			.controller('TextController', TextController)
			.controller('DesignController', DesignController);
		//Start angular app
		angular.bootstrap(document, ['pdpAngularApp']);		
		//Start pdp app
		require(['customjQueryScript', 'action'], function(customScript, action) {
		    //Call theme action
		});	
	});	
});
