

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

/*
 * Project Save Timer
 *
 * Set and maintain a timer that will alert the user is too much time has
 * passed since they last saved their project. The timer will execute a
 * callback if the timer expires. The timer can be reset, disabled, or be
 * adjusted to add more time through object method calls.
 */

/**
 * The default number of minutes to wait until the user is prompted
 * to save the altered project.
 *
 * @type {number}
 */
const SAVE_PROJECT_TIMER_DELAY = 10;

/**
 * Call this message handler when the timer expires
 * @type {null | function}
 */
let messageHandler = null;

/**
 *  Timestamp to indicate the amount of time that must expire before
 *  the user is advised to save their project.
 *
 * @type {number}
 */
let lastSavedTimestamp = 0;


/**
 * Timestamp to record the amount of time that has gone by since the
 * current project was last saved to storage.
 *
 * @type {number}
 */
let lastSavedTime = 0;

/**
 *
 */
class ProjectSaveTimer {
  /**
   * The function to call when it is time to notify the user.
   * @param {Function} callback
   */
  static setMessageHandler(callback) {
    console.log('SAVEPRJ: Setting timer callback.');
    messageHandler = callback;
  }


  /**
   *
   * @param {number} delay number of minutes before next nudge
   * @param {boolean} resetTimer
   *
   * @description
   * Provide a delay value of zero to specify the default delay, currently
   * defined in the constant SAVE_PROJECT_TIMER_DELAY.
   */
  static timestampSaveTime(delay, resetTimer) {
    const date = new Date();
    const timeNow = date.getTime();

    if (delay === 0) delay = SAVE_PROJECT_TIMER_DELAY;
    console.log('SAVEPRJ:Setting project save delay to %f', delay);

    // If the proposed delay is less than the delay that's already in
    // process, don't update the delay to a new shorter time.
    if (timeNow + (delay * 60000) > lastSavedTimestamp) {
      lastSavedTimestamp = timeNow + (delay * 60000);
      if (resetTimer) {
        console.log('SAVEPRJ:Resetting timer.');
        lastSavedTime = timeNow;
      }
    }
  }

  /**
   * Checks a time value embedded within a <span> element to determine
   * if it is time to prompt the user to save their project code.
   *
   * The <span> tag is introduced as part of a message, located in the
   * messages.js file, page_text_label['editor_save-check_warning'].
   */
  static checkLastSavedTime() {
    console.log('SAVEPRJ:Checking the last time project was saved.');
    const date = new Date();
    const timeNow = date.getTime();

    // Set the time remaining
    lastSavedTimestamp = Math.round((timeNow - lastSavedTime) / 60000);
    console.log('SAVEPRJ:Last time stamp is: %f', lastSavedTimestamp);

    // TODO: We are really looking to see if the project is modified,
    //  not that we are leaving the page. isProjectChanged is not the right
    //  method to use here.
    if (timeNow > lastSavedTimestamp) {
      console.log('SAVEPRJ:Time\'s up.');
      if (messageHandler) {
        console.log('SAVEPRJ:Invoking Save Project dialog.');
        messageHandler();
      }
    }
  }
}


export {ProjectSaveTimer};
