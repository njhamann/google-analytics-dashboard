'use strict';

// Declare app level module which depends on filters, and services
angular.module('GoogleAnalyticsDashboard', [
  'GoogleAnalyticsDashboard.filters',
  'GoogleAnalyticsDashboard.services',
  'GoogleAnalyticsDashboard.directives',
  'GoogleAnalyticsDashboard.controllers',
  'ngRoute'
]).
config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/view1'});
}]).run(['$rootScope', '$http', function($rootScope, $http) {
    $rootScope.user = GAD.user;
    if($rootScope.user){
        $http.get('/api/analytics/management/accountSummaries/list')
            .success(function(data){
                if(data.items) $rootScope.accounts = data.items;
            });
        //account
        //property
        //view

        //this works
        /*
        var params = {
            'ids': 'ga:44967999',
            'start-date': '2014-06-01',
            'end-date': '2014-06-12',
            'metrics': 'ga:sessions,ga:bounces',
            'dimensions': 'ga:source,ga:keyword,ga:date',
            'sort': '-ga:sessions,ga:source',
            'max-results': 25
        } 
        
        $http.get('/api/analytics/data/ga/get', { params: params })
            .success(function(data){
                $rootScope.metric = data;
            });
        */
    }

}]);

/* Controllers */
angular.module('GoogleAnalyticsDashboard.controllers', [])
  .controller('Navigation', ['$scope', function($scope) {

  }])
  .controller('Dashboard', ['$scope', function($scope) {

  }])
  .controller('Controls', ['$scope', function($scope) {

  }])
  .controller('Components', ['$scope', function($scope) {

  }])
  .controller('LoadingScreen', ['$scope', function($scope) {

  }])
  .controller('LoginModal', ['$scope', function($scope) {

  }]);

/* Directives */
angular.module('GoogleAnalyticsDashboard.directives', []).
  directive('autoOpen', function() {
    return function(scope, elm, attrs) {
        if(!scope.$root.user){
            $(elm).modal('show');
        }
    };
  });

/* Filters */
angular.module('GoogleAnalyticsDashboard.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]);

/* Services */
angular.module('GoogleAnalyticsDashboard.services', []).
  value('version', '0.1');
