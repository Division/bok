/**
 * Created by Nikita Sidorenko on 3/13/16.
 */
var Class = require("Class");
var Events = require("Events");
module.exports = Class.extend([Events],{

    canvasElement: null,
    engine: null,
    x: 0,
    y: 0,
    worldPosition: null,
    isDown: false,

    lastEvent: null,

    initialize: function(canvasElement, engine) {
        this.engine = engine;
        this.canvasElement = canvasElement;
        this.worldPosition = [0,0];
    },

    startListening: function() {
        var self = this;

        this.canvasElement.oncontextmenu = function(e) {
            e.preventDefault();
        };

        this.canvasElement.onmousemove = function(e) {
            self.worldPosition = self.positionFromEvent(e);
            self.lastEvent = e;
        };

        this.canvasElement.onmousedown = function(e) {
            self.trigger("down", self.positionFromEvent(e));
            self.isDown = true;
            self.lastEvent = e;
        };

        this.canvasElement.onmouseup = function(e) {
            self.trigger("up", {x: e.clientX, y: e.clientY});
            self.isDown = false;
            self.lastEvent = e;
        };

    },

    update: function() {
        if (this.lastEvent) {
            this.worldPosition = this.positionFromEvent(this.lastEvent);
        }
    },

    positionFromEvent: function(e) {
        return this.engine.camera.screenToWorld(e.clientX, e.clientY);
    },

    stopListening: function() {

    }

});
