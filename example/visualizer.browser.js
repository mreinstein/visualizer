(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.visualizer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

const getUserMedia  = require('get-user-media-promise')
const raf           = require('raf')
const vizRadialArcs = require('./lib/vizRadialArcs')
const vizRadialBars = require('./lib/vizRadialBars')
const vizFlyout     = require('./lib/vizFlyout')
const vizSunburst   = require('./lib/vizSunburst')
const vizBoxes      = require('./lib/VizBoxes')
const vizSpikes     = require('./lib/vizSpikes')
const vizImage      = require('./lib/vizImage')


module.exports = function visualizer(options={}) {

  const parentEl = options.parentEl || window
  const cv = options.canvas
  const ctx = cv.getContext('2d')
  cv.width = window.innerWidth
  cv.height = window.innerHeight

  const image = options.image
  // TODO: support passing in mediaStream instead of instantiating each time

  const visualizers = []

  let currentViz = 0

  // for audio processing
  let analyser, spectrum

  const lastVolumes = []

  // sets up mic/line-in input
  let _getMediaStream = function(callback) {
    if (options.stream) {
      return setTimeout(function() {
        callback(null, options.stream)
      }, 0)
    }

    getUserMedia({ video: false, audio: true })
      .then(function(stream) {
        callback(null, stream)
      })
      .catch(function(e) {
        console.log('what happened', e)
        callback(e)
      })
  }


  let _init = function(stream) {
    // sets up the application loop

    // initialize nodes
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioCtx.createMediaStreamSource(stream)
    analyser = audioCtx.createAnalyser()

    // set node properties and connect
    analyser.smoothingTimeConstant = 0.2
    analyser.fftSize = 256
    const bandCount = Math.round(analyser.fftSize / 3)
    spectrum = new Uint8Array(analyser.frequencyBinCount)
    source.connect(analyser)

    // misc setup
    for (let i = 0; i < bandCount; i++) { lastVolumes.push(0) }

    const rotateAmount = (Math.PI * 2.0) / bandCount

    // set up visualizer list
    const options = { cv, ctx, bandCount, rotateAmount, lastVolumes, image }
    visualizers.push(vizRadialArcs(options))
    visualizers.push(vizRadialBars(options))
    visualizers.push(new vizFlyout(options))
    visualizers.push(new vizSunburst(options))
    visualizers.push(new vizBoxes(options))
    visualizers.push(new vizSpikes(options))
    visualizers.push(new vizImage(options))

    _recalculateSizes()
    _visualize()

    window.onresize = function() {
      _recalculateSizes()
    }
  }

  let showNextVisualization = function() {
    currentViz = (currentViz + 1) % visualizers.length
    _recalculateSizes()
  }

  let showVisualization = function(idx) {
    currentViz = idx

    if (idx < 0) idx = 0
    if (idx >= visualizers.length) idx = visualizers.length - 1
    _recalculateSizes()
  }

  // varies the current visualization
  let vary = function() {
    if (visualizers[currentViz].vary) {
      visualizers[currentViz].vary()
    }
  }

  let _recalculateSizes = function() {
    cv.width = parentEl.innerWidth
    cv.height = parentEl.innerHeight
    visualizers[currentViz].resize()
  }


  // called each audio frame, manages rendering of visualization
  let _visualize = function() {
    const fpsInterval = 1000 / 45

    setTimeout(function() {
      drawVisual = raf(_visualize)
      analyser.getByteFrequencyData(spectrum)

      // dampen falloff
      if (visualizers[currentViz].dampen == true) {
        for (let i = 0; i < spectrum.length; i++) {
          if (lastVolumes[i] > spectrum[i]) {
            spectrum[i] = (spectrum[i] + lastVolumes[i]) / 2
          }
        }
      }

      visualizers[currentViz].draw(spectrum)
    }, fpsInterval)
  }

  _getMediaStream(function(err, stream) {
    if(err) {
      console.log(err)
      throw new Error("Unable to start visualization. Make sure you're using Chrome or " +
        "Firefox with a microphone set up, and that you allow the page to access" +
        " the microphone.")
    }
    _init(stream)
  })

  return Object.freeze({ showNextVisualization, showVisualization, vary })
}

},{"./lib/VizBoxes":2,"./lib/vizFlyout":7,"./lib/vizImage":8,"./lib/vizRadialArcs":9,"./lib/vizRadialBars":10,"./lib/vizSpikes":11,"./lib/vizSunburst":12,"get-user-media-promise":13,"raf":16}],2:[function(require,module,exports){
var colorMap  = require('./big-color-map')
var constrain = require('./constrain')


// a wall of boxes that brighten
module.exports = function vizBoxes(options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options
  let dampen = true
  let variant = 0
  let variants = [[false], [true]]

  let grow
  let hueOffset = 0

  let draw = function(array) {
    hueOffset += 0.25
    //array = reduceBuckets(array, 81);
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
      switch(loop % 4) {
      case 0: dx = 1; dy = 0; break;
      case 1: dx = 0; dy = 1; break;
      case 2: dx = -1; dy = 0; break;
      case 3: dx = 0; dy = -1; break;
      }

      for (var j = 0; j < Math.floor(loop / 2) + 1; j++) {
        //console.log(i + ": [" + x + "," + y + "] " + (loop / 2 + 1));
        var hue = Math.floor(360.0 / (size * size) * i + hueOffset) % 360;
        var brightness = constrain(Math.floor(array[i] / 1.5), 10, 99);
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];
        var intensity = 0.9;
        if (grow) {
          intensity = array[i] / 255 / 4 + 0.65;
          //intensity = constrain(intensity, 0.1, 0.9);
        }
        ctx.fillRect(x * cw + cw / 2 * (1 - intensity),
          y * ch + ch / 2 * (1 - intensity), cw * intensity, ch * intensity);
        
        x += dx;
        y += dy;
        i++;
      }
      loop++;
    }

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  let resize = function() {
    longestSide = Math.max(cv.width, cv.height)
  }

  let vary = function() {
    variant = (variant + 1) % variants.length
    grow = variants[variant][0]
  }

  vary()

  return Object.freeze({ vary, resize, draw })
}

},{"./big-color-map":3,"./constrain":4}],3:[function(require,module,exports){
const HSVtoRGB = require('./hsv-to-rgb')


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

generateColors()

module.exports = {
  bigColorMap: bigColorMap,
  bigColorMap2: bigColorMap2
}

},{"./hsv-to-rgb":6}],4:[function(require,module,exports){
module.exports = function constrain(input, min, max) {
  if (input < min) {
    input = min
  } else if (input > max) {
    input = max
  }
  return input
}

},{}],5:[function(require,module,exports){


module.exports = function textureImage(image) {

  let canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      grd
      
  canvas.width = 300
  canvas.height = 300

  // Create gradient
  grd = ctx.createRadialGradient(150.000, 150.000, 0.000, 150.000, 150.000, 150.000)
  
  // Add colors
  grd.addColorStop(0.000, 'rgba(255, 255, 255, 1.000)')
  grd.addColorStop(1.000, 'rgba(255, 255, 255, 0.000)')
  
  // Fill with gradient
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, 300.000, 300.000)

  image.src = canvas.toDataURL()
}

},{}],6:[function(require,module,exports){
// http://stackoverflow.com/a/5624139
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// http://stackoverflow.com/a/17243070
module.exports = function HSVtoRGB(h, s, v, hex, separate) {
  var r, g, b, i, f, p, q, t;
  if (h && s === undefined && v === undefined) {
    s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
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
}

},{}],7:[function(require,module,exports){
const constrain = require('./constrain')
const HSVtoRGB  = require('./hsv-to-rgb')


// bars flying from center
module.exports = function vizFlyout(options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options

  let dampen = false
  let allRotate = 0
  let longestSide

  const distances = []
  for (var i = 0; i < bandCount; i++) {
    distances.push(0)
  }
  
  let draw = function(array) {
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate(allRotate);
    for (var i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount);
      ctx.lineWidth = 1 + (array[i] / 256 * 5);
      if (array[i] < 50) {
        distances[i] += (50 * heightMultiplier / 40);
      } else {
        distances[i] += (array[i] * heightMultiplier / 40);
      }

      if (distances[i] > (longestSide * 0.71)) {
        distances[i] = 0;
      } else {
        var hue = (360.0 / bandCount * i) / 360.0;
        var brightness = constrain(array[i] * 1.0 / 150, 0.3, 1);
        ctx.strokeStyle = HSVtoRGB(hue, 1, brightness);
        ctx.beginPath();
        ctx.arc(0, 0, distances[i], 0, rotateAmount * .75);
        ctx.stroke();
        ctx.closePath();
        var offset = longestSide * .71 / 2;
        if (distances[i] > longestSide * .71 / 2) {
          offset *= -1;  
        } 
        ctx.strokeStyle = HSVtoRGB(hue, 1, brightness);
        ctx.beginPath();
        ctx.arc(0, 0, distances[i] + offset, 0, rotateAmount * .75);
        ctx.stroke();
        ctx.closePath();
      }
    }
    allRotate += 0.002;

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  let resize = function() {
    const shortestSide = Math.min(cv.width, cv.height)
    longestSide = Math.max(cv.width, cv.height)
    const hypotenuse = Math.sqrt(cv.width * cv.width + cv.height * cv.height)
    heightMultiplier = 1.0 / 800 * shortestSide
  }

  return Object.freeze({ resize, draw })
}

},{"./constrain":4,"./hsv-to-rgb":6}],8:[function(require,module,exports){
const colorMap  = require('./big-color-map')
const constrain = require('./constrain')


// an image that's colored to the beat
module.exports = function vizImage(options={}) {
  let { ctx, cv, bandCount, rotateAmount, image } = options
  let dampen = true

  let width, height, frame, tX, tY, scale, greyscaled, greyscaled2

  let imageLoaded = false

  // create an offscreen image buffer
  const cv2 = document.createElement('canvas')
  let hueOffset = 0
  
  let draw = function(array) {
    // if the image hasn't loaded yet, don't render the visualization
    if (!imageLoaded) return

    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(tX, tY)
    hueOffset += 1

    for (let i = 0; i < greyscaled.length; i++) {
      let intensity = greyscaled[i]
      let hue = Math.floor(array[intensity] + hueOffset) % 360
      let brightness = constrain(Math.floor(array[intensity] / 1.5), 0, 99)
      let color = colorMap.bigColorMap2[hue * 100 + brightness]
      frame.data[i*4]   = color[0]
      frame.data[i*4+1] = color[1]
      frame.data[i*4+2] = color[2]
    }

    cv2.width = width
    cv2.height = height
    let buffer = cv2.getContext('2d')
    buffer.putImageData(frame, 0, 0)
    ctx.scale(scale, scale)
    ctx.drawImage(cv2, 0, 0)
    ctx.scale(1, 1)

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  let resize = function() {
    const sW = Math.floor(window.innerWidth / width)
    const sH = Math.floor(window.innerHeight / height)
    scale = Math.min(sW, sH)
    if (scale == 0) { scale = 1 }
    tX = Math.floor((window.innerWidth - (width * scale)) / 2),
    tY = Math.floor((window.innerHeight - (height * scale)) / 2)
  }

  let _generateGreyscaleBuckets = function(image, divisions) {
    width = image.width
    height = image.height

    cv2.width = width
    cv2.height = height
    let buffer = cv2.getContext("2d")
    buffer.clearRect(0, 0, width, height)
    buffer.drawImage(image, 0, 0, width, height)

    let imageData = buffer.getImageData(0, 0, width, height)
    greyscaled = []
    greyscaled2 = []
    for (var i = 0; i < divisions; i++) {
      greyscaled2.push([])
    }

    // analyze each pixel
    for (let j = 0; j < width * height; j++) {
      let grey = Math.round(imageData.data[j*4]   * 0.2126 +
                            imageData.data[j*4+1] * 0.7152 +
                            imageData.data[j*4+2] * 0.0722)

      // ensure we stay within 8-bit range
      if (grey < 0) { grey = 0 }
      else if (grey > 255) { grey = 255 }
      // force into 128 buckets (fix me later)
      grey = Math.floor((255 - grey) / 2)

      /*var interval = Math.floor(256 / divisions)
      grey = (grey - (grey % interval))*/
      greyscaled[j] = grey
      greyscaled2[grey].push([j % width, Math.floor(j / width)])
    }

    // create temporary frame to be modified each draw call
    frame = buffer.createImageData(width, height)
    for (let i = 0; i < width * height; i++) {
      frame.data[i*4+0] = 255
      frame.data[i*4+1] = 255 * (i % 4)
      frame.data[i*4+2] = 255
      frame.data[i*4+3] = 255
    }
  }

  let img = document.createElement('img')
  img.onload = function() {
    _generateGreyscaleBuckets(img, 128)
    imageLoaded = true
  }

  img.src = image
  resize()

  return Object.freeze({ resize, draw })
}

},{"./big-color-map":3,"./constrain":4}],9:[function(require,module,exports){
const colorMap  = require('./big-color-map')
const constrain = require('./constrain')


// arcs coming out from a circle
module.exports = function vizRadialArcs(options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options
  
  let dampen = true
  let allRotate = 0
 
  let centerRadius, heightMultiplier, gap, fade

  let variant = 0
  let variants = [[false, true], [true, false], [false, false]]

  let vary = function() {
    variant = (variant + 1) % variants.length
    gap = variants[variant][0]
    fade = variants[variant][1]
  }

  let resize = function() {
    const shortestSide = Math.min(cv.width, cv.height)
    const longestSide = Math.max(cv.width, cv.height)
    const hypotenuse = Math.sqrt(cv.width * cv.width + cv.height * cv.height)
    centerRadius = 85.0 / 800 * shortestSide
    heightMultiplier = 1.0 / 800 * shortestSide
  }

  let draw = function(spectrum) {

    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)
    ctx.rotate(allRotate)
    for (var i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      var hue = Math.floor(360.0 / bandCount * i)
      var brightness = 99
      if (fade) {
        var brightness = constrain(Math.floor(spectrum[i] / 1.5), 25, 99)
      }
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]

      ctx.beginPath()
      if (gap) {
        ctx.arc(0, 0, centerRadius + Math.max(spectrum[i] * heightMultiplier, 2),
          0, rotateAmount / 2)
      } else {
        ctx.arc(0, 0, centerRadius + Math.max(spectrum[i] * heightMultiplier, 2),
          0, rotateAmount + 0.005)
      }
      ctx.lineTo(0, 0)
      ctx.fill()
      ctx.closePath()
    }
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(0, 0, centerRadius, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()
    allRotate += 0.002

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  vary()

  return Object.freeze({ vary, resize, draw })
}

},{"./big-color-map":3,"./constrain":4}],10:[function(require,module,exports){
const colorMap  = require('./big-color-map')
const constrain = require('./constrain')


// bars coming out from a circle
module.exports = function vizRadialBars(options={}) {
  let { ctx, cv, bandCount, rotateAmount, lastVolumes } = options

  let dampen = true
  let bandWidth
  let variant = 0
  let variants = [[false], [true]]
  let allRotate = 0

  let draw = function(spectrum) {
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)
    ctx.rotate(allRotate)
    for (var i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      var hue = Math.floor(360.0 / bandCount * i)
      if (fade) {
        var brightness = constrain(Math.floor(spectrum[i] / 1.5), 25, 99)
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]
        ctx.fillRect(-bandWidth / 2, centerRadius, bandWidth,
          Math.max(2, spectrum[i] * heightMultiplier))
      } else {
        var avg = 0
        avg = (spectrum[i] + lastVolumes[i]) / 2
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + 50]
        ctx.fillRect(-bandWidth / 2, centerRadius + avg, bandWidth, 2)
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + 99]
        ctx.fillRect(-bandWidth / 2, centerRadius, bandWidth,
          spectrum[i] * heightMultiplier)
      }
    }
    allRotate += 0.002

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  let vary = function() {
    variant = (variant + 1) % variants.length
    fade = variants[variant][0]
  }

  let resize = function() {
    const shortestSide = Math.min(cv.width, cv.height)
    const longestSide = Math.max(cv.width, cv.height)
    const hypotenuse = Math.sqrt(cv.width * cv.width + cv.height * cv.height)
    centerRadius = 85.0 / 800 * shortestSide
    heightMultiplier = 1.0 / 800 * shortestSide
    bandWidth = Math.PI * 2 * centerRadius / bandCount
  }

  vary()
  
  return Object.freeze({ vary, resize, draw })
}

},{"./big-color-map":3,"./constrain":4}],11:[function(require,module,exports){
var colorMap  = require('./big-color-map')
var constrain = require('./constrain')


// spikes coming from off screen

module.exports = function vizSpikes(options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options
  let dampen = true

  let centerRadius, hypotenuse, shortestSide
  let hueOffset = 0

  let draw = function(array) {
    hueOffset += 1;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate(Math.PI / 2);
    
    for (var i = 0; i < bandCount; i++) {
      var hue = Math.floor(360.0 / bandCount * i + hueOffset) % 360;
      var brightness = constrain(Math.floor(array[i] / 1.5), 15, 99);
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];

      var inner = shortestSide / 2;
      inner = inner - (inner - centerRadius) * (array[i] / 255);
      ctx.beginPath();
      ctx.arc(0, 0, hypotenuse / 2, -rotateAmount / 2, rotateAmount / 2);
      ctx.lineTo(inner, 0);
      ctx.fill();
      ctx.closePath();
      ctx.rotate(rotateAmount);
    }
    //allRotate += 0.002;

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  let resize = function() {
    shortestSide = Math.min(cv.width, cv.height)
    hypotenuse = Math.sqrt(cv.width * cv.width + cv.height * cv.height)
    centerRadius = 85.0 / 800 * shortestSide
  }

  return Object.freeze({ resize, draw })
}

},{"./big-color-map":3,"./constrain":4}],12:[function(require,module,exports){
const colorMap  = require('./big-color-map')
const constrain = require('./constrain')
const texture   = require('./create-gradient-texture')


/*******************************************************************************
* particles drawn as a cloud of smoke
*/
function Particle() {
  this.cx = -200
  this.cy = -200
  this.regenerate()
}

Particle.prototype.regenerate = function() {
  var angle = Math.random() * 2 * Math.PI
  this.x = Math.cos(angle) * Math.random() * 500 + this.cx
  this.y = Math.sin(angle) * Math.random() * 500 + this.cy
  angle = Math.random() * 2 * Math.PI
  this.dx = Math.cos(angle)
  this.dy = Math.sin(angle)
  this.intensity = 0
  this.di = 0.01 + Math.random() / 50
  }

Particle.prototype.move = function() {
  this.x += this.dx * Math.random() * 4
  this.y += this.dy * Math.random() * 4
  this.intensity += this.di
  if (this.intensity < 0) {
    this.regenerate()
  } else if (this.intensity > 1) {
    this.intensity = 1
    this.di *= -1
  }
}

// sunburst, optionally on clouds
module.exports = function vizSunburst(options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options

  let dampen = true
  let variant = 0
  let variants = [[true], [false]]

  let allRotate = 0
  let clouds, longestSide

  /*
  cv.width = 200
  cv.height = 200
  ctx = cv.getContext("2d")
  ctx.clearRect(0, 0, cv.width, cv.height)
  var grd = ctx.createRadialGradient(100, 100, 10, 100, 100, 100)
  grd.addColorStop(0,"#aaaaaa")
  grd.addColorStop(1,"#000000")
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, 200, 200)
  var src = cv.toDataURL()
  particleImage = new Image()
  particleImage.src = src
  */
  let particleImage = document.createElement('img')
  texture(particleImage)
  
  let particles = []
  for (var i = 0; i < 25; i++) {
    particles.push(new Particle())
  }

  let draw = function(array) {
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)
    
    if (clouds) {
      ctx.globalCompositeOperation = "screen"
      for (var i = 0; i < particles.length; i++) {
        ctx.globalAlpha = particles[i].intensity
        ctx.drawImage(particleImage, particles[i].x,
          particles[i].y)
        particles[i].move()
      }
    }
    
    ctx.rotate(allRotate)
    if (clouds) {
      ctx.globalCompositeOperation = "multiply"
      ctx.globalAlpha = 1.0
    }
    
    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      var hue = Math.floor(360.0 / bandCount * i) % 360
      var brightness = constrain(Math.floor(array[i] / 2), 10, 99)
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]
      ctx.beginPath()
      ctx.arc(0, 0, longestSide * 1.5, 0, rotateAmount + 0.1)
      ctx.lineTo(0, 0)
      ctx.fill()
      ctx.closePath()
    }
    allRotate += 0.002

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  let resize = function() {
    longestSide = Math.max(cv.width, cv.height)
  }

  let vary = function() {
    variant = (variant + 1) % variants.length

    // blending is horrifically slow on Firefox, so skip that variant
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      variant = 1
    }
  
    clouds = variants[variant][0]
  }

  vary()

  return Object.freeze({ vary, resize, draw })
}

},{"./big-color-map":3,"./constrain":4,"./create-gradient-texture":5}],13:[function(require,module,exports){
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
},{"_process":15}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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
},{"performance-now":14}]},{},[1])(1)
});