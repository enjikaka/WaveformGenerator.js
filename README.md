WaveformGenerator
=================

WaveformGenerator.js is a simple and small library for JavaScript which generates waveform from audio, either as PNG or SVG data.

You can change the color of the waveform, the width of bars, width of gaps between bars and the bars alignment.

##Usage


Create waveform by calling the ```generate()``` function of the ```WaveformGenerator``` object. The ```generate()``` function will return URLs to a PNG file and a SVG file in its return function.

###Structure of the generate() function
```javascript
WaveformGenerator.generate(file, waveformWidth, waveformHeight, waveformColor, waveformAlign, barWidth, barGapWidth, returnFunction);
```

|Parameter | Value|
|--- | ---|
|*file* | File-object|
|*waveformWidth* |Width of the final image|
|*waveformHeight*|Height of the final image|
|*waveformColor*|Color of the outputted waveform|
|*waveformAlign*|Alignment of the bars in the waveform. Can be either ```'center'``` or ```'bottom'```|
|*barWidth*|Width of the bars. Default is 1.|
|*barGapWidth*|Width of the gaps between bars. Float value. Default is 0. Gap formula is ```barWidth *= abs(1 - gap)```|
|*returnFunction*|A function to handle the data sent back, 2 parameters. First one is the URL to the PNG, second to the SVG.|

##Example usage

####HTML
```html
<input type="file">
<img id="png" alt="PNG Waveform Destination">
<img id="svg" alt="SVG Waveform Destination">
```
####JavaScript
````javascript
document.querySelector('input').addEventListener('change', function(e) {
    WaveformGenerator.generate(e.target.files[0], 500, 200, '#bada55', 'center', 1, 0, function(png, svg) {
      document.querySelector('#png').src = png;
      document.querySelector('#svg').src = svg;
    });
}, false);
```

Demo here: [codepen.io/enjikaka/pen/ngBoH](http://codepen.io/enjikaka/pen/ngBoH)