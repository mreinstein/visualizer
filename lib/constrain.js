module.exports = function constrain(input, min, max) {
  if (input < min) {
    input = min
  } else if (input > max) {
    input = max
  }
  return input
}
