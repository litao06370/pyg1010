package com.pinyougou.search.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.search.service.ItemSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service(timeout = 5000)
public class ItemSearchServiceImpl implements ItemSearchService {
    @Autowired
    private SolrTemplate solrTemplate;
    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public Map search(Map searchMap) {
        Map map = new HashMap();
        //空格处理
        if (searchMap.get("keywords")!=null) {
            String keywords = (String) searchMap.get("keywords");
            String replacedKeywords = keywords.replace(" ", "");
            searchMap.put("keywords", replacedKeywords);
        }

      /*  Query query = new SimpleQuery("*:*");
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);
        ScoredPage<TbItem> page = solrTemplate.queryForPage(query, TbItem.class);
        map.put("rows",page.getContent());*/
        //1.查询列表
        map.putAll(searchList(searchMap));
        //2.查询商品分类列表
        List<String> categoryList = searchCategoryList(searchMap);
        map.put("categoryList", categoryList);
        //3.查询品牌和规格列表
        String category = (String) searchMap.get("category");
        if (!"".equals(category)) {
            map.putAll(searchBrandAndSpecList(category));
        } else {
            if (categoryList.size() > 0) {
                map.putAll(searchBrandAndSpecList(categoryList.get(0)));
            }
        }


        return map;
    }

    @Override
    public void importList(List list) {
        solrTemplate.saveBeans(list);
        solrTemplate.commit();
    }

    @Override
    public void deleteByGoodsIds(List goodsIds) {
        Query query = new SimpleQuery("*:*");
        Criteria criteria = new Criteria("item_goodsid").in(goodsIds);
        query.addCriteria(criteria);
        solrTemplate.delete(query);
        solrTemplate.commit();
    }


