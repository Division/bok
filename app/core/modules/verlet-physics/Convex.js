var Class = require('Class');

/**
 * @class Convex
 */
module.exports = Class.extend({

    /**
     * List of particles connected into a convex
     */
    particles: null,

    /**
     * Axis aligned bounding box
     * Object containing min and max points
     */
    aabb: null,

    /**
     * Position of the bounding circle
     */
    center: null,

    initialize: function(particles) {

        this.aabb = {
            'min': new Point(),
            'max': new Point()
        };

        this.center = new Point();

        this.setParticles(particles);
    },


    addParticle: function(particle) {
        this.particles.push(particle);
    },


    updateBounds: function() {

        if (this.particles.length) {
            var min = this.aabb.min,
                max = this.aabb.max;

            min.copyFrom(this.particles[0].position);
            max.copyFrom(this.particles[0].position);

            for (var i = 0; i < this.particles.length; i++) {
                var position = this.particles[i].position;

                min.x = Math.min(this.aabb.min.x, position.x);
                min.y = Math.min(this.aabb.min.y, position.y);
                max.x = Math.max(this.aabb.max.x, position.x);
                max.y = Math.max(this.aabb.max.y, position.y);
            }

            this.center.setTo((max.x + min.x) / 2, (max.y + min.y) / 2);

        } else {
            this.aabb.min.setTo(0,0);
            this.aabb.max.setTo(0,0);
            this.center.setTo(0,0);
        }
    },


    setParticles: function(particles) {

        this.particles = particles || [];
        this.updateBounds();
    },


    getEdgeCount: function() {

        return this.particles.length;
    },

    /**
     * Returns array of two particles for the edge
     */
    getEdgeForIndex: function(index) {

        return [this.particles[index], (this.particles.index + 1) % this.getEdgeCount()];
    }

});
