// deal with styles
var styleName = "style" + ((a = getCookie("style")) === null ? 0 : a) + ".css";
document.writeln("<link rel='stylesheet' type='text/css' href='" + styleName + "'>");

// firefox 9.0.1 bugfix
window.onkeydown = function (event) {
    checkKey(event.keyCode, event.shiftKey);
};
window.onkeyup = function (event) {
    startTimer(event.keyCode);
};

function initialize(lookForTimes, checkQueryString) {
    loadOptBoxes();
    var query = ""; // query string for scrambles
    if (checkQueryString) {
        var query = window.location.search.substring(1);
    }
    if (lookForTimes) {
        getSession(); // see if there is a session saved
    } else {
        times = [];
        notes = [];
        comments = [];
        scrambleArr = [];
        window.focus();
    }
    showOptions = 0;
    //toggleOptions(); // options are shown by default
    avgSizes = [50, 5, 12, 100, 1000];
    moSize = 3;
    bestAvg = [[-1, 0], [-1, 0], [-1, 0], [-1, 0], [-1, 0]];
    lastAvg = [[-1, 0], [-1, 0], [-1, 0], [-1, 0], [-1, 0]];
    bestMo = [-1, 0];
    lastMo = [-1, 0];
    bestAvgIndex = [0, 0, 0, 0, 0];
    bestMoIndex = 0;
    bestTime = -1;
    bestTimeIndex = 0;
    worstTime = -1;
    worstTimeIndex = 0;
    clearHighlight();
    if (timerStatus !== 0) {
        clearInterval(timerID);
        clearInterval(inspectionID);
    }
    timerStatus = 3;

    timerupdate = (a = getCookie("timerupdate")) === null ? 1 : a;
    $('toggler').innerHTML =
        (timerupdate === 0) ? "off" :
            (timerupdate === 1) ? "on" :
                (timerupdate === 2) ? "seconds only" :
                    "inspection only";
    useMilli = (a = getCookie("useMilli")) === null ? 0 : a;
    $('millisec').innerHTML = (useMilli === 1) ? "1\/1000 sec" : "1\/100 sec";
    var oldManualEnter = manualEnter;
    manualEnter = (a = getCookie("manualEnter")) === null ? 0 : a;
    if (manualEnter !== oldManualEnter) {
        toggleInput();
        manualEnter = 1 - manualEnter;
    }
    $('tcol').value = (a = getCookie("tColor")) === null ? "00ff00" : a;
    $('bcol').value = (a = getCookie("bColor")) === null ? "white" : a;
    $('fcol').value = (a = getCookie("fColor")) === null ? "black" : a;
    $('lcol').value = (a = getCookie("lColor")) === null ? "blue" : a;
    $('hcol').value = (a = getCookie("hColor")) === null ? "yellow" : a;
    $('memcol').value = (a = getCookie("memColor")) === null ? "green" : a;
    $('inputTimes').innerHTML = (manualEnter === 1) ? "typing" : "timer";
    $('theTime').innerHTML = (manualEnter === 1) ?
        "<input id='timeEntry' size=12 style='font-size:100%'>" +
        " <span onclick='stopTimer(13);' class='a' style='color:" +
        parseColor($('lcol').value) + "'>enter</span>" : "ready";
    timerSize = (a = getCookie("timerSize")) === null ? 2 : a;
    $('theTime').style.fontSize = timerSize + "em";
    scrambleSize = (a = getCookie("scrSize")) === null ? 16 : parseInt(a, 10);
    $('scramble').style.fontSize = scrambleSize + "px";
    $('getlast').style.fontSize = scrambleSize + "px";
    $('theList').style.height = Math.max(16, (timerSize * 1.5)) + "em";
    $('stats').style.height = Math.max(16, (timerSize * 1.5)) + "em";
    inspection = (a = getCookie("inspection")) === null ? 0 : a;
    $('inspec').innerHTML = (inspection === 1) ? "WCA" : "no";
    if (inspection === 0) {
        useBld = (a = getCookie("useBld")) === null ? 0 : a;
    }
    else {
        useBld = 0;
        setCookie("useBld", 0);
    }
    $('bldmode').innerHTML = (useBld === 1) ? "on" : "off";
    useAvgN = (a = getCookie("useAvgN")) === null ? 0 : a;
    $('avgn').innerHTML = (useAvgN === 1) ? "using" : "not using";
    useMoN = (a = getCookie("useMoN")) === null ? 0 : a;
    $('mon').innerHTML = (useMoN === 1) ? "using" : "not using";
    useMono = (a = getCookie("useMono")) === null ? 0 : a;
    $('monospace').innerHTML = (useMono === 1) ? "on" : "off";
    $('scramble').style.fontFamily = (useMono === 1) ? "monospace" : "serif";
    $('getlast').style.color = parseColor($('lcol').value);
    type = (a = getCookie("scrType")) === null ? "333" : a;
    if (query.length > 0) type = query;

    loadList();
    getStats(true);

    scramblers['333'].initialize(null, Math); // hopefully this'll let IE load scramblers
    scramblers['slidy'] = ["", null];

    curTime = new Date(0);
    $('leng').value = len;
    var obj = $('optbox');
    for (var i = 0; i < scrdata.length; i++) {
        for (var j = 0; j < scrdata[i][1].length; j++) {
            if (scrdata[i][1][j][1] === type) {
                obj.selectedIndex = i;
                rescramble(false);
                $('optbox2').selectedIndex = j;
            }
        }
    }
    changeColor();
    scramble = "";
    rescramble2();
}

