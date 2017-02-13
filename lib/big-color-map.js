const HSVtoRGB = require('./hsv-to-rgb')


var bigColorMap = [];
var bigColorMap2 = [];

function generateColors() {
  for (var hue = 0; hue < 360; hue++) {
    for (var brightness = 0; brightness < 100; brightness++) {
      var color = HSVtoRGB(hue / 360, 1, brightness / 100, true, false);
      bigColorMap.push(color);
      var color2 = HSVtoRGB(hue / 360, 1, brightness / 100, false, true);
      bigColorMap2.push(color2);
    }
  }
}

generateColors()

module.exports = {
  bigColorMap: bigColorMap,
  bigColorMap2: bigColorMap2
}
