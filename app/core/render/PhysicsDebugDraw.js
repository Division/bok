var Class = require("Class");
var twgl = require("twgl");
var Material = require("./Material");

/**
 * @class PhysicsDebugDraw
 */
module.exports = Class.extend({

    gl: null,

    lines: null,

    points: null,

    pointBufferInfo: null,

    lineBufferInfo: null,

    uniforms: null,

    initialize: function(gl) {
        this.gl = gl;

        this.uniforms = { matrix: null };

        this.points = {
            a_position: { numComponents: 2, data: twgl.primitives.createAugmentedTypedArray(2, 2000) },
            a_pointSize: { numComponents: 1, data: twgl.primitives.createAugmentedTypedArray(1, 2000) },
            a_color: { numComponents: 4, data:  twgl.primitives.createAugmentedTypedArray(4, 2000) }
        };

        this.lines = {
            a_position: { numComponents: 2, data: twgl.primitives.createAugmentedTypedArray(2, 2000) },
            a_pointSize: { numComponents: 1, data: twgl.primitives.createAugmentedTypedArray(1, 2000) },
            a_color: { numComponents: 4, data:  twgl.primitives.createAugmentedTypedArray(4, 2000) }
        };

        this.pointBufferInfo = twgl.createBufferInfoFromArrays(gl, this.points);
        this.lineBufferInfo = twgl.createBufferInfoFromArrays(gl, this.lines);
    },

    clear: function() {
        this.points.a_position.data.reset();
        this.points.a_pointSize.data.reset();
        this.points.a_color.data.reset();
        this.lines.a_position.data.reset();
        this.lines.a_pointSize.data.reset();
        this.lines.a_color.data.reset();
        this.lines.a_position.numElements = 0;
        this.lines.a_pointSize.numElements = 0;
        this.lines.a_color.numElements = 0;
        this.points.a_position.numElements = 0;
        this.points.a_pointSize.numElements = 0;
        this.points.a_color.numElements = 0;
        this.lineBufferInfo.numElements = 0;
        this.pointBufferInfo.numElements = 0;
    },

    drawLine: function(pointA, pointB, color) {
        this.lines.a_position.data.push(pointA.x, pointA.y, pointB.x, pointB.y);
        this.lines.a_pointSize.data.push(0, 0);
        this.lines.a_color.data.push(color, color);
        this.lines.a_position.numElements += 2;
        this.lines.a_pointSize.numElements += 2;
        this.lines.a_color.numElements += 2;
        this.lineBufferInfo.numElements += 2;
    },

    drawPixel: function(x, y, size, color) {
        this.points.a_position.data.push(x, y);
        this.points.a_pointSize.data.push(size);
        this.points.a_color.data.push(color);
        this.points.a_position.numElements += 1;
        this.points.a_pointSize.numElements += 1;
        this.points.a_color.numElements += 1;
        this.pointBufferInfo.numElements += 1;
    },

    render: function(matrix) {
        var gl = this.gl;

        gl.lineWidth(2);

        this.uniforms.matrix = matrix;

        var attribs = this.pointBufferInfo.attribs;

        gl.bindBuffer(gl.ARRAY_BUFFER, attribs.a_pointSize.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.points.a_pointSize.data, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, attribs.a_position.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.points.a_position.data, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, attribs.a_color.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.points.a_color.data, gl.DYNAMIC_DRAW);

        attribs = this.lineBufferInfo.attribs;

        gl.bindBuffer(gl.ARRAY_BUFFER, attribs.a_pointSize.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.lines.a_pointSize.data, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, attribs.a_position.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.lines.a_position.data, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, attribs.a_color.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.lines.a_color.data, gl.DYNAMIC_DRAW);

        gl.useProgram(Material.shaderColor.program);
        twgl.setUniforms(Material.shaderColor, this.uniforms);

        twgl.setBuffersAndAttributes(gl, Material.shaderColor, this.lineBufferInfo);
        twgl.drawBufferInfo(gl, gl.LINES, this.lineBufferInfo);

        twgl.setBuffersAndAttributes(gl, Material.shaderColor, this.pointBufferInfo);
        twgl.drawBufferInfo(gl, gl.POINTS, this.pointBufferInfo);
    }

});
