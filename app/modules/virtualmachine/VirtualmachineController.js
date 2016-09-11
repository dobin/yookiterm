'use strict';

angular.module('myApp.virtualmachine', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/virtualmachine/:containerName', {
            title: 'Virtualmachine',
            templateUrl: 'modules/virtualmachine/virtualmachine.html',
            controller: 'virtualmachinePageCtrl',
        })
        .when('/container', {
            title: 'Container',
            templateUrl: 'modules/virtualmachine/container-list.html',
            controller: 'containerListCtrl',
            resolve: {
                baseContainers: function (VirtualmachineServices) {
                    return VirtualmachineServices.getBaseContainerList();
                },
                containers: function(VirtualmachineServices) {
                  return VirtualmachineServices.getContainerList();
                }
            }
        })
        ;
    }])


    .controller('virtualmachinePageCtrl', function ($scope, $routeParams, $filter, $location,
                                                 VirtualmachineServices) {

    })


    .controller('containerListCtrl', function ($scope, $routeParams, $filter, $location,
                                                 VirtualmachineServices, baseContainers, containers)
    {
      $scope.baseContainers = baseContainers.data;
      $scope.containers = containers;

      $scope.startVirtualmachine = function() {
        console.log("Start VM: " + challenge.ContainerBaseName);
        VirtualmachineServices.getVirtualmachine(challenge.ContainerBaseName).then(function(data) {
          console.log("Data.data: " + JSON.stringify(data.data));
        });
      }
    })
;
