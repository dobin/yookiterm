'use strict';

angular.module('myApp.challenge')
    .factory('ChallengeServices', ['$http', '$q', '$timeout', 'SettingServices',
        function ($http, $q, $timeout, SettingServices) {
            var obj = {};

						obj.getChallenge = function (challengeId) {
							return $http.get( SettingServices.getLxdApiUrl() + "/challenge/" + challengeId).success(function(data) {
                var converter = new showdown.Converter();
//                console.log("DD: " + data.Text);
//                console.log("D:" + JSON.stringify(data));
                data.inputHtml = converter.makeHtml(data.Text);

                return data;
              });
            };

						return obj;
        }])
;
