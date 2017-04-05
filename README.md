# OuterSpatial.js

[![Circle CI](https://circleci.com/gh/trailheadlabs/outerspatial.js.svg?style=svg)](https://circleci.com/gh/trailheadlabs/outerspatial.js)

Extends [Leaflet](http://leafletjs.com) to include functionality and a look-and-feel built specifically for the [OuterSpatial](https://www.outerspatial.com) outdoor technology platform.

This library is under active development, so please help test and [report issues](https://github.com/trailheadlabs/outerspatial.js/issues).

## OuterSpatial Map Builder

You may also want to take a look at [OuterSpatial Map Builder](https://github.com/trailheadlabs/outerspatial-map-builder). It's a graphical interface that walks through the process of building a map with OuterSpatial.js, step-by-step.

## Thanks

Initial development on this library was done by the U.S. National Park Service's [NPMap team](https://www.nps.gov/npmap/) and called NPMap.js. The agency recently made the repository private, but luckily made the code available in the public domain so we ([Trailhead Labs](https://www.trailheadlabs.com)) have decided to host it and push development forward.

The original design was heavily inspired (cough cough) by [Mapbox.js](https://github.com/mapbox/mapbox.js), and, of course, built on the great [Leaflet](http://leafletjs.com) library. Many thanks to the authors of all the great plugins used in/by the library (take a look at [LICENSE.md](https://github.com/trailheadlabs/outerspatial.js/blob/master/LICENSE.md) for a list).

## Versioning

OuterSpatial.js is versioned using [semantic versioning](http://semver.org). This means that releases are numbered: `major.minor.patch` and follow these guidelines:

- Breaking backward compatibility bumps the major (and resets the minor and patch to zero)
- New additions that don't break backward compatibility bumps the minor (and resets the patch to zero)
- Bug fixes and miscellaneous changes bumps the patch

2.0.0 was the first official OuterSpatial.js version.

## Changelog

- v3.0.18: The first version imported under the Trailhead Labs GitHub organization
- v4.0.0: The first version under the `OuterSpatial` namespace
- [v4.0.1](https://github.com/trailheadlabs/outerspatial.js/milestone/1?closed=1)
- [v4.0.2](https://github.com/trailheadlabs/outerspatial.js/milestone/2?closed=1)
- [v4.0.3](https://github.com/trailheadlabs/outerspatial.js/milestone/3?closed=1)
- [v4.0.4](https://github.com/trailheadlabs/outerspatial.js/milestone/5?closed=1)
- [v5.0.0](https://github.com/trailheadlabs/outerspatial.js/milestone/4?closed=1)
- [v5.0.1](https://github.com/trailheadlabs/outerspatial.js/milestone/6?closed=1)
- [v5.0.2](https://github.com/trailheadlabs/outerspatial.js/milestone/7?closed=1)
- [v5.0.3](https://github.com/trailheadlabs/outerspatial.js/milestone/8?closed=1)

## Keys

OuterSpatial.js supports connecting to a number of services that require API keys. You will need to create a copy of `keys.sample.json`, rename it `keys.json`, add your keys, and run `grunt build` to bundle your keys into the build of OuterSpatial.js that is created in the `_dist` folder.

## Building

You must have [node.js](https://nodejs.org/) installed to run the build. After installing node.js:

    git clone https://github.com/trailheadlabs/outerspatial.js
    cd outerspatial.js
    npm install

Install the [Grunt](http://gruntjs.com/) command line tool (do this once as an admin user after installing node.js):

    npm install -g grunt-cli

Copy keys.sample.json to a file called keys.json, then modify keys.json, adding your own API keys:

    cp keys.sample.json keys.json

Then use Grunt to build the library:

    grunt build

Internally, the Grunt task uses [browserify](https://github.com/substack/node-browserify) to combine dependencies. It's installed locally, along with other required packages, when you run `npm install`. The build task also uses [uglify](https://github.com/gruntjs/grunt-contrib-uglify) and [cssmin](https://npmjs.org/package/grunt-contrib-cssmin) to create minified versions of the library's CSS and JavaScript in `dist/`.

## Deploying

This project contains sample code that demonstrates deploying OuterSpatial.js to an Amazon S3 bucket using the `grunt-deploy` command. This command will not work unless you make a copy of "s3.sample.json", rename it "s3.json", and update the information in it  — including the "accessKeyId", "bucket", and "secretAccessKey" properties:

    cp s3.sample.json s3.json

## Testing

OuterSpatial.js uses the [Mocha](https://mochajs.org) JavaScript test framework, with the [expect.js](https://github.com/Automattic/expect.js) assertion library, and [PhantomJS](http://phantomjs.org/) to run the tests. You can run the tests with either of the following commands:

    grunt test

OR

    npm test

We are working to expand test coverage for the library.

## Documentation

Take a look at the [API docs](https://github.com/trailheadlabs/outerspatial.js/blob/master/api/index.md).

## Examples

Simple and targeted examples reside in the [examples directory](https://github.com/trailheadlabs/outerspatial.js/blob/master/examples/). This is a great starting point if you're new to OuterSpatial.js.

## Support

You can get in touch with the Trailhead Labs team by contacting us via Twitter ([@trailheadlabs](https://twitter.com/trailheadlabs)) or email ([hi@trailheadlabs.com](mailto:hi@trailheadlabs.com)). We are happy to help with any questions. Feedback is welcome as well!
