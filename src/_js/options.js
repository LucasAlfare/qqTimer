var useMilli = 0;
var manualEnter = 0;
var showOptions = 0;
var timerSize = 2;
var scrambleSize = 16;
var inspection = 0;
var useBld = 0;
var penalty = 0;
var useAvgN = 0;
var viewstats = 1;
var importFocus = 0;
var typingFocus = false;
var validColors = ["black", "brown", "white", "purple", "violet", "red", "orange", "yellow", "green", "cyan", "blue", "gray", "grey", "pink"];
var highlightColor;

function toggleImport() {
    if ($('import').style.display === 'block') {
        $('import').style.display = 'none';
        importFocus = 0;
    } else {
        $('import').style.display = 'block';
        importFocus = 1;
    }
}

function toggleTimer() {
    stopTimer();
    timerupdate = (timerupdate + 1) % 4;
    setCookie("timerupdate", timerupdate);
    $('toggler').innerHTML =
        (timerupdate === 0) ? "off" :
            (timerupdate === 1) ? "on" :
                (timerupdate === 2) ? "seconds only" :
                    "inspection only";
}

function toggleMilli() {
    useMilli = 1 - useMilli;
    setCookie("useMilli", useMilli);
    $('millisec').innerHTML = (useMilli === 1) ? "1\/1000 sec" : "1\/100 sec";
    loadList();
    getStats(true);
}

function toggleBld() {
    if (inspection === 0) {
        useBld = 1 - useBld;
    }
    setCookie("useBld", useBld);
    $('bldmode').innerHTML = (useBld === 1) ? "on" : "off";
}

function toggleMono() {
    useMono = 1 - useMono;
    setCookie("useMono", useMono);
    $('monospace').innerHTML = (useMono === 1) ? "on" : "off";
    $('scramble').style.fontFamily = (useMono === 1) ? "monospace" : "serif";
    $('getlast').style.color = parseColor($('lcol').value);
}

function toggleInput() {
    if (manualEnter === 0) stopTimer();
    manualEnter = 1 - manualEnter;
    typingFocus = false;
    setCookie("manualEnter", manualEnter);
    $('inputTimes').innerHTML = (manualEnter === 1) ? "typing" : "timer";
    $('theTime').innerHTML = (manualEnter === 1) ?
        "<input id='timeEntry' size=12 style='font-size:100%'>" +
        " <span onclick='stopTimer(13);' class='a' style='color:" +
        parseColor($('lcol').value) + "'>enter</span>" : "ready";
    if ($('timeEntry') !== null) {
        $('timeEntry').onfocus = function () {
            typingFocus = true;
        };
        $('timeEntry').onblur = function () {
            typingFocus = false;
        }
    }
}

function toggleOptions() {
    showOptions = 1 - showOptions;
    $('showOpt').innerHTML = (showOptions === 1) ? "hide" : "show";
    $('options').style.display = (showOptions === 1) ? "" : "none";
}

function increaseSize() {
    timerSize++;
    setCookie("timerSize", timerSize);
    $('theTime').style.fontSize = timerSize + "em";
    $('theList').style.height = Math.max(16, (timerSize * 1.5)) + "em";
    $('stats').style.height = Math.max(16, (timerSize * 1.5)) + "em";
}

function decreaseSize() {
    if (timerSize >= 2) timerSize--;
    setCookie("timerSize", timerSize);
    $('theTime').style.fontSize = timerSize + "em";
    $('theList').style.height = Math.max(16, (timerSize * 1.5)) + "em";
    $('stats').style.height = Math.max(16, (timerSize * 1.5)) + "em";
}

function increaseScrambleSize() {
    scrambleSize += 4;
    setCookie("scrSize", scrambleSize);
    $('scramble').style.fontSize = scrambleSize + "px";
    $('getlast').style.fontSize = scrambleSize + "px";
}

function decreaseScrambleSize() {
    if (scrambleSize > 8) scrambleSize -= 4;
    setCookie("scrSize", scrambleSize);
    $('scramble').style.fontSize = scrambleSize + "px";
    $('getlast').style.fontSize = scrambleSize + "px";
}

