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

define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text_highlight_rules").TextHighlightRules,s=function(){this.$rules={start:[{token:"comment.doc.tag",regex:"@[\\w\\d_]+"},s.getTagRule(),{defaultToken:"comment.doc",caseInsensitive:!0}]}};r.inherits(s,i),s.getTagRule=function(e){return{token:"comment.doc.tag.storage.type",regex:"\\b(?:TODO|FIXME|XXX|HACK)\\b"}},s.getStartRule=function(e){return{token:"comment.doc",regex:"\\/\\*(?=\\*)",next:e}},s.getEndRule=function(e){return{token:"comment.doc",regex:"\\*\\/",next:e}},t.DocCommentHighlightRules=s}),define("ace/mode/apex_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules","ace/mode/doc_comment_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("../mode/text_highlight_rules").TextHighlightRules,s=e("../mode/doc_comment_highlight_rules").DocCommentHighlightRules,o=function(){function t(t){return t.slice(-3)=="__c"?"support.function":e(t)}function n(e,t){return{regex:e+(t.multiline?"":"(?=.)"),token:"string.start",next:[{regex:t.escape,token:"character.escape"},{regex:t.error,token:"error.invalid"},{regex:e+(t.multiline?"":"|$"),token:"string.end",next:t.next||"start"},{defaultToken:"string"}]}}function r(){return[{token:"comment",regex:"\\/\\/(?=.)",next:[s.getTagRule(),{token:"comment",regex:"$|^",next:"start"},{defaultToken:"comment",caseInsensitive:!0}]},s.getStartRule("doc-start"),{token:"comment",regex:/\/\*/,next:[s.getTagRule(),{token:"comment",regex:"\\*\\/",next:"start"},{defaultToken:"comment",caseInsensitive:!0}]}]}var e=this.createKeywordMapper({"variable.language":"activate|any|autonomous|begin|bigdecimal|byte|cast|char|collect|const|end|exit|export|float|goto|group|having|hint|import|inner|into|join|loop|number|object|of|outer|parallel|pragma|retrieve|returning|search|short|stat|synchronized|then|this_month|transaction|type|when",keyword:"private|protected|public|native|synchronized|abstract|threadsafe|transient|static|final|and|array|as|asc|break|bulk|by|catch|class|commit|continue|convertcurrency|delete|desc|do|else|enum|extends|false|final|finally|for|from|future|global|if|implements|in|insert|instanceof|interface|last_90_days|last_month|last_n_days|last_week|like|limit|list|map|merge|new|next_90_days|next_month|next_n_days|next_week|not|null|nulls|on|or|override|package|return|rollback|savepoint|select|set|sort|super|testmethod|this|this_week|throw|today|tolabel|tomorrow|trigger|true|try|undelete|update|upsert|using|virtual|webservice|where|while|yesterday|switch|case|default","storage.type":"def|boolean|byte|char|short|int|float|pblob|date|datetime|decimal|double|id|integer|long|string|time|void|blob|Object","constant.language":"true|false|null|after|before|count|excludes|first|includes|last|order|sharing|with","support.function":"system|apex|label|apexpages|userinfo|schema"},"identifier",!0);this.$rules={start:[n("'",{escape:/\\[nb'"\\]/,error:/\\./,multiline:!1}),r("c"),{type:"decoration",token:["meta.package.apex","keyword.other.package.apex","meta.package.apex","storage.modifier.package.apex","meta.package.apex","punctuation.terminator.apex"],regex:/^(\s*)(package)\b(?:(\s*)([^ ;$]+)(\s*)((?:;)?))?/},{regex:/@[a-zA-Z_$][a-zA-Z_$\d\u0080-\ufffe]*/,token:"constant.language"},{regex:/[a-zA-Z_$][a-zA-Z_$\d\u0080-\ufffe]*/,token:t},{regex:"`#%",token:"error.invalid"},{token:"constant.numeric",regex:/[+-]?\d+(?:(?:\.\d*)?(?:[LlDdEe][+-]?\d+)?)\b|\.\d+[LlDdEe]/},{token:"keyword.operator",regex:/--|\+\+|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\|\||\?\:|[!$%&*+\-~\/^]=?/,next:"start"},{token:"punctuation.operator",regex:/[?:,;.]/,next:"start"},{token:"paren.lparen",regex:/[\[]/,next:"maybe_soql",merge:!1},{token:"paren.lparen",regex:/[\[({]/,next:"start",merge:!1},{token:"paren.rparen",regex:/[\])}]/,merge:!1}],maybe_soql:[{regex:/\s+/,token:"text"},{regex:/(SELECT|FIND)\b/,token:"keyword",caseInsensitive:!0,next:"soql"},{regex:"",token:"none",next:"start"}],soql:[{regex:"(:?ASC|BY|CATEGORY|CUBE|DATA|DESC|END|FIND|FIRST|FOR|FROM|GROUP|HAVING|IN|LAST|LIMIT|NETWORK|NULLS|OFFSET|ORDER|REFERENCE|RETURNING|ROLLUP|SCOPE|SELECT|SNIPPET|TRACKING|TYPEOF|UPDATE|USING|VIEW|VIEWSTAT|WHERE|WITH|AND|OR)\\b",token:"keyword",caseInsensitive:!0},{regex:"(:?target_length|toLabel|convertCurrency|count|Contact|Account|User|FIELDS)\\b",token:"support.function",caseInsensitive:!0},{token:"paren.rparen",regex:/[\]]/,next:"start",merge:!1},n("'",{escape:/\\[nb'"\\]/,error:/\\./,multiline:!1,next:"soql"}),n('"',{escape:/\\[nb'"\\]/,error:/\\./,multiline:!1,next:"soql"}),{regex:/\\./,token:"character.escape"},{regex:/[\?\&\|\!\{\}\[\]\(\)\^\~\*\:\"\'\+\-\,\.=\\\/]/,token:"keyword.operator"}],"log-start":[{token:"timestamp.invisible",regex:/^[\d:.() ]+\|/,next:"log-header"},{token:"timestamp.invisible",regex:/^  (Number of|Maximum)[^:]*:/,next:"log-comment"},{token:"invisible",regex:/^Execute Anonymous:/,next:"log-comment"},{defaultToken:"text"}],"log-comment":[{token:"log-comment",regex:/.*$/,next:"log-start"}],"log-header":[{token:"timestamp.invisible",regex:/((USER_DEBUG|\[\d+\]|DEBUG)\|)+/},{token:"keyword",regex:"(?:EXECUTION_FINISHED|EXECUTION_STARTED|CODE_UNIT_STARTED|CUMULATIVE_LIMIT_USAGE|LIMIT_USAGE_FOR_NS|CUMULATIVE_LIMIT_USAGE_END|CODE_UNIT_FINISHED)"},{regex:"",next:"log-start"}]},this.embedRules(s,"doc-",[s.getEndRule("start")]),this.normalizeRules()};r.inherits(o,i),t.ApexHighlightRules=o}),define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t,n){"use strict";var r=e("../../lib/oop"),i=e("../../range").Range,s=e("./fold_mode").FoldMode,o=t.FoldMode=function(e){e&&(this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start)),this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end)))};r.inherits(o,s),function(){this.foldingStartMarker=/([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/,this.foldingStopMarker=/^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/,this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/,this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/,this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/,this._getFoldWidgetBase=this.getFoldWidget,this.getFoldWidget=function(e,t,n){var r=e.getLine(n);if(this.singleLineBlockCommentRe.test(r)&&!this.startRegionRe.test(r)&&!this.tripleStarBlockCommentRe.test(r))return"";var i=this._getFoldWidgetBase(e,t,n);return!i&&this.startRegionRe.test(r)?"start":i},this.getFoldWidgetRange=function(e,t,n,r){var i=e.getLine(n);if(this.startRegionRe.test(i))return this.getCommentRegionBlock(e,i,n);var s=i.match(this.foldingStartMarker);if(s){var o=s.index;if(s[1])return this.openingBracketBlock(e,s[1],n,o);var u=e.getCommentFoldRange(n,o+s[0].length,1);return u&&!u.isMultiLine()&&(r?u=this.getSectionRange(e,n):t!="all"&&(u=null)),u}if(t==="markbegin")return;var s=i.match(this.foldingStopMarker);if(s){var o=s.index+s[0].length;return s[1]?this.closingBracketBlock(e,s[1],n,o):e.getCommentFoldRange(n,o,-1)}},this.getSectionRange=function(e,t){var n=e.getLine(t),r=n.search(/\S/),s=t,o=n.length;t+=1;var u=t,a=e.getLength();while(++t<a){n=e.getLine(t);var f=n.search(/\S/);if(f===-1)continue;if(r>f)break;var l=this.getFoldWidgetRange(e,"all",t);if(l){if(l.start.row<=s)break;if(l.isMultiLine())t=l.end.row;else if(r==f)break}u=t}return new i(s,o,u,e.getLine(u).length)},this.getCommentRegionBlock=function(e,t,n){var r=t.search(/\s*$/),s=e.getLength(),o=n,u=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/,a=1;while(++n<s){t=e.getLine(n);var f=u.exec(t);if(!f)continue;f[1]?a--:a++;if(!a)break}var l=n;if(l>o)return new i(o,r,l,t.length)}}.call(o.prototype)}),define("ace/mode/apex",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/apex_highlight_rules","ace/mode/folding/cstyle","ace/mode/behaviour/cstyle"],function(e,t,n){"use strict";function a(){i.call(this),this.HighlightRules=s,this.foldingRules=new o,this.$behaviour=new u}var r=e("../lib/oop"),i=e("../mode/text").Mode,s=e("./apex_highlight_rules").ApexHighlightRules,o=e("../mode/folding/cstyle").FoldMode,u=e("../mode/behaviour/cstyle").CstyleBehaviour;r.inherits(a,i),a.prototype.lineCommentStart="//",a.prototype.blockComment={start:"/*",end:"*/"},t.Mode=a});                (function() {
                    window.require(["ace/mode/apex"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            