const colorMap  = require('./big-color-map')
const constrain = require('./constrain')


// bars coming out from a circle
module.exports = function vizRadialBars(options={}) {
  let { ctx, cv, bandCount, rotateAmount, lastVolumes } = options

  let bandWidth, fade, centerRadius, heightMultiplier
  const dampen = true
  let variant = 0
  let variants = [[false], [true]]
  let allRotate = 0

  let draw = function(spectrum) {
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)
    ctx.rotate(allRotate)
    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      let hue = Math.floor(360.0 / bandCount * i)
      if (fade) {
        let brightness = constrain(Math.floor(spectrum[i] / 1.5), 25, 99)
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
  
  return Object.freeze({ dampen, vary, resize, draw })
}
