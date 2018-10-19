var vue = new Vue({
  el: '#app',
  data: {
    redWine: [],   // 红酒
    cologne: [],   // 香水
    milkList: [],  // 奶粉
    bagList: [],   // 箱包
    beautyList:[], // 美妆
    type: 2,      // 2 代表热门推荐

  },
  created: function(){
    if (ZB_Util.getParam('keyword')) {
      location.href = 'search.html?keyword='+ZB_Util.getParam('keyword');
    }
    this.getProList(9);
    this.getProList(10);
    this.getProList(11);
    this.getProList(12);
    this.getProList(13);
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    getProList: function(classId) {
      var self = this;
      var url = SHOP_INTF + 'product/getProductList';
      var param = {
        ts: new Date().getTime(),
        type: this.type,
        pageStart: 0,
        pageSize: 3,
        proclass_id: classId
      }
      $.getJSON(url, param, function(ret){
        if (ret.resultCode != 0) {
          ZB_Util.msg(ret.msg);
          return;
        }
        if (typeof(ret.data.productList) == 'undefined') {
          return;
        }
        self._setProList(classId, ret.data.productList);
      })
    },
    _setProList: function(classId, list){
      if (!list.length) {return;}
      switch(classId)
      {
        case 9:  // 奶粉
          this.milkList = list.slice(0,3);
          break;
        case 10:  // 酒水
          this.redWine = list.slice(0,3);
          break;
        case 11: // 美妆
          this.beautyList = list.slice(0,3);
          break;
        case 12: // 包包
          this.bagList = list.slice(0,3);
          break;
        case 13: // 香水
          this.cologne = list.slice(0,3);
          break;
        default:
          break;
      }
    },
    // 去详情页
    gotoDetail: function(id){
      location.href = 'detail.html?pro_id='+id;
    },
    // 去分类页面
    gotoClass: function(classId){
      if (typeof classId == 'undefined') {return;}
      location.href = 'class.html?class_id='+classId;
    }
  }
})