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
const SAVE_PROJECT_TIMER_DELAY = 20;

/**
 * Execute this callback when the timer expires
 * @type {null | function}
 */
let messageHandler = null;

/**
 *  Timestamp to indicate the amount of time that must expire before
 *  the user is advised to save their project.
 *
 * @type {number}
 * @deprecated
 */
let lastSavedTimestamp = 0;


/**
 * Timestamp to record the amount of time that has gone by since the
 * current project was last saved to storage.
 *
 * @type {number}
 * @deprecated
 */
let lastSavedTime = 0;

/**
 *
 */
class ProjectSaveTimer {
  /**
   * Initialize the project save timer
   * @param {number} wait time, in seconds
   * @param {function} projectChanged method to determine it project is
   * changed. The method must return a boolean true if the project has
   * changed; false if it has not.
   * @param {function} timeoutCallback is the function that is called when
   * the timer has expired.
   * @description This sets up the timer to know how often it should check
   * the project state to detect changes and a function to call when both
   * the project has changed and the timer interval has expired. Once these
   * elements are set, the timer runs autonomously.
   */
  constructor(wait, projectChanged, timeoutCallback) {
    /**
     * Hold the start time in Epoch time.
     * @type {number}
     * @private
     */
    this.startTime = Date.now();

    /**
     * The amount of time to wait (in minutes) before the callback is called
     * @type {number}
     * @private
     */
    this.wait = (wait === 0) ? SAVE_PROJECT_TIMER_DELAY : wait;

    /**
     * Call this method to determine of the project has changed.
     * @private
     */
    this.isProjectChanged = projectChanged;

    /**
     * Execute the callback when the timer expires
     * @private
     */
    this.callback = timeoutCallback;

    /**
     * This is the handle to the interval timer that is created
     * when the project timer object is created
     * @type {Object}
     * @private
     */
    this.timer = setInterval(this.checkTimerInterval, this.wait * 60000);

    /**
     * Return time remaining in the interval
     * @return {number}
     */
    this.getTimeRemaining = function() {
      const now = Date.now();
      const timeLeft = now - this.startTime;
      return (timeLeft > 0) ? timeLeft/1000 : 0;
    };

    /**
     * Check the interval timer
     */
    this.checkTimerInterval = function() {
      console.log('Project time left before save: ' + this.getTimeRemaining());
    };
  } /* end of constructor */

  /**
   * Return the start time for this interval
   * @return {Date}
   */
  getStartTime() {
    return this.startTime;
  }

  /**
   * The function to call when it is time to notify the user.
   * @param {Function} callback
   */
  static setMessageHandler(callback) {
    console.log('SAVEPRJ: Setting timer callback.');
    messageHandler = callback;
  }

  /**
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
   * messages.js file, PageTextLabels['editor_save-check_warning'].
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
      if (messageHandler) {
        messageHandler();
      }
    }
  }
}

export {ProjectSaveTimer};
