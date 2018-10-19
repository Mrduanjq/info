var vue = new Vue({
  el: '#app',
  data: {
    countryQuery: false, // 国家地区筛选
    categoryQuery: false, // 商品分类查询
    timeQuery: true, // 上架时间查询
    priceQuery: false, // 价格查询
    showCountry: false,  // 是否显示国家列表
    showClass: false,    // 是否显示商品列表
    countryList: [],       // 国家列表
    classList: [],         // 分类列表
    proList: [],           // 产品列表
    type: 1,               // 产品类型 1全部 2热点
    countryId: '',          // 国家id值 0 代表全部
    proClass: '',          // 产品类别
    priceOrder: null,         // 价格排序 0正序 1逆序
    timeOrder: 1,          // 时间排序 0正序 1逆序
    pageSize: 50,
    pageStart: 0
  },
  created: function() {
    this.getProList();
    this.getCountryList();
    this.getClassList();
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    // 获取产品列表
    getProList: function() {
      var self = this;
      var url = SHOP_INTF + 'product/getProductList';
      var params = {
        ts: +new Date(),
        type: this.type,
        pageStart: this.pageStart,
        pageSize: this.pageSize,
        keyword: decodeURI(ZB_Util.getParam('keyword'))
      }
      if (this.countryQuery)
        params.city_id = this.countryId;
      if (this.categoryQuery)
        params.proclass_id = this.proClass;
      if (this.timeQuery)
        params.time_order = this.timeOrder;
      if (this.priceQuery)
        params.price_order = this.priceOrder;
      $.getJSON(url, params, function(ret) {
        if (ret.resultCode != 0) {
          ZB_Util.msg(ret.msg);
          return;
        }
        if (typeof(ret.data.productList) != 'undefined') {
          self.proList = ret.data.productList;
          self.$refs.search.style.display = 'none';
        } else {
          self.proList = [];
          self.$refs.search.style.display = 'block';
        }
      })
    },
    // 获取国家
    getCountryList: function() {
      var self = this
      var url = SHOP_INTF + 'common/getCountryList';
      $.post(url, {
        ts: new Date().getTime()
      }, function(ret) {
        if (ret.resultCode != 0) {
          return;
        }
        self.countryList = ret.data.countrys;
      })
    },
    // 获取分类列表
    getClassList: function() {
      var self = this;
      var url = SHOP_INTF + 'product/classify';
      $.post(url, {
        ts: new Date().getTime()
      }, function(ret) {
        if (ret.resultCode != 0) {
          return;
        }
        self.classList = ret.data.productClass
      })
    },
    // 选择某一个产品跳转到详情页
    selectProItem: function(id) {
      location.href = 'detail.html?pro_id=' + id;
    },
    // 打开国家地区选择列表
    openCountry: function() {
      this.showCountry = true;
      this.showClass = false;
    },
    // 选择国家
    selectCountry: function(id) {
      this.countryId = id;
      if (id) {
        this.countryQuery = true;
      } else {
        this.countryQuery = false;
      }
      this.getProList()
    },
    // 打开商品分类选择列表
    openClass: function(){
      this.showClass = true;
      this.showCountry = false;
    },
    // 选择分类
    selectClass: function(id) {
      this.proClass = id;
      if (id) {
        this.categoryQuery = true;
      } else {
        this.categoryQuery = false;
      }
      this.getProList()
    },
    selectTime: function(){
      this.priceQuery = false;
      this.priceOrder = null;
      this.timeQuery = true;
      if (this.timeOrder == null) {
        this.timeOrder = 1;
      } else {
        this.timeOrder = this.timeOrder == 1 ? 0 : 1;
      }
      this.getProList();
    },
    selectPrice: function(){
      this.timeQuery = false;
      this.timeOrder = null;
      this.priceQuery = true;
      if (this.priceOrder == null) {
        this.priceOrder = 1;
      } else {
        this.priceOrder = this.priceOrder == 1 ? 0 : 1;
      }
      this.getProList();
    },randBuyNum: function(){
      return Math.floor(Math.random()*100);
    }
  }
})
