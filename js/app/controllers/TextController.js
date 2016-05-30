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
			};	
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
			$scope.addText = function() {
				if($scope.text.currentText) {
					$scope.text.selectedTextEvents();
					PdpServices.pdpHelper.addText($scope.text.currentText, 25, $scope.getCurrentCanvas());	
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
						});
					});
				}
			}
			$scope.text.updateTextInfo = function(activeObject) {
				if(activeObject) {
					var textProperties = ['fontFamily', 'fontSize', 'stroke', 'strokeWidth', 'fontStyle', 'fontWeight'];
					$timeout(function() {
						$scope.text.currentText = activeObject.text;
						angular.forEach(textProperties, function(textProp, index) {
							$scope.text[textProp] = activeObject[textProp] || $scope.text[textProp];
						});
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
			$scope.text.changeTextProperty = function(property) {
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
						
							default:
								break;
						}
					}
				}
			}
			$scope.changeFont = function(fontFamily) {
				if(fontFamily && $scope.getCurrentCanvas()) {
					var canvas = $scope.getCurrentCanvas();
					if(canvas) {
						$scope.text.updateTextProperty(canvas, 'fontFamily', fontFamily);	
					}
				}
			}
		}
	];
});