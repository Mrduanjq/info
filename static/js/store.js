var vue = new Vue({
  el: '#app',
  data: {
    pageStart: 0,
    pageSize: 50,
    sorteList: [],
    storeId: 0,
    isShowDel: false, // 是否显示删除按钮
    startTime: 0, // 点击开始时间
    endTime: 0, // 点击结束时间
    move: 0, // 移动距离
    isChecked: false,
    delList: [], // 
  },
  created: function() {
    this.getMyStoreList()
  },
  mounted: function() {
    this.$nextTick(function() {
      $('#loader-main').hide();
    })
  },
  methods: {
    // 获取收藏列表
    getMyStoreList: function() {
      var self = this
      var url = SHOP_INTF + 'common/getCollectionProducts';
      var params = {
        ts: new Date().getTime(),
        pageStart: this.pageStart,
        pageSize: this.pageSize
      }
      this.sorteList = [];
      $.post(url, params, function(ret) {
        ZB_Util.throw(ret)
        if (ret.resultCode != 0) {
          ZB_Util.msg(ret.msg);
          return;
        }
        console.log(ret.data.productList);
        if (typeof ret.data.productList == 'undefined') {
          self.isChecked = false;
          return;
        }
        self.sorteList = ret.data.productList;
      })
    },

    // 设置选中属性
    setAttrChecked: function(item) {
      var self = this;
      var checkedList = [];
      if (typeof item.checked == 'undefined') {
        self.$set(item, 'checked', true);
      } else {
        item.checked = !item.checked;
      }

      this.sorteList.forEach(function(item, index) {
        if (!item.checked) {
          checkedList.push(item);
        }
      })
      var len = checkedList.length;
      if (len >= 1) {
        this.isChecked = false;
      }else{
        this.isChecked = true;
      }
    },

    // 全选
    selectAll: function() {
      var self = this;
      if (!this.sorteList.length) {
        this.isChecked = false;
        return;
      }
      this.isChecked = !this.isChecked;
      this.sorteList.forEach(function(item, index) {
        if (typeof item.checked == 'undefined') {
          Vue.set(item, 'checked', true);
        } else {
          item.checked = self.isChecked;
        }
      })
    },

    // 删除某一数据
    deteleStore: function(proId) {
      var self = this;
      var url = SHOP_INTF + 'common/managerCollection';
      var params = {
        ts: new Date().getTime(),
        product_id: proId,
        type: 0
      }

      $.post(url, params, function(ret) {
        ZB_Util.throw(ret)
        if (ret.resultCode != 0) {
          return;
        }
        self.getMyStoreList()
      })
    },

    // 删除多条数据
    clickDeleteBtn: function() {
      var self = this;
      this.delList = [];
      if (!this.sorteList.length) {
        return;
      }
      console.log(this.sorteList.length);
      this.sorteList.forEach(function(item, index) {
        if (item.checked) {
          self.delList.push(item.collect_id);
        }
      })
      if (!this.delList.length) {
        ZB_Util.msg('请选择要删除的商品');
        return;
      }
      layer.alert('确认要删除该商品', function() {        
        self.deleteList();
      });
    },

    deleteList: function() {
      var self = this;      
      var url = SHOP_INTF + 'common/batchDelFavorite';
      var params = {
        ts: new Date().getTime(),
        product_ids: this.delList.toString()
      }
      $.post(url, params, function(ret) {
        ZB_Util.msg(ret.msg);
        if (ret.resultCode != 0) {
          return;
        }
        self.getMyStoreList();
      });
    },

    deteleBtn: function(proId) {
      var self = this
      layer.alert('确认删除', {
        btn: ['确认', '取消'],
        yes: function(index) {
          self.deteleStore(proId);
          layer.close(index);
        }
      })
    },
    // 
    JumpNext: function(storeId, status) {
      if (status != 0) {
        location.href = 'detail.html?pro_id=' + storeId;
      }
    }
  }
})