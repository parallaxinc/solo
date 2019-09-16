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

define("ace/mode/gcode_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text_highlight_rules").TextHighlightRules,s=function(){var e="IF|DO|WHILE|ENDWHILE|CALL|ENDIF|SUB|ENDSUB|GOTO|REPEAT|ENDREPEAT|CALL",t="PI",n="ATAN|ABS|ACOS|ASIN|SIN|COS|EXP|FIX|FUP|ROUND|LN|TAN",r=this.createKeywordMapper({"support.function":n,keyword:e,"constant.language":t},"identifier",!0);this.$rules={start:[{token:"comment",regex:"\\(.*\\)"},{token:"comment",regex:"([N])([0-9]+)"},{token:"string",regex:"([G])([0-9]+\\.?[0-9]?)"},{token:"string",regex:"([M])([0-9]+\\.?[0-9]?)"},{token:"constant.numeric",regex:"([-+]?([0-9]*\\.?[0-9]+\\.?))|(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)"},{token:r,regex:"[A-Z]"},{token:"keyword.operator",regex:"EQ|LT|GT|NE|GE|LE|OR|XOR"},{token:"paren.lparen",regex:"[\\[]"},{token:"paren.rparen",regex:"[\\]]"},{token:"text",regex:"\\s+"}]}};r.inherits(s,i),t.GcodeHighlightRules=s}),define("ace/mode/gcode",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/gcode_highlight_rules","ace/range"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text").Mode,s=e("./gcode_highlight_rules").GcodeHighlightRules,o=e("../range").Range,u=function(){this.HighlightRules=s,this.$behaviour=this.$defaultBehaviour};r.inherits(u,i),function(){this.$id="ace/mode/gcode"}.call(u.prototype),t.Mode=u});                (function() {
                    window.require(["ace/mode/gcode"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            