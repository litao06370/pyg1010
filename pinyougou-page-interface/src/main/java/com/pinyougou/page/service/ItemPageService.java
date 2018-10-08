package com.pinyougou.page.service;
//生成商品详细页
public interface ItemPageService {
    public boolean genItemHtml(Long goodsId);

//删除商品详细页
    public boolean deleteItemHtml(Long[] goodsIds);
}
