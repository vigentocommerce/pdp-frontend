define([
	'angular',
	'pdp'
], function (angular, pdp) {
    'use strict';
	return ['$scope', '$location', 'PdpServices',
		function ($scope, $location, PdpServices) {
			$scope.currentProductId = 1;
			if(!$scope.productConfig) {
				$scope.productConfig = {};
				PdpServices.getProductConfig($scope.currentProductId)
				.then(function(response) {
					try {
						if(response.status === "error") {
							alert(response.message);
							return false;
						}
						if(response.status === "success" && response.data) {
							//console.info(response.data);
							if(response.data.colors) {
								for(var i in response.data.colors) {
									if(response.data.colors.hasOwnProperty(i)) {
										var pdpObj = pdp();
										pdpObj.setSidesConfig(response.data.colors[i]);
										pdpObj.prepareCanvas(response.data.colors[i]);		
										break;
									}
								}
							}
						}
					} catch(error) {
						console.warn(error);
					}
				},
				function(error) {
					
				});
			}
			
		}
	];
});