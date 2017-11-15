module.exports = function (grunt) {
  var cssOuterSpatialSymbolLibrary = '';
  var outerspatialSymbolLibrary = require('./node_modules/outerspatial-symbol-library/www/outerspatial-builder/outerspatial-symbol-library.json');
  var pkg = require('./package.json');
  var sizes = {
    large: 24,
    medium: 18,
    small: 12
  };
  var s3;

  function loadNpmTasks () {
    Object.keys(pkg.devDependencies).filter(function (moduleName) {
      return /(^grunt-)/.test(moduleName);
    }).forEach(function (task) {
      grunt.loadNpmTasks(task);
    });
  }

  outerspatialSymbolLibrary.forEach(function (icon) {
    for (var prop in sizes) {
      cssOuterSpatialSymbolLibrary += '.' + icon.icon + '-' + prop + ' {background-image: url(images/icon/outerspatial-symbol-library/' + icon.icon + '-' + sizes[prop] + '.png);}\n';
      cssOuterSpatialSymbolLibrary += '.' + icon.icon + '-' + prop + '-2x {background-image: url(images/icon/outerspatial-symbol-library/' + icon.icon + '-' + sizes[prop] + '@2x.png);}\n';
    }
  });

  try {
    s3 = grunt.file.readJSON('./s3.json');
  } catch (e) {
    s3 = grunt.file.readJSON('./s3.sample.json');
  }

  grunt.util.linefeed = '\n';
  grunt.initConfig({
    browserify: {
      all: {
        files: {
          'dist/outerspatial.js': [
            'main.js'
          ],
          'dist/outerspatial-standalone.js': [
            'outerspatial.js'
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
      }
    },
    concat: {
      css: {
        dest: 'dist/outerspatial.css',
        options: {
          banner: cssOuterSpatialSymbolLibrary
        },
        src: [
          'node_modules/leaflet/dist/leaflet.css',
          'theme/outerspatial.css'
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
        dest: 'dist/outerspatial-standalone.css',
        src: 'theme/outerspatial.css'
      },
      docs: {
        cwd: 'docs/',
        dest: 'dist/docs',
        expand: true,
        src: [
          '**/*'
        ]
      },
      'examples-data': {
        cwd: 'examples/data/',
        dest: 'dist/examples/data',
        expand: true,
        src: [
          '**'
        ]
      },
      'examples-iframe': {
        dest: 'dist/',
        src: 'examples/iframe-*.html'
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
        dest: 'dist/outerspatial-bootstrap.js',
        src: 'src/bootstrap.js'
      },
      outerspatialSymbolLibrary: {
        cwd: 'node_modules/outerspatial-symbol-library/renders/outerspatial-builder/',
        dest: 'dist/images/icon/outerspatial-symbol-library',
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
        'theme/outerspatial.css'
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
      },
      docs: {
        files: [{
          cwd: 'docs',
          dest: 'dist/docs',
          expand: true,
          ext: '.html',
          src: [
            '**/*.md'
          ]
        }]
      }
    },
    mocha_phantomjs: {
      all: [
        'test/index.html'
      ]
    },
    pkg: pkg,
    s3: s3,
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
          banner: '/**\n * OuterSpatial Map Library <%= pkg.version %>\n * Built on <%= grunt.template.today("mm/dd/yyyy") %> at <%= grunt.template.today("hh:MMTT Z") %>\n * Copyright <%= grunt.template.today("yyyy") %> Trailhead Labs\n * Licensed under ' + pkg.licenses[0].type + ' (' + pkg.licenses[0].url + ')\n */',
          position: 'top'
        },
        files: {
          src: [
            'dist/*.css',
            'dist/*.js'
          ]
        }
      }
    },
    watch: {
      scripts: {
        files: [
          'src/**/*.js',
          'theme/**/*.css',
          'examples/*.js',
          'examples/index.json',
          'Gruntfile.js'
        ],
        tasks: ['build-dev'],
        options: {
          interrupt: true
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
    'copy:docs',
    'md2html:docs',
    'copy:css',
    'examples',
    'copy:images',
    'copy:javascript',
    'copy:outerspatialSymbolLibrary',
    'copy:plugins',
    'concat',
    'browserify',
    'uglify',
    'cssmin',
    'usebanner'
  ]);
  grunt.registerTask('build-dev', [
    'prebuild',
    'clean:dist',
    'copy:css',
    'examples',
    'copy:images',
    'copy:javascript',
    'copy:outerspatialSymbolLibrary',
    'copy:plugins',
    'concat',
    'browserify',
    'usebanner'
  ]);
  grunt.registerTask('deploy-production', [
    's3:production'
  ]);
  grunt.registerTask('deploy-staging', [
    's3:staging'
  ]);
  grunt.registerTask('examples', [
    'clean:examples',
    'copy:examples-data',
    'copy:examples-iframe',
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
  grunt.registerTask('purge', []);
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
        var css = grunt.file.read('examples/' + (example.css ? example.id : 'default') + '.css');
        var js = (example.js === false ? null : grunt.file.read('examples/' + example.id + '.js'));

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

    html = '<h1 style="display:none;">OuterSpatial Map Library Examples</h1>';

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
