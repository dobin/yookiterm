'use strict';

angular.module('myApp.container')
    .factory('ContainerServices', ['$http', '$q', '$timeout', '$cacheFactory', 'SettingServices', 'AuthenticationServices',
        function ($http, $q, $timeout, $cacheFactory, SettingServices, AuthenticationServices) {
            var obj = {};
            var cache = $cacheFactory('containerServiceCache');


            // yookiterm-server: Get available base container
            obj.getBaseContainerList = function () {
                var url = SettingServices.getSrvApiUrl() + "/baseContainers";
                return $http.get(url);
            }


            // yookiterm-server: Get available container hosts
            obj.getContainerHostList = function () {
                var url = SettingServices.getSrvApiUrl() + "/containerHosts";
                return $http.get(url);
            }


            // yookiterm-server + yookiterm-lxdserver:
            // Get all container
            // - running from server
            // - stopped injected locally
            obj.getContainerList = function () {
                // get containerhosts
                return obj.getContainerHostList().then(function (data) {
                    var pubContainerHosts = data.data;

                    // get baseContainers
                    return obj.getBaseContainerList().then(function (data) {
                        var baseContainers = data.data;

                        // get container list
                        var promises = pubContainerHosts.map(function (containerHost) {
                            var url = "//" + containerHost.Hostname + "/1.0/container";
                            return $http.get(url).then(function (resp) {
                                if (resp.data) {
                                    for (var n = 0; n < resp.data.length; n++) {
                                        resp.data[n].ContainerHost = containerHost;
                                        resp.data[n].BaseContainer = _.findWhere(baseContainers, {Name: resp.data[n].ContainerBaseName})

                                        // Save this specially so we dont have nested search
                                        // below in #1 FIXME
                                        resp.data[n].ContainerHostAlias = resp.data[n].ContainerHost.HostnameAlias;
                                    }
                                }
                                return resp.data;
                            }, function (bla) {
                                console.log("Could not reach server: " + url);
                            });
                        });

                        // get container details for all in list
                        return $q.all(promises).then(function (data) {
                            var ret = [];

                            // insert running
                            for (var n = 0; n < data.length; n++) {
                                if (data[n] == null) {
                                    continue;
                                }

                                for (var nn = 0; nn < data[n].length; nn++) {
                                    ret.push(data[n][nn]);
                                }
                            }

                            // inject offline
                            for (var i = 0; i < pubContainerHosts.length; i++) {
                                for (var n = 0; n < baseContainers.length; n++) {
                                    // #1 Find very smart...
                                    if (!_.findWhere(ret, {
                                            ContainerHostAlias: pubContainerHosts[i].HostnameAlias,
                                            ContainerBaseName: baseContainers[n].Name
                                        })) {
                                        ret.push(
                                            {
                                                "ContainerHostAlias": pubContainerHosts[i].HostnameAlias,
                                                "ContainerBaseName": baseContainers[n].Name,
                                                "ContainerHost": pubContainerHosts[i],
                                                "BaseContainer": baseContainers[n],
                                            }
                                        );
                                    }
                                }
                            }

                            return ret;
                        }, function (bla) {
                            console.log("BLaA");
                        });
                    });
                })
            }


            obj.adminCmd = function (cmd) {
                return obj.getContainerHostList().then(function (data) {
                    var pubContainerHosts = data.data;

                    var promises = pubContainerHosts.map(function (containerHost) {
                        var url = "//" + containerHost.Hostname + "/1.0/admin/exec/" + cmd;
                        return $http.get(url).catch(function () {
                        });
                    });

                    return $q.all(promises);
                });
            }


            obj.getLogs = function (cmd) {
                return obj.getContainerHostList().then(function (data) {
                    var pubContainerHosts = data.data;

                    var promises = pubContainerHosts.map(function (containerHost) {
                        var url = "//" + containerHost.Hostname + "/1.0/admin/logs";
                        return $http.get(url).catch(function () {
                        });
                    });

                    return $q.all(promises);
                });
            }


            obj.getStats = function (cmd) {
                return obj.getContainerHostList().then(function (data) {
                    var pubContainerHosts = data.data;

                    var promises = pubContainerHosts.map(function (containerHost) {
                        var url = "//" + containerHost.Hostname + "/1.0/admin/stats";
                        return $http.get(url).catch(function () {
                            console.log("Err");
                        });
                    });

                    return $q.all(promises);
                });
            }


            obj.getHostnameForAlias = function (containerHostAlias) {
                var containerHostsUrl = SettingServices.getSrvApiUrl() + "/containerHosts";
                return $http.get(containerHostsUrl).then(function (data) {
                    var containerHosts = data.data;
                    var containerHost = _.findWhere(containerHosts, {HostnameAlias: containerHostAlias})
                    return containerHost;
                });
            }


            // Public
            obj.startContainerIfNecessary = function (containerHostAlias, containerBaseName) {
                return obj.getHostnameForAlias(containerHostAlias).then(function (data) {
                    var containerHost = data;

                    var url = "//" + containerHost.Hostname + "/1.0/container/" + containerBaseName + "/start";
                    return $http.get(url);
                });
            }


            // Public
            obj.stopContainer = function (containerHostAlias, containerBaseName) {
                return obj.getHostnameForAlias(containerHostAlias).then(function (containerHost) {
                    var url = "//" + containerHost.Hostname + "/1.0/container/" + containerBaseName + "/stop";
                    return $http.get(url);
                });
            }


            // Public
            obj.restartContainer = function (containerHostAlias, containerBaseName) {
                return obj.getHostnameForAlias(containerHostAlias).then(function (containerHost) {
                    var url = "//" + containerHost.Hostname + "/1.0/container/" + containerBaseName + "/restart";
                    return $http.get(url);
                });
            }


            obj.getContainerInfo = function (containerBaseName, containerHostAlias) {
                return obj.getHostnameForAlias(containerHostAlias).then(function (containerHost) {
                    var url = "//" + containerHost.Hostname + "/1.0/container/" + containerBaseName;
                    return $http.get(url).then(function (data) {
                        var sshPort = parseInt(data.data.sshPort);
                        sshPort += parseInt(containerHost.SshBasePort);
                        data.data.sshPort = sshPort.toString();
                        return data;
                    });
                })
            }

            return obj;
        }])
;
