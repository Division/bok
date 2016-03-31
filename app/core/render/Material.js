/**
 * Created by Nikita Sidorenko on 3/11/16.
 */
var Class = require("Class");
var twgl = require("twgl");

/**
 * @class Material
 */
module.exports = Class.extend({

    shaderColor: null,
    gl: null,

    setup: function(gl) {
        this.gl = gl;
        this.shaderColor = twgl.createProgramInfo(gl, [require("raw!shaders/color.vs"), require("raw!shaders/color.fs")]);
    },

    activateColor: function() {
        this.gl.useProgram(this.shaderColor.program);
    }



});
