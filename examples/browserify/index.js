// this is the entry point for the front end code built with browserify

// normally you'd require this as require('visualizer.js') in your code
// but instead we use relative path here
var visualizer = require('../../')

// instantiate the visualizer module. specifying no parent container
// implicitly adds it the body and take up full width and height
var viz = visualizer()
