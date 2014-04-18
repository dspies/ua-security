/**
 * Simple token-based security service for AngularJS apps
 * @version v0.1.0 - 2014-04-18
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
	        $window.sessionStorage.setItem('ua-user', user);
	      };
	
	      this.retrieveUser = function () {
	        return $window.sessionStorage.getItem('ua-user');
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
	              return deferred.resolve(data);
	            })
	            .error(function(data, status){
	              return deferred.reject(status);
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
}());