define([
	'angular'
], function (angular) {
    'use strict';
	var moduleName = 'PdpServices';
	angular
		.module(moduleName, [])
		.service(moduleName, ["$http", "$q", "$rootScope", function($http, $q, $rootScope) {
            var self = this,
                baseUrl = 'http://pdp2016.frontend.dev/server.php?action=';
            // Return public API.
            return({
                getVersion: getVersion,
                getProductConfig: getProductConfig
            });
            function getVersion() {
                return 'PDP 2016 - 2.0';
            }
            function getProductConfig($productId) {
                var configUrl = baseUrl + 'getProductConfig&id=' + $productId;
                var request = $http({
                    method: "get",
                    url: configUrl,
                });
                return( request.then( handleSuccess, handleError ) );
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

