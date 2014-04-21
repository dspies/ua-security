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

      //Accepts a string or array and returns an array
      function generateArrayFromArgument(stringOrArray) {

        if (Array.isArray(stringOrArray)) {
          return stringOrArray;
        } else {
          //remove whitespace
          stringOrArray = stringOrArray.replace(/\s+/g, '');

          //If it's not an empty string create array from the string
          if (stringOrArray) {
            return stringOrArray.split(',');
          } else {
            return [];
          }
        }
      }

      function checkRolesAreDefinedOrThrow(requiredRoles){
        if (typeof (requiredRoles) === 'undefined'){
          throw 'Must supply required roles';
        }
      }

      function checkRequiredRolesAgainstCurrentRoles(requiredRoles, securityContext, roleVerificationFn){
        checkRolesAreDefinedOrThrow(requiredRoles);

        requiredRoles = generateArrayFromArgument(requiredRoles);

        if (requiredRoles.length === 0) {
          //If the there are no required roles, the criteria is met by default
          return true;
        } else {
          var currentRoles = securityContext.getCurrentUser().roles;

          //Every required role is in the current user's roles
          return roleVerificationFn(currentRoles, requiredRoles);
        }
      }

      function allRolesPresent(currentRoles, requiredRoles){
        return requiredRoles.every(function (role) {
          return currentRoles.indexOf(role) !== -1;
        });
      }

      this.hasAllRoles = function (requiredRoles) {
        return checkRequiredRolesAgainstCurrentRoles(requiredRoles, this, allRolesPresent);
      };

      function anyRolesPresent (currentRoles, requiredRoles){
        //Return true if any of the required roles are present
        return (requiredRoles.some(function(role){
          return currentRoles.indexOf(role) !== -1;
        }));
      }

      this.hasAnyRoles = function (requiredRoles) {
        return checkRequiredRolesAgainstCurrentRoles(requiredRoles, this, anyRolesPresent);
      };

    }

    this.$get = ['authenticationService', 'userStorageService',
         function(authenticationService,   userStorageService){
      return new SecurityService(authenticationService, userStorageService);
    }];
  });