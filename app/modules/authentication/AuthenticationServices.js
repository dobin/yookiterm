'use strict';

angular.module('myApp.authentication')
    .factory('AuthenticationServices', ['$http', '$q', '$timeout', 'SettingServices',
        function ($http, $q, $timeout, SettingServices) {
            var obj = {};

            obj.login = function(username, password) {
              return $http.post(SettingServices.getSrvUrl() + '/get-token', {
                  UserId: username,
                  Password: password
                })
            };

            obj.saveToken = function(token) {
              localStorage['jwtToken'] = token;
              obj.useToken();
            }

            obj.useToken = function(token) {
              if (obj.isAuthenticated) {
                $http.defaults.headers.common.Authorization = 'Bearer ' + obj.getToken();
              }
            }

            obj.getToken = function() {
              return localStorage['jwtToken'];
            }

            obj.logout = function() {
              localStorage.removeItem('jwtToken');
            }

            obj.parseJwt = function(token) {
              var base64Url = token.split('.')[1];
              var base64 = base64Url.replace('-', '+').replace('_', '/');
              return JSON.parse(atob(base64));
            }

            obj.isAuthenticated = function() {
              var token = obj.getToken();
              if(token) {
                var params = obj.parseJwt(token);
                return Math.round(new Date().getTime() / 1000) <= params.exp;
              } else {
                return false;
              }
            }

						return obj;
        }
		])
	;
