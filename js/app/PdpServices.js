define([
	'angular'
], function (angular) {
    'use strict';
	var moduleName = 'PdpServices';
	angular
		.module(moduleName, [])
		.service(moduleName, ["$http", "$q", "$rootScope", function($http, $q, $rootScope) {
            var self = this,
                baseUrl = 'server.php?action=',
                config = {
                    
                };
            // Return public API.
            return({
                allCanvas: {},
                getProductConfig: getProductConfig,
                addText: addText
            });
            function getProductConfig($productId) {
                var configUrl = baseUrl + 'getProductConfig&id=' + $productId;
                var request = $http({
                    method: "get",
                    url: configUrl,
                });
                return( request.then( handleSuccess, handleError ) );
            }
            function addText(text, fontSize, _canvas) {
                var textObj = new fabric.Text(text, {
                    fontFamily: 'Arial',
                    //left: center.left,
                    //top: center.top,
                    fontSize: 25,
                    textAlign: "left",
                    //perPixelTargetFind : true,
                    fill: "#000",
                    price: 0,
                    lineHeight:  1.3,
                    borderColor: '#808080',
                    cornerColor: 'rgba(68,180,170,0.7)',
                    cornerSize: 16,
                    cornerRadius: 12,
                    transparentCorners: false,
                    centeredScaling:true,
                    rotatingPointOffset: 40,
                    padding: 5
                });
                textObj.setControlVisible('mt', false);
                _canvas.centerObject(textObj);
                _canvas.add(textObj).setActiveObject(textObj);
                _canvas.calcOffset().renderAll();
            }
            // ---
            // PRIVATE METHODS.
            // ---
            function handleError( response ) {
                if (! angular.isObject( response.data ) ||! response.data.message) {
                    return( $q.reject( "An unknown error occurred." ) );
                }
                // Otherwise, use expected error message.
                return( $q.reject( response.data.message ) );
            }
            // transform the successful response, unwrapping the application data
            // from the API response payload.
            function handleSuccess( response ) {
                return( response.data );
            }
        }]);
	return moduleName;
});

