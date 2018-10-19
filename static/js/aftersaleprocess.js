var vue = new Vue({
  el: '#app',
  data: {
    oid: '',
    orderInfo: {},
    serviceInfo: {}
  },
  created: function(){
    var self = this;
    this.oid = ZB_Util.getParam('oid');
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
    });
    var url = SHOP_INTF + 'common/applySaleInfo';
    var params = {
      order_id: this.oid,
      ts: (+new Date())
    };
    $.getJSON(url, params, function(data){
      if (data.resultCode != 0) {
        return;
      }
      self.serviceInfo = data.data.applyOrderInfo;
    });
  },
  mounted: function(){
    $(".back").off("click", function(){
      ZB_Util.backApp();
    });
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    cancel: function(){
      var self = this;
      layer.confirm('确认撤销此订单售后服务？', {
        btn: ['确定','取消']
      }, function(){
        var url = SHOP_INTF + 'common/cancelApply';
        var params = {
          order_id: self.oid,
          ts: (+new Date())
        }
        $.getJSON(url, params, function(data){
          ZB_Util.throw(data);
          if (data.resultCode != 0) {
            ZB_Util.error(data.msg);
            return;
          }
          ZB_Util.success('取消售后操作成功', 'order.html');
        });
      }, function(){
        layer.closeAll();
      });
     
      
    },
    goBack: function(){
      location.href = 'orderdetail.html?order_id='+this.oid;
    }
  }
});