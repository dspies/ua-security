'use strict';

angular.module('ua.security')
  .provider('securityService', function(){

    var authTokenHeader = 'X-Auth-Token';
    this.setAuthTokenHeader = function(value){
      authTokenHeader = value;
    };

    function SecurityService(authenticationService, userStorageService){

      var NULL_USER = { username: '', roles: []};

      this.getCurrentUser = function(){
        return userStorageService.retrieveUser() || NULL_USER;
      };

      this.getAuthTokenHeader = function () {
        return authTokenHeader;
      };

      this.login = function(username, password){
        return authenticationService.authenticate(username, password)
          .then(function(user){
              userStorageService.storeUser(user);
              return user;
            }, function () {
              userStorageService.deleteUser();
            });
      };

      this.logout = function () {
        return authenticationService.logout()
            .then(function(){
              userStorageService.deleteUser();
            });
      };

      this.isAuthenticated = function () {
        return (this.getCurrentUser() !== NULL_USER);
      };

      this.isAnonymous = function(){
        return (this.getCurrentUser() === NULL_USER);
      };

      function generateArray(str) {
        if (!Array.isArray(str)) {
          //remove whitespace and create array from the string
          str = str
              .replace(/\s+/g, '')
              .split(',');
        }
        return str;
      }

      this.hasAllRoles = function (requiredRoles) {
        requiredRoles = generateArray(requiredRoles);

        var currentRoles = this.getCurrentUser().roles;

        //Every required role is in the current user's roles
        return (requiredRoles.every(function(role){
          return currentRoles.indexOf(role) !== -1;
        }));
      };

      this.hasAnyRoles = function (preferredRoles) {
        preferredRoles = generateArray(preferredRoles);

        var currentRoles = this.getCurrentUser().roles;

        //Return true if any of the preferred roles are present
        return (preferredRoles.some(function(role){
          return currentRoles.indexOf(role) !== -1;
        }));
      };

    }

    this.$get = ['authenticationService', 'userStorageService',
         function(authenticationService,   userStorageService){
      return new SecurityService(authenticationService, userStorageService);
    }];
  });