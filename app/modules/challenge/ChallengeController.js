'use strict';

angular.module('myApp.challenge', ['ngRoute', 'ngSanitize', 'hljs'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/challenges', {
            title: 'challenges',
            templateUrl: 'modules/challenge/challenge-list.html',
            controller: 'challengeListCtrl',
            resolve: {

            }
        })
        .when('/challenge/:challengeId', {
            title: 'challenge',
            templateUrl: 'modules/challenge/challenge-view.html',
            controller: 'challengeViewCtrl',
            resolve: {
              challenge: function (ChallengeServices, $route) {
                    return ChallengeServices.getChallenge($route.current.params.challengeId);
              },
            }
        })
				;
    }])


    .controller('challengeListCtrl', function ($scope, $routeParams, $filter, $location, $route, $interval
                )
    {

   	})


  .controller('challengeViewCtrl', function ($scope, $routeParams, $filter, $location, $route, $interval,
                                              spinnerService, VirtualmachineServices, challenge)
  {
    challenge = challenge.data;
    $scope.challenge = challenge;
    $scope.showAddTerminalButton = true;

    $scope.terminals = [];

    var terminalCount = 0;
    var terminalHeight = 25;
    var terminalWidth;
    var term;

    $scope.incSize = function(terminal) {
      terminal.height++;
      terminal.term.resize(terminal.width, terminal.height);
    }
    $scope.decSize = function(terminal) {
      terminal.height--;
      terminal.term.resize(terminal.width, terminal.height);
    }


    $scope.getTerminal = function() {
      if (terminalCount == 3) {
        return;
      }
      terminalCount++;

      var t = {
        height: 25,
        width: null,
        id: terminalCount,
        term: null,
      };

      // Create a div to insert the term on
      // later with term.open
      var idx = $scope.terminals.push(t);

      spinnerService.show('booksSpinner');
      $scope.showAddTerminalButton = false;

      VirtualmachineServices.startContainerIfNecessary(challenge.ContainerBaseName).then(function(data) {
        $scope.terminals[idx-1].term = VirtualmachineServices.getTerminal(t.height);
        $scope.terminals[idx-1].term.open(document.getElementById('console' + terminalCount));
        var initialGeometry = $scope.terminals[idx-1].term.proposeGeometry(),
            cols = initialGeometry.cols,
            rows = initialGeometry.rows;
        $scope.terminals[idx-1].width = cols;

        VirtualmachineServices.getWebsocketTerminal(t.term, challenge.ContainerBaseName, cols, rows);

        $scope.terminals[idx-1].term.on('resize', function (size) {
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
        spinnerService.hide('booksSpinner');
        $scope.showAddTerminalButton = true;
      })
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
  .directive("mymarkdown", function() {
    return function (scope, element, attrs) {
      scope.$watch("challenge", function(value) {
        $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
        });
      })
    }
  })
;
