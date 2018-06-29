# OuterSpatial Map Library

[![Circle CI](https://circleci.com/gh/trailheadlabs/outerspatial-map-library.svg?style=svg)](https://circleci.com/gh/trailheadlabs/outerspatial-map-library)

Extends [Leaflet](http://leafletjs.com) to include functionality and a look-and-feel built specifically for [OuterSpatial](https://www.outerspatial.com).

This library is under active development, so please help test and [report issues](https://github.com/trailheadlabs/outerspatial-map-library/issues).

## OuterSpatial Map Builder

OuterSpatial Map Builder is a graphical interface that walks through the process of building a map with OuterSpatial Map Library, step-by-step. This project is currently private, but we're exploring ways to open source it.

## Thanks

Initial development on this library was done by the U.S. National Park Service's [NPMap team](https://www.nps.gov/npmap/) and called NPMap.js. The agency recently made the repository private, but luckily made the code available in the public domain so we ([Trailhead Labs](https://www.trailheadlabs.com)) have decided to host it and push development forward.

The original design was heavily inspired (cough cough) by [Mapbox.js](https://github.com/mapbox/mapbox.js), and, of course, built on the great [Leaflet](http://leafletjs.com) library. Many thanks to the authors of all the great plugins used in/by the library (take a look at [LICENSE.md](https://github.com/trailheadlabs/outerspatial-map-library/blob/master/LICENSE.md) for a list).

## Versioning

OuterSpatial Map Library is versioned using [semantic versioning](http://semver.org). This means that releases are numbered: `major.minor.patch` and follow these guidelines:

- Breaking backward compatibility bumps the major (and resets the minor and patch to zero)
- New additions that don't break backward compatibility bumps the minor (and resets the patch to zero)
- Bug fixes and miscellaneous changes bumps the patch

2.0.0 was the first official OuterSpatial Map Library version.

## Keys

OuterSpatial Map Library supports connecting to a number of services that require API keys. You will need to create a copy of `keys.sample.json`, rename it `keys.json`, add your keys, and run `grunt build` to bundle your keys into the build of OuterSpatial Map Library that is created in the `_dist` folder.

## Building

You must have [node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed to run the build. After installing node.js:

    git clone https://github.com/trailheadlabs/outerspatial-map-library
    cd outerspatial-map-library
    yarn install

Install the [Grunt](http://gruntjs.com/) command line tool (do this once as an admin user after installing node.js):

    yarn global add grunt-cli

Copy keys.sample.json to a file called keys.json, then modify keys.json, adding your own API keys:

    cp keys.sample.json keys.json

Then use Grunt to build the library:

    grunt build

Internally, the Grunt task uses [browserify](https://github.com/substack/node-browserify) to combine dependencies. It's installed locally, along with other required packages, when you run `npm install`. The build task also uses [uglify](https://github.com/gruntjs/grunt-contrib-uglify) and [cssmin](https://npmjs.org/package/grunt-contrib-cssmin) to create minified versions of the library's CSS and JavaScript in `dist/`.

## Deploying

This project contains sample code that demonstrates deploying OuterSpatial Map Library to "staging" and "production" Amazon S3 buckets using the `grunt deploy-staging` and `grunt deploy-production` commands, respectively. These commands will not work unless you make a copy of "s3.sample.json", rename it "s3.json", and update the information in it:

    cp s3.sample.json s3.json

## Testing

OuterSpatial Map Library uses the [Mocha](https://mochajs.org) JavaScript test framework, with the [expect.js](https://github.com/Automattic/expect.js) assertion library, and [PhantomJS](http://phantomjs.org/) to run the tests. You can run the tests with either of the following commands:

    grunt test

OR

    yarn test

We are working to expand test coverage for the library.

## Documentation

Take a look at the [API docs](https://github.com/trailheadlabs/outerspatial-map-library/blob/master/api/index.md).

## Examples

Simple and targeted examples reside in the [examples directory](https://github.com/trailheadlabs/outerspatial-map-library/blob/master/examples/). This is a great starting point if you're new to OuterSpatial Map Library.

## Support

You can get in touch with the Trailhead Labs team by contacting us via Twitter ([@trailheadlabs](https://twitter.com/trailheadlabs)) or email ([hi@trailheadlabs.com](mailto:hi@trailheadlabs.com)). We are happy to help with any questions. Feedback is welcome as well!
