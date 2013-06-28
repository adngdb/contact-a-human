(function(window) {
    'use strict';
    var FPS = 30;
    var CANVAS_WIDTH = 800;
    var CANVAS_HEIGHT = 600;

    var canvas = document.getElementById('stage');
    var context = canvas.getContext('2d');
    var dt = 1000 / FPS;

    var arcProgress = 0;

    function update(dt) {
        arcProgress += dt * 0.001;
    }

    function draw() {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        context.beginPath();
        context.arc(75, 75, 50, arcProgress * Math.PI, arcProgress * Math.PI - Math.PI / 2, true);
        context.stroke();
    }

    setInterval(function() {
        update(dt);
        draw();
    }, dt);
}(window));
