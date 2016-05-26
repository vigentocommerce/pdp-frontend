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
            var pdpHelper = {
                addText: function(text, fontSize, _canvas) {
                    var textObj = new fabric.Text(text, {
                        fontFamily: 'Arial',
                        //left: center.left,
                        //top: center.top,
                        fontSize: fontSize || 25,
                        textAlign: "left",
                        //perPixelTargetFind : true,
                        fill: "#000",
                        price: 0,
                        lineHeight: 1.3,
                        borderColor: '#808080',
                        cornerColor: 'rgba(68,180,170,0.7)',
                        cornerSize: 16,
                        cornerRadius: 12,
                        transparentCorners: false,
                        centeredScaling: true,
                        rotatingPointOffset: 40,
                        padding: 5
                    });
                    textObj.setControlVisible('mt', false);
                    _canvas.centerObject(textObj);
                    _canvas.add(textObj).setActiveObject(textObj);
                    _canvas.calcOffset().renderAll();
                },
                addImage: function(src, options, callback, _canvas) {
                    options = options || {};
                    if(src && _canvas) {
                        var ext = src.split("."),
                            self = this;
                        if(ext[ext.length -1] != 'svg') {
                            fabric.Image.fromURL(src, function(image) {
                                image.set({
                                    //left: 0,
                                    //top: 0,
                                    angle: 0,
                                    price: options.price || 0,
                                    id: options.id || Date.now(),
                                    scaleY: (_canvas.width / image.width / 2) / _canvas.getZoom(),
                                    scaleX: (_canvas.width / image.width / 2) / _canvas.getZoom(),
                                    isrc: src,
                                    object_type: options.object_type || 'image',
                                    borderColor: '#808080',
                                    cornerColor: 'rgba(68,180,170,0.7)',
                                    cornerSize: 16,
                                    cornerRadius: 12,
                                    transparentCorners: false,
                                    centeredScaling:true,
                                    rotatingPointOffset: 40,
                                    padding: 5
                                });
                                image.setControlVisible('mt', false);
                                image.setCoords();
                                _canvas.centerObject(image);
                                _canvas.add(image).setActiveObject(image);
                                if(callback) callback();
                                
                            });   
                        } else {
                            this.addSvg(src, options, callback, _canvas);
                        }
                    }
                },
                addSvg: function (src, options, callback, _canvas) {
                    options = options || {};
                    if(!src || !_canvas) return false;
                    fabric.loadSVGFromURL(src, function (objects, _svgOptions) {
                        var loadedObject = fabric.util.groupSVGElements(objects, _svgOptions),
                            zoom = _canvas.getZoom();
                        loadedObject.set({
                            //left: center.left,
                            //top: center.top,
                            fill: options.color || null,
                            perPixelTargetFind : true,
                            isrc: src,
                            price: options.price || 0,
                            id: options.id || Date.now(),
                            //scaleY: (_canvas.width / loadedObject.width / 2)/zoom,
                            //scaleX: (_canvas.width / loadedObject.width / 2)/zoom,
                            object_type: options.object_type || 'image',
                            borderColor: '#808080',
                            cornerColor: 'rgba(68,180,170,0.7)',
                            cornerSize: 16,
                            cornerRadius: 12,
                            transparentCorners: false,
                            centeredScaling:true,
                            rotatingPointOffset: 40,
                            padding: 5
                        });
                        loadedObject.setControlVisible('mt', false);
                        if (loadedObject.width > _canvas.width) {
                            loadedObject.scaleToWidth(_canvas.width / 2);
                        }
                        _canvas.centerObject(loadedObject);
                        loadedObject.hasRotatingPoint = true;
                        _canvas.add(loadedObject).setActiveObject(loadedObject);
                        _canvas.renderAll();
                        if(callback) callback();
                    });
                }
            }    
            // Return public API.
            return({
                allCanvas: {},
                getProductConfig: getProductConfig,
                pdpHelper: pdpHelper
            });
            function getProductConfig($productId) {
                var configUrl = baseUrl + 'getProductConfig&id=' + $productId;
                var request = $http({
                    method: "get",
                    url: configUrl,
                });
                return( request.then( handleSuccess, handleError ) );
            }
            
            function addImage(src, options, callback, _canvas) {
                options = options || {};
                if(src && _canvas) {
                    var ext = src.split("."),
                        self = this;
                    if(ext[ext.length -1] != 'svg') {
                        this.showLoadingBar();
                        fabric.Image.fromURL(src, function(image) {
                            image.set({
                                //left: 0,
                                //top: 0,
                                angle: 0,
                                price: options.price || 0,
                                id: options.id || Date.now(),
                                scaleY: (_canvas.width / image.width / 2) / _canvas.getZoom(),
                                scaleX: (_canvas.width / image.width / 2) / _canvas.getZoom(),
                                isrc: src,
                                object_type: options.object_type || 'image',
                                borderColor: '#808080',
                                cornerColor: 'rgba(68,180,170,0.7)',
                                cornerSize: 16,
                                cornerRadius: 12,
                                transparentCorners: false,
                                centeredScaling:true,
                                rotatingPointOffset: 40,
                                padding: 5
                            });
                            image.setControlVisible('mt', false);
                            image.setCoords();
                            _canvas.centerObject(image);
                            _canvas.add(image).setActiveObject(image);
                            self.hideLoadingBar();
                            if(callback) callback();
                            
                        });   
                    } else {
                        this.addSvg(src, options, callback);
                    }
                }
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

