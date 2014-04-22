'use strict';

angular.module('ua.security')
  .provider('authenticationService', [function(){

    var authenticationUrl = '/login';
    this.setAuthenticationUrl = function(value){
      authenticationUrl = value;
    };

    var logoutUrl = '/logout';
    this.setLogoutUrl = function(value){
      logoutUrl = value;
    };

    function AuthenticationService($http, $q){

      this.authenticate = function(username, password){

        var deferred = $q.defer();

        var user = {
          username: username,
          password: password
        };

        $http.post(authenticationUrl, user)
          .success(function(data){
            deferred.resolve(data);
          })
          .error(function(data, status){
            deferred.reject(status);
          });

        return deferred.promise;
      };

      this.logout = function(){
        var deferred = $q.defer();

        $http.post(logoutUrl)
          .success(function(data){
            deferred.resolve(data);
          })
          .error(function(data, status){
            deferred.reject(status);
          });

        return deferred.promise;
      };
    }

    this.$get = ['$http', '$q', function AuthenticationServiceFactory($http, $q){
      return new AuthenticationService($http, $q);
    }];
  }]);