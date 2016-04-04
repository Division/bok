var Class = require('Class');
var Events = require('Events');
var Particle = require('./Particle');
var Constraint = require('./Constraint');
var Convex = require('./Convex');
var Collision = require('./Collision');
var Point = require('core/verlet-physics/Point');

/**
 * @class VerletPhysics
 */
module.exports = Class.extend([Events], {

    SWEEP_AND_PRUNE_ENABLED: true,

    FRICTION_RATIO: 0.5,
    FRICTION_MIN: 0.3,
    WIDTH: 700,
    HEIGHT: 500,

    isDebugEnabled: true,

    /**
     * Number of iterations for collisions
     */
    COLLISION_ITERATIONS: 3,

    /**
     * Number of iterations for constraint resolving
     */
    CONSTRAINT_ITERATIONS: 5,

    /**
     * Debug draw
     */
    debug: null,

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
     * Collision helper
     */
    collision: null,


    debugStopOnCollision: false,

    isStopped: false,

    /**
     * Constructor
     */
    initialize: function(game) {

        this.particles = [];

        this.constraints = [];

        this.convexes = [];

        this.collision = new Collision(this);

        this.gravity = new Point(0, 200);
    },

    /**
     * Main update cycle
     */
    update: function() {

        var dt = 1 / 30;

        if (this.isStopped) {
            return;
        }

        this.accumulateForces(); // e.g. gravity
        this.moveParticles(dt);
        this.processStaticGeometry();


        for (i = 0; i < this.CONSTRAINT_ITERATIONS; i++) {
            this.processConstraints();
        }


        this.debugCollisionInfoList = [];

        if (this.SWEEP_AND_PRUNE_ENABLED) {
            this.sortForSweepAndPrune();
        }

        for (var i = 0; i < this.COLLISION_ITERATIONS; i++) {
            this.checkCollisionSweepAndPrune();

            if (!this.debugStopOnCollision) {
                this.processConstraints();
            }

            //this.keepParticlesInWorldBounds();
        }

        this.updateConvexBounds();
    },


    debugResume: function() {
        this.isStopped = false;
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
    createParticle: function(position, mass) {

        var particle = new Particle(position, mass);
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
            if (particle.enabled && particle.mass > 0) {
                var delta = Point.subtract(particle.position, particle.prevPosition);
                particle.prevPosition = particle.position.clone();
                particle.position.addPoint(delta);
                particle.position.addPoint(Point.multiplyFloat(particle.acceleration, dt * dt));
            }
        }
    },

    /**
     * Sets up forces for particles. e.g. gravity
     */
    accumulateForces: function() {

        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            if (this.gravity && particle.enabled && particle.mass > 0) {
                particle.acceleration = this.gravity;
            }
        }
    },

    /**
     * Moves static particles back to their positions
     */
    processStaticGeometry: function() {
        for (var i = 0; i < this.convexes.length; i++) {
            if (this.convexes[i].isStatic) {
                this.convexes[i].fixStaticPosition();
            }
        }
    },

    /**
     * Satisfying distance constraints
     */
    processConstraints: function(list) {

        if (!list) {
            list = this.constraints;
        }

        for (var i = 0; i < list.length; i++) {
            var constraint = list[i];
            if (constraint.enabled) {
                var point1 = constraint.particle1.position;
                var point2 = constraint.particle2.position;

                // delta = x2 - x1

                var delta = Point.subtract(point2, point1),
                    deltaLength = delta.getMagnitude();

                if (Math.abs(deltaLength) < 0.0000001) { // Ignore same place points to avoid division by zero
                    return;
                }

                var diff = (deltaLength - constraint.length) / (deltaLength * (constraint.particle1.invMass + constraint.particle2.invMass)),
                    shouldProcess = false;

                if (constraint.type == Constraint.TYPE_EQUAL) {
                    shouldProcess = Math.abs(diff) > 0;
                } else if (constraint.type == Constraint.TYPE_GREATER) {
                    shouldProcess = diff < 0;
                } else if (constraint.type == Constraint.TYPE_LESS) {
                    shouldProcess = diff > 0;
                }

                if (shouldProcess) {
                    delta.multiply(diff * constraint.stiffness);
                    point1.add(Point.multiply(delta, constraint.particle1.invMass));
                    point2.subtract(Point.multiply(delta, constraint.particle2.invMass));
                }
            }
        }
    },

    /**
     * Projects particles to the world bounds
     */
    keepParticlesInWorldBounds: function() {
        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            if (particle.position.y > this.HEIGHT) {
                particle.position.y = this.HEIGHT;
            }

            if (particle.position.x < 0) {
                particle.position.x = 0;
            }

            if (particle.position.x > this.WIDTH) {
                particle.position.x = this.WIDTH;
            }
        }
    },

    /**
     * Iterates through all convexes and calls updateBounds()
     */
    updateConvexBounds: function() {
        for (i = 0; i < this.convexes.length; i++) {
            this.convexes[i].updateBounds();
        }
    },

    /**
     * Sorts objects by AABB.x coordinate to use in sweep and prune broad phase
     */
    sortForSweepAndPrune: function() {
        this.convexes.sort(function(first, second) {
            var delta = first.aabb.min.x - second.aabb.min.x;
            if (Math.abs(delta) < 0.00001) {
                return 0;
            } else {
                return delta;
            }
        });
    },

    /**
     * Sweep and prune broad phase and collision check
     */
    checkCollisionSweepAndPrune: function() {

        for (var i = 0; i < this.convexes.length; i++) {
            for (var j = i + 1; j < this.convexes.length; j++) {
                var convex1 = this.convexes[i],
                    convex2 = this.convexes[j];

                if (this.SWEEP_AND_PRUNE_ENABLED && convex1.aabb.max.x < convex2.aabb.min.x) {
                    break;
                }
                var collisionInfo = {};
                this.checkAndHandleCollision(convex1, convex2, collisionInfo);
            }
        }
    },

    /**
     * Performs collision response between two convexes.
     * collisionInfo must be empty object
     * AABB check is also done here
     */
    checkAndHandleCollision: function(convex1, convex2, collisionInfo) {
        if (convex1.aabb.max.y < convex2.aabb.min.y ||
            convex1.aabb.min.y > convex2.aabb.max.y ||
            convex1.aabb.max.x < convex2.aabb.min.x ||
            convex1.aabb.min.x > convex2.aabb.max.x ||
            (convex1.isStatic && convex2.isStatic )) {

            return;
        }

        if (this.collideConvexes(convex1, convex2, collisionInfo)
            && this.collideConvexes(convex2, convex1, collisionInfo, true)) {

            this.collisionResponse(collisionInfo);

            if (this.debugStopOnCollision) {
                this.isStopped = true;
            }

            this.debugCollisionInfoList.push(collisionInfo);
        }
    },

    /**
     * Returns true if convex1 collides with convex2
     * collisionInfo must be empty object or contain 'depth' key.
     * collisionInfo is filled with collision data: depth, axis, edge, convex1, convex2
     */
    collideConvexes: function(convex1, convex2, collisionInfo, isSecond) {

        if (collisionInfo.depth === undefined) {
            collisionInfo.depth = 1000000; // Large value
        }

        collisionInfo.convex1 = convex1;
        collisionInfo.convex2 = convex2;

        var minDepth = collisionInfo.depth,
            collisionNormal = null,
            collisionEdge = null,
            foundBestNormal = false,
            interval = null;

        // Getting collision normal and depth
        for (var i = 0; i < convex1.particles.length; i++) {
            var particle1 = convex1.particles[i],
                particle2 = convex1.particles[(i + 1) % convex1.particles.length],
                p1 = particle1.position,
                p2 = particle2.position,
                normal = new Point(p1.y - p2.y, p2.x - p1.x).normalize();

            var projection1 = this.projectConvexToAxis(convex1, normal),
                projection2 = this.projectConvexToAxis(convex2, normal);
                interval = this.intervalDistance(projection1, projection2);

            var distance = interval.distance,
                centersDirection = Point.subtract(convex1.center, convex2.center),

                // Projection must be positive (normal looks in the correct direction)
                // if not - it's probably a parallel edge which must be ignored
                normalResponseProjection = centersDirection.dot(normal);

            if (distance > 0) {
                return false;
            } else if (normalResponseProjection > 0 && Math.abs(distance) < minDepth) {
                minDepth = Math.abs(distance);
                collisionNormal = normal;
                foundBestNormal = true;
                collisionEdge = [particle1, particle2];
            }
        }

        if (foundBestNormal) {

            var maxDistance = 0,
                firstPointOnCorrectSide = null;

            for (i = 0; i < convex2.particles.length; i++) {
                if (Point.ord(convex2.particles[i].position, collisionEdge[0].position, collisionEdge[1].position) > 0) {
                    var pointToLineDistance = this.distToSegment(convex2.particles[i].position, collisionEdge[0].position, collisionEdge[1].position);
                    if (Math.abs(pointToLineDistance) > maxDistance) {
                        maxDistance  = Math.abs(pointToLineDistance);
                        collisionInfo.point = convex2.particles[i];
                    }

                    firstPointOnCorrectSide = convex2.particles[i];
                }
            }

            if (!collisionInfo.point) {
                collisionInfo.point = firstPointOnCorrectSide || convex2.particles[0];
            }

            collisionInfo.axis = collisionNormal;
            collisionInfo.edge = collisionEdge;
            collisionInfo.depth = minDepth;
        }

        return true;
    },

    distToSegment: function(p, v1, v2) {
        var v = new Point(v2.x,v2.y);
        v.subtract(v1);
        var w = new Point(p.x,p.y);
        w.subtract(v1);
        var c1 = w.dot(v);
        var c2 = v.dot(v);
        if (!c2) return 100000;
        var b = c1/c2;
        v.multiply(b);
        var Pb = new Point(v1.x, v1.y);
        Pb.add(v);
        return Point.distance(p, Pb);
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

        var invMassEdge = 0;
        if (edgePoint1.mass * edgePoint2.mass > 0) {
            invMassEdge = 1 / (edgePoint1.mass + edgePoint2.mass);
        }

        collisionVector.divide(point.invMass + invMassEdge);

        // Move edge
        edgePoint1.position.add(Point.multiply(collisionVector, (1 - t) * lambda * invMassEdge));
        edgePoint2.position.add(Point.multiply(collisionVector, t * lambda * invMassEdge));

        // Move collision point
        collisionInfo.point.position.add(Point.multiply(collisionVector, -point.invMass));

        this.applyFriction(collisionInfo);

        collisionInfo.convex1.updateBounds();
        collisionInfo.convex2.updateBounds();
    },

    /**
     * Reduces velocity of the collided particles in the collision tangent direction to simulate friction
     */
    applyFriction: function(collisionInfo) {

        var edgePoint1 = collisionInfo.edge[0],
            edgePoint2 = collisionInfo.edge[1],
            tangentDirection = Point.subtract(edgePoint2.position, edgePoint1.position).normalize(),
            pointSpeed = collisionInfo.point.getSpeed(),
            edgeSpeed = edgePoint1.getSpeed().add(edgePoint2.getSpeed()).multiply(0.5);

        if (!collisionInfo.depth) {
            return;
        }

        var frictionRatio =  Math.max(Math.min(collisionInfo.depth / this.FRICTION_RATIO, 1), this.FRICTION_MIN), // Bigger ratio - more friction

            tangentPointSpeed = tangentDirection.dot(pointSpeed),
            tangentEdgeSpeed = tangentDirection.dot(edgeSpeed),
            speedDelta = tangentPointSpeed - tangentEdgeSpeed,
            deltaToApply = speedDelta * frictionRatio,
            invMassEdge = 0;

        if (edgePoint1.mass * edgePoint2.mass > 0) {
            invMassEdge = 1 / (edgePoint1.mass + edgePoint2.mass);
        }

        deltaToApply /= (collisionInfo.point.invMass + invMassEdge);

        collisionInfo.point.applyForce(Point.multiply(tangentDirection, -deltaToApply * collisionInfo.point.invMass));
        edgePoint1.applyForce(Point.multiply(tangentDirection, deltaToApply * edgePoint1.invMass));
        edgePoint2.applyForce(Point.multiply(tangentDirection, deltaToApply * edgePoint2.invMass));
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

    /**
     * Overlap distance for two projections
     */
    intervalDistance: function(projection1, projection2) {
        var result = {};

        if (projection1[0] < projection2[0]) {
            result.distance = projection2[0] - projection1[1];
            result.center = (projection2[0] + projection1[1]) / 2;
        } else {
            result.distance = projection1[0] - projection2[1];
            result.center = (projection1[0] + projection2[1]) / 2;
        }

        return result;
    },

    //// Debug draw

    /**
     * Renders main engine entities e.g. particles, constraints as points and lines
     */
    renderDebugInfo: function() {
        if(this.isDebugEnabled) {

            var debug = this.debug;
            this.debug.clear();


            for (i = 0; i < this.constraints.length; i++) {
                var constraint = this.constraints[i];
                if (constraint.enabled) {
                    debug.drawLine(constraint.particle1.position, constraint.particle2.position, [0.1, 0.2, 0.4, 1]);
                }
            }

            for (var i = 0; i < this.convexes.length; i++) {
                var convex = this.convexes[i];
                for (var j = 0; j < convex.particles.length; j++) {
                    var particle1 = convex.particles[j];
                    var particle2 = convex.particles[(j+1) % convex.particles.length];
                    if (convex.isStatic) {
                        debug.drawLine(particle1.position, particle2.position, [0.8, 0.8, 0.7, 1]);
                    } else {
                        debug.drawLine(particle1.position, particle2.position, [0.2, 0.5, 0.7, 1]);
                    }
                }
            }

            for (i = 0; i < this.particles.length; i++) {
                var particle = this.particles[i];
                if (particle.enabled) {
                    debug.drawPixel(particle.position.x, particle.position.y, 4, [0, 1, 0, 1]);
                }
            }

            if (this.debugCollisionInfoList) {
                for (i = 0; i < this.debugCollisionInfoList.length; i++) {
                    var collisionInfo = this.debugCollisionInfoList[i];

                    debug.drawLine(collisionInfo.edge[0].position, collisionInfo.edge[1].position, [0.2,0.9,0.9,1]);

                    debug.drawPixel(collisionInfo.point.position.x, collisionInfo.point.position.y, 4, [1,0.4,0.4,1]);

                    var mNormal = Point.multiply(collisionInfo.axis, collisionInfo.depth);
                    debug.drawLine(collisionInfo.point.position, Point.add(collisionInfo.point.position, mNormal), [1,1,0,1]);
                }
            }

            //debug.drawLine(new Point(0, this.HEIGHT), new Point(this.WIDTH, this.HEIGHT), [0,0.5,0,1]);
            //debug.drawLine(new Point(this.WIDTH, 0), new Point(this.WIDTH, this.HEIGHT), [0,0.5,0,1]);
        }
    }


});
