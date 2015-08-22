/**
 * Created by JetBrains PhpStorm.
 * User: attrib
 * Date: 19.02.12
 * Time: 11:38
 */

var tanks = {

    items: [],
    counter: 0,
    map: false,

    width:  15,
    height: 10,
    speed:   1,
    rotationSpeed:      Math.PI / 180,
    canonRotationSpeed: Math.PI / 180,


    draw: function(context) {
        if (this.items.length > 0) {
            $(this.items).each(function(i, tank) {
                tank.draw(context);
            });
        }
    },

    createTank: function(config) {
        config.id = this.counter;
        var tank = new Tank(config);
        this.items.push(tank);
        tank.respawn();
        this.counter++;
        return tank;
    },

    removeTank: function(id) {
        var index = -1;
        $(this.items).each(function(i, tank) {
            if (tank.getId() == id) {
                index = i;
            }
        });
        if (index >= 0) {
            this.items.splice(index, 1);
        }
    },

    setMap: function(omap) {
        this.map = omap;
        this.width = omap.getBlockWidth() * 0.8;
        this.height = omap.getBlockHeight() * 0.5;
        this.speed = omap.getBlockWidth() / 16;
    },

    hitTank: function(x, y) {
        var testTank = false;
        $(this.items).each(function(i, tank) {
            if (tank.hitTank(x, y)) {
                testTank = tank;
                return;
            }
        });
        return testTank;
    }

};

function Tank(config) {

    var x = 0;
    var y = 0;
    var rotation = 0;
    var canonRotation = 0;
    var color = config.color;
    var sprites = config.sprites;

    this.draw = function(context) {
        context.save();
        var sin = Math.sin(rotation - Math.PI);
        var cos = Math.cos(rotation - Math.PI);
        context.setTransform(cos, sin, -sin, cos, x, y);
        context.drawImage(sprites, 0, 0, 128, 128, - tanks.width, -tanks.height - 3, tanks.width * 1.5, tanks.height * 3);

        //context.setTransform(cos, sin, -sin, cos, x, y);
        //context.rect(-tanks.width/2, -tanks.height/2, tanks.width, tanks.height);
        //context.lineWidth = 2;
        //context.strokeStyle = color;
        //context.stroke();

        context.rotate(canonRotation - Math.PI);
        context.fillStyle = color;
        context.fillRect(-tanks.width/8, -tanks.height/8, 3*tanks.width/3, tanks.height/4);
        context.restore();
    };

    this.move = function(i) {
        var newX = x + Math.cos(rotation)*tanks.speed*i;
        var newY = y + Math.sin(rotation)*tanks.speed*i;
        if (!hitMapCheck(newX, newY)) {
            var coords = tanks.map.jumpBorder(newX, newY);
            x = coords[0];
            y = coords[1];
        }
    };

    var hitMapCheck = function(x, y) {
        if (tanks.map.hitCheck(x+tanks.width/2, y, this) ||
            tanks.map.hitCheck(x-tanks.width/2, y, this) ||
            tanks.map.hitCheck(x, y+tanks.width/2, this) ||
            tanks.map.hitCheck(x, y-tanks.width/2, this)
            ) {
            return true;
        }
        return false;
    };

    this.hitTank = function(tX, tY) {
        if ( Math.pow(tX-x, 2) + Math.pow(tY-y, 2) < Math.pow(tanks.width, 2) ) {
            return true;
        }
        return false;
    };

    this.rotate = function(i) {
        rotation += tanks.rotationSpeed * i;
        if (rotation < 0) rotation = 2 * Math.PI + rotation;
        if (rotation > 2 * Math.PI) rotation = rotation - 2 * Math.PI;
    };

    this.canonRotate = function(i) {
        canonRotation += tanks.canonRotationSpeed * i;
        if (canonRotation < 0) canonRotation = 2 * Math.PI + canonRotation;
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

    this.respawn = function() {
        var coords = tanks.map.getRandomLocation();
        x = coords[0];
        y = coords[1];
        rotation = 0;
        canonRotation = 0;
    };

    this.getId = function() {
        return config.id;
    };

}
