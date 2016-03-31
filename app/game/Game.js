var Class = require('Class');
var Engine = require('../core/Engine');
var _ = require("lodash");
var Material = require("./../core/render/Material");
var glMatrix = require("gl-matrix");
var Level = require("game/base/BaseLevel");

var uniforms = {
    u_matrix: null
};

/**
 * @class Game
 */
module.exports = Class.extend({

    /**
     * Engine reference
     */
    engine: null,

    /**
     * Array of BaseEntity
     */
    entities: null,

    initialize: function(options) {
        var boundRender = _.bind(this.render, this),
            boundUpdate = _.bind(this.update, this);

        this.engine = new Engine(options.el, boundRender, boundUpdate);
        this.physics = this.engine.physics;
        this.entities = [];
        this.setupResources();
        this.engine.start();
    },

    setupResources: function() {
        Material.setup(this.engine.gl);
        var level = new Level(this, this.engine);
        level.load();
    },

    render: function() {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].render();
        }
    },

    update: function() {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
        }
    },

    // managing entities

    /**
     *
     */
    addEntity: function(entity) {
        entity.setup(this, this.engine);
        this.entities.push(entity);
        entity.start();
    }

});
