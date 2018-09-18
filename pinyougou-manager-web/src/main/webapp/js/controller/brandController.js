app.controller("brandController", function($scope, $controller, $http, brandService) {
	
	//伪继承(不是继承,而是通过scope的通用性传递scope达到继承的效果)
	$controller("baseController",{$scope:$scope});
	
	$scope.findAll = function() {
		brandService.findAll.success(function(response) {
			$scope.list = response;
		});
	};

	// 查找
	$scope.findPage = function(page, size) {
		brandService.findPage(page, size).success(function(response) {
			$scope.list = response.rows;
			$scope.paginationConf.totalItems = response.total;
		});
	};

	// 新增
	$scope.save = function() {
		var object = null;
		if ($scope.entity.id != null) {
			object = brandService.update($scope.entity);
		} else {
			object = brandService.add($scope.entity);
		}
		object.success(function(response) {
			if (response.success) {
				$scope.reloadList();
			} else {
				alert(response.message);
			}
		});
	};
	// 查询实体
	$scope.findOne = function(id) {
		brandService.findOne(id).success(function(response) {
			$scope.entity = response;
		});
	};

	// 删除(delete是关键字,尽量避免用作方法名)
	$scope.dele = function() {
		brandService.dele($scope.selectIds).success(function(response) {
			if (response.success) {
				$scope.reloadList();// 刷新页面
			} else {
				alert(response.message);
			}
		});
	};

	$scope.searchEntity = {};
	// 条件查询
	$scope.search = function(page, rows) {
		brandService.search(page, rows, $scope.searchEntity).success(
				function(response) {
					$scope.list = response.rows;
					$scope.paginationConf.totalItems = response.total;
				});
	}
});