# esri-javascript-scalebar-4

A re-purposed [Esri JavaScript 3.17 API](https://developers.arcgis.com/javascript/) Scalebar widget.

Currently the 4.0 API does not contain a [Scalebar](https://developers.arcgis.com/javascript/3/jsapi/scalebar-amd.html), therefore this tool can be used to replicate that functionality.

## WORKS ONLY FOR 2D!

### Usage
Simply load the module into your code using dojo.require.

### Initialise a new object:

```js
var scalebar = new Scalebar({
  domNode: 'scalebarDiv',
  view: view,
  unit: 'dual',
  colour: '#444444'
});
```

### Constructor parameters:

* domNode: the dom-node to attach the scalebar to (required).
* view: the Map View object which the scalebar will reference (required).
* unit: 'dual' = Metric & Imperial, or 'metric' = Metric, 'imperial' = Imperial (optional).
* colour: the colour of the scalebar (optional).

### Example
Here is a quick example to get you started. Just copy the Scalebar.js file into your project, add the correct dojoConfig parameters to load the module, then just use it in your code as you would a standard dojo widget.

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no">
<title>Get started with MapView - Create a 2D map</title>

<style>
  html,
  body,
  #viewDiv {
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
  }
</style>

<link rel="stylesheet" href="https://js.arcgis.com/4.1/esri/css/main.css">
<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/dojo/1.10.4/dijit/themes/claro/claro.css"/‌​>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.6/d3.min.js"></script>

<script>
  var dojoConfig = {
    packages: [{
      name: 'scalebar',
      location: location.pathname.replace(/\/[^/]+$/, '') + '/js',
      main: 'scalebar'
    }]
  };
</script>
<script src="https://js.arcgis.com/4.1/"></script>

<script>
  require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    'scalebar',
    "dojo/domReady!"
  ], function(Map, MapView, SceneView, Scalebar) {

    var map = new Map({
      basemap: "streets",
      ground: "world-elevation"
    });

    var view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 4,
      center: [15, 65]
    });

    var scalebar = new Scalebar({
      domNode: 'scalebarDiv',
      view: view,
      unit: 'dual',
      colour: '#444444'
    })

  });
</script>
</head>

<body class="claro">
  <div id="viewDiv"></div>
  <div style="position:fixed;bottom:60px;left:60px;">
    <div id="scalebarDiv" />
  </div>
</body>
</html>
```
