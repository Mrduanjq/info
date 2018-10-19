var vm = new Vue({
  el: "#wrapper",
  data: {
    goodsArr: [],
    navIndex: '',
    navArr:[
      "全部",
      "待付款",
      "待发货",
      "待收货",
      "已完成"
    ],
    goodsArrLength: false,
  },
  created: function(){
    var navIndex = ZB_Util.getParam("status");
    if (navIndex == null) navIndex = -1;
    this.getOrderLists(navIndex);
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    sureReceive: function(id,index){
      var _this = this;
      var url = SHOP_INTF + "order/receipt";
      var param = {
        order_id: id,
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
    orderPay: function(id){
      var _this = this;
      var url = SHOP_INTF + "order/pay";
      var param = {
        order_id: id,
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
        location.href = "orderdetail.html?order_id=" + id;
      })
    },
    getOrderLists: function(status){
      var _this = this;
      var url = SHOP_INTF + "order/list";
      var param = {
        page_size: 100,
        page_no: 0,
        status: status,
        ts: +new Date()
      };
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.navIndex = ++status;
        _this.goodsArr = data.data.orders;
        if (_this.goodsArr.length == 0) {
          _this.goodsArrLength = true;
        } else {
          _this.goodsArrLength = false;
        }
      });
    },
    backApp: function(){
      if (ZB_Util.isIOS()) {
        window.webkit.messageHandlers.finishAll.postMessage(null);
      } else if (ZB_Util.isAndroid()) {
        JSInterface.finishAll();
      }
    }
  },
})