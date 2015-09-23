var WaveformGenerator = (function(audioBuffer, settingsObject) {
    var settings = {
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
    };

    var audioContext = new AudioContext() || new WebkitAudioContext();
    var svg = null;
    var svgStyleSheet = null;

    function guid() {
      return 'a' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + 'b' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    
    function drawBar(index, height) {
        var width = settings.bar.width;
        if (settings.bar.gap !== 0) {
            width *= Math.abs(100 - settings.bar.gap) / 100;
        }
        var x = index + (width / 2),
            y = settings.waveform.height / 2 - height / 2,
            path = document.createElement('path');
        switch (settings.bar.align) {
            case 'top':
                y = 0;
                break;
            case 'center':
                y = settings.waveform.height / 2 - height / 2;
                break;
            case 'bottom':
                y = settings.waveform.height - height;
        }
        path.setAttribute('d', 'M' + x + ' ' + y + ' L' + x + ' ' + y + ' L' + x + ' ' + (y + height) + ' L' + x + ' ' + (y + height) + ' L' + x + ' ' + y + ' Z');
        path.className = svg.id;
        svg.appendChild(path);
    }

    function bufferMeasure(position, length, data) {
        var sum = 0.0;
        for (var i = position, ref = (position + length) - 1; position <= ref ? i <= ref : i >= ref; position <= ref ? i++ : i--) {
            sum += Math.pow(data[i], 2);
        }
        return Math.sqrt(sum / data.length);
    }

    function extractBuffer(buffer) {
        buffer = buffer.getChannelData(0);
        var sections = settings.waveform.width;
        var len = Math.floor(buffer.length / sections);
        var maxHeight = settings.waveform.height;
        var vals = [];
        for (var i = 0; i < sections; i += settings.bar.width) {
            vals.push(bufferMeasure(i * len, len, buffer) * 10000);
        }
        var scale = maxHeight / Math.max.apply(null, vals);
        for (var j = 0; j < sections; j += settings.bar.width) {
            var val = bufferMeasure(j * len, len, buffer) * 10000;
            val *= scale;
            val += 1;
            drawBar(j, val);
        }
        if (i >= sections) {
            return true;
        }
    }

    // Constructor
    function WaveformGenerator(fileArrayBuffer, settingsObject) {
      // Merge objects
      Object.assign(settings, settingsObject);

      svg = document.createElement('svg');
      svg.id = guid();
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('version', '1.1');
      svg.setAttributeNS(null, 'viewBox', '0 0 ' + settings.waveform.width + ' ' + settings.waveform.height);

      svgStyleSheet = document.createElement('style');
      svgStyleSheet.setAttribute('type', 'text/css');
      svgStyleSheet.appendChild(document.createTextNode('<![CDATA[path.'+svg.id+'{stroke:' + settings.waveform.color + ';stroke-width:' + ((settings.bar.width !== 0) ? (settings.bar.width * Math.abs(1 - settings.bar.gap)) : settings.bar.width) + '}]]>'));

      svg.appendChild(svgStyleSheet);

      return new Promise(function(resolve, reject) {
        audioContext.decodeAudioData(fileArrayBuffer, function(audioBuffer) {
          if (extractBuffer(audioBuffer)) {
            resolve(svg.outerHTML);
          }
        });
      });
    }

    return WaveformGenerator;
})();