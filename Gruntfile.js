module.exports = function (grunt) {
  'use strict';

  var cssNpmapSymbolLibrary = '';
  var npmapSymbolLibrary = require('./node_modules/npmap-symbol-library/www/npmap-builder/npmap-symbol-library.json');
  var pkg = require('./package.json');
  var sizes = {
    large: 24,
    medium: 18,
    small: 12
  };
  var secrets;

  function loadNpmTasks () {
    Object.keys(pkg.devDependencies).filter(function (moduleName) {
      return /(^grunt-)/.test(moduleName);
    }).forEach(function (task) {
      grunt.loadNpmTasks(task);
    });
  }

  for (var i = 0; i < npmapSymbolLibrary.length; i++) {
    var icon = npmapSymbolLibrary[i];

    for (var prop in sizes) {
      cssNpmapSymbolLibrary += '.' + icon.icon + '-' + prop + ' {background-image: url(images/icon/npmap-symbol-library/' + icon.icon + '-' + sizes[prop] + '.png);}\n';
      cssNpmapSymbolLibrary += '.' + icon.icon + '-' + prop + '-2x {background-image: url(images/icon/npmap-symbol-library/' + icon.icon + '-' + sizes[prop] + '@2x.png);}\n';
    }
  }

  try {
    secrets = require('./secrets.json');
  } catch (e) {
    secrets = require('./secrets.sample.json');
  }

  grunt.util.linefeed = '\n';
  grunt.initConfig({
    akamai_rest_purge: {
      lib: {
        /*
        objects: [
          'npmap-bootstrap.js',
          'npmap-bootstrap.min.js',
          'npmap.css',
          'npmap.min.css',
          'npmap.js',
          'npmap.min.js',
          'npmap-standalone.css',
          'npmap-standalone.min.css',
          'npmap-standalone.js',
          'npmap-standalone.min.js'
        ].map(function (fileName) {
          return 'https://www.nps.gov/lib/npmap.js/<%= pkg.version %>/' + fileName;
        })
        */
        objects: [
          'https://www.nps.gov/lib/npmap.js/<%= pkg.version %>/*'
        ]
      },
      options: {
        action: 'invalidate',
        auth: {
          pass: secrets.akamai.password,
          user: secrets.akamai.user
        }
      }
    },
    browserify: {
      all: {
        files: {
          'dist/npmap.js': [
            'main.js'
          ],
          'dist/npmap-standalone.js': [
            'npmap.js'
          ]
        }
      }
    },
    clean: {
      dist: {
        src: [
          'dist/**/*'
        ]
      },
      examples: {
        src: [
          'dist/examples/**/*'
        ]
      },
      lib: {
        options: {
          force: true
        },
        src: [
          '/Volumes/lib/npmap.js/<%= pkg.version %>'
        ]
      }
    },
    concat: {
      css: {
        dest: 'dist/npmap.css',
        options: {
          banner: cssNpmapSymbolLibrary
        },
        src: [
          'node_modules/leaflet/dist/leaflet.css',
          'theme/nps.css'
        ]
      }
    },
    copy: {
      api: {
        cwd: 'api/',
        dest: 'dist/api',
        expand: true,
        src: [
          '**/*'
        ]
      },
      css: {
        dest: 'dist/npmap-standalone.css',
        src: 'theme/nps.css'
      },
      'examples-data': {
        cwd: 'examples/data/',
        dest: 'dist/examples/data',
        expand: true,
        src: [
          '**'
        ]
      },
      'examples-img': {
        cwd: 'examples/img/',
        dest: 'dist/examples/img',
        expand: true,
        src: [
          '**'
        ]
      },
      images: {
        cwd: 'theme/images/',
        dest: 'dist/images',
        expand: true,
        src: [
          '**/*'
        ]
      },
      javascript: {
        dest: 'dist/npmap-bootstrap.js',
        src: 'src/bootstrap.js'
      },
      lib: {
        cwd: 'dist/',
        dest: '/Volumes/lib/npmap.js/<%= pkg.version %>/',
        expand: true,
        src: [
          '**/*'
        ]
      },
      npmapSymbolLibrary: {
        cwd: 'node_modules/npmap-symbol-library/renders/npmap-builder/',
        dest: 'dist/images/icon/npmap-symbol-library',
        expand: true,
        src: [
          '**/*'
        ]
      },
      plugins: {
        cwd: 'plugins/',
        dest: 'dist/plugins/',
        expand: true,
        src: [
          '**/*'
        ]
      }
    },
    csslint: {
      src: [
        'theme/nps.css'
      ]
    },
    cssmin: {
      dist: {
        cwd: 'dist/',
        dest: 'dist/',
        expand: true,
        ext: '.min.css',
        src: [
          '*.css',
          '!*.min.css'
        ]
      }
    },
    md2html: {
      api: {
        files: [{
          dest: 'dist/api/index.html',
          src: [
            'dist/api/index.md'
          ]
        }]
      }
    },
    mkdir: {
      lib: {
        create: [
          '/Volumes/lib/npmap.js/<%= pkg.version %>/'
        ]
      }
    },
    mocha_phantomjs: {
      all: [
        'test/index.html'
      ]
    },
    pkg: pkg,
    semistandard: {
      src: [
        'src/**/*.js'
      ]
    },
    uglify: {
      all: {
        cwd: 'dist/',
        expand: true,
        dest: 'dist/',
        ext: '.min.js',
        src: [
          '**/*.js',
          '!*.min.js'
        ]
      }
    },
    usebanner: {
      dist: {
        options: {
          banner: '/**\n * NPMap.js <%= pkg.version %>\n * Built on <%= grunt.template.today("mm/dd/yyyy") %> at <%= grunt.template.today("hh:MMTT Z") %>\n * Copyright <%= grunt.template.today("yyyy") %> National Park Service\n * Licensed under ' + pkg.licenses[0].type + ' (' + pkg.licenses[0].url + ')\n */',
          position: 'top'
        },
        files: {
          src: [
            'dist/*.css',
            'dist/*.js'
          ]
        }
      }
    }
  });
  loadNpmTasks();
  // TODO: csscomb, validation
  grunt.registerTask('build', [
    'prebuild',
    'clean:dist',
    'copy:api',
    'md2html:api',
    'copy:css',
    'examples',
    'copy:images',
    'copy:javascript',
    'copy:npmapSymbolLibrary',
    'copy:plugins',
    'concat',
    'browserify',
    'uglify',
    'cssmin',
    'usebanner'
  ]);
  grunt.registerTask('deploy', [
    'clean:lib',
    'mkdir:lib',
    'copy:lib'
  ]);
  grunt.registerTask('examples', [
    'clean:examples',
    'copy:examples-data',
    'copy:examples-img',
    'generate-examples'
  ]);
  grunt.registerTask('lint', [
    'csslint',
    'semistandard'
  ]);
  grunt.registerTask('prebuild', 'Internal.', function () {
    if (!grunt.file.exists('./keys.json')) {
      grunt.file.copy('./keys.sample.json', './keys.json');
    }
  });
  grunt.registerTask('purge', [
    'akamai_rest_purge:lib'
  ]);
  grunt.registerTask('generate-examples', 'Internal.', function () {
    var categories = {
      'Getting Started': [],
      'Presets': [],
      'Layers': [],
      'Controls': [],
      'Modules': [],
      'Examples': [],
      'Advanced': []
    };
    var examples = require('./examples/index.json');
    var html;
    var i;

    for (i = 0; i < examples.length; i++) {
      var example = examples[i];

      if (example.include && !example.under_development) {
        var css = grunt.file.read('examples/default.css');
        var js = grunt.file.read('examples/' + example.id + '.js');

        if (example.css) {
          css += grunt.file.read('examples/' + example.id + '.css');
        }

        html = grunt.file.read('examples/' + (example.html ? example.id : 'default') + '.html');

        grunt.file.copy('examples/template.html', 'dist/examples/' + example.id + '.html', {
          process: function (content) {
            content = content.replace(/{{ css }}/g, css);
            content = content.replace(/{{ html }}/g, html);
            content = content.replace(/{{ js }}/g, js);
            content = content.replace(/{{ path }}/g, '..');
            content = content.replace(/{{ title }}/g, example.title);

            return content;
          }
        });

        if (categories[example.category]) {
          categories[example.category].push(example);
        }
      }
    }

    html = '<h1 style="display:none;">NPMap.js Examples</h1>';

    for (var category in categories) {
      html += '<h2>' + category + '</h2><ul>';

      for (i = 0; i < categories[category].length; i++) {
        example = categories[category][i];
        html += '<li><a href="' + example.id + '.html">' + example.title + '</a></li>';
      }

      html += '</ul>';
    }

    grunt.file.write('dist/examples/index.html', html);
  });
  grunt.registerTask('test', [
    'mocha_phantomjs'
  ]);
};