    //提取方法,便于代码阅读,后期维护,理清思路
    private Map searchList(Map searchMap) {
        Map map = new HashMap();

        //高亮显示
        HighlightQuery query = new SimpleHighlightQuery();
        //构建高亮对象
        HighlightOptions highlightOptions = new HighlightOptions().addField("item_title");
        highlightOptions.setSimplePrefix("<em style='color:red'>");//前缀
        highlightOptions.setSimplePostfix("</em>");//后缀
        query.setHighlightOptions(highlightOptions);//为查询对象设置高亮选项
//        1.1关键字查询
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);
        //1.2按照商品分类过滤
        if (!"".equals(searchMap.get("category"))) {
            FilterQuery filterQuery = new SimpleFilterQuery();
            Criteria filterCriteria = new Criteria("item_category").is(searchMap.get("category"));
            filterQuery.addCriteria(filterCriteria);
            query.addFilterQuery(filterQuery);
        }
        //1.3按照品牌分类过滤
        if (!"".equals(searchMap.get("brand"))) {
            FilterQuery filterQuery = new SimpleFilterQuery();
            Criteria filterCriteria = new Criteria("item_brand").is(searchMap.get("brand"));
            filterQuery.addCriteria(filterCriteria);
            query.addFilterQuery(filterQuery);
        }
        //1.4按照规格过滤
        if (searchMap.get("spec") != null) {
            Map<String, String> specMap = (Map<String, String>) searchMap.get("spec");
            for (String key : specMap.keySet()) {
                FilterQuery filterQuery = new SimpleFilterQuery();
                Criteria filterCriteria = new Criteria("item_spec_" + key).is(specMap.get(key));
                filterQuery.addCriteria(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
        }
        //1.5按照价格筛选(非空判断后,编写代码)
        if (!"".equals(searchMap.get("price"))) {
            String[] price = ((String) (searchMap.get("price"))).split("-");
            if (!price[0].equals("0")) {
                Criteria filterCriteria = new Criteria("item_price").greaterThanEqual(price[0]);
                FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
            if (!price[1].equals("*")) {
                Criteria filterCriteria = new Criteria("item_price").lessThanEqual(price[1]);
                FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
        }
        //1.6分页查询(需要页码和每页显示条数 作为参数进行查询)
        Integer pageNo = (Integer) searchMap.get("pageNo");
        if (pageNo==null) {//若没有传入页码值,比如首次查询后的默认页,则赋值为第一页
            pageNo=1;
        }
        Integer pageSize = (Integer) searchMap.get("pageSize");
        if (pageSize==null) {//若没有传入每页显示记录条数,比如首次查询后的默认页,则赋值每页20条记录
            pageSize=20;
        }
        query.setOffset((pageNo - 1) * pageSize);//起始索引公式
        query.setRows(pageSize);//设置每页记录数
        //1.7排序(升序降序)
        String sortValue = (String) searchMap.get("sort");
        String sortField = (String) searchMap.get("sortField");
        if (sortValue!=null && sortValue!="") {
            if (sortValue.equals("ASC")) {
                Sort sort = new Sort(Sort.Direction.ASC,"item_"+sortField);
                query.addSort(sort);
            } else if (sortValue.equals("DESC")) {
                Sort sort = new Sort(Sort.Direction.DESC,"item_"+sortField);
                query.addSort(sort);
            }
        }




        //=========获取结果集========
        //返回高亮页对象
        HighlightPage<TbItem> page = solrTemplate.queryForHighlightPage(query, TbItem.class);
        List<HighlightEntry<TbItem>> entryList = page.getHighlighted();
        for (HighlightEntry<TbItem> entry : entryList) {
            List<HighlightEntry.Highlight> highlightList = entry.getHighlights();
           /* for (HighlightEntry.Highlight h : highlightList) {
                List<String> sns = h.getSnipplets();
                System.out.println(sns);
            }*/
            if (highlightList.size() > 0 && highlightList.get(0).getSnipplets().size() > 0) {
                TbItem item = entry.getEntity();
                String title = highlightList.get(0).getSnipplets().get(0);
                item.setTitle(title);
            }
        }
        map.put("rows", page.getContent());
        map.put("totalPages", page.getTotalPages());//总页数
        map.put("total",page.getTotalElements());//总记录条数
        return map;
    }

    //分组查询(查询商品分类列表)
    private List searchCategoryList(Map searchMap) {
        List<String> list = new ArrayList();
        Query query = new SimpleQuery("*:*");
        //根据关键字查询,相当于查询语句中的where语句
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);
        //设置分组的需求内容,类似于sql语句的 group by ...
        GroupOptions groupOptions = new GroupOptions().addGroupByField("item_category");
        query.setGroupOptions(groupOptions);
        //获取分组页(可包含多个下方的分组结果)
        GroupPage<TbItem> page = solrTemplate.queryForGroupPage(query, TbItem.class);
        //获取分组结果对象(在商法设置分组的时候可以有多个分组,在此处根据定义的不同组名来取各自的值)
        GroupResult<TbItem> groupResult = page.getGroupResult("item_category");
        //获取分组入口页
        Page<GroupEntry<TbItem>> groupEntries = groupResult.getGroupEntries();
        //获取分组入口集合
        List<GroupEntry<TbItem>> entryList = groupEntries.getContent();
        //遍历获取每一个入口结果
        for (GroupEntry<TbItem> entry : entryList) {
            list.add(entry.getGroupValue());
        }

        return list;
    }

    //查询品牌和规格列表
    private Map searchBrandAndSpecList(String category) {
        Map map = new HashMap();
        //1.根据商品分类名称获取模板ID
        Long templateID = (Long) redisTemplate.boundHashOps("itemCat").get(category);
        //为了容错,先进行非空判断
        if (templateID != null) {
            //2.根据模板ID获取品牌列表
            List brandList = (List) redisTemplate.boundHashOps("brandList").get(templateID);
            map.put("brandList", brandList);
            //3.根据模板ID获取规格列表
            List specList = (List) redisTemplate.boundHashOps("specList").get(templateID);
            map.put("specList", specList);
        }
        return map;
    }


}
