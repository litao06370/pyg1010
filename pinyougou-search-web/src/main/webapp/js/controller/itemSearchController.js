app.controller("searchController",function ($scope,searchService) {
    //定义搜索对象的结构 category:商品类
    $scope.searchMap={"keywords":"","category":"","brand":"","spec":{}};




    //搜索
    $scope.search=function () {
        searchService.search($scope.searchMap).success(function (response) {
            $scope.resultMap=response;
        });
    }

    //添加搜索项,改变searchMap的值
    $scope.addSearchItem=function (key, value) {
        if (key=="category" || key=="brand") {//如果用户点击的是分类或品牌
            $scope.searchMap[key]=value;
        }else {//用户点击的是规格
            $scope.searchMap.spec[key]=value;
        }
        $scope.search();//查询
    }

    //撤销搜索项
    $scope.removeSearchItem=function (key) {
        if (key=="category" || key=="brand") {
            $scope.searchMap[key] = "";
        }else {
            delete $scope.searchMap.spec[key];//delete新方法,知识点
        }
        $scope.search();//查询
    }


});