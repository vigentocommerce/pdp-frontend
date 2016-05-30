define([
	'angular'
], function (angular) {
    'use strict';
	return ['$scope', '$location', 'PdpServices','$timeout', '$compile',
		function ($scope, $location, PdpServices, $timeout, $compile) {
			$scope.currentProductId = 1;
			$scope.colorList = [];
			$scope.sideList = {};
			$scope.activeSideId = 0;
			$scope.activeColorId = 0;
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
								angular.forEach($scope.productConfig, function(colorSides, colorId) {
									//Get color of first side only
									for(var sideId in colorSides) {
										if(colorSides.hasOwnProperty(sideId)) {
											//console.info(colorSides[sideId]);
											$scope.colorList.push({
												color_code: colorSides[sideId].color_code,
												color_name: colorSides[sideId].color_name,
												color_id: colorId
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
							$scope.activeColorId = colorId;
							$scope.initCanvas();
							return false;
						}
					}
				} else {
					if($scope.productConfig[colorId]) {
						$scope.sideList = $scope.productConfig[colorId];
						$scope.activeColorId = colorId;
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
								if(!PdpServices.allCanvas[sideId]) {
									PdpServices.allCanvas[sideId] = new fabric.Canvas('canvas_side_' + sideId);
									PdpServices.allCanvas[sideId].allowTouchScrolling = true;
									PdpServices.allCanvas[sideId].setWidth(side.canvas_width);
									PdpServices.allCanvas[sideId].setHeight(side.canvas_height);
									PdpServices.allCanvas[sideId].canvas_id = sideId;	 
								}
								//Active first side of first color
								if(counter == 1) {
									if(!$scope.activeSideId) {
										$scope.activeSideId = sideId;	
									}
								}
								counter++;
							}
						});
						PdpServices.history.init($scope.getCurrentCanvas());
					}, 1000);
				}
			}
			$scope.getCurrentCanvas = function() {
				if($scope.activeSideId) {
					if(PdpServices.allCanvas[$scope.activeSideId]) {
						return PdpServices.allCanvas[$scope.activeSideId];
					}
				}
			}
			$scope.switchSide = function(sideId) {
				$scope.activeSideId = sideId;
				PdpServices.history.init($scope.getCurrentCanvas());	
			}
			$scope.addText = function() {
				PdpServices.pdpHelper.addText('Angular', '70', $scope.getCurrentCanvas());
			}
			$scope.addImage = function() {
				PdpServices.pdpHelper.addImage('images/demo1.svg', {}, null, $scope.getCurrentCanvas());
				PdpServices.pdpHelper.addImage('images/demo.svg', {}, null, $scope.getCurrentCanvas());
				PdpServices.pdpHelper.addImage('images/img1.png', {}, null, $scope.getCurrentCanvas());
				PdpServices.pdpHelper.addImage('images/img2.jpg', {}, null, $scope.getCurrentCanvas());
				
			}
			$scope.changeProductColor = function(colorId) {
				if(colorId == $scope.activeColorId) return false;
				$scope.setSideListByColorId(colorId);
			}
			$scope.zoomIn = function() {
				PdpServices.pdpZoom.zoomIn($scope.getCurrentCanvas());
			}
			$scope.zoomOut = function() {
				PdpServices.pdpZoom.zoomOut($scope.getCurrentCanvas());
			}
			$scope.resetZoom = function() {
				PdpServices.pdpZoom.resetZoom($scope.getCurrentCanvas());
				//Step 1: reset to 100%
				//PdpServices.pdpZoom.resetZoom();
				//Step 2: zoom out to original 100%
				//var _canvas = pdc.getCurrentCanvas(),
				//	_originalScale = _canvas.originalScale || 1;
				//pdc.pdcZoom.zoomOutTo(_canvas, _originalScale);
			}
		}
	];
});