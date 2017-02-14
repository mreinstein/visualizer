# Visualizer

A HTML5 audio visualizer for microphone or line-in input.

![](thumbnail.jpg)

## Requirements

Chrome or Firefox is required, though Chrome is much faster in general due to more GPU acceleration.

Because it uses certain HTML5 APIs, this page cannot be run directly from disk and must be run from a web server, even though it is completely static.

## Usage

Once the page is up, allow it to access microphone/line-in input. Use 1-7 to select a visualization, and the += key to switch between variants of that visualization.

On OS X you can use [Soundflower](http://rogueamoeba.com/freebies/soundflower/) to redirect system audio, and on Windows you can use [VB Cable](http://vb-audio.pagesperso-orange.fr/Cable/).


### TODO

* minified build (uglify2, babel)
