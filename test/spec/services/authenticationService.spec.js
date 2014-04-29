(function(){

  'use strict';

  var DEFAULT_USERNAME = 'user';
  var DEFAULT_PASSWORD = 'password';

  var DEFAULT_USER_CREDENTIALS = {
    username: DEFAULT_USERNAME,
    password: DEFAULT_PASSWORD
  };

  var POPULATED_USER = {
    username: DEFAULT_USERNAME,
    token: 'IAmAHappyToken',
    roles: ['ROLE_USER', 'ROLE_ADMIN']
  };

  //Test the authentication service without supplying configuration
  // variables.  The authentication service will use its defaults
  describe('authenticationService (default configuration)', function(){

    var authenticationService;
    var $httpBackend;

    //load the ua.security module
    beforeEach(module('ua.security'));

    beforeEach(function(){
      //inject your service and mocks for testing
      inject(function(_authenticationService_, _$httpBackend_){
        authenticationService = _authenticationService_;

        $httpBackend = _$httpBackend_;
      });
    });

    //define authentication url in configuration
    describe('authenticate', function(){

      it('function exists', function(){
        expect(angular.isFunction(authenticationService.authenticate)).toBe(true);
      });

      it('is successful with good credentials and returns a promise from authentication endpoint', function(){

        $httpBackend.expectPOST('api/login', DEFAULT_USER_CREDENTIALS)
            .respond(200, POPULATED_USER);

        var returnedPromise = authenticationService.authenticate(DEFAULT_USERNAME, DEFAULT_PASSWORD);
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(function(data){
          expect(data).not.toBeNull();
        });

        $httpBackend.flush();
      });

      it('fails to authenticate with bad credentials and returns 403 error from authentication endpoint', function(){

        $httpBackend.expectPOST('api/login', DEFAULT_USER_CREDENTIALS)
            .respond(403, '');

        var returnedPromise = authenticationService.authenticate(DEFAULT_USERNAME, DEFAULT_PASSWORD);
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(
            function(){},
            function(reason){
              expect(reason).toBe(403);
            });

        $httpBackend.flush();
      });

    });

    describe('logout', function(){
      it('function exists', function(){
        expect(angular.isFunction(authenticationService.logout)).toBe(true);
      });

      it('is successful with a header auth token and returns a promise from the logout endpoint', inject(function(securityService){

        //TODO Remove the ugly test coupling created by the interceptor
        spyOn(securityService, 'isAuthenticated').andReturn(true);
        spyOn(securityService, 'getCurrentUser').andReturn(POPULATED_USER);

        $httpBackend.expectPOST('api/logout',
            undefined,
            function(headers){
              return headers['X-Auth-Token'] === POPULATED_USER.token;
            }
        ).respond(200, '');

        var returnedPromise = authenticationService.logout();
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(function(data){
          expect(data).toBe('');
        });

        $httpBackend.flush();

      }));

      it('fails without a header auth token and returns 404 error from logout endpoint', function(){

        $httpBackend.expectPOST('api/logout',
            undefined,
            function(header){
              return !('X-Auth-Token' in header);
            }
        ).respond(404, '');

        var returnedPromise = authenticationService.logout();
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(
            function(){},
            function(message){
              expect(message).toBe(404);
            });

        $httpBackend.flush();

      });

    });

    afterEach(function(){
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

  });

  //Test the authentication service with the authenticationUrl and
  // logoutUrl provided to the service via configuration variables
  describe('authenticationService (with configuration)', function(){

    var authenticationService;
    var $httpBackend;

    //load the ua.security module
    beforeEach(module('ua.security', function(authenticationServiceProvider){
      authenticationServiceProvider.setAuthenticationUrl('/myLogin');
      authenticationServiceProvider.setLogoutUrl('/myLogout');
    }));

    beforeEach(function(){
      //inject your service and mocks for testing
      inject(function(_authenticationService_, _$httpBackend_){
        authenticationService = _authenticationService_;

        $httpBackend = _$httpBackend_;
      });
    });

    //define authentication url in configuration
    describe('authenticate', function(){

      it('function exists', function(){
        expect(angular.isFunction(authenticationService.authenticate)).toBe(true);
      });

      it('is successful with good credentials and returns a promise from authentication endpoint', function(){

        $httpBackend.expectPOST('/myLogin', DEFAULT_USER_CREDENTIALS)
            .respond(200, POPULATED_USER);

        var returnedPromise = authenticationService.authenticate(DEFAULT_USERNAME, DEFAULT_PASSWORD);
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(function(data){
          expect(data).not.toBeNull();
        });

        $httpBackend.flush();
      });

      it('fails to authenticate with bad credentials and returns 403 error from authentication endpoint', function(){

        $httpBackend.expectPOST('/myLogin', DEFAULT_USER_CREDENTIALS)
            .respond(403, '');

        var returnedPromise = authenticationService.authenticate(DEFAULT_USERNAME, DEFAULT_PASSWORD);
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(
            function(){},
            function(reason){
              expect(reason).toBe(403);
            });

        $httpBackend.flush();
      });
    });

    describe('logout', function(){
      it('function exists', function(){
        expect(angular.isFunction(authenticationService.logout)).toBe(true);
      });

      it('is successful with a header auth token and returns a promise from the logout endpoint', inject(function(securityService){

        //TODO Remove the ugly test coupling created by the interceptor
        spyOn(securityService, 'isAuthenticated').andReturn(true);
        spyOn(securityService, 'getCurrentUser').andReturn(POPULATED_USER);

        $httpBackend.expectPOST('/myLogout',
            undefined,
            function(headers){
              return headers['X-Auth-Token'] === POPULATED_USER.token;
            }
        ).respond(200, '');

        var returnedPromise = authenticationService.logout();
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(function(data){
          expect(data).toBe('');
        });

        $httpBackend.flush();

      }));

      it('fails without a header auth token and returns 404 error from logout endpoint', function(){

        $httpBackend.expectPOST('/myLogout',
            undefined,
            function(headers){
              return !('X-Auth-Token' in headers);
            }
        ).respond(404, '');

        var returnedPromise = authenticationService.logout();
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(
            function(){},
            function(message){
              expect(message).toBe(404);
            });

        $httpBackend.flush();

      });

    });

    afterEach(function(){
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

  });

}());