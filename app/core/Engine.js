var Events = require('Events');
var Class = require('Class');
var _ = require('lodash');
var PhysicsDebugDraw = require("core/render/PhysicsDebugDraw");
var VerletPhysics = require("core/verlet-physics/VerletPhysics");
var glMatrix = require("gl-matrix");
var mat4 = glMatrix.mat4;
var twgl = require("twgl");
var Keyboard = require("core/input/Keyboard");
var Mouse = require("core/input/Mouse");
var Camera = require("core/render/Camera");

/**
 * Main engine class
 * Gameplay independent code goes here
 * @class Engine
 */
module.exports = Class.extend([Events], {

    UPDATE_FPS: 60,

    /**
     * If set to false render loop will be finished
     */
    renderEnabled: true,

    /**
     * OpenGL context
     */
    gl: null,

    /**
     * TWGL library reference
     */
    twgl: null,

    /**
     * Physics engine
     */
    physics: null,

    /**
     * Rendering for the physics engine
     */
    physicsDebugDraw: null,

    /**
     * Current time in milliseconds
     */
    time: 0,

    /**
     * Time when the engine created
     */
    startTime: 0,

    /**
     * Last time the update callback wall called
     */
    lastUpdateTime: 0,

    /**
     * @type {Camera}
     */
    camera: null,

    renderCallback: null,
    updateCallback: null,

    /**
     * Keyboard state
     */
    keyboard: null,

    /**
     * Mouse state
     */
    mouse: null,

    /**
     * @param el
     * @param renderCallback
     * @param updateCallback
     * @constructor
     */
    initialize: function(el, renderCallback, updateCallback) {
        this.twgl = twgl;
        var element = document.getElementById(el);
        this.gl = twgl.getWebGLContext(element);
        this.renderCallback = renderCallback;
        this.updateCallback = updateCallback;
        this.startTime = Date.now();
        this.physicsDebugDraw = new PhysicsDebugDraw(this.gl);
        this.physics = new VerletPhysics();
        this.physics.debug = this.physicsDebugDraw;
        this.keyboard = new Keyboard(this);
        this.keyboard.start();
        this.mouse = new Mouse(element, this);
        this.mouse.startListening();
        this.camera = new Camera();
    },

    /**
     * Initiates render loop
     */
    start: function() {
        this.renderEnabled = true;
        var self = this;

        function processRender() {
            self.render();
            if (self.renderEnabled) {
                requestAnimationFrame(processRender);
            }
        }

        processRender();
    },

    /**
     * Suspends rendering loop
     */
    stop: function() {
        this.renderEnabled = false;
    },

    /**
     * @private
     */
    render: function() {
        var gl = this.gl;
        var currentTime = Date.now() / 1000 - this.startTime / 1000;
        this.time = currentTime;

        gl.clearColor(0.0,0.0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);

        this.camera.setScreenSize(this.gl.canvas.width, this.gl.canvas.height);

        // Update physycs each FPS times
        if (this.updateCallback && currentTime - this.lastUpdateTime > 1 / this.UPDATE_FPS) {
            this.lastUpdateTime = currentTime;

            this.mouse.update();
            this.physics.update();
            this.physics.renderDebugInfo();

            this.updateCallback();
        }

        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        var projectionMatrix = mat4.create();
        mat4.ortho(projectionMatrix, 0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
        var viewMatrix = this.camera.getMatrix();
        var viewProjectionMatrix = mat4.create();
        mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);


        if (this.renderCallback) {
            this.renderCallback();
        }

        this.physicsDebugDraw.render(viewProjectionMatrix);
    }

});

