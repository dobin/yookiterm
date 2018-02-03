'use strict';

angular.module('myApp.staticpages', ['ngRoute'])
.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/index', {
        title: 'Staticpages',
        templateUrl: 'modules/staticpages/index.html',
        controller: 'staticpagesIndexCtrl',
    }).when('/slides', {
        title: 'Slides',
        templateUrl: 'modules/staticpages/slides.html',
        controller: 'staticpagesIndexCtrl',
    }).when('/about', {
        title: 'About',
        templateUrl: 'modules/staticpages/about.html',
        controller: 'staticpagesIndexCtrl',
    })
    ;
}])


.controller('staticpagesIndexCtrl', function ($scope, $window, $routeParams, $filter, $location)
{
  "ngInject";
})

;
