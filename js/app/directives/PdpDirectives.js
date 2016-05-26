/**
 * Directive that places focus on the element it is applied to when the expression it binds to evaluates to true.
 */
 
define([
	'angular'
], function (angular) {
    'use strict';
	var moduleName = 'PdpDirectives';
    var _pdpDirectiveModule = angular.module(moduleName, []);
    /** All directives here **/
    _pdpDirectiveModule.directive("pdpUserNavigation", [function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/user-navigation.html',
            replace: true
        };
    }]);
    _pdpDirectiveModule.directive("pdpAddImage", [function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/addimage.html',
            replace: true
        };
    }]);
    _pdpDirectiveModule.directive("pdpItems", [function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/pdp-items.html',
            replace: true
        };
    }]);
    _pdpDirectiveModule.directive("pdpAddText", [function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/addtext.html',
            replace: true
        };
    }]);
    _pdpDirectiveModule.directive("pdpAddNote", [function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/addnote.html',
            replace: true
        };
    }]);
    _pdpDirectiveModule.directive("pdpToolbar", [function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/toolbar.html',
            replace: true
        };
    }]);
    _pdpDirectiveModule.directive("pdpToolbox", [function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/toolbox.html',
            replace: true
        };
    }]);
    _pdpDirectiveModule.directive("pdpHiddenPopup", [function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/hidden-popup.html',
            replace: true
        };
    }]);
    _pdpDirectiveModule.directive("pdpDesignArea", [function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/designarea.html',
            replace: true
        };
    }]);
	return moduleName;
});