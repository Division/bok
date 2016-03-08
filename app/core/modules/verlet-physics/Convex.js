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
     * Position of the bounding circle
     */
    center: null,

    initialize: function(particles) {
        console.log('setting particles');
        this.setParticles(particles);
    },

    addParticle: function(particle) {
        this.particles.push(particle);
    },

    updateCenter: function() {
        if (this.particles.length) {
            this.center = new Point(0, 0);
            for (var i = 0; i < this.particles.length; i++) {
                this.center.addPoint(this.particles[i].position);
            }

            this.center.divide(this.particles.length);
        }
    },

    setParticles: function(particles) {
        this.particles = particles || [];
        //this.updateBoundingCircle();
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
