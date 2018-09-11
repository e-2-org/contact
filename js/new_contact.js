var sh = screen.height;
var sw = screen.width;
//Zooming scripts
function zoomin(divID){
    if (divObj = xGetElementById(divID)) {
        if (xDef(divObj.className)) {
            divObj.className = divObj.className + '_over';
        } else if (xDef(divObj.style) && xDef(divObj.style.fontSize) && xDef(divObj.style.width) && xDef(divObj.style.zIndex)) {
            divObj.style.width = '350px';
            divObj.style.fontSize = '15px';
            divObj.style.zIndex = 100;
        }
    }
}
function zoomout(divID){
    if (divObj = xGetElementById(divID)) {
        if (xDef(divObj.className)) {
            divObj.className = divObj.className.substr(0, (divObj.className.length - 5));
        } else if (xDef(divObj.style) && xDef(divObj.style.fontSize) && xDef(divObj.style.width) && xDef(divObj.style.zIndex)) {
            divObj.style.width = '200px';
            divObj.style.fontSize = '5px';
            divObj.style.zIndex = 99;
        }
    }
}

//window opening script
function openWindow(url,type,scrolling) {
    //set size and position of the window to be opened
    var wt = new Array();
    // key to values stored in wt array
    wt[0] = new Array("WindowWidth", "WindowHeight", "PixelsFromLeft", "PixelsFromTop", "WindowName");
    // put the actual values in the following elements, where the key to the elements denotes the type
    wt[1] = new Array(508, 500, 40, 80, 'Type1');
    wt[2] = new Array(308, 580, 500, 100, 'Type2');
    wt[3] = new Array(308, 360, 400, 20, 'Type3');
    wt[4] = new Array(408, 500, 100, 100, 'Type4');
    wt[5] = new Array(508, 300, 100, 70, 'Type5');
    wt[6] = new Array(508, 540, 80, 50, 'Type6');
    wt[7] = new Array(350, 300, 100, 60, 'Type7');
    wt[8] = new Array(500, 500, 400, 80, 'Type8');
    var t = parseInt(type);
    if (t > 0 && t < wt.length) {
        //store values in an options string
        opts = scrolling? 'scrollbars': 'scrollbars';
        if (document.layers) {
            opts += ",innerWidth="+wt[t][0]+",innerHeight="+wt[t][1]+",screenX="+wt[t][2]+",screenY="+wt[t][3];
        } else {
            opts += ",width="+wt[t][0]+",height="+wt[t][1]+",left="+wt[t][2]+",top="+wt[t][3];
        }
        newWindow = window.open(url, wt[t][4], opts);
        if (window.focus) {
            newWindow.window.focus();
        }
    }
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
function Init()
{
    if (document.layers) {
        document.captureEvents(Event.MOUSEMOVE);
    }
    document.onmousemove = scrollIt;
}
window.onload = Init;
//find position on screen and start scrolling if at the edges
function scrollIt(e){
    x = window.event? event.screenX: e.screenX;
    y = window.event? event.screenY: e.screenY;
    if ((x < l2) || (x > r2) || (y < t2) || (y > b2)) {
        if ((x < l2) || (x > r2)) {
            if (x < l1) {
                scroll_X = -speed1;
            } else if ((x < l2) && (x >= l1)) {
                scroll_X = -speed2;
            } else if (x > r1) {
                scroll_X = speed1;
            } else if ((x > r2) && (x <= r1)) {
                scroll_X = speed2;
            } else {
                scroll_X = 0;
            }
        } else {
            scroll_X = 0;
        }
        if ((y < t2) || (y > b2)) {
            if (y < t1) {
                scroll_Y = -speed1;
            } else if ((y < t2) && (y >= t1)) {
                scroll_Y = -speed2;
            } else if (y > b1) {
                scroll_Y = speed1;
            } else if ((y > b2) && (y <= b1)) {
                scroll_Y = speed2;
            } else {
                scroll_Y = 0;
            }
        } else {
            scroll_Y = 0;
        }
        if ((scroll_Y != 0) || (scroll_X != 0)) {
            startScrolling(scroll_X, scroll_Y);
        }
    } else if ((!isScrollingX) && (!isScrollingY)) {
        return;
    } else {
        stopScrolling();
    }
}
//activate the scroll function if needed
function startScrolling(scroll_X, scroll_Y)
{
    if ((isScrollingX == scroll_X) && (isScrollingY == scroll_Y)) {
        return;
    } else {
        stopScrolling();
        scroll(scroll_X, scroll_Y);
    }
}
//function to stop page scrolling
function stopScrolling()
{
    clearTimeout(timeout);
    isScrollingX = 0;
    isScrollingY = 0;
}
//function to scroll the page
function scroll(scroll_X, scroll_Y)
{
    if (window.scrollBy) {
        window.scrollBy(scroll_X,scroll_Y);
    }
    isScrollingX = scroll_X;
    isScrollingY = scroll_Y;
    timeout = setTimeout("scroll(" + scroll_X + "," + scroll_Y + ")", 1);
}
/**
 * utility functions taken from the x library (http://www.cross-browser.com)
 * Copyright (c) 2004 Michael Foster, Licensed LGPL (gnu.org)
 */
function xGetElementById(e) {
    if (typeof(e) != 'string') {
        return e;
    }
    if (document.getElementById) {
        e = document.getElementById(e);
    } else if (document.all) {
        e = document.all[e];
    } else if (document.layers) {
        e = xLayer(e);
    } else {
        e = null;
    }
    return e;
}
function xLayer(id,root) {
    var i, layer, found = null;
    if (!root) {
        root = window;
    }
    for (i = 0; i < root.document.layers.length; i++) {
        layer = root.document.layers[i];
        if (layer.id == id) {
            return layer;
        }
        if (layer.document.layers.length) {
            found = xLayer(id, layer);
        }
        if (found) {
            return found;
        }
    }
    return null;
}
function xDef() {
    for (var i=0; i < arguments.length; ++i) {
        if (typeof(arguments[i]) == 'undefined') {
            return false;
        }
    }
    return true;
}