function rescramble(scramble) {
    var obj = $('optbox');
    var obj2 = $('optbox2');

    var box2 = scrdata[obj.selectedIndex][1];
    for (var i = obj2.options.length - 1; i > 0; i--)
        obj2.remove(i);
    for (var i = 0; i < box2.length; i++)
        obj2.options[i] = new Option(box2[i][0], box2[i][1]);
    len = box2[0][2];
    $('leng').value = len;
    type = box2[0][1];
    if (scramble) {
        setCookie("scrType", type);
        scrambleIt();
        $('getlast').innerHTML = "get last scramble";
    }
}

function rescramble2() {
    var obj = $('optbox');
    var obj2 = $('optbox2');
    var newType = obj2.options[obj2.selectedIndex].value;

    var box2 = scrdata[obj.selectedIndex][1];
    len = box2[obj2.selectedIndex][2];
    $('leng').value = len;
    type = newType;
    setCookie("scrType", type);

    scrambleIt();
    $('getlast').innerHTML = "get last scramble";
}

function rescramble3() {
    len = $('leng').value;
    scrambleIt();
    $('getlast').innerHTML = "get last scramble";
}

function loadOptBoxes() {
    for (var i = 0; i < scrdata.length; i++) {
        $('optbox').options[i] = new Option(scrdata[i][0], "");
    }
}

function startTimer(keyCode) {
    if (timerStatus === 0 && manualEnter === 0 && keyCode === 32 && importFocus === 0) {
        timerStatus = 3;
    } else if (timerStatus === 3 && manualEnter === 0 && keyCode === 32 && (new Date()).getTime() - curTime.getTime() >= 300 && importFocus === 0) {
        if (type === "sqrs") {
            $('scramble').innerHTML = "scramble: loading... ";
        }
        if (inspection === 1) {
            timerStatus = 2;
            inspectionTime = new Date();
            $('theTime').style.color = "red";
            if (timerupdate !== 0) {
                inspectionID = setInterval(updateInspec, (timerupdate === 1) ? 10 : 100);
            }
            else {
                $('theTime').innerHTML = "inspecting";
            }
        } else if (useBld === 1) {
            timerStatus = 4;
            memoTime = new Date();
            $('theTime').style.color = $('memcol').value;
            if (timerupdate === 1 || timerupdate === 2) {
                memoID = setInterval(updateMemo, (timerupdate === 1) ? 10 : 100);
            }
            else {
                $('theTime').innerHTML = "memorizing";
            }
        } else {
            timerStatus = 1;
            startTime = new Date();
            penalty = 0;
            $('theTime').style.color = (nightMode ? "#fff" : $('fcol').value);
            if (timerupdate === 1 || timerupdate === 2) {
                timerID = setInterval(updateTimer, (timerupdate === 1) ? 10 : 100);
            }
            else {
                $('theTime').innerHTML = "running";
            }
        }
    } else if (timerStatus === 4 && keyCode === 32) {
        timerStatus = 1;
        startTime = new Date();
        $('theTime').style.color = (nightMode ? "#fff" : $('fcol').value);
        var memoLength = startTime.getTime() - memoTime.getTime();
        if (timerupdate === 1 || timerupdate === 2) {
            clearInterval(memoID);
            timerID = setInterval(updateMemo, (timerupdate === 1) ? 10 : 100);
        }
        else {
            $('theTime').innerHTML = "running";
        }
    } else if (timerStatus === 2 && keyCode === 32) {
        timerStatus = 1;
        startTime = new Date();
        $('theTime').style.color = (nightMode ? "#fff" : $('fcol').value);
        var inspecLength = startTime.getTime() - inspectionTime.getTime();
        penalty = (inspecLength < 15000) ? 0 : (inspecLength < 17000) ? 2 : 1;
        clearInterval(inspectionID);
        if (timerupdate === 1 || timerupdate === 2) {
            timerID = setInterval(updateTimer, (timerupdate === 1) ? 10 : 100);
        }
        else {
            $('theTime').innerHTML = "running";
        }
    }
}

