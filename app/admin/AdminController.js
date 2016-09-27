'use strict';

angular.module('myApp.admin', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/admin/login', {
            title: 'Admin',
            templateUrl: 'modules/admin/admin.html',
            controller: 'adminPageCtrl',
        })
        ;
    }])


.controller('adminPageCtrl', function ($scope, $window, $routeParams, $filter, $location,
                                             AdminServices)
{

})

;
