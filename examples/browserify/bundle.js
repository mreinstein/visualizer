(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// this is the entry point for the front end code built with browserify

// normally you'd require this as require('visualizer.js') in your code
// but instead we use relative path here
const visualizer = require('../../')

const options = {
  image: 'data:image/png;base64,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'
}

// instantiate the visualizer module. specifying no parent container
// implicitly adds it the body and take up full width and height
const viz = visualizer(options)

const bodyElement = document.getElementsByTagName('body')[0]

bodyElement.onkeyup = function(e) {
  let ev = e || event

  if (ev.keyCode >= 49 && ev.keyCode < 58) {
    viz.showVisualization(ev.keyCode - 49)
  } else if (ev.keyCode == 187 || ev.keyCode == 61) {
    viz.vary()
  }
}

bodyElement.onclick = function() {
  viz.showNextVisualization()
}

},{"../../":3}],2:[function(require,module,exports){
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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
'use strict'

const getUserMedia  = require('get-user-media-promise')
const nextTick      = require('next-tick-2')
const raf           = require('raf')
const vizRadialArcs = require('./lib/vizRadialArcs')
const vizRadialBars = require('./lib/vizRadialBars')
const vizFlyout     = require('./lib/vizFlyout')
const vizSunburst   = require('./lib/vizSunburst')
const vizBoxes      = require('./lib/vizBoxes')
const vizSpikes     = require('./lib/vizSpikes')
const vizImage      = require('./lib/vizImage')
const vizVertBars   = require('./lib/vizVerticalBars')


module.exports = function visualizer(options={}) {
  const parent = options.parent ? document.querySelector(options.parent) : window
  const cv = document.createElement('canvas')
  if (!options.parent) {
    cv.style.position = 'absolute'
    cv.style.left = '0'
    cv.style.top = '0'
    document.body.appendChild(cv)
  }
  else {
    parent.appendChild(cv)
  }

  const ctx = cv.getContext('2d')

  const image = options.image

  const visualizers = []

  let currentViz = 0

  // for audio processing
  //let analyseInterval = 1000 / 30
  const fftSize = 256

  // although the actual spectrum size is half the FFT size,
  // the highest frequencies aren't really important here
  const bandCount = Math.round(fftSize / 3)

  let analyser, spectrum

  const lastVolumes = []

  const rotateAmount = (Math.PI * 2.0) / bandCount

  // sets up mic/line-in input
  const _getMediaStream = function(callback) {
    if (options.stream)
      return nextTick(function() {
        callback(null, options.stream)
      })

    getUserMedia({ video: false, audio: true })
      .then(function(stream) {
        callback(null, stream)
      })
      .catch(function(e) {
        callback(e)
      })
  }


  const _init = function(stream) {
    // sets up the application loop

    // initialize nodes
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioCtx.createMediaStreamSource(stream)
    analyser = audioCtx.createAnalyser()

    // set node properties and connect
    analyser.smoothingTimeConstant = 0.2
    analyser.fftSize = fftSize

    spectrum = new Uint8Array(analyser.frequencyBinCount)
    source.connect(analyser)

    // misc setup
    for (let i = 0; i < bandCount; i++)
      lastVolumes.push(0)

    // set up visualizer list
    const options = { cv, ctx, bandCount, rotateAmount, lastVolumes, image, fftSize }
    visualizers.push(vizVertBars(options))
    visualizers.push(vizRadialArcs(options))
    visualizers.push(vizRadialBars(options))
    visualizers.push(vizFlyout(options))
    visualizers.push(vizSunburst(options))
    visualizers.push(vizBoxes(options))
    visualizers.push(vizSpikes(options))
    visualizers.push(vizImage(options))

    _recalculateSizes()
    _visualize()

    window.onresize = function() {
      _recalculateSizes()
    }
  }


  // add a new visualizer module
  const addVisualization = function(viz) {
    const options = { cv, ctx, bandCount, rotateAmount, lastVolumes, image, fftSize }
    visualizers.push(viz(options))
  }


  const showNextVisualization = function() {
    currentViz = (currentViz + 1) % visualizers.length
    _recalculateSizes()
  }


  const showVisualization = function(idx) {
    if (idx < 0)
      idx = 0
    if (idx >= visualizers.length)
      idx = visualizers.length - 1

    currentViz = idx
    _recalculateSizes()
  }


  // varies the current visualization
  const vary = function() {
    if (visualizers[currentViz].vary)
      visualizers[currentViz].vary()
  }


  const _recalculateSizes = function() {
    const ratio = window.devicePixelRatio || 1

    const w = parent.innerWidth || parent.clientWidth
    const h = parent.innerHeight || parent.clientHeight

    cv.width = w * ratio
    cv.height = h * ratio
    cv.style.width = w + 'px'
    cv.style.height = h + 'px'
    visualizers[currentViz].resize()
  }


  // called each audio frame, manages rendering of visualization
  const _visualize = function() {
    analyser.getByteFrequencyData(spectrum)

    // dampen falloff for some visualizations
    if (visualizers[currentViz].dampen === true)
      for (let i = 0; i < spectrum.length; i++)
        if (lastVolumes[i] > spectrum[i])
          spectrum[i] = (spectrum[i] + lastVolumes[i]) / 2

    visualizers[currentViz].draw(spectrum)

    raf(_visualize)
  }


  _getMediaStream(function(err, stream) {
    if(err) {
      console.log(err)
      throw new Error('Unable to start visualization. Make sure you\'re using Chrome or ' +
        'Firefox with a microphone set up, and that you allow the page to access' +
        ' the microphone.')
    }
    _init(stream)
  })

  return Object.freeze({ addVisualization, showNextVisualization, showVisualization, vary })
}

},{"./lib/vizBoxes":7,"./lib/vizFlyout":8,"./lib/vizImage":9,"./lib/vizRadialArcs":10,"./lib/vizRadialBars":11,"./lib/vizSpikes":12,"./lib/vizSunburst":13,"./lib/vizVerticalBars":14,"get-user-media-promise":16,"next-tick-2":17,"raf":19}],4:[function(require,module,exports){
'use strict'

const HSVtoRGB = require('./hsv-to-rgb')


const bigColorMap = []
const bigColorMap2 = []


function generateColors() {
  for (let hue = 0; hue < 360; hue++) {
    for (let brightness = 0; brightness < 100; brightness++) {
      const color = HSVtoRGB(hue / 360, 1, brightness / 100, true, false)
      bigColorMap.push(color)
      const color2 = HSVtoRGB(hue / 360, 1, brightness / 100, false, true)
      bigColorMap2.push(color2)
    }
  }
}


generateColors()

module.exports = {
  bigColorMap: bigColorMap,
  bigColorMap2: bigColorMap2
}

},{"./hsv-to-rgb":6}],5:[function(require,module,exports){
'use strict'

module.exports = function textureImage(image) {
  const canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d')

  canvas.width = 300
  canvas.height = 300

  // Create gradient
  const grd = ctx.createRadialGradient(150.000, 150.000, 0.000, 150.000, 150.000, 150.000)

  // Add colors
  grd.addColorStop(0.000, 'rgba(255, 255, 255, 1.000)')
  grd.addColorStop(1.000, 'rgba(255, 255, 255, 0.000)')

  // Fill with gradient
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, 300.000, 300.000)

  image.src = canvas.toDataURL()
}

},{}],6:[function(require,module,exports){
'use strict'

// http://stackoverflow.com/a/5624139
function componentToHex(c) {
    const hex = c.toString(16)
    return hex.length === 1 ? '0' + hex : hex
}

// http://stackoverflow.com/a/17243070
module.exports = function HSVtoRGB(h, s, v, hex, separate) {
  let r, g, b, i, f, p, q, t
  if (h && s === undefined && v === undefined) {
    s = h.s, v = h.v, h = h.h
  }
  i = Math.floor(h * 6)
  f = h * 6 - i
  p = v * (1 - s)
  q = v * (1 - f * s)
  t = v * (1 - (1 - f) * s)
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  r = Math.floor(r * 255)
  g = Math.floor(g * 255)
  b = Math.floor(b * 255)
  if (hex)
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
  else if (separate)
    return [r, g, b]
  else
    return 'rgb(' + r + ',' + g + ',' + b + ')'
}

},{}],7:[function(require,module,exports){
'use strict'

const clamp    = require('clamp')
const colorMap = require('./big-color-map')


// a wall of boxes that brighten
module.exports = function vizBoxes(options={}) {
  let { ctx, cv } = options
  const dampen = true
  let variant = 0
  let variants = [[false], [true]]

  let grow, longestSide
  let hueOffset = 0


  const draw = function(spectrum) {
    hueOffset += 0.25
    //spectrum = reduceBuckets(spectrum, 81)
    ctx.clearRect(0, 0, cv.width, cv.height)

    let size = 11
    let i = 0
    let x = Math.floor((size - 1) / 2)
    let y = x
    let loop = 0

    let dx = 0
    let dy = 0

    let cw = cv.width / size
    let ch = cv.height / size

    while (i < size * size) {
      switch(loop % 4) {
        case 0: dx = 1; dy = 0; break;
        case 1: dx = 0; dy = 1; break;
        case 2: dx = -1; dy = 0; break;
        case 3: dx = 0; dy = -1; break;
      }

      for (var j = 0; j < Math.floor(loop / 2) + 1; j++) {
        let hue = Math.floor(360.0 / (size * size) * i + hueOffset) % 360
        let brightness = clamp(Math.floor(spectrum[i] / 1.5), 10, 99)
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]
        let intensity = 0.9
        if (grow)
          intensity = spectrum[i] / 255 / 4 + 0.65
        ctx.fillRect(x * cw + cw / 2 * (1 - intensity),
          y * ch + ch / 2 * (1 - intensity), cw * intensity, ch * intensity)

        x += dx
        y += dy
        i++
      }
      loop++
    }

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }


  const resize = function() {
    longestSide = Math.max(cv.width, cv.height)
  }


  const vary = function() {
    variant = (variant + 1) % variants.length
    grow = variants[variant][0]
  }


  vary()

  return Object.freeze({ dampen, vary, resize, draw })
}

},{"./big-color-map":4,"clamp":15}],8:[function(require,module,exports){
'use strict'

const clamp    = require('clamp')
const HSVtoRGB = require('./hsv-to-rgb')


// bars flying from center
module.exports = function vizFlyout(options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options

  const dampen = false
  let allRotate = 0
  let variant = 0
  let longestSide, heightMultiplier, bars, offset, maxDistance

  const variants = [[2], [3]]

  const distances = []
  for (let i = 0; i < bandCount; i++)
    distances.push(0)


  const draw = function(spectrum) {
    ctx.save()
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)
    ctx.rotate(allRotate)
    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      ctx.lineWidth = 1 + (spectrum[i] / 256 * 5)

      let hue = (360.0 / bandCount * i) / 360.0
      let brightness = clamp(spectrum[i] * 1.0 / 150, 0.3, 1)
      ctx.strokeStyle = HSVtoRGB(hue, 1, brightness)

      distances[i] += (Math.max(50, spectrum[i]) * heightMultiplier / 40)
      distances[i] %= offset
      for (var j = 0; j < bars; j++)
        _arc(distances[i] + j * offset, rotateAmount * .75)
    }
    allRotate += 0.002

    ctx.restore()
  }


  const resize = function() {
    const shortestSide = Math.min(cv.width, cv.height)
    longestSide = Math.max(cv.width, cv.height)
    heightMultiplier = 1.0 / 800 * shortestSide

    maxDistance = longestSide * 0.71
    offset = maxDistance / bars
  }


  const vary = function() {
    variant = (variant + 1) % variants.length
    bars = variants[variant][0]
  }


  const _arc = function(distance, angle) {
    ctx.beginPath()
    ctx.arc(0, 0, distance, 0, angle)
    ctx.stroke()
    ctx.closePath()
  }


  vary()

  return Object.freeze({ dampen, resize, draw, vary })
}

},{"./hsv-to-rgb":6,"clamp":15}],9:[function(require,module,exports){
'use strict'

const clamp    = require('clamp')
const colorMap = require('./big-color-map')


// an image that's colored to the beat
module.exports = function vizImage(options={}) {
  let { ctx, cv, bandCount, image, fftSize } = options

  const dampen = true

  let width, height, tX, tY, scale, bufferImgData

  const greyscaled = []

  // offscreen image buffer
  let bufferCv, bufferCtx

  let hueOffset = 0


  const draw = function(spectrum) {
    // if the image hasn't loaded yet, don't render the visualization
    if (!bufferImgData)
      return

    ctx.save()
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(tX, tY)
    hueOffset += 1

    for (let i = 0; i < greyscaled.length; i++) {
      let frequency = greyscaled[i]
      let hue = Math.floor(spectrum[frequency] + hueOffset) % 360

      let brightness = Math.sqrt((frequency / spectrum.length) * (spectrum[frequency] / fftSize)) * 100
      brightness = clamp(Math.floor(brightness), 0, 99)
      let color = colorMap.bigColorMap2[hue * 100 + brightness]
      bufferImgData.data[i*4]   = color[0]
      bufferImgData.data[i*4+1] = color[1]
      bufferImgData.data[i*4+2] = color[2]
    }

    bufferCtx.putImageData(bufferImgData, 0, 0)
    ctx.scale(scale, scale)
    ctx.drawImage(bufferCv, 0, 0)
    ctx.restore()
  }


  const resize = function() {
    bufferCv.width = width
    bufferCv.height = height

    const w = cv.parentElement.innerWidth || cv.parentElement.clientWidth
    const h = cv.parentElement.innerHeight || cv.parentElement.clientHeight

    const sW = Math.floor(w / width)
    const sH = Math.floor(h / height)
    scale = Math.min(sW, sH)

    if (scale === 0)
      scale = 1

    scale *= (window.devicePixelRatio || 1)

    tX = Math.floor((cv.width - (width * scale)) / 2)
    tY = Math.floor((cv.height - (height * scale)) / 2)

    ctx.webkitImageSmoothingEnabled = false
    ctx.msImageSmoothingEnabled = false
    ctx.imageSmoothingEnabled = false
  }


  const _generateGreyscaleBuckets = function(image) {
    width = image.width
    height = image.height

    bufferCv = document.createElement('canvas')
    bufferCv.width = width
    bufferCv.height = height
    bufferCtx = bufferCv.getContext('2d')
    bufferCtx.clearRect(0, 0, width, height)
    bufferCtx.drawImage(image, 0, 0, width, height)

    const imageData = bufferCtx.getImageData(0, 0, width, height)

    // create temporary frame to be modified each draw call
    bufferImgData = bufferCtx.createImageData(width, height)

    // analyze each pixel
    for (let i = 0; i < width * height; i++) {
      let grey = Math.round(imageData.data[i*4]   * 0.2126 +
                            imageData.data[i*4+1] * 0.7152 +
                            imageData.data[i*4+2] * 0.0722)

      // fit to spectrum
      greyscaled.push(Math.round(clamp(grey, 0, 255) / 255 * bandCount))
      // set alpha, near-black parts are invisible
      bufferImgData.data[i*4+3] = (grey < 1) ? 0 : 255
    }
  }


  // only load the image if the optional url is defined
  if(image) {
    let img = document.createElement('img')
    img.onload = function() {
      _generateGreyscaleBuckets(img)
      resize()
    }

    img.src = image
  }

  return Object.freeze({ dampen, resize, draw })
}

},{"./big-color-map":4,"clamp":15}],10:[function(require,module,exports){
'use strict'

const clamp    = require('clamp')
const colorMap = require('./big-color-map')


// arcs coming out from a circle
module.exports = function vizRadialArcs(options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options

  const dampen = true
  let allRotate = 0

  let centerRadius, heightMultiplier, gap, fade

  let variant = 0
  const variants = [[false, true], [true, false], [false, false]]


  const vary = function() {
    variant = (variant + 1) % variants.length
    gap = variants[variant][0]
    fade = variants[variant][1]
  }


  const resize = function() {
    const shortestSide = Math.min(cv.width, cv.height)
    centerRadius = 85.0 / 800 * shortestSide
    heightMultiplier = 1.0 / 800 * shortestSide
  }


  const draw = function(spectrum) {
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)
    ctx.rotate(allRotate)
    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      let hue = Math.floor(360.0 / bandCount * i)
      let brightness = 99
      if (fade)
        brightness = clamp(Math.floor(spectrum[i] / 1.5), 25, 99)

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

  return Object.freeze({ dampen, vary, resize, draw })
}

},{"./big-color-map":4,"clamp":15}],11:[function(require,module,exports){
'use strict'

const clamp    = require('clamp')
const colorMap = require('./big-color-map')


// bars coming out from a circle
module.exports = function vizRadialBars(options={}) {
  let { ctx, cv, bandCount, rotateAmount, lastVolumes } = options

  let bandWidth, fade, centerRadius, heightMultiplier
  const dampen = true
  let variant = 0
  let variants = [[false], [true]]
  let allRotate = 0


  const draw = function(spectrum) {
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)
    ctx.rotate(allRotate)
    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      let hue = Math.floor(360.0 / bandCount * i)
      if (fade) {
        let brightness = clamp(Math.floor(spectrum[i] / 1.5), 25, 99)
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]
        ctx.fillRect(-bandWidth / 2, centerRadius, bandWidth,
          Math.max(2, spectrum[i] * heightMultiplier))
      } else {
        let avg = 0
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

  const vary = function() {
    variant = (variant + 1) % variants.length
    fade = variants[variant][0]
  }

  const resize = function() {
    const shortestSide = Math.min(cv.width, cv.height)
    centerRadius = 85.0 / 800 * shortestSide
    heightMultiplier = 1.0 / 800 * shortestSide
    bandWidth = Math.PI * 2 * centerRadius / bandCount
  }

  vary()

  return Object.freeze({ dampen, vary, resize, draw })
}

},{"./big-color-map":4,"clamp":15}],12:[function(require,module,exports){
'use strict'

const clamp    = require('clamp')
const colorMap = require('./big-color-map')


// spikes coming from off screen

module.exports = function vizSpikes(options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options
  const dampen = true

  let centerRadius, hypotenuse, shortestSide
  let hueOffset = 0


  const draw = function(spectrum) {
    hueOffset += 1
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)
    ctx.rotate(Math.PI / 2)

    for (let i = 0; i < bandCount; i++) {
      let hue = Math.floor(360.0 / bandCount * i + hueOffset) % 360
      let brightness = clamp(Math.floor(spectrum[i] / 1.5), 15, 99)
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]

      let inner = shortestSide / 2
      inner = inner - (inner - centerRadius) * (spectrum[i] / 255)
      ctx.beginPath()
      ctx.arc(0, 0, hypotenuse / 2, -rotateAmount / 2, rotateAmount / 2)
      ctx.lineTo(inner, 0)
      ctx.fill()
      ctx.closePath()
      ctx.rotate(rotateAmount)
    }
    //allRotate += 0.002

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }


  const resize = function() {
    shortestSide = Math.min(cv.width, cv.height)
    hypotenuse = Math.sqrt(cv.width * cv.width + cv.height * cv.height)
    centerRadius = 85.0 / 800 * shortestSide
  }


  return Object.freeze({ dampen, resize, draw })
}

},{"./big-color-map":4,"clamp":15}],13:[function(require,module,exports){
'use strict'

const clamp    = require('clamp')
const colorMap = require('./big-color-map')
const texture  = require('./create-gradient-texture')


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

  const dampen = true
  let variant = 0
  let variants = [ true, false ]

  let allRotate = 0
  let clouds, longestSide

  const particleImage = document.createElement('img')
  texture(particleImage)

  const particles = []
  for (let i = 0; i < 25; i++)
    particles.push(new Particle())


  const draw = function(spectrum) {
    ctx.save()

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)

    if (clouds) {
      ctx.globalCompositeOperation = 'screen'
      for (let i = 0; i < particles.length; i++) {
        ctx.globalAlpha = particles[i].intensity
        ctx.drawImage(particleImage, particles[i].x,
          particles[i].y)
        particles[i].move()
      }
    }

    ctx.rotate(allRotate)
    if (clouds) {
      ctx.globalCompositeOperation = 'multiply'
      ctx.globalAlpha = 1.0
    }

    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      let hue = Math.floor(360.0 / bandCount * i) % 360
      let brightness = clamp(Math.floor(spectrum[i] / 2), 10, 99)
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]
      ctx.beginPath()
      ctx.arc(0, 0, longestSide * 1.5, 0, rotateAmount + 0.1)
      ctx.lineTo(0, 0)
      ctx.fill()
      ctx.closePath()
    }
    allRotate += 0.002

    ctx.restore()
  }


  const resize = function() {
    longestSide = Math.max(cv.width, cv.height)
  }


  const vary = function() {
    variant = (variant + 1) % variants.length
    clouds = variants[variant]
  }


  vary()

  return Object.freeze({ dampen, vary, resize, draw })
}

},{"./big-color-map":4,"./create-gradient-texture":5,"clamp":15}],14:[function(require,module,exports){
'use strict'

const clamp    = require('clamp')
const colorMap = require('./big-color-map')


module.exports = function vizVerticalBars(options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options

  const dampen = true
  let allRotate = 0

  let centerRadius, heightMultiplier, gap, fade

  let variant = 0
  const variants = [[false, true], [true, false], [false, false]]


  const vary = function() {
    variant = (variant + 1) % variants.length
    gap = variants[variant][0]
    fade = variants[variant][1]
  }


  const resize = function() {
    const shortestSide = Math.min(cv.width, cv.height)
    centerRadius = 85.0 / 800 * shortestSide
    heightMultiplier = 1.0 / 800 * shortestSide
  }


  const draw = function(spectrum) {
    ctx.clearRect(0, 0, cv.width, cv.height)
    let barWidth = cv.width / bandCount

    for (let i = 0; i < bandCount; i++) {
      let hue = Math.floor(360.0 / bandCount * i)
      let brightness = fade ? clamp(Math.floor(spectrum[i] / 1.5), 25, 99) : 99

      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]

      let barHeight = cv.height * (spectrum[i] / 255)
      ctx.fillRect(i * barWidth, cv.height - barHeight, barWidth, barHeight)
    }
  }


  vary()

  return Object.freeze({ dampen, vary, resize, draw })
}

},{"./big-color-map":4,"clamp":15}],15:[function(require,module,exports){
module.exports = clamp

function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)
}

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
'use strict'

