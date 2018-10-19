var vm = new Vue({
  el: "#wrapper",
  data: {
    addressList:[],
    goodsId: '',
  },
  created: function(){
    this.getAddressLists();
    this.goodsId = ZB_Util.getParam('goods_id');
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    getAddressLists: function(){
      var _this = this;
      var url = SHOP_INTF + "contact/list";
      $.post(url, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        if (data.data.address_list.length > 0 ) {
          _this.addressList = data.data.address_list;
        }
      })
    },
    addressDel: function(id, index){
      var _this = this;
      var url = SHOP_INTF + "contact/remove";
      var param = {
        address_id: id
      }
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
         _this.addressList.splice(index, 1);
      })
    },
    selectorAddress: function(item){
      var goodsId = ZB_Util.getParam("goods_id");
      if (ZB_Util.getParam('isdetail')) {
        location.href = "payment.html?isdetail=1&address_id=" + item.id + "&goods_id=" + goodsId;
        return;
      }
      location.href = "payment.html?address_id=" + item.id + "&goods_id=" + goodsId;
    },
    hrefEdit: function(id){
      if (ZB_Util.getParam('isdetail')) {
        location.href = "addressedit.html?isdetail=1&address_id=" + id + "&goods_id=" + this.goodsId;
        return;
      }
      location.href = 'addressedit.html?' + 'address_id=' + id + '&goods_id=' + this.goodsId;
    },
    newAdd: function(){
      if (ZB_Util.getParam('isdetail')) {
        location.href = 'addressedit.html?isdetail=1&goods_id=' + this.goodsId;
        return;
      } else {
        location.href = 'addressedit.html?goods_id=' + this.goodsId;
      }
    }
  },
})