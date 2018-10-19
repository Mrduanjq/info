var vm = new Vue({
  el: "#wrapper",
  data: {
    proList: [],
    orderId: '',
    totalPrice: '',
    goodsId: '',
  },
  created: function(){
    this.orderId = ZB_Util.getParam("order_id");
    this.getProList();
    this.getOrderDetail();
  },
  mounted: function(){
    $(".back").off("touchend", function(){
      ZB_Util.backApp();
    })
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    getOrderDetail: function(){
      var _this = this;
      var url = SHOP_INTF + "order/detail";
      var param = {
        order_id: this.orderId,
      };
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.goodsId = data.data.order.items[0].id;
        _this.totalPrice = data.data.order.total_amount;
      })
    },
    // 获取产品列表
    getProList: function() {
      var _this = this;
      var url = SHOP_INTF + 'product/getProductList';
      var params = {
        ts: new Date().getTime(),
        type: 2,
        pageStart: 0,
        pageSize: 6
      };
      $.getJSON(url, params, function(ret) {
        if (ret.resultCode != 0) {
          return;
        }
        _this.proList = ret.data.productList;
      })
    },
    hrefUrl: function(){
      location.href = "orderdetail.html?order_id=" + this.orderId;
    },
    // 选择某一个产品跳转到详情页
    selectProItem: function(id) {
      location.href = 'detail.html?pro_id=' + id;
    },
    back: function(){
      if (ZB_Util.getParam('isdetail')) {
        location.href = "detail.html?pro_id=" + ZB_Util.getParam('goods_id');
        return;
      } else {
        location.href = "buycar.html";
      }
    },
    backAppHome: function(){
      if (ZB_Util.isAndroid()) {
        JSInterface.jumpToHome();
      } else if (ZB_Util.isIOS()) {
        window.webkit.messageHandlers.jumpToHome.postMessage(null);
      }
    }
  },
})

