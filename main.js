/**
 * Created by JetBrains PhpStorm.
 * User: attrib
 * Date: 18.02.12
 * Time: 23:28
 */

var context;
var items = [];
var player = new Player();

$(document).ready(function () {
    var main = $('#game');
    var canvas = $('<canvas id="canvas" width="800" height="592"></canvas>');
    canvas = canvas.get(0);
    main.append(canvas);

    if (canvas.getContext){
        context = canvas.getContext('2d');

        var map = new Map();
        items.push(map);

        var playerTank = new Tank({x: 50, y: 50, color: "rgb(200,0,0)"});
        items.push(playerTank);

        player.init(playerTank);

        redraw();

    } else {
        alert('Not supported');
    }
});

var draw_dirty = false;
function draw() {
    bullets.fly();
    if (draw_dirty) {
        var elem = $("canvas");
        var canvas = elem.get(0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        $(items).each(function(i, item) {
            item.draw();
        });
        bullets.draw();
    }
    draw_dirty = false;
}
setInterval(draw, 40);

function redraw() {
    draw_dirty = true;
}

function Map() {

    var width = 16;
    var height = 16;

    this.draw = function() {
        for (var x = 0; x <= 49; x++) {
            for (var y = 0; y <= 36; y++) {
                if (x == 0 || x == 49 || y == 0 || y == 36 ) {
                    emptyBlock(x,y);
                }
                else {
                    wallBlock(x,y);
                }
            }
        }
    };

    var emptyBlock = function(x,y) {
        context.fillStyle = "rgb(20,20,20)";
        context.fillRect(x*width, y*height, width, height);
    };

    var wallBlock = function(x,y) {
        context.fillStyle = "rgb(255,255,255)";
        context.fillRect(x*width, y*height, width, height);
    };

}

function Tank(config) {

    var width  = 15;
    var height = 10;
    var speed  =  1;
    var rotationSpeed = Math.PI / 180;
    var canonRotationSpeed = Math.PI / 180;

    var x = config.x;
    var y = config.y;
    var rotation = 0;
    var canonRotation = 0;
    var color = config.color;

    this.draw = function() {
        context.save();
        var sin = Math.sin(rotation);
        var cos = Math.cos(rotation);
        context.setTransform(cos, sin, -sin, cos, x, y);
        context.fillStyle = color;
        context.fillRect(-width/2, -height/2, width, height);

        context.rotate(canonRotation);
        context.fillStyle = "rgb(200,200,200)";
        context.fillRect(-width/8, -height/8, width, height/4);
        context.restore();
    };

    this.forward = function() {
        x += Math.cos(rotation)*speed;
        y += Math.sin(rotation)*speed;
    };

    this.backward = function() {
        x -= Math.cos(rotation)*speed;
        y -= Math.sin(rotation)*speed;
    };

    this.left = function() {
        rotation -= rotationSpeed;
        if (rotation < 0) rotation = 2 * Math.PI + rotation;
    };

    this.right = function() {
        rotation += rotationSpeed;
        if (rotation > 2 * Math.PI) rotation = rotation - 2 * Math.PI;
    };

    this.canonLeft = function() {
        canonRotation -= canonRotationSpeed;
        if (canonRotation < 0) canonRotation = 2 * Math.PI + canonRotation;
    };

    this.canonRight = function() {
        canonRotation += canonRotationSpeed;
        if (canonRotation > 2 * Math.PI) canonRotation = canonRotation - 2 * Math.PI;
    };

    this.shoot = function() {
        bullets.createBullet(x, y, this);
    };

    this.getCanonRotation = function() {
        var rot = rotation + canonRotation;
        if (rot > 2 * Math.PI) {
            rot = rot - 2 * Math.PI;
        }
        else if (rot < 0) {
            rot =  2 * Math.PI - rot;
        }
        return rot;
    };

}

var bullets = {

    items: [],
    counter: 0,

    fly: function() {
        if (this.items.length > 0) {
            $(this.items).each(function(i, bullet) {
                bullet.fly();
            });
        }
    },

    draw: function() {
        if (this.items.length > 0) {
            $(this.items).each(function(i, bullet) {
                bullet.draw();
            });
        }
    },

    createBullet: function(x, y, tank) {
        this.items.push(new Bullet(this.counter, x, y, tank));
        this.counter++;
    },

    removeBullet: function(id) {
        var index = -1;
        $(this.items).each(function(i, bullet) {
            if (bullet.getId() == id) {
                index = i;
            }
        });
        if (index >= 0) {
            this.items.splice(index, 1);
        }
    }

};

function Bullet(id, ox, oy, tank) {

    var x = ox;
    var y = oy;

    var radius = 2;
    var speed = 1;

    this.draw = function() {
        context.save();
        context.setTransform(-1, 0, 0, 1, x, y);
        console.log(x, y);
        context.beginPath();
        context.arc(0, 0, radius, 0, 2*Math.PI, false);
        context.fill();
        context.restore();
    };

    this.fly = function() {
        x += Math.cos(tank.getCanonRotation())*speed;
        y += Math.sin(tank.getCanonRotation())*speed;
        if (x > 800 || y > 592 || x < 0 || y < 0) {
            bullets.removeBullet(id);
        }
        redraw();
    };

    this.getId = function() {
        return id;
    }

}

function Player() {

    var tank;

    this.init = function(playerTank) {
        tank = playerTank;
        $(document).bind('keydown', this.keydown);
    };

    this.keydown = function(event) {
        var keycode = event.keyCode;
        //console.log(keycode);
        switch(keycode) {
            case 38:
                tank.forward();
                break;
            case 40:
                tank.backward();
                break;
            case 39:
                tank.right();
                break;
            case 37:
                tank.left();
                break;
            case 65: //A
                tank.canonLeft();
                break;
            case 68: //D
                tank.canonRight();
                break;
            case 32: //space
                tank.shoot();
                break;
        }
        redraw();
    };
}