var Class = require('Class');
var Phaser = require('phaser');
var Events = require('Events');

/**
 * Basic game object
 *
 * @parent {Phaser.Plugin}
 * @parent {Events}
 *
 * @class GameObject
 * @name GameObject
 */
module.exports = Class.extend([Events, Phaser.Plugin], {

    /**
     * Init plugin instance
     *
     * @constructor
     *
     * @param gameLink
     * @param parent
     */
    initialize: function(gameLink, parent){
        this.game = gameLink;
        this.parent = parent || null;
    },

    /**
     * Plugin init event
     */
    init: function(){
        //this.disable(); // Disable updates and render for gameObject, we will enable it after create event
    },

    /**
     * Before create event
     */
    beforeCreate: function(){
        if(this.create){ this.create(); }
        this.enable();
    },

    /**
     * Enable render and update events
     */
    enable: function(){

        //if(this.preUpdate) this.hasPreUpdate = true;
        //if(this.update) this.hasUpdate = true;
        //if(this.postUpdate) this.hasPostUpdate = true;
        //if(this.render) this.hasRender = true;
        //if(this.postRender) this.hasPostRender = true;
        //
        //if (this.hasPreUpdate || this.hasUpdate || this.hasPostUpdate)
        //{
        //    this.active = true;
        //}
        //
        //if (this.hasRender || this.hasPostRender)
        //{
        //    this.visible = true;
        //}

    },

    /**
     * Disable plugin rendering end updates
     */
    disable: function(){

        this.hasUpdate = false;
        this.hasPreUpdate = false;
        this.hasPostUpdate = false;
        this.hasRender = false;
        this.hasPostRender = false;

        this.active = false;
        this.visible = false;
    }

});
