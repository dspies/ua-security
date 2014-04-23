'use strict';

angular.module('ua.security')
  .provider('userStorageService', function () {

    function UserStorageService($window){
      this.storeUser = function (user) {
        $window.sessionStorage.setItem('ua-user', JSON.stringify(user));
      };

      this.retrieveUser = function () {
        var user = $window.sessionStorage.getItem('ua-user');

        return user ? JSON.parse(user) : undefined;
      };

      this.deleteUser = function(){
        $window.sessionStorage.removeItem('ua-user');
      };
    }

    this.$get = ['$window', function($window){
      return new UserStorageService($window);
    }];

  });