'use strict';

angular.module('myApp.admin', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/admin', {
            title: 'Admin',
            templateUrl: 'modules/admin/admin.html',
            controller: 'adminPageCtrl',
        })
        ;
    }])


.controller('adminPageCtrl', function ($scope, $window, $routeParams, $filter, $location,
                                             AdminServices, ContainerServices)
{
  $scope.output = "";
  $scope.adminCmd = function(cmd) {
    ContainerServices.adminCmd(cmd).then(function(data) {
      var res = [];
      for(var n=0; n<data.length; n++) {
        if (data[n].data.error.Stderr) {
          data[n].data.error.Stderr = btoa(data[n].data.error.Stderror);
        }
        res.push(data[n].data);
      }
      $scope.output = JSON.stringify(res);
    });
  }
})

;
