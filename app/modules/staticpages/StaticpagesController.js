'use strict';

angular.module('myApp.staticpages', ['ngRoute'])
.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/staticpages/index', {
        title: 'Staticpages',
        templateUrl: 'modules/staticpages/index.html',
        controller: 'staticpagesIndexCtrl',
    })
    ;
}])


.controller('staticpagesIndexCtrl', function ($scope, $window, $routeParams, $filter, $location)
{

})

;
