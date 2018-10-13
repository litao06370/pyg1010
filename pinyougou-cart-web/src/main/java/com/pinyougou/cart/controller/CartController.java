package com.pinyougou.cart.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSON;
import com.pinyougou.cart.service.CartService;
import com.pinyougou.pojogroup.Cart;
import entity.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import util.CookieUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {
    @Autowired
    private HttpServletRequest request;
    @Reference
    private CartService cartService;
    @Autowired
    private HttpServletResponse response;


    @RequestMapping("/addGoodsToCartList")
    public Result addGoodsToCartList(Long itemId, Integer num) {
        try {
            //1.从cookie中提取购物车
            List<Cart> cartList = findCartList();
            //2.调用服务方法操作购物车
            cartList = cartService.addGoodsToCartList(cartList, itemId, num);
            String cartListString = JSON.toJSONString(cartList);
            //3.将新的购物车存入cookie中
            CookieUtil.setCookie(request,response,"cartList",cartListString,3600*24,"UTF-8");
            return new Result(true,"存入购物车成功");

        } catch (Exception e) {
            e.printStackTrace();
            return new Result(false,"存入购物车失败");
        }

    }

    //从cookie中提取购物车
    @RequestMapping("/findCartList")
    public List<Cart> findCartList() {
        String cartListString = CookieUtil.getCookieValue(request, "cartList", "UTF-8");
        if (cartListString==null || cartListString.equals("")) {
            cartListString="[]";//设置为空,也可正常转换成jason数据
        }
        List<Cart> cartList_cookie = JSON.parseArray(cartListString, Cart.class);
        return cartList_cookie;
    }
}
