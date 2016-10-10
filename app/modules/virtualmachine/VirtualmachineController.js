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
                                                 VirtualmachineServices)
    {
        var containerHostAlias = $route.current.params.containerHostAlias;
        var containerBaseName = $route.current.params.containerBaseName;

        VirtualmachineServices.getHostnameForAlias(containerHostAlias).then(function(data) {
          var containerHostname = data.Hostname;
        });

        var t = {
          height: 25,
          width: 80,
          id: null,
          term: null,
        };

        $scope.terminal = t;
        $scope.showAddTerminalButton = false;

        VirtualmachineServices.startContainerIfNecessary(containerHostAlias, containerBaseName).then(function(data) {
          $scope.terminal.term = VirtualmachineServices.getTerminal(t.height);
          $scope.terminal.term.open(document.getElementById('console'));
          var initialGeometry = $scope.terminal.term.proposeGeometry(),
              cols = initialGeometry.cols,
              rows = initialGeometry.rows;
          $scope.terminal.width = 80;

          VirtualmachineServices.getWebsocketTerminal($scope.terminal.term, containerHostAlias, containerBaseName, cols, rows);

          $scope.terminal.term.on('destroy', function () {
            console.log("DDDDDDDDDDDD");
          });

          $scope.terminal.term.on('resize', function (size) {
            //console.log("Resize: C: " + size.cols + " R: " + size.rows);

            var cols = size.cols;
            var rows = size.rows;

          /*  if (!pid) {
              return;
            }
            var cols = size.cols,
                rows = size.rows,
                url = '/terminals/' + pid + '/size?cols=' + cols + '&rows=' + rows;

            fetch(url, {method: 'POST'});*/
          });
        }).finally(function () {
          //$scope.terminal.term.fit();
          //$scope.showAddTerminalButton = true;
        })


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
