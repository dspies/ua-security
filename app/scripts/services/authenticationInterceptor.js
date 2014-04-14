'use strict';

angular.module('ua.security')
  .factory('authenticationInterceptor', ['$injector', '$q', function ($injector, $q) {
    return {
      'request': function (config) {
        $injector.invoke(['securityService', function(securityService) {

          if (securityService.isAuthenticated()) {
            config.headers[securityService.getAuthTokenHeader()] = securityService.getCurrentUser().token;
          } else {
            delete config.headers['X-Auth-Token'];
          }
        }]);
        return config || $q.when(config);
      }
    };
  }]);