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

define("ace/mode/ada_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text_highlight_rules").TextHighlightRules,s=function(){var e="abort|else|new|return|abs|elsif|not|reverse|abstract|end|null|accept|entry|select|access|exception|of|separate|aliased|exit|or|some|all|others|subtype|and|for|out|synchronized|array|function|overriding|at|tagged|generic|package|task|begin|goto|pragma|terminate|body|private|then|if|procedure|type|case|in|protected|constant|interface|until||is|raise|use|declare|range|delay|limited|record|when|delta|loop|rem|while|digits|renames|with|do|mod|requeue|xor",t="true|false|null",n="count|min|max|avg|sum|rank|now|coalesce|main",r=this.createKeywordMapper({"support.function":n,keyword:e,"constant.language":t},"identifier",!0);this.$rules={start:[{token:"comment",regex:"--.*$"},{token:"string",regex:'".*?"'},{token:"string",regex:"'.'"},{token:"constant.numeric",regex:"[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"},{token:r,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"keyword.operator",regex:"\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="},{token:"paren.lparen",regex:"[\\(]"},{token:"paren.rparen",regex:"[\\)]"},{token:"text",regex:"\\s+"}]}};r.inherits(s,i),t.AdaHighlightRules=s}),define("ace/mode/ada",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/ada_highlight_rules","ace/range"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text").Mode,s=e("./ada_highlight_rules").AdaHighlightRules,o=e("../range").Range,u=function(){this.HighlightRules=s,this.$behaviour=this.$defaultBehaviour};r.inherits(u,i),function(){this.lineCommentStart="--",this.getNextLineIndent=function(e,t,n){var r=this.$getIndent(t),i=this.getTokenizer().getLineTokens(t,e),s=i.tokens;if(s.length&&s[s.length-1].type=="comment")return r;if(e=="start"){var o=t.match(/^.*(begin|loop|then|is|do)\s*$/);o&&(r+=n)}return r},this.checkOutdent=function(e,t,n){var r=t+n;return r.match(/^\s*(begin|end)$/)?!0:!1},this.autoOutdent=function(e,t,n){var r=t.getLine(n),i=t.getLine(n-1),s=this.$getIndent(i).length,u=this.$getIndent(r).length;if(u<=s)return;t.outdentRows(new o(n,0,n+2,0))},this.$id="ace/mode/ada"}.call(u.prototype),t.Mode=u});                (function() {
                    window.require(["ace/mode/ada"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            