function toggleInspection() {
    inspection = 1 - inspection;
    if (inspection === 1) {
        useBld = 0;
    }
    setCookie("useBld", useBld);
    setCookie("inspection", inspection);
    $('inspec').innerHTML = (inspection === 1) ? "WCA" : "no";
    $('bldmode').innerHTML = (useBld === 1) ? "on" : "off";
}

function toggleAvgN() {
    useAvgN = 1 - useAvgN;
    setCookie("useAvgN", useAvgN);
    $('avgn').innerHTML = (useAvgN === 1) ? "using" : "not using";
    getStats(true);
}

function toggleMoN() {
    useMoN = 1 - useMoN;
    setCookie("useMoN", useMoN);
    $('mon').innerHTML = (useMoN === 1) ? "using" : "not using";
    getStats(true);
}

function toggleStatView() {
    viewstats = 1 - viewstats;
    getStats(viewstats);
}

function changeColor() {
    $('menu').bgColor = parseColor($('tcol').value);
    if (nightMode) {
        document.bgColor = "#000";
        document.body.style.color = "#fff";
    } else {
        document.bgColor = parseColor($('bcol').value);
        document.body.style.color = parseColor($('fcol').value);
    }

    if (getBrowser() !== "IE") {
        var links = document.getElementsByClassName('a');
        for (var i = 0; i < links.length; i++) {
            links[i].style.color = parseColor($('lcol').value);
        }
    } else {
        var links = document.getElementsByTagName('span');
        for (var i = 0; i < links.length; i++) {
            if (links[i].className === "a") {
                links[i].style.color = parseColor($('lcol').value);
            }
        }
    }

    highlightColor = parseColor($('hcol').value);
    $('getlast').style.color = parseColor($('lcol').value);
    setCookie("tColor", $('tcol').value);
    setCookie("bColor", $('bcol').value);
    setCookie("fColor", $('fcol').value);
    setCookie("lColor", $('lcol').value);
    setCookie("hColor", $('hcol').value);
    setCookie("memColor", $('memcol').value);
}

function parseColor(str) {
    for (var i = 0; i < validColors.length; i++) {
        if (str === validColors[i]) {
            return str;
        }
    }
    while (str.length < 6) str += "0";
    return "#" + str;
}

function resetColors() {
    $('tcol').value = "00ff00";
    $('bcol').value = "white";
    $('fcol').value = "black";
    $('lcol').value = "blue";
    $('hcol').value = "yellow";
    $('memcol').value = "green";
    changeColor();
}

function toggleNightMode() {
    nightMode = !nightMode;
    if (nightMode) {
        document.bgColor = "#000";
        document.body.style.color = "#fff";
        $('theTime').style.color = "#fff";
    } else {
        document.bgColor = parseColor($('bcol').value);
        document.body.style.color = parseColor($('fcol').value);
        $('theTime').style.color = parseColor($('fcol').value);
    }
}

/* setCookie and getCookie functions originally from http://www.quirksmode.org/js/cookies.html */
function setCookie(name, value) {
    if (window.localStorage !== undefined) {
        window.localStorage.setItem(name, value);
        return;
    }
    var expires = "; expires=" + new Date(3000, 00, 01).toGMTString() + "; path=/";
    var cookies = document.cookie.split(';');
    var x = "qqTimer=";
    var found = false;
    for (var i = 0; i < cookies.length; i++) {
        var c = cookies[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(x) === 0) { // this is the qqtimer cookie
            found = true;
            var str = c.substring(x.length, c.length);
            var options = str.split('.');
            var good = false;
            for (var j = 0; j < options.length; j++) {
                if (options[j].split(',')[0] === name) {
                    good = true;
                    options[j] = name + "," + value;
                }
            }
            if (!good) {
                options[options.length] = name + "," + value;
            }
            var s = x;
            for (var j = 0; j < options.length; j++) {
                if (j > 0) s += ".";
                s += options[j];
            }
            document.cookie = s + expires;
        }
    }
    if (!found) {
        document.cookie = x + name + "," + value + expires;
    }
}

