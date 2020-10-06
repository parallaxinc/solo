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
const SAVE_PROJECT_TIMER_DELAY = .25;

/**
 * Timer to remind user of some event on a regular basis.
 *
 * @description
 *
 * Example usage
 * ----------------------------------------------------------------------------
 * Create a callback function that the timer will call at specified intervals.
 * The interval setting is described below. The callback will typically invoke
 * a modal dialog that invites the user to save the current project.
 *
 * function myCallback() {
 *  displayMessage();
 * }
 *
 * Create a new nudge timer. The interval is the number of minutes before the
 * callback function is executed. It it the callback's responsibility to
 * determine if the project has been changed. It should check this before
 * prompting the user.
 * const myTime = new NudgeTimer(interval);
 *
 *
 * Set the callback. Installs the callback function into the project timer.
 *
 * myTime.myCallback = myCallback;
 *
 * Start the timer. The checkInterval parameter is usually set to a value
 * that is less than the NudgeTimer interval. This interval will trigger the
 * callback to only if the NudgeTimer interval has been exceeded. This
 * provides an opportunity to remind the user more frequently once the
 * NudgeTimer interval timer has expired.
 *
 * myTime.start(checkInterval);
 * -------------------------------------------------------------------------- */
class NudgeTimer {
  /**
   * Constructor
   * @param {number} nudgeTime
   * @param {boolean} [enableCallback=false] - Enable the callback
   */
  constructor(nudgeTime, enableCallback) {
    /**
     * The epoch time when the timer started
     * @type {number}
     */
    this.startEpoch = 0;

    /**
     * Number of minutes before we trigger the callback
     * @type {number} if 0, use the system default delay
     */
    this.nudgeUserTime =
        (nudgeTime === 0) ? SAVE_PROJECT_TIMER_DELAY: nudgeTime;

    /**
     * This is the callback that may be called from the timer
     * callback.
     * @type {function}
     */
    this.myCallback = null;

    /**
     * Enable nudge callback.
     * @type {boolean}
     * @description Setting this property to true will cause the nudge timer
     * to execute the callback function if one is provided to the instance.
     */
    this.enableCallback = enableCallback;

    /**
     * This is the handle to the timer. This is is used to stop the timer.
     */
    this.timer = null;
  }

  /**
   * Return the number of minutes since the last successful save
   * @return {number}
   */
  getTimeSinceLastSave() {
    return (Date.now() - this.startEpoch) / 60000;
  }

  /**
   * Get the epoch timer value
   * @return {number}
   */
  getEpochTime() {
    return this.startEpoch;
  }
  /**
   * Reset the epoch base time
   */
  reset() {
    this.startEpoch = Date.now();
  }

  /**
   * Start the timer
   * @param {number} interval in minutes
   */
  start(interval) {
    // Create a timer. It will call timeOut() at regular intervals.
    // It passes in a copy of 'this' to timeOut to allow timeOut to
    // access the properties of this NudgeTimer object
    this.timer = setInterval(this.timeOut, interval * 60000, this);
    this.reset();
  }

  /**
  * Stop the timer
  */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * This is executed at every interval
   * @param {NudgeTimer} me
   */
  timeOut(me) {
    const nudge = me.nudgeUserTime * 60000;
    const elapsedTime = (Date.now() - me.startEpoch);

    if (elapsedTime > nudge) {
      if (me.myCallback && this.enableCallback) {
        me.myCallback();
      }
    }
  }
}

export {NudgeTimer};

