const defaultOptions = {
  waveformWidth: 500,
  waveformHeight: 80,
  waveformColor: '#000',
  barAlign: 'center',
  barWidth: 1,
  barGap: 0,
  drawMode: 'png'
};

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

async function decodeAudioData(fileArrayBuffer) {
  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext();
    audioContext.decodeAudioData(fileArrayBuffer, audioBuffer => {
      if (!audioBuffer) {
        reject(new Error('Could not decode audio data'));
      } else {
        resolve(audioBuffer);
      }
    });
  });
}

function generateNewSVGTarget(width, height) {
  const svg = document.createElement('svg');
  svg.id = guid();
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('version', '1.1');
  svg.setAttributeNS(null, 'viewBox', `0 0 ${width} ${height}`);
  return svg;
}

function generateNewCanvasTarget(width, height) {
  const canvas = document.createElement('canvas');
  canvas.id = guid();
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

class WaveformGenerator {
  constructor(fileArrayBuffer) {
    this.svg = undefined;
    this.canvas = undefined;
    this.fileArrayBuffer = fileArrayBuffer;
  }

  async getWaveform(options = {}) {
    this.options = Object.assign({}, defaultOptions, options);
    const {
      waveformWidth,
      waveformHeight,
      drawMode
    } = this.options;

    if (!this.audioBuffer) {
      this.audioBuffer = await decodeAudioData(this.fileArrayBuffer.slice(0));
    }

    if (drawMode === 'png') {
      this.canvas = generateNewCanvasTarget(waveformWidth, waveformHeight);
      this.canvasContext = this.canvas.getContext('2d');
    } else if (drawMode === 'svg') {
      this.svg = generateNewSVGTarget(waveformWidth, waveformHeight);
      this.svg.appendChild(this.generateSVGStylesheet());
    }

    this.drawWaveform(this.audioBuffer);

    if (drawMode === 'png') {
      return this.canvas.toDataURL();
    } else if (drawMode === 'svg') {
      return 'data:image/svg+xml;base64,' + btoa('<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + this.svg.outerHTML);
    }
  }

  generateSVGStylesheet() {
    const {
      waveformColor,
      barWidth,
      barGap
    } = this.options;
    const svgStylesheet = document.createElement('style');
    svgStylesheet.setAttribute('type', 'text/css');
    const strokeWidth = barGap !== 0 ? barWidth * Math.abs(1 - barGap) : barWidth;
    svgStylesheet.appendChild(document.createTextNode('path{stroke:' + waveformColor + ';stroke-width:' + strokeWidth + '}'));
    return svgStylesheet;
  }

  drawBarToCanvas(x, y, barHeight) {
    const {
      waveformColor,
      barWidth
    } = this.options;
    x = Math.floor(x - 1);
    y = Math.floor(y - 1);
    this.canvasContext.fillStyle = waveformColor;
    this.canvasContext.fillRect(x, y, barWidth, barHeight);
  }

  drawBarToSVG(x, y, barHeight) {
    const path = document.createElement('path');
    path.setAttribute('d', 'M' + x + ' ' + y + ' L' + x + ' ' + y + ' L' + x + ' ' + (y + barHeight) + ' L' + x + ' ' + (y + barHeight) + ' L' + x + ' ' + y + ' Z');
    this.svg.appendChild(path);
  }

  drawBar({
    position,
    height
  }) {
    const {
      barGap,
      barAlign,
      waveformHeight,
      drawMode
    } = this.options;
    let {
      barWidth
    } = this.options;

    if (barGap !== 0) {
      barWidth *= Math.abs(1 - barGap);
    }

    const x = position + barWidth / 2;
    let y;

    switch (barAlign) {
      case 'top':
        y = 0;
        break;

      case 'bottom':
        y = waveformHeight - height;
        break;

      case 'center':
      default:
        y = waveformHeight / 2 - height / 2;
        break;
    }

    if (drawMode === 'png') {
      this.drawBarToCanvas(x, y, height);
    } else if (drawMode === 'svg') {
      this.drawBarToSVG(x, y, height);
    } else {
      throw new Error(`Unsupported drawMode in options; ${drawMode}. Allowed: png, svg`);
    }
  }

  bufferMeasure(position, length, data) {
    let sum = 0.0;

    for (let i = position, ref = position + length - 1; position <= ref ? i <= ref : i >= ref; position <= ref ? i++ : i--) {
      sum += Math.pow(data[i], 2);
    }

    return Math.sqrt(sum / data.length);
  }

  drawWaveform(buffer) {
    buffer = buffer.getChannelData(0);
    const {
      waveformWidth,
      waveformHeight,
      barWidth
    } = this.options;
    const len = Math.floor(buffer.length / waveformWidth);
    const bars = [];
    const values = [];

    for (let i = 0; i < waveformWidth; i += barWidth) {
      const bar = {};
      bar.position = i;
      bar.height = this.bufferMeasure(i * len, len, buffer);
      values.push(bar.height);
      bars.push(bar);
    }

    const scale = waveformHeight / Math.max.apply(null, values);
    bars.map(bar => {
      bar.height *= scale;
      return bar;
    }).forEach(({
      position,
      height
    }) => this.drawBar({
      position,
      height
    }));
  }

}

export default WaveformGenerator;