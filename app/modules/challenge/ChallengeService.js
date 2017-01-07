'use strict';

angular.module('myApp.challenge')
    .factory('ChallengeServices', ['$http', '$q', '$timeout', '$cacheFactory', 'SettingServices', 'ContainerServices',
        function ($http, $q, $timeout, $cacheFactory, SettingServices, ContainerServices) {
            var obj = {};

            obj.getChallenge = function (challengeId) {
                return $http.get(SettingServices.getSrvApiUrl() + "/challenge/" + challengeId).success(function (data) {
                    var converter = new showdown.Converter();
                    data.inputHtml = converter.makeHtml(data.Text);
                    return data;
                });
            };

            obj.getChallenges = function () {
                return $http.get(SettingServices.getSrvApiUrl() + "/challenges");
            }

            return obj;
        }])
;
