(function(window) {
    'use strict';
    var FPS = 30;
    var CANVAS_WIDTH = 801;
    var CANVAS_HEIGHT = 600;
    var MUSIC_SRC = 'tangent_loop.wav';

    var canvas = document.getElementById('stage');
    canvas.setAttribute("width", CANVAS_WIDTH);
    canvas.setAttribute("height", CANVAS_HEIGHT);
    var context = canvas.getContext('2d');

    var audioFrequenciesLength = 0;
    var audioDuration = 0;
    var oldAvg = 0;

    var realTime = 0;

    function modulo(n, m) {
        return ((n % m) + m) % m;
    }

    function prepDaMusic(callback) {
        var sound = new AudioContext();
        var analyser = sound.createAnalyser();
        audioFrequenciesLength = analyser.frequencyBinCount;
        var frequencies = new Float32Array(audioFrequenciesLength);

        var request = new XMLHttpRequest();
        request.open("GET", MUSIC_SRC, true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            sound.decodeAudioData(request.response, function(buffer) {
                var source = sound.createBufferSource();
                source.buffer = buffer;
                source.connect(sound.destination);
                source.connect(analyser);
                source.loop = true;
                source.start(0);

                audioDuration = buffer.duration;

                requestAnimationFrame(analyseDaMusic);
            }, function() {});
        };
        request.send();

        function normalise(frequencies) {
            var min = analyser.minDecibels;
            var max = analyser.maxDecibels;

            for (var i = 0; i < audioFrequenciesLength; i++) {
                var freq = frequencies[i] / (min + max);
                if (freq > 1) {
                    freq = 1;
                }
                frequencies[i] = freq;
            }

            return frequencies;
        }

        function analyseDaMusic(dt) {
            realTime = dt;
            analyser.getFloatFrequencyData(frequencies);
            callback(normalise(frequencies));
            requestAnimationFrame(analyseDaMusic);
        }

    }

    function daSpiral(x, y, r) {
        context.save();
        var numberOfLayers = 20;
        for (var i = 0; i < numberOfLayers; i++) {
            var iTime = realTime - i * 50;
            var spiralTime = iTime + Math.sin(iTime / 1000) * 3000;
            var angle = (spiralTime * .001) % 2 * Math.PI - i * Math.PI / 8;
            var phase = (Math.floor(iTime / 100) + i) % 5;

            context.beginPath();
            context.arc(
                x,
                y,
                r / numberOfLayers * i,
                angle,
                angle + Math.PI,
                true
            );
            context.lineWidth = phase;
            context.stroke();
        }
        context.restore();
    }

    function drawCircle(x, y, r, color) {
        context.save();

        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, r, -Math.PI, Math.PI, true);
        context.fill();

        context.restore();
    }

    function myLittleCircle(x, y, frequencies, ir) {
        var circD = Math.floor(Math.abs(1.0 - frequencies[ir]) * 200);
        var circX = x;
        var circY = y;

        daSpiral(x, y, circD * 0.8);

        var alpha = 0.95;
        var timeSlowingRatio = 0.0001;
        var radgrad = context.createRadialGradient(circX, circY, 0, circX, circY, circD);
        radgrad.addColorStop(0, rgba(255, 255, 255, alpha));
        var col1 = Math.floor(Math.abs(frequencies[modulo(ir - 20, audioFrequenciesLength)] * 255));
        var col2 = Math.floor(Math.abs(frequencies[ir] * 255));
        var col3 = Math.floor(Math.abs(frequencies[modulo(ir + 20, audioFrequenciesLength)] * 255));
        var color = rgba(col1, col2, col3, alpha);
        radgrad.addColorStop(0.8, color);
        radgrad.addColorStop(1, rgba(255, 255, 255, 0));

        drawCircle(circX, circY, circD, radgrad);
    }

    function dot(x, freq) {
        context.save();

        var y = Math.floor(freq * CANVAS_HEIGHT);
        var color1 = Math.floor(freq * 255.0);
        var color2 = Math.floor(freq * 255.0 / 2);
        var color3 = 255 - Math.floor(freq * 255.0);

        context.fillStyle = rgba(color1, color2, color3, 1);
        context.fillRect(x, CANVAS_HEIGHT, 1, (y - CANVAS_HEIGHT) / 2);

        context.restore();
    }

    function line(y) {
        context.save();
        context.fillStyle = rgba(0, 127, 0, 0.4);
        context.fillRect(0, y, CANVAS_WIDTH, 1);
        context.restore();
    }

    function background(color) {
        context.save();
        context.fillStyle = color;
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.restore();
    }

    function foreground(frequencies, colorFill, colorStroke) {
        context.save();
        context.beginPath();
        context.moveTo(0, CANVAS_HEIGHT);
        context.lineTo(0, frequencies[0] * CANVAS_HEIGHT);
        var iter = 20;
        for (var i = iter; i < audioFrequenciesLength - iter; i += iter * 2) {
            context.quadraticCurveTo(
                i, frequencies[i] * CANVAS_HEIGHT,
                i + iter, frequencies[i + iter] * CANVAS_HEIGHT
            );
        }
        context.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        context.fillStyle = colorFill;
        context.fill();
        context.strokeStyle = colorStroke;
        context.stroke();
        context.restore();
    }

    function fallingStar(ox, oy, t, l, dx, dy) {
        var speed = 50000;
        var angle = (t * Math.PI / 2) % (Math.PI / 2) + (Math.PI / 4);
        var x = (ox + t * speed) % (CANVAS_WIDTH + l) - l;
        var y = (oy + t * speed) % (CANVAS_HEIGHT + l) - l;
        context.moveTo(x, y);
        context.lineTo(x + l * Math.cos(angle), y + l * Math.sin(angle));
    }

    function fallingStars(frequencies) {
        context.save();
        context.strokeStyle = rgba(230, 230, 255, 0.8);
        var time = (realTime / 1000 % (audioDuration / 5)) / (audioDuration / 5);
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 20; j++) {
                var index = i * j + j;
                var x = modulo(i * Math.pow(Math.sin(index), 2) * CANVAS_WIDTH / 2 - realTime % CANVAS_WIDTH, CANVAS_WIDTH);
                var y = modulo(j * Math.pow(Math.cos(index), 2) * CANVAS_HEIGHT / 2 - realTime % CANVAS_HEIGHT, CANVAS_HEIGHT);
                fallingStar(x, y, time, 30);
            }
        }
        context.stroke();
        context.restore();
    }

    function circles(frequencies) {
        myLittleCircle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 4, frequencies, 400);
        myLittleCircle(CANVAS_WIDTH / 4, CANVAS_HEIGHT / 4, frequencies, 500);
        myLittleCircle(CANVAS_WIDTH / 4 * 3, CANVAS_HEIGHT / 4, frequencies, 600);

        myLittleCircle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 * 2, frequencies, 0);
        myLittleCircle(CANVAS_WIDTH / 6, CANVAS_HEIGHT / 3 * 2, frequencies, 160);
        myLittleCircle(CANVAS_WIDTH / 6 * 5, CANVAS_HEIGHT / 3 * 2, frequencies, 800);
    }

    function spiralAlone(radius) {
        daSpiral(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, radius * CANVAS_WIDTH / 2);
    }

    function rgba(r, g, b, a) {
        return 'rgba('+r+', '+g+', '+b+', '+a+')';
    }

    function draw(frequencies) {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        var sum = 0;
        for (var i = 0; i < audioFrequenciesLength; i++) {
            sum += frequencies[i];
        }
        var avg = sum / i;
        var smoothAvg = (oldAvg + avg) / 2;
        oldAvg = avg;

        background(rgba(Math.floor((1.2 - smoothAvg) * 127.0) + 127, 166, 110, 1));

        var timeInLoop = modulo(realTime / 1000, audioDuration);
        var sceneDuration = audioDuration / 5;

        function inScene(index) {
            return timeInLoop > sceneDuration * index && timeInLoop <= sceneDuration * (index + 1);
        }

        for (var i = 0; i < audioFrequenciesLength; i += 10) {
            dot(i, frequencies[i]);
        }

        foreground(frequencies, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.6));

        if (inScene(0) || inScene(1)) {
            sum = 0;
            for (var i = 0.0; i < audioFrequenciesLength / 10; i++) {
                sum += frequencies[i];
            }
            var avgBass = sum / i;
            var radius = 0.6;
            if (frequencies[10] < 0.43) {
                radius = 0.8;
            }
            spiralAlone(radius);
        }
        else if (inScene(2) || inScene(3)) {
            circles(frequencies);
        }
        else if (inScene(4)) {
            fallingStars(frequencies);
        }

        //line(((Math.floor(avg * CANVAS_HEIGHT)) + CANVAS_HEIGHT) / 2);
    }

    prepDaMusic(draw);
}(window));
