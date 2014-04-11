(function () {
  'use strict';

  describe('User Storage Service', function () {

    var DEFAULT_USER = {
      username: 'USER',
      token: 'ImAHappyToken',
      roles: ['ROLE_USER', 'ROLE_ADMIN']
    };

    var userStorageService;
    var $window;

    beforeEach(module('ua.security'));

    beforeEach(inject(function (_userStorageService_, _$window_) {
      userStorageService = _userStorageService_;
      $window = _$window_;

      //If the browser is PhantomJS
      if (navigator.userAgent.match(/Phantom/g)) {
        console.debug('Mocking session storage for PhantomJS');

        var store = {};
        //mock session storage
        spyOn($window.sessionStorage, 'getItem').andCallFake(function(key){
          return store[key];
        });

        spyOn($window.sessionStorage, 'setItem').andCallFake(function(key, value){
          store[key] = value;
        });

        spyOn($window.sessionStorage, 'removeItem').andCallFake(function (key) {
          delete store[key];
        });

        spyOn($window.sessionStorage, 'clear').andCallFake(function () {
          store = {};
        });

        //Otherwise
      } else {
        console.debug('Mocking session storage for non-PhantomJS');

        //Mock out the session storage
        var mock = (function() {
          var store = {};
          return {
            getItem: function(key) {
              return store[key];
            },
            setItem: function(key, value) {
              store[key] = value;
            },
            removeItem: function(key) {
              delete store[key];
            },
            clear: function() {
              store = {};
            }
          };
        })();
        Object.defineProperty($window, 'sessionStorage', { value: mock, writable:true });

        spyOn($window.sessionStorage, 'getItem').andCallThrough();
        spyOn($window.sessionStorage, 'setItem').andCallThrough();
        spyOn($window.sessionStorage, 'removeItem').andCallThrough();
      }
    }));

    afterEach(function () {
      $window.sessionStorage.clear();
    });

    it('session storage mock is working', function () {
      //setItem on the mock implementation
      $window.sessionStorage.setItem('ua-user', DEFAULT_USER);

      //check that the mock returns the expect JSON object
      expect($window.sessionStorage.getItem('ua-user')).toBe(DEFAULT_USER);
    });

    describe('storeUser', function () {

      it('exists', function () {
        expect(angular.isFunction(userStorageService.storeUser)).toBe(true);
      });

      it('persists the user to the session storage', function () {
        userStorageService.storeUser(DEFAULT_USER);

        expect($window.sessionStorage.getItem('ua-user')).toBe(DEFAULT_USER);
      });

    });

    describe('retrieveUser', function () {

      it('exists', function () {
        expect(angular.isFunction(userStorageService.retrieveUser)).toBe(true);
      });

      it('retrieves the user from session storage', function () {
        $window.sessionStorage.setItem('ua-user', DEFAULT_USER);

        expect(userStorageService.retrieveUser()).toBe(DEFAULT_USER);
      });
    });

    describe('deleteUser', function () {

      it('exists', function () {
        expect(angular.isFunction(userStorageService.deleteUser)).toBe(true);
      });

      it('removes the user key/value from session storage', function () {
        $window.sessionStorage.setItem('ua-user', DEFAULT_USER);

        userStorageService.deleteUser();

        expect($window.sessionStorage.getItem('ua-user')).toBeUndefined();
      });
    });
  });

}());
