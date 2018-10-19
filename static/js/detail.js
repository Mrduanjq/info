var vue = new Vue({
  el: '#app',
  data: {
    pid: 0,
    isFlagSc: false, // 是否收藏
    product: {},     // 产品对象
    proImges: [],    // 产品图片数组
  },
  created: function() {
    this.pid = ZB_Util.getParam('pro_id');
    this.getProInfo();
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    getProInfo: function() {
      var self = this;
      var url = SHOP_INTF + 'product/info';
      var params = {
        product_id: this.pid,
        ts: new Date().getTime()
      }
      $.post(url, params, function(ret) {
        if (ret.resultCode != 0) {
          return;
        }
        self.product = ret.data;
        self.proImges = ret.data.images;
        if (self.product.isCollections == 1) {
          self.isFlagSc = true;
        } else {
          self.isFlagSc = false;
        }
        self.$nextTick(function() {
          self.setLb();
        })
      })
    },
    // 下单
    addCar: function() {
      var self = this;
      var url = SHOP_INTF + 'shoppingcart/add';
      var params = {
        product_id: this.pid,
        item_count: 1,
        operator: 1, // 1是添加 0是减去
        ts: new Date().getTime()
      }
      $.getJSON(url, params, function(ret) {
        ZB_Util.throw(ret)
        if (ret.resultCode != 0) {
          ZB_Util.msg(ret.msg);
          return;
        }
        layer.msg('已添加到购物车！');
        return;
      })
    },
    // 立即购买
    buyNow: function() {
      // 为了得到接口有没有返回token失效的状态，临时请求的接口
      var self = this;
      var url = SHOP_INTF + "clientPort/accountInfoList";
      $.getJSON(url, {ts: new Date().getTime()}, function(ret){
        ZB_Util.throw(ret);
        if (ret.resultCode != 0) {return;}
        location.href = 'payment.html?isdetail=1&goods_id=' + self.pid;
      })
    },
    clickScBtn: function() {
      var self = this;
      var isScNum = this.isFlagSc ? 0 : 1;
      var url = SHOP_INTF + 'common/managerCollection';
      var params = {
        ts: new Date().getTime(),
        product_id: this.pid,
        type: isScNum
      }
      $.post(url, params, function(ret) {
        ZB_Util.throw(ret)
        if (ret.resultCode != 0) {
          ZB_Util.msg(ret.msg);
          return;
        }
        self.isFlagSc = !self.isFlagSc;
      })
    },
    setLb: function() {
      var swiper = new Swiper('.swiper-container', {
        pagination: {
          el: '.swiper-pagination',
          type: 'fraction'
        },
      });
    },randBuyNum: function(){
      return Math.floor(Math.random()*100);
    }
  }
})
