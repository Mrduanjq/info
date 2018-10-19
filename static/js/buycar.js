var vm = new Vue({
  el: "#wrapper",
  data: {
    goodsArr: [], // 获取的商品数组
    editStatus: false, // 默认不是编辑状态
    checkStatus: {}, // 所有物品的状态
    goodsNum: {}, // 所有物品的数量
    checkAllStatus: false,
    totalPrice: 0,
    goPayStatus: false, // 结算状态，默认为灰色
  },
  created: function(){
    this.getGoodsList();
    this.computePrice();
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    getGoodsList: function(){
      var _this = this;
      var url = SHOP_INTF + "shoppingcart/list";
      var param = {
        ts: +new Date()
      };
      $.getJSON(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.goodsArr = data.data.shoppingcarts;
      })
    },
    delRequest: function(product_id){ // 删除请求
      var _this = this;
      var url = SHOP_INTF + "shoppingcart/batchRemove";
      var param = {
        shopping_ids: product_id
      };
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.getGoodsList();
        _this.computePrice();
      })
    },
    // 去结算
    goPayment: function(){
      var _this = this;
      var goodsId = '';
      var lock = true;
      $.each(this.checkStatus, function(key, val){
        if (val) {
          goodsId += _this.goodsArr[key].id + ",";
          lock = false;
        }
      })
      if (lock) return;
      location.href = "payment.html?goods_id=" + goodsId;
    },
    hrefDetail: function(id){
      location.href = "detail.html?pro_id=" + id;
    },
    edit: function(){
      var _this = this;
      var checkAllStatus = true;
      if (!this.editStatus) {
        _this.editStatus = true;
        $.each(this.goodsArr, function(key, val){
          if (!_this.checkStatus[key]) {
            _this.checkAllStatus = false;
            return false;
          }
        })
      } else {
        $.each(this.goodsArr, function(key, val) {
            if (val.status == 0) {
              _this.checkStatus[key] = false;
            }
        })

        $.each(this.goodsArr, function(key, val){
          if (val.status == 0) return true;
          if (!_this.checkStatus[key]) {
            _this.checkAllStatus = false;
            return false;
          }
        })
        this.editStatus = false;
        this.computePrice();
      }
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
      if (item.number <= 0) {
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
        --_this.goodsArr[idx].number;
      })
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
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        ++_this.goodsArr[idx].number;
      })
    },
    check: function(item,index){
      var isAdd = true;
      var payStatus = false;

      if (item.status == 0 && this.editStatus == false) {
        return;
      }

      if (this.checkStatus[index] != true) {
        this.$set(this.checkStatus, index, true);
      } else {
        this.$set(this.checkStatus, index, false);
      }
      for (var i = 0; i < this.goodsArr.length; i++){
        if (this.goodsArr[i].status == 0) continue; // 如果为下架商品，跳出本次循环
        if (this.checkStatus[i] != true) {
          isAdd = false;
          break;
        }
      }
      for (var i = 0; i < this.goodsArr.length; i++){
        if (this.goodsArr[i].status == 0) continue;
        if (this.checkStatus[i]) {
          payStatus = true;
        }
      }
      this.computePrice();
      this.checkAllStatus = isAdd;
      this.goPayStatus = payStatus;
    },
    checkAll: function(){
      if (!this.checkAllStatus) {
        for (var i = 0; i < this.goodsArr.length; i++) {
          if (this.goodsArr[i].status == 0 && this.editStatus == false) continue;
          this.$set(this.checkStatus, i, true);
        }
        this.checkAllStatus = true;
        this.goPayStatus = true;
      } else {
        for (var i = 0; i < this.goodsArr.length; i++) {
          // if (this.goodsArr[i].status == 0 && this.editStatus == false) continue;
          this.$set(this.checkStatus, i, false);
        }
        this.checkAllStatus = false;
        this.goPayStatus = false;
      }
      this.computePrice();
    },
    computePrice: function(){
      var _this = this;
      var total = 0;
      $.each(this.goodsArr, function(key, val){
        if (_this.checkStatus[key]) {
          total += val.price * val.number;
        }
      })
      this.totalPrice = total;
    },
    del: function(){ // 删除操作
      var _this = this;
      var goodsId = "";
      $.each(this.checkStatus, function(key, val){
        if (val) {
          goodsId += _this.goodsArr[key].id + ",";
          delete _this.checkStatus[key];
        }
      })
      goodsId = goodsId.slice(0,goodsId.lastIndexOf(','));
      _this.delRequest(goodsId);
    },
    substr: function(str){
      return ZB_Util.substr(str);
    }
  }
})