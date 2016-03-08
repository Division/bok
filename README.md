# BOK game

Javascript implementation of the position based physics, WebGL render and fun gameplay.

TODO:
* Gameplay: add rope
* Gameplay: add original level loading
* Gameplay: collect items and switch levels (original game functional)
* Physics: add particle masses
* Physics: add collisions vs lines (for rope bridges)
* Render: initial GBuffer filling with color data
* Render: 2D defferred shading
* Render: normal mapping
* Render: shadow maps

DONE:
* Physics: position based physics
* Physics: convex collision response
* Physics: friction


Installation:
-----------------------------------------------------------------------

1. Install webpack

```
npm install webpack -g
```

2. Install dependencies

````
npm install
````

Webpack usage:
-----------------------------------------------------------------------

Create build:

````
webpack
````

Create small build:

````
webpack -p
````

Make build on file modification:

````
webpack --watch
````
-----------------------------------------------------------------------
