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
                addText: function(text, fontSize, _canvas, options) {
                    options = options || {};
                    var textObj = new fabric.Text(text, {
                        fontFamily: 'Arial',
                        //left: center.left,
                        //top: center.top,
                        fontSize: fontSize || 25,
                        textAlign: "center",
                        fontStyle: 'normal',
                        //perPixelTargetFind : true,
                        fill: options.fill || "#000",
                        price: options.price || 0,
                        lineHeight: 1.0,
                        strokeWidth: 0,
                        stroke: options.stroke || '',
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
                changeTextEffect: function(canvas, effect) {
                    if(!canvas || !effect) return false;
                    var active = canvas.getActiveObject();
                    if (!active) {
                        alert("Please select a text!");
                        return false;
                    }
                    var fontSize = parseInt(active.fontSize),
                        largeFont = fontSize,
                        smallFont = fontSize;
                    if(!active.largeFont) {
                        smallFont = parseInt(largeFont / 2);
                    } else {
                        largeFont = parseInt(active.largeFont);
                        smallFont = parseInt(active.smallFont);
                            //Someone might change the font from transform slider, just roll back to make it look like sample text
                        if(smallFont > largeFont) {
                            var _tempLarge = largeFont;
                            largeFont = smallFont,
                            smallFont = _tempLarge;
                        }
                    }
                    if(effect == "obulge") {
                        if(smallFont < largeFont) {
                            smallFont = largeFont;
                            largeFont =  parseInt(smallFont / 2);
                        }
                        effect = "bulge";
                    }
                    if((active.type=='text') || (active.type=='i-text')) {
                        var CurvedText = new fabric.CurvedText(active.text, {
                            left: active.left,
                            top: active.top,
                            textAlign: 'center',
                            fill: active.fill,
                            radius: 100,
                            fontSize: fontSize,
                            spacing: 15,
                            fontFamily: active.fontFamily,
                            name: active.name || '',
                            scaleX: active.scaleX,
                            scaleY: active.scaleY,
                            opacity: active.opacity,
                            fontWeight: active.fontWeight,
                            fontStyle: active.fontStyle,
                            stroke: active.stroke,
                            strokeWidth: active.strokeWidth,
                            price: active.price,
                            effect: effect,//curved, arc, smallToLarge, largeToSmallTop, largeToSmallBottom, bulge, STRAIGHT
                            angle: active.angle,
                            smallFont: smallFont,
                            largeFont: largeFont,
                            borderColor: '#808080',
                            cornerColor: 'rgba(68,180,170,0.7)',
                            cornerSize: 16,
                            cornerRadius: 12,
                            transparentCorners: false,
                            centeredScaling:true,
                            rotatingPointOffset: 40,
                            padding: 5
                        });
                        canvas.remove(active);
                        canvas.add(CurvedText).setActiveObject(CurvedText).calcOffset().renderAll();
                    } else if (active.type == 'curvedText') {
                        active.set({
                            effect: effect,
                            smallFont: smallFont,
                            largeFont: largeFont
                        });
                        canvas.renderAll();
                    }
                },
                reverseCurvedText: function(canvas, isReverse) {
                    var obj = canvas.getActiveObject(); 
                    if(obj){
                        var scaleXobj =  obj.scaleX,
                            scaleYobj = obj.scaleY;
                        obj.set('reverse', isReverse); 
                        canvas.renderAll();
                        obj.set({
                            scaleX: scaleXobj,
                            scaleY: scaleYobj
                        })
                        canvas.renderAll();
                    }  
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
            };  
        var pdpZoom = {
                SCALE_FACTOR: 2,
                maxWidth: 2000,
                minWidth: 300,
                maxHeightForAutoZoom: 560,
                zoomIn: function(_canvas, zoomX) {
                    var self = this;
                    if(!_canvas) return false;
                    if(_canvas.scale) {
                        _canvas.oldScale = _canvas.scale;
                        _canvas.scale = Math.pow(self.SCALE_FACTOR, zoomX);
                    } else {
                        _canvas.scale = Math.pow(self.SCALE_FACTOR, zoomX); 
                        _canvas.oldScale = 1;  
                    }
                    // if(zoomX === 1) {
                    //     if(!_canvas.oldScale) {
                    //         _canvas.oldScale = _canvas.scale = 1;
                    //     } else {
                    //         _canvas.scale = 1;
                    //     }
                    // }
                    //console.info(_canvas.scale);
                    //_canvas.scale = (_canvas.scale || 1) * self.SCALE_FACTOR;
                    _canvas.setHeight((_canvas.getHeight() /_canvas.oldScale) * _canvas.scale);
                    _canvas.setWidth((_canvas.getWidth() / _canvas.oldScale) * _canvas.scale);
                    _canvas.calcOffset();

                    var objects = _canvas.getObjects();
                    //console.info('Old Scale: ' + _canvas.oldScale + ', New Scale: ' + _canvas.scale + ', Object Scale: ' + objectScale);
                    for (var i in objects) {
                        var scaleX = objects[i].scaleX / _canvas.oldScale;
                        var scaleY = objects[i].scaleY / _canvas.oldScale;
                        var left = objects[i].left / _canvas.oldScale;
                        var top = objects[i].top / _canvas.oldScale;

                        var tempScaleX = scaleX * _canvas.scale;
                        var tempScaleY = scaleY * _canvas.scale;
                        var tempLeft = left * _canvas.scale;
                        var tempTop = top * _canvas.scale;

                        objects[i].scaleX = tempScaleX;
                        objects[i].scaleY = tempScaleY;
                        objects[i].left = tempLeft;
                        objects[i].top = tempTop;

                        objects[i].setCoords();
                    }
                    _canvas.renderAll();
                    this.updateWrappSize(_canvas);
                },
                zoomOut: function(_canvas, SCALE_FACTOR) {
                    var self = this;
                    _canvas = _canvas;
                    _canvas.scale = (_canvas.scale || 1) / self.SCALE_FACTOR;
                    _canvas.setHeight(_canvas.getHeight() * (1 / self.SCALE_FACTOR));
                    _canvas.setWidth(_canvas.getWidth() * (1 / self.SCALE_FACTOR));
                    _canvas.calcOffset();
                    var objects = _canvas.getObjects();
                    for (var i in objects) {
                        var scaleX = objects[i].scaleX;
                        var scaleY = objects[i].scaleY;
                        var left = objects[i].left;
                        var top = objects[i].top;
                        
                        var tempScaleX = scaleX * (1 / self.SCALE_FACTOR);
                        var tempScaleY = scaleY * (1 / self.SCALE_FACTOR);
                        var tempLeft = left * (1 / self.SCALE_FACTOR);
                        var tempTop = top * (1 / self.SCALE_FACTOR);
                        
                        objects[i].scaleX = tempScaleX;
                        objects[i].scaleY = tempScaleY;
                        objects[i].left = tempLeft;
                        objects[i].top = tempTop;
                        objects[i].setCoords();
                    }
                    _canvas.renderAll();  
                    this.updateWrappSize(_canvas);
                },
                resetZoom: function(_canvas, canvasScale) {
                    var self = this;
                    _canvas = _canvas;
                    _canvas.scale = (_canvas.scale || 1);
                    _canvas.setHeight(_canvas.getHeight() * (1 / _canvas.scale));
                    _canvas.setWidth(_canvas.getWidth() * (1 / _canvas.scale));
                    _canvas.calcOffset();
                    var objects = _canvas.getObjects();
                    for (var i in objects) {
                        var scaleX = objects[i].scaleX;
                        var scaleY = objects[i].scaleY;
                        var left = objects[i].left;
                        var top = objects[i].top;

                        var tempScaleX = scaleX * (1 / _canvas.scale);
                        var tempScaleY = scaleY * (1 / _canvas.scale);
                        var tempLeft = left * (1 / _canvas.scale);
                        var tempTop = top * (1 / _canvas.scale);

                        objects[i].scaleX = tempScaleX;
                        objects[i].scaleY = tempScaleY;
                        objects[i].left = tempLeft;
                        objects[i].top = tempTop;

                        objects[i].setCoords();
                    }
                    _canvas.renderAll();
                    _canvas.scale = 1;
                    this.updateWrappSize(_canvas);
                },
                updateWrappSize: function(_canvas) {
                    var newWidth = _canvas.getWidth(),
                    originalWidth = _canvas.getWidth() * (1 / (_canvas.scale || 1));
                    var percent = (newWidth * 100) / originalWidth;
                    angular.element(document.querySelector("#zoom_percent")).html(parseInt(percent) + "%");
                },
                getMaxScaleFactor: function(width) {
                    //Get 4 step 
                    //if x = y^4
                    //then y = x^1/4 means y = x^0.25
                    var diffWidth = this.maxWidth / parseFloat(width);
                    var factor = Math.pow(diffWidth, 0.25);
                    return factor;
                }
            };
            // Return public API.
            return({
                allCanvas: {},
                getProductConfig: getProductConfig,
                pdpHelper: pdpHelper,
                history: history,
                pdpZoom: pdpZoom
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

