var Class = require('Class');
var Point = require("core/verlet-physics/Point");

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

    /**
     * Static convexes can't be moved by collision response, gravity etc
     */
    isStatic: false,

    /**
     * Array of helper particles that don't form collision edges
     */
    helperParticles: null,

    /**
     * Array of Points to set corresponding particle positions
     */
    staticParticlePositions: null,

    initialize: function(particles) {

        this.aabb = {
            'min': new Point(),
            'max': new Point()
        };

        this.center = new Point();
        this.helperParticles = [];
        this.staticParticlePositions = [];

        this.setParticles(particles);
    },


    addParticle: function(particle) {
        this.particles.push(particle);
    },


    addHelperParticle: function(particle) {
        this.helperParticles.push(particle);
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


    /**
     * Marks convex as static and creates snapshot of positions which will be kept
     */
    setStatic: function(isStatic, mass) {
        if (isStatic === undefined) {
            isStatic = true;
        }

        if (mass === undefined) {
            mass = 0;
        }

        this.isStatic = isStatic;

        this.staticParticlePositions = [];
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].setMass(mass);
            if (isStatic) {
                this.staticParticlePositions.push(this.particles[i].position.clone());
            }
        }

        if (isStatic) {
            for (i = 0; i < this.helperParticles.length; i++) {
                this.particles[i].setMass(mass);
                this.staticParticlePositions.push(this.helperParticles[i].position.clone());
            }
        }
    },

    fixStaticPosition: function() {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].position.copyFrom(this.staticParticlePositions[i]);
        }

        for (i = 0; i < this.helperParticles.length; i++) {
            this.helperParticles[i].position.copyFrom(this.staticParticlePositions[i + this.particles.length]);
        }

    },

    setParticles: function(particles) {
        this.particles = particles || [];
        this.updateBounds();
    },


    getEdgeCount: function() {
        return this.particles.length;
    },

    applyForce: function(force) {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].applyForce(force);
        }
    },

    containsPoint: function(point) {
        for (var i = 0; i < this.particles.length; i++) {
            var particle1 = this.particles[i];
            var particle2 = this.particles[(i + 1) % this.particles.length];

            if (Point.ord(point, particle1.position, particle2.position) > 0) {
                return false;
            }
        }

        return true;
    },

    /**
     * Returns array of two particles for the edge
     */
    getEdgeForIndex: function(index) {
        return [this.particles[index], (this.particles.index + 1) % this.getEdgeCount()];
    }

});
