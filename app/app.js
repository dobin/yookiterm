'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'hljs',
  'angularSpinners',
  'myApp.version',
  'myApp.challenge',
  'myApp.virtualmachine',
  'myApp.setting',
  'myApp.authentication'
])

.config(['$locationProvider', '$routeProvider', 'hljsServiceProvider',
function($locationProvider, $routeProvider, hljsServiceProvider) {
  //$locationProvider.hashPrefix('!');

  hljsServiceProvider.setOptions({
    // replace tab with 4 spaces
    tabReplace: '    '
  });

  hljs.initHighlighting();

  $routeProvider.otherwise({redirectTo: '/challenges'});
}])

.run(function($rootScope, AuthenticationServices) {
  AuthenticationServices.useToken();
})
;