function getCookie(name) {
    if (window.localStorage !== undefined) {
        var value = window.localStorage.getItem(name);
        if (value !== null) return value;
    }

    var cookies = document.cookie.split(';');
    var x = "qqTimer=";
    for (var i = 0; i < cookies.length; i++) {
        var c = cookies[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(x) === 0) { // this is the qqtimer cookie
            var str = c.substring(x.length, c.length);
            var options = str.split('.');
            for (var j = 0; j < options.length; j++) {
                if (options[j].split(',')[0] === name) {
                    return options[j].split(',')[1];
                }
            }
        }
    }
    return null;
}

function saveSession() {
    var id = (document.getElementById("sessbox").selectedIndex === null) ? 0 : document.getElementById("sessbox").selectedIndex;
    var name = "session" + id;

    if (window.localStorage !== undefined) {
        var value = "";
        for (var i = 0; i < times.length; i++) {
            value += times[i];
            if (comments[i] !== "" && comments[i] !== null) {
                value += "|" + comments[i];
            }
            if (notes[i] === 1) value += "-";
            if (notes[i] === 2) value += "+";
            if (i < times.length - 1) value += ",";
        }
        value += ">";

        window.localStorage.setItem(name, value);
        return;
    }

    // format: cookie name "sessionY|X", comma separated, ">" at end
    // X is a number and we use another one if we run out of space
    // Y is the session number
    // time (in ms) with + for +2 or - for DNF
    var expires = "; expires=" + new Date(3000, 00, 01).toGMTString() + "; path=/";
    var cnt = 1;
    var s = name + "|" + cnt + "=";
    for (var i = 0; i < times.length; i++) {
        if (s.length < 3950) { // just in case!
            s += times[i];
            if (comments[i] !== "" && comments[i] !== null) {
                s += "|" + comments[i];
            }
            if (notes[i] === 1) s += "-";
            if (notes[i] === 2) s += "+";
            if (i < times.length - 1) s += ",";
        } else {
            document.cookie = s + expires;
            cnt++;
            s = name + "|" + cnt + "=";
            i--;
        }
    }
    document.cookie = s + ">" + expires;
}

function getSession() {
    var id = (document.getElementById("sessbox").selectedIndex === null) ? 0 : document.getElementById("sessbox").selectedIndex;
    times = [];
    notes = [];
    comments = [];
    scrambleArr = [];
    $("sessbox").blur();

    var s = null;
    if (window.localStorage !== undefined) { // try to load text from localStorage
        s = window.localStorage.getItem("session" + id);
    }

    if (s === null) { // not in localStorage, load from cookie
        s = "";
        var cookies = document.cookie.split(';');
        var cnt = 1;
        var x = "session" + id + "|" + cnt + "=";
        var found = true;
        while (found) {
            found = false;
            for (var i = 0; i < cookies.length; i++) {
                var c = cookies[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(x) === 0) { // the right cookie
                    s += c.substring(x.length, c.length);
                    if (s.indexOf(">") === -1) {
                        found = true;
                        cnt++;
                        x = "session" + id + "|" + cnt + "=";
                        break;
                    }
                }
            }
        }
    }

    if (s === null) {
        return;
    } else if (s.length === 0) {
        return;
    }

    var t = s.split(",");
    if (t[0] !== ">") {
        for (var j = 0; j < t.length; j++) {

            if (t[j].slice(-1) === ">") {
                t[j] = t[j].slice(0, t[j].length - 1);
            }
            if (t[j].slice(-1) === "-") {
                notes[j] = 1;
                t[j] = t[j].slice(0, t[j].length - 1);
            } else if (t[j].slice(-1) === "+") {
                notes[j] = 2;
                t[j] = t[j].slice(0, t[j].length - 1);
            } else {
                notes[j] = 0;
            }
            var q = t[j].split("|");
            times[j] = parseInt(q[0]);
            comments[j] = (q[1] !== null && q[1] !== "") ? q[1] : "";
            scrambleArr[j] = "";
        }
    }
    clearHighlight();
}