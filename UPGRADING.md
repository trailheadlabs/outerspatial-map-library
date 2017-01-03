# Upgrading

Upgrading to NPMap.js (any version of NPMap >= 2.0.0) from an old version of the NPMap library (any version < 2.0.0) requires some minor changes.

## Changes

**The NPMap variable no longer needs a `config` property, and it can now be either an object (one map) or an array (multiple maps).**

Legacy:

    var NPMap = {
      config: {
        div: 'map'
      }
    };

NPMap.js:

    var NPMap = {
      div: 'map'
    };

    var NPMap = [{
      div: 'map1'
    },{
      div: 'map2'
    }];

**The `zoomRange` property is no longer an object and is now broken up into two individual properties: `minZoom` and `maxZoom`.**

Legacy:

    ...
    zoomRange: {
      max: 15,
      min: 7
    }

NPMap.js:

    ...
    minZoom: 7,
    maxZoom: 15

Some more notes:

1. The `api` config property is no longer needed and will be ignored, if provided
2. The `events` config property is now named `hooks`
3. The `InfoBox` config property is now named `popup`
4. The `layers` config property is now named `overlays`
5. The `TileStream` layer handler is now named `mapbox`
6. The `tools` config property has been deprecated. "Tools" are now called "Controls", and they can be added as individual `Boolean` or `Object` configs. Take a look at the [examples](https://github.com/nationalparkservice/npmap.js/tree/master/examples) for more information.
7. The `type` property for `baselayers` and `overlays` should now be defined in lowercase (`GeoJson` is now `geojson`, `Kml` is now `kml`, etc.)

And that is it! Migrating should be fairly straightforward and painless. If you need help, send an email to the [NPMap team](mailto:npmap@nps.gov). We are happy to help.
