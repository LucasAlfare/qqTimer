var avgSizes, bestAvg, lastAvg, bestAvgIndex;
var bestTime, bestTimeIndex, worstTime, worstTimeIndex;
var moSize, bestMo, lastMo, bestMoIndex;

function getStats(recalc) {
    var avgSizes2 = (avgSizes.slice(1 - useAvgN)).sort(numsort);
    var numdnf = 0, sessionavg, sessionmean;
    if (recalc) {
        var theStats = getAllStats();
        numdnf = theStats[0];
        sessionavg = theStats[1];
        sessionmean = theStats[2];
    } else {
        // update averages and best time / worst time.
        var index = times.length - 1;
        var thisTime = (notes[index] === 1) ? -1 : times[index] + notes[index] * 1000;
        if (bestTime < 0 || (thisTime !== -1 && thisTime < bestTime)) {
            bestTime = thisTime;
            bestTimeIndex = index;
        }
        if (thisTime > worstTime) {
            worstTime = thisTime;
            worstTimeIndex = index;
        }
        for (var j = 0; j < avgSizes2.length; j++) {
            if (times.length < avgSizes2[j]) {
                break;
            } else {
                lastAvg[j] = getAvgSD(times.length - avgSizes2[j], avgSizes2[j], true);
                if (bestAvg[j][0] < 0 || (lastAvg[j][0] !== -1 && lastAvg[j][0] < bestAvg[j][0])) {
                    bestAvg[j] = lastAvg[j];
                    bestAvgIndex[j] = times.length - avgSizes2[j];
                }
            }
        }
        if (times.length >= moSize) {
            lastMo = getMeanSD(times.length - moSize, moSize, true);
            if (bestMo[0] < 0 || (lastMo[0] !== -1 && lastMo[0] < bestMo[0])) {
                bestMo = lastMo;
                bestMoIndex = times.length - moSize;
            }
        }
        var sessionsum = 0;
        for (var i = 0; i < times.length; i++) {
            var thisTime = (notes[i] === 1) ? -1 : times[i] + notes[i] * 1000;
            if (thisTime === -1) {
                numdnf++;
            }
            else {
                sessionsum += thisTime;
            }
        }
        sessionavg = getAvgSD(0, times.length, true);
        sessionmean = (numdnf === times.length) ? -1 : (sessionsum / (times.length - numdnf));
    }

    var s = "stats: (<span id='hidestats' onclick='toggleStatView()' class='a'>" + (viewstats ? "hide" : "show") + "</span>)<br>";
    s += "number of times: " + (times.length - numdnf) + "/" + times.length;
    if (viewstats) {
        s += "<br>best time: <span onclick='setHighlight(" + bestTimeIndex + ",1,0);loadList();' class='a'>";
        s += pretty(bestTime) + "<\/span><br>worst time: <span onclick='setHighlight(" + worstTimeIndex;
        s += ",1,1);loadList();' class='a'>" + pretty(worstTime) + "<\/span><br>";
        if (useMoN === 1) {
            if (times.length >= moSize) {
                s += "<br>current mo" + moSize + ": <span onclick='setHighlight(" + (times.length - moSize);
                s += "," + moSize + "," + moSize + "2);loadList();' class='a'>" + pretty(lastMo[0]);
                s += "<\/span> (&sigma; = " + trim(lastMo[1], 2) + ")<br>";
                s += "best mo" + moSize + ": <span onclick='setHighlight(" + bestMoIndex;
                s += "," + moSize + "," + moSize + "3);loadList();' class='a'>" + pretty(bestMo[0]);
                s += "<\/span> (&sigma; = " + trim(bestMo[1], 2) + ")<br>";
            }
        }
        for (var j = 0; j < avgSizes2.length; j++) {
            if (times.length >= avgSizes2[j]) {
                s += "<br>current avg" + avgSizes2[j] + ": <span onclick='setHighlight(" + (times.length - avgSizes2[j]);
                s += "," + avgSizes2[j] + "," + avgSizes2[j] + "1);loadList();' class='a'>" + pretty(lastAvg[j][0]);
                s += "<\/span> (&sigma; = " + trim(lastAvg[j][1], 2) + ")<br>";
                s += "best avg" + avgSizes2[j] + ": <span onclick='setHighlight(" + bestAvgIndex[j];
                s += "," + avgSizes2[j] + "," + avgSizes2[j] + "0);loadList();' class='a'>" + pretty(bestAvg[j][0]);
                s += "<\/span> (&sigma; = " + trim(bestAvg[j][1], 2) + ")<br>";
            }
        }

        s += "<br>session avg: <span onclick='setHighlight(0," + times.length + ",2);loadList();' class='a'>";
        s += pretty(sessionavg[0]) + "<\/span> (&sigma; = " + trim(sessionavg[1], 2) + ")<br>session mean: " + pretty(sessionmean);
    }
    $('stats').innerHTML = s;
    var window = $('stats');
    window.scrollTop = 0; // IE workaround (lol)
    changeColor();
}