function stopTimer(keyCode) {
    if (keyCode === 32) {
        $('optbox').blur();
        $('leng').blur();
    }
    if (manualEnter === 1) {
        if (keyCode === 13) {
            var timeStr = $('timeEntry').value;
            var nonzero = false;
            var dnfRegex = new RegExp(".*(DNF|dnf)\\((.*)\\).*");
            if (timeStr.match(/.* .*/)) {
                nonzero = parseTime(timeStr.replace(/(.*) .*/, "$1"), true);
                if (nonzero) { // if time breaks, ignore comments/notes
                    comments[times.length - 1] = timeStr.replace(/.*? (.*)$/, "$1");
                }
            } else if (timeStr.match(dnfRegex)) {
                nonzero = parseTime(dnfRegex.exec(timeStr)[2]);
            } else {
                nonzero = parseTime(timeStr, false);
            }
            if (nonzero) {
                if (timeStr.match(/.*(DNF|dnf).*/)) {
                    notes[times.length - 1] = 1;
                } else if (timeStr.match(/.*\+.*/)) {
                    notes[times.length - 1] = 2;
                } else {
                    notes[times.length - 1] = 0;
                }
                loadList(); // unfortunately have to do this twice ;|
                getStats(false);
            }
            $('timeEntry').value = "";
            if (nonzero) scrambleArr[scrambleArr.length] = scramble;
            rescramble3();
        }
    } else if (timerStatus === 1) {
        timerStatus = (keyCode === 32) ? 0 : 3;
        if (timerupdate === 1 || timerupdate === 2) {
            clearInterval(timerID);
        }
        getTime(penalty);
        scrambleArr[scrambleArr.length] = scramble;
        rescramble3();
    }
}

function checkKey(keyCode, shiftKey) {

    if (keyCode === 13 || (manualEnter === 0 && timerStatus !== 0 && timerStatus !== 3)) { // normally, any key enters a time; with manual enter, only Enter does
        stopTimer(keyCode);
    } else if (keyCode === 8 && manualEnter === 0) { // backspace applies DNF
        if (notes[notes.length - 1] === 1) {
            changeNotes(0);
        } else {
            changeNotes(1);
        }
    } else if ((keyCode === 61 || keyCode === 187) && manualEnter === 0) { // +/= applies +2 penalty
        if (notes[notes.length - 1] === 2) {
            changeNotes(0);
        } else {
            changeNotes(2);
        }
    } else if (keyCode === 173 || keyCode === 189) { // -/_ applies no penalty
        changeNotes(0);
    } else if (keyCode === 46 && !shiftKey && times.length > 0) { // delete removes last solve
        del(times.length - 1);
    } else if (keyCode === 46 && shiftKey) { // shift+delete clears session
        resetTimes();
    }
}

function updateTimer() {
    curTime = new Date();
    var time = curTime.getTime() - startTime.getTime();
    if (timerupdate === 1) {
        $('theTime').innerHTML = pretty(time);
    } else {
        $('theTime').innerHTML = pretty(time).split(".")[0];
    }
}

function updateMemo() {
    curTime = new Date();
    var time = curTime.getTime() - memoTime.getTime();
    if (timerupdate === 1) {
        $('theTime').innerHTML = pretty(time);
    } else {
        $('theTime').innerHTML = pretty(time).split(".")[0];
    }
}

function updateInspec() {
    curTime = new Date();
    var time = curTime.getTime() - inspectionTime.getTime();
    $('theTime').innerHTML = (time > 17000) ? "DNF" : (time > 15000) ? "+2" : 15 - Math.floor(time / 1000);
}

function getTime(note) {
    curTime = new Date();

    if (useBld === 1) {
        var time = curTime.getTime() - memoTime.getTime();
        var mtime = startTime.getTime() - memoTime.getTime();
    }
    else {
        var time = curTime.getTime() - startTime.getTime();
    }
    times[times.length] = time;
    notes[notes.length] = note;
    if (useBld === 1) {
        comments[comments.length] = pretty(mtime)
    }
    else {
        comments[comments.length] = "";
    }
    $('theTime').innerHTML = pretty(time);
    clearHighlight();
    loadList();
    getStats(true); // should be false, but it doesn't hurt
}

