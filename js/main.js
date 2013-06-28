(function(window) {
    'use strict';
    var FPS = 30;
    var CANVAS_WIDTH = 800;
    var CANVAS_HEIGHT = 600;

    var canvas = document.getElementById('stage');
    canvas.setAttribute("width", CANVAS_WIDTH);
    canvas.setAttribute("height", CANVAS_HEIGHT);
    var context = canvas.getContext('2d');
    var dt = 1000 / FPS;

    var realTime = 0;

    function update(dt) {
        realTime += dt;

    }

    function draw() {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Spiral
        for (var i = 0; i < 30; i++) {
            var iTime = realTime - i * 50;
            var spiralTime = iTime + Math.sin(iTime / 1000) * 3000;
            var angle = (spiralTime * .001) % 2 * Math.PI - i * Math.PI / 8;
            var phase = (Math.floor(iTime / 100) + i) % 5;

            context.beginPath();
            context.arc(
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT / 2,
                i * 5,
                angle,
                angle + 3 * Math.PI / 4, true
            );
            context.lineWidth = phase;
            context.stroke();
        }
    }

    setInterval(function() {
        update(dt);
        draw();
    }, dt);
}(window));
