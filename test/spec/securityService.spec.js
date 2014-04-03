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

    var securityService;
    var authenticationService;
    var deferred;
    var $http;

    beforeEach(module('ua.security'));

    beforeEach(function () {
      inject(function (_securityService_, _authenticationService_, $q, _$http_) {
        securityService = _securityService_;
        authenticationService = _authenticationService_;
        $http = _$http_;

        deferred = $q.defer();
        spyOn(authenticationService, 'authenticate').andReturn(deferred.promise);
        spyOn(authenticationService, 'logout').andReturn(deferred.promise);
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

    });

    describe('login function', function(){

      //sanity check
      it('exists', function () {
        expect(angular.isFunction(securityService.login)).toBe(true);
      });

      it('is called successful, it stores the authenticated user in "currentUser" ' +
          'and returns the promise', function () {

        securityService.login(USERNAME, PASSWORD)
            .then(function(user){
              expect(user).not.toBeNull();
              expect(user).toEqual(POPULATED_USER);
            }, function(error){
              expect('errorCallback').not.toBe('called with ' + error);
            });

        deferred.resolve(POPULATED_USER);
        expect(authenticationService.authenticate).toHaveBeenCalledWith(USERNAME, PASSWORD);
      });

      it('is called successfully, it stores the token in ' +
          '$http.defaults.headers.common', function () {

        securityService.login(USERNAME, PASSWORD)
            .then(function (user) {
              expect($http.defaults.headers.common['X-Auth-Token']).toBe(user.token);
            });

        deferred.resolve(POPULATED_USER);
      });

      it('is called unsuccessfully, the current user is remains the same and the ' +
          'promise is rejected', function () {

        securityService.login(USERNAME, PASSWORD)
            .then(function(user){
              expect('successCallback').not.toBe('called with ' + user);
            }, function(error){
              expect(error).not.toBeNull();
              expect(error).toEqual('403');
              expect(securityService.getCurrentUser()).toEqual(NULL_USER);
            });

        expect(authenticationService.authenticate).toHaveBeenCalledWith(USERNAME, PASSWORD);

        deferred.reject ('403');
      });

    });

    describe('logout function', function () {

      it('exists', function(){
        expect(angular.isFunction(securityService.logout)).toBe(true);
      });

      it('is successful and sets the "currentUser" to "NULL_USER"', function(){

        securityService.logout()
            .then(function(){
              expect(securityService.getCurrentUser()).toEqual(NULL_USER);
            }, function(error){
              expect('errorCallback').not.toBe('called with ' + error);
            });

        expect(authenticationService.logout).toHaveBeenCalled();

        deferred.resolve({});
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

        deferred.reject('404');
      });
    });

    describe('isAuthenticated function', function () {

      it('exists', function(){
        expect(angular.isFunction(securityService.isAuthenticated)).toBe(true);
      });

      it('returns true when the "currentUser" is not the "NULL_USER"', function () {
        securityService.login(USERNAME, PASSWORD)
            .then(function(){
              expect(securityService.isAuthenticated()).toBe(true);
            });

        deferred.resolve(POPULATED_USER);
      });

      it('returns false when "currentUser" is the "NULL_USER"', function () {
        expect(securityService.isAuthenticated()).toBe(false);
      });

    });

    describe('isAnonymous function', function () {

      it('exists', function () {
        expect(angular.isFunction(securityService.isAnonymous)).toBe(true);
      });

      it('returns true when the "currentUser" is the "NULL_USER"', function () {
        expect(securityService.isAnonymous()).toBe(true);
      });

      it('returns false when the "currentUser" is not the "NULL_USER"', function(){

        securityService.login(USERNAME, PASSWORD)
            .then(function(){
              expect(securityService.isAnonymous()).toBe(false);
            });

        deferred.resolve (POPULATED_USER);
      });
    });

    describe('hasAllRoles function', function(){

      it('exists', function(){
        expect(angular.isFunction(securityService.hasAllRoles)).toBe(true);
      });

      it('returns true is the "currentUser" has all roles supplied', function(){

        securityService.login(USERNAME, PASSWORD)
            .then(function(){
              expect(securityService.hasAllRoles('ROLE_USER')).toBe(true);
              expect(securityService.hasAllRoles(['ROLE_USER'])).toBe(true);
              expect(securityService.hasAllRoles('ROLE_USER, ROLE_ADMIN')).toBe(true);
              expect(securityService.hasAllRoles(['ROLE_USER', 'ROLE_ADMIN'])).toBe(true);

              expect(securityService.hasAllRoles('alert("hello"),console.log("hello")')).toBe(false);

              expect(securityService.hasAllRoles('ROLE_SUPER')).toBe(false);
              expect(securityService.hasAllRoles(['ROLE_SUPER'])).toBe(false);
              expect(securityService.hasAllRoles('ROLE_USER, ROLE_SUPER')).toBe(false);
              expect(securityService.hasAllRoles(['ROLE_USER', 'ROLE_SUPER'])).toBe(false);
            });

        deferred.resolve (POPULATED_USER);
      });
    });

    describe('hasAnyRole function', function () {

      it('exists', function () {
        expect(angular.isFunction(securityService.hasAnyRole)).toBe(true);
      });

      it('returns true if the "currentUser" has any role supplied', function () {
        securityService.login(USERNAME, PASSWORD)
            .then(function () {
              expect(securityService.hasAnyRole('ROLE_USER')).toBe(true);
              expect(securityService.hasAnyRole(['ROLE_ADMIN'])).toBe(true);
              expect(securityService.hasAnyRole('ROLE_USER, ROLE_ADMIN')).toBe(true);
              expect(securityService.hasAnyRole(['ROLE_USER', 'ROLE_ADMIN'])).toBe(true);
              expect(securityService.hasAnyRole('ROLE_SPECIAL, ROLE_ADMIN')).toBe(true);
              expect(securityService.hasAnyRole(['ROLE_SPECIAL', 'ROLE_ADMIN'])).toBe(true);

              expect(securityService.hasAnyRole('ROLE_SPECIAL')).toBe(false);
              expect(securityService.hasAnyRole(['ROLE_SUPER'])).toBe(false);
              expect(securityService.hasAnyRole('ROLE_SUPER, ROLE_SPECIAL')).toBe(false);
              expect(securityService.hasAnyRole(['ROLE_SUPER', 'ROLE_SPECIAL'])).toBe(false);
            });

        deferred.resolve(POPULATED_USER);

      });
    });
  });

}());