function parseTime(s, importing) {
    var time = 0;
    var arr = s.split(":");
    if (arr.length === 3) {
        time = 3600000 * parseInt(arr[0]) + 60000 * parseInt(arr[1]) + 1000 * parseFloat(arr[2]);
    } else if (arr.length === 2) {
        time = 60000 * parseInt(arr[0]) + 1000 * parseFloat(arr[1]);
    } else if (arr.length === 1) {
        time = 1000 * parseFloat(arr[0]);
    }
    time = Math.round(time);
    if (isNaN(time)) time = 0;
    if (time !== 0) {	// don't insert zero-times
        if (!importing) {
            notes[notes.length] = 0;
            comments[comments.length] = "";
        } else if (notes[times.length] === 2) {
            time -= 2000;
        }
        times[times.length] = time;
        if (!importing) {
            clearHighlight();
            loadList();
            getStats(false);
        }
        return true;
    } else {
        return false;
    }
}

function resetTimes() {
    if (confirm("Are you sure you want to delete ALL of your times?")) {
        initialize(false, false);
    }
}

function loadList() {
    var data = [-1, [null], [null]];
    var s = "times (<span onclick='resetTimes();' class='a'>reset</span>, <span onclick='toggleImport();' class='a'>import</span>):<br>";
    // get the best and worst time for the highlighted average
    if (highlightStop !== -1 && (highlightStop - highlightStart) > 1) {
        var mean = 0;
        if (highlightID > 10 && (highlightID % 10) > 1) mean = 1; // check to see if this is a mean-of-N or not
        if (mean) {
            data = getMeanSD(highlightStart, highlightStop - highlightStart + 1, false);
        } else {
            data = getAvgSD(highlightStart, highlightStop - highlightStart + 1, false);
        }
    }
    for (var i = 0; i < times.length; i++) {
        if (i === highlightStart) {
            s += "<span style='background-color: " + highlightColor + "'>";
        }
        if (data[1].indexOf(i - highlightStart) > -1 || data[2].indexOf(i - highlightStart) > -1) s += "(";
        var time = times[i];
        if (notes[i] === 0) {
            s += "<span onclick='del(" + i + ");' class='b'>" + pretty(time);
        }
        else if (notes[i] === 2) {
            s += "<span onclick='del(" + i + ");' class='b'>" + pretty(time + 2000) + "+";
        }
        else {
            s += "<span onclick='del(" + i + ");' class='b'>DNF(" + pretty(time) + ")";
        }
        s += (comments[i] ? "[" + comments[i] + "]" : "") + "<\/span>";
        if (data[1].indexOf(i - highlightStart) > -1 || data[2].indexOf(i - highlightStart) > -1) s += ")";
        if (i === highlightStop) {
            s += "<\/span>";
        }
        s += (i === times.length - 1) ? " " : ", ";
    }
    $('theList').innerHTML = s;
    saveSession();
    // move scrollbar to bottom:
    var window = $('theList');
    window.scrollTop = window.scrollHeight;
    changeColor();
}

function del(index) {
    var prettyTime = pretty(times[index]);
    if (notes[index] === 1) prettyTime = "DNF(" + prettyTime + ")";
    if (notes[index] === 2) prettyTime = pretty(times[index] + 2000) + "+";
    if (confirm("Are you sure you want to delete the " + prettyTime + "?")) {
        for (var i = index; i < times.length - 1; i++) {
            times[i] = times[i + 1];
            notes[i] = notes[i + 1];
            comments[i] = comments[i + 1];
            scrambleArr[i] = scrambleArr[i + 1];
        }
        times.pop();
        notes.pop();
        comments.pop();
        scrambleArr.pop();
        clearHighlight();
        loadList();
        getStats(true);
    }
}

function getlastscramble() {
    $('scramble').innerHTML = "scramble: " + scramble + "<br> last scramble: " + lastscramble;
    $('getlast').innerHTML = "";
}

function comment() {
    var newComment = prompt("Enter your comment for the most recent solve:", comments[comments.length - 1]);
    if (newComment !== null) {
        comments[comments.length - 1] = newComment
    } else {
        comments[comments.length - 1] = "";
    }
    loadList();
}

function getBrowser() {
    // http://www.quirksmode.org/js/detect.html
    var versionSearchString;
    var dataBrowser = [
        {string: navigator.userAgent, subString: "Chrome", identity: "Chrome"},
        {string: navigator.userAgent, subString: "Safari", identity: "Chrome"},
        {string: navigator.userAgent, subString: "Firefox", identity: "Firefox"},
        {string: navigator.userAgent, subString: "MSIE", identity: "IE", versionSearch: "MSIE"}];

    function searchString(data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) !== -1)
                    return data[i].identity;
            } else if (dataProp)
                return data[i].identity;
        }
    }

    return searchString(dataBrowser) || "An unknown browser";
}