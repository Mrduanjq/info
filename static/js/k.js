var vm = new Vue({
  el: '#wrapper',
  data: {
    user: {
      balance: 0, // 用户余额
      ticketCount: '', // 用户券数
      isToken: true, // 用户是否登录
      tickets: [], // 用户卡券列表
      clientWidth: '', // 用户手机屏幕宽度
      itemId: '', // 当前子商品的itemId
    },
    checkVersion: '', // true 为审核期间 false为非审核期间 
    curCategory: {
      price: '',
      dir: '',
      unit: '',
      ts: '',
      lastEnd: '',
      highest: '',
      todayOpen: '',
      lowest: '',
      openBiz: true,
    },
    intransaction: [], // 开休市数组
    color: {
      backgroundColor: '',
      deepDarkColor: '',
      lightDackColor: '',
      lineColor: '',
      lineWidth: '',
    },
    productList: [], // 所有商品列表
    productListChild: [], // 所有商品子列表
    selectorIndex: {
      index: 0, // 上面商品是否选中变量
      num: 0, // 选择分时类型的索引变量
      idx: 0, // 下面商品是否选中变量
      code: '', // 上面商品中的code
      marketCode: '', // 商品code值
    },
    navArr: [
      {
        name: "闪电图",
        type: "time"
      },
      {
        name: "日分时",
        type: "time"
      },
      {
        name: "5分",
        type: "kmi5"
      },
      {
        name: "15分",
        type: "kmi15"
      },
      {
        name: "30分",
        type: "kmi30"
      },
      {
        name: "60分",
        type: "kh1"
      },
      {
        name: "日线",
        type: "kd"
      }
    ],
    priceRatio: [], // 结算价和现价百分比数据
    //K 线部分数据
    chart: null,
    option: null,
    type: 'time',
    count: 120,
    startTime: 8,        // 开市时间
    startMinue: 0,        // 开市分钟
    kNum: 150,              // 日分时点数
    endid: 0,
    startid: 0,
    timer: 1,             //定时器
    data: {
      categoryData: [],
      values: [],
      Ma5: [],
      Ma10: [],
      Ma15: [],
      price: []
    },
  },
  created: function(){
    this.getLineColor("2h");
    this.getAccountInfo();
    this.getTicketList();
    this.getPriceRatio();
    if (ZB_Util.isIOS()) {
      this.isCheck();
    }
    var w = document.documentElement.clientWidth/5
    this.user.clientWidth = Math.round(w);
  },
  mounted: function(){
    this.chart = echarts.init(document.getElementById('main'));
    this.timeDividingLineSwiper();
    this.setTimer();
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    // 导航滚动swiper
    navSwiper: function(){
      var mySwiper = new Swiper('#nav_swiper',
      {
        paginationClickable: true,
        slidesPerView: 3,
        observer: true,
        observeParents: true,
      })
    },
    // 产品滚动swiper
    productSwiper: function(){
      var mySwiper = new Swiper('#produce_swiper',
      {
        paginationClickable: true,
        slidesPerView: 2.3,
        observer: true,
        observeParents: true,
      })
    },
    // 时分线swiper
    timeDividingLineSwiper: function(){
      var mySwiper = new Swiper('#type_swiper',
      {
        paginationClickable: true,
        slidesPerView: 7,
        observer: true,
        observeParents: true,
      })
    },
    initSocket: function(){
      var self = this;
      var socket = io(PRICE_SOCKET);
      // 产品开休市
      socket.on('intransaction', function(data){
        var obj = JSON.parse(data);
        if (self.selectorIndex.code == obj.code) {
          self.curCategory.openBiz = obj.intransaction;
        }
        for (var i = 0; i < self.productList.length; i++) {
          if (self.productList[i].code == obj.code) {
            self.$set(self.productList[i], 'openBiz', obj.intransaction);
          }
        }
      });

      // 产品价格
      socket.on('pushPrice', function(data){
        var obj = JSON.parse(data);
        $.each(self.productList, function(key, val){
          if (val.code == obj.code) {
            self.$set(self.productList[key],'price', obj.price);
            self.$set(self.productList[key], 'dir', obj.dir);
          }
        })
      });
    },
    // 获取账户信息
    getAccountInfo: function(){
      var self = this;
      var url = SHOP_INTF + 'clientPort/accountInfoList';
      var params = {
        ts: +new Date()
      }
      $.getJSON(url, params, function(data){
        if (data.resultCode === '1' || data.resultCode === '5') {
          self.user.isToken = false;
        }
        // if (data.resultCode != 0) {
        //   ZB_Util.error(data.msg);
        //   return;
        // }
        self.user.balance = data.balance;
        self.user.ticketCount = data.ticketCount;
      });
    },
    // 获取卡券列表
    getTicketList: function(){
      var self = this;
      var url = SHOP_INTF + 'clientPort/ticketList?ts=' + (+new Date());
      $.getJSON(url, function(data){
        if (data.resultCode == 0) {
          self.user.tickets = data.tickets;
        }
      })
    },
    // 充值
    jumpCharge: function(){
      ZB_Util.jumpCharge();
    },
    // 全部商品列表
    getProductList: function(){
      var self = this;
      var url = SHOP_INTF + "clientPort/itemList";
      var param = {
        ts: +new Date()
      };
      $.getJSON(url, param, function(data){
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        self.productList = data.categories;        
        self.productListChild = data.categories[0].itemList; // 默认是第一个产品数据
        self.selectorIndex.code = data.categories[0].code;
        self.computeRate(self.productList[0].marketCode); // 默认第一个的现价和结算价
        self.toggleProduct(self.productListChild[0], 0);
        self.getKLineData();
        self.initSocket();
        self.$nextTick(function(){
          self.navSwiper();
          self.productSwiper();
        })
      })
    },
    // 上面商品列表
    selectProduct: function(item,index){
      this.selectorIndex.index = index;
      this.selectorIndex.idx = 0;
      this.productListChild = item.itemList;
      this.selectorIndex.code = item.code;
      this.computeRate(item.marketCode);
      this.toggleProduct(item.itemList[0], 0);
      this.getKLineData();
      this.$nextTick(function(){
        this.productSwiper();
      })
    },
    computeRate: function(code){
      $.each(this.priceRatio, function(key, val){
        if (code == val.codeValue) {
          if (val.ucount == 0 && val.dcount == 0) {
            $(".range-top").text("现价50%");
            $(".range-bottom").text("结算价50%");
            $(".range>.range-left").css("width", "50%");
            $(".range>.range-right").css("width", "50%");
          } else {
            var nowPriceRatio = Math.round((val.ucount / (val.ucount + val.dcount)) * 1000) / 10;
            var resPrice = Math.round((100 - nowPriceRatio) * 10) / 10;
            $(".range-top").text("现价" + nowPriceRatio + "%");
            $(".range-bottom").text("结算价" + resPrice + "%");
            $(".range>.range-left").css("width",nowPriceRatio+"%");
            $(".range>.range-right").css("width",resPrice+"%");
          }
          return false;
        }
      })
    },
    // 下面商品子列表
    toggleProduct: function(item,index){
      var self = this;
      this.selectorIndex.idx = index;
      var count = 0;
      $.each(this.user.tickets, function(key, val){
        if ((self.selectorIndex.code == val.code) && (item.itemId == val.itemId) && (val.used == 0)) {
          count++;
        }
      })
      self.user.ticketCount = count;
      self.user.itemId = item.itemId;
    },
    // 格式化时间
    addZero: function (val) {
      if (val) {
        if (val < 10) {
          return '0' + val;
        } else {
          return val;
        }
      } else {
        return val + '0';
      }
    },
    // 给k线一个定时器
    setTimer: function(){
      var self = this;
      this.timer = setInterval(function(){
        self.getKLineData();
      }, 60000);
    },
    // 请求接口获取数据
    getKLineData: function () {
      var self = this;
      this.data.values = [];
      this.data.Ma5 = [];
      this.data.Ma10 = [];
      this.data.Ma15 = [];
      this.data.price = [];
      var params = {
        code: this.selectorIndex.code,
        type: this.type,
        count: this.count,
        startId: this.startid,
        endId: this.endid,
        ts: +new Date(),
      }
      var url = SHOP_INTF + "lineData/lineData";
      $.getJSON(url, params, function(ret){
        if (ret.resultCode !== '0') {
          ZB_Util.error(ret.msg);
          return;
        }
        self.kNum = ret.count + 20;
        if (!ret.time.length) return;
        if (ret.type != 'time') {
          self.data.categoryData = [];
          self.data.price = [];
          $.each(ret.time, function (i, item) {
            self.data.categoryData.push(item);
            self.data.values.push([ret.open[i], ret.close[i], ret.low[i], ret.hi[i]]);
            self.data.Ma5.push(ret.ma5[i]);
            self.data.Ma10.push(ret.ma10[i]);
            self.data.Ma15.push(ret.ma15[i]);
          })
          self.setKOption();
        } else {
          var time = ret.time[0];
          var idx = time.indexOf(':');
          self.startTime = time.substring(0,idx);
          self.startMinue = time.substring(3);
          self.initLineData();
          $.each(self.data.categoryData, function (i, item) {
            $.each(ret.time, function (index, val) {
              if (item === val) {
                self.data.categoryData.splice(i, 1, item);
                self.data.price.splice(i, 1, ret.prices[index].toFixed(2));
              }
            })
          })
          self.setLOption();
        }
      })
    },
    // 将横坐标撑宽
    initLineData: function () {
      this.data.categoryData = [];
      this.data.price = [];
      var num = this.kNum;
      var curDate = new Date();
      var startDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), this.startTime, this.startMinue, 0, 0);
      for (var i = 0; i < num; i++) {
        this.data.categoryData.push([this.addZero(startDate.getHours()), this.addZero(startDate.getMinutes())].join(':'));
        this.data.price.push('-');
        startDate = new Date(startDate.getTime() + 60 * 1000);
      }
    },

    // 请求绘制图的颜色
    getLineColor: function(type){
      var self = this;
      var url = SHOP_INTF + "/clientPort/linePanel";
      var param = {
        platform: 2,
        panelType: type
      };
      if (ZB_Util.isAndroid()) {
        param.platform = 2;
      } else {
        param.platform = 1;
      }
      $.getJSON(url, param, function(data){
        if (data.resultCode == 0) {
          self.color = data;
        }
      })
    },

    // 曲线绘制
    setLOption: function () {
      var self = this;
      var optionL = {};
      optionL.series = [];
      optionL = {
        animation: false, 
        tooltip: {
          show: true,
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          // backgroundColor: self.color.backgroundColor,
          padding: 1,
          textStyle: {
            color: '#fff',
            fontSize: 12,
          },
          extraCssText: 'width: 120px'
        },
        grid: [
        {
          left: '5%',
          right: '2%',
          top: '5%',
          bottom: '15%',
          xAxisIndex: [0, 1],
        }
        ],
        xAxis: {
          type: 'category',
          data: self.data.categoryData,
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
              type: 'dashed'
            }
          },
          scale: true,
          boundaryGap: true,
          axisLine: {
            onZero: false,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          },
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
              type: 'dashed'
            }
          },
          scale: true,
          splitArea: {
            show: false
          },
          axisLabel: {
            inside: true,
          },
          // axisLine: {
          //   onZero: false,
          //   lineStyle: {
          //     width: 1,
          //     type: 'solid'
          //   }
          // },          
        },
        series: [
        {
          name: '价格',
          type: 'line',
          data: self.data.price,
          smooth: true,
          symbol: 'none',
          smoothMonotone: 'x',
          sampling: 'average',
          itemStyle:{
            normal:{
              lineStyle:{
                // color: "#9098a1",
                color:self.color.lineColor,
                // width:1.5
                width:self.color.lineWidth
              },
              areaStyle:{
                type: 'default',
                // color:'#f5f5f5',
                color:self.color.lightDackColor
              },
            }
          },
        }
        ]
      }
      this.chart.clear();
      this.chart.setOption(optionL);
    },

    // 绘制k线部分
    setKOption: function () {
      var self = this;
      var optionK = {};
      optionK.series = [];      
      optionK = {
        animation: false,
        // legend: {
        //   data: ['k线', 'MA5', 'MA10', 'MA15']
        // },
        tooltip: {
          show: true,
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderWidth: 1,
          borderColor: '#ccc',
          textStyle: {
            color: '#fff',
            fontSize: 12,
            fontWeight: 100
          },
          padding: 5,
          extraCssText: 'width: 140px',
          formatter: function (param) {
            var kline;
            kline = param[0];
            return [
            kline.name + '<br />',
            '开: ' + kline.data[1].toFixed(2) + '    ',
            '收: ' + kline.data[2].toFixed(2) + '<br/>',
            '高: ' + kline.data[4].toFixed(2) + '    ',
            '低: ' + kline.data[3].toFixed(2) + '<br/>',
            ].join('');
          }
        },
        grid: {
          left: '8%',
          right: '2%',
          top: '5%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          axisLabel: {interval: 50},
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
              type: 'dashed'
            }
          },
          // splitNumber: 2,
          data: self.data.categoryData,
          scale: false,
          boundaryGap: true,
          axisLine: {
            onZero: false,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          }
        },
        yAxis: {
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
              type: 'dashed'
            }
          },
          splitNumber: 3,
          scale: true,
          axisLabel: {
            inside: true,
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          }
        },
        // dataZoom: {
        //   type: 'inside',
        //   xAxisIndex: [0],
        //   start: 50,
        //   end: 100
        // },
        series: [
        {
          type: 'candlestick',
          data: self.data.values,
          itemStyle: {
            normal: {
              color: '#E70009',
              color0: '#4BCA00',
              borderColor: '#E70009',
              borderColor0: '#4BCA00'
            }
          }
        }
        ]
      }
      self.chart.clear();
      self.chart.setOption(optionK,true);
    },

    // 选择分时类型
    selectType: function(type,num){
      this.selectorIndex.num = num;
      this.type = type;
      if (this.type == 'time') {
        if (num == 0) {
          this.count = 120;
          this.kNum = 150;
          this.getLineColor('2h');
          this.initLineData();
        } else {
          this.getLineColor('day');
          this.count = 0;
        }
      } else {
        this.count = this.user.clientWidth;
      }
      this.getKLineData();
    },

    // 结算价计算
    getPriceRatio: function(code){
      var self = this;
      var url = SHOP_INTF + "clientPort/refreshUDCountList?ts=" + (+new Date());
      $.getJSON(url, function(data){
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        self.priceRatio = data.refreshUDCountList;
        self.getProductList();
      })
    },
    // 判断是否在审核期间
    isCheck: function(){
      var self = this;
      var url = SHOP_INTF + "clientPort/clientVersion";
      var param = {
        clientVersionId: ZB_Util.getParam('clientVersionId'),
        shareCode: ZB_Util.getParam('shareCode'),
        platform: ZB_Util.getParam('platform'),
        ts: +new Date()
      };
      $.getJSON(url, param, function(data){
        self.checkVersion = data.checkSwitch;
      })
    },
    // 现价订购跳转
    priceBuilder: function(dir){
      var url = "buildorder.html?code=" + this.selectorIndex.code + "&dir=" + dir + "&itemId=" + this.user.itemId;
      if (!this.user.isToken) {
        if (ZB_Util.isAndroid()) {
          JSInterface.jumpToLogin();
        } else if (ZB_Util.isIOS()) {
          window.webkit.messageHandlers.jumpToLogin.postMessage(null);
        }
        return;
      }
      if (ZB_Util.isIOS()) {
        if (this.checkVersion) {
          url = "lists.html";
        }
      }
      location.href = url;
    },

    // 跳转当前定制页面
    myOrder: function(){
      var url = "myorder.html";
      if (!this.user.isToken) {
        if (ZB_Util.isAndroid()) {
          JSInterface.jumpToLogin();
        } else if (ZB_Util.isIOS()) {
          window.webkit.messageHandlers.jumpToLogin.postMessage(null);
        }
        return;
      }
      if (ZB_Util.isIOS()) {
        if (this.checkVersion) {
          url = "lists.html";
        }
      }
      location.href = url;
    },

    // 跳转到消息中心
    jumpCustomerServer: function(){
      ZB_Util.jumpCustomerServer();
    },
    // 跳转到客服
    jumpMessage: function(){ // 跳转消息中心
      ZB_Util.jumpMessage();
    }
  }
});