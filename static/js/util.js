var SHOP_INTF = "/gyxq_app/";
var PRICE_SOCKET = "http://ylshop-market.bjuerong.cn:8887";
var ERROR_NOT_LOGIN = 5; // 未登录错误
var ERROR_BALANCE_NOT_ENOUGH = "0020"; // 账户余额不足
var DLS_EXCHANGE_ID = 5; // 大理石交易所ID

var ZB_Util = {
  os: '',
  version: function(){
    var u = navigator.userAgent;
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
      this.os = 'android';
    } else {
      this.os = 'ios';
    }
  },
  isAndroid: function(){
    if (this.os == 'android')
      return true
    return false;
  },
  isIOS: function(){
    if (this.os == 'ios')
      return true
    return false;
  },
  jumpCharge: function(){
    var url = SHOP_INTF + 'clientPort/accountInfoList';
    var params = {
      ts: +new Date()
    };
    $.getJSON(url, params, function(data){
      if (0 != data.resultCode) {
        ZB_Util.throw(data);
        return;
      }
      if (ZB_Util.isAndroid()) {
        JSInterface.jumpToCharge();
      } else if (ZB_Util.isIOS()) {
        window.webkit.messageHandlers.jumpToCharge.postMessage(null);
      }
    });
  },
  jumpMessage: function(){
    if (this.isIOS()) {
      window.webkit.messageHandlers.jumpToMessage.postMessage(null);
    } else if (this.isAndroid()) {
      JSInterface.jumpToMessage();
    }
  },
  jumpCustomerServer: function(){
    if (this.isIOS()) {
      window.webkit.messageHandlers.jumpToKeFu.postMessage(null);
    } else if (this.isAndroid()) {
      JSInterface.jumpToKeFu();
    }
  },
  backApp: function(){
    if (this.isAndroid()) {
      JSInterface.finish();
    } else if (this.isIOS()) {
      window.webkit.messageHandlers.finish.postMessage(null);
    }
  },
  formatPriceDate: function(time){
    var date = new Date();
    date.setTime(time);
    var h = date.getHours();
    var mm = date.getMinutes();
    if (h < 10)
      h = "0"+h;
    if (mm < 10)
      mm = "0"+mm;
    return h+":"+mm;
  },
  formatDate: function(time){
    var date = new Date();
    date.setTime(time);
    var y = date.getFullYear();
    var m = date.getMonth()+1;
    var d = date.getDate();
    if (m < 10)
      m = "0"+m;
    if (d < 10)
      d = "0"+d;
    return y+"-"+m+"-"+d;
  },
  formatTime: function(time){
    var date = new Date();
    date.setTime(time);
    var y = date.getFullYear();
    var m = date.getMonth()+1;
    var d = date.getDate();
    var h = date.getHours();
    var mm = date.getMinutes();
    var s = date.getSeconds();
    if (m < 10)
      m = "0"+m;
    if (d < 10)
      d = "0"+d;
    if (h < 10)
      h = "0"+h;
    if (mm < 10)
      mm = "0"+mm;
    if (s < 10)
      s = "0"+s;
    return y+"-"+m+"-"+d+" "+h+":"+mm+":"+s;
  },
  getParam: function(key){
    var group = location.href.match(eval('/'+key+'=([^&]+)/'));
    if (group) {
      return group[1];
    }
    return null;
  },
  getCookie: function(key){
    var search = key + "=";
    var begin = document.cookie.indexOf(search);
    if (begin != -1) {
      begin += search.length;
      var end = document.cookie.indexOf(";", begin);
      if (end == -1) end = document.cookie.length;
      return unescape(document.cookie.substring(begin, end));
    }
    return;
  },
  setCookie: function(key, value, hours){
    var date = new Date();
    if (typeof(hours) == "undefined") {
      hours = 30 * 24;
    }
    date.setTime(date.getTime() + hours * 3600 * 1000);
    document.cookie = key+"="+escape(value)+";expires="+date.toUTCString();
  },
  substr: function(str){
    var len = 25;
    if (str.length > len) {
      return str.substr(0, len) + " ...";
    }
    return str;
  },
  throw: function(data){
    if (data.resultCode === '1' || data.resultCode === '5') { // TOKEN失效错误
      if (this.isAndroid()) {
        JSInterface.jumpToLogin();
      } else if (this.isIOS()) {
        window.webkit.messageHandlers.jumpToLogin.postMessage(null);
      }
    }
  },
  error: function(msg, url){
    if (typeof(url) == 'undefined') {
      layer.alert(msg);
    } else {
      layer.alert(msg, function(index){
        location.href = url;
      });
    }
  },
  success: function(msg, url){
    layer.alert(msg, function(index){
      location.href = url;
    });
  },
  msg: function(msg, url){
    layer.msg(msg, {shift:0}, function(){
      if (typeof(url) != 'undefined') {
        location.href = url;
      }
    });
  }
};
ZB_Util.version();
$(function(){
  $(".back").on("click", function(){
    ZB_Util.backApp();
  })
})

if (typeof Object.assign != "function") {
  Object.assign = function(target) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}