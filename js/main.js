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

        // var gameTime = realTime - Math.floor(realTime / 1000) * 200
        var gameTime = realTime + Math.sin(realTime / 1000) * 2000;
        // console.log("gameTime", realTime, gameTime)

        var angle = (gameTime * .001) % 2 * Math.PI;

        context.beginPath();
        context.arc(75, 75, 50, angle, angle + 3 * Math.PI / 4, true);
        context.stroke();
    }

    setInterval(function() {
        update(dt);
        draw();
    }, dt);
}(window));
