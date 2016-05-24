define([
    'undomanager',
], function(UndoManager) {
    'use strict';
    var hisId = 0;
    return {
        allSides: {},
        init: function(sideIds) {
            if(!sideIds) return false;
            var self = this;
            for(var i = 0; i < sideIds.length; i++) {
                self.allSides[sideIds[i]] = {};
                self.allSides[sideIds[i]]['undoManager'] = new UndoManager();
            }
        },
        history: {},
        createHistory: function(sideId, hisId, name, canvas) {
            var self = this;
            this.addHistory(sideId, hisId, name);
            if(this.allSides[sideId]['undoManager']) {
                this.allSides[sideId]['undoManager'].add({
                    undo: function() {
                        self.drawDesign(canvas, history[sideId][hisId], function() {
                            self.removeHistory(sideId, hisId);
                        });
                    },
                    redo: function() {
                        self.addHistory(sideId, hisId, name);
                        self.drawDesign(canvas, history[sideId][hisId]);
                    }
                });
            }
        },
        addHistory: function(sideId, hisId, name) {
            var self = this;
            self.history[sideId][hisId] = name;
        },
        removeHistory: function(sideId, hisId) {
            delete history[sideId][hisId];
        },
        drawDesign: function(canvas, json, callback) {
            canvas.loadFromJSON(json, function() {
                canvas.renderAll();
                callback && callback();
            });
        }
    };
    //var undoManager = new UndoManager();
    //console.info(undoManager);
    
// var undoManager = new UndoManager(),
//     history = {},
//     addHistory,
//     removeHistory,
//     id = 0,
//     createHistory,
//     drawDesign;      

// addHistory = function(id, name) {
//     history[id] = name;
// };
// undoManager.setLimit(10);
// removeHistory = function(id) {
//     delete history[id];
// };
// createHistory = function (id, name) {
//     // first creation
//     addHistory(id, name);
//     // make undo-able
//     undoManager.add({
//         undo: function() {
//             drawDesign(history[id], function() {
//                 removeHistory(id);
//             });
//             //removeHistory(id)
//         },
//         redo: function() {
//             addHistory(id, name);
//             drawDesign(history[id]);
//         }
//     });
// }
// drawDesign = function(json, callback) {
//     canvas.loadFromJSON(json, function() {
//         canvas.renderAll();
//         callback && callback();
//     });
// }

// var canvas = new fabric.Canvas('myCanvas');
// canvas.add(new fabric.Text('Hello', {
//     top: 10,
//     left: 10
// }));
// // create a rectangle object
// var rect = new fabric.Rect({
//   left: 100,
//   top: 100,
//   fill: 'red',
//   width: 200,
//   height: 200
// });

// // "add" rectangle onto canvas
// canvas.add(rect);
// canvas.renderAll();
// //Start adding design
// createHistory(id++, canvas.toJSON());
// canvas.observe('object:modified', function() {
//     createHistory(id++, canvas.toJSON());
//     console.info(history);
// });
// //================ Events ================///
// var undoBtn = document.getElementById("undo"),
//     redoBtn = document.getElementById("redo");
    
// undoBtn.addEventListener('click', function() {
//     undoManager.undo();
// });
// redoBtn.addEventListener('click', function() {
//     undoManager.redo();
// });
// //================= Shortcut ================//
    
    
    
});