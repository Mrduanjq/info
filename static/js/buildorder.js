const ZYARRAY_XH = [0, 20, 40, 60, 80, 90];
const ZSARRAY_XH = [10, 20, 30, 40, 50, 60];
const ZYARRAY_HB = [20, 40, 60, 75, 80, 100];
const ZSARRAY_HB = [20, 30, 40, 50, 60, 75];
var vue = new Vue({
  el: '#app',
  data: {
    userInfo: {},       // 个人信息
    myMoney: '',        // 个人资产
    code: ZB_Util.getParam('code'),        // 产品code
    name: '',           // 商品名称
    categoryList: [],   // 产品列表
    curCategory: {},    // 当前
    ticketList: [],     // 券列表
    ticketItemList: [], // 某一个code下的ticketlist
    ticketId: 0,       // 选中的券id
    ticketName: '元现金体验券', // 券名称
    ticketMoney: 0,      // 代金券的金额
    ticketValue: 0,      // 代金券的金额面值
    itemsList: [],      // 产品具体类目
    itemId: ZB_Util.getParam('itemId'),   // 具体类目id
    buyNumber: 0,       // 购买手数
    buyLimit: '',       // 购买上限
    buyNumFocus: 0,     // 手动删除数据之前的数据
    zyList: [],
    zsList: [],
    zy: '',             // 现货为第6个 / 货币为第4个
    zs: '',             // 现货为第6个 / 货币为第4个
    nuitPrice: '',      // 具体某一个商品的单价
    dir: ZB_Util.getParam('dir'),
    price: '--',          //  当前商品价格
    priceDir: '',
    diffDir: '',          // 利率的颜色值
    diffPrice: '--',
    diffRate: '--',
    isShowBuildMask: false, // 是否显示建仓弹窗
  },
  created: function() {
    this.initSocket();
    this.getAccountInfo();
    this.getCategoryList();
    this.getTicketList();
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  watch: {
    categoryList: function(val) {
      this._getItemsList('init');
    },
    code: function(val) {
      this.ticketId = 0;
      this.getAccountInfo();
      this._getItemsList();
      this._getItemInfo();
      this._getItemTicket();
    },
    itemId: function(val) {
      this._getItemInfo();
      this._getItemMaxNum();
      this._getItemTicket();
    },
    price: function(val){
      this.priceDir = this.curCategory.dir || '';
      this.diffPrice = (this.curCategory.price-this.curCategory.lastEnd).toFixed(2);
      this.diffPrice = isNaN(this.diffPrice) ?  '--' : this.diffPrice;
      this.diffDir = this.diffPrice > 0 ? 1 : 0 ;
      this.diffRate = ((this.curCategory.price - this.curCategory.lastEnd) / this.curCategory.lastEnd * 100).toFixed(2);
      this.diffRate = isNaN(this.diffRate) ? '--' : this.diffRate + "%";
      this.diffRate = this.curCategory.lastEnd == 0 ? '--' : this.diffRate;
    },
    ticketId: function(val){
      this.buyNumber = val != 0 ? 1 : this.buyNumber;
      this.ticketMoney = val == 0 ? 0 : this.ticketValue;
      if (val != 0) {
        this.$refs.buildNum.setAttribute('readonly','readonly');
      } else {
        this.$refs.buildNum.removeAttribute('readonly');
      }
    }
  },
  methods: {    

    // 接入socket
    initSocket: function() {
      var self = this;
      var socket = io(PRICE_SOCKET);
      socket.on('pushPrice', function(ret){
        var obj = JSON.parse(ret);
        if (self.code == obj.code) {
          self.price = obj.price;
          self.curCategory = Object.assign(self.curCategory, obj);
        }
        self.categoryList.forEach(function(categories, index){
          if (categories.code == obj.code) {
            categories = Object.assign(categories, obj);
          }
        })
      })
    },

    // 获取产品列表
    getCategoryList: function() {
      var self = this;
      var url = SHOP_INTF + 'clientPort/itemList';
      var params = {
        ts: (new Date()).getTime()
      };
      $.getJSON(url, params, function(ret) {
        if (ret.resultCode != 0) {
          return
        }
        self.categoryList = ret.categories;
      })
    },

    // 获取券列表
    getTicketList: function() {
      var self = this;
      var url = SHOP_INTF + 'clientPort/ticketList';
      $.getJSON(url, {ts: new Date().getTime()}, function(ret) {
        ZB_Util.throw(ret);
        if (ret.resultCode != 0) {
          return
        }
        self.ticketList = ret.tickets;
        self._getItemTicket();
      })
    },

    // 获取个人信息
    getAccountInfo: function() {
      var self = this;
      var url = SHOP_INTF + "clientPort/accountInfoList";
      var params  = {
        ts: new Date().getTime(),
        code: this.code
      }
      $.getJSON(url, params, function(ret) {
        ZB_Util.throw(ret);
        if (ret.resultCode = 0) {
          return;
        }
        self.myMoney = ret.balance;
        self.userInfo = ret;
        self._getItemMaxNum();
      })
    },

    showBuildMask: function(){
      if (!this._canBuy()) {
        return;
      }
      this.isShowBuildMask = true;
    },

    // 订货
    orderBuy: function() {
      var self = this;
      if (!this._canBuy()) {
        return;
      }
      var url = SHOP_INTF + 'clientPort/buy';
      var params = {
        ts: new Date().getTime(),
        itemid: this.itemId,
        count: this.buyNumber,
        dir: this.dir,
        intoType: 0,
        ticketId: this.ticketId,
        zy: this.zy,
        zs: this.zs
      }
      $.getJSON(url, params, function(ret) {
        ZB_Util.throw(ret);
        self.isShowBuildMask = false;
        if (ret.resultCode != 0) {
          ZB_Util.msg(ret.msg);
          return;
        }
        layer.msg(ret.msg, {shift:0,time:500}, function() {
          ZB_Util.backApp();
        });
      })
    },

    // 设置止盈
    setZy: function(zy) {
      this.zy = zy;
    },

    // 设置止盈
    setZs: function(zs) {
      this.zs = zs;
    },

    charge: function(){
      ZB_Util.jumpCharge();
    },

    // 设置购买手数
    setBuyNumber: function(num) {
      if (this.ticketId != 0) {return;}
      this.buyNumber = parseInt(this.buyNumber);
      this.buyNumber += num;
      this.buyNumber = num == -1 && this.buyNumber <= 1 ? 1 : this.buyNumber;
      this.buyNumber = num == 1 && this.buyNumber >= this.buyLimit ? this.buyLimit : this.buyNumber;
      this._canBuy();
    },

    // 购买手数失去焦点事件
    buyNumberBlur: function() {
      if (this.ticketId != 0) {return;}
      this.buyNumber = !this.buyNumber ? 0 : this.buyNumber;
      this.buyNumber = !this._canBuy() ? this.buyNumFocus : this.buyNumber;
    },

    // 购买手数获取焦点事件
    buyNumberFocus: function() {
      this.buyNumFocus = this.buyNumber;
    },

    // 判断可以建仓的条件
    _canBuy: function() {
      var cost = this.buyNumber * this.nuitPrice;
      if (cost > this.myMoney) {
        ZB_Util.msg('您的资金不足');
        return false;
      }
      if (this.buyNumber > this.buyLimit) {
        ZB_Util.msg('超过最大购买数');
        return false;
      }
      if (this.buyLimit == 0) {
        ZB_Util.msg('该商品已达到最大购买手数');
        return false;
      }
      if (this.buyNumber == 0) {
        ZB_Util.msg('请选择购买数量');
        return false;
      }
      return true;
    },

    // 获取产品种类列表
    _getItemsList: function(str) {
      var self = this;
      if (!this.categoryList.length) {
        return
      }
      this.categoryList.forEach(function(categories, index) {
        if (categories.code == self.code) {
          self.curCategory = categories;
          self.price = self.curCategory.price;
          self.itemsList = categories.itemList;
          if (typeof(str) == 'undefined') {
            self.itemId = self.itemsList[0].itemId;
            self.name = self.itemsList[0].name;
          }
          // entityType == 0 现货
          if (self.itemsList[0].entityType == 0) {
            self.zyList = ZYARRAY_XH;
            self.zsList = ZSARRAY_XH;
            self.zy = ZYARRAY_XH[5];
            self.zs = ZSARRAY_XH[5];
          } else {
            self.zyList = ZYARRAY_HB;
            self.zsList = ZSARRAY_HB;
            self.zy = ZYARRAY_HB[3];
            self.zs = ZSARRAY_HB[5];
          }
        }
      })
    },

    // 获取某一个产品的最大手数信息
    _getItemMaxNum: function(){
      var countMap = this.userInfo.countMap;
      var canBuyNum = Math.floor(this.myMoney / this.nuitPrice);
      for(key in countMap){
        if (key == this.itemId) {
          this.buyLimit = Math.min(countMap[key], canBuyNum);
          this.buyNumber = this.buyLimit;
        }
      }
    },

    // 获取某一个产品的信息
    _getItemInfo: function() {
      var self = this;
      if (!this.itemsList.length) {
        return;
      }
      this.itemsList.forEach(function(item, index) {
        if (item.itemId == self.itemId) {
          self.nuitPrice = item.price;
          self.name = item.name;
        }
      })
    },

    // 获取某一类产品的券
    _getItemTicket: function() {
      var self = this;
      var tickets = [];
      this.ticketId = 0;
      this.ticketValue = 0;
      // type 1-手续费抵用券 2-现金体验券 3-商城消费券 4-交割券 目前只有2
      this.ticketList.forEach(function(ticket, index) {
        if (ticket.itemId == self.itemId && ticket.code == self.code && ticket.used == 0 && ticket.type == 2) {
          self.ticketValue = ticket.value;
          tickets.push(ticket);
        }
      })
      this.ticketItemList = tickets;
    },
  }
})
