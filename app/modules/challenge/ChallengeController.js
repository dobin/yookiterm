'use strict';

angular.module('myApp.challenge', ['ngRoute', 'ngSanitize', 'hljs'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/challenges', {
            title: 'challenges',
            templateUrl: 'modules/challenge/challenge-list.html',
            controller: 'challengeListCtrl',
            resolve: {
                challenges: function (ChallengeServices) {
                    return ChallengeServices.getChallenges();
                }
            }
        })
            .when('/challenge/:challengeId', {
                title: 'challenge',
                templateUrl: 'modules/challenge/challenge-view.html',
                controller: 'challengeViewCtrl',
                resolve: {
                    challenge: function (ChallengeServices, $route) {
                        return ChallengeServices.getChallenge($route.current.params.challengeId);
                    }
                }
            })
        ;
    }])


    .controller('challengeListCtrl', function ($scope, $routeParams, $filter, $location, $route, $interval,
                                               challenges) {
        "ngInject";

        $scope.challenges = challenges.data;
    })


    .controller('challengeViewCtrl', function ($scope, $routeParams, $filter, $location, $route, $interval, $sce,
                                               spinnerService, ContainerServices, AuthenticationServices, challenge) {
        "ngInject";

        challenge = challenge.data;
        $scope.challenge = challenge;
        $scope.showAddTerminalButton = true;
        $scope.isAdmin = AuthenticationServices.isAdmin();

        // Prepare our three-max terminals
        // Se we can access it via jquery
        $scope.terminals = [{id: 0}, {id: 1}, {id: 2}, {id: 3}];

        var terminalCount = 0;

        $scope.showContainerInfo = function () {
            ContainerServices.getContainerInfo(challenge.ContainerBaseName, challenge.ContainerHostAlias).then(function (data) {
                $scope.containerInfo = data.data;
            });
        };

        $scope.closeTextTab = function () {
            console.log("Close");
        };

        $scope.flipTabs = function () {
            console.log("Flip");
        };

        $scope.restartContainer = function () {
            ContainerServices.restartContainer($scope.challenge.ContainerHostAlias, $scope.challenge.ContainerBaseName);
        };

        $scope.incSize = function (terminal) {
            terminal.height++;
            terminal.term.resize(terminal.width, terminal.height);
        };
        $scope.decSize = function (terminal) {
            console.log(terminal);
            terminal.height--;
            terminal.term.resize(terminal.width, terminal.height);
        };

        $scope.reload = function (terminal) {
            terminal.term.destroy();
            $scope.getTerminal(terminal);
        };

        $scope.getTerminal = function (origTerminal) {
            if (terminalCount == 3) {
                return;
            }

            spinnerService.show('booksSpinner');
            var t = {
                height: 25,
                width: null,
                id: null,
                term: null
            };

            var idx;
            if (origTerminal) {
                idx = origTerminal.id;
                t.height = origTerminal.height;
            } else {
                t.id = terminalCount;
                idx = terminalCount;
                terminalCount++;
                $scope.showAddTerminalButton = false;
            }



            ContainerServices.startContainerIfNecessary(challenge.ContainerHostAlias, challenge.ContainerBaseName).then(function (data) {
                console.log("Creating Terminal");
                var term = new Terminal({
                    role: "client",
                    parentId: "terminal-container",
                });
                var f = new FitAddon.FitAddon();
                term.loadAddon(f);
                term.open(document.getElementById('console'+ (idx)));
                $scope.terminals[idx].term = term;
                f.fit()
                
                ContainerServices.getHostnameForAlias(challenge.ContainerHostAlias).then(function (data) {
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
                        + challenge.ContainerBaseName
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
                spinnerService.hide('booksSpinner');
                $scope.showAddTerminalButton = true;
                terminalCount--;
            }).finally(function () {
                //$scope.terminals[idx].term.fit();
                spinnerService.hide('booksSpinner');
                $scope.showAddTerminalButton = true;
            }).catch(function (data) {
                console.log("ERR2", data);
            });
        }
    })


    // This will be called when the page finished rendering
    // It will call hljs, which searches for all code blocks, and highlights
    // them.
    // The code blocks (html) is assigned via controller, so we have to
    // wait until the page is finished rendering, or hljs will not find anything
    //
    // Cannot directly highlight a angularjs variable, as it contains html,
    // and i only want to highlight code blocks
    .directive("mymarkdown", function () {
        return function (scope, element, attrs) {
            scope.$watch("challenge", function (value) {
                $('pre code').each(function (i, block) {
                    hljs.highlightBlock(block);
                });
            })
        }
    })
;
