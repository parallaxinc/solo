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

define("ace/ext/spellcheck",["require","exports","module","ace/lib/event","ace/editor","ace/config"],function(e,t,n){"use strict";var r=e("../lib/event");t.contextMenuHandler=function(e){var t=e.target,n=t.textInput.getElement();if(!t.selection.isEmpty())return;var i=t.getCursorPosition(),s=t.session.getWordRange(i.row,i.column),o=t.session.getTextRange(s);t.session.tokenRe.lastIndex=0;if(!t.session.tokenRe.test(o))return;var u="\x01\x01",a=o+" "+u;n.value=a,n.setSelectionRange(o.length,o.length+1),n.setSelectionRange(0,0),n.setSelectionRange(0,o.length);var f=!1;r.addListener(n,"keydown",function l(){r.removeListener(n,"keydown",l),f=!0}),t.textInput.setInputHandler(function(e){console.log(e,a,n.selectionStart,n.selectionEnd);if(e==a)return"";if(e.lastIndexOf(a,0)===0)return e.slice(a.length);if(e.substr(n.selectionEnd)==a)return e.slice(0,-a.length);if(e.slice(-2)==u){var r=e.slice(0,-2);if(r.slice(-1)==" ")return f?r.substring(0,n.selectionEnd):(r=r.slice(0,-1),t.session.replace(s,r),"")}return e})};var i=e("../editor").Editor;e("../config").defineOptions(i.prototype,"editor",{spellcheck:{set:function(e){var n=this.textInput.getElement();n.spellcheck=!!e,e?this.on("nativecontextmenu",t.contextMenuHandler):this.removeListener("nativecontextmenu",t.contextMenuHandler)},value:!0}})});                (function() {
                    window.require(["ace/ext/spellcheck"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            