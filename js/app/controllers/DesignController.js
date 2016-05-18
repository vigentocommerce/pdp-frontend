/*global define*/
'use strict';
define([
	'angular'
], function (angular) {
	return ['$scope', '$location', 'PdpServices',
		function ($scope, $location, PdpServices) {
			$scope.title = "Design Controller Here";
            console.info(PdpServices.getVersion());
		}
	];
});