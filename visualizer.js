var cv = document.getElementById("canvas");
var ctx;

var fftSize = 256;
var bandCount = Math.round(fftSize / 3);
var lastVolumes = [];

var visualizers = [];
var currentViz = 0;

var shortestSide, longestSide, hypotenuse;
var allRotate = 0;
var rotateAmount, centerRadius, bandWidth, heightMultiplier;
var colors = [];

// for audio processing
var audioBuffer;
var sourceNode;
var analyser;
var javascriptNode;
var context;
var mediaStreamSource;

// for forcing a specific frame rate
var now;
var then = Date.now();
var fpsInterval = 1000 / 60;
var elapsed;

/*******************************************************************************
* set up visualizers, key handler, and window resize handler
*/
window.onload = function() {
  visualizers.push(new VizRadialArcs(0));
  visualizers.push(new VizRadialBars(0));
  visualizers.push(new VizFlyout());
  visualizers.push(new VizSunburst(0));
  visualizers.push(new VizBoxes(0));
  document.getElementsByTagName('body')[0].onkeyup = function(e) { 
    var ev = e || event;
    if (ev.keyCode >= 49 && ev.keyCode < 49 + visualizers.length) {
      currentViz = ev.keyCode - 49;
    } else if (ev.keyCode == 187 || ev.keyCode == 61) {
      vary();
    }
    //console.log(ev.keyCode);
  }
};
window.onresize = function() { recalculateSizes(); };

/*******************************************************************************
* sets up mic/line-in input, and the application loop
*/
if (navigator.getUserMedia) {
  navigator.getUserMedia({video: false, audio: true}, onSuccess, onError);
} else if (navigator.webkitGetUserMedia) {
  navigator.webkitGetUserMedia({video: false, audio: true}, onSuccess, onError);
} else if (navigator.mozGetUserMedia) {
  navigator.mozGetUserMedia({video: false, audio: true}, onSuccess, onError);
}

function onSuccess(stream) {
  if (!window.AudioContext) {
    if (!window.webkitAudioContext) {
      alert('no audiocontext found');
    }
    window.AudioContext = window.webkitAudioContext;
  }
  context = new AudioContext();
  mediaStreamSource = context.createMediaStreamSource(stream);

  javascriptNode = context.createScriptProcessor(1024, 1, 1);
  javascriptNode.connect(context.destination);
  javascriptNode.onaudioprocess = function() {
    var spectrum = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(spectrum);
    // dampen falloff
    if (visualizers[currentViz].dampen == true) {
      for (var i = 0; i < spectrum.length; i++) {
        if (lastVolumes[i] > spectrum[i]) {
          spectrum[i] = (spectrum[i] + lastVolumes[i]) / 2;
        }
      }
    }

    // draw at a constant framerate
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
      then = now - (elapsed % fpsInterval);
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      ctx = cv.getContext("2d");
      visualizers[currentViz].draw(spectrum);
    }
  };

  analyser = context.createAnalyser();
  analyser.smoothingTimeConstant = 0.2;
  analyser.fftSize = fftSize;
  for (var i = 0; i < bandCount; i++) {
    lastVolumes.push(0);
  }
  rotateAmount = (Math.PI * 2.0) / bandCount;
  generateColors();
  recalculateSizes();

  mediaStreamSource.connect(analyser);
  analyser.connect(javascriptNode);
}

function onError(e) {
    console.log(e);
}

/*******************************************************************************
* varies the current visualization
*/
function vary() {
  if (visualizers[currentViz].hasVariants) {
    var variant = visualizers[currentViz].variant;
    variant++;
    if (variant >= visualizers[currentViz].variants.length) {
      variant = 0;
    }
    visualizers[currentViz].vary(variant);
  }
}

/*******************************************************************************
* various utility functions
*/
function generateColors() {
  for (var i = 0; i < bandCount; i++) {
    var hue = (360.0 / bandCount * i) / 360.0;
    colors.push(HSVtoRGB(hue, 1, 1));
    colors.push(HSVtoRGB(hue, 1, 0.5));
  }
}

function recalculateSizes() {
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  shortestSide = Math.min(cv.width, cv.height);
  longestSide = Math.max(cv.width, cv.height);
  hypotenuse = Math.sqrt(cv.width * cv.width + cv.height * cv.height);
  centerRadius = 85.0 / 800 * shortestSide;
  heightMultiplier = 1.0 / 800 * shortestSide;
  bandWidth = Math.PI * 2 * centerRadius / bandCount;
}

function constrain(input, min, max) {
  if (input < min) {
    input = min;
  } else if (input > max) {
    input = max;
  }
  return input;
}

function average(array) {
    var sum = 0; 
    for (var i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}

function reduceBuckets(input, size) {
  var output = [];
  var increment = input.length / size;
  for (var i = 0; i < size; i++) {
    var band = 0;
    var lower = increment * i;
    var lowerI = Math.floor(lower);
    var higher = increment * (i + 1)
    var higherI = Math.ceil(higher)
    for (var j = lowerI; j < higherI; j++) {
      if (i == lowerI) {
        band += (1-(lower - lowerI)) * input[i];
      }
      else if (i == higherI - 1) {
        band += (1-(higherI - higher)) * input[i];
      }
      else {
        band += input[i];
      }
    }
    band /= increment;
    output.push(band);
  }
  return output;
}

// http://stackoverflow.com/a/17243070
function HSVtoRGB(h, s, v) {
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
    return 'rgb(' + Math.floor(r * 255) + ',' + Math.floor(g * 255) + ',' +
      Math.floor(b * 255) + ')'; 
}