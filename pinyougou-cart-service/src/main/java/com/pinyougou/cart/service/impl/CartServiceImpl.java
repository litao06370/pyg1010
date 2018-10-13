package com.pinyougou.cart.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.cart.service.CartService;
import com.pinyougou.mapper.TbItemMapper;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.pojo.TbOrderItem;
import com.pinyougou.pojogroup.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
@Service
public class CartServiceImpl implements CartService{
    @Autowired
    private TbItemMapper itemMapper;

    @Override
    public List<Cart> addGoodsToCartList(List<Cart> cartList, Long itemId, Integer num) {
        //1.根据SKUID查找SKU对象
        TbItem item = itemMapper.selectByPrimaryKey(itemId);
        if (item==null) {
            throw new RuntimeException("商品不存在");
        }
        if (!item.getStatus().equals("1")) {
            throw new RuntimeException("商品状态非法(可能已下架)");
        }

        //2.根据SKU对象查找商家ID
        String sellerId = item.getSellerId();

        //3.根据商家ID在已有的购物车列表中查找商家对象(是否存在)
        Cart cart = searchCartBySellerId(cartList, sellerId);
        if (cart == null) { //商家ID在购物车中不存在:购物车列表中新建商家购物车对象,可以直接用上面的cart变量,因为此时为null
            cart=new Cart();
            cart.setSellerId(sellerId);
            cart.setSellerName(item.getSeller());
            List<TbOrderItem> orderItemList = new ArrayList<TbOrderItem>();
            TbOrderItem orderItem = createOrderItem(item, num);//方法已被提取
            orderItemList.add(orderItem);
            cart.setOrderItemList(orderItemList);
            cartList.add(cart);//加入到大的购物车对象中去
        } else { //商家ID在购物车中已存在:查看该SKU商品是否存在
            TbOrderItem orderItem = searchOrderItemByItemId(cart.getOrderItemList(), itemId);
            //a.不存在:新建购物车明细对象,添加到orderItem中,更新总价
            if (orderItem==null) {
                orderItem = createOrderItem(item, num);
                cart.getOrderItemList().add(orderItem);
            }else {
                //b.已存在:修改数量,更新该SKU总价,更新购物车列表的总价
                orderItem.setNum(orderItem.getNum()+num);
                orderItem.setTotalFee(new BigDecimal(orderItem.getPrice().doubleValue()*orderItem.getNum()));
                //当明细的数量小于等于0,移除此明细
                if (orderItem.getNum()<=0) {
                    cart.getOrderItemList().remove(orderItem);
                }
                //当购物车对象的明细对象为0个时,移除此购物车对象
                if (cart.getOrderItemList().size()==0) {
                    cartList.remove(cart);
                }
            }
        }

        return cartList;
    }


    @Autowired
    private RedisTemplate redisTemplate;
    @Override
    public List<Cart> findCartListFromRedis(String username) {
        System.out.println("从redis中提取购物车"+username);
        List<Cart> cartList = (List<Cart>) redisTemplate.boundHashOps("cartList").get(username);
        if (cartList==null) {
            cartList = new ArrayList<>();
        }
        return cartList;
    }

    @Override
    public void saveCartListToRedis(String username, List<Cart> cartList) {
        System.out.println("向redis中存入购物车"+ username);
        redisTemplate.boundHashOps("cartList").put(username,cartList);
    }

    @Override
    public List<Cart> mergeCartList(List<Cart> cartList1, List<Cart> cartList2) {
        System.out.println("合并购物车");
        for(Cart cart: cartList2){
            for(TbOrderItem orderItem:cart.getOrderItemList()){
                cartList1= addGoodsToCartList(cartList1,orderItem.getItemId(),orderItem.getNum());
            }
        }
        return cartList1;
    }

    //提取方法:根据商家ID在已有的购物车列表中查找商家对象
    private Cart searchCartBySellerId(List<Cart> cartList,String sellerId) {
        for (Cart cart : cartList) {
            if (cart.getSellerId().equals(sellerId)) {
                return cart;
            }
        }
        return null;
    }

    //提取方法:新建购物车明细对象
    private TbOrderItem createOrderItem(TbItem item,Integer num) {
        TbOrderItem orderItem = new TbOrderItem();
        orderItem.setGoodsId(item.getGoodsId());
        orderItem.setItemId(item.getId());
        orderItem.setNum(num);
        orderItem.setPicPath(item.getImage());
        orderItem.setPrice(item.getPrice());
        orderItem.setSellerId(item.getSellerId());
        orderItem.setTitle(item.getTitle());
        orderItem.setTotalFee(new BigDecimal(item.getPrice().doubleValue()*num));
        return orderItem;
    }

    //提取方法:根据SKUID在购物车明细列表中查询购物车明细对象
    public TbOrderItem searchOrderItemByItemId(List<TbOrderItem> orderItemList,Long itemId) {
        for (TbOrderItem orderItem : orderItemList) {
            if (orderItem.getItemId().longValue()==itemId.longValue()) {
                return orderItem;
            }
        }
        return null;
    }


}
