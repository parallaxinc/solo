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

'use strict';

// import bootstrap from 'bootstrap';
import bootbox from 'bootbox';

/**
 * Operating system detection
 *
 * @type {string}
 */
let osName = 'unknown-client';

/**
 *
 * @type {{
 *    confirm: utils.confirm,
 *    showMessage: utils.showMessage,
 *    prompt: utils.prompt
 * }}
 */
const utils = {
  showMessage: function(title, message, callback) {
    bootbox.dialog({
      title: title,
      message: message,
      buttons: {
        confirm: {
          label: 'Ok',
          className: 'btn-primary',
          callback: callback,
        },
      },
    });
  },

  prompt: function(title, defaultValue, callback) {
    bootbox.prompt({
      title: title,
      value: defaultValue,
      callback: callback,
      buttons: {
        cancel: {
          label: 'Cancel',
          className: 'btn-default',
          callback: callback,
        },
        confirm: {
          label: 'Confirm',
          className: 'btn-primary',
          callback: callback,
        },
      },
    });
  },

  confirmYesNo: function(title, message, callback) {
    bootbox.confirm({
      title: title,
      message: message,
      buttons: {
        confirm: {
          label: '<i class="fa fa-check"></i> Yes',
        },
        cancel: {
          label: '<i class="fa fa-times"></i> No',
        },
      },
      callback: function(result) {
        console.log('This was logged in the callback: ' + result);
        if (callback) {
          callback(result);
        }
      },
    });
  },

  /**
   * Confirmation dialog
   * @param {string} title
   * @param {string} message
   * @param {function} callback
   * @param {string=} confirmLabel
   * @param {string=} cancelLabel
   */
  confirm: function(
      title, message, callback,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel') {
    bootbox.dialog({
      title: title,
      message: message,
      buttons: {
        cancel: {
          label: cancelLabel,
          className: 'btn-default',
          callback: function() {
            callback(false);
          },
        },
        confirm: {
          label: confirmLabel,
          className: 'btn-primary',
          callback: function() {
            callback(true);
          },
        },
      },
    });
  },
};

// polyfill that removes duplicates from an array and sorts it
// From: https://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
/**
 * @description
 *
  function sort_unique(arr) {
    if (arr.length === 0) return arr;
    arr = arr.sort(function (a, b) { return a*1 - b*1; });
    var ret = [arr[0]];
    for (var i = 1; i < arr.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
       if (arr[i-1] !== arr[i]) {
         ret.push(arr[i]);
       }
     }
     return ret;
   }

 console.log(sort_unique(['237','124','255','124','366','255']));
    ["124", "237", "255", "366"]
 *
 */
if (!Array.prototype.sortedUnique) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, 'sortedUnique', {
    value: function() {
      const seen = {};
      const out = [];
      let len = this.length;
      let j = 0;

      for (let i = 0; i < len; i++) {
        const item = this[i];
        if (seen[item] !== 1) {
          seen[item] = 1;
          out[j++] = item;
        }
      }
      try {
        const sorted = [];
        let j = 0;
        while (out.length > 0) {
          len = out.length;
          let k = 0;
          for (let i = 0; i < len; i++) {
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
        return out;
      }
    },
    enumerable: false,
  });
}

/**
 * Return URL querystring parameters
 * @param {boolean} keepNewOpen
 * @return {string}
 */
function getAllUrlParameters(keepNewOpen = false) {
  if (keepNewOpen) {
    return window.location.search;
  }

  return window.location.search
      .replace(/newProject=[a-zA-Z0-9]*&*|openFile=[a-zA-Z0-9]*&*/g, '');
}

/**
 * Retrun a single element of the URL query string
 * @param {string} name
 * @return {string | null}
 */
function getURLParameter(name) {
  return decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)')
          .exec(window.location.search) || [null, ''])[1]
          .replace(/\+/g, '%20')) || null;
}


