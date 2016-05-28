define([
	'angular',
], function (angular) {
    'use strict';
	return ['$scope', '$location', 'PdpServices', '$compile',
		function ($scope, $location, PdpServices, $compile) {
			$scope.hasUndo = false;
			$scope.hasRedo = false;
			$scope.undo = function() {
				if(PdpServices.history.undoManager) {
					PdpServices.history.undoManager.undo();
				}
				PdpServices.history.showAndHideUndoRedoBtn();
			}
			$scope.redo = function() {
				if(PdpServices.history.undoManager) {
					PdpServices.history.undoManager.redo();
				}
				PdpServices.history.showAndHideUndoRedoBtn();
			}
			$scope.$on('handleUpdateHistory', function() {
				$scope.hasUndo = PdpServices.history.showUndo;
				$scope.hasRedo = PdpServices.history.showRedo;
				//var toolbox = angular.element(document.querySelector('.toolbox'));
				//$compile(toolbox.contents())($scope);
				
			});
		}
	];
});