var vm = new Vue({
  el: "#wrapper",
  data: {
    isAddressStatus: true,
    address: {}, // 默认地址
    goodsArr: [], // 将要买的物品
    goodsId: [], // 传过来的选中的商品ID
    totalPrice: '',
    goodsPrice:{}, // 每个商品的总钱数
    addressId: '', // 收货ID
    form: {
      formId: '', // 订单ID
    },
    goodsArrDetail:{
      status: true, // 默认购物车来的
      goods: [],
    }, // 详情页来的
    lock: true, // 解决数据不同步
    paymentLock: true, // 解决结算页中的按钮能多次生成订单
  },
  created: function(){
    this.getAddressLists();
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    getProInfo: function() {
      var _this = this;
      var url = SHOP_INTF + 'product/info';
      var params = {
        ts: new Date().getTime(),
        product_id: ZB_Util.getParam('goods_id')
      }
      $.post(url, params, function(ret) {
        if (ret.resultCode != 0) {
          return;
        }
        _this.goodsArrDetail.status = false; // 开启详情页数据渲染
        _this.goodsArrDetail.goods = new Array(ret.data);
        _this.$set(_this.goodsArrDetail.goods[0], "number", 1);
        _this.$set(_this.goodsArrDetail.goods[0], "priceNum", _this.goodsArrDetail.goods[0].tariff);
        _this.computePrice();
        _this.computeSinglePrice();
      })
    },
    getAddressLists: function(){
      var _this = this;
      var url = SHOP_INTF + "contact/list";
      this.addressId = ZB_Util.getParam("address_id");
      $.post(url, function(data){
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.getGoodsLists();
        if (data.data.address_list.length > 0 ) {
          if (_this.addressId == null) {
            $.each(data.data.address_list, function(key, val) {
              if (val.def == 1) {
                _this.address = val;
                _this.isAddressStatus = false;
                return false;
              }
            })
            return;
          }
          $.each(data.data.address_list, function(key, val) {
            if (val.id == _this.addressId) {
              _this.address = val;
              _this.isAddressStatus = false;
              return false;
            }
          })
          _this.addressId = _this.address.id;
        }
      })
    },
    getGoodsLists: function(){
      var _this = this;
      var url = SHOP_INTF + "shoppingcart/list";
      var param = {
        ts: +new Date()
      };
      this.goodsId = ZB_Util.getParam("goods_id").split(",");
      $.getJSON(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        var goodsArr = [];
        $.each(data.data.shoppingcarts, function(key, val){
          for (var i = 0; i < _this.goodsId.length; i++) {
            if (val.id == _this.goodsId[i]) {
              goodsArr.push(val);
            }
          }
        })
        _this.goodsArr = goodsArr;
        if (ZB_Util.getParam("isdetail") != null) { // 详情页来的
          _this.getProInfo();
          return;
        }
        _this.computePrice();
        _this.computeSinglePrice();
      })
    },
    buyNow: function(){ // 详情页过来的，只是用于创建订单
      if (!this.paymentLock) {
        return;
      }
      this.paymentLock = false;
      var _this = this;
      var url = SHOP_INTF + "order/buy_now";
      var param = {
        address_id: this.address.id,
        product_id: this.goodsArrDetail.goods[0].product_id,
        count: this.goodsArrDetail.goods[0].number,
      };

      if (!this.address.id) {
        ZB_Util.error("请先添加收货地址!");
        return;
      }

      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.form.formId = data.data.order.id;
        _this.orderPay();
      })
    },
    buildOrder: function(){ // 生成订单用
      var _this = this;
      var url = SHOP_INTF + "order/buy";
      var shoppingcart_ids = "";
      $.each(this.goodsArr, function(key, val){
        shoppingcart_ids += val.id + ',';
      })
      var param = {
        address_id: this.address.id,
        shoppingcart_ids: shoppingcart_ids.substr(0,shoppingcart_ids.lastIndexOf(',')),
      };
      if (!this.address.id) {
        layer.alert("请先添加收货地址");
        return;
      }
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.form.formId = data.data.order_id;
        _this.orderPay();
      })
    },
    orderPay: function(){
      var _this = this;
      var url = SHOP_INTF + "order/pay";
      var param = {
        order_id: this.form.formId,
      };
      if (ZB_Util.getParam('isdetail')) {
        if (!this.address.id) {
          layer.alert("请先添加收货地址");
          return;
        }
      }
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode === ERROR_BALANCE_NOT_ENOUGH) {
          layer.alert(data.msg, function(){ // 去充值
            ZB_Util.jumpCharge();
          });
          return;
        }
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        if (ZB_Util.getParam("isdetail") == 1) {
          location.href = "payresult.html?isdetail=1&order_id=" + _this.form.formId + "&goods_id=" + _this.goodsId.join();
        } else {
          location.href = "payresult.html?order_id=" + _this.form.formId + "&goods_id=" + _this.goodsId.join();
        }
      })
    },
    sub: function(item,idx){
      var _this = this;
      var url = SHOP_INTF + "shoppingcart/add";
      var param = {
        product_id: item.product_id_fk,
        item_count: 1,
        operator: 0,
        ts: +new Date
      };
      if (ZB_Util.getParam("isdetail")) {
        if (item.number <= 1) {
          return;
        }
        param.product_id = item.product_id;
        this.$set(item, item.number, --item.number);
        this.$set(item, "tariff", +item.number*(+item.priceNum));
        _this.computePrice();
        return;
      }
      if (this.lock) { // 解决数据不同步问题
        this.lock = false;
        if (this.goodsArr[idx].number <= 1) {
          return;
        }
        $.post(url, param, function(data){
          ZB_Util.throw(data);
          if (data.resultCode != 0) {
            ZB_Util.error(data.msg);
            return;
          }
          if (_this.goodsArr[idx].number <= 1) {
            _this.goodsArr.splice(idx, 1);
            return;
          }
          _this.goodsArr[idx] = data.data.shopping_cart;
          _this.lock = true;
          _this.computePrice();
          _this.computeSinglePrice();
        })
      }
     
    },
    add: function(item,idx){
      var _this = this;
      var url = SHOP_INTF + "shoppingcart/add";
      var param = {
        product_id: item.product_id_fk,
        item_count: 1,
        operator: 1,
        ts: +new Date
      };
      if (ZB_Util.getParam("isdetail")) {
        param.product_id = item.product_id;
        this.$set(item, item.number, ++item.number);
        this.$set(item, "tariff", +item.number*(+item.priceNum));
        _this.computePrice();
        return;
      }
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.goodsArr[idx] = data.data.shopping_cart;
        _this.lock = true;
        _this.computePrice();
        _this.computeSinglePrice();
      })
      
    },
    computePrice: function(){
      var _this = this;
      var total = 0;
      if (ZB_Util.getParam("isdetail")) {
        if (this.goodsArrDetail.goods[0].market_price) {
          total += (+this.goodsArrDetail.goods[0].market_price) * (+this.goodsArrDetail.goods[0].number) + (+this.goodsArrDetail.goods[0].shipping_cost) + (+this.goodsArrDetail.goods[0].tariff) + (+this.goodsArrDetail.goods[0].discount);
          this.totalPrice = total;
        }
        return;
      }
      $.each(this.goodsArr, function(key, val){
          if (val.discount == null) val.discount = 0;
          total += val.price * val.number + val.shipping_cost + val.tariff + val.discount;
      })
      this.totalPrice = total;
    },
    computeSinglePrice: function(){
      var _this = this;
      $.each(this.goodsArr, function(key, val){
        _this.$set(_this.goodsPrice, key, val.price * val.number + val.shipping_cost + val.tariff + val.discount);
      })
    },
    hrefUrl: function(){
      var id = ZB_Util.getParam("goods_id");
      if (ZB_Util.getParam('isdetail')) {
        location.href = "addressadd.html?isdetail=1&goods_id=" + id;
        return;
      }
      location.href = "addressadd.html?goods_id=" + id;
    }
  },
})