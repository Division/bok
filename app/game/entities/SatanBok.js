var GameObject = require('GameObject');
var KeyCodes = require('KeyCodes');

/**
 * @class SatanBok
 */
module.exports = GameObject.extend({

    POINT_COUNT: 8,
    RADIUS: 50,
    MASS: 1,

    particles: null,

    mouseControls: false,

    /**
     * Preload is called first. Normally you'd use this to load your game assets (or those needed for the current State)
     * You shouldn't create any objects in this method that require assets that you're also loading in this method, as
     * they won't yet be available.
     */
    preload: function(){

        var game = this.game;
        game.load.image('ship', 'assets/general/ship.png');
    },

    /**
     * Create is called once preload has completed, this includes the loading of any assets from the Loader.
     * If you don't have a preload method then create is the first method called in your State.
     */
    create: function(){

    },

    setupAtPosition: function(position) {
        this.particles = [];

        // First particle is center
        this.particles.push(VerletPhysics.createParticle(position, this.MASS));

        // Convex to
        var convex = VerletPhysics.createConvex();

        // Others are added along the circle
        for (var i = 0; i < this.POINT_COUNT; i++) {
            var angle = Math.PI * 2 * i / this.POINT_COUNT,
                point = new Point(Math.cos(angle) * this.RADIUS + position.x, Math.sin(angle) * this.RADIUS + position.y),
                particle = VerletPhysics.createParticle(point, this.MASS);
            this.particles.push(particle);
            convex.addParticle(particle);
        }

        for (i = 1; i <= this.POINT_COUNT; i++) {
            VerletPhysics.createConstraint(this.particles[i], this.particles[0], 1);

            var nextIndex = i < this.POINT_COUNT ? i + 1 : 1;
            VerletPhysics.createConstraint(this.particles[i], this.particles[nextIndex], 1);
        }

    },

    /**
     * Update is called after all the core subsystems (Input, Tweens, Sound, etc) and the State have updated,
     * but before the render. It is only called if active is set to true.
     */
    update: function() {

        if (this.particles && this.mouseControls) {
            var targetPosition = new Point(this.game.input.x, this.game.input.y);
                targetDirection = Point.subtract(targetPosition, this.particles[0].position).multiply(0.01);

            if (targetDirection.getMagnitude() > 3) {
                targetDirection.normalize();
                targetDirection.multiply(3);
            }

            if (this.game.input.activePointer.leftButton.isDown) {
                this.particles[0].applyForce(targetDirection);
            }

            var rotateForceLeft = new Point();
            var rotateForceRight = new Point();
            var rotatAmmount = 0.7;
            if (this.game.input.keyboard.isDown('A'.charCodeAt(0))) {
                rotateForceLeft.y = rotatAmmount;
                rotateForceRight.y = -rotatAmmount;
            }
            if (this.game.input.keyboard.isDown('D'.charCodeAt(0))) {
                rotateForceLeft.y = -rotatAmmount;
                rotateForceRight.y = rotatAmmount;
            }

            var rotateParticles = this.getLeftRightParticle();
            rotateParticles[0].applyForce(rotateForceLeft);
            rotateParticles[1].applyForce(rotateForceRight);
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
    render: function(){

        if(this.game.isDebugEnabled){
            //game.debug.spriteInfo(ship, 32, 32);
            //game.debug.bodyInfo(ship, 400, 32);
            //game.debug.body(ship);
            //game.debug.cameraInfo(game.camera, 32, 120);
        }
    }

});
