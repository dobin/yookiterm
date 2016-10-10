'use strict';

angular.module('myApp.container', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/container/:containerName', {
            title: 'Container',
            templateUrl: 'modules/container/container.html',
            controller: 'containerPageCtrl',
        })
        .when('/container', {
            title: 'Container',
            templateUrl: 'modules/container/container-list.html',
            controller: 'containerListCtrl',
            resolve: {
                baseContainers: function (ContainerServices) {
                    return ContainerServices.getBaseContainerList();
                },
                containers: function(ContainerServices) {
                  return ContainerServices.getContainerList();
                }
            }
        })
        .when('/container/:containerHostAlias/:containerBaseName/console', {
            title: 'Container Console',
            templateUrl: 'modules/container/container-console.html',
            controller: 'containerConsoleCtrl',
/*            resolve: {
                baseContainers: function (ContainerServices) {
                    return ContainerServices.getBaseContainerList();
                },
                containers: function(ContainerServices) {
                  return ContainerServices.getContainerList();
                }
            }*/
        })
        ;
    }])

    .controller('containerConsoleCtrl', function ($scope, $routeParams, $filter, $location, $route,
                                                 ContainerServices)
    {
        var containerHostAlias = $route.current.params.containerHostAlias;
        var containerBaseName = $route.current.params.containerBaseName;

        ContainerServices.getHostnameForAlias(containerHostAlias).then(function(data) {
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

        ContainerServices.startContainerIfNecessary(containerHostAlias, containerBaseName).then(function(data) {
          $scope.terminal.term = ContainerServices.getTerminal(t.height);
          $scope.terminal.term.open(document.getElementById('console'));
          var initialGeometry = $scope.terminal.term.proposeGeometry(),
              cols = initialGeometry.cols,
              rows = initialGeometry.rows;
          $scope.terminal.width = 80;

          ContainerServices.getWebsocketTerminal($scope.terminal.term, containerHostAlias, containerBaseName, cols, rows);

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

    .controller('containerPageCtrl', function ($scope, $routeParams, $filter, $location,
                                                 ContainerServices) {

    })


    .controller('containerListCtrl', function ($scope, $routeParams, $filter, $location, $window,
                                                 ContainerServices, baseContainers, containers)
    {
      $scope.baseContainers = baseContainers.data;
      $scope.containers = containers;

      $scope.startContainer = function(container) {
        ContainerServices.startContainerIfNecessary(container.ContainerHost.HostnameAlias, container.ContainerBaseName).then(function(data) {
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
