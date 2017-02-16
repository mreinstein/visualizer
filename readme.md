# Visualizer

A HTML5 audio visualizer for microphone or line-in input.

![](thumbnail.jpg)

## Requirements

A browser with `canvas` and `getUserMedia` support. (Currently Chrome, Firefox, Edge, and Opera)


## Configuration

Several parameters are supported when creating a visualizer instance. These are all optional.

```javascript

var options = {
  // string indicating which container element should hold the visualization.
  // If specified it will stretch to fit this container's width and height.
  // If omitted it will assume a full screen visualization and fit to the window
  parent: '#my-container-div',

  // specify the image that is used by the vizImage visualization
  image: 'my-image.png',

  // in some cases you may already have a media stream. You can pass it in to
  // the visualizer. If omitted it will create a new media stream
  stream: mediaStream
}

var viz = visualizer(options)
```

## Running the examples

open any of the index files in the `examples/` directory.

You'll be prompted to allow microphone access. Upon accepting, the visualizations will start playing.

* Press number keys `1` - `7` to select a visualization.
* Press `+`/`=` key to switch between variants of that visualization. Some visualizations don't have a variant.

On OS X you can use [Soundflower](http://rogueamoeba.com/freebies/soundflower/) to redirect system audio, and 
on Windows you can use [VB Cable](http://vb-audio.pagesperso-orange.fr/Cable/).


## Using as a standard javascript include

see `examples/browser-global/`


## Using with browserify

see `examples/browserify/`

