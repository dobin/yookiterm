'use strict';

angular.module('myApp.setting')
    .factory('SettingServices', ['$http', '$q', '$timeout',
        function ($http, $q, $timeout) {
            var obj = {};

            obj.getMyCfg = function() {
                var srvUrl;
                if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
                  srvUrl = 'localhost:8090';
                } else {
                  srvUrl = 'exploit.courses';
                }

                var cfg = {
                  srvurl: srvUrl,
                }
              return cfg;
            }

            obj.setMyCfg = function(config) {
              localStorage.setItem('lxdcfg', JSON.stringify(config));
            }


            obj.getSrvUrl = function() {
              return '//' + obj.getMyCfg().srvurl;
            }

            obj.getSrvApiUrl = function() {
              return '//' + obj.getMyCfg().srvurl + '/1.0';
            }

            return obj;
        }])
;
