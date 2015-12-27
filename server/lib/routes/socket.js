var cv = require('opencv');

// camera properties
var camWidth = 320;
var camHeight = 240;
var camFps = 10;
var camInterval = 1000 / camFps;

// face detection properties
var rectColor = [0, 255, 0];
var rectThickness = 2;

var lowThresh = 0;
var highThresh = 100;
var nIters = 2;
var minArea = 2000;
var maxArea = 2500;

var BLUE  = [0, 255, 0]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R

// initialize camera
var camera = new cv.VideoCapture(0);
camera.setWidth(camWidth);
camera.setHeight(camHeight);

module.exports = function (socket) {
	setInterval(function() {
		camera.read(function(err, im) {
			if (err) throw err;

			width = im.width();
			height = im.height();
			if (width < 1 || height < 1) throw new Error('Image has no size');

			var out = new cv.Matrix(height, width);
			
			im_canny = im.copy();
			im_canny.convertGrayscale();
			im_canny.canny(lowThresh, highThresh);
			im_canny.dilate(nIters);
			contours = im_canny.findContours();
			
			var index = -1;
			for (i = 0; i < contours.size(); i++) {
				if (index === -1 || contours.area(i) > contours.area(index))
				 index = i;
			}
			
			var mask = new cv.Matrix(im.height(),im.width(),cv.Constants.CV_8UC1);
			mask.drawContour(contours, index, GREEN, cv.Constants.CV_FILLED);
			im.bitwiseNot(mask);
			//normalize(mask.clone(), mask, 0.0, 255.0, cv.Constants.CV_MINMAX, cv.Constants.CV_8UC1);
			//im.normalize(im.height(),im.width(),cv.Constants.NORM_TYPE_MASK,-1,mask);

			/*var crop = im.crop(im.height(),im.width(),cv.Constants.CV_8UC3);
			//crop.SetTo(GREEN);*/
			//im.copyTo(im, mask);
			socket.emit('frame', { buffer: mask.toBuffer() });

			//vertical.bitwiseNot(vertical);

	  	});
  	}, camInterval);
};
