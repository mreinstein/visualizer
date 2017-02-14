
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
      throw new Error('Unable to start visualization. Make sure you\'re using Chrome or ' +
        'Firefox with a microphone set up, and that you allow the page to access' +
        ' the microphone.')
    }
    _init(stream)
  })

  return Object.freeze({ showNextVisualization, showVisualization, vary })
}
