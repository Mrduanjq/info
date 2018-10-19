var vm = new Vue({
  el: "#wrapper",
  data: {
    num: 1,
    date: {
      start: '',
      end: '',
      connect: ''
    },
    dataList: [], // 查找后的数据
    detail: {}, // 详情数据
    isShow: false, // 详情弹框是否出现
  },
  created: function(){
    this.setTime();
    this.queryBtn();
  },
  mounted: function(){
    this.startTime();
    this.endTime();
    this.$nextTick(function () {
      $('#loader-main').hide();
    })
  },
  methods: {
    toggleShow: function(){
      if (this.num % 2){
        $(".spe-empty").addClass('on');
        $(".hide-or-show").show();
        // $(".hide-or-show").slideDown(500);
      } else {
        $(".hide-or-show").hide();
        // $(".hide-or-show").slideUp(500);
        $(".spe-empty").removeClass('on');
      }
      this.num++;
    },
    startTime: function(){
      var _this = this;
      var startTime = new datePicker();
      startTime.init({
        'trigger': '#start_time', /*按钮选择器，用于触发弹出插件*/
        'type': 'date',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
        'minDate':'1900-1-1',/*最小日期*/
        'maxDate':'2100-12-31',/*最大日期*/
        'onSubmit':function(){/*确认时触发事件*/
          _this.date.start = startTime.value.replace(/-/g,"/");
        },
        'onClose':function(){/*取消时触发事件*/
        }
      });
    },
    endTime: function(){
      var _this = this;
      var endTime = new datePicker();
      endTime.init({
        'trigger': '#end_time', /*按钮选择器，用于触发弹出插件*/
        'type': 'date',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
        'minDate':'1900-1-1',/*最小日期*/
        'maxDate':'2100-12-31',/*最大日期*/
        'onSubmit':function(){/*确认时触发事件*/
          _this.date.end = endTime.value.replace(/-/g,"/");
        },
        'onClose':function(){/*取消时触发事件*/
        }
      });
    },
    queryBtn: function(){
      this.date.connect = this.date.start + ' - ' + this.date.end;
      var _this = this;
      var url = SHOP_INTF + "clientPort/detailsChangesCapital";
      var param = {
        startDate: this.date.start.replace(/\//g, ''),
        endDate: this.date.end.replace(/\//g, ''),
        ts: +new Date()
      };
      $.getJSON(url, param, function(data){
        ZB_Util.throw(data);
        if (data.resultCode != 0) {
          ZB_Util.error(data.msg);
          return;
        }
        _this.dataList = data.detailsList;
      })
    },
    formateTime: function(time,isTrue){
      if (!isTrue) {
        return ZB_Util.formatDate(time); 
      }
      var date = new Date();
      date.setTime(time);
      var m = date.getMonth()+1;
      var d = date.getDate();
      var h = date.getHours();
      var mm = date.getMinutes();
      if (m < 10)
        m = "0"+m;
      if (d < 10)
        d = "0"+d;
      if (h < 10)
        h = "0"+h;
      if (mm < 10)
        mm = "0"+mm;
      return m+"-"+d+" "+h+":"+mm;
    },
    getPreMonth: function(date){
      var arr = date.split('-');  
      var year = arr[0]; //获取当前日期的年份
      var month = arr[1]; //获取当前日期的月份
      var day = arr[2]; //获取当前日期的日
      var days = new Date(year, month, 0);  
      days = days.getDate(); //获取当前日期中月的天数
      var year2 = year;  
      var month2 = parseInt(month) - 1;  
      if (month2 == 0) {  
          year2 = parseInt(year2) - 1;  
          month2 = 12;  
      }  
      var day2 = day;  
      var days2 = new Date(year2, month2, 0);  
      days2 = days2.getDate();  
      if (day2 > days2) {  
          day2 = days2;  
      }  
      if (month2 < 10) {  
          month2 = '0' + month2;  
      }  
      var t2 = year2 + '/' + month2 + '/' + day2;  
      return t2;  
    },
    setTime: function(){
      var start = ZB_Util.formatDate(new Date())
      this.date.end = start.replace(/-/g,"/");
      this.date.start = this.getPreMonth(start);
      this.date.connect = this.date.start;
    },
    showDetail: function(item){
      if (item.count == 0) {
        return;
      }
      this.detail = item;
      this.isShow = true;
    },
    jumpMessage: function(){ // 跳转消息中心
      ZB_Util.jumpMessage();
    }
  }
})