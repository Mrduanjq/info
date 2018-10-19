var winW = document.documentElement.clientWidth;
var winH = document.documentElement.clientHeight
if (winW > 750) {
  document.documentElement.style.fontSize = "100px";
} else {
  document.documentElement.style.fontSize = winW / 750 * 100 + "px";
}
// document.writeln('<div id="loader-main"><div id="loader-container"><img id="loadingText" src="static/images/loading_in.gif"></div></div>');
// document.writeln('<link rel="stylesheet" type="text/css" href="static/css/style.css">');