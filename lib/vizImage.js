const colorMap  = require('./big-color-map')
const constrain = require('./constrain')


// an image that's colored to the beat
module.exports = function vizImage(options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options
  let dampen = true

  let width, height, frame, tX, tY, scale, greyscaled, greyscaled2

  // create an offscreen image buffer
  const cv2 = document.createElement('canvas')
  let hueOffset = 0
  
  let draw = function(array) {
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

  _generateGreyscaleBuckets(document.getElementById('image'), 128)
  resize()

  return Object.freeze({ resize, draw })
}
