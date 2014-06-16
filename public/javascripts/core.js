'use strict';

// Declare app level module which depends on filters, and services
var mod = angular.module('GoogleAnalyticsDashboard', [
  'GoogleAnalyticsDashboard.filters',
  'GoogleAnalyticsDashboard.services',
  'GoogleAnalyticsDashboard.directives',
  'GoogleAnalyticsDashboard.controllers',
  'ngRoute',
  'ngCookies'
]).
config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/view1'});
}]).run(['$rootScope', '$http', function($rootScope, $http) {
    $rootScope.user = GAD.user;
    $rootScope.accounts = [];
    $rootScope.properties = [];
    $rootScope.profiles = [];
    $rootScope.timeRange = 7;
    if($rootScope.user){
        $http.get('/api/analytics/management/accountSummaries/list')
            .success(function(data){
                if(data.items && data.items.length){ 
                    $rootScope.accounts = data.items;
                    $rootScope.accounts.forEach(function(account){
                        account.webProperties.forEach(function(property){
                            $rootScope.properties.push(property);
                            if(property.profiles){
                                property.profiles.forEach(function(profile){
                                    $rootScope.profiles.push(profile);
                                });
                            }
                        });
                    });
                    if($rootScope.profiles.length && !$rootScope.profile){
                        $rootScope.profile = $rootScope.profiles[0];
                    }
                }
            });
    }
    
    var requestStats = function(){
        if(!$rootScope.profile) return;
        var defaultTimeRange = 7;
        var endMoment = moment().startOf('day');
        var startMoment = moment().startOf('day')
            .subtract('days', $rootScope.timeRange || defaultTimeRange);
        var params = {
            'ids': 'ga:' + $rootScope.profile.id,
            'start-date': startMoment.format('YYYY-MM-DD'),
            'end-date': endMoment.format('YYYY-MM-DD'),
            'metrics': 'ga:sessions,ga:users,ga:bounceRate'
        } 
        
        $http.get('/api/analytics/data/ga/get', { params: params })
            .success(function(data){
                console.log(data);
                if(data.columnHeaders 
                    && data.rows
                    && data.rows.length){
                    $rootScope.accountData = data;
                    $rootScope.accountData
                        .columnHeaders
                        .forEach(function(header, i){
                        console.log(header.name);
                        $rootScope.$broadcast(header.name, {
                            header: header,
                            data: $rootScope.accountData.rows[0][i]
                        });

                    });
                }
            });
    };

    
    $rootScope.$watch('timeRange', requestStats);
    $rootScope.$watch('profile', requestStats);

}]);
/* Controllers */
angular.module('GoogleAnalyticsDashboard.controllers', [])
    .controller('Navigation', ['$scope', '$cookieStore', function($scope, $cookieStore) {
        
        $scope.selectProfile = function(profile){
            $scope.$root.profile = profile;
            $cookieStore.put('profile', profile);     
        };
        
        $scope.pickTime = function(timeRange){
            $scope.$root.timeRange = timeRange;
            $cookieStore.put('timeRange', timeRange);     
        };
        
        //set profile and time range if one exists
        var cProfile = $cookieStore.get('profile');
        var cTimeRange = $cookieStore.get('timeRange');
        $scope.$root.timeRange = cTimeRange || $scope.$root.timeRange;
        $scope.$root.profile = cProfile || $scope.$root.profile;

    }])
  .controller('Dashboard', ['$scope', function($scope) {

  }])
  .controller('Controls', ['$scope', function($scope) {

  }])
  .controller('Components', ['$scope', function($scope) {

  }])
    .controller('UsersBlock', ['$scope', function($scope) {   
        $scope.$on('ga:users', function(e, data){
            $scope.number = data.data;
            console.log(data);
        });
    }])
  .controller('SessionBlock', ['$scope', '$http', function($scope, $http) {
        $scope.$on('ga:sessions', function(e, data){
            $scope.number = data.data;
            console.log(data);
        });

  }])
  .controller('BounceBlock', ['$scope', function($scope) {
        $scope.$on('ga:bounceRate', function(e, data){
            $scope.number = Math.round(data.data);
            console.log(data);
        });

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
