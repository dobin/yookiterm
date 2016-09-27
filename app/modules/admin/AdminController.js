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
                                             AdminServices, VirtualmachineServices)
{
  $scope.output = "";
  $scope.adminCmd = function(cmd) {
    VirtualmachineServices.adminCmd(cmd).then(function(data) {
      var res = [];
      for(var n=0; n<data.length; n++) {
        res.push(data[n].data);
      }
      $scope.output = JSON.stringify(res);
    });
  }
})

;
