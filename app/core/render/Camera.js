/**
 * Created by Nikita Sidorenko on 3/13/16.
 */

var Class = require("Class");
var glMatrix = require("gl-matrix");
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var mat4 = glMatrix.mat4;

/**
 * @class Camera
 */
module.exports = Class.extend({

    /**
     * Current camera center
     * Should be set only via setPosition method
     */
    position: null,

    /**
     * Rendering scale
     */
    scale: 1,

    /**
     * @type {mat4}
     */
    matrix: null,

    /**
     * @type {vec2}
     */
    screenSize: null,

    initialize: function() {
        this.position = vec3.create();
        this.matrix = mat4.create();
        this.screenSize = vec2.create();
    },

    screenToWorld: function(x, y) {
        var result = vec2.fromValues(x, y);
        vec2.add(result, result, this.position);
        vec2.scaleAndAdd(result, result, this.screenSize, -0.5);
        return result;
    },

    setScreenSize: function(width, height) {
        var deltaX = width - this.screenSize[0];
        var deltaY = height- this.screenSize[1];
        vec2.set(this.screenSize, width, height);
        vec2.set(this.position, this.position[0] + deltaX / 2, this.position[1] + deltaY / 2);
    },

    setPosition: function(x, y) {
        vec3.set(this.position, x, y, 0);
        var translation = vec3.clone(this.position);
        vec2.negate(translation, translation);
        vec2.scaleAndAdd(translation, translation, this.screenSize, 0.5);
        mat4.fromTranslation(this.matrix, translation);
    },

    getMatrix: function() {
        return this.matrix;
    }


});