var ensureCallable = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function")
	return fn
}

var byObserver = function (Observer) {
	var node = document.createTextNode(''), queue, currentQueue, i = 0
	new Observer(function () {
		var callback
		if (!queue) {
			if (!currentQueue) return
			queue = currentQueue
		} else if (currentQueue) {
			queue = currentQueue.concat(queue)
		}
		currentQueue = queue
		queue = undefined
		if (typeof currentQueue === 'function') {
			callback = currentQueue
			currentQueue = undefined
			callback()
			return
		}
		node.data = (i = ++i % 2) // Invoke other batch, to handle leftover callbacks in case of crash
		while (currentQueue) {
			callback = currentQueue.shift()
			if (!currentQueue.length) currentQueue = undefined
			callback()
		}
	}).observe(node, { characterData: true })
	return function (fn) {
		ensureCallable(fn)
		if (queue) {
			if (typeof queue === 'function') queue = [queue, fn]
			else queue.push(fn)
			return
		}
		queue = fn
		node.data = (i = ++i % 2)
	}
}

module.exports = (function () {
	// MutationObserver
	if ((typeof document === 'object') && document) {
		if (typeof MutationObserver === 'function') return byObserver(MutationObserver)
		if (typeof WebKitMutationObserver === 'function') return byObserver(WebKitMutationObserver)
	}

	// W3C Draft
	// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	if (typeof setImmediate === 'function') {
		return function (cb) { setImmediate(ensureCallable(cb)) }
	}

	// Wide available standard
	if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
		return function (cb) { setTimeout(ensureCallable(cb), 0) }
	}
}())

},{}],18:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
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
},{"_process":2}],19:[function(require,module,exports){
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
module.exports.polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf
  object.cancelAnimationFrame = caf
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"performance-now":18}]},{},[1]);
