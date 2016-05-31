define([
	'angular'
], function (angular) {
    'use strict';
	return ['$scope', '$location', 'PdpServices', '$timeout',
		function ($scope, $location, PdpServices, $timeout) {
			//Text attribute
			$scope.text = {
				currentText: '',
				addTextBtnLabel: 'Add Text',
				fontFamily: 'Arial',
				fontSize: 25,
				fontWeight: 'normal',
				fontStyle: 'normal',
				textAlign: '',//Possible values: "left", "center", "right" or "justify".
				textDecoration: '',// values: "", "underline", "overline" or "line-through"
				lineHeight: 1.0,
				stroke: '#e06666',
				strokeWidth: 0,
				showUpdateButton: false,
				updateTextBtnLabel: 'Update Text',
				fill: '#000'
			};
			$scope.text.colorList = [
				{
					'color_name': '',
					'color_code': '#000000'
				},
				{
					'color_name': '',
					'color_code': '#ff9900'
				},
				{
					'color_name': '',
					'color_code': '#d5a6bd'
				},
				{
					'color_name': '',
					'color_code': '#4c1130'
				},
				{
					'color_name': '',
					'color_code': '#f6b26b'
				},
				{
					'color_name': '',
					'color_code': '#ffd966'
				},
				{
					'color_name': '',
					'color_code': '#93c47d'
				},
				{
					'color_name': '',
					'color_code': '#3d85c6'
				},
				{
					'color_name': '',
					'color_code': '#134f5c'
				},
				{
					'color_name': '',
					'color_code': '#9fc5e8'
				},
				{
					'color_name': '',
					'color_code': '#073763'
				},
				{
					'color_name': '',
					'color_code': '#cc0000'
				},
			];
			$scope.text.init = function() {
				if($scope.text.colorList) {
					for(var i = 0; i < $scope.text.colorList.length; i++) {
						if(i === 0) {
							$scope.text.fill = $scope.text.colorList[i].color_code;
						}
						if(i === 1) {
							$scope.text.stroke = $scope.text.colorList[i].color_code;
							break;
						}
					}
				}
			}
			$scope.text.init();	
			$scope.text.fontList = [
				{
					'fontFamily': 'Arial',
					'displayText': 'Arial'
				},
				{
					'fontFamily': 'Trebuchet MS',
					'displayText': 'Trebuchet MS'
				},
				{
					'fontFamily': 'Verdana',
					'displayText': 'Verdana'
				},
				{
					'fontFamily': 'Times New Roman',
					'displayText': 'Times New Roman'
				}
			];
			$scope.$watch('text.fontSize', function() {
				$scope.text.fontSize = parseFloat($scope.text.fontSize);
				$scope.text.updateTextProperty($scope.getCurrentCanvas(), 'fontSize', $scope.text.fontSize);
			});
			$scope.$watch('text.strokeWidth', function() {
				$scope.text.strokeWidth = parseFloat($scope.text.strokeWidth);
				$scope.text.updateTextProperty($scope.getCurrentCanvas(), 'stroke', $scope.text.stroke);
				$scope.text.updateTextProperty($scope.getCurrentCanvas(), 'strokeWidth', $scope.text.strokeWidth);
			});
			$scope.text.addText = function() {
				if($scope.text.currentText) {
					$scope.text.selectedTextEvents();
					var textOptions = {
						fill: $scope.text.fill,
						//stroke: $scope.text.stroke,
						price: 0
					}
					PdpServices.pdpHelper.addText($scope.text.currentText, 25, $scope.getCurrentCanvas(), textOptions);
				}
			}
			$scope.text.updateText = function() {
				if($scope.text.currentText) {
					var activeObject = $scope.getActiveObject();
					if(activeObject && activeObject.type == "text") {
						activeObject.setText($scope.text.currentText);
						$scope.getCurrentCanvas().renderAll();
					}	
				}
			}
			//Selected text event
			$scope.text.selectedTextEvents = function() {
				if($scope.getCurrentCanvas()) {
					$scope.getCurrentCanvas().observe('object:selected', function() {
						if($scope.getActiveObject() && $scope.getActiveObject().type == "text") {
							$scope.text.updateTextInfo($scope.getActiveObject());
						}
					});
					$scope.getCurrentCanvas().observe('selection:cleared', function() {
						$timeout(function() {
							$scope.text.currentText = '';
							$scope.text.showUpdateButton = false;
						});
					});
				}
			}
			$scope.text.updateTextInfo = function(activeObject) {
				if(activeObject) {
					var textProperties = [
						'fontFamily', 'fontSize', 'stroke', 
						'strokeWidth', 'fontStyle', 'fontWeight', 
						'textAlign', 'textDecoration', 'fill', 'stroke'];
					$timeout(function() {
						$scope.text.currentText = activeObject.text;
						angular.forEach(textProperties, function(textProp, index) {
							$scope.text[textProp] = activeObject[textProp] || $scope.text[textProp];
						});
						//show update button
						$scope.text.showUpdateButton = true;
						//$scope.text.fontFamily = activeObject.fontFamily;
						//$scope.text.fontSize = activeObject.fontSize;	
						//$scope.text.stroke = activeObject.stroke || $scope.text.stroke;
						//$scope.text.strokeWidth = activeObject.strokeWidth || $scope.text.strokeWidth;
					});
				}
			}
			$scope.text.updateTextProperty = function(canvas, property, value) {
				if(!canvas) return false;
				var activeObject = canvas.getActiveObject();
				if(activeObject) {
					activeObject.set(property, value);
					$scope.text[property] = value;
					canvas.renderAll();
				}
			}
			$scope.text.changeTextProperty = function(property, value) {
				value = value || '';
				if($scope.getCurrentCanvas() && $scope.getActiveObject()) {
					var activeObject = $scope.getActiveObject();
					if(activeObject && activeObject.type == "text") {
						switch (property) {
							case 'fontWeight':
								if(activeObject.fontWeight == 'normal') {
									$scope.text.updateTextProperty($scope.getCurrentCanvas(), 'fontWeight', 'bold');
								} else {
									$scope.text.updateTextProperty($scope.getCurrentCanvas(), 'fontWeight', 'normal');
								}
								break;
							case 'fontStyle':
								if(activeObject.fontStyle == 'normal') {
									$scope.text.updateTextProperty($scope.getCurrentCanvas(), 'fontStyle', 'italic');
								} else {
									$scope.text.updateTextProperty($scope.getCurrentCanvas(), 'fontStyle', 'normal');
								}
								break;	
							case 'textAlign':
								var alignValue = value || 'left';
								$scope.text.updateTextProperty($scope.getCurrentCanvas(), 'textAlign', alignValue);
								break;
							case 'textDecoration':
								var textDecoration = value || 'left';
								$scope.text.updateTextProperty($scope.getCurrentCanvas(), 'textDecoration', textDecoration);
								break;						
							default:
								break;
						}
					}
				}
			}
			$scope.text.changeFont = function(fontFamily) {
				if(fontFamily && $scope.getCurrentCanvas()) {
					var canvas = $scope.getCurrentCanvas();
					if(canvas) {
						$scope.text.updateTextProperty(canvas, 'fontFamily', fontFamily);	
					}
				}
			}
			$scope.text.changeTextColor = function(colorCode) {
				if(colorCode && $scope.getCurrentCanvas()) {
					var canvas = $scope.getCurrentCanvas();
					if(canvas) {
						$scope.text.updateTextProperty(canvas, 'fill', colorCode);	
					}
				}
			}
			$scope.text.changeTextStroke = function(colorCode) {
				if(colorCode && $scope.getCurrentCanvas()) {
					var canvas = $scope.getCurrentCanvas();
					if(canvas) {
						$scope.text.updateTextProperty(canvas, 'stroke', colorCode);	
					}
				}
			}
		}
	];
});