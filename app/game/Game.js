var Class = require('Class');
var Events = require("Events");
var Engine = require('../core/Engine');
var _ = require("lodash");
var Material = require("./../core/render/Material");
//var Level = require("game/base/BaseLevel");
//var Level = require("game/base/CollisionDebugLevel");
var Level = require("game/base/ConvexDemoLevel");

/**
 * @class Game
 */
module.exports = Class.extend([Events], {

    /**
     * Engine reference
     */
    engine: null,

    /**
     * Array of BaseEntity
     */
    entities: null,

    canResume: true,

    numberOfTargets: 0,

    levelID: null,

    initialize: function(options) {
        var boundRender = _.bind(this.render, this),
            boundUpdate = _.bind(this.update, this);

        this.engine = new Engine(options.el, boundRender, boundUpdate);
        this.physics = this.engine.physics;
        this.entities = [];

        this.levelID = parseInt(options.level);

        this.on('collect', this.onCollect);
        this.on('targetAdded', this.onTargetAdded);

        this.setupResources();
        this.engine.start();
    },

    setupResources: function() {
        Material.setup(this.engine.gl);
        var level = new Level(this, this.engine);
        level.load(this.levelID);
    },

    render: function() {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].render();
        }
    },

    update: function() {
        if (this.engine.keyboard.isDown(32)) {
            if (this.canResume) {
                this.physics.debugResume();
                this.canResume = false;
            }
        } else {
            this.canResume = true;
        }

        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
        }

        for (i = this.entities.length - 1; i >= 0; i--) {
            if (this.entities[i].mustBeKilled) {
                this.entities[i] = this.entities[this.entities.length - 1];
                this.entities.pop();
            }
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
    },

    // Gameplay

    onCollect: function() {
        this.numberOfTargets -= 1;

        console.log("Targets remaining: " + this.numberOfTargets);

        if (this.numberOfTargets == 0) {
            this.trigger('switchLevel', this.levelID + 1);
        }
    },

    onTargetAdded: function() {
        this.numberOfTargets++;
    }

});
