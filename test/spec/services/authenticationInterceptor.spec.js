(function () {
  'use strict';

  var POPULATED_USER = {
    'username': 'user',
    'token': 'IAmAHappyToken',
    'roles':['ROLE_USER', 'ROLE_ADMIN']
  };

  describe('authentication interceptor', function () {

    var $http;
    var $httpBackend;
    var $httpProvider;
    var securityService;

    beforeEach(module('ua.security', function (_$httpProvider_) {
      $httpProvider = _$httpProvider_;
    }));

    beforeEach(inject(function (_$httpBackend_, _$http_, _securityService_) {
      $httpBackend = _$httpBackend_;
      $http = _$http_;
      securityService = _securityService_;
    }));

    it('adds the auth-token to GET request when user is logged in', function () {
      //spying on isAuthenticated is actually unnecessary since a populated user
      // will return isAuthenticated = true, however isolating the tests as much as possible
      spyOn(securityService, 'isAuthenticated').andReturn(true);
      spyOn(securityService, 'getCurrentUser').andReturn(POPULATED_USER);

      $httpBackend.expectGET('/someEndpoint', function(headers){
        return headers['X-Auth-Token'] === 'IAmAHappyToken';
      }).respond(201, '');

      $http.get('/someEndpoint');
      $httpBackend.flush();

      expect($httpProvider.interceptors).toContain('authenticationInterceptor');
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('adds the auth-token to POST request when user is logged in', function () {
      //spying on isAuthenticated is actually unnecessary since a populated user
      // will return isAuthenticated = true, however isolating the tests as much as possible
      spyOn(securityService, 'isAuthenticated').andReturn(true);
      spyOn(securityService, 'getCurrentUser').andReturn(POPULATED_USER);

      $httpBackend.expectPOST('/someEndpoint', {}, function(headers){
        return headers['X-Auth-Token'] === 'IAmAHappyToken';
      }).respond(201, '');

      $http.post('/someEndpoint', {});
      $httpBackend.flush();

      expect($httpProvider.interceptors).toContain('authenticationInterceptor');
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('removes the auth-token GET request when user is not logged in', function () {
      spyOn(securityService, 'isAuthenticated').andReturn(false);

      $httpBackend.expectGET('/someEndpoint', function(headers){
        console.info(headers);
        return !('X-Auth-Token' in headers);
      }).respond(201, '');

      $http.get('/someEndpoint');
      $httpBackend.flush();

      expect($httpProvider.interceptors).toContain('authenticationInterceptor');
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('removes the auth-token POST request when user is not logged in', function () {
      spyOn(securityService, 'isAuthenticated').andReturn(false);

      $httpBackend.expectPOST('/someEndpoint', {}, function(headers){
        return !('X-Auth-Token' in headers);
      }).respond(201, '');

      $http.post('/someEndpoint', {});
      $httpBackend.flush();

      expect($httpProvider.interceptors).toContain('authenticationInterceptor');
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

  });

}());
