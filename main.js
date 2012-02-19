/**
 * Created by JetBrains PhpStorm.
 * User: attrib
 * Date: 18.02.12
 * Time: 23:28
 */

var context;
var player = new Player();
var map;
var stats;
var windowHeight = 592;
var windowWidth  = 800;

$(document).ready(function () {
    var main = $('#game');
    var canvas = $('<canvas id="canvas" width="'+windowWidth+'" height="'+windowHeight+'"></canvas>');
    canvas = canvas.get(0);
    main.append(canvas);

    if (canvas.getContext){
        context = canvas.getContext('2d');

        map = new Map();
        tanks.setMap(map);
        bullets.setMap(map);
        var playerTank = tanks.createTank({color: "rgb(200,0,0)"});
        player.init(playerTank);

        redraw();

        stats = new Stats();

        // Align top-left
        stats.getDomElement().style.position = 'absolute';
        stats.getDomElement().style.right = '0px';
        stats.getDomElement().style.top = '0px';

        document.body.appendChild( stats.getDomElement() );

        setInterval(tick, 1000 / 60);

    } else {
        alert('Not supported');
    }
});

var draw_dirty = false;
function tick() {
    player.tick();
    bullets.tick();
    if (draw_dirty) {
        var elem = $("canvas");
        var canvas = elem.get(0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        map.draw(context);
        tanks.draw(context);
        bullets.draw(context);
    }
    draw_dirty = false;
    stats.update();
}

function redraw() {
    draw_dirty = true;
}

function Map() {

    const MAP_CHARS = {EMPTY: ' ', FILL: 'X'};

    var items = [
        ['X', 'X', ' ', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', 'X', 'X'],
        ['X', 'X', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', 'X', 'X'],
        ['X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X'],
        ['X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X'],
        ['X', 'X', ' ', ' ', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', 'X', 'X', 'X', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', 'X'],
        ['X', 'X', 'X', 'X', 'X', 'X', 'X', ' ', ' ', 'X', 'X', 'X', 'X', ' ', ' ', 'X', 'X', ' ', ' ', 'X', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['X', 'X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', 'X', ' ', ' ', 'X', 'X', 'X', ' ', 'X', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', 'X', 'X', 'X', 'X'],
        ['X', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', ' ', 'X', ' ', 'X', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', 'X', 'X', 'X', 'X', ' ', ' ', 'X', ' ', ' ', ' ', ' ', 'X'],
        [' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', ' ', 'X', ' ', 'X', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' '],
        ['X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', 'X', ' ', 'X', 'X', ' ', ' ', 'X', ' ', ' ', ' ', ' ', 'X'],
        ['X', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', 'X', 'X', 'X', 'X', ' ', 'X', 'X', ' ', ' ', 'X', 'X', 'X', 'X', ' ', 'X'],
        ['X', ' ', 'X', 'X', ' ', ' ', ' ', ' ', 'X', ' ', 'X', ' ', 'X', 'X', 'X', ' ', ' ', 'X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X'],
        ['X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', 'X', 'X'],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', 'X', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['X', 'X', 'X', ' ', 'X', 'X', 'X', ' ', 'X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', 'X', 'X', 'X', 'X', ' ', ' ', 'X', 'X'],
        ['X', 'X', 'X', ' ', 'X', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', 'X', ' ', ' ', 'X', 'X', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', 'X', 'X'],
        ['X', 'X', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', 'X', 'X', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', 'X', 'X'],
        ['X', 'X', 'X', ' ', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', 'X', 'X', 'X', 'X', ' ', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X'],
        ['X', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', 'X', 'X', ' ', 'X', 'X', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X'],
        ['X', ' ', 'X', ' ', 'X', 'X', 'X', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X'],
        ['X', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', 'X', 'X', ' ', ' ', 'X', 'X'],
        ['X', 'X', ' ', 'X', 'X', ' ', ' ', 'X', 'X', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', 'X', 'X'],
        ['X', 'X', ' ', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', ' ', ' ', ' ', ' ', 'X', 'X', ' ', ' ', 'X', 'X']];

    var columns = items[0].length;
    var rows = items.length;

    var width = windowWidth / columns;
    var height = windowHeight / rows;

    this.draw = function(context) {
        for (var x = 0; x < columns; x++) {
            for (var y = 0; y < rows; y++) {
                if (items[y][x] == MAP_CHARS.EMPTY) {
                    emptyBlock(context, x,y);
                }
                else if (items[y][x] == MAP_CHARS.FILL) {
                    wallBlock(context, x,y);
                }
            }
        }
    };

    var emptyBlock = function(context, x,y) {
        context.fillStyle = "rgb(240,240,240)";
        context.fillRect(x*width, y*height, width, height);
    };

    var wallBlock = function(context, x,y) {
        context.fillStyle = "rgb(20,20,20)";
        context.fillRect(x*width, y*height, width, height);
    };

    this.getBlockWidth = function() {
        return width;
    };

    this.getBlockHeight = function() {
        return height;
    };

    this.getRandomLocation = function() {
        var coords = false;
        var x, y;
        while(!coords) {
            x = parseInt(Math.random()*columns);
            y = parseInt(Math.random()*rows);
            if (items[y][x] == MAP_CHARS.EMPTY) {
                coords = [x*width+width/2, y*height+height/2];
            }
        }
        return coords;
    };

    this.jumpBorder = function(x, y) {
        if ( x < 0) {
            x += windowWidth;
        }
        if ( x > windowWidth ) {
            x -= windowWidth;
        }
        if ( y < 0 ) {
            y += windowHeight;
        }
        if ( y > windowHeight ) {
            y -= windowHeight;
        }
        return [x, y];
    };

    this.hitCheck = function(x, y, obj) {
        x = parseInt(x / width);
        y = parseInt(y / height);
        if (items[y] && items[y][x]) {
            return items[y][x] != MAP_CHARS.EMPTY;
        }
        return false;
    };

}

function Player() {

    var tank;

    var keys = {};

    this.init = function(playerTank) {
        tank = playerTank;
        $(document).bind('keydown', function(event) {keys[event.keyCode] = true;});
        $(document).bind('keyup', function(event) {keys[event.keyCode] = false;});
        $(document).bind('keypress', function(event) {
            switch (event.charCode) {
                case 32:
                    tank.shoot();
                    break;
            }
        });
    };

    this.tick = function() {
        var doRedraw = false;
        if (keys[38]) {
            tank.move(1);
            doRedraw = true;
        }
        if (keys[40]) {
            tank.move(-1);
            doRedraw = true;
        }
        if (keys[39]) {
            tank.rotate(1);
            doRedraw = true;
        }
        if (keys[37]) {
            tank.rotate(-1);
            doRedraw = true;
        }
        if (keys[65]) {
            tank.canonRotate(-1);
            doRedraw = true;
        }
        if (keys[68]) {
            tank.canonRotate(1);
            doRedraw = true;
        }
        if (doRedraw) {
            redraw();
        }
    };
}
