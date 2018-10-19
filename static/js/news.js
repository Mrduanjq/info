var vue = new Vue({
  el: '#app',
  data: {
    categoryType: 'news_important', // 选择的类目
    pageSize: 10,
    pageStart: 0,
    informationList: [],
    timer: 0, // 计数器
  },
  watch: {},
  created: function() {
    this.getInformation();
  },
  mounted: function(){
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    // 获取消息
    getInformation: function() {
      var self = this;
      var url = SHOP_INTF + 'clientPort/noticeInformation';
      var list = [];
      var params = {
        pageSize: this.pageSize,
        pageStart: this.pageStart,
        type: this.categoryType
      }
      $.getJSON(url, params, function(ret) {
        if (ret.resultCode != 0) {
          return;
        }
        list = ret.noticeInformation;
        self.informationList = self.informationList.concat(list);
        self.pageStart = list.length != 0 ? self.pageStart + self.pageSize : self.pageStart;
        if (list.length == 0) {
          layer.msg("没有更多了",{time: 800});
        }
        self.$refs.loading.style.display = 'none';
        self.$refs.newsMore.style.display = 'none';
      })
    },

    // 选择类目
    selectCategory: function(type) {
      this.informationList = [];
      this.categoryType = type;
      this.pageStart = 0;
      clearTimeout(this.timer);
      this.getInformation();
    },

    // 下拉加载
    pulldown: function() {
      var self = this;
      var screenHeight = window.screen.height;
      var docScrollTop = document.body.scrollTop==0?document.documentElement.scrollTop:document.body.scrollTop;
      var bodyScrollHeight = document.body.scrollHeight==0?document.documentElement.scrollHeight:document.body.scrollHeight;
      if (screenHeight + docScrollTop >= bodyScrollHeight) {        
        self.$refs.newsMore.style.display = 'block';
        document.documentElement.scrollTop = bodyScrollHeight;
        document.body.scrollTop = bodyScrollHeight;
        self.$refs.loading.style.display = 'block';
        self.$refs.more.innerText = "正在加载中...";
        if (self.timer != 0) {
          return;
        }
        self.timer = setTimeout(function() {
          self.getInformation();
          self.timer = 0;
        }, 1000);
      } else {
        console.log('false');
      }
    },

    // 跳转到
    goToSubpage: function(url) {
      location.href = url;
    }
  }
})
