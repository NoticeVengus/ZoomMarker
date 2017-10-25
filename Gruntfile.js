module.exports = function(grunt){
	
	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),
		
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
					'*/\n'
			},
			build: {
				files: {
					'js/zoom-marker.min.js': ['js/zoom-marker.js']
				}
			}
		},
		
		jshint: {
			options: {
				jshintrc: 'jshint.jshint'
			},
			build: ['WebRoot/module-beta/js/*.js']
		}
		
	});
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	grunt.registerTask('default', ['uglify']);
};