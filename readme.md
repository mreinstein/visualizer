# Visualizer

A HTML5 audio visualizer for microphone or line-in input.

![](thumbnail.jpg)

## Requirements

A browser with `canvas` and `getUserMedia` support. (Currently Chrome, Firefox, Edge, and Opera)


## Running the examples

visualizer uses the `getUserMedia` HTML5 API. Using this feaure prevents running the HTML page directly from disk,
and must be run from a web server, even though it is completely static. 

You can use any existing web server software to host the `visualizer/` directory, or you can use node and npm by 
running these steps:

```bash
cd visualizer
npm install
npm run start-dev
```

Either way, you can now open http://localhost:3000/examples in a supported web browser.

You'll be prompted to allow microphone access. Upon accepting, the visualizations will start playing.

* Press number keys `1` - `7` to select a visualization.
* Press `+`/`=` key to switch between variants of that visualization. Some visualizations don't have a variant.

On OS X you can use [Soundflower](http://rogueamoeba.com/freebies/soundflower/) to redirect system audio, and 
on Windows you can use [VB Cable](http://vb-audio.pagesperso-orange.fr/Cable/).


## Using as a standard javascript include

see `examples/browser-global/`


## Using with browserify

see `examples/browserify/`

