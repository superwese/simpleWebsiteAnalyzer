'use strict';
/*
 * including all libs using globing requires requirejs because some dependencies include index.js
 * using requires and kama-requirejs causes the tests to timeout.
 */
module.exports = function(config){
  config.set({

    basePath : '../../main/webapp/',

    files : [
      'js/libs/jquery/dist/jquery.min.js',
      'js/libs/angular/angular.js',
      'js/libs/angular-mocks/angular-mocks.js',
      'js/libs/angular-animate/angular-animate.js',
      'js/libs/angular-bootstrap/ui-bootstrap-tpls.js',
      'js/libs/angular-route/angular-route.js',
      'js/libs/angular-sanitize/angular-sanitize.js',
      'js/libs/messageformat/messageformat.js',
      'js/libs/angular-translate/angular-translate.js',
      'js/libs/angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.js',
      'js/libs/angular-translate-loader-partial/angular-translate-loader-partial.js',


      'js/app.js',


      'checker/*.js',
      'runner/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],
    browserNoActivityTimeout: 1000000,
    plugins : [
            'karma-chrome-launcher',
            'karma-jasmine'            ]

  });
};
