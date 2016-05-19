define([
	'angular'
], function (angular) {
    'use strict';
	return ['$scope', '$location', 'PdpServices',
		function ($scope, $location, PdpServices) {
			$scope.title = "Design Controller Here";
            console.info(PdpServices.getVersion());
		}
	];
});