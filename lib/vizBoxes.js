const colorMap  = require('./big-color-map')
const constrain = require('./constrain')


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
    //array = reduceBuckets(array, 81)
    ctx.clearRect(0, 0, cv.width, cv.height)

    var size = 11
    var i = 0
    var x = Math.floor((size - 1) / 2)
    var y = x
    var loop = 0

    var dx = 0
    var dy = 0
    
    var cw = cv.width / size
    var ch = cv.height / size
    
    while (i < size * size) {
      switch(loop % 4) {
      case 0: dx = 1; dy = 0; break;
      case 1: dx = 0; dy = 1; break;
      case 2: dx = -1; dy = 0; break;
      case 3: dx = 0; dy = -1; break;
      }

      for (var j = 0; j < Math.floor(loop / 2) + 1; j++) {
        //console.log(i + ': [' + x + ',' + y + '] ' + (loop / 2 + 1))
        let hue = Math.floor(360.0 / (size * size) * i + hueOffset) % 360
        let brightness = constrain(Math.floor(array[i] / 1.5), 10, 99)
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]
        let intensity = 0.9
        if (grow) {
          intensity = array[i] / 255 / 4 + 0.65
          //intensity = constrain(intensity, 0.1, 0.9)
        }
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
