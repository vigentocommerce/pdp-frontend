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
			$scope.zoomList = [];
			$scope.showZoom = false;
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
									PdpServices.allCanvas[sideId].originalWidth = side.canvas_width;
									PdpServices.allCanvas[sideId].originalHeight = side.canvas_height;	 
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
						$scope.setZoomList($scope.getCurrentCanvas());
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
				$scope.setZoomList($scope.getCurrentCanvas());
				PdpServices.history.init($scope.getCurrentCanvas());	
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
			$scope.setZoomList = function(canvas) {
				$scope.zoomList = [];
				$scope.defaultZoomList = [
					{
						zoom: 1,
						title: '2X',
						spanClass: 'lnr lnr-plus-circle'
					},
					{
						zoom: 2,
						title: '3X',
						spanClass: 'lnr lnr-plus-circle'
					},
					{
						zoom: 3,
						title: '4X',
						spanClass: 'lnr lnr-plus-circle'
					}
				];
				$scope.zoomList.push({
					zoom: -1,
					title: '2X',
					spanClass: 'lnr lnr-circle-minus'
				});
				angular.forEach($scope.defaultZoomList, function(zoom, index) {
					var widthAfterScale = Math.pow(PdpServices.pdpZoom.SCALE_FACTOR, zoom.zoom) * canvas.originalWidth;
					if(widthAfterScale < PdpServices.pdpZoom.maxWidth) {
						$scope.zoomList.push(zoom);	
					}
				});
				$scope.zoomList.push({
					zoom: 0,
					title: 'Reset Zoom',
					spanClass: 'lnr lnr-sync'
				});
				$scope.showZoom = true;
				return $scope.zoomList;
			}
			$scope.zoomIn = function(zoomX) {
				if(zoomX !== 0) {
					$scope.beforeZoom($scope.getCurrentCanvas());	
				} else {
					$scope.resetZoom($scope.getCurrentCanvas());
				}
				PdpServices.pdpZoom.zoomIn($scope.getCurrentCanvas(), zoomX);
			}
			$scope.beforeZoom = function(canvas) {
				var previewBg = angular.element(document.querySelector('#background-preview-' + canvas.canvas_id)),
					wrapCanvas = angular.element(document.querySelector('#wrap-canvas-' + canvas.canvas_id)),
					canvasContainer = angular.element(document.querySelector('#wrap-canvas-' + canvas.canvas_id + ' .canvas-container'));
				previewBg.css('display', 'none');
				wrapCanvas.css('top', 0);
				wrapCanvas.css('left', 0);
				wrapCanvas.css('width', '100%');
				canvasContainer.css('margin', '0 auto');
			}
			$scope.resetZoom = function(canvas) {
				//Show background preview, re-position wrap canvas
				var previewBg = angular.element(document.querySelector('#background-preview-' + canvas.canvas_id)),
					wrapCanvas = angular.element(document.querySelector('#wrap-canvas-' + canvas.canvas_id)),
					canvasContainer = angular.element(document.querySelector('#wrap-canvas-' + canvas.canvas_id + ' .canvas-container'));
				previewBg.css('display', 'block');
				var activeSide = $scope.sideList[$scope.activeSideId];
				if(activeSide) {
					console.info(activeSide);
					wrapCanvas.css('top', activeSide.canvas_top + 'px');
					wrapCanvas.css('left', activeSide.canvas_left + 'px');
					wrapCanvas.css('width', '');
					canvasContainer.css('margin', '');
				}
			}
			$scope.getActiveObject = function() {
				if($scope.getCurrentCanvas() && $scope.getCurrentCanvas().getActiveObject()) {
					return $scope.getCurrentCanvas().getActiveObject();
				}
			}
		}
	];
});