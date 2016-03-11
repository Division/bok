var Particle = function (position, mass) {
    this.set(position, mass);
};


Particle.prototype = {

    set: function (position, mass, acceleration) {
        this.position = position;
        this.prevPosition = position.clone();

        this.setMass(mass);

        if (acceleration === undefined) {
            acceleration = new Point(0, 0);
        }

        this.acceleration = acceleration;
    },

    setMass: function(mass) {
        if (mass === undefined) {
            mass = 1;
        }
        this.mass = mass;
        if (mass > 0) {
            this.invMass = 1 / mass;
        } else {
            this.invMass = 0;
            this.mass = 0;
        }
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
