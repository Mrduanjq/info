var vm = new Vue({
  el: "#app",
  data: {
    curCid: ZB_Util.getParam('class_id'),
    categorys: [],
    recGoods: [],
    lock: false,
  },
  created: function(){
    this.getRecGoods();
    this.getCategory();
    this.$nextTick(function () {
      $('#loader-main').hide();
    })

  },
  updated: function(){
    // var block = this.$refs['block'+this.curCid];
    // if (typeof block == 'undefined') {
    //   return;
    // }
    // this.moveTo(this.curCid);
  },
  methods: {
    getRecGoods: function(){
      var self = this;
      var url = SHOP_INTF + 'product/getProductList';
      var params = {
        type: 2,
        pageStart: 0,
        pageSize: 3,
        ts: +new Date()
      };
      $.getJSON(url, params, function(data){
        if (typeof(data.data.productList) != "undefined") {
          self.recGoods =  data.data.productList;
        }
      })
    },
    getCategory: function(){
      var self = this;
      var url = SHOP_INTF + 'product/classify';
      var params = {
        ts: +new Date()
      };
      $.getJSON(url, params, function(data){
        self.categorys = data.data.productClass;
        $.each(self.categorys, function(key, val){
          self.$set(self.categorys[key], 'goods', []);
          var url = SHOP_INTF + 'product/getProductList';
          var params = {
            type: 1,
            proclass_id: val.id,
            pageStart: 0,
            pageSize: 20,
            ts: +new Date()
          };
          $.getJSON(url, params, function(data){
            if (typeof(data.data.productList) != "undefined") {
              self.categorys[key]['goods'] =  data.data.productList;
            }
            self.moveTo(self.curCid)
          })
        })
      })
    },
    moveTo: function(id) {
      $(window).off("scroll");
      var self = this;
      this.lock = true;
      this.curCid = id;
      var offTop = 0;
      if (id == 0) {
        offTop = this.$refs['block0'].offsetTop;
      } else {
        offTop = this.$refs['block'+id][0].offsetTop;
      }
      document.documentElement.scrollTop = offTop;
      document.body.scrollTop = offTop;
      this.$nextTick(function(){
        $(window).on("scroll", self.scroll);
      })
      
    },
    scroll: function() {
       var self = this;
       var offTop = document.documentElement.scrollTop || document.body.scrollTop;
       self.categorys.forEach(function(val, key) {
          if (Math.abs(offTop - self.$refs['block'+val.id][0].offsetTop) < 50) {
            if (!self.lock) {
              self.curCid = val.id;
            }
            self.lock = false;
          }
        })
    },
    viewDetail: function(id){
      location.href = 'detail.html?pro_id=' + id;
    },
    randBuyNum: function(){
      return Math.floor(Math.random()*100);
    }
  }
})