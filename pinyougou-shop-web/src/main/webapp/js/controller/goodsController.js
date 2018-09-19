 //控制层 
app.controller('goodsController' ,function($scope,$controller   ,goodsService , uploadService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	}    
	
	//分页
	$scope.findPage=function(page,rows){			
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}
	
	//查询实体 
	$scope.findOne=function(id){				
		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;					
			}
		);				
	}

    $scope.entity={goods:{},goodsDesc:{itemImages:[]}};//定义页面实体结构
    //(保存)->增加商品
    $scope.add=function(){
        $scope.entity.goodsDesc.introduction = editor.html();
        goodsService.add( $scope.entity  ).success(
            function(response){
                if(response.success){
                    alert("新增成功");
                    $scope.entity = {};//清空数据,便于下个内容重新添加
                    editor.html("");
                }else{
                    alert(response.message);
                }
            }
        );
    }
	
	 
	//批量删除 
	$scope.dele=function(){			
		//获取选中的复选框			
		goodsService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
					$scope.selectIds=[];
				}						
			}		
		);				
	}
	
	$scope.searchEntity={};//定义搜索对象 
	
	//搜索
	$scope.search=function(page,rows){			
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}

	//上传文件
    $scope.uploadFile=function () {
        uploadService.uploadFile().success(function (response) {
            if (response.success) {
                $scope.image_entity.url=response.message;
            }else {
                alert(response.message);
            }
        });
    }
    
    //添加上传的图片实体到(图片列表)集合中
    $scope.add_image_entity=function () {
        $scope.entity.goodsDesc.itemImages.push($scope.image_entity);
    }

    //移出图片
    $scope.remove_image_entity=function (index) {
        $scope.entity.goodsDesc.itemImages.splice(index,1);
    }
});	
