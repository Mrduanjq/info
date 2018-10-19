var vm = new Vue({
  el: '#app',
  data: {
    total: 0,
    profit: 0,
    orderList: [],
    activeIds: [],
    viewTab: 'myorder',
    historyOrderList: [],
    startDate: '',
    endDate: '',
    futureOptions: {
      zy: [0,20,40,60,80,90],
      zs: [10,20,30,40,50,60]
    },
    forexOptions: {
      zy: [20,40,60,75,80,100],
      zs: [20,30,40,50,60,75]
    },
    orderid: 0,
    zy: 0,
    zs: 0,
    depositBalance: 0,
    clockOrder: null
  },
  created: function(){
    if (ZB_Util.getParam('view') == 'history') {
      this.selectView('history');
    }
    this.getOrderList();
    this.initSocket();
    this.startDate = this.lastMonthDate();
    this.endDate = ZB_Util.formatDate(+new Date());
    this.clockOrder = setInterval("vm.refreshOrder()", 3000);
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    initSocket: function(){
      var self = this;
      var socket = io(PRICE_SOCKET);
      socket.on('pushPrice', function(data){
        var obj = JSON.parse(data);
        $.each(self.orderList, function(key, val){
          if (obj.code == val.code) {
            self.$set(self.orderList[key], 'newPrice', obj.price);
            if (val.dir == 'U') {
              var profit = (obj.price - val.createPrice) *  val.buyCount * val.unitValue;
              self.$set(self.orderList[key], 'profit', profit.toFixed(2));
            } else if (val.dir == 'D') {
              var profit = (val.createPrice - obj.price) * val.buyCount * val.unitValue;
              self.$set(self.orderList[key], 'profit', profit.toFixed(2));
            }
            var profitScale = ((profit / val.depositBalance) * 100).toFixed(2);
            self.$set(self.orderList[key], 'profitScale', profitScale+'%');
          }
        });
        self.profit = 0;
        $.each(self.orderList, function(key, val){
            self.profit = parseFloat(self.profit) + parseFloat(val.profit);
        });
      });
    },
    getOrderList: function(){
      var self = this;
      var url = SHOP_INTF + 'clientPort/ordersByCode';
      var params = {
        ts: +new Date()
      };
      $.getJSON(url, params, function(data) {
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        self.orderList = data.deallist == null ? [] : data.deallist;
        self.total = data.cost;
        $.each(self.orderList, function(key, val){
          self.$set(self.orderList[key], 'newPrice', '-');
          self.$set(self.orderList[key], 'profit', '-');
          self.$set(self.orderList[key], 'profitScale', '-');
        });
      });
    },
    isActive: function(orderid){
      var active = false;
      $.each(this.activeIds, function(key, val){
        if (val == orderid) {
          active = true;
          return false;
        }
      });
      return active;
    },
    addActive: function(orderid) {
      var self = this;
      var active = false;
      $.each(this.activeIds, function(key, val){
        if (val == orderid) {
          active = true;
          self.activeIds.splice(key, 1);
          return false;
        }
      });
      if (!active) {
        this.activeIds.push(orderid);
      }
    },
    sell: function(){
      var self = this;
      if (this.activeIds.length == 0) {
        ZB_Util.msg('请选择持仓单');
        return;
      }
      layer.confirm('是否确认平仓', {btn:['取消', '确定']}, function(index){
        layer.close(index);
      }, function(index){
        var ids = self.activeIds.join(',');
        var url = SHOP_INTF + 'clientPort/batchSell';
        var params = {
          orderids: JSON.stringify(self.activeIds),
          ts: +new Date()
        };
        $.getJSON(url, params, function(data){
          ZB_Util.throw(data);
          if (data.resultCode != 0) {
            ZB_Util.error(data.msg);
            return;
          }
          $.each(self.activeIds, function(key, val){
            $.each(self.orderList, function(k, v){
              if (v.orderId == val) {
                self.orderList.splice(k, 1);
                return false;
              }
            });
          });
          self.activeIds = [];
          self.getOrderList();
          self.countProfit();
        });
      });
    },
    checkAll: function(){
      var self = this;
      if (this.activeIds.length == this.orderList.length) {
        this.activeIds = [];
        return;
      }
      this.activeIds = [];
      $.each(this.orderList, function(key, val){
        self.activeIds.push(val.orderId);
      });
    },
    setZyzs: function(order){
      this.depositBalance = order.depositBalance;
      this.zy = order.zy;
      this.zs = order.zs;
      this.orderid = order.orderId;
      if (order.isupdatezyzs) {
        $('.j_future_zysy').show();
      } else {
        $('.j_forex_zysy').show();
      }
      $('.j_zyzs').show();
    },
    cancelZyzs: function(){
      $('.j_future_zysy').hide();
      $('.j_forex_zysy').hide();
    },
    selectZy: function(value){
      this.zy = value;
    },
    selectZs: function(value){
      this.zs = value;
    },
    updateZyzs: function(){
      var self = this;
      var url = SHOP_INTF + 'clientPort/changeOrder';
      var params = {
        orderId: this.orderid,
        zy: this.zy,
        zs: this.zs,
        ts: +new Date()
      };
      $.getJSON(url, params, function(data){
        ZB_Util.throw(data);
        if (0 != data.resultCode) {
          ZB_Util.error(data.msg);
          return;
        }
        self.cancelZyzs();
        $.each(self.orderList, function(key, val){
          if (self.orderid == val.orderId) {
            self.$set(self.orderList[key], 'zy', self.zy);
            self.$set(self.orderList[key], 'zs', self.zs);
            return false;
          }
        });
      });
    },
    // countTotal: function(){
    //   var self = this;
    //   this.total = 0;
    //   $.each(this.orderList, function(key, val){
    //     self.total+= parseFloat(val.depositBalance);
    //   });
    // },
    countProfit: function(){
      var self = this;
      this.profit = 0;
      $.each(this.orderList, function(key, val){
        if (val.dir == 'U') {
          var profit = (val.newPrice - val.createPrice) *  val.buyCount * val.unitValue;
        } else if (val.dir == 'D') {
          var profit = (val.createPrice - val.newPrice) * val.buyCount * val.unitValue;
        }
        self.profit+= parseFloat(profit);
      });
    },
    selectView: function(tab) {
      this.viewTab = tab;
      if (tab == 'history') {
        this.getHistoryList();
      }
    },
    getHistoryList: function(){
      var self = this;
      var url = SHOP_INTF + 'clientPort/txList';
      var params = {
        ts: +new Date()
      };
      if (this.startDate) {
        params.startDate = this.startDate.replace(/-/g, '');
      }
      if (this.endDate) {
        params.endDate = this.endDate.replace(/-/g, '');
      }
      $.getJSON(url, params, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        self.historyOrderList = data.list;
        $.each(self.historyOrderList, function(key, val){
          var floatScale = ((val.floatValue / val.depositMoney) * 100).toFixed(2);
          self.$set(self.historyOrderList[key], 'floatScale', floatScale + '%');
          self.$set(self.historyOrderList[key], 'buyDate', ZB_Util.formatTime(val.buyDate));
          self.$set(self.historyOrderList[key], 'sellDate', ZB_Util.formatTime(val.sellDate));
        });
      });
    },
    search: function(){
      this.getHistoryList();
    },
    lastMonthDate: function(){
      var lastDate = new Date();
      lastDate.setMonth(lastDate.getMonth() - 1);
      return ZB_Util.formatDate(lastDate);
    },
    refreshOrder: function(){
      var self = this;
      var url = SHOP_INTF + 'clientPort/ordersByCode';
      var params = {
        ts: +new Date()
      };
      $.getJSON(url, params, function(data){
        if (data.resultCode != '0') {
          return;
        }
        if (data.deallist == null || data.deallist.length != self.orderList.length) {
          self.getOrderList();
        }
        if (self.orderList.length == 0) {
          window.clearInterval(self.clockOrder);
        }
      });
    }
  }
});