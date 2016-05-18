define([
  'fabricjs',
], function() {
  'use strict';
    var canvas = new fabric.Canvas('c', { selection: false });
  // add objects

  canvas.add(new fabric.Rect({ 
    left: 100, 
    top: 100, 
    width: 50, 
    height: 50, 
    fill: '#faa', 
    originX: 'left', 
    originY: 'top',
    centeredRotation: true
  }));

  canvas.add(new fabric.Circle({ 
    left: 300, 
    top: 300, 
    radius: 50, 
    fill: '#9f9', 
    originX: 'left', 
    originY: 'top',
    centeredRotation: true
  }));
  fabric.Image.fromURL('images/Img1.png', function(oImg) {
    canvas.add(oImg);
  });
  fabric.Image.fromURL('images/Img2.jpg', function(oImg) {
    canvas.add(oImg);
  });
});