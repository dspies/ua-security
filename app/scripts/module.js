angular.module('ua.security', [])
  .config(['$httpProvider', function ($httpProvider) {
    'use strict';

    //auth token interceptor
    $httpProvider.interceptors.push('authenticationInterceptor');
  }]);
