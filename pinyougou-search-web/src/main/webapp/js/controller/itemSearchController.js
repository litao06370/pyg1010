app.controller("searchController",function ($scope,searchService,$location) {
    //定义搜索对象的结构 category:商品类
    $scope.searchMap={"keywords":"","category":"","brand":"","spec":{},"price":"",
        "pageNo":1,"pageSize":40,"sort":"","sortField":""};




    //搜索
    $scope.search=function () {
        $scope.searchMap.pageNo = parseInt($scope.searchMap.pageNo);
        searchService.search($scope.searchMap).success(function (response) {
            $scope.resultMap=response;
            buildPageLabel();//构建分页栏
        });
    }

    //提出方法,便于阅读代码,此方法被调用即可//构件分页栏
    buildPageLabel=function () {
        $scope.pageLabel=[];
        var pageNo = $scope.searchMap.pageNo;
        var firstPage = 1;
        var lastPage = $scope.resultMap.totalPages;

        $scope.firstDot = false;
        $scope.lastDot = false;

        //总页数大于5时:
        if (lastPage>5) {
            if (pageNo<=3) {//当前页不大于3;显示前5页
                lastPage=5;
                $scope.lastDot = true;
            }else if (pageNo>=lastPage-2) {//当前页>=总页数-2;显示后5页
                firstPage=lastPage-4;
                $scope.firstDot = true;
            }else {//其他情况;首页=当前页-2,尾页=当前页+2'
                firstPage=pageNo-2;
                lastPage=pageNo+2;
                $scope.firstDot = true;
                $scope.lastDot = true;
            }
        }

        for (var i = firstPage; i <= lastPage; i++) {
            $scope.pageLabel.push(i);
        }
    }

    //添加搜索项,改变searchMap的值
    $scope.addSearchItem=function (key, value) {
        if (key=="category" || key=="brand" || key=="price") {//如果用户点击的是分类或品牌
            $scope.searchMap[key]=value;
        }else {//用户点击的是规格
            $scope.searchMap.spec[key]=value;
        }
        $scope.search();//查询
    }

    //撤销搜索项
    $scope.removeSearchItem=function (key) {
        if (key=="category" || key=="brand" || key=="price") {
            $scope.searchMap[key] = "";
        }else {
            delete $scope.searchMap.spec[key];//delete新方法,知识点
        }
        $scope.search();//查询
    }

    //分页查询
    $scope.queryByPage=function (page) {
        if (page<1 || page>$scope.resultMap.totalPages) {
            return;
        }
        $scope.searchMap.pageNo=page;
        $scope.search();
    }

    //判断当前页是否为第一页
    $scope.isTopPage=function () {
        if ($scope.searchMap.pageNo==1) {
            return true;
        }else {
            return false;
        }
    }
    //判断当前页是否为尾页
    $scope.isEndPage=function () {
        if ($scope.searchMap.pageNo==$scope.resultMap.totalPages) {
            return true;
        }else {
            return false;
        }
    }

    //排序查询
    $scope.sortSearch=function (sort, sortField) {
        $scope.searchMap.sort=sort;
        $scope.searchMap.sortField=sortField;
        $scope.search();
    }

    //判断搜索的关键字是否是品牌名称
    $scope.keywordsIsBrand=function () {
        for (var i = 0; i < $scope.resultMap.brandList.length; i++) {
            if ($scope.searchMap.keywords.indexOf($scope.resultMap.brandList[i].text) >= 0) {
                return true;
            }
        }
        return false;
    }

    //加载关键字
    $scope.loadKeywords=function () {
        $scope.searchMap.keywords=$location.search()["keywords"];
        $scope.search();
    }


});