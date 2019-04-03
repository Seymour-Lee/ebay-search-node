var app = angular.module('app', ['ngAnimate', 'angular-svg-round-progressbar', 'ngMaterial', 'tooltips'])

app.controller('ctrlmaster', function($scope, $location, $http, $timeout) {
    $scope.init = function(){
        // console.log('in init')
        $scope.form_keyword = 'pixel';
        $scope.form_category = 'all';
        $scope.form_condition_new = false;
        $scope.form_condition_used = false;
        $scope.form_condition_unspecified = false;
        $scope.form_shipping_local = false;
        $scope.form_shipping_free = false;
        $scope.form_distance = '1000';
        $scope.form_from = 'location';
        $scope.form_local_zipcode = '90007';
        $scope.form_zipcode = '';
        $scope.get_local_ip();
    }

    $scope.status_code = {
        
    };

    $scope.url = location.host;
    // console.log('$scope.url is ', $scope.url)
    $scope.items_list = [];
    $scope.items_id2obj = {};
    $scope.curpage_list = [];
    $scope.page_range = [];
    $scope.page_number = 0;
    $scope.page_curnum = -1;
    // for(var i = 1; i <= $scope.page_number; i++) $scope.page_range.push(i);

    $scope.item_detail_product = undefined;
    $scope.item_detail_photos = undefined;
    $scope.item_detail_shipping = undefined;
    $scope.item_detail_seller = undefined;
    $scope.item_detail_similar_origin = undefined;
    $scope.item_detail_similar_show = undefined;

    $scope.order_refer = 'default';
    $scope.order = 'ascending'

    $scope.last_detail_item = "-1";
    $scope.set_selected = function(item_id){
        $scope.last_detail_item = item_id;
    }

    $scope.get_local_ip = function(){
        $http({
            url: 'http://ip-api.com/json',
            method: "GET",
        }).then(function successCallback(response) {
            $scope.form_local_zipcode = response.data.zip;
            // console.log($scope.form_local_zipcode);
        }, function errorCallback(response) {
            $scope.form_local_zipcode = '90007'
        });
    }
    
    $scope.search_keyword = function() {
        // console.log(this.form_keyword, this.form_category)
        // console.log($scope.form_condition_new, $scope.form_condition_used, $scope.form_condition_unspecified)
        // console.log($scope.form_shipping_local, $scope.form_shipping_free, $scope.form_distance)
        // console.log($scope.form_from, $scope.form_zipcode)
        // ajax to express.js
        $scope.result_div_godown();
        $scope.norecord_div_godown();
        $scope.search_bar_showup();
        $scope.items_list = [];
        $scope.items_id2obj = {};
        $scope.curpage_list = [];
        $scope.page_range = [];
        $scope.page_number = 0;
        $scope.page_curnum = -1;

        $scope.show_detail = false;
        $scope.show_result = true;
        $scope.show_bar = false;

        $scope.last_detail_item = "-1";
        // console.log($scope.form_from == 'location'? $scope.form_local_zipcode: $scope.form_zipcode)
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
                zipcode: ($scope.form_from == 'location'? $scope.form_local_zipcode: $scope.form_zipcode)
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.items_list = response.data;
            $scope.items_id2obj = {};
            for(var i = 0; i < $scope.items_list.length; i++){
                $scope.items_id2obj[$scope.items_list[i].id] = $scope.items_list[i];
            }
            $scope.page_number = Math.ceil((response.data.length)/10);
            $scope.page_curnum = 1;
            for(var i = 1; i <= $scope.page_number; i++) $scope.page_range.push(i);
            // console.log($scope.items_list);
            // console.log($scope.page_number, $scope.page_curnum);
            $scope.update_result_page(1);
            $scope.search_bar_godown();
            // $(function () {
            //     $('#result_table').bootstrapTable({
            //         data: response.data
            //     });
            // });
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.search_bar_godown();
            
        });

    };

    $scope.show_search_bar = false;
    $scope.search_bar_showup = function(){
        $scope.show_search_bar = true;
    }
    $scope.search_bar_godown = function(){
        $timeout( function(){
            // console.log("Aloha World!");
            $scope.show_search_bar = false;
            // show that div
            if($scope.items_list.length == 0) $scope.norecord_div_showup();
            else $scope.result_div_showup();
        }, 500);
    }

    $scope.show_result_div = false;
    $scope.result_div_showup = function(){
        $scope.show_result_div = true;
    }
    $scope.result_div_godown = function(){
        $scope.show_result_div = false;
    }

    $scope.show_norecord_div = false;
    $scope.norecord_div_showup = function(){
        $scope.show_norecord_div = true;
    }
    $scope.norecord_div_godown = function(){
        $scope.show_norecord_div = false;
    }


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
        // console.log(item_id);
        $http({
            url: 'http://' + $scope.url + '/search_item',
            method: "GET",
            params:{
                id: item_id,
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(response.data);
            var data = response.data;
            $scope.item_detail_product = data.product;
            $scope.item_detail_shipping = data.shipping;
            $scope.item_detail_seller = data.seller;
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    $scope.search_similar = function(item_id){
        // console.log('in search_similar');
        $http({
            url: 'http://' + $scope.url + '/search_similar',
            method: "GET",
            params:{
                id: item_id,
            }
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.item_detail_similar_origin = response.data;
            $scope.item_detail_similar_show = JSON.parse(JSON.stringify(($scope.item_detail_similar_origin.length > 5? 
                                               $scope.item_detail_similar_origin.slice(0, 5): 
                                               $scope.item_detail_similar_origin)));
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    // $scope.propertyName = '';
    // $scope.reverse = false;
    // $scope.sortBy = function(propertyName) {
    //     console.log(propertyName);
    //     $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
    //     $scope.propertyName = propertyName;
    // };

    $scope.cmp_name_asc = function(a, b){
        return a.name > b.name;
    }
    $scope.cmp_name_des = function(a, b){
        return a.name < b.name;
    }

    $scope.cmp_days_asc = function(a, b){
        return parseInt(a.days) > parseInt(b.days); 
    }
    $scope.cmp_days_des = function(a, b){
        return parseInt(a.days) < parseInt(b.days); 
    }

    $scope.cmp_price_asc = function(a, b){
        return parseFloat(a.price.slice(1)) > parseFloat(b.price.slice(1)); 
    }
    $scope.cmp_price_des = function(a, b){
        return parseFloat(a.price.slice(1)) < parseFloat(b.price.slice(1)); 
    }

    $scope.cmp_cost_asc = function(a, b){
        return parseFloat(a.shipping.slice(1)) > parseFloat(b.shipping.slice(1)); 
    }
    $scope.cmp_cost_des = function(a, b){
        return parseFloat(a.shipping.slice(1)) < parseFloat(b.shipping.slice(1));
    }


    $scope.sort_similar = function(){
        console.log($scope.order_refer, $scope.order);
        // 
        if($scope.order_refer == 'default'){
            $scope.item_detail_similar_show = JSON.parse(JSON.stringify($scope.item_detail_similar_origin.slice(0, $scope.item_detail_similar_show.length)));
        }
        else{
            if($scope.order == 'ascending'){
                if($scope.order_refer == 'name') $scope.item_detail_similar_show.sort($scope.cmp_name_asc);
                if($scope.order_refer == 'days') $scope.item_detail_similar_show.sort($scope.cmp_days_asc);
                if($scope.order_refer == 'price') $scope.item_detail_similar_show.sort($scope.cmp_price_asc);
                if($scope.order_refer == 'cost') $scope.item_detail_similar_show.sort($scope.cmp_cost_asc);
            }
            else{
                if($scope.order_refer == 'name') $scope.item_detail_similar_show.sort($scope.cmp_name_des);
                if($scope.order_refer == 'days') $scope.item_detail_similar_show.sort($scope.cmp_days_des);
                if($scope.order_refer == 'price') $scope.item_detail_similar_show.sort($scope.cmp_price_des);
                if($scope.order_refer == 'cost') $scope.item_detail_similar_show.sort($scope.cmp_cost_des);
            }
        }
    }

    $scope.similar_show_more = function(){
        $scope.item_detail_similar_show = JSON.parse(JSON.stringify($scope.item_detail_similar_origin));
        $scope.sort_similar();
    }

    $scope.similar_show_less = function(){
        $scope.item_detail_similar_show = JSON.parse(JSON.stringify($scope.item_detail_similar_origin.slice(0, 5)));
        $scope.sort_similar();
    }

    $scope.search_photos = function(item_title){
        // console.log('in search_photos, title is '+item_title);
        $http({
            url: 'http://' + $scope.url + '/search_photos',
            method: "GET",
            params:{
                title: item_title,
            }
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.item_detail_photos = response.data;
            console.log($scope.item_detail_photos);
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    $scope.postalcodes = [];
    $scope.postalcode = function(val){
        // console.log(val);
        $scope.form_zipcode = val;
        return $http({
            url: 'http://' + $scope.url + '/postalcode',
            method: "GET",
            params:{
                code: val,
            }
        }).then(function successCallback(response) {
            $scope.postalcodes = response.data;
            // console.log($scope.postalcodes);
            return $scope.postalcodes;
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    $scope.facebook_share = function(){
        console.log('facebook share');
        FB.ui({
            method: 'share',
            display: 'popup',
            quote: 'Buy ' + $scope.item_detail_product.title + ' at ' + $scope.item_detail_product.price + ' from link blow',
            href: $scope.item_detail_product.natureserchurl,
        }, function(response){});
    };

    if (localStorage.getItem("csci551_wishlist") === null) {
        localStorage.setItem("csci551_wishlist", "{}");
    }
    $scope.wishlist = JSON.parse(localStorage.getItem("csci551_wishlist"));
    $scope.cal_wishlist_price = function(){
        $scope.wishlist_total_price = 0.0;
        for(var key in $scope.wishlist){
            var price = $scope.wishlist[key].price.slice(1);
            $scope.wishlist_total_price += parseFloat(price)
        }
        $scope.wishlist_total_price = $scope.wishlist_total_price.toFixed(2);
    }
    $scope.wishlist_total_price = 0.0;
    $scope.cal_wishlist_price();
    // console.log($scope.wishlist)
    // console.log($scope.wishlist_total_price)
    $scope.op_wishlist = function(item_id){
        if($scope.wishlist.hasOwnProperty(item_id)){
            $scope.remove_wishlist(item_id);
        }
        else{
            $scope.add_wishlist(item_id);
        }
    }
    $scope.add_wishlist = function(item_id){
        // console.log('add wish list', item_id)
        $scope.wishlist[item_id] = $scope.items_id2obj[item_id];
        // console.log($scope.wishlist)
        $scope.cal_wishlist_price();
        $scope.write_localstorage();
        
    }

    $scope.remove_wishlist = function(item_id){
        // console.log('remove wish list', item_id)
        delete $scope.wishlist[item_id];
        // console.log($scope.wishlist);
        $scope.cal_wishlist_price();
        $scope.write_localstorage();
        // $scope.delay = false;
        // $timeout(function(){
        //     $scope.delay = true;
        // }, 250);
    }

    $scope.write_localstorage = function(){
        localStorage.setItem("csci551_wishlist", JSON.stringify($scope.wishlist));
    }

    $scope.show_detail = false;
    $scope.show_result = true;
    $scope.show_bar = false;
    $scope.result_move_right = function(){
        $scope.show_result = false;
        $scope.show_bar = true;
    }

    $scope.detail_showup = function(){
        // set timeout
        // 0.5 seconds delay
        $timeout( function(){
            // console.log("Hello World!");
            $scope.show_bar = false;
            $scope.show_detail = true;
        }, 500);
        
    }

    $scope.detail_move_right = function(){
        $scope.show_detail = false;
        $scope.show_bar = true;
    }

    $scope.result_showup = function(){
        // set timeout
        // 0.5 seconds delay
        $timeout( function(){
            // console.log("Aloha World!");
            $scope.show_bar = false;
            $scope.show_result = true;
        }, 500);
        
    }


    $scope.direction = "right";
    $scope.switch_slide = function(){
        console.log('in switch_slide()', $scope.show_detail)
        $scope.show_detail = !$scope.show_detail;
        // $scope.direction = ($scope.direction == 'right'? 'left': 'right')
    }

    $scope.row_clicked = function(){
        console.log('row clicked', $scope.form_keyword)
    }

});


$("[data-toggle='tooltip']").tooltip();

window.fbAsyncInit = function(){
    FB.init({
        appId: '316200389071168',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v3.2',
    });
};
