var vm = new Vue({
  el: "#wrapper",
  data: {
    order: {
      orderId: '',
      addressId: '',
      status: ''
    },
    addressObj: {},
    goods: {},
    navArr:[
      "待付款",
      "待发货",
      "待收货",
      "已完成",
      "已取消"
    ],
    navIndexName: "",
    navIndex: "",
  },
  created: function(){
    this.order.orderId = ZB_Util.getParam("order_id");
    this.getOrderDetail();
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    getOrderDetail: function(){
      var _this = this;
      var url = SHOP_INTF + "order/detail";
      var param = {
        order_id: this.order.orderId,
      };
      $.getJSON(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.goods = data.data.order;
        _this.order.addressId = data.data.order.address_id;
        _this.navIndex = data.data.order.status;
        _this.navIndexName = _this.navArr[_this.navIndex];
        _this.getAddressDetail();
      })
    },
    getAddressDetail: function(){
      var _this = this;
      var url = SHOP_INTF + "contact/info";
      var param = {
        address_id: this.order.addressId,
        ts: +new Date(),
      }
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.addressObj = data.data.address;
      })
    },
    cancleOrder: function(){
      var url = SHOP_INTF + "order/cancel";
      var param = {
        order_id: this.order.orderId
      }
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        layer.alert("取消成功！", function(){
          location.href = "order.html";
        });
      })
    },
    sureReceive: function(){
      var _this = this;
      var url = SHOP_INTF + "order/receipt";
      var param = {
        order_id: this.order.orderId,
        status: 3,
        ts: +new Date()
      };
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        ZB_Util.success("已成功收货！", location.href);
      })
    },
    orderPay: function(){
      var _this = this;
      var url = SHOP_INTF + "order/pay";
      var param = {
        order_id: this.order.orderId,
      };
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
        layer.alert(data.msg, function(){
          location.href = "orderdetail.html?order_id=" + _this.order.orderId;
        })
      })
    },
    sale: function(){
      var _this = this;
      var url = SHOP_INTF + 'common/applySaleInfo';
      var params = {
        order_id: this.order.orderId,
        ts: (+new Date())
      };
      $.getJSON(url, params, function(data){
        ZB_Util.throw(data);
        if (data.resultCode == '0') {
          location.href = 'aftersaleprocess.html?oid='+_this.order.orderId;
          return;
        } else {
          location.href = 'aftersale.html?oid=' + _this.order.orderId;
        }
      });
    },
    formatTime: function(time){
      return ZB_Util.formatTime(time);
    },
    backOrder: function(){
      location.href = 'order.html';
    }
  }
})