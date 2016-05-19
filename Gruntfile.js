module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/* \n* <%= pkg.title || pkg.name %> - v<%= pkg.version %> \n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> by <%= pkg.author %>\n' +
        '* Home Page:  <%= pkg.home %> \n' +
        '* Magebay Team: <%= pkg.magebay_team %> \n' +
        '*/\n',
        jshint: {
            all: ['Gruntfile.js','js/app/**/*.js']
        },
        concat: {
            // js: {
            //     src: ['js/test1.js', 'js/test2.js'],
            //     dest: 'dist/js/<%= pkg.name %>-<%= pkg.version %>.js',
            // },
            css: {
                src: [  
                    'assets/css/normalize.css',
                    'assets/css/simplebar.css',
                    'assets/css/input-range.css',
                    'assets/css/spectrum.css',
                    'assets/css/styles.css',
                ],
                dest: 'dist/css/<%= pkg.name %>-<%= pkg.version %>.css',
            }
        },
        cssmin: {
            compress: {
                options: {
                    banner: '<%= banner %>'
                },
                files: {
                    'dist/css/<%= pkg.name %>-<%= pkg.version %>.min.css': ['dist/css/<%= pkg.name %>-<%= pkg.version %>.css']
                }
            },
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                files: {
                    //'dist/js/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/js/<%= pkg.name %>-<%= pkg.version %>.js'],
                    //'dist/js/app/controllers/DesignController.min.js': ['js/app/controllers/DesignController.js'],
                    //'dist/js/app/directives/PdpDirectives.min.js': ['js/app/directives/PdpDirectives.js'],
                    //'dist/js/app/customjQueryScript.min.js': ['js/app/customjQueryScript.js'],
                    //'dist/js/app/PdpServices.min.js': ['js/app/PdpServices.js'],
                    //'dist/js/app/pdp.min.js': ['js/app/pdp.js'],
                    //'dist/js/app/load-sample-canvas.min.js': ['js/app/load-sample-canvas.js'],
                }
            }  
        },
        watch: {
            js: {
                files: 'js/app/**/*.js',
                tasks: ['uglify', 'jshint'],
            },
            css: {
                files: 'assets/css/*.css',
                tasks: ['concat:css', 'cssmin'],
            },
        },
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    grunt.registerTask('default', ['watch','concat', 'cssmin', 'uglify', 'jshint']);
};