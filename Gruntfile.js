module.exports = function (grunt) {
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
    secrets = grunt.file.readJSON('./secrets.json');
  } catch (e) {
    secrets = grunt.file.readJSON('./secrets.sample.json');
  }

  grunt.util.linefeed = '\n';
  grunt.initConfig({
    aws: secrets,
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
          banner: cssNpmapSymbolLibrary
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
        dest: 'dist/outerspatial-bootstrap.js',
        src: 'src/bootstrap.js'
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
      }
    },
    mocha_phantomjs: {
      all: [
        'test/index.html'
      ]
    },
    pkg: pkg,
    s3: {
      options: {
        accessKeyId: '<%= aws.accessKeyId %>',
        bucket: 'outerspatial-production',
        // dryRun: true,
        gzip: true,
        secretAccessKey: '<%= aws.secretAccessKey %>'
      },
      dist: {
        cwd: 'dist/',
        dest: 'libs/outerspatial.js/<%= pkg.version %>/',
        src: '**'
      }
    },
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
          banner: '/**\n * OuterSpatial.js <%= pkg.version %>\n * Built on <%= grunt.template.today("mm/dd/yyyy") %> at <%= grunt.template.today("hh:MMTT Z") %>\n * Copyright <%= grunt.template.today("yyyy") %> Trailhead Labs\n * Licensed under ' + pkg.licenses[0].type + ' (' + pkg.licenses[0].url + ')\n */',
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
    's3:dist'
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

    html = '<h1 style="display:none;">OuterSpatial.js Examples</h1>';

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
