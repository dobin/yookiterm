module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
				ngAnnotate: {
				    options: {
				        singleQuotes: true
				    },
				    app: {
              files: [{
                      expand: true,
                      src: ['app/modules/**/*.js', 'app/app.js'],
                      ext: '.annotated.js',
                      extDot: 'last',
                      dest: 'dist'
                  }],
				    }
				},
				concat: {
				    js: {
				        src: ['dist/**/*.js', ],
				        dest: 'dist/app-min.js'
				    }
				},
				uglify: {
				    js: {
              src: ['dist/app-min.js'],
              dest: 'app/app-min.js'
				    }
				}

    });

    //load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    //register grunt default task
    grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify']);
}
