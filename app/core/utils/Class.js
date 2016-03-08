var _ = require('lodash');

/**
 * `inherits` are from Backbone (with some modifications):
 * http://documentcloud.github.com/backbone/
 *
 * Shared empty constructor function to aid in prototype-chain creation.
 *
 * @example:
 *
 * With mixin:
 * var MyClass = Class.extend([Mixin, Mixin2],{
 *      constructor: function(){ constructor function }
 *      someProp: 'My property value',
 *      someMethod: function () { ... }
 * );
 *
 *
 * var MyClass = Class.extend({
 *      constructor: function(){ constructor function }
 *      someProp: 'My property value',
 *      someMethod: function () { ... }
 * });
 *
 *
 * With static properties and functions:
 *
 * var MyClass = Class.extend({   },{
 *      constructor: function(){ constructor function }
 *      someProp: 'My property value',
 *      someMethod: function () { ... }
 * });
 *
 */

var Class = {};
var ctor = function () {};

/**
 * Helper function to correctly set up the prototype chain, for subclasses.
 * Similar to `goog.inherits`, but uses a hash of prototype properties and
 * class properties to be extended.
 */

var inherits = function (parent, protoProps, staticProps, mixins) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call `super()`.
    if (protoProps && protoProps.hasOwnProperty('initialize')) {
        child = protoProps.initialize;
    } else {
        child = function () {
            return parent.apply(this, arguments);
        };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add mixins
    if(mixins){
        _.each(mixins, function(mixin){

            if(_.isFunction(mixin) && mixin.prototype){
                mixin = mixin.prototype;
            }

            _.extend(child.prototype, mixin);
        });
    }

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
};

/**
 * Self-propagating extend function.
 * Create a new class that inherits from the class found in the `this` context object.
 * This function is meant to be called in the context of a constructor function.
 */
function extendThis(mixin, protoProps, staticProps) {

    // If no mixin
    if(!_.isArray(mixin)){
        protoProps = mixin;
        staticProps = protoProps
    }

    var child = inherits(this, protoProps, staticProps, mixin);
    child.extend = extendThis;
    return child;
}

// A primitive base class for creating subclasses.
// All subclasses will have the `extend` function.
Class = function () {};

// Export class extend method
Class.extend = extendThis;

// Return prepared class object
module.exports = Class;

