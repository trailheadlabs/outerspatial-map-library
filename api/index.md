* [Map](#map)
* [Layers](#layers)
   * [arcgisserver](#arcgisserver)
   * [bing](#bing)
   * [cartodb](#cartodb)
   * [csv](#csv)
   * [geojson](#geojson)
   * [github](#github)
   * [kml](#kml)
   * [mapbox](#mapbox)
   * [spot](#spot)
   * [tiled](#tiled)
   * [wms](#wms)
   * [zoomify](#zoomify)
* [Controls](#controls)
   * [edit](#edit)
   * [fullscreen](#fullscreen)
   * [geocoder](#geocoder)
   * [hash](#hash)
   * [home](#home)
   * [infobox](#infobox)
   * [legend](#legend)
   * [locate](#locate)
   * [measure](#measure)
   * [overview](#overview)
   * [print](#print)
   * [scale](#scale)
   * [smallzoom](#smallzoom)
   * [switcher](#switcher)
   * [zoomdisplay](#zoomdisplay)
* [Modules](#modules)
   * [directions](#directions)
* [Icons](#icons)
   * [maki](#maki)
   * [outerspatialsymbollibrary](#outerspatialsymbollibrary)
* [Presets](#presets)
   * [baseLayer](#baselayer)
* [Utils](#utils)
* [Concepts](#concepts)
   * [Bootstrap vs. API](#bootstrap-vs-api)
   * [Hooks](#hooks)
   * [Multiple Maps](#multiple-maps)
   * [Plugins](#plugins)
   * [Using Popups](#using-popups)
   * [Using Tooltips](#using-tooltips)
   * [Styling Vectors](#styling-vectors)

## <a name="map">map(config: object)</a>

Create and configure a map with baseLayers, overlays, controls, and modules.

_Extends_: [`L.Map`](http://leafletjs.com/reference.html#map-class)

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `div` (Object or String): Either a reference to an HTML element or the id of an HTML element to render the map into.
* (Optional) `baseLayers` (Array): An array of baseLayer configuration objects AND/OR [baseLayer preset](#baseLayer-presets) strings. Defaults to `['mapbox-outdoors']`.
* (Optional) `description` (String): A description for the map. Used by some templates.
* (Optional) `detectAvailablePopupSpace` (Boolean): Defaults to `undefined`. If `true` or `undefined`, OuterSpatial Map Library will detect the height and width available in your map and set the `maxHeight` and `maxWidth` properties of the map's popups automatically.
* (Optional) `editControl` (Boolean or Object): Defaults to `undefined`.
* (Optional) `events` (Array): An array of event objects to attach to the map. Defaults to `undefined`.
* (Optional) `fullscreenControl` (Boolean or Object): Defaults to `undefined`.
* (Optional) `geocoderControl` (Boolean or Object): Defaults to `undefined`.
* (Optional) `hashControl` (Boolean): Defaults to `undefined`.
* (Optional) `homeControl` (Boolean or Object): Defaults to `true`.
* (Optional) `hooks` (Object): Add `init` and/or `preinit` hooks to the map. These must be functions that accept a `callback` parameter, and execute the `callback` function. Defaults to `undefined`.
* (Optional) `infoboxControl` (Boolean): Defaults to `undefined`.
* (Optional) `legendControl` (Boolean or Object): Defaults to `undefined`.
* (Optional) `locateControl` (Boolean or Object): Defaults to `undefined`.
* (Optional) `measureControl` (Boolean or Object): Defaults to `undefined`.
* (Optional) `name` (String): A name for the map. Used by some templates.
* (Optional) `overlays` (Array): An array of overlay configuration objects. Defaults to `undefined`.
* (Optional) `overviewControl` (Boolean or Object): Defaults to `undefined`.
* (Optional) `printControl` (Boolean or Object): Defaults to `undefined`.
* (Optional) `scaleControl` (Boolean or Object): Defaults to `undefined`.
* (Optional) `smallzoomControl` (Boolean or Object): Defaults to `true`.
* (Optional) `zoomdisplayControl` (Boolean or Object): Defaults to `undefined`.

You can also (optionally) provide any of the options supported by [`L.Map`](http://leafletjs.com/reference.html#map-options).

_Returns_: a map object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map'
    });

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

_Working Examples_:

* [Getting Started](../examples/basic.html)
* [Events](../examples/events.html)
* [Hooks](../examples/hooks.html)
* [Multiple Maps on One Page](../examples/multiple-maps.html)
* [Using Notifications](../examples/notifications.html)

**[[⬆]](#)**

## <a name="layers">Layers</a>

Layers can be added to a map via the `baseLayers` and/or `overlays` configs.

Only one baseLayer can be visible at a time. If multiple baseLayers are specified, the first baseLayer will be visible when the map initializes. [baseLayer preset](#baseLayer) strings are supported in the `baseLayers` property.

Multiple overlays can be visible at the same time. Overlays will be added to the map in the order they are specified in the `overlays` property, and will display from bottom-to-top on the map.

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      baseLayers: [
        'bing-aerial'
      ],
      overlays: [{
        table: 'parks',
        type: 'cartodb',
        user: 'nps'
      }]
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.bing().addTo(map);
    L.outerspatial.layer.cartodb({
      table: 'parks',
      type: 'cartodb',
      user: 'nps'
    }).addTo(map);

You can add events to a layer by adding an `events` array to the layer config. The array should contain event objects with `fn` and `type` properties. These objects can also (optionally) be given a `single` property if the event should only be fired one time. An example:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        events: [{
          fn: function() {
            console.log('tileloadstart');
          },
          type: 'tileloadstart'
        }],
        table: 'parks',
        type: 'cartodb',
        user: 'nps'
      }]
    };

Supported event "types" include all of the Leaflet layer events for a given layer type, as well as the following event types added by OuterSpatial Map Library:

* `error`: Fired when a layer error occurs. Passes the error event object to the event function.
* `load`: Fired when a layer is loaded. Only available for layers that extend `L.GeoJson`.
* `ready`: Fires when a layer is initialized and ready to interact with programatically.

_Working Examples_:

* [Events](../examples/events.html)

**[[⬆]](#)**

### <a name="arcgisserver">arcgisserver(config: object)</a>

Create a layer from an ArcGIS Server tiled or dynamic map service, including **map** services hosted on ArcGIS Online, and add it to a map.

Note: If you want to bring in an ArcGIS Online **feature** service, you will need to add it as a [GeoJSON](#geojson) layer to OuterSpatial Map Library. You can get GeoJSON in [WGS84](http://en.wikipedia.org/wiki/World_Geodetic_System) out of the feature service by appending `?f=geojson&outSR=4326` to the end of the query URL, e.g.:

    http://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/GRSM_RESTROOMS/FeatureServer/0/query?f=geojson&outSR=4326&where=OBJECTID+IS+NOT+NULL

_Extends_:

* Dynamic ArcGIS Server layers extend [`L.Class`](http://leafletjs.com/reference.html#class).
* Tiled ArcGIS Server layers extend [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `tiled` (Boolean): Should be `true` if the service is tiled and `false` if it is not.
* (Required) `url` (String): A URL string ending with `MapServer` for the service's endpoint.
* (Optional) `attribution` (String): An attribution string for the layer. HTML is allowed.
* (Optional) `clickable` (Boolean): Should interactivity (click) operations be enabled for this layer? Defaults to `true`.
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `dynamicAttribution` (String): The URL of a [dynamic attribution](http://blogs.esri.com/esri/arcgis/2012/08/15/dynamic-attribution-is-here/) endpoint for the service.
* (Optional) `layers` (String): A comma-delimited string of the ArcGIS Server integer layer identifiers to bring into the OuterSpatial Map Library layer.
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `popup` (String, Object, or Function): Configures the contents of the overlay's [popups](#using-popups).

For tiled ArcGIS Server layers, you can also (optionally) provide any of the options supported by [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        attribution: '<a href="http://www.esri.com" target="_blank">Esri</a>',
        opacity: 0.5,
        tiled: true,
        type: 'arcgisserver',
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Unemployment_Rate/MapServer'
      }]
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.arcgisserver({
      attribution: '<a href="http://www.esri.com" target="_blank">Esri</a>',
      opacity: 0.5,
      tiled: true,
      url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Unemployment_Rate/MapServer'
    }).addTo(map);

_Working Examples_:

* [ArcGIS Server Layer](../examples/arcgisserver-layer.html)

**[[⬆]](#)**

### <a name="bing">bing(config: object)</a>

Create a layer from the [Bing Imagery API](http://msdn.microsoft.com/en-us/library/ff701721.aspx) and add it to a map.

_Extends_: [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer)

_Arguments_:

The first, and only, argument is optional. It may be a config object with the following properties:

* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `layer` (String): The layer you want to bring in from the Bing Imagery API. Defaults to `aerial`. Valid options are `aerial`, `aerialwithlabels`, and `road`.
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).

You can also (optionally) provide any of the options supported by [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      baseLayers: [{
        layer: 'aerialwithlabels',
        type: 'bing'
      }]
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.bing({
      layer: 'aerialwithlabels'
    }).addTo(map);

_Working Examples_:

* [Bing Layer](../examples/bing-layer.html)

**[[⬆]](#)**

### <a name="cartodb">cartodb(config: object)</a>

Create a [CartoDB](http://cartodb.com) layer and add it to a map.

_Extends_: [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer)

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `table` (String): The name of the CartoDB table.
* (Required) `user` (String): The name of the CartoDB user.
* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `cartocss` (String): A [CartoCSS](https://www.mapbox.com/tilemill/docs/manual/carto/) string to apply to the layer.
* (Optional) `clickable` (Boolean): Should interactivity (hover and click) operations be enabled for this layer? Defaults to `true`.
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `interactivity` (String): A comma-delimited string of fields to pull from CartoDB for interactivity (available via mouseover and click operations).
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `popup` (String, Object, or Function): Configures the contents of the overlay's [popups](#using-popups).
* (Optional) `sql` (String): A SQL query to pass to CartoDB.
* (Optional) `styles` (Object): Configures the overlay's [styles](#styling-vectors).
* (Optional) `tooltip` (String, Object, or Function): Configures the contents of the overlay's [tooltips](#using-tooltips).

You can also (optionally) provide any of the options supported by [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        table: 'parks',
        type: 'cartodb',
        user: 'nps'
      }]
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.cartodb({
      table: 'parks',
      type: 'cartodb',
      user: 'nps'
    }).addTo(map);

_Working Examples_:

* [CartoDB Layer](../examples/cartodb-layer.html)

**[[⬆]](#)**

### <a name="csv">csv(config: object)</a>

Create a CSV layer and add it to a map.

_Extends_: [`L.GeoJSON`](http://leafletjs.com/reference.html#geojson)

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `data` (String): A string of CSV data. Required if `url` is not provided.

_OR_

* (Required) `url` (String): A URL to load the CSV data from. Required if `data` is not provided.

_AND_

* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `clickable` (Boolean): Should interactivity (hover and click) operations be enabled for this layer? Defaults to `true`.
* (Optional) `cluster` (Boolean): Should the layer's markers be clustered?
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `popup` (String, Object, or Function): Configures the contents of the overlay's [popups](#using-popups).
* (Optional) `styles` (Object): Configures the overlay's [styles](#styling-vectors).
* (Optional) `tooltip` (String, Object, or Function): Configures the contents of the overlay's [tooltips](#using-tooltips).
* (Optional) `zoomToBounds` (Boolean): Should the map zoom to the bounds of this overlay when it is loaded?

You can also (optionally) provide any of the options supported by [`L.GeoJSON`](http://leafletjs.com/reference.html#geojson-options), minus these exceptions:

1. `pointToLayer`
2. `style`
3. `onEachFeature`

These three options are not supported because they are used internally by OuterSpatial Map Library. If provided, they will be overwritten.

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        type: 'csv',
        url: 'data/colorado_cities.csv'
      }]
    });

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.csv({
      url: 'data/colorado_cities.csv'
    }).addTo(map);

_Working Examples_:

* [CSV Layer](../examples/csv-layer.html)
* [CSV Layer (Clustered)](../examples/csv-layer-clustered.html)

**[[⬆]](#)**

### <a name="geojson">geojson(config: object)</a>

Create a GeoJSON layer and add it to a map.

_Extends_: [`L.GeoJSON`](http://leafletjs.com/reference.html#geojson)

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `data` (Object): A GeoJSON or TopoJSON object. Required if `url` is not provided.

_OR_

* (Required) `url` (String): A URL to load the GeoJSON or TopoJSON data from. Required if `data` is not provided.

_AND_

* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `clickable` (Boolean): Should interactivity (hover and click) operations be enabled for this layer? Defaults to `true`.
* (Optional) `cluster` (Boolean): Should the layer's markers be clustered?
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `popup` (String, Object, or Function): Configures the contents of the overlay's [popups](#using-popups).
* (Optional) `styles` (Object): Configures the overlay's [styles](#styling-vectors).
* (Optional) `tooltip` (String, Object, or Function): Configures the contents of the overlay's [tooltips](#using-tooltips).
* (Optional) `zoomToBounds` (Boolean): Should the map zoom to the bounds of this overlay when it is loaded?

You can also (optionally) provide any of the options supported by [`L.GeoJSON`](http://leafletjs.com/reference.html#geojson-options), minus these exceptions:

1. `pointToLayer`
2. `style`
3. `onEachFeature`

These three options are not supported because they are used internally by OuterSpatial Map Library. If provided, they will be overwritten.

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        type: 'geojson',
        url: 'data/national_parks.geojson'
      }]
    });

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.geojson({
      url: 'data/national_parks.geojson'
    }).addTo(map);

_Working Examples_:

* [GeoJSON Layer](../examples/geojson-layer.html)
* [GeoJSON Layer (Clustered)](../examples/geojson-layer-clustered.html)

**[[⬆]](#)**

### <a name="github">github(config: object)</a>

Create a layer from a GeoJSON or TopoJSON file stored on GitHub and add it to a map.

NOTE: This layer handler utilizes the [GitHub API](https://developer.github.com/v3/) to pull data in. This API is limited to 60 requests per hour, so GitHub layers should only be used in development maps. If you want to use GitHub to host data for your production maps, you should setup a [GitHub Pages](http://pages.github.com/) site and utilize the [CSV](#csv), [GeoJSON](#geojson), or [KML](#kml) layer handlers.

_Extends_: [`L.GeoJSON`](http://leafletjs.com/reference.html#geojson)

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `path` (String): The path to your GitHub file. This _should not_ include your GitHub organization/user name or the name of the repository. This is the path to the GeoJSON file in your GitHub repository, e.g. `fire/CA-STF-HV2F.geojson`.
* (Required) `repo` (String): The name of the repository that contains the data.
* (Required) `user` (String): The name of the organization or user that owns the repository.
* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `branch` (String) The name of the branch your GitHub file should be pulled in from. Defaults to `master`.
* (Optional) `clickable` (Boolean): Should interactivity (hover and click) operations be enabled for this layer? Defaults to `true`.
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `popup` (String, Object, or Function): Configures the contents of the overlay's [popups](#using-popups).
* (Optional) `styles` (Object): Configures the overlay's [styles](#styling-vectors).
* (Optional) `tooltip` (String, Object, or Function): Configures the contents of the overlay's [tooltips](#using-tooltips).
* (Optional) `zoomToBounds` (Boolean): Should the map zoom to the bounds of this overlay when it is loaded?

You can also (optionally) provide any of the options supported by [`L.GeoJSON`](http://leafletjs.com/reference.html#geojson-options), minus these exceptions:

1. `pointToLayer`
2. `style`
3. `onEachFeature`

These three options are not supported because they are used internally by OuterSpatial Map Library. If provided, they will be overwritten.

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        branch: 'gh-pages',
        path: 'base_data/boundaries/parks/yose.topojson',
        repo: 'data',
        type: 'github',
        user: 'nationalparkservice'
      }]
    });

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.github({
      branch: 'gh-pages',
      path: 'base_data/boundaries/parks/yose.topojson',
      repo: 'data',
      user: 'nationalparkservice'
    }).addTo(map);

_Working Examples_:

* [GitHub Layer](../examples/github-layer.html)

**[[⬆]](#)**

### <a name="kml">kml(config: object)</a>

Create a KML layer and add it to a map.

NOTE: For OuterSpatial Map Library to load KML data, the data must be properly formatted. OuterSpatial Map Library uses toGeoJSON internally to convert KML to GeoJSON, so if your KML isn't loading properly, go and test it on the [website](http://mapbox.github.io/togeojson/).

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `data` (Object): The string of KML data. Required if `url` is not provided.

_OR_

* (Required) `url` (String): A URL to load the KML data from. Required if `data` is not provided.

_AND_

* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `clickable` (Boolean): Should interactivity (hover and click) operations be enabled for this layer? Defaults to `true`.
* (Optional) `cluster` (Boolean): Should the layer's markers be clustered?
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `popup` (String, Object, or Function): Configures the contents of the overlay's [popups](#using-popups).
* (Optional) `styles` (Object): Configures the overlay's [styles](#styling-vectors).
* (Optional) `tooltip` (String, Object, or Function): Configures the contents of the overlay's [tooltips](#using-tooltips).
* (Optional) `zoomToBounds` (Boolean): Should the map zoom to the bounds of this overlay when it is loaded?

You can also (optionally) provide any of the options supported by [`L.GeoJSON`](http://leafletjs.com/reference.html#geojson-options), minus these exceptions:

1. `pointToLayer`
2. `style`
3. `onEachFeature`

These three options are not supported because they are used internally by OuterSpatial Map Library. If provided, they will be overwritten.

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        type: 'kml',
        url: 'data/national_parks.kml'
      }]
    });

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.kml({
      url: 'data/national_parks.kml'
    }).addTo(map);

_Working Examples_:

* [KML Layer](../examples/kml-layer.html)
* [KML Layer (Clustered)](../examples/kml-layer-clustered.html)

**[[⬆]](#)**

### <a name="mapbox">mapbox(config: object)</a>

Create a Mapbox layer and add it to a map.

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `id` (String): The id (`account.id`) of the Mapbox map or dataset you want to add to the map. Can also be a comma-delimited string with multiple `account.id` strings if you want to take advantage of Mapbox's compositing feature. Required if `tileJson` is not provided.

OR

* (Required) `tileJson` (Object): A tileJson object for the Mapbox map or tileset you want to add to the map. Required if `id` is not provided.

AND

* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `clickable` (Boolean): Should interactivity (hover and click) operations be enabled for this layer? Defaults to `true`.
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `format` (String): The output format of the raster tiles. Valid values include: `jpg70`, `jpg80`, `jpg90`, `png`, `png32`, `png64`, `png128`, or `png256`. Defaults to `png`.
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `popup` (String, Object, or Function): Configures the contents of the overlay's [popups](#using-popups).
* (Optional) `tooltip` (String, Object, or Function): Configures the contents of the overlay's [tooltips](#using-tooltips).

You can also (optionally) provide any of the options supported by [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        id: 'examples.map-20v6611k',
        type: 'mapbox'
      }]
    });

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.mapbox({
      id: 'examples.map-20v6611k'
    }).addTo(map);

_Working Examples_:

* [Mapbox Layer](../examples/mapbox-layer.html)

**[[⬆]](#)**

### <a name="spot">spot(config: object)</a>

Create a layer from a SPOT satellite device and add it to a map.

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `id` (String): The id of the SPOT device whose data you want to add to the map.
* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `clickable` (Boolean): Should interactivity (hover and click) operations be enabled for this layer? Defaults to `true`.
* (Optional) `cluster` (Boolean): Should the layer's markers be clustered?
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `latest` (Boolean): Only show the latest SPOT message (per device). If `latest` and `minutesAgo` are both specified, `latest` takes precedence.
* (Optional) `minutesAgo` (Number): Show SPOT messages from this number of minutes ago. Maximum is 10080 (7 days). If `latest` and `minutesAgo` are both specified, `latest` takes precedence.
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `password` (String): SPOT feed password.
* (Optional) `popup` (String, Object, or Function): Configures the contents of the overlay's [popups](#using-popups).
* (Optional) `styles` (Object): Configures the overlay's [styles](#styling-vectors).
* (Optional) `tooltip` (String, Object, or Function): Configures the contents of the overlay's [tooltips](#using-tooltips).
* (Optional) `zoomToBounds` (Boolean): Do you want to zoom the map to the extent of the points loaded from the SPOT device?

You can also (optionally) provide any of the options supported by [`L.GeoJSON`](http://leafletjs.com/reference.html#geojson-options), minus these exceptions:

1. `pointToLayer`
2. `style`
3. `onEachFeature`

These three options are not supported because they are used internally by OuterSpatial Map Library. If provided, they will be overwritten.

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        id: '08HVpMLpDksQjCeBL1FbTkqGHP4Bk7dfg',
        type: 'spot'
      }]
    });

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map',
    });

    L.outerspatial.layer.spot({
      id: '08HVpMLpDksQjCeBL1FbTkqGHP4Bk7dfg'
    }).addTo(map);

_Working Examples_:

* [SPOT Layer](../examples/spot-layer.html)

**[[⬆]](#)**

### <a name="tiled">tiled(config: object)</a>

Create a tiled layer and add it to a map.

_Arguments_:

The first, and only, argument is required, and must be a config object with the following properties:

* (Required) `url` (String): The templated URL string. Accepted parameters are:
  * `{{s}}`: Subdomain
  * `{{x}}`: X coordinate
  * `{{y}}`: Y coordinate
  * `{{z}}`: Zoom level
* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).

You can also (optionally) provide any of the options supported by [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        type: 'tiled',
        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
      }]
    });

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.tiled({
      attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
    }).addTo(map);

_Working Examples_:

* [Tiled Layer](../examples/tiled-layer.html)

**[[⬆]](#)**

### <a name="wms">wms(config: object)</a>

Create a WMS layer and add it to a map.

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `layers` (String): A comma-delimited string of the layers from the WMS service to add to the layer.
* (Required) `url` (String): The URL to the WMS service.
* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).

You can also (optionally) provide any of the options supported by [`L.TileLayer.WMS`](http://leafletjs.com/reference.html#tilelayer-wms).

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        attribution: 'NOAA',
        format: 'image/png',
        layers: 'RAS_RIDGE_NEXRAD',
        transparent: true,
        type: 'wms',
        url: 'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/obs'
      }]
    });

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.wms({
      attribution: 'NOAA',
      format: 'image/png',
      layers: 'RAS_RIDGE_NEXRAD',
      transparent: true,
      url: 'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/obs'
    }).addTo(map);

_Working Examples_:

* [WMS Layer](../examples/wms-layer.html)

**[[⬆]](#)**

### <a name="zoomify">zoomify(config: object)</a>

Create a Zoomify layer and add it to a map.

NOTE: Zoomify layers do not contain spatial reference information, so they will not work with other layers. Because of this, when a Zoomify layer is added to a map, OuterSpatial Map Library ignores any other layers specified in the `baseLayers` and/or `overlays` configs.

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `height` (Number): The height, in pixels, of the Zoomify layer.
* (Required) `url` (String): The URL path to the directory that contains the Zoomify tiles.
* (Required) `width` (Number): The width, in pixels, of the Zoomify layer.
* (Optional) `attribution` (String): The attribution string for this layer. HTML is accepted.
* (Optional) `description` (String): A description for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `name` (String): A name for the layer. Used by some [controls](#controls) and [modules](#modules).
* (Optional) `tolerance` (Number): The tolerance to use when calculating the best initial zoom level. Defaults to `0.8`.

You can also (optionally) provide any of the options supported by [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

_Returns_: a layer object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        height: 2737,
        type: 'zoomify',
        url: 'data/parkmaps/maca/img/',
        width: 6543
      }]
    });

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.zoomify({
      height: 2737,
      url: 'data/parkmaps/maca/img/',
      width: 6543
    }).addTo(map);

_Working Examples_:

* [Zoomify Layer](../examples/zoomify-layer.html)

**[[⬆]](#)**

## <a name="controls">Controls</a>

Add functionality to your map using OuterSpatial Map Library' controls. Controls are added to either a control bar overlaid in one of the four corners of the map or a toolbar that displays above the map.

**[[⬆]](#)**

### <a name="edit">edit(config: object)</a>

Create an edit control that supports adding markup shapes (points, lines, and polygons), and add it to a map.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

You can (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      editControl: true
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.edit().addTo(map);

_Working Examples_:

* [Edit Control](../examples/edit-control.html)

**[[⬆]](#)**

### <a name="fullscreen">fullscreen()</a>

Create a fullscreen control and add it to a map. The fullscreen control contains a button that toggles the map in and out of fullscreen mode.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

No arguments are accepted.

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      fullscreenControl: true
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.fullscreen().addTo(map);

_Working Examples_:

* [Fullscreen Control](../examples/fullscreen-control.html)
* [Fullscreen Control (API)](../examples/fullscreen-control-api.html)
* [Fullscreen Control (iframe)](../examples/fullscreen-control-iframe.html)

**[[⬆]](#)**

### <a name="geocoder">geocoder(config: object)</a>

Create a geocoder control that searches through both an index of National Parks and a more detailed geocoding service and add it to a map.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

The first, and only, argument is optional, and may be a control config object with the following properties:

* (Optional) `provider` (String): Which supported provider should be used? Defaults to `esri`. Valid options are `bing`, `esri`, `mapbox`, `mapquest`, `mapzen`, and `nominatim`. **Note** that the `mapquest` and `nominatim` providers are limited to 15,000 transactions per month, so they are not recommended for production usage.
* (Optional) `searchPlaces` (Boolean): Should the geocoder search through points of interest from the National Park Service's [Places](https://www.nps.gov/maps/tools/places/) system? Defaults to `false`.

You can also (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      geocoderControl: true
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.geocoder().addTo(map);

_Working Examples_:

* [Geocoder Control](../examples/geocoder-control.html)

**[[⬆]](#)**

### <a name="hash">hash()</a>

Create a control that updates the web browser's URL with current location (latitude and longitude) and zoom level information and add it to a map.

_Extends_: [`L.Class`](http://leafletjs.com/reference.html#class)

_Arguments_:

No arguments are accepted.

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      hashControl: true
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.hash().addTo(map);

_Working Examples_:

* [Hash Control](../examples/hash-control.html)
* [Hash Control (iframe)](../examples/hash-control-iframe.html)
* [Hash Control (Track History)](../examples/hash-control-track-history.html)

**[[⬆]](#)**

### <a name="home">home(config: object)</a>

Create a control that zooms and/or pans the map back to its initial center and zoom and add it to a map. This control is added to maps, by default.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

You can (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map'
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

**[[⬆]](#)**

### <a name="infobox">infobox(config: object)</a>

Create a control that displays "pinned" tooltip information.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

You can (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      infoboxControl: true
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.infobox().addTo(map);

**[[⬆]](#)**

### <a name="legend">legend(config: object)</a>

Create a control that displays legend information and add it to a map.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required property:

* (Required) `html` (String): A string of HTML to add to the control.

You can also (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      legendControl: {
        html: '' +
          '<h3>Legend</h3>' +
          '<ul>' +
            '<li>Item 1</li>' +
            '<li>Item 2</li>' +
          '</ul>' +
        ''
      }
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.legend({
      html: '' +
        '<h3>Legend</h3>' +
        '<ul>' +
          '<li>Item 1</li>' +
          '<li>Item 2</li>' +
        '</ul>' +
      ''
    }).addTo(map);

_Working Examples_:

* [Legend Control](../examples/legend-control.html)
* [Legend Control (ArcGIS Server)](../examples/legend-control-arcgisserver.html)

**[[⬆]](#)**

### <a name="locate">locate(config: object)</a>

Create a control that uses the web browser geolocation functionality to display the location of the current user and add it to a map.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

You can (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      locateControl: true
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.locate().addTo(map);

_Working Examples_:

* [Locate Control](../examples/locate-control.html)

**[[⬆]](#)**

### <a name="measure">measure(config: object)</a>

Create a control that supports drawing area and distance measurements and add it to a map.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

The first, and only, argument is optional, and may be a config object with the following properties:

* (Optional) `units` (Object): An object, with one or both `area` (Array) and `distance` (Array) properties that tell OuterSpatial Map Library which units to support with the control. Valid area units are acres (`ac`) and hectares (`ha`). Valid distance units are feet (`f`), meters (`m`), and miles (`mi`). The control defaults to all available area and distance units.

You can also (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      measureControl: true
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.measure().addTo(map);

_Working Examples_:

* [Measure Control](../examples/measure-control.html)

**[[⬆]](#)**

### <a name="overview">overview(config: object)</a>

Create a map control that provides context for the currently-visible area of the map and it to a map. Adapted from the [Leaflet-MiniMap](https://github.com/Norkart/Leaflet-MiniMap) plugin.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

The first, and only, argument is required. It must be a config object comprised of the following required and optional properties:

* (Required) `layer` (String|Object): A config object that you would like to add to the map. Can either be a layer preset string or a config object.
* (Optional) `autoToggleDisplay` (Boolean): Should the overview hide automatically if the parent map bounds does not fit within the bounds of the overview map? Defaults to `false`.
* (Optional) `height` (Number): The height of the overview map. Defaults to 150 pixels.
* (Optional) `toggleDisplay` (Boolean): Should the overview map be togglable? Defaults to `true`.
* (Optional) `width` (Number): The width of the overview map. Defaults to 150 pixels.
* (Optional) `zoomLevelFixed` (Number): Overrides `zoomLevelOffset`, sets the map to a fixed zoom level.
* (Optional) `zoomLevelOffset` (Number): A positive or negative number that configures the overview map to a zoom level relative to the zoom level of the main map.

You can also (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overviewControl: {
        layer: 'mapbox-light'
      }
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.overview({
      layer: 'mapbox-light'
    }).addTo(map);

_Working Examples_:

* [Overview Control](../examples/edit-control.html)
* [Overview Control (API)](../examples/edit-control-api.html)

**[[⬆]](#)**

### <a name="print">print(config: object)</a>

Create a print control and add it to a map. The print control loads a print-optimized web page with the current map, including latitude, longitude, and zoom level, in a new browser tab or window.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

The first, and only, argument is optional, and may be a config object with the following properties:

* (Optional) `ui` (Boolean): Should the control add its user interface (UI) to the map? Defaults to `true`.
* (Optional) `url` (String): A URL to a print-optimized web page. Defaults to `https://www.trailheadlabs.com/labs/outerspatial-map-library/print/`.

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      printControl: true
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.print().addTo(map);

_Working Examples_:

* [Print Control](../examples/print-control.html)

**[[⬆]](#)**

### <a name="scale">scale(config: object)</a>

Create a scale control and add it to a map.

_Extends_: [`L.Control.Scale`](http://leafletjs.com/reference.html#control-scale)

_Arguments_:

You can (optionally) provide any of the options supported by [`L.Control.Scale`](http://leafletjs.com/reference.html#control-scale).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      scaleControl: true
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.scale().addTo(map);

_Working Examples_:

* [Scale Control](../examples/scale-control.html)
* [Scale Control (API)](../examples/scale-control-api.html)

**[[⬆]](#)**

### <a name="smallzoom">smallzoom(config: object)</a>

Create a map control that contains zoom in/out buttons and add it to a map. This control is added to maps, by default.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

You can (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map'
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

**[[⬆]](#)**

### <a name="switcher">switcher()</a>

The switcher control is used internally by OuterSpatial Map Library. It is automatically created and added to a map when more than one config object is present in a map's `baseLayers` property. It should not be created manually.

**[[⬆]](#)**

### <a name="zoomdisplay">zoomdisplay()</a>

Create a control to display the map's current zoom level and add it to a map.

_Extends_: [`L.Control`](http://leafletjs.com/reference.html#control)

_Arguments_:

You can (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

_Returns_: a control object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      zoomdisplayControl: true
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.control.zoomdisplay().addTo(map);

_Working Examples_:

* [Zoom Display Control](../examples/zoomdisplay-control.html)

**[[⬆]](#)**

## <a name="modules">Modules</a>

OuterSpatial Map Library modules are standalone pieces of functionality that can be added and integrated into a map.

### <a name="directions">directions</a>

Docs coming soon.

**[[⬆]](#)**

## <a name="icons">Icons</a>

### <a name="maki">maki(config: object)</a>

Create an icon using the [Maki](https://www.mapbox.com/maki/) icon set.

_Extends_: [`L.Icon`](http://leafletjs.com/reference.html#icon)

_Arguments_:

You can (optionally) provide any of the options supported by [`L.Icon`](http://leafletjs.com/reference.html#icon).

_Returns_: an icon object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        cluster: true,
        styles: {
          point: {
            'marker-color': '#5e9fd5',
            'marker-size': 'small',
            'marker-symbol': 'city'
          }
        },
        type: 'csv',
        url: 'data/colorado_cities_simplestyle.csv'
      }]
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.csv({
      cluster: true,
      styles: {
        point: {
          'marker-color': '#5e9fd5',
          'marker-size': 'small',
          'marker-symbol': 'city'
        }
      },
      type: 'csv',
      url: 'data/colorado_cities_simplestyle.csv'
    }).addTo(map);

_Working Examples_:

* [Styling Vectors](../examples/styling-vectors.html)

**[[⬆]](#)**

### <a name="outerspatialsymbollibrary">outerspatialsymbollibrary(config: object)</a>

Create an icon using the [OuterSpatial Symbol Library](https://github.com/trailheadlabs/outerspatial-symbol-library) icon set.

_Extends_: [`L.Icon`](http://leafletjs.com/reference.html#icon)

_Arguments_:

You can (optionally) provide any of the options supported by [`L.Icon`](http://leafletjs.com/reference.html#icon).

_Returns_: an icon object

_Example (Bootstrap)_:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        cluster: true,
        styles: {
          point: {
            'marker-color': '#5e9fd5',
            'marker-library': 'outerspatialsymbollibrary',
            'marker-size': 'small',
            'marker-symbol': 'campsite-white'
          }
        },
        type: 'csv',
        url: 'data/campsites.csv'
      }]
    };

_Example (API)_:

    var map = L.outerspatial.map({
      div: 'map'
    });

    L.outerspatial.layer.csv({
      cluster: true,
      styles: {
        point: {
          'marker-color': '#5e9fd5',
          'marker-library': 'outerspatialsymbollibrary',
          'marker-size': 'small',
          'marker-symbol': 'campsite-white'
        }
      },
      type: 'csv',
      url: 'data/campsites.csv'
    }).addTo(map);

_Working Examples_:

* [Styling Vectors](../examples/styling-vectors.html)

**[[⬆]](#)**

## <a name="presets">Presets</a>

Presets in OuterSpatial Map Library can be be used as shortcuts to add commonly-used layers and styling to a map.

**[[⬆]](#)**

### <a name="baseLayer">baseLayer</a>

OuterSpatial Map Library includes support for adding baseLayers via string presets. This makes it easy to add one or more baseLayers to your map without knowing the technical details required to manually configure it. To use presets, simply add one or more preset strings (outlined below) to the `baseLayers` property:

    var OuterSpatial = {
      div: 'map',
      baseLayers: [
        'mapbox-streets'
      ]
    };

The following baseLayer preset strings are supported:

* Bing
   * `bing-aerial`
   * `bing-aerialLabels`
   * `bing-roads`
* CartoDB
   * `cartodb-darkMatter`
   * `cartodb-darkMatterNoLabels`
   * `cartodb-positron`
   * `cartodb-positronNoLabels`
* Esri
   * `esri-gray`
   * `esri-imagery`
   * `esri-nationalGeographic`
   * `esri-oceans`
   * `esri-shadedRelief`
   * `esri-streets`
   * `esri-terrain`
   * `esri-topographic`
* Mapbox
   * `mapbox-dark`
   * `mapbox-emerald`
   * `mapbox-highContrast`
   * `mapbox-landsatLive`
   * `mapbox-light`
   * `mapbox-outdoors`
   * `mapbox-pencil`
   * `mapbox-satellite`
   * `mapbox-satelliteLabels`
   * `mapbox-streets`
   * `mapbox-terrain`
* OpenStreetMap
   * `openstreetmap`
* Stamen
   * `stamen-terrain`
   * `stamen-toner`
   * `stamen-watercolor`

Take a look at the [baseLayer presets](../examples/baselayer-presets.html) example for more information.

**[[⬆]](#)**

## <a name="utils">Utils</a>

Docs coming soon.

**[[⬆]](#)**

## <a name="concepts">Concepts</a>

Understanding a few fundamental concepts will help you get the most out of OuterSpatial Map Library.

**[[⬆]](#)**

### <a name="bootstrap-vs-api">Bootstrap vs. API</a>

There are three ways to use OuterSpatial Map Library: The "Bootstrap" method, the "API" method, and the "Hybrid" method.

#### Bootstrap

To create a map using the Bootstrap method, create an `OS` config object and add configuration properties to it as documented above. Then load `os-bootstrap.js` and OuterSpatial Map Library takes over from there.

This method is the recommended (and easiest) way to create maps with OuterSpatial Map Library, and it takes full advantage of the power of OuterSpatial Map Library. It includes "extras" like a spinning loading indicator and automatic loading of `os.css`.

#### API

It is also possible to create maps by interacting directly with the OuterSpatial Map Library API in a way similar to other more "traditional" web mapping libraries like Google Maps and the ArcGIS JavaScript API. This method requires a manual load of both `outerspatial.css` and `outerspatial.js`, and it lacks the "extras" that come along with the Bootstrap method. It also requires at least a general understanding of JavaScript.

#### Hybrid

Trailhead Labs builds many of its maps using a hybrid approach that uses `outerspatial-bootstrap.js` to do the initial configuration and load of a map and then takes advantage of OuterSpatial Map Library' [hooks](../examples/hooks.html) and API to add custom functionality.

This approach gets the best of both the Bootstrap and API methods: Easy initial configuration with advanced programmatic access for complete control. This approach also has an added benefit of consistency. Every map built using this hybrid approach is laid out (or "scaffolded") in a consistent way.

This hybrid approach is possible because OuterSpatial Map Library exposes the underlying [Map](#map), [Layer](#layer), [Control](#control), and [Module](#module) objects so they can be interacted with programatically after they are initialized.

For example, once OuterSpatial Map Library creates a map it exposes the internal map object via a `L` property on the `OS.config` object. This means you can access the object like this: `OuterSpatial.config.L`.

You can also access the `baseLayers` and `overlays` objects initialized by OuterSpatial Map Library in a similar way:

* `OuterSpatial.config.baseLayers[0].L` gets a reference to the layer object for the first baseLayer
* `OuterSpatial.config.overlays[0].L` gets a reference to the layer object for the first overlay

**[[⬆]](#)**

### <a name="hooks">Hooks</a>

You can use the `preinit` and `init` hooks to add custom functionality to your map. Both hooks must accept a callback function and execute it to pass control back to OuterSpatial Map Library.

    var OuterSpatial = {
      div: 'map',
      hooks: {
        preinit: function(callback) {
          // Add custom code here.
          callback();
        },
        init: function(callback) {
          // Add custom code here.
          callback();
        }
      }
    };

The `preinit` hook is called after OuterSpatial Map Library has loaded all of its dependencies and any plugins specified in the [`plugins`](#plugins) config. The `init` hook is called after OuterSpatial Map Library creates the map and has created any layers specified in the `baseLayers` or `overlays` configs.

**[[⬆]](#)**

### <a name="multiple-maps">Multiple Maps</a>

Unlike previous versions of the OuterSpatial Map Library library, the Bootstrap method supports adding multiple maps to the same web page. To add multiple maps, make the `OuterSpatial` config object an array of map configuration objects:

    var OuterSpatial = [{
      div: 'map-1'
    },{
      div: 'map-2'
    }];

**[[⬆]](#)**

### <a name="plugins">Plugins</a>

If you need to add functionality that isn't supported by OuterSpatial Map Library to a map, you can load a Leaflet plugin. The `plugins` configuration can be used to load plugins:

    var OuterSpatial = {
      div: 'map',
      plugins: [{
        js: 'plugins/Leaflet.GeometryUtil/0.8.0/plugin.min.js'
      },{
        js: 'plugins/Leaflet.Snap/0.4.0/plugin.min.js'
      }]
    };

OuterSpatial Map Library will load any CSS files (specified in the `css` property) and JavaScript files (specified in the `js` property). These plugins will be available in both the `preinit` and `init` [hooks](#hooks).

_Working Examples_:

* [Plugins](../examples/plugins.html)

**[[⬆]](#)**

### <a name="using-popups">Using Popups</a>

Popups display when you click on a feature in an overlay. Each popup is made up of three markup sections, with each having one or more nested subsection:

1. Header
   - Title
2. Content
   - Media
   - Description
3. Footer
   - Actions

If you do not specify a `popup` property on your layer object, OuterSpatial Map Library will use a set of sensible defaults to configure the popup. If, however, you specify a `popup` property on your layer object, OuterSpatial Map Library will only implement what you have specified. For example, if your `popup` property looks like the following:

    popup: {
      title: '{{Name}}'
    }

OuterSpatial Map Library will only display the title in the popup and will not render any other popup elements.

The content for each of the sections of a popup should be specified individually via a `popup` configuration object:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        ...
        popup: {
          // {Array}, {String}, or {Function}. If a {Function}, it must return an {Array} or {String}.
          actions: [{
            handler: function() {
              window.alert('Clicked!');
            },
            text: 'Click Me!' // No HTML allowed, but Handlebars is supported
          },{
            menu: [{
              handler: function() {
                window.alert('You clicked Menu Item 1');
              },
              text: 'Menu Item 1' // No HTML allowed, but Handlebars is supported
            },{
              handler: function() {
                window.alert('You clicked Menu Item 2');
              },
              text: 'Menu Item 2' // No HTML allowed, but Handlebars is supported
            }],
            text: 'Menu' // No HTML allowed, but Handlebars is supported
          }],
          // {Object}, {String} or {Function}. If a {Function}, it must return an {Object} or {String}.
          description: '<p style="color:red;">{{description}}</p>',
          description: {
            // {Array} (if undefined, all fields and values are displayed)
            fields: [
              'Name',
              'Description'
            ],
            // {String} ('table' or 'list') (if undefined, defaults to 'table')
            format: 'table'
          },
          // {Array}, {String}, or {Function} (that returns an {Array} or {String})
          media: [{
            id: '',
            type: 'focus' // Focus is currently the only supported system
          }],
          // Used to configure the "more" title for layers that support multiple results. No HTML allowed, but Handlebars is supported.
          more: '{{Name}}',
          // {String} or {Function}. If a {Function} it must return a {String}. {String}s support both HTML and Handlebars.
          title: function(data) {
            if (data.level > 5) {
              return 'Greater than 5!';
            } else {
              return 'Less than 5!';
            }
          }
        }
      }]
    };

If you are embedding media (images, audio, and/or video) in your popup, you should hardcode the height and width of the media in your HTML so OuterSpatial Map Library can size the popup appropriately:

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        ...
        popup: {
          description: '<img src="{{img_url}}" style="height:300px;width:400px;">'
        }
      }]
    };

[HTML](http://en.wikipedia.org/wiki/HTML) and [Handlebars](http://handlebarsjs.com/) are supported for many popup elements (take a look at the comments in the code sample above to see which elements support HTML and/or Handlebars).

OuterSpatial Map Library also adds a number of "helpers" to Handlebars. These helpers can be used to format popups:

<ul>
  <li><code>ifCond (available operators include '!=', '!==', '==', '===', '&lt;', '&lt;=', '&gt;', '&gt;=', '&&', and '||')</code><pre><code>description: "I am {{#ifCond Name '===' 'A Rectangle'}}indeed{{else}}not{{/ifCond}} a rectangle! (Verified by a custom Handlebars helper.)"</code></pre></li>
  <li><code>toLowerCase</code><pre><code>title: '{{toUpperCase Name}}'</code></pre></li>
  <li><code>toUpperCase</code><pre><code>title: '{{toUpperCase Name}}'</code></pre></li>
  <li><code>toInt</code><pre><code>description: '{{toInt StrInt}}'</code></pre></li>
</ul>

You can see examples of configuring popups for overlays in the [popups](../examples/popups.html) example.

**[[⬆]](#)**

### <a name="using-tooltips">Using Tooltips</a>

Tooltips display when you hover over a feature in an overlay. Tooltips only work for layer handlers that support `mouseover` and `mouseout` operations (currently CartoDB, CSV, GeoJSON, GitHub, KML, Mapbox, and SPOT).

Tooltips should be short and succinct. Both HTML and Handlebars strings are supported by tooltips.

    var OuterSpatial = {
      div: 'map',
      overlays: [{
        ...
        tooltip: '{{UnitCode}}'
      }]
    };

You can see examples of configuring tooltips for overlays in the [tooltips example](../examples/tooltips.html).

**[[⬆]](#)**

### <a name="styling-vectors">Styling Vectors</a>

OuterSpatial Map Library uses the [simplestyle specification](https://github.com/mapbox/simplestyle-spec) internally. It currently, at v1.1.0, includes the following properties:

    fill
    fill-opacity
    marker-color
    marker-size
    marker-symbol
    stroke
    stroke-opacity
    stroke-width

In addition, OuterSpatial Map Library supports the following property that is not supported by the simplestyle specification:

    marker-library

This property is optional. It defaults to `maki`, and can also be `outerspatial`.

Styles for vector shapes can be set in multiple ways. OuterSpatial Map Library looks in the following order for styles:

1. In the properties pulled in for each feature from the data source. You can tell OuterSpatial Map Library to ignore feature styles by setting the `ignoreFeatureStyles` property to true. For example, if a GeoJSON point feature has a `marker-symbol` property, it will be used to style the marker on the map unless `ignoreFeatureStyles` is set to `true` in the styles geometry (`line`, `point`, or `polygon`) object of an overlay's configuration.
2. In an overlay's configuration object, via a `styles` property, with `line`, `point`, and/or `polygon` properties designated as:
   1. an object
   2. a function that is passed a data object for each feature and returns a style object

If no styles are found in these two places, OuterSpatial Map Library falls back to a set of default styles.

If you prefer not to use the simplestyle specification, you can utilize the out-of-the-box Leaflet styles for the `line` (L.Path), `point` (L.Icon), and `polygon` (L.Path) `styles` object on your overlay configuration. OuterSpatial Map Library will then pass the object directly to Leaflet.

**Note**: Style properties cascade. This means that if a `marker-symbol` property is passed in via the data source (e.g. a GeoJSON feature's properties) and a `marker-color` property is passed in via the overlay config object, the geometry will be styled with both the `marker-symbol` **and** `marker-color` properties unless the `ignoreFeatureStyles` property is present.

Take a look at the [Styling Vectors example](../examples/styling-vectors.html) to see an example of using the different configuration options to style overlay's.

**[[⬆]](#)**
