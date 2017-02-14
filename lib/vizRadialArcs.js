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
    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      let hue = Math.floor(360.0 / bandCount * i)
      let brightness = 99
      if (fade) {
        let brightness = constrain(Math.floor(spectrum[i] / 1.5), 25, 99)
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
