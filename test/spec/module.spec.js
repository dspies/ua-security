(function () {
  'use strict';

  describe('Testing modules', function() {

    describe('ua.security', function () {
      var module;

      beforeEach(function () {
        module = angular.module('ua.security');
      });

      it('should be registered', function(){
        expect(module).not.toBeUndefined();
      });
    });
  });
  
}());