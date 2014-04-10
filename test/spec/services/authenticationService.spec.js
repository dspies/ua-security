(function(){

  'use strict';

  //Test the authentication service without supplying configuration
  // variables.  The authentication service will use its defaults
  describe('authenticationService without configuration', function(){

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

      var username = 'user';
      var password = 'password';
      var userCredentials = {
        username: username,
        password: password
      };
      var successfulUserReturned = {
        username: username,
        token: 'IAmAHappyToken',
        roles: ['ROLE_USER', 'ROLE_ADMIN']
      };

      it('function exists', function(){
        expect(angular.isFunction(authenticationService.authenticate)).toBe(true);
      });

      it('is successful with good credentials and returns a promise from authentication endpoint', function(){

        $httpBackend.expectPOST('/login', userCredentials)
            .respond(200, successfulUserReturned);

        var returnedPromise = authenticationService.authenticate(username, password);
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(function(data){
          expect(data).not.toBeNull();
        });

        $httpBackend.flush();
      });

      it('fails to authenticate with bad credentials and returns 403 error from authentication endpoint', function(){

        $httpBackend.expectPOST('/login', userCredentials)
            .respond(403, '');

        var returnedPromise = authenticationService.authenticate(username, password);
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

      it('is successful with a header auth token and returns a promise from the logout endpoint', function(){

        var $http;
        var authTokenHeaders = {'x-auth-token': 'IAmYourToken'};

        inject(function(_$http_){
          $http = _$http_;
          $http.defaults.headers.common = authTokenHeaders;
        });

        $httpBackend.expectPOST('/logout',
            undefined,
            authTokenHeaders
        ).respond(200, '');

        var returnedPromise = authenticationService.logout();
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(function(data){
          expect(data).toBe('');
        });

        $httpBackend.flush();

      });

      it('fails without a header auth token and returns 404 error from logout endpoint', function(){

        var $http;
        var authTokenHeaders = {'x-auth-token': 'IAmYourToken'};

        inject(function(_$http_){
          $http = _$http_;
          $http.defaults.headers.common = authTokenHeaders;
        });

        $httpBackend.expectPOST('/logout',
            undefined,
            authTokenHeaders
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
  describe('authenticationService with configuration', function(){

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

      var username = 'user';
      var password = 'password';
      var userCredentials = {
        username: username,
        password: password
      };
      var successfulUserReturned = {
        username: username,
        token: 'IAmAHappyToken',
        roles: ['ROLE_USER', 'ROLE_ADMIN']
      };

      it('function exists', function(){
        expect(angular.isFunction(authenticationService.authenticate)).toBe(true);
      });

      it('is successful with good credentials and returns a promise from authentication endpoint', function(){

        $httpBackend.expectPOST('/myLogin', userCredentials)
            .respond(200, successfulUserReturned);

        var returnedPromise = authenticationService.authenticate(username, password);
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(function(data){
          expect(data).not.toBeNull();
        });

        $httpBackend.flush();
      });

      it('fails to authenticate with bad credentials and returns 403 error from authentication endpoint', function(){

        $httpBackend.expectPOST('/myLogin', userCredentials)
            .respond(403, '');

        var returnedPromise = authenticationService.authenticate(username, password);
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

      it('is successful with a header auth token and returns a promise from the logout endpoint', function(){

        var $http;
        var authTokenHeaders = {'x-auth-token': 'IAmYourToken'};

        inject(function(_$http_){
          $http = _$http_;
          $http.defaults.headers.common = authTokenHeaders;
        });

        $httpBackend.expectPOST('/myLogout',
            undefined,
            authTokenHeaders
        ).respond(200, '');

        var returnedPromise = authenticationService.logout();
        expect(angular.isFunction(returnedPromise.then)).toBe(true);

        returnedPromise.then(function(data){
          expect(data).toBe('');
        });

        $httpBackend.flush();

      });

      it('fails without a header auth token and returns 404 error from logout endpoint', function(){

        var $http;
        var authTokenHeaders = {'x-auth-token': 'IAmYourToken'};

        inject(function(_$http_){
          $http = _$http_;
          $http.defaults.headers.common = authTokenHeaders;
        });

        $httpBackend.expectPOST('/myLogout',
            undefined,
            authTokenHeaders
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