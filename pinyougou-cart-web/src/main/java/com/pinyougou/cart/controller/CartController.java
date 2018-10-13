package com.pinyougou.cart.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSON;
import com.pinyougou.cart.service.CartService;
import com.pinyougou.pojogroup.Cart;
import entity.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
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
    @Reference(timeout = 6000)
    private CartService cartService;
    @Autowired
    private HttpServletResponse response;


    @RequestMapping("/addGoodsToCartList")
    public Result addGoodsToCartList(Long itemId, Integer num) {
        //当前登录账号用户名
        String name = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("当前用户:" + name);

        try {
            //1.提取购物车
            List<Cart> cartList = findCartList();
            //2.调用服务方法操作购物车
            cartList = cartService.addGoodsToCartList(cartList, itemId, num);
            if (name.equals("anonymousUser")) {//未登录
                //3.将新的购物车存入cookie中
                String cartListString = JSON.toJSONString(cartList);
                CookieUtil.setCookie(request,response,"cartList",cartListString,3600*24,"UTF-8");
                System.out.println("向cookie存入购物车");
            } else {//如果已登录,存入redis
                cartService.saveCartListToRedis(name,cartList);
                System.out.println("向redis存入购物车");
            }
            return new Result(true,"存入购物车成功");
        } catch (Exception e) {
            e.printStackTrace();
            return new Result(false,"存入购物车失败");
        }
    }


    @RequestMapping("/findCartList")
    public List<Cart> findCartList() {
        //当前登录账号用户名
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("当前用户:" + username);

        String cartListString = CookieUtil.getCookieValue(request, "cartList", "UTF-8");
        if (cartListString==null || cartListString.equals("")) {
            cartListString="[]";//设置为空,也可正常转换成jason数据
        }
        List<Cart> cartList_cookie = JSON.parseArray(cartListString, Cart.class);

        if (username.equals("anonymousUser")) {//如果未登录,从cookie中提取购物车
            System.out.println("从cookie中提取购物车");

            return cartList_cookie;

        } else {//如果已登录,从redis中提取购物车
            System.out.println("从redis中提取购物车");
            List<Cart> cartList_redis = cartService.findCartListFromRedis(username);
            if (cartList_cookie.size()>0) {
                List<Cart> cartList=cartService.mergeCartList(cartList_cookie,cartList_redis);//合并后的购物车
                cartService.saveCartListToRedis(username,cartList);//合并后的购物车存入缓存
                //清除本地购物车
                util.CookieUtil.deleteCookie(request,response,"cartList");
                System.out.println("执行了合并购物车");
                return cartList;
            }

            return cartList_redis;
        }
    }
}
