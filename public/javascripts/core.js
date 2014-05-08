'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ngRoute',
  'nvd3ChartDirectives'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('Chart', ['$scope', function($scope) {

  }])
  .controller('DataForm', ['$scope', function($scope) {

  }])
  .controller('OptionForm', ['$scope', function($scope) {

  }]);

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]);

/* Services */

angular.module('myApp.services', []).
  value('version', '0.1');
