/**
 * Created by Nikita Sidorenko on 3/15/16.
 */
var BaseEntity  = require("game/base/BaseEntity");
var Constraint = require("core/verlet-physics/Constraint");
var Point = require("core/verlet-physics/Point");

module.exports = BaseEntity.extend({

    NUM_PARTICLES: 17,

    PARTICLE_MASS_LIGHT: 0.001,
    PARTICLE_MASS_HEAVY: 0.3,

    CONSTRAINT_RESTLENGTH: 38,
    CONSTRAINT_SHORTLENGTH: 9,
    CONSTRAINT_STIFFNESS_FIRED: 1,
    CONSTRAINT_STIFFNESS_ATTACHED: 0.4,

    ACCELERATION_VALUE: 25,

    STATE_HIDDEN: 0,
    STATE_FIRED: 1,
    STATE_ATTACHED: 2,

    /**
     * Rope becomes visible after fire
     */
    isVisible: false,

    /**
     * List of particles that form the rope
     */
    particles: null,

    /**
     * Array of constraints for the rope
     */
    constraints: null,

    /**
     * Rope first end will be attached to this particle
     * When fire rope will appear from the parent particle as well
     */
    parentParticle: null,

    /**
     * Convex that must be ignored on rope collision detection
     */
    parentConvex: null,

    /**
     * Can be in three states: hidden, fired and attached
     */
    state: 0,

    initialize: function(parentParticle, parentConvex) {
        this.parentParticle = parentParticle;
        this.parentConvex = parentConvex;
        this.particles = [];
        this.constraints = [];
        this.state = this.STATE_HIDDEN;
    },

    start: function() {
        this.initParticlesAndConstraints();
    },

    setEnabledState: function(enabled) {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].enabled = enabled;
        }

        for (i = 0; i < this.constraints.length; i++) {
            this.constraints[i].enabled = enabled;
        }
    },

    setupConstraintsForAttachedState: function(isAttached) {
        for (var i = 1; i < this.constraints.length; i++) {
            this.constraints[i].length = isAttached ? this.CONSTRAINT_SHORTLENGTH : this.CONSTRAINT_RESTLENGTH;
            this.constraints[i].stiffness = isAttached ? this.CONSTRAINT_STIFFNESS_ATTACHED : this.CONSTRAINT_STIFFNESS_FIRED
        }
    },

    initParticlesAndConstraints: function() {
        var physics = this.engine.physics;
        for (var i = 0; i < this.NUM_PARTICLES; i++) {
            var particle = physics.createParticle(this.parentParticle.position, this.PARTICLE_MASS_LIGHT);
            this.particles.push(particle);

            var constraint = null;
            if (i == 0) {
                constraint = physics.createConstraint(particle, this.parentParticle, 1, 0.01); // Zero length constraint
            } else {
                constraint = physics.createConstraint(particle, this.particles[i - 1], 1, this.CONSTRAINT_RESTLENGTH);
                constraint.type = Constraint.TYPE_LESS;
            }

            this.constraints.push(constraint);
        }

        this.setEnabledState(false);
    },

    setupMasses: function(isLight) {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].setMass(isLight ? this.PARTICLE_MASS_LIGHT : this.PARTICLE_MASS_HEAVY);
        }
    },

    fire: function(direction) {
        //if (this.state == this.STATE_HIDDEN) {
            this.hide();
            this.setEnabledState(true);
            this.setupConstraintsForAttachedState(false);
            this.accelerateParticles(direction);
            this.state = this.STATE_FIRED;
        //} else {
        //    this.hide();
        //}
    },

    accelerateParticles: function(direction) {
        var force = Point.multiplyFloat(direction, this.ACCELERATION_VALUE);
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].setPosition(this.parentParticle.position);
            if (i > 0) {
                this.particles[i].applyForce(force);
            }
        }
    },

    pinRope: function(point) {
        this.particles[this.particles.length - 1].setPosition(point);
        this.setupMasses(false);
        this.particles[this.particles.length - 1].setMass(0);
        this.setupConstraintsForAttachedState(true);
        this.state = this.STATE_ATTACHED;
    },

    update: function() {

        if (this.state == this.STATE_FIRED) {
            var collisionInfo = {};
            for (var i = 0; i < this.particles.length; i++) {
                var particle = this.particles[i];
                if (this.physics.collision.collisionPoint(particle.position, collisionInfo, [this.parentConvex])) {
                    this.pinRope(particle.position);
                    break;
                }
            }
        }
    },

    hide: function() {
        if (this.state != this.STATE_HIDDEN) {
            this.setupMasses(true);
            this.setEnabledState(false);
            this.state = this.STATE_HIDDEN;
        }
    },

    render: function() {

    }

});
