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