function getAllStats() {
    var avgSizes2 = (avgSizes.slice(1 - useAvgN)).sort(numsort);
    bestAvg = [[-1, 0], [-1, 0], [-1, 0], [-1, 0], [-1, 0]];
    lastAvg = [[-1, 0], [-1, 0], [-1, 0], [-1, 0], [-1, 0]];
    bestAvgIndex = [0, 0, 0, 0, 0];
    bestTime = -1;
    bestTimeIndex = 0;
    worstTime = -1;
    worstTimeIndex = 0;
    var numdnf = 0;
    var sessionsum = 0;
    bestMo = [-1, 0];
    lastMo = [-1, 0];
    bestMoIndex = 0;
    for (var i = 0; i < times.length; i++) {
        var thisTime = (notes[i] === 1) ? -1 : times[i] + notes[i] * 1000;
        if (bestTime < 0 || (thisTime !== -1 && thisTime < bestTime)) {
            bestTime = thisTime;
            bestTimeIndex = i;
        }
        if (thisTime > worstTime) {
            worstTime = thisTime;
            worstTimeIndex = i;
        }
        if (thisTime === -1) {
            numdnf++;
        }
        else {
            sessionsum += thisTime;
        }

        // calculate averages
        for (var j = 0; j < avgSizes2.length; j++) {
            if (times.length - i < avgSizes2[j]) {
                break;
            } else {
                lastAvg[j] = getAvgSD(i, avgSizes2[j], true);
                if (bestAvg[j][0] < 0 || (lastAvg[j][0] !== -1 && lastAvg[j][0] < bestAvg[j][0])) {
                    bestAvg[j] = lastAvg[j];
                    bestAvgIndex[j] = i;
                }
            }
        }

        // calculate mean
        if (times.length - i >= moSize) {
            lastMo = getMeanSD(i, moSize, true);
            if (bestMo[0] < 0 || (lastMo[0] !== -1 && lastMo[0] < bestMo[0])) {
                bestMo = lastMo;
                bestMoIndex = i;
            }
        }
    }

    var sessionavg = getAvgSD(0, times.length, true);
    var sessionmean = (numdnf === times.length) ? -1 : (sessionsum / (times.length - numdnf));

    return [numdnf, sessionavg, sessionmean];
}

function numsort(a, b) {
    return a - b;
}

