define([
	'angular'
], function (angular) {
    'use strict';
	return ['$scope', '$location', 'PdpServices','$timeout',
		function ($scope, $location, PdpServices, $timeout) {
			$scope.currentProductId = 1;
			$scope.colorList = [];
			$scope.sideList = {};
			$scope.activeSideId = 0;
			if(!$scope.productConfig) {
				//$scope.productConfig = {};
				PdpServices.getProductConfig($scope.currentProductId)
				.then(function(response) {
					try {
						if(response.status === "error") {
							alert(response.message);
							return false;
						}
						if(response.status === "success" && response.data) {
							if(response.data.colors) {
								$scope.productConfig = response.data.colors;
								//Setup color list
								angular.forEach($scope.productConfig, function(colorSides, index) {
									//Get color of first side only
									for(var sideId in colorSides) {
										if(colorSides.hasOwnProperty(sideId)) {
											//console.info(colorSides[sideId]);
											$scope.colorList.push({
												color_code: colorSides[sideId].color_code,
												color_name: colorSides[sideId].color_name
											});
											return false;
										}
									}
								});
								//init first color - sides after page load
								$scope.setSideListByColorId();
							}
						}
					} catch(error) {
						console.warn(error);
					}
				},
				function(error) {
					
				});
			}
			$scope.setSideListByColorId = function(colorId) {
				if(!$scope.productConfig) return false;
				if(!colorId) {
					//Get first color
					for(var colorId in $scope.productConfig) {
						if($scope.productConfig.hasOwnProperty(colorId)) {
							$scope.sideList = $scope.productConfig[colorId];
							$scope.initCanvas();
							return false;
						}
					}
				} else {
					if($scope.productConfig[colorId]) {
						$scope.sideList = $scope.productConfig[colorId];
						$scope.initCanvas();
					}
				}
			}
			$scope.initCanvas = function() {
				if($scope.sideList) {
					//Check angular element
					$timeout(function() {
						var counter = 1;
						angular.forEach($scope.sideList, function(side, sideId) {
							if(angular.element(document.querySelector("#canvas_side_" + sideId)).length) {
								PdpServices.allCanvas[sideId] = new fabric.Canvas('canvas_side_' + sideId);
								PdpServices.allCanvas[sideId].allowTouchScrolling = true;
								//Active first side of first color
								if(counter == 1) {
									$scope.activeSideId = sideId;
								}
								counter++;
							}
						});
					}, 1000);
				}
			}
			$scope.switchSide = function(sideId) {
				$scope.activeSideId = sideId;	
			}
			$scope.addText = function() {
				PdpServices.addText('Angular', '70', PdpServices.allCanvas[$scope.activeSideId]);
			}
		}
	];
});