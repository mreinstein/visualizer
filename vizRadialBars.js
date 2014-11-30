/*******************************************************************************
* bars coming out from a circle
*/
function VizRadialBars(variant) {
  this.dampen = true;
  this.hasVariants = true;
  this.variants = [[false], [true]];

  this.vary(variant);
}

VizRadialBars.prototype.resize = function() {}

VizRadialBars.prototype.vary = function(variant) {
  this.variant = variant;
  this.fade = this.variants[variant][0];
}

VizRadialBars.prototype.draw = function(array) {
  ctx.clearRect(0, 0, cv.width, cv.height)
  ctx.translate(cv.width / 2, cv.height / 2);
  ctx.rotate(allRotate);
  for (var i = 0; i < bandCount; i++) {
    ctx.rotate(rotateAmount);
    if (this.fade) {
      var hue = (360.0 / bandCount * i) / 360.0;
      var brightness = constrain(array[i] / 150, 0.25, 1);
      ctx.fillStyle = HSVtoRGB(hue, 1, brightness);
      ctx.fillRect(-bandWidth / 2, centerRadius, bandWidth,
        Math.max(2, array[i] * heightMultiplier));
    } else {
      var avg = 0;
      avg = (array[i] + lastVolumes[i]) / 2;
      ctx.fillStyle = colors[i * 2 + 1];
      ctx.fillRect(-bandWidth / 2, centerRadius + avg, bandWidth, 2);
      ctx.fillStyle = colors[i * 2];
      ctx.fillRect(-bandWidth / 2, centerRadius, bandWidth,
        array[i] * heightMultiplier);
    }
  }
  allRotate += 0.002;
}