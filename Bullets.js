/**
 * Created by JetBrains PhpStorm.
 * User: attrib
 * Date: 19.02.12
 * Time: 11:43
 */

var bullets = {

    items: [],
    counter: 0,
    map: false,

    radius: 1.5,
    speed: 1.5,

    tick: function() {
        if (this.items.length > 0) {
            $(this.items).each(function(i, bullet) {
                bullet.fly();
            });
        }
    },

    draw: function(context) {
        if (this.items.length > 0) {
            $(this.items).each(function(i, bullet) {
                bullet.draw(context);
            });
        }
    },

    createBullet: function(x, y, tank) {
        x += Math.cos(tank.getCanonRotation())*tanks.width;
        y += Math.sin(tank.getCanonRotation())*tanks.width;
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
    },

    setMap: function(oMap) {
        this.map = oMap;
        this.radius = oMap.getBlockWidth()/10;
        this.speed  = oMap.getBlockWidth()/10;
    }

};

function Bullet(id, ox, oy, tank) {

    var x = ox;
    var y = oy;

    this.draw = function(context) {
        context.save();
        context.setTransform(-1, 0, 0, 1, x, y);
        context.beginPath();
        context.arc(0, 0, bullets.radius, 0, 2*Math.PI, false);
        context.fill();
        context.restore();
    };

    this.fly = function() {
        x += Math.cos(tank.getCanonRotation())*bullets.speed;
        y += Math.sin(tank.getCanonRotation())*bullets.speed;
        if (bullets.map.hitCheck(x, y, this)) {
            bullets.removeBullet(id);
        }
        else {
            var coords = bullets.map.jumpBorder(x, y);
            x = coords[0];
            y = coords[1];
            var testTank = tanks.hitTank(x, y);
            if (testTank != false) {
                bullets.removeBullet(id);
                testTank.respawn();
            }
        }
        redraw();
    };

    this.getId = function() {
        return id;
    }

}