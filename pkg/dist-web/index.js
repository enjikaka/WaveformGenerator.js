function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

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

function decodeAudioData(_x) {
  return _decodeAudioData.apply(this, arguments);
}

function _decodeAudioData() {
  _decodeAudioData = _asyncToGenerator(function* (fileArrayBuffer) {
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
  });
  return _decodeAudioData.apply(this, arguments);
}

function generateNewSVGTarget(width, height) {
  const svg = document.createElement('svg');
  svg.id = guid();
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('version', '1.1');
  svg.setAttributeNS(null, 'viewBox', "0 0 ".concat(width, " ").concat(height));
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

  getWaveform() {
    var _this = this,
        _arguments = arguments;

    return _asyncToGenerator(function* () {
      let options = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
      _this.options = Object.assign({}, defaultOptions, options);
      const _this$options = _this.options,
            waveformWidth = _this$options.waveformWidth,
            waveformHeight = _this$options.waveformHeight,
            drawMode = _this$options.drawMode;

      if (!_this.audioBuffer) {
        _this.audioBuffer = yield decodeAudioData(_this.fileArrayBuffer.slice(0));
      }

      if (drawMode === 'png') {
        _this.canvas = generateNewCanvasTarget(waveformWidth, waveformHeight);
        _this.canvasContext = _this.canvas.getContext('2d');
      } else if (drawMode === 'svg') {
        _this.svg = generateNewSVGTarget(waveformWidth, waveformHeight);

        _this.svg.appendChild(_this.generateSVGStylesheet());
      }

      _this.drawWaveform(_this.audioBuffer);

      if (drawMode === 'png') {
        return _this.canvas.toDataURL();
      } else if (drawMode === 'svg') {
        return 'data:image/svg+xml;base64,' + btoa('<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + _this.svg.outerHTML);
      }
    })();
  }

  generateSVGStylesheet() {
    const _this$options2 = this.options,
          waveformColor = _this$options2.waveformColor,
          barWidth = _this$options2.barWidth,
          barGap = _this$options2.barGap;
    const svgStylesheet = document.createElement('style');
    svgStylesheet.setAttribute('type', 'text/css');
    const strokeWidth = barGap !== 0 ? barWidth * Math.abs(1 - barGap) : barWidth;
    svgStylesheet.appendChild(document.createTextNode('path{stroke:' + waveformColor + ';stroke-width:' + strokeWidth + '}'));
    return svgStylesheet;
  }

  drawBarToCanvas(x, y, barHeight) {
    const _this$options3 = this.options,
          waveformColor = _this$options3.waveformColor,
          barWidth = _this$options3.barWidth;
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

  drawBar(_ref) {
    let position = _ref.position,
        height = _ref.height;
    const _this$options4 = this.options,
          barGap = _this$options4.barGap,
          barAlign = _this$options4.barAlign,
          waveformHeight = _this$options4.waveformHeight,
          drawMode = _this$options4.drawMode;
    let barWidth = this.options.barWidth;

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
      throw new Error("Unsupported drawMode in options; ".concat(drawMode, ". Allowed: png, svg"));
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
    const _this$options5 = this.options,
          waveformWidth = _this$options5.waveformWidth,
          waveformHeight = _this$options5.waveformHeight,
          barWidth = _this$options5.barWidth;
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
    }).forEach((_ref2) => {
      let position = _ref2.position,
          height = _ref2.height;
      return this.drawBar({
        position,
        height
      });
    });
  }

}

export default WaveformGenerator;
