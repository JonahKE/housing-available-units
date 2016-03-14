module.exports = function(grunt) {

    require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks

    grunt.initConfig({
      browserify: {
        dist: {
          files: {
            'js/app.js' : [ 'js/app.jsx' ],
            'js/admin.js' : [ 'js/admin.jsx' ]
          },
          options: {
            transform: ['babelify']
          }
        }
      },
      watch:{
        files: ['js/*.jsx'],
        tasks: ['browserify']
      }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['browserify','watch']);
};