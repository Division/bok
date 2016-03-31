var Point = require("./Point");
var Class = require("Class");

/**
 * @class Constraint
 */
module.exports = Class.extend({

    /**
     * Distance between particles will be equal to length
     */
    TYPE_EQUAL: 0,

    /**
     * Distance will be greater or equal to length
     */
    TYPE_GREATER: 1,

    /**
     * Distance will be less or equal to length
     */
    TYPE_LESS: 2,

    particle1: null,
    particle2: null,
    stiffness: null,
    length: null,
    type: 0,
    enabled: true,

    initialize: function (particle1, particle2, stiffness, length) {

        this.particle1 = particle1;
        this.particle2 = particle2;
        this.stiffness = stiffness;
        this.length = length;
        this.type = this.TYPE_EQUAL;

        if (stiffness === undefined) {
            this.stiffness = 1;
        }

        if (length === undefined) {
            this.length = Point.distance(particle1.position, particle2.position);
        }
    }

});

