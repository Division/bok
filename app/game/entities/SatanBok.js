var BaseEntity = require('game/base/BaseEntity');
var KeyCodes = require('core/input/KeyCodes');
var Point = require("core/verlet-physics/Point");
var Rope = require("game/entities/Rope");
var Constraint = require("core/verlet-physics/Constraint");

/**
 * @class SatanBok
 */
module.exports = BaseEntity.extend({

    POINT_COUNT: 8,
    RADIUS: 50,
    MASS: 1,
    ROTATE_FORCE: 1.3,

    particles: null,

    mouseControls: false,

    convex: null,

    initialPosition: null,

    rope: null,

    innerConstraints: null,

    isKilled: false,

    fireEnabled: true,

    followCamera: true,

    initialize: function(position) {
        this.initialPosition = new Point(position.x, position.y);
        this.mouseControls = true;

        this.innerConstraints = [];
    },

    start: function() {
        this.setupAtPosition(this.initialPosition);
        if (this.mouseControls) {
            this.engine.mouse.on("down", this.onMouseClick, this);
        }
    },

    onMouseClick: function(position, button) {
        if (button == 0) {
            this.fire(position);
        } else {
            this.rope.hide();
        }
    },

    fire: function(position) {
        if (!this.fireEnabled) {
            return;
        }

        var point = new Point(position[0], position[1]);
        var direction = Point.subtract(point, this.particles[0].position, point).normalize();
        this.rope.fire(direction);
    },

    setStatic: function() {
        this.convex.setStatic(true, 0);
    },

    setupAtPosition: function(position) {

        this.particles = [];

        // First particle is center
        this.particles.push(this.engine.physics.createParticle(position, this.MASS));

        // Convex to
        var convex = this.engine.physics.createConvex();

        convex.addHelperParticle(this.particles[0]);

        // Others are added along the circle
        for (var i = 0; i < this.POINT_COUNT; i++) {
            var angle = Math.PI * 2 * i / this.POINT_COUNT + 0.1,
                point = new Point(Math.cos(angle) * this.RADIUS + position.x, Math.sin(angle) * this.RADIUS + position.y),
                particle = this.engine.physics.createParticle(point, this.MASS);
            this.particles.push(particle);
            convex.addParticle(particle);
        }

        for (i = 1; i <= this.POINT_COUNT; i++) {
            var innerConstraint = this.engine.physics.createConstraint(this.particles[i], this.particles[0], 0.8);
            this.innerConstraints.push(innerConstraint);

            var nextIndex = i < this.POINT_COUNT ? i + 1 : 1;
            this.engine.physics.createConstraint(this.particles[i], this.particles[nextIndex], 0.8);
        }

        convex.updateBounds();

        this.rope = new Rope(this.particles[0], convex);
        this.game.addEntity(this.rope);
        this.convex = convex;
    },

    kill: function() {
        if (this.isKilled) {
            return;
        }

        this.isKilled = true;

        for (var i = 0; i < this.innerConstraints.length; i++) {
            this.innerConstraints[i].type = Constraint.TYPE_GREATER;
            this.innerConstraints[i].length = 30;
        }
    },

    /**
     * Update is called after all the core subsystems (Input, Tweens, Sound, etc) and the State have updated,
     * but before the render. It is only called if active is set to true.
     */
    update: function() {

        if (this.isKilled) {
            this.particles[0].setPosition(this.convex.center);
            return;
        }

        if (this.particles && this.mouseControls) {

            var rotateForceLeft = new Point();
            var rotateForceRight = new Point();
            var rotatAmmount = this.ROTATE_FORCE;
            if (this.engine.keyboard.isDown('A'.charCodeAt(0))) {
                rotateForceLeft.y = rotatAmmount;
                rotateForceRight.y = -rotatAmmount;
            }
            if (this.engine.keyboard.isDown('D'.charCodeAt(0))) {
                rotateForceLeft.y = -rotatAmmount;
                rotateForceRight.y = rotatAmmount;
            }

            var rotateParticles = this.getLeftRightParticle();
            rotateParticles[0].applyForce(rotateForceLeft);
            rotateParticles[1].applyForce(rotateForceRight);

            if (this.followCamera) {
                this.engine.camera.setPosition(this.particles[0].position.x, this.particles[0].position.y);
            }
        }

        var targetPosition = new Point(this.engine.mouse.worldPosition[0], this.engine.mouse.worldPosition[1]);
        var targetDirection = Point.subtract(targetPosition, this.particles[0].position).multiply(0.001);

        if (targetDirection.getMagnitude() > 3) {
            targetDirection.normalize();
            targetDirection.multiply(0.005);
        }

        if (this.game.engine.mouse.isDown && !this.convex.isStatic) {
            this.convex.applyForce(targetDirection);
        }

    },

    getLeftRightParticle: function() {
        var leftIndex = 1;
        var rightIndex = 1;
        var minLeft = this.particles[1].position.x;
        var maxRight = minLeft;

        for (var i = 0; i < this.particles.length; i++) {
            if (this.particles[i].position.x < minLeft) {
                minLeft = this.particles[i].position.x;
                leftIndex = i;
            }

            if (this.particles[i].position.x > maxRight) {
                maxRight = this.particles[i].position.x;
                rightIndex = i;
            }
        }

        return [this.particles[leftIndex], this.particles[rightIndex]];
    },

    /**
     * Render is called right after the Game Renderer completes,
     * but before the State.render. It is only called if visible is set to true.
     */
    render: function() {

    }

});
