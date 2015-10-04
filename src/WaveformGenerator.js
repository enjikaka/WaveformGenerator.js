var WaveformGenerator = (function(audioBuffer, settingsObject) {
  var settings = undefined;

  var defaultSettings = {
    waveformWidth: 500,
    waveformHeight: 80,
    waveformColor: '#bada55',
    barAlign: 'center',
    barWidth: 1,
    barGap: 0,
    drawMode: 'png'
  };

  var audioContext = new AudioContext() || new WebkitAudioContext();
  var svg = null;
  var svgStyleSheet = null;
  var canvas = null;

  function guid() {
    return 'a' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + 'b' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  function drawBar(index, barHeight) {
    var barWidth = settings.barWidth;

    if (settings.barGap !== 0) {
      barWidth *= Math.abs(1 - settings.barGap);
    }

    var x = index + (barWidth / 2);
    var y;

    switch (settings.barAlign) {
      case 'top':
        y = 0;
        break;
      case 'center':
        y = settings.waveformHeight / 2 - barHeight / 2;
        break;
      case 'bottom':
        y = settings.waveformHeight - barHeight;
        break;
    }

    if (settings.drawMode === 'png') {
      x = Math.floor(x - 1);
      y = Math.floor(y - 1);
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = settings.waveformColor;
      ctx.fillRect(x, y, barWidth, barHeight);
    } else if (settings.drawMode === 'svg') {
      var path = document.createElement('path');

      path.setAttribute('d', 'M' + x + ' ' + y + ' L' + x + ' ' + y + ' L' + x + ' ' + (y + barHeight) + ' L' + x + ' ' + (y + barHeight) + ' L' + x + ' ' + y + ' Z');
      path.className = svg.id;

      svg.appendChild(path);
    }
  }

  function bufferMeasure(position, length, data) {
    var sum = 0.0;
    for (var i = position, ref = (position + length) - 1; position <= ref ? i <= ref : i >= ref; position <= ref ? i++ : i--) {
      sum += Math.pow(data[i], 2);
    }
    return Math.sqrt(sum / data.length);
  }

  function extractBuffer(buffer) {
    return new Promise(function(resolve, reject) {
      buffer = buffer.getChannelData(0);
      var waveformWidth = settings.waveformWidth;
      var len = Math.floor(buffer.length / waveformWidth);

      var bars = [];
      var values = [];

      for (let i = 0; i < waveformWidth; i += settings.barWidth) {
        var bar = {};

        bar.position = i;
        bar.height = bufferMeasure(i * len, len, buffer);

        values.push(bar.height);
        bars.push(bar);
      }

      var scale = settings.waveformHeight / Math.max.apply(null, values);

      for (let i = 0; i < bars.length; i++) {
        let bar = bars[i];
        let barHeight = bar.height;
        let barPosition = bar.position;
        barHeight *= scale;
        drawBar(barPosition, barHeight);
      }

      resolve();
    });
  }

  // Constructor
  function WaveformGenerator(fileArrayBuffer, settingsObject) {
    return new Promise(function(resolve, reject) {
      audioContext.decodeAudioData(fileArrayBuffer, function(audioBuffer) {
        if (!audioBuffer) {
          reject(new Error('Could not decode audio data'));
          return;
        }

        settings = Object.assign({}, defaultSettings);
        settings = Object.assign(settings, settingsObject);

        var processId = guid();

        svg = document.createElement('svg');
        svg.id = processId;
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('version', '1.1');
        svg.setAttributeNS(null, 'viewBox', '0 0 ' + settings.waveformWidth + ' ' + settings.waveformHeight);

        svgStyleSheet = document.createElement('style');
        svgStyleSheet.setAttribute('type', 'text/css');
        svgStyleSheet.appendChild(document.createTextNode('<![CDATA[path.' + svg.id + '{stroke:' + settings.waveformColor + ';stroke-width:' + ((settings.barGap !== 0) ? (settings.barWidth * Math.abs(1 - settings.barGap)) : settings.barWidth) + '}]]>'));

        svg.appendChild(svgStyleSheet);

        canvas = document.createElement('canvas');
        canvas.id = processId;
        canvas.width = settings.waveformWidth;
        canvas.height = settings.waveformHeight;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        extractBuffer(audioBuffer).then(function() {
          if (settings.drawMode === 'svg') {
            var svgUrl = URL.createObjectURL(new Blob(['<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + svg.outerHTML], {
              type: 'image/svg+xml'
            }));
            console.log('Resolving ' + processId);
            resolve(svgUrl);
          } else if (settings.drawMode === 'png') {
            console.log('Resolving ' + processId);
            console.log('Resolving canvas #' + canvas.id);
            resolve(canvas.toDataURL());
          }
        });
      });
    });
  }

  return WaveformGenerator;
})();