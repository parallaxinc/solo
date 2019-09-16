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

define("ace/ext/statusbar",["require","exports","module","ace/lib/dom","ace/lib/lang"],function(e,t,n){"use strict";var r=e("../lib/dom"),i=e("../lib/lang"),s=function(e,t){this.element=r.createElement("div"),this.element.className="ace_status-indicator",this.element.style.cssText="display: inline-block;",t.appendChild(this.element);var n=i.delayedCall(function(){this.updateStatus(e)}.bind(this)).schedule.bind(null,100);e.on("changeStatus",n),e.on("changeSelection",n),e.on("keyboardActivity",n)};(function(){this.updateStatus=function(e){function n(e,n){e&&t.push(e,n||"|")}var t=[];n(e.keyBinding.getStatusText(e)),e.commands.recording&&n("REC");var r=e.selection,i=r.lead;if(!r.isEmpty()){var s=e.getSelectionRange();n("("+(s.end.row-s.start.row)+":"+(s.end.column-s.start.column)+")"," ")}n(i.row+":"+i.column," "),r.rangeCount&&n("["+r.rangeCount+"]"," "),t.pop(),this.element.textContent=t.join("")}}).call(s.prototype),t.StatusBar=s});                (function() {
                    window.require(["ace/ext/statusbar"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            