define([
    'undomanager',
    'pdp'
], function(UndoManager, pdp) {
    'use strict';
    return {
        hisId: 1,
        pdpObject: {},
        allSides: {},
        init: function(pdpObject) {
            var self = this;
            self.pdpObject = pdpObject || pdp();
            if(self.pdpObject && self.pdpObject.allCanvas) {
                for(var sideId in self.pdpObject.allCanvas) {
                    if(self.pdpObject.allCanvas.hasOwnProperty(sideId)) {
                        self.allSides[sideId] = {};
                        self.history[sideId] = {};
                        self.allSides[sideId]['undoManager'] = new UndoManager();
                        self.allSides[sideId]['undoManager'].setLimit(10);
                        (function(_sideId) {
                            self.pdpObject.allCanvas[_sideId].observe('object:modified', function() {
                                self.createHistory(_sideId, self.pdpObject.allCanvas[_sideId]);
                                self.showAndHideUndoRedoBtn(_sideId);
                            });
                            self.pdpObject.allCanvas[_sideId].observe('object:removed', function() {
                                self.createHistory(_sideId, self.pdpObject.allCanvas[_sideId]);
                                self.showAndHideUndoRedoBtn(_sideId);
                            });
                        })(sideId);
                    }
                }
                this.undoClick();
                this.redoClick();   
            }
        },
        history: {},
        createHistory: function(sideId, canvas) {
            if(!sideId || !canvas) return false;
            var self = this;
            var hisId = self.hisId++,
                name = canvas.toJSON();
                console.info(hisId, name);
            this.addHistory(sideId, hisId, name);
            if(this.allSides[sideId]['undoManager']) {
                this.allSides[sideId]['undoManager'].add({
                    undo: function() {
                        //self.removeHistory(sideId, hisId);
                        self.drawDesign(canvas, self.history[sideId][hisId], function() {
                            self.removeHistory(sideId, hisId);
                        });
                    },
                    redo: function() {
                        self.addHistory(sideId, hisId, name);
                        self.drawDesign(canvas, self.history[sideId][hisId]);
                    }
                });
            }
            self.showAndHideUndoRedoBtn(sideId);
        },
        addHistory: function(sideId, hisId, name) {
            var self = this;
            self.history[sideId][hisId] = name;
            //console.info('add history', hisId, name);
            //console.info('history after add', self.history[sideId]);
        },
        removeHistory: function(sideId, hisId) {
            //console.info('remove',sideId, hisId);
            delete this.history[sideId][hisId];
            //console.info('history after remove', this.history[sideId]);
        },
        drawDesign: function(canvas, json, callback) {
            //console.log('draw design', canvas, json);
            if(canvas && json) {
                canvas.loadFromJSON(json, function() {
                    canvas.renderAll();
                    callback && callback();
                });   
            }
        },
        undoClick: function() {
            var self = this;
            $('[data-toolbox="undo"]').click(function() {
                if(self.pdpObject && self.pdpObject.getActiveSideIndex()) {
                    var sideId = self.pdpObject.getActiveSideIndex(); 
                    if($(this).find('.disabled').length) {
                        return false;
                    }   
                    self.allSides[sideId]['undoManager'].undo();
                    self.showAndHideUndoRedoBtn(sideId);
                }
            });
        },
        redoClick: function() {
            var self = this;
            $('[data-toolbox="redo"]').click(function() {
                if(self.pdpObject && self.pdpObject.getActiveSideIndex()) {
                    var sideId = self.pdpObject.getActiveSideIndex(); 
                    if($(this).find('.disabled').length) {
                        return false;
                    }   
                    self.allSides[sideId]['undoManager'].redo();
                    self.showAndHideUndoRedoBtn(sideId);
                }
            });
        },
        showAndHideUndoRedoBtn: function(sideId) {
            var self = this; 
            //If has undo, then show the undo button
            if(self.allSides[sideId]['undoManager'].hasUndo()) {
                $('[data-toolbox="undo"]').find('a').removeClass('disabled');
            } else {
                $('[data-toolbox="undo"]').find('a').addClass('disabled');
            }
            if(self.allSides[sideId]['undoManager'].hasRedo()) {
                $('[data-toolbox="redo"]').find('a').removeClass('disabled');
            } else {
                $('[data-toolbox="redo"]').find('a').addClass('disabled');
            }
        }
    };  
});