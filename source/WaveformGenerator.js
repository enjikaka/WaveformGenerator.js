window.AudioContext = window.AudioContext || window.webkitAudioContext;

var WaveformGenerator = {
  tmp: {
    bar: {
      width: 1,
      gap: 0
    },
    wave: {
      color: '#bada55',
      alignment: 'bottom'
    }
  },
  generate: function(file, waveformWidth, waveformHeight, waveformColor, waveformAlign, barWidth, barGapWidth, returnFunction) {
    if (arguments.length !== 8) {
      this.error('Not enough arguments');
      return;
    }
    // Prepare audio
    this.tmp.audioContext = new AudioContext();
    // Prepare canvas
    this.tmp.canvas = document.createElement('canvas');
    var canvas = this.tmp.canvas;
    // Canvas size
    canvas.width = (waveformWidth !== undefined ? parseInt(waveformWidth) : 200);
    canvas.height = (waveformHeight !== undefined ? parseInt(waveformHeight) : 100);
    // Color and alignment
    this.tmp.wave.color = (waveformColor !== undefined ? waveformColor : 'black');
    this.tmp.wave.alignment = (waveformAlign !== undefined ? waveformAlign : 'black');
    // Bar width and gap
    this.tmp.bar.width = (barWidth !== undefined ? parseInt(barWidth) : 1);
    this.tmp.bar.gap = (barGapWidth !== undefined ? parseFloat(barGapWidth) : 0);
    // Function that fires upon creation of waveform
    this.tmp.retFunc = returnFunction;
    // Prepare SVG
    this.tmp.svg = document.createElement('svg');
    var svg = this.tmp.svg;
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('version', '1.1');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttributeNS(null, 'viewBox', '0 0 ' + canvas.width + ' ' + canvas.height);
    // Styles
    var svgStyleSheet = document.createElement('style');
    svgStyleSheet.setAttribute('type', 'text/css');
    var styleData = document.createTextNode('<![CDATA[path{stroke:' + this.tmp.wave.color + ';stroke-width:' + ((this.tmp.bar.width !== 0) ? (this.tmp.bar.width * Math.abs(1 - this.tmp.bar.gap)) : this.tmp.bar.width) + '}]]>');
    svgStyleSheet.appendChild(styleData);
    svg.appendChild(svgStyleSheet);
    // Load URL to an ArrayBuffer
    var reader = new FileReader();
    reader.onload = function(event) {
      new AudioContext().decodeAudioData(event.target.result, function(buffer) {
        WaveformGenerator.extractBuffer(buffer);
      });
    };
    reader.readAsArrayBuffer(file);
  },
  error: function(message) {
    console.error(message);
  },
  extractBuffer: function(buffer) {
    buffer = buffer.getChannelData(0);
    var sections = this.tmp.canvas.width;
    var len = Math.floor(buffer.length / sections);
    for (var i = 0; i < sections; i += this.tmp.bar.width) {
        var position = i * length;
        this.drawBar(i, this.bufferMeasure(position, length, buffer));
    }
    if (i >= sections) {
      WaveformGenerator.tmp.retFunc(this.tmp.canvas.toDataURL(), URL.createObjectURL(new Blob(['<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + this.tmp.svg.outerHTML], {
          type: 'image/svg+xml'
      })));
    }
  },
  bufferMeasure: function(position, length, data) {
    var sum = 0.0;
    for (var i = position, ref = (position + length) - 1; position <= ref ? i <= ref : i >= ref; position <= ref ? i++ : i--) {
      sum += Math.pow(data[i], 2);
    }
    return Math.sqrt(sum / data.length);
  },
  drawBar: function(i, val) {
    var canvas = this.tmp.canvas;
    var ctx = this.tmp.canvas.getContext('2d');
    ctx.fillStyle = this.tmp.wave.color;
    var height = val * 40 * canvas.height, width = this.tmp.bar.width;
    if (this.tmp.bar.gap !== 0) {
      width *= Math.abs(1 - this.tmp.bar.gap);
    }
    var x = i + (width / 2), y = canvas.height - height, path = document.createElement('path');
    y = (this.tmp.wave.alignment === 'center') ? canvas.height / 2 - height / 2 : y;
    path.setAttribute('d', 'M' + x + ' ' + y + ' L' + x + ' ' + y + ' L' + x + ' ' + (y + height) + ' L' + x + ' ' + (y + height) + ' L' + x + ' ' + y + ' Z');
    this.tmp.svg.appendChild(path);
    return ctx.fillRect(i, y, width, height);
  }
};