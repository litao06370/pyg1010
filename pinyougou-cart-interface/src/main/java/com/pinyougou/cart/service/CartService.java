package com.pinyougou.cart.service;

import com.pinyougou.pojogroup.Cart;

import java.util.List;

//购物车服务接口
public interface CartService {
    //添加商品到购物车
    //有一个购物车列表list作参数是因为:需要往已有的购物车列表中添加商品,并返回新的购物车
    //通过itemId可以查出商家ID,所以不需要再将商家ID也作为参数传进来
    public List<Cart> addGoodsToCartList(List<Cart> cartList,Long itemId, Integer num);

    //从redis中提取购物车
    public List<Cart> findCartListFromRedis(String username);


    //将购物车列表存入redis
    public void saveCartListToRedis(String username,List<Cart> cartList);

    //合并购物车
    public List<Cart> mergeCartList(List<Cart> cartList1,List<Cart> cartList2);


}
