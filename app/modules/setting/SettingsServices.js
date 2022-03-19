'use strict';

angular.module('myApp.setting')
    .factory('SettingServices', ['$http', '$q', '$timeout',
        function ($http, $q, $timeout) {
            var obj = {};

            obj.getMyCfg = function() {
                var srvUrl = location.hostname;
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
