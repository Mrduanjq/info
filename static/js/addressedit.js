var vm = new Vue({
  el: "#wrapper",
  data: {
    isSave: false, // 是否显现保存按钮
    userAddress:{
      recipient: '',
      mobile: '',
      province: '', // 省份，
      city: '', // 城市，
      address: '',
      def: 0,
    },
    place: '',
    isNew: true, // 来着是否是新增
  },
  created: function(){
    this.getAddress();
  },
  mounted: function(){
    this.getCity();
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    getCity: function(){
      var _this = this;
      var area = new LArea();
      area.init({
        'trigger': '#city', //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
        'valueTo': '', //选择完毕后id属性输出到该位置
        'keys': {
            id: 'id',
            name: 'name'
        }, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
        'type': 1, //数据源类型
        'data': LAreaData //数据源
      });
    },
    toggleBtn: function(){
      if (this.userAddress.def == 0) {
        this.userAddress.def = 1;
      } else {
        this.userAddress.def = 0;
      }
    },
    getAddress: function(){
      if (ZB_Util.getParam('address_id') !== null) { // 修改
        var _this = this;
        var idx = ZB_Util.getParam('address_id');
        var url = SHOP_INTF + "contact/list";
        $.post(url, function(data){
          ZB_Util.throw(data);
          if (data.resultCode != 0) {
            ZB_Util.error(data.msg);
            return;
          }
          $.each(data.data.address_list, function(key, val){
            if (val.id == idx) {
              _this.userAddress = val;
              _this.place = val.province_name + ',' + val.city_name;
              _this.isNew = false;
              return false;
            }
          })
        })
      }
    },
    newAdd: function(){
      var goodsId = ZB_Util.getParam('goods_id');
      var lock = true;
      var url = SHOP_INTF + "contact/add";
      if (!this.userAddress.recipient) {
        layer.msg('请输入联系人姓名！');
        return;
      }
      if (!this.userAddress.mobile) {
        layer.msg('请输入收件人电话！');
        return;
      }
      if (!this.userAddress.recipient) {
        layer.msg('请输入联系人姓名！');
        return;
      }
      if (!this.userAddress.address) {
        layer.msg('请输入详细地址！');
        return;
      }
      var param = {
        recipient: this.userAddress.recipient, // 联系人姓名
        province: this.place.substr(0, this.place.indexOf(',')), // 省份ID
        city: this.place.substr(this.place.indexOf(',')+1, this.place.lastIndexOf(',')), // 城市ID
        mobile: this.userAddress.mobile,
        address: this.userAddress.address,
        def: this.userAddress.def, // 是否默认
        postcode: 1,
      };
      if (!this.isNew) {
        url = SHOP_INTF + "contact/modify";
        param.address_id = this.userAddress.id;
      }
      if (!lock) return;
      lock = false;
      $.post(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        if (ZB_Util.getParam('isdetail')) {
          location.href = "addressadd.html?isdetail=1&goods_id=" + goodsId;
          return;
        }
        location.href = "addressadd.html?goods_id=" + goodsId;
      })
    }
  }
})