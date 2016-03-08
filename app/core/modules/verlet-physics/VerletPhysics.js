var Class = require('Class');
var Events = require('Events');
var Particle = require('./Particle');
var Constraint = require('./Constraint');
var Convex = require('./Convex');

window.shouldStop = 0;

module.exports = Class.extend([Events], {

    FRICTION_RATIO: 1,
    FRICTION_MIN: 0.1,

    /**
     * Number of iterations for collisions
     */
    COLLISION_ITERATIONS: 2,

    /**
     * Number of iterations for constraint resolving
     */
    CONSTRAINT_ITERATIONS: 6,

    /**
     * Reference to the game
     */
    game: null,

    /**
     * List of particles
     */
    particles: null,

    /**
     * List of constraints
     * Constraint represents distance link between particles
     */
    constraints: null,

    /**
     * List of convex objects. The collision detection is enabled for convexes
     */
    convexes: null,

    /**
     * Gravity vector automatically applied to particles
     */
    gravity: null,

    /**
     * Array of CollisionInfo to draw debug info
     */
    debugCollisionInfoList:null,

    /**
     * Constructor
     */
    initialize: function(game) {

        this.game = game;

        this.particles = [];

        this.constraints = [];

        this.convexes = [];

        this.gravity = new Point(0, 50);
    },

    /**
     * Main update cycle
     */
    update: function() {
        var dt = 1 / 30;

        if(this.game.input.keyboard.isDown(32)) {
            window.shouldStop = 0;
        }

        if (window.shouldStop > 0) {
            return;
        }

        this.accumulateForces(); // e.g. gravity
        this.moveParticles(dt);

        for (i = 0; i < this.CONSTRAINT_ITERATIONS; i++) {
            this.processConstraints();
        }

        this.debugCollisionInfoList = [];
        for (var i = 0; i < this.COLLISION_ITERATIONS; i++) {
            this.collision();
        }
    },

    /**
     * Creates distance joint between two particles
     * stiffness 1 for fastest constraint resolution (hardest spring)
     * @returns {Constraint}
     */
    createConstraint: function(particle1, particle2, length, stiffness) {

        var constraint = new Constraint(particle1, particle2, length, stiffness);
        this.constraints.push(constraint);
        return constraint;
    },

    /**
     * Creates particle with specified position
     * @returns {Particle}
     */
    createParticle: function(position) {

        var particle = new Particle(position);
        this.particles.push(particle);

        return particle;
    },


    /**
     * Returns convex that can be filled with particles by param or later
     * @param particles=nil - List of particles to be included in convex
     */
    createConvex: function(particles) {
        var convex = new Convex(particles);
        this.addConvex(convex);
        return convex;
    },


    addConvex: function(convex) {
        this.convexes.push(convex);
    },

    //// Physics

    /**
     * Moves particles
     */
    moveParticles: function(dt) {

        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            var delta = Point.subtract(particle.position, particle.prevPosition);
            particle.prevPosition = particle.position.clone();
            particle.position.addPoint(delta);
            particle.position.addPoint(Point.multiplyFloat(particle.acceleration, dt * dt));
        }
    },

    /**
     * Sets up forces for particles. e.g. gravity
     */
    accumulateForces: function() {

        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            if (this.gravity) {
                particle.acceleration = this.gravity;
            }
        }
    },

    /**
     * Satisfying distance constraints
     */
    processConstraints: function() {

        for (var i = 0; i < this.constraints.length; i++) {
            var constraint = this.constraints[i];
            var point1 = constraint.particle1.position;
            var point2 = constraint.particle2.position;

            var norm = Point.subtract(point2, point1);
            norm.normalize();
            norm.multiplyFloat(constraint.length * 0.5);
            var center = Point.add(point1, point2);
            center.multiplyFloat(0.5);

            var goal1 = Point.subtract(center, norm);
            goal1.subtractPoint(constraint.particle1.position);
            goal1.multiplyFloat(constraint.stiffness);

            var goal2 = Point.add(center, norm);
            goal2.subtractPoint(constraint.particle2.position);
            goal2.multiplyFloat(constraint.stiffness);

            constraint.particle1.position.addPoint(goal1);
            constraint.particle2.position.addPoint(goal2);
        }
    },

    /**
     * Moving particles to resolve collisions
     */
    collision: function() {

        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            if (particle.position.y > 500) {
                //particle.setPosition(new Point(particle.position.x, 600));
                particle.push(new Point(0, 500 - particle.position.y));
            }

            if (particle.position.x < 0) {
                particle.position.x = 0;
            }

            if (particle.position.x > 500) {
                particle.position.x = 500;
            }
        }

        if (!this.convexes.length) return;

        for (i = 0; i < this.convexes.length; i++) {
            this.convexes[i].updateCenter();
        }

        for (i = 0; i < this.convexes.length; i++) {
            for (var j = i + 1; j < this.convexes.length; j++) {
                var collisionInfo = {};

                if (this.collideConvexes(this.convexes[i], this.convexes[j], collisionInfo)
                    && this.collideConvexes(this.convexes[j], this.convexes[i], collisionInfo, true)) {

                    this.collisionResponse(collisionInfo);
                    //window.shouldStop++;
                    this.debugCollisionInfoList.push(collisionInfo);
                }
            }
        }
    },

    /**
     * Returns true if convex1 collides with convex2
     * collisionInfo must be empty object or contain 'depth' key.
     * collisionInfo is filled with collision data: depth, axis, edge, convex1, convex2
     */
    collideConvexes: function(convex1, convex2, collisionInfo, isSecond) {

        if (collisionInfo["depth"] === undefined) {
            collisionInfo["depth"] = 10000; // Large value
        }

        collisionInfo.convex1 = convex1;
        collisionInfo.convex2 = convex2;

        var minDepth = collisionInfo["depth"],
            collisionNormal = null,
            collisionEdge = null,
            foundBestNormal = false;

        for (var i = 0; i < convex1.particles.length; i++) {
            var particle1 = convex1.particles[i],
                particle2 = convex1.particles[(i + 1) % convex1.particles.length],
                p1 = particle1.position,
                p2 = particle2.position,
                normal = new Point(p1.y - p2.y, p2.x - p1.x).normalize();

            var projection1 = this.projectConvexToAxis(convex1, normal),
                projection2 = this.projectConvexToAxis(convex2, normal);

            var distance = this.intervalDistance(projection1, projection2);

            if (distance > 0) {
                return false;
            } else if (Math.abs(distance) < minDepth) {
                minDepth = Math.abs(distance);
                collisionNormal = normal;
                collisionEdge = [particle1, particle2];
                foundBestNormal = true;
            }
        }

        if (foundBestNormal) {
            var minDistance = 10000;
            for (i = 0; i < convex2.particles.length; i++) {
                var pointToLineDistance = collisionNormal.dot(Point.subtract(convex2.particles[i].position, convex1.center));
                if (Math.abs(pointToLineDistance) < minDistance) {
                    minDistance = Math.abs(pointToLineDistance);
                    collisionInfo["point"] = convex2.particles[i];
                }
            }

            collisionInfo["axis"] = collisionNormal;
            collisionInfo["edge"] = collisionEdge;
            collisionInfo["depth"] = minDepth;
        }

        return true;
    },

    /**
     * Moves particles of the convexes so that they don't collide
     */
    collisionResponse: function(collisionInfo)  {

        var collisionVector = Point.multiply(collisionInfo.axis, collisionInfo.depth),
            edgePoint1 = collisionInfo.edge[0],
            edgePoint2 = collisionInfo.edge[1],
            point = collisionInfo.point;

        var t;
        if (Math.abs(edgePoint1.position.x - edgePoint2.position.x) > Math.abs(edgePoint1.position.y - edgePoint2.position.y)) {
            t = (point.position.x - collisionVector.x - edgePoint1.position.x) / (edgePoint2.position.x - edgePoint1.position.x);
        } else {
            t = (point.position.y  - collisionVector.y - edgePoint1.position.y) / (edgePoint2.position.y - edgePoint1.position.y);
        }

        var lambda = 1 / (t * t + (1 - t)*(1 - t));

        // Move edge
        // 1.25 stands to compensate increased (*1.5) shift on the single point to improve stability
        edgePoint1.position.add(Point.multiply(collisionVector, (1 - t) * lambda * 0.5 / 1.25));
        edgePoint2.position.add(Point.multiply(collisionVector, t * lambda * 0.5 / 1.25));

        // Move collision point
        collisionInfo.point.position.add(Point.multiply(collisionVector, -0.5 * 1.5));

        this.applyFriction(collisionInfo);
    },

    /**
     * Reduces velocity of the collided particles in the collision tangent direction to simulate friction
     */
    applyFriction: function(collisionInfo) {

        var tangentDirection = Point.subtract(collisionInfo.edge[1].position, collisionInfo.edge[0].position).normalize(),
            pointSpeed = collisionInfo.point.getSpeed(),
            edgePoint1Speed = collisionInfo.edge[0].getSpeed(),
            edgePoint2Speed = collisionInfo.edge[1].getSpeed();

        if (!collisionInfo.depth) {
            return;
        }

        var frictionRatio =  Math.max(Math.min(collisionInfo.depth / this.FRICTION_RATIO, 1), this.FRICTION_MIN), // Bigger ratio - more friction
            frictionRatioEdge = frictionRatio / 2,

            tangentPointSpeed = tangentDirection.dot(pointSpeed) * frictionRatio,
            tangentEdgePoint1Speed = tangentDirection.dot(edgePoint1Speed) * frictionRatioEdge,
            tangentEdgePoint2Speed = tangentDirection.dot(edgePoint2Speed) * frictionRatioEdge;

        collisionInfo.point.applyForce(Point.multiply(tangentDirection, -tangentPointSpeed));
        collisionInfo.edge[0].applyForce(Point.multiply(tangentDirection, -tangentEdgePoint1Speed));
        collisionInfo.edge[1].applyForce(Point.multiply(tangentDirection, -tangentEdgePoint2Speed));
    },

    /**
     * Returns array of 2 elements [0] for min, [1] for max
     */
    projectConvexToAxis: function(convex, axis) {

        var min = axis.dot(convex.particles[0].position);
        var max = min;

        for (var i = 1; i < convex.particles.length; i++) {
            var value = axis.dot(convex.particles[i].position);
            if (value < min) {
                min = value;
            }
            else if (value > max) {
                max = value;
            }
        }

        return [min, max];
    },

    intervalDistance: function(projection1, projection2) {
        if (projection1[0] < projection2[0]) {
            return projection2[0] - projection1[1];
        } else {
            return projection1[0] - projection2[1];
        }
    },

    //// Debug draw

    /**
     * Renders main engine entities e.g. particles, constraints as points and lines
     */
    postRender: function() {

        if(this.game.isDebugEnabled) {
            var debug = this.game.debug;

            for (var i = 0; i < this.convexes.length; i++) {
                var convex = this.convexes[i];
                for (var j = 0; j < convex.particles.length; j++) {
                    var particle1 = convex.particles[j];
                    var particle2 = convex.particles[(j+1) % convex.particles.length];
                    debug.drawLine(particle1.position, particle2.position, 3, "white");
                }
            }

            for (i = 0; i < this.constraints.length; i++) {
                var constraint = this.constraints[i];
                debug.drawLine(constraint.particle1.position, constraint.particle2.position, 1, '#1a1aff');
            }

            for (i = 0; i < this.particles.length; i++) {
                var particle = this.particles[i];
                debug.pixel(particle.position.x - 2, particle.position.y - 2, '#00ff00', 4);
            }

            if (this.debugCollisionInfoList) {
                for (i = 0; i < this.debugCollisionInfoList.length; i++) {
                    var collisionInfo = this.debugCollisionInfoList[i];

                    debug.drawLine(collisionInfo.edge[0].position, collisionInfo.edge[1].position, 4, '#00ffff');

                    debug.pixel(collisionInfo.point.position.x - 2, collisionInfo.point.position.y - 2, '#ff0000', 4);

                    var mNormal = Point.multiply(collisionInfo.axis, collisionInfo.depth);
                    debug.drawLine(collisionInfo.point.position, Point.add(collisionInfo.point.position, mNormal), 1, '#ffff00');
                }
            }

            debug.drawLine(new Point(0, 500), new Point(500, 500), 6, "green");
            debug.drawLine(new Point(500, 0), new Point(500, 500), 6, "green");
        }
    }


});
