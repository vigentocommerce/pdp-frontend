define([
	'angular',
    'undomanager'
], function (angular, UndoManager) {
    'use strict';
	var moduleName = 'PdpServices';
	angular
		.module(moduleName, [])
		.service(moduleName, ["$http", "$q", "$rootScope", function($http, $q, $rootScope) {
            var self = this,
                baseUrl = 'server.php?action=',
                config = {
                    
                };
            var history = {
                hisId: 1,
                canvas: null,
                undoManager: null,
                showUndo: false,
                showRedo: false,
                init: function(canvas) {
                    var self = this;
                    self.canvas = canvas;
                    if(self.canvas) {
                        self.resetHistory();
                        self.hisId = 1;
                        //Init undoManager
                        self.undoManager = new UndoManager();
                        self.undoManager.clear();
                        self.undoManager.setLimit(10);
                        self.canvas.observe('object:modified', function() {
                            self.createHistory();
                        });
                        self.canvas.observe('object:removed', function() {
                            self.createHistory();
                        });  
                    }
                },
                resetHistory: function() {
                    this.historyItems = {};  
                },
                historyItems: {},
                createHistory: function() {
                    var self = this;
                    if(!self.canvas) return false;
                    var hisId = self.hisId++,
                        jsonContent = self.canvas.toJSON();
                    this.addHistory(hisId, jsonContent);
                    if(self.undoManager) {
                        self.undoManager.add({
                            undo: function() {
                                self.drawDesign(self.canvas, self.historyItems[hisId], function() {
                                    self.removeHistory(hisId);
                                });
                            },
                            redo: function() {
                                self.addHistory(hisId, jsonContent);
                                self.drawDesign(self.canvas, self.historyItems[hisId]);
                                
                            }
                        });
                    }
                    self.showAndHideUndoRedoBtn();
                },
                addHistory: function(hisId, content) {
                    var self = this;
                    content = JSON.stringify(content);
                    self.historyItems[hisId] = content;
                },
                removeHistory: function(hisId) {
                    delete this.historyItems[hisId];
                },
                drawDesign: function(canvas, json, callback) {
                    var self = this;
                    if(canvas && json) {
                        canvas.loadFromJSON(json, function() {
                            canvas.renderAll();
                            callback && callback();
                        });
                    }
                },
                showAndHideUndoRedoBtn: function() {
                    if(!this.undoManager.hasUndo()) {
                        this.showUndo = false;
                    } else {
                        this.showUndo = true;
                    }
                    if(!this.undoManager.hasRedo()) {
                        this.showRedo = false;
                    } else {
                        this.showRedo = true;
                    }
                    this.broadcastHistoryChange();
                },
                broadcastHistoryChange: function() {
                    $rootScope.$broadcast('handleUpdateHistory');
                }
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
                    history.createHistory();
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
                                $rootScope.$apply(function() {
                                    if(callback) {
                                        callback();
                                    }
                                    history.createHistory();
                                });
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
                        $rootScope.$apply(function() {
                            if(callback) {
                                callback();
                            }
                            history.createHistory();
                        });
                    });
                }
            }  
            // Return public API.
            return({
                allCanvas: {},
                getProductConfig: getProductConfig,
                pdpHelper: pdpHelper,
                history: history
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

