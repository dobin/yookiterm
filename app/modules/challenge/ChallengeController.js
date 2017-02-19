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

        $scope.stopContainer = function () {
            ContainerServices.stopContainer($scope.challenge.ContainerHostAlias, $scope.challenge.ContainerBaseName);
        };

        $scope.incSize = function (terminal) {
            terminal.height++;
            terminal.term.resize(terminal.width, terminal.height);
        };
        $scope.decSize = function (terminal) {
            terminal.height--;
            terminal.term.resize(terminal.width, terminal.height);
        };

        $scope.reload = function (terminal) {
            $scope.terminals[terminal.id - 1].term.destroy();
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
            } else {
                t.id = terminalCount;
                idx = terminalCount;
                terminalCount++;
                $scope.showAddTerminalButton = false;
            }

            ContainerServices.startContainerIfNecessary(challenge.ContainerHostAlias, challenge.ContainerBaseName).then(function (data) {
                $scope.terminals[idx].term = ContainerServices.getTerminal(t.height);

                var dd = document.getElementById('console' + (idx));
                if (dd == null) {
                    console.log("Error, could not find id");
                }

                $scope.terminals[idx].term.open(document.getElementById('console' + (idx)));
                var initialGeometry = $scope.terminals[idx].term.proposeGeometry(),
                    cols = initialGeometry.cols,
                    rows = initialGeometry.rows;
                $scope.terminals[idx].width = cols;
                $scope.terminals[idx].show = true;

                ContainerServices.getWebsocketTerminal($scope.terminals[idx].term, challenge.ContainerHostAlias, challenge.ContainerBaseName, cols, rows);


                $scope.terminals[idx].term.on('destroy', function () {
                    console.log("Terminal Destroy");
                });

                $scope.terminals[idx].term.on('resize', function (size) {
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
            }, function (error) {
                BootstrapDialog.alert('Error, the yookiterm-LXD server is down. Cannot create terminal.');
                spinnerService.hide('booksSpinner');
                $scope.showAddTerminalButton = true;
                terminalCount--;
            }).finally(function () {
                $scope.terminals[idx].term.fit();
                spinnerService.hide('booksSpinner');
                $scope.showAddTerminalButton = true;
            }).catch(function (data) {
                console.log("ERR2");
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
