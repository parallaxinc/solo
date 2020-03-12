

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
const SAVE_PROJECT_TIMER_DELAY = 2;

/**
 * Call this message handler when the timer expires
 * @type {null | function}
 */
let messageHandler = null;

/**
 * Still not sure what this is doing.
 * @type {number}
 */
let timeSaved = 0;

/**
 *
 */
class ProjectSaveTimer {
  /**
   * Initialize the object
   */
  constructor() {
    /**
     *  Timestamp to indicate the amount of time that must expire before
     *  the user is advised to save their project.
     *
     * @type {number}
     */
    this.lastSavedTimestamp = 0;

    /**
     * Timestamp to record the amount of time that has gone by since the
     * current project was last saved to storage.
     *
     * @type {number}
     */
    this.lastSavedTime = 0;
  }

  /**
   * The function to call when it is time to notify the user.
   * @param {Function} callback
   */
  static setMessageHandler(callback) {
    messageHandler = callback;
  }


  /**
   * TimeSaved getter.
   * @return {number}
   */
  static getTimeSaved() {
    return timeSaved;
  }

  /**
   *
   * @param {number} value
   */
  static setTimeSaved(value) {
    timeSaved = value;
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

    // If the proposed delay is less than the delay that's already in
    // process, don't update the delay to a new shorter time.
    if (timeNow + (delay * 60000) > this.lastSavedTimestamp) {
      this.lastSavedTimestamp = timeNow + (delay * 60000);
      if (resetTimer) {
        this.lastSavedTime = timeNow;
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
    const timeNow = this.getTimestamp();
    this.setTimeSaved(Math.round((timeNow - this.lastSavedTime) / 60000));

    // TODO: We are really looking to see if the project is modified,
    //  not that we are leaving the page. checkLeave is not the right
    //  method to use here.
    if (timeNow > this.lastSavedTimestamp && checkLeave()) {
      if (messageHandler) {
        messageHandler();
      }
    }
  }
}


export {ProjectSaveTimer};
