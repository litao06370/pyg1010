package com.pinyougou.sellergoods.service;

import java.util.List;
import java.util.Map;

import com.pinyougou.pojo.TbBrand;

import entity.PageResult;

public interface BrandService {

	public List<TbBrand> findAll();

	// 查找分页后的数据记录
	public PageResult findPage(int pageNum, int pageSize);

	// 添加
	public void add(TbBrand brand);

	// 修改(查找并修改)
	public TbBrand findOne(Long id);

	public void update(TbBrand brand);

	// 删除
	public void delete(Long[] ids);

	// 条件查询并分页
	public PageResult findPage(TbBrand brand, int pageNum, int pageSize);
	
	//返回下拉列表数据
	public List<Map> selectOptionList();
	
	
}