function setHighlight(start, nsolves, id) {
    // if we're trying to set a highlight that has same ID as the current one, clear it.
    if (id === highlightID) {
        clearHighlight();
    } else {
        var mean = 0;
        if (id > 10 && (id % 10) > 1) mean = 1; // check to see if this is a mean-of-N or not
        highlightStart = start;
        highlightStop = start + nsolves - 1;
        highlightID = id;

        if (times.length === 0) return;
        var data = [0, [null], [null]];
        if (highlightStop !== -1 && (highlightStop - highlightStart) > 1) {
            if (mean) {
                data = getMeanSD(highlightStart, highlightStop - highlightStart + 1, false);
            } else {
                data = getAvgSD(highlightStart, highlightStop - highlightStart + 1, false);
            }
        }
        var s = "";
        if (id > 1) {
            if (id === 2) {
                s += "Session average";
            } else if (mean) {
                s += "Mean of " + Math.floor(id / 10);
            } else {
                s += "Average of " + Math.floor(id / 10);
            }
            s += ": " + pretty(data[0]) + "<br>";
        }
        for (var i = 0; i < nsolves; i++) {
            s += (i + 1) + ". ";
            if (data[1].indexOf(i) > -1 || data[2].indexOf(i) > -1) s += "(";
            s += (notes[start + i] === 1 ? "DNF(" : "") + pretty(times[start + i] + (notes[start + i] === 2 ? 2000 : 0)) + (notes[start + i] === 1 ? ")" : "");
            s += ((notes[start + i] === 2) ? "+" : "") + (comments[start + i] ? "[" + comments[start + i] + "]" : "");
            if (data[1].indexOf(i) > -1 || data[2].indexOf(i) > -1) s += ")";
            s += " &nbsp; " + scrambleArr[start + i] + "<br>";
        }
        $('avgdata').innerHTML = "<td colspan='3'>" + s + "<\/td>";
        $('avgdata').style.display = "";
    }
}

function clearHighlight() {
    highlightStart = -1;
    highlightStop = -1;
    highlightID = -1;
    $('avgdata').style.display = "none";
}

function timesort(a, b) {
    // deal with DNFs; if they are both DNF it doesn't matter what we return
    var a2 = a[0], b2 = b[0];
    if (a2 < 0) a2 = b2 + 1;
    if (b2 < 0) b2 = a2 + 1;
    return a2 - b2;
}

// gets average and SD
function getAvgSD(start, nsolves, SD) {
    if (nsolves < 3) {
        return [-1, -1, -1];
    }

    // get list of times
    var timeArr = [], t, j;
    for (j = 0; j < nsolves; j++) {
        t = (notes[start + j] === 1 ? -1 : times[start + j] / 10 + notes[start + j] * 100);
        t = (useMilli === 0 ? 10 * Math.round(t) : 10 * t);
        timeArr[timeArr.length] = [t, j];
    }

    // sort and take the average
    timeArr.sort(timesort);
    var trim = Math.ceil(nsolves / 20); // trimmed amount per side
    var sum = 0;
    for (j = trim; j < nsolves - trim; j++) {
        sum += timeArr[j][0];
    }
    sum = (timeArr[nsolves - trim - 1][0] < 0 ? -1 : sum / (nsolves - 2 * trim));

    // get SD
    if (SD) {
        var variance = 0;
        for (j = trim; j < nsolves - trim; j++) {
            variance += Math.pow((timeArr[j][0] - sum) / 1000, 2);
        }
        variance = Math.sqrt(variance / (nsolves - trim * 2. - 1));
        return [sum, variance];
    } else {
        return [sum, dropTime(timeArr).slice(0, trim), dropTime(timeArr).slice(-trim)];
    }
}

function dropTime(arr) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        newArr[newArr.length] = arr[i][1];
    }
    return newArr;
}

function getMeanSD(start, nsolves, SD) {
    // get list of times
    var timeArr = [], t, j;
    for (j = 0; j < nsolves; j++) {
        t = (notes[start + j] === 1 ? -1 : times[start + j] / 10 + notes[start + j] * 100);
        t = (useMilli === 0 ? 10 * Math.round(t) : 10 * t);
        timeArr[timeArr.length] = [t, j];
    }

    // sort and take the average
    timeArr.sort(timesort);
    var sum = 0;
    for (j = 0; j < nsolves; j++) {
        sum += timeArr[j][0];
    }
    var mean = (timeArr[nsolves - 1][0] < 0 ? -1 : sum / nsolves);

    // get SD
    if (SD) {
        var variance = 0;
        for (j = 0; j < nsolves; j++) {
            variance += Math.pow((timeArr[j][0] - mean) / 1000, 2);
        }
        variance = Math.sqrt(variance / (nsolves - 1));
        return [mean, variance];
    } else {
        return [mean, [], []];
    }
}

