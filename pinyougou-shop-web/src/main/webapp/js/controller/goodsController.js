 //控制层 
app.controller('goodsController' ,function($scope,$controller,$location ,goodsService , uploadService , itemCatService , typeTemplateService){
	
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
	
	//查询实体 (共用查询和修改页面)
	$scope.findOne=function(){
	    var id = $location.search()['id'];//$location.search() 获取的是一个数组
        if (id==null) {
            return;
        }
		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;
				editor.html($scope.entity.goodsDesc.introduction);//商品介绍(富文本内容)
                $scope.entity.goodsDesc.itemImages=JSON.parse($scope.entity.goodsDesc.itemImages);//商品图片
                $scope.entity.goodsDesc.customAttributeItems=JSON.parse($scope.entity.goodsDesc.customAttributeItems);//扩展属性
                $scope.entity.goodsDesc.specificationItems= JSON.parse($scope.entity.goodsDesc.specificationItems);//规格选择
                //转换SKU列表中的规格对象
                for( var i=0;i<$scope.entity.itemList.length;i++ ){
                    $scope.entity.itemList[i].spec = JSON.parse( $scope.entity.itemList[i].spec);
                }
            }
		);				
	}

    $scope.entity={goods:{},goodsDesc:{itemImages:[],specificationItems:[]}};//定义页面实体结构

    //保存
    $scope.save=function(){
        $scope.entity.goodsDesc.introduction=editor.html();

        var serviceObject;//服务层对象
        if($scope.entity.goods.id!=null){//如果有ID
            serviceObject=goodsService.update( $scope.entity ); //修改
        }else{
            serviceObject=goodsService.add( $scope.entity  );//增加
        }
        serviceObject.success(
            function(response){
                if(response.success){
                    alert("保存成功");
                    location.href='goods.html';

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
            if ($location.search()["id"]==null) {
                $scope.entity.goodsDesc.customAttributeItems=JSON.parse( $scope.typeTemplate.customAttributeItems);//扩展属性
            }

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

    //创建SKU列表
    $scope.createItemList=function () {
        $scope.entity.itemList=[{spec:{},price:0,num:9999,status:"0",isDefault:"0"}];//类表初始化
        var items = $scope.entity.goodsDesc.specificationItems;//这是放置在上一行的spec{}里面的数据
        for(var i= 0;i<items.length;i++) {
            $scope.entity.itemList = addColumn($scope.entity.itemList,items[i].attributeName,items[i].attributeValue);
        }
    }

    addColumn=function (list, columnName, columnValues) {//深克隆,遍历添加新数据
        var newList=[];
        for(var i = 0; i<list.length; i++) {
            var oldRow = list[i];
            for(var j = 0; j<columnValues.length; j++) {
                var newRow = JSON.parse(JSON.stringify(oldRow));//深克隆
                newRow.spec[columnName] = columnValues[j];//主要是获取这个数据
                newList.push(newRow);
            }
        }
        return newList;
    }

    $scope.status=["未审核","已审核","审核未通过","已关闭"];

    $scope.itemCatList=[];//商品分类列表
    $scope.findItemCatList=function () {//查询商品分类列表
        itemCatService.findAll().success(function (response) {
            for (var i = 0; i <response.length; i++) {
                $scope.itemCatList[response[i].id]=response[i].name;
            }
        });
    }

    $scope.checkAttributeValue=function (specName, optionName) {
        var items = $scope.entity.goodsDesc.specificationItems;
        var object = $scope.searchObjectByKey(items,"attributeName",specName);
        if (object!=null) {
            if (object.attributeValue.indexOf(optionName)>=0) {
                return true;
            }else {
                return false;
            }
        }else {
            return false;
        }
    }


});	
