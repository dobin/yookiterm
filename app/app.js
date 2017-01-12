'use strict';

angular.module('myApp', [
  'ngRoute',
  'hljs',
  'angularSpinners',
  'ui.bootstrap',
  'ngCookies',
  'myApp.challenge',
  'myApp.container',
  'myApp.setting',
  'myApp.authentication',
  'myApp.staticpages',
  'myApp.admin'
])


.config(['$locationProvider', '$routeProvider', '$httpProvider', 'hljsServiceProvider',
function($locationProvider, $routeProvider, $httpProvider, hljsServiceProvider) {
  hljsServiceProvider.setOptions({
    // replace tab with 4 spaces
    tabReplace: '    '
  });

  hljs.initHighlighting();

  // Lets cache all the things
  $httpProvider.defaults.cache = true;

  $routeProvider.otherwise({redirectTo: '/staticpages/index'});
}])


.run(function($rootScope, AuthenticationServices) {
  AuthenticationServices.useToken();
})


.controller('menuCtrl', function($scope, $cookies, AuthenticationServices) {
  $scope.isAuthenticated = false;

  // For HL SSO auth
  var t = $cookies.get('token');
  if (t) {
    AuthenticationServices.saveToken(t);
    $cookies.remove('token');
  }


  if (AuthenticationServices.isAuthenticated()) {
    $scope.isAuthenticated = true;

    var token = AuthenticationServices.parseJwt(AuthenticationServices.getToken());
    $scope.loggedinUser = token.userId;
    $scope.isAdmin = token.admin;
  }
})


;
