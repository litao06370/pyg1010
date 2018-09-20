 //控制层 
app.controller('goodsController' ,function($scope,$controller   ,goodsService , uploadService , itemCatService , typeTemplateService){
	
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

    $scope.entity={goods:{},goodsDesc:{itemImages:[],specificationItems:[]}};//定义页面实体结构
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
    
    //查询一级分类商品列表
    $scope.selectItemCat1List=function () {
        itemCatService.findByParentId(0).success(function (response) {
            $scope.itemCat1List=response;
        });
    }

    //二级目录随一级目录的ID(即为二级目录的parentId)改变而改变
    $scope.$watch("entity.goods.category1Id",function (newValue, oldValue) {
        // alert(newValue);
        itemCatService.findByParentId(newValue).success(function (response) {
            $scope.itemCat2List=response;
        });
    });

    //三级目录随二级目录的ID(即为三级目录的parentId)改变而改变
    $scope.$watch("entity.goods.category2Id",function (newValue, oldValue) {
        // alert(newValue);
        itemCatService.findByParentId(newValue).success(function (response) {
            $scope.itemCat3List=response;
        });
    });

    //读取模板ID
    $scope.$watch("entity.goods.category3Id",function (newValue, oldValue) {
        itemCatService.findOne(newValue).success(function (response) {
            $scope.entity.goods.typeTemplateId=response.typeId;
        });
    });

    //监控模板ID,获取品牌列表,扩展属性,规格列表等
    $scope.$watch("entity.goods.typeTemplateId",function (newValue, oldValue) {
        typeTemplateService.findOne(newValue).success(function (response) {
            $scope.typeTemplate=response;
            // alert(response.brandIds);//弹窗测试数据是否已获取
            $scope.typeTemplate.brandIds = JSON.parse($scope.typeTemplate.brandIds);
            $scope.entity.goodsDesc.customAttributeItems=JSON.parse( $scope.typeTemplate.customAttributeItems);//扩展属性
        });
        //读取规格
        typeTemplateService.findSpecList(newValue).success(function (response) {
            $scope.specList=response;
        });

    });


    $scope.updateSpecAttribute=function ($event,name,value) {
        var object = $scope.searchObjectByKey($scope.entity.goodsDesc.specificationItems,"attributeName",name);
        if (object!=null) {
            if($event.target.checked ){
                object.attributeValue.push(value);
            }else {//取消勾选
                object.attributeValue.splice(object.attributeValue.indexOf(value), 1);//移除选项
                //如果选项都取消了，将此条记录移除
                if (object.attributeValue.length == 0) {
                    $scope.entity.goodsDesc.specificationItems.splice(
                        $scope.entity.goodsDesc.specificationItems.indexOf(object), 1);
                }
            }
        }else {
            $scope.entity.goodsDesc.specificationItems.push({"attributeName":name,"attributeValue":[value]});
        }
    }




});	
