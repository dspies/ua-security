(function(){
  'use strict';

  describe('Security Service', function () {

    var NULL_USER = {username: '', roles: []};
    var USERNAME = 'user';
    var PASSWORD = 'password';

    var POPULATED_USER = {
      username: USERNAME,
      token: 'IAmAHappyToken',
      roles: ['ROLE_USER', 'ROLE_ADMIN']
    };

    describe('without configuration', function () {

      var securityService;
      var authenticationService;
      var authDeferred;
      var logoutDeferred;
      var $http;
      var $rootScope;
      var userStorageService;

      beforeEach(module('ua.security'));

      beforeEach(function () {
        inject(function (_securityService_, _authenticationService_, $q, _$http_, _$rootScope_, _userStorageService_) {
          securityService = _securityService_;
          authenticationService = _authenticationService_;
          userStorageService = _userStorageService_;
          $http = _$http_;
          $rootScope = _$rootScope_;

          authDeferred = $q.defer();
          logoutDeferred = $q.defer();
          spyOn(authenticationService, 'authenticate').andReturn(authDeferred.promise);
          spyOn(authenticationService, 'logout').andReturn(logoutDeferred.promise);
        });
      });

      afterEach(function(){
        inject(function($rootScope){
          $rootScope.$apply();
        });
      });

      describe('getCurrent function', function(){
        //sanity check
        it('exists', function () {
          expect(angular.isFunction(securityService.getCurrentUser)).toBe(true);
        });

        it('returns the NULL_USER before login is called', function() {
          expect(securityService.getCurrentUser()).toEqual(NULL_USER);
        });

        it('returns the user from the user store', inject(function () {
          spyOn(userStorageService, 'retrieveUser').andReturn(POPULATED_USER);

          expect(securityService.getCurrentUser()).toBe(POPULATED_USER);
        }));
      });

      describe('login function', function(){

        //sanity check
        it('exists', function () {
          expect(angular.isFunction(securityService.login)).toBe(true);
        });

        it('is called successfully, it stores the authenticated user in "currentUser" ' +
            'and returns the promise', function () {

          //Mock the userStorageService.storeUser, store the user for later expectations
          var storedUser;
          spyOn(userStorageService, 'storeUser').andCallFake(function(user){
            storedUser = user;
          });

          securityService.login(USERNAME, PASSWORD)
              .then(function(user){
                expect(user).not.toBeNull();
                expect(user).toEqual(POPULATED_USER);

                expect(userStorageService.storeUser).toHaveBeenCalledWith(POPULATED_USER);
                expect(storedUser).toBe(POPULATED_USER);
              }, function(error){
                expect('errorCallback').not.toBe('called with ' + error);
              });

          authDeferred.resolve(POPULATED_USER);
          expect(authenticationService.authenticate).toHaveBeenCalledWith(USERNAME, PASSWORD);
        });

        it('is called successfully, it stores the token in ' +
            '$http.defaults.headers.common', function () {

          securityService.login(USERNAME, PASSWORD)
              .then(function (user) {
                expect($http.defaults.headers.common['X-Auth-Token']).toBe(user.token);
              }, function(error){
                expect('errorCallback').not.toBe('called with ' + error);
              });

          authDeferred.resolve(POPULATED_USER);
        });

        it('is called unsuccessfully, the current user is remains the same and the ' +
            'promise is rejected', function () {

          securityService.login(USERNAME, PASSWORD)
              .then(function(user){
                expect('successCallback').not.toBe('called with ' + user);
              }, function(error){
                expect(error).not.toBeNull();
                expect(error).toEqual('403');
                expect(securityService.getCurrentUser()).toBe(NULL_USER);
              });

          expect(authenticationService.authenticate).toHaveBeenCalledWith(USERNAME, PASSWORD);

          authDeferred.reject ('403');
        });

      });

      describe('logout function', function () {

        it('exists', function(){
          expect(angular.isFunction(securityService.logout)).toBe(true);
        });

        it('is successful and sets the "currentUser" to "NULL_USER"', function(){

          spyOn(userStorageService, 'deleteUser');

          securityService.logout()
            .then(function(){
              expect(userStorageService.deleteUser).toHaveBeenCalled();
            }, function(error){
              expect('errorCallback').not.toBe('called with ' + error);
            });

          logoutDeferred.resolve();

          expect(authenticationService.logout).toHaveBeenCalled();
        });

        it('is successful and sets the authToken to null', function(){
          securityService.login(USERNAME, PASSWORD)
            .then(function(user){
              expect($http.defaults.headers.common['X-Auth-Token']).toBe(user.token);
            });
          authDeferred.resolve(POPULATED_USER);
          $rootScope.$apply();

          securityService.logout()
            .then(function(){
              expect($http.defaults.headers.common['X-Auth-Token']).toBeNull();
            });
          logoutDeferred.resolve();

          expect(authenticationService.logout).toHaveBeenCalled();
        });

        it('is unsuccessful and returns the rejected promise', function(){

          securityService.logout()
              .then(function(){
                expect('successCallback').not.toBe('called');
              }, function(error){
                expect(error).not.toBeNull();
                expect(error).toEqual('404');
              });

          expect(authenticationService.logout).toHaveBeenCalled();

          authDeferred.reject('404');
        });
      });

      describe('isAuthenticated function', function () {

        it('exists', function(){
          expect(angular.isFunction(securityService.isAuthenticated)).toBe(true);
        });

        it('returns true when the "currentUser" is not the "NULL_USER"', function () {
          spyOn(userStorageService, 'retrieveUser').andReturn(POPULATED_USER);

          expect(securityService.isAuthenticated()).toBe(true);
        });

        it('returns false when "currentUser" is the "NULL_USER"', function () {
          spyOn(userStorageService, 'retrieveUser').andReturn(null);

          expect(securityService.isAuthenticated()).toBe(false);
        });

      });

      describe('isAnonymous function', function () {

        it('exists', function () {
          expect(angular.isFunction(securityService.isAnonymous)).toBe(true);
        });

        it('returns true when the "currentUser" is the "NULL_USER"', function () {
          spyOn(userStorageService, 'retrieveUser').andReturn(null);

          expect(securityService.isAnonymous()).toBe(true);
        });

        it('returns false when the "currentUser" is not the "NULL_USER"', function(){
          spyOn(userStorageService, 'retrieveUser').andReturn(POPULATED_USER);
          expect(securityService.isAnonymous()).toBe(false);
        });
      });

      describe('hasAllRoles function', function(){

        it('exists', function(){
          expect(angular.isFunction(securityService.hasAllRoles)).toBe(true);
        });

        it('returns true is the "currentUser" has all roles supplied, and false otherwise', function(){

          spyOn(userStorageService, 'retrieveUser').andReturn(POPULATED_USER);

          //Situations that should result in truthy result
          expect(securityService.hasAllRoles('ROLE_USER')).toBe(true);
          expect(securityService.hasAllRoles(['ROLE_USER'])).toBe(true);
          expect(securityService.hasAllRoles('ROLE_USER, ROLE_ADMIN')).toBe(true);
          expect(securityService.hasAllRoles(['ROLE_USER', 'ROLE_ADMIN'])).toBe(true);

          //Situations that should result in falsy result
          expect(securityService.hasAllRoles('alert("hello"),console.log("hello")')).toBe(false);
          expect(securityService.hasAllRoles('ROLE_SUPER')).toBe(false);
          expect(securityService.hasAllRoles(['ROLE_SUPER'])).toBe(false);
          expect(securityService.hasAllRoles('ROLE_USER, ROLE_SUPER')).toBe(false);
          expect(securityService.hasAllRoles(['ROLE_USER', 'ROLE_SUPER'])).toBe(false);
        });
      });

      describe('hasAnyRoles function', function () {

        it('exists', function () {
          expect(angular.isFunction(securityService.hasAnyRoles)).toBe(true);
        });

        it('returns true if the "currentUser" has any role supplied', function () {

          spyOn(userStorageService, 'retrieveUser').andReturn(POPULATED_USER);

          //Situations that should return truthy result
          expect(securityService.hasAnyRoles('ROLE_USER')).toBe(true);
          expect(securityService.hasAnyRoles(['ROLE_ADMIN'])).toBe(true);
          expect(securityService.hasAnyRoles('ROLE_USER, ROLE_ADMIN')).toBe(true);
          expect(securityService.hasAnyRoles(['ROLE_USER', 'ROLE_ADMIN'])).toBe(true);
          expect(securityService.hasAnyRoles('ROLE_SPECIAL, ROLE_ADMIN')).toBe(true);
          expect(securityService.hasAnyRoles(['ROLE_SPECIAL', 'ROLE_ADMIN'])).toBe(true);

          //Situations that should return falsy result
          expect(securityService.hasAnyRoles('ROLE_SPECIAL')).toBe(false);
          expect(securityService.hasAnyRoles(['ROLE_SUPER'])).toBe(false);
          expect(securityService.hasAnyRoles('ROLE_SUPER, ROLE_SPECIAL')).toBe(false);
          expect(securityService.hasAnyRoles(['ROLE_SUPER', 'ROLE_SPECIAL'])).toBe(false);
        });
      });
    });

    describe('with configuration', function () {

      var securityService;
      var authenticationService;
      var authDeferred;
      var logoutDeferred;
      var $http;
      var authTokenHeaderValue = 'authToken';
      var $rootScope;

      beforeEach(module('ua.security', function(securityServiceProvider){
        securityServiceProvider.setAuthTokenHeader(authTokenHeaderValue);
      }));

      beforeEach(function(){
        inject(function(_securityService_, _authenticationService_, _$http_, $q, _$rootScope_){
          securityService = _securityService_;
          authenticationService = _authenticationService_;
          $http = _$http_;
          $rootScope = _$rootScope_;

          authDeferred = $q.defer();
          logoutDeferred = $q.defer();
          spyOn(authenticationService, 'authenticate').andReturn(authDeferred.promise);
          spyOn(authenticationService, 'logout').andReturn(logoutDeferred.promise);
        });
      });

      afterEach(function(){
        inject(function ($rootScope) {
          $rootScope.$apply();
        });
      });

      describe('login', function () {

        it('is successful, AuthTokenHeader is set with configured token name', function(){
          securityService.login(USERNAME, PASSWORD)
              .then(function (user) {
                expect($http.defaults.headers.common[authTokenHeaderValue]).toBe(user.token);
              });

          authDeferred.resolve(POPULATED_USER);
        });
      });

      describe('logout', function () {

        it('is successful and AuthTokenHeader is blank with configured token name', function () {
          securityService.login(USERNAME, PASSWORD)
            .then(function (user) {
              expect($http.defaults.headers.common[authTokenHeaderValue]).toBe(user.token);
            });

          authDeferred.resolve(POPULATED_USER);
          $rootScope.$apply();

          securityService.logout()
            .then(function(){
              expect($http.defaults.headers.common[authTokenHeaderValue]).toBeNull();
            });
          logoutDeferred.resolve();

          expect(authenticationService.logout).toHaveBeenCalled();
        });
      });

    });

  });

}());