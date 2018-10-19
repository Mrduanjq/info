function hide4zbwx() {
    if (/favorite/.test(location.href) || /userhelp/.test(location.href)) return;
    if (document.querySelector('.navbar-custom-top')) {
      document.querySelector('.navbar-custom-top').style.display='none';
    }
    if (document.querySelector('.navbar-absolute-bottom')) {
      document.querySelector('.navbar-absolute-bottom').style.display='none';
    }
}
hide4zbwx();
setInterval(hide4zbwx, 500);

// favorite
// if (/favorite/.test(location.href)){
//     var head = document.getElementsByTagName('head')[0];
//     var link = document.createElement('link');
//     link.type = 'text/css';
//     link.rel = 'stylesheet';
//     link.href = 'http://ylshop-app.bjuerong.cn:8000/static/css/hide.css';
//     head.appendChild(link);
//     var op = document.createElement("div");
//     op.id='zbback';
//     op.innerHTML = '<img src="http://ylshop-app.bjuerong.cn:8000/static/images/goback.png" onclick="document.getElementById(\'zbback\').style.display=\'none\';history.go(-1)">';
//     document.body.appendChild(op);
// }
