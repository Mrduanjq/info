// (function(win,doc){
//     function change(){
//       var winW = document.documentElement.clientWidth;
//       var winH = document.documentElement.clientHeight
//       if (winW > 750) {
//         document.documentElement.style.fontSize = "100px";
//       } else {
//         document.documentElement.style.fontSize = winW / 750 * 100 + "px";
//       }
//     }
//     change();
//     win.addEventListener('resize',change,false);
// })(window,document);

function sliderPhone(id){


  // var bot = document.getElementById('bot');
  //  bot.addEventListener('touchstart', function () { alert('touchstart'); });


   function creatTouchstartEventAndDispatch (el,eventName) {
        var event = document.createEvent('Events');
        event.initEvent(eventName, true, true);
        el.dispatchEvent(event);
   }


    var oBox = document.getElementById(id);
    var oUl = oBox.querySelector('ul');
    var oOl = oBox.querySelector('ol');
    var oLi = oOl.children;
    var aLi = oUl.children;
    var imgNums = aLi.length;
    if(imgNums<=1) {
        oUl.style.transform = "translateX(0)";
        oOl.style.display = "none";
        return;
    };
    var iNow = 1;
    var oNow = 0;
    var x = -iNow*aLi[0].offsetWidth;
    var firstLi = aLi[imgNums-1].cloneNode(true);
    var lastLi = aLi[0].cloneNode(true);
    oUl.insertBefore(firstLi,aLi[0]);
    oUl.appendChild(lastLi);
    //console.log(aLi[1]);
    //console.log(lastLi);
    //在这里设置一个开关,是css运动结束后解锁
    var bReady = true;
    oUl.addEventListener('touchstart',function(ev){
        // if(bReady==false){return;}
        // bReady = false;
        oUl.style.transition = 'none';
        var disX = ev.targetTouches[0].pageX - x;
        var downX = ev.targetTouches[0].pageX;
        function point(num){ //角标
          for(var i=0; i<oLi.length; i++){
            oLi[i].className = '';
          }
          oLi[num].className = "on";
        }
        function fnMove(ev){
            x = ev.targetTouches[0].pageX - disX;
            oUl.style.transform = 'translate3d('+x+'px,0,0)';
        }
        function fnEnd(ev){
            var upX = ev.changedTouches[0].pageX;
            //判断是否移动距离大于50
            if(Math.abs(upX - downX)>50){
                //左边移动
                if(upX - downX<0){
                    iNow++;
                    oNow++;
                    if(iNow==aLi.length){iNow=aLi.length-1;}
                    
                    if(oNow>imgNums-1)oNow=0;
                    point(oNow);
                }else{
                //右边移动
                    iNow--;
                    oNow--;
                    if(iNow==-1){iNow=0;}
                    if(oNow<0) oNow= imgNums-1;
                    point(oNow);
                }
            }
            //储存此时ul的位置
            x = -iNow*aLi[0].offsetWidth;
            oUl.style.transform = 'translate3d('+x+'px,0,0)';
            oUl.style.transition = '200ms all ease';
            
            //监听li 当移动到两端的li时  瞬间移回
            function tEnd(){
                if(iNow==imgNums+1){
                    iNow=1;
                }
                if(iNow==0){iNow=imgNums;}
                oUl.style.transition = 'none'
                x = -iNow*aLi[0].offsetWidth;
                oUl.style.transform = 'translate3d('+x+'px,0,0)';
                bReady = true;
            }
            oUl.addEventListener('transitionend',tEnd,false);
            //释放内存
            document.removeEventListener('touchend',fnEnd,false);
            document.removeEventListener('touchmove',fnMove,false);
        }

        document.addEventListener('touchmove',fnMove,false);
        document.addEventListener('touchend',fnEnd,false);
        //阻止默认事件
        // ev.preventDefault();
    },false);
    // setInterval(function(){
    //   creatTouchstartEventAndDispatch(oUl,"touchstart");
    //   creatTouchstartEventAndDispatch(oUl,"touchmove");
    //   creatTouchstartEventAndDispatch(oUl,"touchend");
    // },1000)
}
