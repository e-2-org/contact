<!--
var sh=screen.height;
var sw=screen.width;
if(!is.ie4up&&!is.nav6up){ 
  alert("This page will only work in:\n\n* Netscape 6+\n* Internet Explorer 4+");
}
//Zooming scripts
function zoomin(divID){
  divObj=document.getElementById(divID);
	divObj.style.fontSize = "15px";
	divObj.style.width = 350;
	divObj.style.zIndex = 100;
}
function zoomout(divID){
  divObj=document.getElementById(divID);
	divObj.style.fontSize = "5px";
	divObj.style.width = 200;
	divObj.style.zIndex = 0;
}

//window opening script
function openWindow(url,type,scrolling) {
	//set size and position of the window to be opened
	var WindowWidth;
	var WindowHeight;
	var PixelsFromLeft;
	var PixelsFromTop;
	var WindowName;
	if(type=="1"){
		WindowWidth = 508;
		WindowHeight = 500;
		PixelsFromLeft = 40;
		PixelsFromTop = 80;
		WindowName = "Type1";
	} else if (type=="2"){
		WindowWidth = 308;
		WindowHeight = 580;
		PixelsFromLeft = 500;
		PixelsFromTop = 100;
		WindowName = "Type2";
	} else if (type=="3"){
 		WindowWidth = 308;
		WindowHeight = 360;
		PixelsFromLeft = 400;
		PixelsFromTop = 20;
		WindowName = "Type3";
	} else if (type=="4"){
		WindowWidth = 408;
		WindowHeight = 500;
		PixelsFromLeft = 100;
		PixelsFromTop = 100;
		WindowName = "Type4";
	} else if (type=="5"){
		WindowWidth = 508;
		WindowHeight = 300;
		PixelsFromLeft = 100;
		PixelsFromTop = 70;
		WindowName = "Type5";
	} else if (type=="6"){
		WindowWidth = 508;
		WindowHeight = 540;
		PixelsFromLeft = 80;
		PixelsFromTop = 50;
		WindowName = "Type6";
	} else if (type=="7"){
		WindowWidth = 350;
		WindowHeight = 300;
		PixelsFromLeft = 100;
		PixelsFromTop = 60;
		WindowName = "Type7";
	} else if (type=="8"){
		WindowWidth = 500;
		WindowHeight = 500;
		PixelsFromLeft = 400;
		PixelsFromTop = 80;
		WindowName = "Type8";
	} else {
		return;
	}
	//store values in an options string
	var opts="toolbar=no,location=no,directories=no,status=no,resizeable=no,copyhistory=no,menubar=no"
	if(scrolling){
		opts = opts+",scrollbars=yes"
	}else{
	    opts = opts+",scrollbars=no"
	}
	if(is.nav6up){
		opts=opts+",innerWidth="+WindowWidth+",innerHeight="+WindowHeight+",screenX="+PixelsFromLeft+",screenY="+PixelsFromTop;
	}else{
		opts=opts+",width="+WindowWidth+",height="+WindowHeight+",left="+PixelsFromLeft+",top="+PixelsFromTop;
	}
	newWindow = window.open(url,WindowName,opts);
	newWindow.window.focus();
}

//scrolling scripts

//scroll speeds for the zones
var speed1=8;
var speed2=3;

//global variables
var isScrollingX=0;
var isScrollingY=0;
var scroll_X;
var scroll_Y;
var timeout=0;

//define zones around the sides of the screen
var t1=Math.floor(sh/12);
var t2=Math.floor(sh/6);
var b1=Math.floor(sh-(sh/12));
var b2=Math.floor(sh-(sh/6));
var l1=Math.floor(sw/12);
var l2=Math.floor(sw/6);
var r1=Math.floor(sw-(sw/12));
var r2=Math.floor(sw-(sw/6));

//initialise
function Init(){
	document.onmousemove=scrollIt;
}

//find position on screen and start scrolling if at the edges
function scrollIt(e){
	x=(is.nav6up)?e.screenX:event.screenX;
	y=(is.nav6up)?e.screenY:event.screenY;
	if((x<l2)||(x>r2)||(y<t2)||(y>b2)){
		if((x<l2)||(x>r2)){
			if(x<l1){
				scroll_X = -speed1;
			}else if((x<l2)&&(x>=l1)){
				scroll_X = -speed2;
			}else if(x>r1){
				scroll_X = speed1;
			}else if((x>r2)&&(x<=r1)){
				scroll_X = speed2;
			}else{
				scroll_X = 0;
			}
		}else{
			scroll_X = 0;
		}
		if((y<t2)||(y>b2)){
			if(y<t1){
				scroll_Y = -speed1;
 			}else if((y<t2)&&(y>=t1)){
				scroll_Y = -speed2;
			}else if(y>b1){
				scroll_Y = speed1;
			}else if((y>b2)&&(y<=b1)){
				scroll_Y = speed2;
			}else{
				scroll_Y = 0;
			}
		}else{
			scroll_Y = 0;
		}
		if((scroll_Y!=0)||(scroll_X!=0)){
			startScrolling(scroll_X,scroll_Y);
		}
	}else if((!isScrollingX)&&(!isScrollingY)){
		return;
	}else{
		stopScrolling();
	}
}
//activate the scroll function if needed
function startScrolling(scroll_X,scroll_Y){
	if((isScrollingX==scroll_X)&&(isScrollingY==scroll_Y)){
		return;
	}else{
		stopScrolling();
		scroll(scroll_X,scroll_Y);
	}
}
//function to stop page scrolling
function stopScrolling(){
	clearTimeout(timeout);
	isScrollingX=0;
	isScrollingY=0;
}
//function to scroll the page
function scroll(scroll_X,scroll_Y){
	window.scrollBy(scroll_X,scroll_Y);
	isScrollingX=scroll_X;
	isScrollingY=scroll_Y;
	timeout=setTimeout("scroll("+scroll_X+","+scroll_Y+")",1);
}
//-->
