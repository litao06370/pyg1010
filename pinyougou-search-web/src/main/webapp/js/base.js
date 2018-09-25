//定义模块:
var app = angular.module("pinyougou", []);
//定义过滤器:(过滤器就类似于一个全局方法)
app.filter("trustHtml",["$sce",function ($sce) {
    return function (data) {//传入参数为需要被过滤的内容
        return $sce.trustAsHtml(data);//返回过滤之后的内容(信任html的转换)
    }
}]);