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
        .when('/container/:containerHostAlias/:containerBaseName/console', {
            title: 'Container Console',
            templateUrl: 'modules/virtualmachine/container-console.html',
            controller: 'containerConsoleCtrl',
/*            resolve: {
                baseContainers: function (VirtualmachineServices) {
                    return VirtualmachineServices.getBaseContainerList();
                },
                containers: function(VirtualmachineServices) {
                  return VirtualmachineServices.getContainerList();
                }
            }*/
        })
        ;
    }])

    .controller('containerConsoleCtrl', function ($scope, $routeParams, $filter, $location, $route,
                                                 VirtualmachineServices) {
        $scope.showAddTerminalButton = true;
        console.log("Console");

        var containerHostAlias = $route.current.params.containerHostAlias;
        var containerBaseName = $route.current.params.containerBaseName;

        VirtualmachineServices.getHostnameForAlias(containerHostAlias).then(function(data) {
          var containerHostname = data.Hostname;
        });


    })

    .controller('virtualmachinePageCtrl', function ($scope, $routeParams, $filter, $location,
                                                 VirtualmachineServices) {

    })


    .controller('containerListCtrl', function ($scope, $routeParams, $filter, $location, $window,
                                                 VirtualmachineServices, baseContainers, containers)
    {
      $scope.baseContainers = baseContainers.data;
      $scope.containers = containers;

      $scope.startVirtualmachine = function(container) {
        VirtualmachineServices.startContainerIfNecessary(container.ContainerHost.HostnameAlias, container.ContainerBaseName).then(function(data) {
          for(var n=0; n<$scope.containers.length; n++) {
            if ($scope.containers[n] == container) {
              //$scope.containers[n].ContainreHostAlias = data.data.
              $scope.containers[n].ContainerUsername = data.data.username;
              $scope.containers[n].ContainerPassword = data.data.password;
              $scope.containers[n].ContainerExpiry = data.data.expiry;
              $scope.containers[n].ContainerStatus = data.data.status;
            }
          }
        });
      };

      $scope.startConsole = function(container) {
        console.log("A: " + JSON.stringify(container));
          //$window.open($location.absUrl() + '#schallenges', '_blank');
          var url = $location.protocol() + "://" + $location.host() + ":" + $location.port();
          url += '#/container/' + container.ContainerHost.HostnameAlias + "/" + container.BaseContainer.Name + "/console";
          $window.open(url, '_blank');
      }
    })
;
