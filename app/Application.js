require('less/main.less');

var Router = require('./Router');

// Hide loading screen
$("#loading-mask").remove();

// This need for access to current router globally
Backbone.application = { };
Backbone.application.router = new Router();

// Enable history
Backbone.history.start();
Backbone.history.stop();
