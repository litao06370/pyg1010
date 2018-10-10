 //控制层 
app.controller('userController' ,function($scope,$controller   ,userService){	
	
    $scope.reg=function () {
        //比较2次密码是否一致
        if($scope.password!=$scope.entity.password) {
            alert("两次输入密码不一致,请重新输入~")
            $scope.password = "";
            $scope.entity.password = "";
            return;
        }
        //新增用户
        userService.add($scope.entity,$scope.smscode).success(function (response) {
            alert(response.message);
        });
    }
    
    $scope.sendCode=function () {
        if ($scope.entity.phone==null || $scope.entity.phone=="") {
            alert("请填写手机号");
            return;
        }
        userService.sendCode($scope.entity.phone).success(function (response) {
            alert(response.message);
        });
    }
    
});	
