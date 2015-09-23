var WaveformGenerator = (function(audioBuffer, settingsObject) {
    var _settings = {
        waveform: {
            width: 500,
            height: 80,
            color: '#bada55'
        },
        bar: {
            align: 'center',
            width: 1,
            gap: 0
        }
    },
    _audioContext = new AudioContext() || new WebkitAudioContext(),
    _svg = null, 
    _svgStyleSheet = null,
    guid = function() {
      return 'a' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + 'b' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    
    function _drawBar(index, height) {
        var width = _settings.bar.width;
        if (_settings.bar.gap !== 0) {
            width *= Math.abs(100 - _settings.bar.gap) / 100;
        }
        var x = index + (width / 2),
            y = _settings.waveform.height / 2 - height / 2,
            path = document.createElement('path');
        switch (_settings.bar.align) {
            case 'top':
                y = 0;
                break;
            case 'center':
                y = _settings.waveform.height / 2 - height / 2;
                break;
            case 'bottom':
                y = _settings.waveform.height - height;
        }
        path.setAttribute('d', 'M' + x + ' ' + y + ' L' + x + ' ' + y + ' L' + x + ' ' + (y + height) + ' L' + x + ' ' + (y + height) + ' L' + x + ' ' + y + ' Z');
        path.className = _svg.id;
        _svg.appendChild(path);
    }

    function _bufferMeasure(position, length, data) {
        var sum = 0.0;
        for (var i = position, ref = (position + length) - 1; position <= ref ? i <= ref : i >= ref; position <= ref ? i++ : i--) {
            sum += Math.pow(data[i], 2);
        }
        return Math.sqrt(sum / data.length);
    }

    function _extractBuffer(buffer) {
        buffer = buffer.getChannelData(0);
        var sections = _settings.waveform.width;
        var len = Math.floor(buffer.length / sections);
        var maxHeight = _settings.waveform.height;
        var vals = [];
        for (var i = 0; i < sections; i += _settings.bar.width) {
            vals.push(_bufferMeasure(i * len, len, buffer) * 10000);
        }
        var scale = maxHeight / Math.max.apply(null, vals);
        for (var j = 0; j < sections; j += _settings.bar.width) {
            var val = _bufferMeasure(j * len, len, buffer) * 10000;
            val *= scale;
            val += 1;
            _drawBar(j, val);
        }
        if (i >= sections) {
            return true;
        }
    }

    function _mergeSettings(source, target) {
        for (var p in target) {
          try {
            if (target[p].constructor == Object) {
              source[p] = _mergeSettings(source[p], target[p]);
            }
            else {
              source[p] = target[p];
            }
          } catch(e) {
          source[p] = target[p];
          }
        }
        return source;
    }

    // Constructor
    function WaveformGenerator(fileArrayBuffer, settingsObject) {
      _mergeSettings(_settings, settingsObject);
      _svg = document.createElement('svg');
      _svg.id = guid();
      _svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      _svg.setAttribute('version', '1.1');
      _svg.setAttributeNS(null, 'viewBox', '0 0 ' + _settings.waveform.width + ' ' + _settings.waveform.height);
      _svgStyleSheet = document.createElement('style');
      _svgStyleSheet.setAttribute('type', 'text/css');
      _svgStyleSheet.appendChild(document.createTextNode('<![CDATA[path.'+_svg.id+'{stroke:' + _settings.waveform.color + ';stroke-width:' + ((_settings.bar.width !== 0) ? (_settings.bar.width * Math.abs(1 - _settings.bar.gap)) : _settings.bar.width) + '}]]>'));
      _svg.appendChild(_svgStyleSheet);
      return new Promise(function(res,rej) {
        _audioContext.decodeAudioData(fileArrayBuffer, function(audioBuffer) {
          if (_extractBuffer(audioBuffer)) {
            res(_svg.outerHTML);
          }
        });
      });
    }

    return WaveformGenerator;
})();