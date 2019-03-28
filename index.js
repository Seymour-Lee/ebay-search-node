var app = angular.module('app', [])

app.controller('ctrlmaster', function($scope, $location, $http) {
    $scope.init = function(){
        console.log('in init')
        $scope.form_keyword = 'iphone 6';
        $scope.form_category = 'all';
        $scope.form_condition_new = false;
        $scope.form_condition_used = false;
        $scope.form_condition_unspecified = false;
        $scope.form_shipping_local = false;
        $scope.form_shipping_free = false;
        $scope.form_distance = '1000';
        $scope.form_from = 'location';
        $scope.form_zipcode = '90007';
    }

    $scope.url = location.host;
    $scope.items_list = [];
    $scope.curpage_list = [];
    $scope.page_range = [];
    $scope.page_number = 0;
    $scope.page_curnum = -1;
    // for(var i = 1; i <= $scope.page_number; i++) $scope.page_range.push(i);

    $scope.item_detail = undefined;
    
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
            $scope.page_number = Math.ceil((response.data.length)/10);
            $scope.page_curnum = 1;
            for(var i = 1; i <= $scope.page_number; i++) $scope.page_range.push(i);
            console.log($scope.items_list);
            console.log($scope.page_number, $scope.page_curnum);
            $scope.update_result_page(1);
            // $(function () {
            //     $('#result_table').bootstrapTable({
            //         data: response.data
            //     });
            // });
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    };

    // input is new page number
    $scope.update_result_page = function(page){
        // unactive cur page number button
        // update value of curpage_num;
        // active cur page number button
        $scope.page_curnum = page;
        $scope.curpage_list = [];
        for(var i = (page-1)*10; i <= page*10-1 && i < $scope.items_list.length; i++){
            $scope.curpage_list.push($scope.items_list[i]);
        }
    }

    $scope.show_item_detail = function(item_id){
        console.log(item_id);
        $http({
            url: 'http://' + $scope.url + '/search_item',
            method: "GET",
            params:{
                id: item_id,
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.item_detail = response.data;
            console.log($scope.item_detail);
            // display item details in a table
            











        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    $scope.row_clicked = function(){
        console.log('row clicked')
    }

    $scope.search_item = function(){

    };


});

// function image_formatter(value){
//     return '<img src="' + value + '">';
// }

// function wishlist_formatter(value){
//     return '<i class="mdi mdi-add-shopping-cart mdi-2x"></i>';
// }

// (function() {
//     'use strict';
//     window.addEventListener('load', function() {
//         // Fetch all the forms we want to apply custom Bootstrap validation styles to
//         var forms = document.getElementsByClassName('needs-validation');
//         // Loop over them and prevent submission
//         var validation = Array.prototype.filter.call(forms, function(form) {
//             form.addEventListener('submit', function(event) {
//             if (form.checkValidity() === false) {
//                 event.preventDefault();
//                 event.stopPropagation();
//             }
//             form.classList.add('was-validated');
//             }, false);
//         });
//     }, false);
// })();

$("[data-toggle='tooltip']").tooltip();
