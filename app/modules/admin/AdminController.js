'use strict';

angular.module('myApp.admin', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      "ngInject";

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
  "ngInject";

  $scope.feedbacks = [];

  $scope.adminCmd = function(cmd) {
    ContainerServices.adminCmd(cmd).then(function(data) {
      var res = [];

      for(var n=0; n<data.length; n++) {
        var entry = {};

        if (! data[n]) {
          entry["stderr"] = "host didnt answer";
        } else {
          entry["url"] = data[n].config.url;
          entry["stderr"] = data[n].data.error.Stderr;
          entry["stdout"] = data[n].data.output;
          entry["stderr"] = atob(entry["stderr"]);
          entry["host"] = data[n].data.host;
        }

        res.push(entry);
      }

      $scope.feedbacks = res;
    });
  }
})

;
