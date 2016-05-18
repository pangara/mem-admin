'use strict';

module.exports = {
  client: {
    lib: {
      css: [
		'//fonts.googleapis.com/css?family=Oswald',
		'//fonts.googleapis.com/css?family=Nunito',
		'//fonts.googleapis.com/css?family=Open+Sans:400italic,700italic,700,400',
        'public/lib/bootstrap/dist/css/bootstrap.css',
        //'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        // these were in the application css are before
        'public/lib/angular-toastr/dist/angular-toastr.css',
        'public/lib/angular-bootstrap/ui-bootstrap-csp.css',
        'public/lib/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
        // cc : ngtable
        // 'public/lib/ng-table/dist/ng-table.min.css'
        'public/assimilated/ng-table/dist/ng-table.min.css'
        // cc: end ngtable
      ],
      js: [
   	    'public/lib/es6-shim/es6-shim.min.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/tinymce-dist/tinymce.js',
        'public/lib/angular-ui-tinymce/src/tinymce.js',
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/bootstrap/dist/js/bootstrap.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-file-upload/angular-file-upload.js',
        'public/lib/ng-file-upload/ng-file-upload.js',
        'public/lib/angular-sanitize/angular-sanitize.js',
        'public/lib/angular-toastr/dist/angular-toastr.js',
        'public/lib/angular-toastr/dist/angular-toastr.tpls.js',
        'public/lib/angular-bootstrap-confirm/dist/angular-bootstrap-confirm.min.js',
        'public/lib/lodash/lodash.min.js',
        'public/lib/d3/d3.min.js',
        'public/lib/angular-simple-logger/dist/angular-simple-logger.js',
        'public/lib/angular-google-maps/dist/angular-google-maps.min.js',        
        // cc : ngtable
        // 'public/lib/ng-table/dist/ng-table.js',
        'public/assimilated/ng-table/dist/ng-table.js',
        // cc: end ngtable
        'public/lib/angularD3/dist/angularD3.js',
        'public/lib/moment/moment.js',
        'public/lib/moment-timezone/moment-timezone.js',
        'public/lib/angular-moment/angular-moment.js',
        'public/lib/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
		'public/lib/angular-scroll/angular-scroll.min.js',
		'public/lib/angular-cookies/angular-cookies.min.js',
        // these were in the application js area before

		'public/moment-timezone-data.js',
		'public/readable-range.js'
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css',
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js',
      'modules/*/processes/*/client/*.js',
      'modules/*/processes/*/client/**/*.js',
      'modules/*/controls/*/client/*.js',
      'modules/*/controls/*/client/**/*.js'
    ],
    views: [
    	'modules/*/client/views/**/*.html',
    	'modules/*/processes/*/client/views/**/*.html',
    	'modules/*/controls/*/client/views/**/*.html'
    ],
    templates: ['build/templates.js']
  },
  server: {
    gruntConfig: 'gruntfile.js',
    gulpConfig: 'gulpfile.js',
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: ['modules/*/server/models/**/*.js','modules/*/processes/*/server/models/**/*.js'],
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
};
