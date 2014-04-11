(function () {
  'use strict';

  describe('User Storage Service', function () {

    var DEFAULT_USER = {
      username: 'USER',
      token: 'ImAHappyToken',
      roles: ['ROLE_USER', 'ROLE_ADMIN']
    };

    var userStorageService;

    //mocked session storage
    var store = {};

    beforeEach(module('ua.security'));

    beforeEach(function () {

      //mock session storage
      spyOn(sessionStorage, 'getItem').andCallFake(function(key){
        return store[key];
      });

      Object.defineProperty(localStorage, 'setItem', {writable: true});
      spyOn(sessionStorage, 'setItem').andCallFake(function(key, value){
        store[key] = value;
      });

      spyOn(sessionStorage, 'removeItem').andCallFake(function (key) {
        delete store[key];
      });
    });

    beforeEach(inject(function (_userStorageService_) {
      userStorageService = _userStorageService_;
    }));

    afterEach(function () {
      store = {};
    });

    it('session storage mock is working', function () {
      sessionStorage.setItem('ua-user', DEFAULT_USER);
      expect(store['ua-user']).toBe(DEFAULT_USER);
    });

    describe('storeUser', function () {

      it('exists', function () {
        expect(angular.isFunction(userStorageService.storeUser)).toBe(true);
      });

      it('persists the user to the session storage', function () {
        userStorageService.storeUser(DEFAULT_USER);

        expect(store['ua-user']).toBe(DEFAULT_USER);
      });

    });

    describe('retrieveUser', function () {

      it('exists', function () {
        expect(angular.isFunction(userStorageService.retrieveUser)).toBe(true);
      });

      it('retrieves the user from session storage', function () {
        store['ua-user'] = DEFAULT_USER;

        expect(userStorageService.retrieveUser()).toBe(DEFAULT_USER);
      });
    });

    describe('deleteUser', function () {

      it('exists', function () {
        expect(angular.isFunction(userStorageService.deleteUser)).toBe(true);
      });

      it('removes the user key/value from session storage', function () {
        store['ua-user'] = DEFAULT_USER;

        userStorageService.deleteUser();

        expect(store['ua-user']).toBeUndefined();
      });
    });
  });

}());
