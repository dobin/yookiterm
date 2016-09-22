'use strict';

angular.module('myApp.virtualmachine')
    .factory('VirtualmachineServices', ['$http', '$q', '$timeout', 'SettingServices', 'AuthenticationServices',
        function ($http, $q, $timeout, SettingServices, AuthenticationServices) {
            var obj = {};

            obj.getBaseContainerList = function() {
              var url = SettingServices.getSrvApiUrl() + "/baseContainers";
              return $http.get(url);
            }


            obj.getContainerHostList = function() {
              var url = SettingServices.getSrvApiUrl() + "/containerHosts";
              return $http.get(url);
            }


            obj.getContainerList = function() {
              //return obj.getBaseContainerList().then(function(data) {
              return obj.getContainerHostList().then(function(data) {
                //var promises = data.data.map(function(baseContainer) {
                var promises = data.data.map(function(containerHost) {
                  var url = "//" + containerHost.Hostname + "/1.0/container";
                  return $http.get(url).then(function(resp) {
                    console.log("D: " + JSON.stringify(resp.data));
                    return resp.data;
                  });
                });

                return $q.all(promises).then(function(data) {
                  var ret = [];

                  for(var n=0; n<data.length; n++) {
                    for(var nn=0; nn<data[n].length; nn++) {
                      //var i = data[n][nn];
                      ret.push(data[n][nn]);
                    }
                  }

                  return ret;
                });
              })
            }


            obj.getTerminalForContainer = function(containerBaseName) {
              obj.startContainerIfNecessary(containerBaseName).then(function(data) {
                return data;
              });
            }

            obj.getHostnameForAlias = function(containerHostAlias) {
              var containerHostsUrl = SettingServices.getSrvApiUrl() + "/containerHosts";
              return $http.get(containerHostsUrl);
            }

            // Public
            obj.startContainerIfNecessary = function(containerHostAlias, containerBaseName) {
              return obj.getHostnameForAlias(containerHostAlias).then(function(data) {
                var containerHosts = data.data;
                var containerHost = _.findWhere(containerHosts, { HostnameAlias: containerHostAlias})

                var url = "//" + containerHost.Hostname + "/1.0/container/" + containerBaseName + "/start";
                return $http.get(url);
              });
            }

            // Public
            obj.getTerminal = function(initialTermHeight) {
              var term = new Terminal({
                  cols: 80, // sane default
                  rows: initialTermHeight, // real height
                  useStyle: true,
                  screenKeys: false,
                  cursorBlink: false
              });

              return term;
            }

            // Public
            obj.getWebsocketTerminal = function(term, containerHostAlias, containerBaseName, width, height) {
              return obj.getHostnameForAlias(containerHostAlias).then(function(data) {
                var containerHosts = data.data;

                var containerHost = _.findWhere(containerHosts, { HostnameAlias: containerHostAlias})

                var ws;
                if (location.protocol === 'https:') {
                  ws = "wss://";
                } else {
                  ws = "ws://";
                }

                var wssurl = ws
                  + containerHost.Hostname
                  + "/1.0/container/"
                  + containerBaseName
                  + "/console"
                  + "?width=" + width
                  + "&height=" + height
                  + "&token=" + AuthenticationServices.getToken();
                var sock = new WebSocket(wssurl);

                term.on('data', function (data) {
                    sock.send(data);
                    //sock.send(new Blob([data]));
                });


                sock.onopen = function (e) {
                   sock.onmessage = function (msg) {
                     //msg.data = atob(msg.data);
                     var d = atob(msg.data);
                       //if (msg.data instanceof Blob) {
                       //    var reader = new FileReader();
                       //    reader.addEventListener('loadend', function () {
                       //        term.write(reader.result);
                       //    });
                       //    reader.readAsBinaryString(msg.data);
                       //} else {
                           term.write(d);
                       //}
                   };

                   sock.onclose = function (msg) {
                       console.log('WebSocket closed');
                       term.destroy();
                   };
                   sock.onerror = function (err) {
                       console.error(err);
                   };
               };
          });

          }

					return obj;
        }])
;
