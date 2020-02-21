
/*
 *   TERMS OF USE: MIT License
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 */


/**
 *
 * @type {{confirm: utils.confirm, showMessage: utils.showMessage, prompt: utils.prompt}}
 */
var utils = {
    showMessage: function (title, message, callback) {
        bootbox.dialog({
            title: title,
            message: message,
            buttons: {
                confirm: {
                    label: "Ok",
                    className: "btn-primary",
                    callback: callback
                }
            }
        });
    },

    prompt: function (title, defaultValue, callback) {
        bootbox.prompt({
            title: title,
            value: defaultValue,
            callback: callback,
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-default",
                    callback: callback
                },
                confirm: {
                    label: "Confirm",
                    className: "btn-primary",
                    callback: callback
                }
            }

        });
    },

    confirm: function (title, message, callback, optionLabelConfirm, optionLabelCancel) {
        bootbox.dialog({
            title: title,
            message: message,
            buttons: {
                cancel: {
                    label: (optionLabelCancel || "Cancel"),
                    className: "btn-default",
                    callback: function () {
                        callback(false);
                    }
                },
                confirm: {
                    label: (optionLabelConfirm || "Confirm"),
                    className: "btn-primary",
                    callback: function () {
                        callback(true);
                    }
                }
            }
        });
    }
};


// POLYFILLS
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

// http://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-elements-in-another-array-in-javascript
/**
 * @description determine if an array contains one or more items from another array.
 * @param {array} haystack the array to search.
 * @param {array} arr the array providing items to check for in the haystack.
 * @return {boolean} true|false if haystack contains at least one item from arr.
 */
if (!Array.prototype.sharesElementWith) {
    Object.defineProperty(Array.prototype, 'sharesElementWith', {
        value: function (isInArray) {
            return isInArray.some(function (v) {
                return this.indexOf(v) >= 0;
            });
        },
        enumerable: false
    });
}

// polyfill that removes duplicates from an array and sorts it
// From: https://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
if (!Array.prototype.sortedUnique) {
    Object.defineProperty(Array.prototype, 'sortedUnique', {
        value: function () {
            var seen = {};
            var out = [];
            var len = this.length;
            var j = 0;
            for (var i = 0; i < len; i++) {
                var item = this[i];
                if (seen[item] !== 1) {
                    seen[item] = 1;
                    out[j++] = item;
                }
            }
            var tmpOut = out;
            try {
                var sorted = [];
                j = 0;
                while (out.length > 0) {
                    len = out.length;
                    var k = 0;
                    for (var i = 0; i < len; i++) {
                        if (parseInt(out[i], 10) < parseInt(out[k], 10)) {
                            k = i;
                        }
                    }
                    sorted[j] = out[k];
                    j++;
                    out.splice(k, 1);
                }
                return sorted;
            } catch (err) {
                return tmpOut;
            }
        },
        enumerable: false
    });
}

// http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
if (!window.getURLParameter) {
    Object.defineProperty(window, 'getURLParameter', {
        value: function (name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
        },
        enumerable: false
    });
}

// Does the 'experimental' URL parameter exist?
var isExperimental = window.getURLParameter('experimental') || 'false';


/**
 * Helper function for passing on URL parameters between page reloads and changes
 * @param keepNewOpen {boolean} if true, keep the newProject and openFile parameters, otherwise filter them out.
 * @returns {string} all or filtered URL parameters
 */
if (!window.getAllURLParameters) {
    Object.defineProperty(window, 'getAllURLParameters', {
        value: function (keepNewOpen) {
            if (keepNewOpen) {
                return window.location.search;
            } else {
                return window.location.search.replace(/newProject=[a-zA-Z0-9]*&*|openFile=[a-zA-Z0-9]*&*/g,'');
            }
        },
        enumerable: false
    });
}

/**
 * Operating system detection
 *
 * @type {string}
 */
var osName = 'unknown-client';


/**
 *  Identify the operating system reported by the browser
 *
 * @param x
 * @param y
 * @param z
 */
function nav(x, y, z) {
    // set z value to the value of y if there is no initial z value
    z = z || y;

    // The navigator object contains information about the browser.
    if (navigator[x] && navigator[x].indexOf(y) !== -1) {
        osName = z;
    }
}


/*   navigator     value     download  */
nav("appVersion", "X11", "UNIX");
nav("appVersion", "Mac", "MacOS");
nav("appVersion", "Linux");
nav("userAgent", "Linux");
nav("platform", "Linux");
nav("appVersion", "Win", "Windows");
nav("userAgent", "Windows");
nav("platform", "Win", "Windows");
nav("oscpu", "Windows");
nav("appVersion", "CrOS", "ChromeOS");


/**
 *
 */
$(function () {
    // Use the "external_link" class to make links open in new tabs
    $(".external_link").click(function (e) {
        window.open($(this).attr("href"), "_blank");
        e.preventDefault();
    });
    
    // Set up divs to hide/show OS-specific content
    $("body").addClass(osName);
    
    // Copy the client download and run instructions 
    // from the client instruction page to the modal that also shows them
    $("#client-instructions-copy").html($("#client-instructions-original").html());
    
    if (window.getURLParameter('debug')) console.log(navigator.browserSpecs);
});


// https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
navigator.browserSpecs = (function(){
    var ua = navigator.userAgent, tem, 
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:'IE', version:(tem[1] || ''), system:osName};
    }
    if(M[1]=== 'Chrome'){
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem != null) return {name:tem[1].replace('OPR', 'Opera'), version:tem[2], system:osName};
    }
    M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem = ua.match(/version\/(\d+)/i))!= null)
        M.splice(1, 1, tem[1]);
    return {name:M[0], version:M[1], system:osName};
})();


/**
 * Find offset to first unequal character in two strings.
 * @param a
 * @param b
 *
 * @returns {number}
 * Returns the offset to first character in either string
 * where the characters differ at that location.
 *
 * Returns the length of the shorter string if the strings are of
 * differing lengths but are equal up to the end of the shorter
 * string.
 *
 * Returns -1 if none of the above conditions are met.
 *
 * @description
 * https://stackoverflow.com/questions/32858626/detect-position-of-first-difference-in-2-strings
 *
 */
function findFirstDiffPos(a, b)
{
    let shorterLength = Math.min(a.length, b.length);

    for (let i = 0; i < shorterLength; i++) {
        if (a[i] !== b[i]) return i;
    }

    if (a.length !== b.length) return shorterLength;

    return -1;
}