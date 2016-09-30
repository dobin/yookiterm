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

      console.log("A: " + JSON.stringify($scope.containers[0]));

      $scope.startVirtualmachine = function(container) {
        console.log("Start VM: " + JSON.stringify(container));
        VirtualmachineServices.startContainerIfNecessary(container.ContainerHost.HostnameAlias, container.ContainerBaseName).then(function(data) {
          console.log("Data.data: " + JSON.stringify(data.data));

          for(var n=0; n<$scope.containers.length; n++) {
            if ($scope.containers[n] == container) {
              $scope.containers[n].ContainerUsername = data.data.ConatainerUsername;
              $scope.containers[n].ContainerPassword = data.data.ContainerPassword;
              $scope.containers[n].ContainerExpiry = data.data.ContainerExpiry;
              $scope.containers[n].ContainerStatus = data.data.ContainerStatus;
            }
          }
        });
      };

      $scope.startConsole = function(container) {
        
      }
    })
;
