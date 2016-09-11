'use strict';

angular.module('myApp.setting', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/settings', {
            title: 'Settings',
            templateUrl: 'modules/setting/settings.html',
            controller: 'settingListCtrl',
            resolve: {
                myconfig: function(SettingServices, $route) {
                    return SettingServices.getMyCfg();
                },
            }
        })
        ;
    }])


    .controller('settingListCtrl', [
	'$http', '$scope', '$routeParams', '$route', '$filter', '$location', '$uibModal', '$window', 'SettingServices', 'myconfig',
	function ($httpProvider, $scope, $routeParams, $route, $filter, $location, $uibModal, $window,
                                             SettingServices, myconfig)
    {
        $scope.myconfig = myconfig;
        $scope.test = {};
        $scope.testUrl = SettingServices.getLxdApiUrl();

        // Try to get config
        SettingServices.getConfig().then(function(data) {
            $scope.config = data.data.metadata;
        }, function(error) {
            $scope.errMsg = "Could not get config from server: " + SettingServices.getLxdUrl();
        });

        $scope.save = function() {
            SettingServices.setMyCfg($scope.myconfig);
            $route.reload();
        }

    }]);
