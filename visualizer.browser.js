(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.visualizer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var getUserMedia = require('get-user-media-promise');
var nextTick = require('next-tick');
var raf = require('raf');
var vizRadialArcs = require('./lib/vizRadialArcs');
var vizRadialBars = require('./lib/vizRadialBars');
var vizFlyout = require('./lib/vizFlyout');
var vizSunburst = require('./lib/vizSunburst');
var vizBoxes = require('./lib/vizBoxes');
var vizSpikes = require('./lib/vizSpikes');
var vizImage = require('./lib/vizImage');

module.exports = function visualizer() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var parent = options.parent ? document.querySelector(options.parent) : window;
  var cv = document.createElement('canvas');
  if (!options.parent) {
    cv.style.position = 'absolute';
    cv.style.left = '0';
    cv.style.top = '0';
    document.body.appendChild(cv);
  } else {
    parent.appendChild(cv);
  }

  var ctx = cv.getContext('2d');

  var image = options.image;

  var visualizers = [];

  var currentViz = 0;

  // for audio processing
  //let analyseInterval = 1000 / 30
  var fftSize = 256;

  // although the actual spectrum size is half the FFT size,
  // the highest frequencies aren't really important here
  var bandCount = Math.round(fftSize / 3);

  var analyser = void 0,
      spectrum = void 0;

  var lastVolumes = [];

  var rotateAmount = Math.PI * 2.0 / bandCount;

  // sets up mic/line-in input
  var _getMediaStream = function _getMediaStream(callback) {
    if (options.stream) {
      return nextTick(function () {
        callback(null, options.stream);
      });
    }

    getUserMedia({ video: false, audio: true }).then(function (stream) {
      callback(null, stream);
    }).catch(function (e) {
      callback(e);
    });
  };

  var _init = function _init(stream) {
    // sets up the application loop

    // initialize nodes
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();

    // set node properties and connect
    analyser.smoothingTimeConstant = 0.2;
    analyser.fftSize = fftSize;

    spectrum = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    // misc setup
    for (var i = 0; i < bandCount; i++) {
      lastVolumes.push(0);
    }

    // set up visualizer list
    var options = { cv: cv, ctx: ctx, bandCount: bandCount, rotateAmount: rotateAmount, lastVolumes: lastVolumes, image: image, fftSize: fftSize };
    visualizers.push(vizRadialArcs(options));
    visualizers.push(vizRadialBars(options));
    visualizers.push(vizFlyout(options));
    visualizers.push(vizSunburst(options));
    visualizers.push(vizBoxes(options));
    visualizers.push(vizSpikes(options));
    visualizers.push(vizImage(options));

    _recalculateSizes();
    _visualize();

    window.onresize = function () {
      _recalculateSizes();
    };
  };

  // add a new visualizer module
  var addVisualization = function addVisualization(viz) {
    var options = { cv: cv, ctx: ctx, bandCount: bandCount, rotateAmount: rotateAmount, lastVolumes: lastVolumes, image: image, fftSize: fftSize };
    visualizers.push(viz(options));
  };

  var showNextVisualization = function showNextVisualization() {
    currentViz = (currentViz + 1) % visualizers.length;
    _recalculateSizes();
  };

  var showVisualization = function showVisualization(idx) {
    if (idx < 0) idx = 0;
    if (idx >= visualizers.length) idx = visualizers.length - 1;

    currentViz = idx;
    _recalculateSizes();
  };

  // varies the current visualization
  var vary = function vary() {
    if (visualizers[currentViz].vary) {
      visualizers[currentViz].vary();
    }
  };

  var _recalculateSizes = function _recalculateSizes() {
    var ratio = window.devicePixelRatio || 1;

    var w = parent.innerWidth || parent.clientWidth;
    var h = parent.innerHeight || parent.clientHeight;

    cv.width = w * ratio;
    cv.height = h * ratio;
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    visualizers[currentViz].resize();
  };

  // called each audio frame, manages rendering of visualization
  var _visualize = function _visualize() {
    analyser.getByteFrequencyData(spectrum);

    // dampen falloff for some visualizations
    if (visualizers[currentViz].dampen === true) {
      for (var i = 0; i < spectrum.length; i++) {
        if (lastVolumes[i] > spectrum[i]) {
          spectrum[i] = (spectrum[i] + lastVolumes[i]) / 2;
        }
      }
    }

    visualizers[currentViz].draw(spectrum);

    raf(_visualize);
  };

  _getMediaStream(function (err, stream) {
    if (err) {
      console.log(err);
      throw new Error('Unable to start visualization. Make sure you\'re using Chrome or ' + 'Firefox with a microphone set up, and that you allow the page to access' + ' the microphone.');
    }
    _init(stream);
  });

  return Object.freeze({ addVisualization: addVisualization, showNextVisualization: showNextVisualization, showVisualization: showVisualization, vary: vary });
};

},{"./lib/vizBoxes":5,"./lib/vizFlyout":6,"./lib/vizImage":7,"./lib/vizRadialArcs":8,"./lib/vizRadialBars":9,"./lib/vizSpikes":10,"./lib/vizSunburst":11,"get-user-media-promise":13,"next-tick":14,"raf":17}],2:[function(require,module,exports){
'use strict';

var HSVtoRGB = require('./hsv-to-rgb');

var bigColorMap = [];
var bigColorMap2 = [];

function generateColors() {
  for (var hue = 0; hue < 360; hue++) {
    for (var brightness = 0; brightness < 100; brightness++) {
      var color = HSVtoRGB(hue / 360, 1, brightness / 100, true, false);
      bigColorMap.push(color);
      var color2 = HSVtoRGB(hue / 360, 1, brightness / 100, false, true);
      bigColorMap2.push(color2);
    }
  }
}

generateColors();

module.exports = {
  bigColorMap: bigColorMap,
  bigColorMap2: bigColorMap2
};

},{"./hsv-to-rgb":4}],3:[function(require,module,exports){
'use strict';

module.exports = function textureImage(image) {
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        grd = void 0;

    canvas.width = 300;
    canvas.height = 300;

    // Create gradient
    grd = ctx.createRadialGradient(150.000, 150.000, 0.000, 150.000, 150.000, 150.000);

    // Add colors
    grd.addColorStop(0.000, 'rgba(255, 255, 255, 1.000)');
    grd.addColorStop(1.000, 'rgba(255, 255, 255, 0.000)');

    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 300.000, 300.000);

    image.src = canvas.toDataURL();
};

},{}],4:[function(require,module,exports){
'use strict';

// http://stackoverflow.com/a/5624139
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

// http://stackoverflow.com/a/17243070
module.exports = function HSVtoRGB(h, s, v, hex, separate) {
  var r = void 0,
      g = void 0,
      b = void 0,
      i = void 0,
      f = void 0,
      p = void 0,
      q = void 0,
      t = void 0;
  if (h && s === undefined && v === undefined) {
    s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v, g = t, b = p;break;
    case 1:
      r = q, g = v, b = p;break;
    case 2:
      r = p, g = v, b = t;break;
    case 3:
      r = p, g = q, b = v;break;
    case 4:
      r = t, g = p, b = v;break;
    case 5:
      r = v, g = p, b = q;break;
  }
  r = Math.floor(r * 255);
  g = Math.floor(g * 255);
  b = Math.floor(b * 255);
  if (hex) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  } else if (separate) {
    return [r, g, b];
  } else {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
};

},{}],5:[function(require,module,exports){
'use strict';

var clamp = require('clamp');
var colorMap = require('./big-color-map');

// a wall of boxes that brighten
module.exports = function vizBoxes() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ctx = options.ctx,
      cv = options.cv;

  var dampen = true;
  var variant = 0;
  var variants = [[false], [true]];

  var grow = void 0,
      longestSide = void 0;
  var hueOffset = 0;

  var draw = function draw(spectrum) {
    hueOffset += 0.25;
    //spectrum = reduceBuckets(spectrum, 81)
    ctx.clearRect(0, 0, cv.width, cv.height);

    var size = 11;
    var i = 0;
    var x = Math.floor((size - 1) / 2);
    var y = x;
    var loop = 0;

    var dx = 0;
    var dy = 0;

    var cw = cv.width / size;
    var ch = cv.height / size;

    while (i < size * size) {
      switch (loop % 4) {
        case 0:
          dx = 1;dy = 0;break;
        case 1:
          dx = 0;dy = 1;break;
        case 2:
          dx = -1;dy = 0;break;
        case 3:
          dx = 0;dy = -1;break;
      }

      for (var j = 0; j < Math.floor(loop / 2) + 1; j++) {
        var hue = Math.floor(360.0 / (size * size) * i + hueOffset) % 360;
        var brightness = clamp(Math.floor(spectrum[i] / 1.5), 10, 99);
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];
        var intensity = 0.9;
        if (grow) {
          intensity = spectrum[i] / 255 / 4 + 0.65;
          //intensity = clamp(intensity, 0.1, 0.9)
        }
        ctx.fillRect(x * cw + cw / 2 * (1 - intensity), y * ch + ch / 2 * (1 - intensity), cw * intensity, ch * intensity);

        x += dx;
        y += dy;
        i++;
      }
      loop++;
    }

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  var resize = function resize() {
    longestSide = Math.max(cv.width, cv.height);
  };

  var vary = function vary() {
    variant = (variant + 1) % variants.length;
    grow = variants[variant][0];
  };

  vary();

  return Object.freeze({ dampen: dampen, vary: vary, resize: resize, draw: draw });
};

},{"./big-color-map":2,"clamp":12}],6:[function(require,module,exports){
'use strict';

var clamp = require('clamp');
var HSVtoRGB = require('./hsv-to-rgb');

// bars flying from center
module.exports = function vizFlyout() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ctx = options.ctx,
      cv = options.cv,
      bandCount = options.bandCount,
      rotateAmount = options.rotateAmount;


  var dampen = false;
  var allRotate = 0;
  var variant = 0;
  var longestSide = void 0,
      heightMultiplier = void 0,
      bars = void 0,
      offset = void 0,
      maxDistance = void 0;

  var variants = [[2], [3]];

  var distances = [];
  for (var i = 0; i < bandCount; i++) {
    distances.push(0);
  }

  var draw = function draw(spectrum) {
    ctx.save();
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate(allRotate);
    for (var _i = 0; _i < bandCount; _i++) {
      ctx.rotate(rotateAmount);
      ctx.lineWidth = 1 + spectrum[_i] / 256 * 5;

      var hue = 360.0 / bandCount * _i / 360.0;
      var brightness = clamp(spectrum[_i] * 1.0 / 150, 0.3, 1);
      ctx.strokeStyle = HSVtoRGB(hue, 1, brightness);

      distances[_i] += Math.max(50, spectrum[_i]) * heightMultiplier / 40;
      distances[_i] %= offset;
      for (var j = 0; j < bars; j++) {
        _arc(distances[_i] + j * offset, rotateAmount * .75);
      }
    }
    allRotate += 0.002;

    ctx.restore();
  };

  var resize = function resize() {
    var shortestSide = Math.min(cv.width, cv.height);
    longestSide = Math.max(cv.width, cv.height);
    heightMultiplier = 1.0 / 800 * shortestSide;

    maxDistance = longestSide * 0.71;
    offset = maxDistance / bars;
  };

  var vary = function vary() {
    variant = (variant + 1) % variants.length;
    bars = variants[variant][0];
  };

  var _arc = function _arc(distance, angle) {
    ctx.beginPath();
    ctx.arc(0, 0, distance, 0, angle);
    ctx.stroke();
    ctx.closePath();
  };

  vary();

  return Object.freeze({ dampen: dampen, resize: resize, draw: draw, vary: vary });
};

},{"./hsv-to-rgb":4,"clamp":12}],7:[function(require,module,exports){
'use strict';

var clamp = require('clamp');
var colorMap = require('./big-color-map');

// an image that's colored to the beat
module.exports = function vizImage() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ctx = options.ctx,
      cv = options.cv,
      bandCount = options.bandCount,
      image = options.image,
      fftSize = options.fftSize;


  var dampen = true;

  var width = void 0,
      height = void 0,
      tX = void 0,
      tY = void 0,
      scale = void 0,
      bufferImgData = void 0;

  var greyscaled = [];

  // offscreen image buffer
  var bufferCv = void 0,
      bufferCtx = void 0;

  var hueOffset = 0;

  var draw = function draw(spectrum) {
    // if the image hasn't loaded yet, don't render the visualization
    if (!bufferImgData) return;

    ctx.save();
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(tX, tY);
    hueOffset += 1;

    for (var i = 0; i < greyscaled.length; i++) {
      var frequency = greyscaled[i];
      var hue = Math.floor(spectrum[frequency] + hueOffset) % 360;

      var brightness = Math.sqrt(frequency / spectrum.length * (spectrum[frequency] / fftSize)) * 100;
      brightness = clamp(Math.floor(brightness), 0, 99);
      var color = colorMap.bigColorMap2[hue * 100 + brightness];
      bufferImgData.data[i * 4] = color[0];
      bufferImgData.data[i * 4 + 1] = color[1];
      bufferImgData.data[i * 4 + 2] = color[2];
    }

    bufferCtx.putImageData(bufferImgData, 0, 0);
    ctx.scale(scale, scale);
    ctx.drawImage(bufferCv, 0, 0);
    ctx.restore();
  };

  var resize = function resize() {
    bufferCv.width = width;
    bufferCv.height = height;

    var w = cv.parentElement.innerWidth || cv.parentElement.clientWidth;
    var h = cv.parentElement.innerHeight || cv.parentElement.clientHeight;

    var sW = Math.floor(w / width);
    var sH = Math.floor(h / height);
    scale = Math.min(sW, sH);

    if (scale === 0) {
      scale = 1;
    }

    scale *= window.devicePixelRatio || 1;

    tX = Math.floor((cv.width - width * scale) / 2);
    tY = Math.floor((cv.height - height * scale) / 2);

    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
  };

  var _generateGreyscaleBuckets = function _generateGreyscaleBuckets(image) {
    width = image.width;
    height = image.height;

    bufferCv = document.createElement('canvas');
    bufferCv.width = width;
    bufferCv.height = height;
    bufferCtx = bufferCv.getContext('2d');
    bufferCtx.clearRect(0, 0, width, height);
    bufferCtx.drawImage(image, 0, 0, width, height);

    var imageData = bufferCtx.getImageData(0, 0, width, height);

    // create temporary frame to be modified each draw call
    bufferImgData = bufferCtx.createImageData(width, height);

    // analyze each pixel
    for (var i = 0; i < width * height; i++) {
      var grey = Math.round(imageData.data[i * 4] * 0.2126 + imageData.data[i * 4 + 1] * 0.7152 + imageData.data[i * 4 + 2] * 0.0722);

      // fit to spectrum
      greyscaled.push(Math.round(clamp(grey, 0, 255) / 255 * bandCount));
      // set alpha, near-black parts are invisible
      bufferImgData.data[i * 4 + 3] = grey < 1 ? 0 : 255;
    }
  };

  // only load the image if the optional url is defined
  if (image) {
    var img = document.createElement('img');
    img.onload = function () {
      _generateGreyscaleBuckets(img);
      resize();
    };

    img.src = image;
  }

  return Object.freeze({ dampen: dampen, resize: resize, draw: draw });
};

},{"./big-color-map":2,"clamp":12}],8:[function(require,module,exports){
'use strict';

var clamp = require('clamp');
var colorMap = require('./big-color-map');

// arcs coming out from a circle
module.exports = function vizRadialArcs() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ctx = options.ctx,
      cv = options.cv,
      bandCount = options.bandCount,
      rotateAmount = options.rotateAmount;


  var dampen = true;
  var allRotate = 0;

  var centerRadius = void 0,
      heightMultiplier = void 0,
      gap = void 0,
      fade = void 0;

  var variant = 0;
  var variants = [[false, true], [true, false], [false, false]];

  var vary = function vary() {
    variant = (variant + 1) % variants.length;
    gap = variants[variant][0];
    fade = variants[variant][1];
  };

  var resize = function resize() {
    var shortestSide = Math.min(cv.width, cv.height);
    centerRadius = 85.0 / 800 * shortestSide;
    heightMultiplier = 1.0 / 800 * shortestSide;
  };

  var draw = function draw(spectrum) {

    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate(allRotate);
    for (var i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount);
      var hue = Math.floor(360.0 / bandCount * i);
      var brightness = 99;
      if (fade) {
        brightness = clamp(Math.floor(spectrum[i] / 1.5), 25, 99);
      }
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];

      ctx.beginPath();
      if (gap) {
        ctx.arc(0, 0, centerRadius + Math.max(spectrum[i] * heightMultiplier, 2), 0, rotateAmount / 2);
      } else {
        ctx.arc(0, 0, centerRadius + Math.max(spectrum[i] * heightMultiplier, 2), 0, rotateAmount + 0.005);
      }
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.closePath();
    }
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    allRotate += 0.002;

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  vary();

  return Object.freeze({ dampen: dampen, vary: vary, resize: resize, draw: draw });
};

},{"./big-color-map":2,"clamp":12}],9:[function(require,module,exports){
'use strict';

var clamp = require('clamp');
var colorMap = require('./big-color-map');

// bars coming out from a circle
module.exports = function vizRadialBars() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ctx = options.ctx,
      cv = options.cv,
      bandCount = options.bandCount,
      rotateAmount = options.rotateAmount,
      lastVolumes = options.lastVolumes;


  var bandWidth = void 0,
      fade = void 0,
      centerRadius = void 0,
      heightMultiplier = void 0;
  var dampen = true;
  var variant = 0;
  var variants = [[false], [true]];
  var allRotate = 0;

  var draw = function draw(spectrum) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate(allRotate);
    for (var i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount);
      var hue = Math.floor(360.0 / bandCount * i);
      if (fade) {
        var brightness = clamp(Math.floor(spectrum[i] / 1.5), 25, 99);
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];
        ctx.fillRect(-bandWidth / 2, centerRadius, bandWidth, Math.max(2, spectrum[i] * heightMultiplier));
      } else {
        var avg = 0;
        avg = (spectrum[i] + lastVolumes[i]) / 2;
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + 50];
        ctx.fillRect(-bandWidth / 2, centerRadius + avg, bandWidth, 2);
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + 99];
        ctx.fillRect(-bandWidth / 2, centerRadius, bandWidth, spectrum[i] * heightMultiplier);
      }
    }
    allRotate += 0.002;

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  var vary = function vary() {
    variant = (variant + 1) % variants.length;
    fade = variants[variant][0];
  };

  var resize = function resize() {
    var shortestSide = Math.min(cv.width, cv.height);
    centerRadius = 85.0 / 800 * shortestSide;
    heightMultiplier = 1.0 / 800 * shortestSide;
    bandWidth = Math.PI * 2 * centerRadius / bandCount;
  };

  vary();

  return Object.freeze({ dampen: dampen, vary: vary, resize: resize, draw: draw });
};

},{"./big-color-map":2,"clamp":12}],10:[function(require,module,exports){
'use strict';

var clamp = require('clamp');
var colorMap = require('./big-color-map');

// spikes coming from off screen

module.exports = function vizSpikes() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ctx = options.ctx,
      cv = options.cv,
      bandCount = options.bandCount,
      rotateAmount = options.rotateAmount;

  var dampen = true;

  var centerRadius = void 0,
      hypotenuse = void 0,
      shortestSide = void 0;
  var hueOffset = 0;

  var draw = function draw(spectrum) {
    hueOffset += 1;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate(Math.PI / 2);

    for (var i = 0; i < bandCount; i++) {
      var hue = Math.floor(360.0 / bandCount * i + hueOffset) % 360;
      var brightness = clamp(Math.floor(spectrum[i] / 1.5), 15, 99);
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];

      var inner = shortestSide / 2;
      inner = inner - (inner - centerRadius) * (spectrum[i] / 255);
      ctx.beginPath();
      ctx.arc(0, 0, hypotenuse / 2, -rotateAmount / 2, rotateAmount / 2);
      ctx.lineTo(inner, 0);
      ctx.fill();
      ctx.closePath();
      ctx.rotate(rotateAmount);
    }
    //allRotate += 0.002

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  var resize = function resize() {
    shortestSide = Math.min(cv.width, cv.height);
    hypotenuse = Math.sqrt(cv.width * cv.width + cv.height * cv.height);
    centerRadius = 85.0 / 800 * shortestSide;
  };

  return Object.freeze({ dampen: dampen, resize: resize, draw: draw });
};

},{"./big-color-map":2,"clamp":12}],11:[function(require,module,exports){
'use strict';

var clamp = require('clamp');
var colorMap = require('./big-color-map');
var texture = require('./create-gradient-texture');

/*******************************************************************************
* particles drawn as a cloud of smoke
*/
function Particle() {
  this.cx = -200;
  this.cy = -200;
  this.regenerate();
}

Particle.prototype.regenerate = function () {
  var angle = Math.random() * 2 * Math.PI;
  this.x = Math.cos(angle) * Math.random() * 500 + this.cx;
  this.y = Math.sin(angle) * Math.random() * 500 + this.cy;
  angle = Math.random() * 2 * Math.PI;
  this.dx = Math.cos(angle);
  this.dy = Math.sin(angle);
  this.intensity = 0;
  this.di = 0.01 + Math.random() / 50;
};

Particle.prototype.move = function () {
  this.x += this.dx * Math.random() * 4;
  this.y += this.dy * Math.random() * 4;
  this.intensity += this.di;
  if (this.intensity < 0) {
    this.regenerate();
  } else if (this.intensity > 1) {
    this.intensity = 1;
    this.di *= -1;
  }
};

// sunburst, optionally on clouds
module.exports = function vizSunburst() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ctx = options.ctx,
      cv = options.cv,
      bandCount = options.bandCount,
      rotateAmount = options.rotateAmount;


  var dampen = true;
  var variant = 0;
  var variants = [true, false];

  var allRotate = 0;
  var clouds = void 0,
      longestSide = void 0;

  var particleImage = document.createElement('img');
  texture(particleImage);

  var particles = [];
  for (var i = 0; i < 25; i++) {
    particles.push(new Particle());
  }

  var draw = function draw(spectrum) {
    ctx.save();

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);

    if (clouds) {
      ctx.globalCompositeOperation = 'screen';
      for (var _i = 0; _i < particles.length; _i++) {
        ctx.globalAlpha = particles[_i].intensity;
        ctx.drawImage(particleImage, particles[_i].x, particles[_i].y);
        particles[_i].move();
      }
    }

    ctx.rotate(allRotate);
    if (clouds) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 1.0;
    }

    for (var _i2 = 0; _i2 < bandCount; _i2++) {
      ctx.rotate(rotateAmount);
      var hue = Math.floor(360.0 / bandCount * _i2) % 360;
      var brightness = clamp(Math.floor(spectrum[_i2] / 2), 10, 99);
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];
      ctx.beginPath();
      ctx.arc(0, 0, longestSide * 1.5, 0, rotateAmount + 0.1);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.closePath();
    }
    allRotate += 0.002;

    ctx.restore();
  };

  var resize = function resize() {
    longestSide = Math.max(cv.width, cv.height);
  };

  var vary = function vary() {
    variant = (variant + 1) % variants.length;
    clouds = variants[variant];
  };

  vary();

  return Object.freeze({ dampen: dampen, vary: vary, resize: resize, draw: draw });
};

},{"./big-color-map":2,"./create-gradient-texture":3,"clamp":12}],12:[function(require,module,exports){
module.exports = clamp

function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)
}

},{}],13:[function(require,module,exports){
// loosely based on example code at https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
(function (root) {
  'use strict';

  /**
   * Error thrown when any required feature is missing (Promises, navigator, getUserMedia)
   * @constructor
   */
  function NotSupportedError() {
    this.name = 'NotSupportedError';
    this.message = 'getUserMedia is not implemented in this browser';
  }
  NotSupportedError.prototype = Error.prototype;

  /**
   * Fake Promise instance that behaves like a Promise except that it always rejects with a NotSupportedError.
   * Used for situations where there is no global Promise constructor.
   *
   * The message will report that the getUserMedia API is not available.
   * This is technically true because every browser that supports getUserMedia also supports promises.
   **
   * @see http://caniuse.com/#feat=stream
   * @see http://caniuse.com/#feat=promises
   * @constructor
   */
  function FakePromise() {
    // make it chainable like a real promise
    this.then = function() {
      return this;
    };

    // but always reject with an error
    var err = new NotSupportedError();
    this.catch = function(cb) {
      setTimeout(function () {
        cb(err);
      });
    }
  }

  var isPromiseSupported = typeof Promise !== 'undefined';

  // checks for root.navigator to enable server-side rendering of things that depend on this
  // (will need to be updated on client, but at least doesn't throw this way)
  var navigatorExists = typeof navigator !== "undefined";
  // gump = mondern promise-based interface
  // gum = old callback-based interface
  var gump = navigatorExists && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  var gum = navigatorExists && (navigator.getUserMedia || navigator.webkitGetUserMedia ||  navigator.mozGetUserMedia || navigator.msGetUserMedia);

  /**
   * Wrapper for navigator.mediaDevices.getUserMedia.
   * Always returns a Promise or Promise-like object, even in environments without a global Promise constructor
   *
   * @stream https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
   *
   * @param {Object} constraints - must include one or both of audio/video along with optional details for video
   * @param {Boolean} [constraints.audio] - include audio data in the stream
   * @param {Boolean|Object} [constraints.video] - include video data in the stream. May be a boolean or an object with additional constraints, see
   * @returns {Promise<MediaStream>} a promise that resolves to a MediaStream object
     */
  function getUserMedia(constraints) {
    // ensure that Promises are supported and we have a navigator object
    if (!isPromiseSupported) {
      return new FakePromise();
    }

    // Try the more modern, promise-based MediaDevices API first
    //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    if(gump) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }

    // fall back to the older method second, wrap it in a promise.
    return new Promise(function(resolve, reject) {
      // if navigator doesn't exist, then we can't use the getUserMedia API. (And probably aren't even in a browser.)
      // assuming it does, try getUserMedia and then all of the prefixed versions

      if (!gum) {
        return reject(new NotSupportedError())
      }
      gum.call(navigator, constraints, resolve, reject);
    });
  }

  getUserMedia.NotSupportedError = NotSupportedError;

  // eslint-disable-next-line no-implicit-coercion
  getUserMedia.isSupported = !!(isPromiseSupported && (gump || gum));

  // UMD, loosely based on https://github.com/umdjs/umd/blob/master/templates/returnExportsGlobal.js
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return getUserMedia;
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = getUserMedia;
  } else {
    // Browser globals
    // polyfill the MediaDevices API if it does not exist.
    root.navigator = root.navigator || {};
    root.nagivator.mediaDevices = root.navigator.mediaDevices || {};
    root.nagivator.mediaDevices.getUserMedia = root.nagivator.mediaDevices.getUserMedia || getUserMedia;
  }
}(this));

},{}],14:[function(require,module,exports){
(function (process){
'use strict';

var callable, byObserver;

callable = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

byObserver = function (Observer) {
	var node = document.createTextNode(''), queue, currentQueue, i = 0;
	new Observer(function () {
		var callback;
		if (!queue) {
			if (!currentQueue) return;
			queue = currentQueue;
		} else if (currentQueue) {
			queue = currentQueue.concat(queue);
		}
		currentQueue = queue;
		queue = null;
		if (typeof currentQueue === 'function') {
			callback = currentQueue;
			currentQueue = null;
			callback();
			return;
		}
		node.data = (i = ++i % 2); // Invoke other batch, to handle leftover callbacks in case of crash
		while (currentQueue) {
			callback = currentQueue.shift();
			if (!currentQueue.length) currentQueue = null;
			callback();
		}
	}).observe(node, { characterData: true });
	return function (fn) {
		callable(fn);
		if (queue) {
			if (typeof queue === 'function') queue = [queue, fn];
			else queue.push(fn);
			return;
		}
		queue = fn;
		node.data = (i = ++i % 2);
	};
};

module.exports = (function () {
	// Node.js
	if ((typeof process === 'object') && process && (typeof process.nextTick === 'function')) {
		return process.nextTick;
	}

	// MutationObserver
	if ((typeof document === 'object') && document) {
		if (typeof MutationObserver === 'function') return byObserver(MutationObserver);
		if (typeof WebKitMutationObserver === 'function') return byObserver(WebKitMutationObserver);
	}

	// W3C Draft
	// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	if (typeof setImmediate === 'function') {
		return function (cb) { setImmediate(callable(cb)); };
	}

	// Wide available standard
	if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
		return function (cb) { setTimeout(callable(cb), 0); };
	}

	return null;
}());

}).call(this,require('_process'))
},{"_process":16}],15:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.7.1
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

}).call(this,require('_process'))
},{"_process":16}],16:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],17:[function(require,module,exports){
(function (global){
var now = require('performance-now')
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function() {
  root.requestAnimationFrame = raf
  root.cancelAnimationFrame = caf
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"performance-now":15}]},{},[1])(1)
});