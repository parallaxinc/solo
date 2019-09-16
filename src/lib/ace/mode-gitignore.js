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

define("ace/mode/gitignore_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text_highlight_rules").TextHighlightRules,s=function(){this.$rules={start:[{token:"comment",regex:/^\s*#.*$/},{token:"keyword",regex:/^\s*!.*$/}]},this.normalizeRules()};s.metaData={fileTypes:["gitignore"],name:"Gitignore"},r.inherits(s,i),t.GitignoreHighlightRules=s}),define("ace/mode/gitignore",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/gitignore_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text").Mode,s=e("./gitignore_highlight_rules").GitignoreHighlightRules,o=function(){this.HighlightRules=s,this.$behaviour=this.$defaultBehaviour};r.inherits(o,i),function(){this.lineCommentStart="#",this.$id="ace/mode/gitignore"}.call(o.prototype),t.Mode=o});                (function() {
                    window.require(["ace/mode/gitignore"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            