var Particle = function (position, velocity) {

    this.set(position);
};


Particle.prototype = {

    set: function (position, acceleration) {
        this.position = position;
        this.prevPosition = position.clone();

        if (acceleration === undefined) {
            acceleration = new Point(0, 0);
        }

        this.acceleration = acceleration;
    },

    push: function (delta) {
        this.position.addPoint(delta);
        //this.velocity.addPoint(delta);
    },

    setPosition: function(position) {
        var delta = Point.subtract(this.position, position);
        this.push(delta);
    },

    getSpeed: function() {
        return Point.subtract(this.position, this.prevPosition);
    },

    applyForce: function(forceVector) {
        this.prevPosition.subtract(forceVector);
    }
};

Particle.prototype.constructor = Particle;

module.exports = Particle;
