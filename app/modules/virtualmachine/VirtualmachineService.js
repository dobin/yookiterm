'use strict';

angular.module('myApp.virtualmachine')
    .factory('VirtualmachineServices', ['$http', '$q', '$timeout', 'SettingServices',
        function ($http, $q, $timeout, SettingServices) {
            var obj = {};

            obj.getBaseContainerList = function() {
              var url = SettingServices.getSrvApiUrl() + "/baseContainers";
              return $http.get(url);
            }


            obj.getContainerList = function() {
              return obj.getBaseContainerList().then(function(data) {
                var promises = data.data.map(function(baseContainer) {
                  var url = SettingServices.getLxdApiUrl() + "/container/" + baseContainer.Name;
                  return $http.get(url).then(function(resp) {
                    return resp.data;
                  });
                });

                return $q.all(promises).then(function(data) {
                  var ret = [];

                  for(var n=0; n<data.length; n++) {
                    var i = data[n];
  //                  console.log("B: " + JSON.stringify(i));
                    ret.push(data[n]);
                  }

                  //console.log("A" + JSON.stringify(data));
                  return ret;
                  //return data;
                });
              })
            }


            obj.getTerminalForContainer = function(containerBaseName) {
              obj.startContainerIfNecessary(containerBaseName).then(function(data) {
                return data;
              });
            }

            // Public
            obj.startContainerIfNecessary = function(containerHost, containerBaseName) {
              var url = SettingServices.getLxdApiUrl() + "/container/" + containerBaseName + "/start";
              return $http.get(url);
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
            obj.getWebsocketTerminal = function(term, containerHost, containerBaseName, width, height) {
              var wssurl = SettingServices.getLxdWsUrl()
                + "/container/"
                + containerBaseName
                + "/console"
                + "?width=" + width
                + "&height=" + height;
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
          }

					return obj;
        }])
;
