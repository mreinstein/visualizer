/*******************************************************************************
* arcs coming out from a circle
*/
function VizRadialArcs(variant) {
  this.dampen = true;
  this.hasVariants = true;
  this.variants = [[false, true], [true, false], [false, false]];

  this.vary(variant);
}

VizRadialArcs.prototype.vary = function(variant) {
  this.variant = variant;
  this.gap = this.variants[variant][0];
  this.fade = this.variants[variant][1];
}

VizRadialArcs.prototype.draw = function(spectrum) {
  ctx.clearRect(0, 0, cv.width, cv.height)
  ctx.translate(cv.width / 2, cv.height / 2);
  ctx.rotate(allRotate);
  for (var i = 0; i < bandCount; i++) {
    ctx.rotate(rotateAmount);
    if (this.fade) {
      var hue = (360.0 / bandCount * i) / 360.0;
      var brightness = constrain(spectrum[i] / 150, 0.25, 1);
      ctx.fillStyle = HSVtoRGB(hue, 1, brightness);
    } else {
      ctx.fillStyle = colors[i * 2];
    }
    ctx.beginPath();
    if (this.gap) {
      ctx.arc(0, 0, centerRadius + Math.max(spectrum[i] * heightMultiplier, 2),
        0, rotateAmount / 2);
    } else {
      ctx.arc(0, 0, centerRadius + Math.max(spectrum[i] * heightMultiplier, 2),
        0, rotateAmount + 0.005);
    }
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.closePath();
  }
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, 0, centerRadius, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.closePath();
  allRotate += 0.002;
}