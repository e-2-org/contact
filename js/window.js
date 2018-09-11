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
        var opts="toolbar=no,location=no,directories=no,status=no,resizeable=no,copyhistory=no,menubar=no"
        opts += scrolling? ',scrollbars=yes': ',scrollbars=no';
        if (window.innerWidth) {
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