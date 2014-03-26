'use strict';

angular.module('ua.security')
  .provider('securityService', function(){

    function SecurityService(authenticationService){

      var NULL_USER = { username: '', roles: []};
      var currentUser = NULL_USER;

      this.getCurrentUser = function(){
        return currentUser;
      };

      this.login = function(username, password){
        return authenticationService.authenticate(username, password)
            .then(function(user){
                currentUser = user;
                return user;
              });
      };

      this.logout = function () {
        return authenticationService.logout()
            .then(function(){
              currentUser = NULL_USER;
            });
      };

      this.isAuthenticated = function () {
        return (currentUser !== NULL_USER);
      };

      this.isAnonymous = function(){
        return (currentUser === NULL_USER);
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

        //Every required role is in the current user's roles
        return (requiredRoles.every(function(role){
          return currentUser.roles.indexOf(role) !== -1;
        }));
      };

      this.hasAnyRole = function (preferredRoles) {
        preferredRoles = generateArray(preferredRoles);

        //Return true if any of the preferred roles are present
        return (preferredRoles.some(function(role){
          return currentUser.roles.indexOf(role) !== -1;
        }));
      };
    }

    this.$get = ['authenticationService', function(authenticationService){
      return new SecurityService(authenticationService);
    }];
  });