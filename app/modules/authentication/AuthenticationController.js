'use strict';

angular.module('myApp.authentication', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/authentication/login', {
            title: 'Authentication',
            templateUrl: 'modules/authentication/authentication.html',
            controller: 'authenticationPageCtrl',
        })
        ;
    }])


    .controller('authenticationPageCtrl', function ($scope, $window, $routeParams, $filter, $location,
                                                    AuthenticationServices) {
        "ngInject";

        $scope.error = "";
        $scope.loading = false;

        $scope.isAuthed = function () {
            return false;
        }

        $scope.loginGoogle = function () {
            $window.location.href = "/1.0/auth/google";
        }

        $scope.login = function () {
            $scope.loading = true;
            AuthenticationServices.login($scope.username, $scope.password).then(function (data) {

                if (data.data.authenticated == true) {
                    $scope.error = "";
                    $scope.loading = false;
                    AuthenticationServices.saveToken(data.data.token);
                    $scope.error = "Authentication successful"

                    $window.location = "/";
                    //$window.location.reload();
                } else {
                    $scope.error = 'Username or password is incorrect';
                    $scope.loading = false;
                }
            });
        };

    })

;
