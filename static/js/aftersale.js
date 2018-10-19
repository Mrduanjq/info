var vue = new Vue({
  el: '#app',
  data: {
    oid: '',
    orderInfo: {},
    serviceType: null, // 售后类型0退货退款、1仅退款
    message: '',
    imgList: [],
    maxUploadNum: 6
  },
  created: function(){
    var self = this;
    this.oid = ZB_Util.getParam('oid');
    
    var url = SHOP_INTF + 'common/applySaleInfo';
    var params = {
      order_id: this.oid,
      ts: (+new Date())
    };
    $.getJSON(url, params, function(data){
      if (data.resultCode == '0') {
        location.href = 'orderdetail.html?order_id='+self.oid;
        return;
      }
    });

    var url = SHOP_INTF + 'order/detail';
    var params = {
      order_id: this.oid,
      ts: (+new Date())
    };
    $.getJSON(url, params, function(data){
      if (data.resultCode != 0) {
        return;
      }
      self.orderInfo = data.data.order;
      if (self.orderInfo.status == 1) { // 未发货
        self.serviceType = 1;
      } else if (self.orderInfo.status == 2) { // 已发货
        self.serviceType = 0;
      }
    });
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    apply: function(){
      var self = this;
      if (this.serviceType === null) {
        ZB_Util.error('当前订单状态不支持申请售后服务');
        return;
      }
      if (this.message.length == 0 || this.message.length > 400) {
        ZB_Util.error('问题描述必填、最多不超过400字');
        return;
      }
      var url = SHOP_INTF + 'common/addApplySale';
      var params = {
        order_id: this.oid,
        type: this.serviceType,
        questionDesc: this.message,
        imageurls: this.imgList.toString(),
        ts:(+new Date())
      };

      $.getJSON(url, params, function(data){
        if (data.resultCode != 0) {
          ZB_Util.throw(data);
          return;
        }
        location.href = 'aftersaleprocess.html?oid='+self.oid;
      });
    },
    upload: function(){
      if (this.imgList.length >= this.maxUploadNum) {
        ZB_Util.error('图片不能超过'+this.maxUploadNum+'张');
        return;
      }
      if (ZB_Util.isAndroid()) {
        JSInterface.selectPic();
      } else if (ZB_Util.isIOS()) {
        window.webkit.messageHandlers.selectPic.postMessage(null);
      }
    },
    addPic: function(url){
      this.imgList.push(url);
    }
  }
});

function addPic(url) {
  vue.imgList.push(url);
}