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
                    containers: function (ContainerServices) {
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
                                                  ContainerServices, AuthenticationServices) {
        "ngInject";

        var containerHostAlias = $route.current.params.containerHostAlias;
        var containerBaseName = $route.current.params.containerBaseName;

        ContainerServices.getHostnameForAlias(containerHostAlias).then(function (data) {
            var containerHostname = data.Hostname;
        });

        $scope.showContainerInfo = function () {
            ContainerServices.getContainerInfo(containerBaseName, containerHostAlias).then(function (data) {
                $scope.containerInfo = data.data;
            });
        };

        $scope.showAddTerminalButton = false;

        var defaultHeight = 25;

        $scope.incSize = function() {
            document.getElementById("console").style.fontSize = "xx-large";
            defaultHeight = 15;
            $scope.start();
        }

        $scope.decSize = function() {
            document.getElementById("console").style.fontSize = "14px";
            defaultHeight = 35;
            $scope.start();
        }

        $scope.start = function() {
            if ($scope.terminal) {
                $scope.terminal.term.destroy();
            }

            var t = {
                height: defaultHeight,
                width: 80,
                id: null,
                term: null,
            };

            $scope.terminal = t;

            ContainerServices.startContainerIfNecessary(containerHostAlias, containerBaseName).then(function (data) {
                console.log("Creating Terminal");
                var term = new Terminal({
                    role: "client",
                    parentId: "terminal-container",
                });
                term.open(document.getElementById('console'));

                ContainerServices.getHostnameForAlias(containerHostAlias).then(function (data) {
                    //var containerHosts = data.data;
                    //var containerHost = _.findWhere(containerHosts, { HostnameAlias: containerHostAlias})
                    var containerHost = data;

                    var ws;
                    if (location.protocol === 'https:') {
                        ws = "wss://";
                    } else {
                        ws = "ws://";
                    }

                    var width = 80;
                    var height = 25;
                    var wssurl = ws
                        + containerHost.Hostname
                        + "/1.0/container/"
                        + containerBaseName
                        + "/console"
                        + "?width=" + width
                        + "&height=" + height
                        + "&token=" + AuthenticationServices.getToken();
                    const socket = new WebSocket(wssurl);
                    const attachAddon = new AttachAddon.AttachAddon(socket);
                    term.loadAddon(attachAddon);
                });
            }, function (error) {
                BootstrapDialog.alert('Error, the yookiterm-LXD server is down. Cannot create terminal.');
            }).finally(function () {
                //$scope.terminal.term.fit();
                //$scope.showAddTerminalButton = true;
            }).catch(function (data) {
                console.log("Error: ", data);
            })
        }
        $scope.start();

    })

    .controller('containerPageCtrl', function ($scope, $routeParams, $filter, $location,
                                               ContainerServices) {
        "ngInject";

    })


    .controller('containerListCtrl', function ($scope, $routeParams, $filter, $location, $window,
                                               ContainerServices, baseContainers, containers) {
        "ngInject";

        $scope.baseContainers = baseContainers.data;
        $scope.containers = containers;

        $scope.startContainer = function (container) {
            ContainerServices.startContainerIfNecessary(container.ContainerHost.HostnameAlias, container.ContainerBaseName).then(function (data) {
                for (var n = 0; n < $scope.containers.length; n++) {
                    if ($scope.containers[n] == container) {
                        //$scope.containers[n].ContainreHostAlias = data.data.
                        $scope.containers[n].ContainerUsername = data.data.username;
                        $scope.containers[n].ContainerPassword = data.data.password;
                        $scope.containers[n].ContainerExpiry = data.data.expiry;
                        $scope.containers[n].ContainerExpiryHard = data.data.expiryHard;
                        $scope.containers[n].ContainerStatus = data.data.status;
                    }
                }
            }, function (error) {
                BootstrapDialog.alert('Error, the yookiterm-LXD server is down. Cannot create terminal.');
            });
        };

        $scope.startConsole = function (container) {
            var url = $location.protocol() + "://" + $location.host() + ":" + $location.port();
            url += '#/container/' + container.ContainerHost.HostnameAlias + "/" + container.BaseContainer.Name + "/console";
            $window.open(url, '_blank');
        }
    })
;
