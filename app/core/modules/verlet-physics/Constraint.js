var Constraint = function (particle1, particle2, stiffness, length) {

    this.particle1 = particle1;
    this.particle2 = particle2;
    this.stiffness = stiffness;
    this.length = length;

    if (stiffness === undefined) {
        this.stiffness = 1;
    }

    if (length === undefined) {
        this.length = Point.distance(particle1.position, particle2.position);
    }
};


Constraint.prototype = {};

Constraint.prototype.constructor = Constraint;

module.exports = Constraint;
