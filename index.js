var app = angular.module('app', [])

app.controller('ctrlmaster', function($scope, $location, $http) {
    $scope.init = function(){
        console.log('in init')
        $scope.form_keyword = '';
        $scope.form_category = 'all';
        $scope.form_condition_new = false;
        $scope.form_condition_used = false;
        $scope.form_condition_unspecified = false;
        $scope.form_shipping_local = false;
        $scope.form_shipping_free = false;
        $scope.form_distance = '';
        $scope.form_from = 'location';
        $scope.form_zipcode = '';
    }

    $scope.url = location.host;
    $scope.items_list = [];

    
    $scope.search_keyword = function() {
        // console.log(this.form_keyword, this.form_category)
        // console.log($scope.form_condition_new, $scope.form_condition_used, $scope.form_condition_unspecified)
        // console.log($scope.form_shipping_local, $scope.form_shipping_free, $scope.form_distance)
        // console.log($scope.form_from, $scope.form_zipcode)
        // ajax to express.js
        $http({
            url: 'http://' + $scope.url + '/search_keyword',
            method: "GET",
            params:{
                keyword: $scope.form_keyword,
                categpry: $scope.form_category,
                new: $scope.form_condition_new,
                used: $scope.form_condition_used,
                unspecified: $scope.form_condition_unspecified,
                local: $scope.form_shipping_local,
                free: $scope.form_shipping_free,
                distance: $scope.form_distance,
                from: $scope.form_from,
                zipcode: $scope.form_zipcode
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.items_list = response.data;
            console.log($scope.items_list)
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    };

    $scope.search_item = function(){

    };


});

