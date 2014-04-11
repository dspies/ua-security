'use strict';

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