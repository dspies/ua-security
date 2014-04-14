(function () {
  'use strict';

  describe('ua.security', function() {

    describe('module', function () {
      var module;

      beforeEach(function () {
        module = angular.module('ua.security');
      });

      it('is registered', function(){
        expect(module).not.toBeUndefined();
      });
    });

    describe('authentication interceptor', function () {

      var $httpProvider;

      beforeEach(module('ua.security', function (_$httpProvider_) {
        $httpProvider = _$httpProvider_;
      }));

      it('is registered', inject(function($http){
        //The $http is required in order to test the $httpProvider.  If you include it as a dependency, it must be
        // used because of jshint, so this test is 'required' in order to test the $httpProvider
        expect($http).not.toBeUndefined();
        expect($httpProvider.interceptors).toContain('authenticationInterceptor');
      }));
    });

  });

}());