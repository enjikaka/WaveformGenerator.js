WaveformGenerator
=================

WaveformGenerator.js is a simple and small library for JavaScript which generates waveform from audio, either as PNG or SVG data.

You can change the color of the waveform, the width of bars, width of gaps between bars and the bars alignment.

Licensed under [GNU GPL 3.0](https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)).

##Install

Grab the JavaScript file from the ```dist``` directory.

WaveformGenerator can also be inststalled with Bower: 

```bower install waveform-generator```

##Usage

Create a waveform by creating a new instance of WaveformGenerator and passing an array buffer and a settings object. The WaveformGenerator will return a Promise with the URL to the generated waveform.

###Creating a waveform

You can create a new generator without any settings. The generator will then use the default settings which is a normal waveform aligned in the center with a #bada55 (badass) color.

```javascript
new WaveformGenerator(arrayBuffer).then(function(pngWaveformUrl) {
	document.querySelector('#awesome-png-waveform').src = pngWaveformUrl;
});
```

To generate waveform with your own settings, put an object with the settings in the second argument of the WaveformGenerator, right after the arrayBuffer.

```javascript
new WaveformGenerator(arrayBuffer, myAwesomeSettings).then(function(pngWaveformUrl) {
	document.querySelector('#awesome-png-waveform').src = pngWaveformUrl;
});
```
You can change he following settings in the WaveformGenerator by passing your own settings object.

|Setting|Explanation|
|--- | ---|
|waveformWidth|Width of the final image (Default: 500)|
|waveformHeight|Height of the final image (Default: 80)|
|waveformColor|Color of the waveform (Default: #bada55)|
|barAlign|Alignment of the bars in the waveform. Can be either ```'center'```, ```'bottom'``` or ```'top'``` (Default: 'center')|
|barWidth|Width of the bars. (Default: 1)|
|barGap|Width of the gaps between bars. Float value. Gap formula is ```barWidth *= abs(1 - gap)``` (Default: 0)|
|drawMode|Controls output format. Can be ```'png'``` or ```'svg'```. (Default 'png')|

##Example usage

####HTML
```html
<input type="file">
<img id="png-waveform" alt="PNG Waveform Destination">
<img id="svg-waveform" alt="SVG Waveform Destination">
```
####JavaScript
````javascript
document.querySelector('input').addEventListener('change', function(e) {
	// Create file reader to read the file as an ArrayBuffer
	var reader = new FileReader();

	// Tell the reader to read the file as an ArrayBuffer
	reader.readAsArrayBuffer(e.target.files[0]);

	// When the reader has loaded the read the file as an ArrayBuffer
	reader.onload = function(event) {
		var arrayBuffer = event.target.result;

		var pngSettings = {drawMode: 'png'}; // 'png' is default. Can be omitted.
		var svgSettings = {drawMode: 'svg'};

		new WaveformGenerator(arrayBuffer, pngSettings).then(function(pngWaveformUrl) {
			document.querySelector('#png-waveform').src = pngWaveformUrl;
		});

		new WaveformGenerator(arrayBuffer, svgSettings).then(function(svgWaveformUrl) {
			document.querySelector('#svg-waveform').src = svgWaveformUrl;
		});
	};
}, false);
```

##Demo

###Using local media

[codepen.io/enjikaka/full/azyvae](http://codepen.io/enjikaka/full/azyvae)

###Using Spotify

[codepen.io/enjikaka/full/DrFEk](http://codepen.io/enjikaka/full/DrFEk)

##Dependencies

This demo uses ```Object.assign``` and JavaScript Promises.
Here are polyfills:

- [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [es6-promise](https://github.com/jakearchibald/es6-promise)


