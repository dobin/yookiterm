'use strict';

angular.module('myApp', [
  'ngRoute',
  'hljs',
  'angularSpinners',
  'myApp.version',
  'myApp.challenge',
  'myApp.virtualmachine',
  'myApp.setting',
  'myApp.authentication',
  'myApp.staticpages',
  'myApp.admin'
])


.config(['$locationProvider', '$routeProvider', 'hljsServiceProvider',
function($locationProvider, $routeProvider, hljsServiceProvider) {
  hljsServiceProvider.setOptions({
    // replace tab with 4 spaces
    tabReplace: '    '
  });

  hljs.initHighlighting();

  $routeProvider.otherwise({redirectTo: '/staticpages/index'});
}])


.run(function($rootScope, AuthenticationServices) {
  AuthenticationServices.useToken();
})


.controller('menuCtrl', function($scope, AuthenticationServices) {
  $scope.isAuthenticated = false;

  if (AuthenticationServices.isAuthenticated()) {
    $scope.isAuthenticated = true;

    var token = AuthenticationServices.parseJwt(AuthenticationServices.getToken());
    $scope.loggedinUser = token.userId;
    $scope.isAdmin = token.admin;
  }
})

;