function trim(number, nDigits) {
    if (!number || number === Number.POSITIVE_INFINITY || number === Number.NEGATIVE_INFINITY) number = 0;
    var power = Math.pow(10, nDigits);
    var trimmed = "" + Math.round(number * power);
    while (trimmed.length < nDigits + 1) {
        trimmed = "0" + trimmed;
    }
    var len = trimmed.length;
    return trimmed.substr(0, len - nDigits) + "." + trimmed.substr(len - nDigits, nDigits);
}

function pretty(time) {
    if (time < 0) {
        return "DNF";
    }
    time = Math.round(time / (useMilli === 1 ? 1 : 10));
    var bits = time % (useMilli === 1 ? 1000 : 100);
    time = (time - bits) / (useMilli === 1 ? 1000 : 100);
    var secs = time % 60;
    var mins = ((time - secs) / 60) % 60;
    var hours = (time - secs - 60 * mins) / 3600;
    var s = "" + bits;
    if (bits < 10) {
        s = "0" + s;
    }
    if (bits < 100 && useMilli === 1) {
        s = "0" + s;
    }
    s = secs + "." + s;
    if (secs < 10 && (mins > 0 || hours > 0)) {
        s = "0" + s;
    }
    if (mins > 0 || hours > 0) {
        s = mins + ":" + s;
    }
    if (mins < 10 && hours > 0) {
        s = "0" + s;
    }
    if (hours > 0) {
        s = hours + ":" + s;
    }
    return s;
}

function changeNotes(i) {
    // 0 is normal solve, 1 is DNF, 2 is +2
    notes[notes.length - 1] = i;
    clearHighlight();
    loadList();
    getStats(true);
}

function changeAvgN() {
    var n = parseInt($("avglen").value);
    if (isNaN(n) || n < 3 || n > 10000) n = 50;
    avgSizes[0] = n;
    clearHighlight();
    loadList();
    getStats(true);
}

function changeMoN() {
    var n = parseInt($("molen").value);
    if (isNaN(n) || n < 2 || n > 10000) n = 3;
    moSize = n;
    clearHighlight();
    loadList();
    getStats(true);
}

function importTimes() {
    // split
    var imported = $('importedTimes').value;
    var itimes = imported.split("\n");
    if (itimes.length === 1) {
        itimes = imported.split(",");
    }

    // each element is either of the form (a) time, or (b) number. time scramble
    var index = times.length;
    for (var i = 0; i < itimes.length; i++) {
        var t = itimes[i];
        while (t.match(/^ /)) {
            t = t.slice(1);
        } // dump spaces on start
        while (t.match(/ $/)) {
            t = t.slice(0, t.length - 1);
        } // dump spaces on end
        var dot = (t.split(" ")[0]).slice(-1);

        // get to the time-only form
        if (dot !== ".") { // concise
            scrambleArr[index] = "";
        } else { // verbose
            t = t.slice(t.indexOf(". ") + 2); // get rid of time number
            var scr = "";
            if (t.match(/.*\[.*\].*/)) { // comment, might contain spaces
                scr = t.slice(t.indexOf("] ") + 2);
                t = t.slice(0, t.indexOf("] ") + 1);
            } else {
                if (t.indexOf(" ") > -1) {
                    scr = t.slice(t.indexOf(" ") + 1);
                    t = t.slice(0, t.indexOf(" "));
                } else {
                    scr = "";
                }
            }
            scrambleArr[index] = scr;
        }

        // parse
        if (t.match(/^\(.*\)$/)) {
            t = t.slice(1, t.length - 1);
        } // dump parens
        if (t.match(/.*\[.*]/)) { // look for comments
            comments[index] = t.replace(/.*\[(.*)\]/, "$1");
            t = t.split("[")[0];
        } else {
            comments[index] = "";
        }
        if (t.match(/DNF\(.*\)/)) { // DNF
            t = t.replace(/DNF\((.*)\)/, "$1");
            notes[index] = 1;
        } else if (t.match(/.*\+/)) { // +2
            t = t.slice(0, t.length - 1);
            notes[index] = 2;
        } else {
            notes[index] = 0;
        }
        parseTime(t, true);
        index++;
    }

    toggleImport();
    importFocus = false;
    clearHighlight();
    loadList();
    getStats(true);
}