/**
 *  Identify the operating system reported by the browser
 *
 * @param {string} x
 * @param {string} y
 * @param {string | null} z
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
nav('appVersion', 'X11', 'UNIX');
nav('appVersion', 'Mac', 'MacOS');
nav('appVersion', 'Linux', null);
nav('userAgent', 'Linux', null);
nav('platform', 'Linux', null);
nav('appVersion', 'Win', 'Windows');
nav('userAgent', 'Windows', null);
nav('platform', 'Win', 'Windows');
nav('oscpu', 'Windows', null);
nav('appVersion', 'CrOS', 'ChromeOS');


/**
 *
 */
$(function() {
  // Use the "external_link" class to make links open in new tabs
  $('.external_link').click(function(e) {
    // eslint-disable-next-line no-invalid-this
    window.open($(this).attr('href'), '_blank');
    e.preventDefault();
  });

  // Set up divs to hide/show OS-specific content
  $('body').addClass(osName);

  // Copy the client download and run instructions
  // from the client instruction page to the modal that also shows them
  $('#client-instructions-copy')
      .html($('#client-instructions-original').html());

  if (getURLParameter('debug')) console.log(navigator.browserSpecs);
});

// https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
navigator.browserSpecs = (function() {
  const ua = navigator.userAgent;
  let tem;
  // eslint-disable-next-line max-len
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return {
      name: 'IE',
      version: (tem[1] || ''),
      system: osName,
    };
  }

  if (M[1]=== 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);

    if (tem != null) {
      return {
        name: tem[1].replace('OPR', 'Opera'),
        version: tem[2],
        system: osName,
      };
    }
  }

  M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];

  if ((tem = ua.match(/version\/(\d+)/i))!= null) {
    M.splice(1, 1, tem[1]);
  }

  return {
    name: M[0],
    version: M[1],
    system: osName,
  };
})();

// Does the 'experimental' URL parameter exist?
const isExperimental = getURLParameter('experimental') || 'false';


/**
 * Log a string to the console
 * @param {string} message
 */
function logConsoleMessage(message) {
  const dt = new Date();
  let stamp = dt.getHours() > 9 ?
      dt.getHours().toString() : `0${dt.getHours().toString()}`;
  stamp += dt.getMinutes() > 9 ?
      `:${dt.getMinutes().toString()}` : `:0${dt.getMinutes().toString()}`;
  stamp += dt.getSeconds() > 9 ?
      `:${dt.getSeconds().toString()}` : `:0${dt.getSeconds().toString()}`;

  const milliseconds = dt.getMilliseconds();
  if (milliseconds > 99) {
    stamp += `.${milliseconds}`;
  } else if (milliseconds > 9 ) {
    stamp += `.0${milliseconds}`;
  } else {
    stamp += `.00${milliseconds}`;
  }
  console.log(`${stamp} ${message}`);
}

/**
 * Sanitize a string into an OS-safe filename
 *
 * @param {string} input string representing a potential filename
 * @return {string}
 */
export function sanitizeFilename(input) {
  // if the input is not a string, or is an empty string, return a
  // generic filename
  if (typeof input !== 'string' || input.length < 1) {
    return 'my_project';
  }

  // replace OS-illegal characters or phrases
  input = input.replace(/[/?<>\\:*|"]/g, '_')
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1f\x80-\x9f]/g, '_')
      .replace(/^\.+$/, '_')
      .replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, '_')
      .replace(/[. ]+$/, '_');

  // if the filename is too long, truncate it
  if (input.length > 31) {
    return input.substring(0, 30);
  }

  return input;
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pretty formatter for C code
 *
 * @param {string} rawCode
 * @return {string}
 */
export const prettyCode = function(rawCode) {
  // TODO: The jsBeautifier package is NOT targeted to C source code. Replace
  //  this functionality with something that understands C source code.
  // improve the way functions and arrays are rendered
  rawCode = rawCode.replace(/\)\s*[\n\r]\s*{/g, ') {')
      .replace(/\[([0-9]*)\]\s*=\s*{\s*([0-9xXbBA-F,\s]*)\s*};/g,
          function(str, m1, m2) {
            m2 = m2.replace(/\s/g, '').replace(/,/g, ', ');
            return '[' + m1 + '] = {' + m2 + '};';
          });

  return rawCode;
};

export {
  utils, isExperimental, getURLParameter, getAllUrlParameters,
  logConsoleMessage};
