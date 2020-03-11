



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
 * The default number of minutes to wait until the user is prompted
 * to save the altered project.
 *
 * @type {number}
 */
const SAVE_PROJECT_TIMER_DELAY = 20;


/**
 *  Timestamp to indicate the amount of time that must expire before
 *  the user is advised to save their project.
 *
 * @type {number}
 */
var last_saved_timestamp = 0;


/**
 * Timestamp to record the amount of time that has gone by since the
 * current project was last saved to storage.
 *
 * @type {number}
 */
var last_saved_time = 0;



/**
 *
 * @param resetTimer
 */
const timestampSaveTime = (resetTimer) => {
    const timeNow = getTimestamp();

    // If the proposed delay is less than the delay that's already in
    // process, don't update the delay to a new shorter time.
    if (timeNow + (delayMinutes * 60000) > last_saved_timestamp) {
        last_saved_timestamp = timeNow + (delayMinutes * 60000);

        if (resetTimer) {
            last_saved_time = timeNow;
        }
    }
};


/**
 * Get the current time stamp
 *
 * @returns {number} Number of seconds since 1/1/1970
 */
function getTimestamp() {
    const date = new Date();
    return date.getTime();
}

// TODO: We have to have a better way to manage the timer than using
//  an HTML tag.
/**
 * Checks a time value embedded within a <span> element to determine
 * if it is time to prompt the user to save their project code.
 *
 * The <span> tag is introduced as part of a message, located in the
 * messages.js file, page_text_label['editor_save-check_warning'].
 */
const checkLastSavedTime = function () {
    const t_now = getTimestamp();
    const s_save = Math.round((t_now - last_saved_time) / 60000);

    // Write the timestamp to the DOM
    $('#save-check-warning-time').html(s_save.toString(10));

    //if (s_save > 58) {
    // TODO: It's been to long - auto-save, then close/set URL back to login page.
    //}

    if (t_now > last_saved_timestamp && checkLeave()) {
        // It's time to pop up a modal to remind the user to save.
        ShowProjectTimerModalDialog();
    }
};


// ------------------------------------------------------------------
// -----          End of project save timer functions          ------
// ------------------------------------------------------------------


export {getTimestamp};
