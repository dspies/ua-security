angular.module('ua.security', [])
  .config(['$httpProvider', function ($httpProvider) {
    'use strict';

    $httpProvider.interceptors.push('authenticationInterceptor');
  }]);