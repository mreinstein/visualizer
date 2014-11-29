# Visualizer

A HTML5 audio visualizer for microphone or line-in input.

![](thumbnail.png)

## Requirements

Chrome or Firefox is required, though the cloud/starburst visualizer has extremely poor performance on Firefox, and Chrome is much faster in general due to more GPU acceleration.

Because it uses certain HTML5 APIs, this page cannot be run directly from disk and must be run from a web server, even though it is completely static.

## Usage

Once the page is up, allow it to access microphone/line-in input. Use the number keys to select a visualization, and the += key to switch between variants of that visualization.

On OS X you can use [Soundflower](http://rogueamoeba.com/freebies/soundflower/) to redirect system audio, and on Windows you can use [VB Cable](http://vb-audio.pagesperso-orange.fr/Cable/).

## History

### 2014-11-29 - v3

  * heavily refactored code to be more modular, with less duplication
  * added box visualization
  * added variants functionality

## 2014-11-27 - v2

  * added clouds/starburst mode

### 2014-11-21 - v1

  * initial port from Processing