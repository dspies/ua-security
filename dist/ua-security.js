/**
 * Simple token-based security service for AngularJS apps
 * @version v0.1.5 - 2014-04-29
 * @link https://github.com/dspies/ua-security
 * @author David Spies <david.m.spies@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(){
	'use strict';

	angular.module('ua.security', [])
	  .config(['$httpProvider', function ($httpProvider) {
	//auth token interceptor
	    $httpProvider.interceptors.push('authenticationInterceptor');
	  }]);
	

	angular.module('ua.security')
	  .factory('authenticationInterceptor', ['$injector', '$q', function ($injector, $q) {
	    return {
	      'request': function (config) {
	        $injector.invoke(['securityService', function(securityService) {
	
	          if (securityService.isAuthenticated()) {
	            config.headers[securityService.getAuthTokenHeader()] = securityService.getCurrentUser().token;
	          } else {
	            delete config.headers[securityService.getAuthTokenHeader()];
	          }
	        }]);
	        return config || $q.when(config);
	      }
	    };
	  }]);

	angular.module('ua.security')
	  .provider('userStorageService', function () {
	
	    function UserStorageService($window){
	      this.storeUser = function (user) {
	        $window.sessionStorage.setItem('ua-user', JSON.stringify(user));
	      };
	
	      this.retrieveUser = function () {
	        var user = $window.sessionStorage.getItem('ua-user');
	
	        return user ? JSON.parse(user) : undefined;
	      };
	
	      this.deleteUser = function(){
	        $window.sessionStorage.removeItem('ua-user');
	      };
	    }
	
	    this.$get = ['$window', function($window){
	      return new UserStorageService($window);
	    }];
	
	  });

	angular.module('ua.security')
	  .provider('authenticationService', [function(){
	
	    var authenticationUrl = 'api/login';
	    this.setAuthenticationUrl = function(value){
	      authenticationUrl = value;
	    };
	
	    var logoutUrl = 'api/logout';
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
}());