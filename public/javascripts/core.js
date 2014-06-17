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

}]).run([
    '$rootScope', 
    '$http', 
    '$cookies', 
    'requestStats',
    function($rootScope, $http, $cookies, requestStats) {

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
    
    var getStats = function(){
        if(!$rootScope.profile) return;
        
        var endMoment = moment().startOf('day');
        var startMoment = moment().startOf('day')
            .subtract('days', $rootScope.timeRange);
        var pastEndMoment = moment().startOf('day')
            .subtract('days', $rootScope.timeRange);
        var pastStartMoment = moment().startOf('day')
            .subtract('days', $rootScope.timeRange*2);
        var metrics = [
            'ga:sessions', 
            'ga:users', 
            'ga:bounceRate',
            'ga:pageviews',
            'ga:avgSessionDuration',
            'ga:percentNewSessions',
            'ga:pageviewsPerSession'
        ].join();

        //get current 
        requestStats([{
            start: pastStartMoment.format('YYYY-MM-DD'),
            end: pastEndMoment.format('YYYY-MM-DD'),
            profileId: 'ga:' + $rootScope.profile.id,
            metrics: metrics,
        },
        {
            start: startMoment.format('YYYY-MM-DD'),
            end: endMoment.format('YYYY-MM-DD'),
            profileId: 'ga:' + $rootScope.profile.id,
            metrics: metrics,
        }]).then(function(d){
            
            var prettyMap = { 
                'ga:sessions': 'Sessions',
                'ga:users': 'Users', 
                'ga:bounceRate': 'Bounce Rate',
                'ga:pageviews': 'Pageviews',
                'ga:avgSessionDuration': 'Average Session Duration',
                'ga:percentNewSessions': '% New Sessions',
                'ga:pageviewsPerSession': 'Pageviews per Session'
            };
            
            //current
            var metricArr = [];
            d.forEach(function(data, i){
                var dataKey = i === 1 ? 'current' : 'past';
                data.data.columnHeaders.forEach(function(header, i){
                    if(!metricArr[i]) metricArr.push({});
                    metricArr[i].header = header;
                    metricArr[i].header.display = prettyMap[header.name];
                    if(data.data.rows && data.data.rows[0]){
                        metricArr[i][dataKey] = data.data.rows[0][i];
                    }
                });     
            });
            
            metricArr = _.map(metricArr, function(metric){
                metric.changed = Math.round(((metric.current-metric.past)/metric.past)*100/1);
                return metric;
            });
             
            $rootScope.$broadcast('blockResponse', metricArr);
            
        });
        

    };

    
    //listeners
    $rootScope.$watch('timeRange', getStats);
    $rootScope.$watch('profile', getStats);

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
    .controller('Blocks', ['$scope', '$http', function($scope, $http) {
        $scope.$on('blockResponse', function(e, data){
            $scope.blocks = data;
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
    factory('requestStats', [
    '$http', 
    '$q', 
    function($http, $q){
        return function(options) {
            if(!options) return;   
            
            var promises = [];
            var optionsArr = angular.isArray(options) ? options : [options];
            optionsArr.forEach(function(opt){
                var params = {
                    'ids': opt.profileId,
                    'start-date': opt.start,
                    'end-date': opt.end,
                    'metrics': opt.metrics
                };
                
                var promise = $http.get('/api/analytics/data/ga/get', { params: params });
                promises.push(promise);
            });

            return $q.all(promises);
        };
    }]);
