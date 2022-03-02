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
    function ($locationProvider, $routeProvider, $httpProvider, hljsServiceProvider) {
        hljsServiceProvider.setOptions({
            // replace tab with 4 spaces
            tabReplace: '    '
        });

        hljs.initHighlighting();

        // Lets cache all the things
        $httpProvider.defaults.cache = true;

        // Intercept some default responses
        $httpProvider.interceptors.push('responseObserver');

        // Default route
        $routeProvider.otherwise({redirectTo: '/index'});

        // Fix url change of AngularJS
        $locationProvider.hashPrefix('');
    }])


.run(function ($rootScope, AuthenticationServices) {
    AuthenticationServices.useToken();
})


.controller('menuCtrl', function ($scope, $location, $cookies, AuthenticationServices) {
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
        $scope.loggedinUser = token.userName;
        $scope.loggedinUserId = token.userId;
        $scope.isAdmin = token.admin;
    }

    // Highlight menu item stuff
    $scope.isActive = function (path) {
        return ($location.path().substr(1, path.length) === path);
    }
})

.factory('responseObserver', function responseObserver($q, $window) {
    return {
        'responseError': function (errorResponse) {
            switch (errorResponse.status) {
                case 401:
                    $window.location = '#/authentication/login';
                    break;
            }
            return $q.reject(errorResponse);
        }
    };
});

;
