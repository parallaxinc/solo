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

define("ace/theme/github",["require","exports","module","ace/lib/dom"],function(e,t,n){t.isDark=!1,t.cssClass="ace-github",t.cssText='.ace-github .ace_gutter {background: #e8e8e8;color: #AAA;}.ace-github  {background: #fff;color: #000;}.ace-github .ace_keyword {font-weight: bold;}.ace-github .ace_string {color: #D14;}.ace-github .ace_variable.ace_class {color: teal;}.ace-github .ace_constant.ace_numeric {color: #099;}.ace-github .ace_constant.ace_buildin {color: #0086B3;}.ace-github .ace_support.ace_function {color: #0086B3;}.ace-github .ace_comment {color: #998;font-style: italic;}.ace-github .ace_variable.ace_language  {color: #0086B3;}.ace-github .ace_paren {font-weight: bold;}.ace-github .ace_boolean {font-weight: bold;}.ace-github .ace_string.ace_regexp {color: #009926;font-weight: normal;}.ace-github .ace_variable.ace_instance {color: teal;}.ace-github .ace_constant.ace_language {font-weight: bold;}.ace-github .ace_cursor {color: black;}.ace-github.ace_focus .ace_marker-layer .ace_active-line {background: rgb(255, 255, 204);}.ace-github .ace_marker-layer .ace_active-line {background: rgb(245, 245, 245);}.ace-github .ace_marker-layer .ace_selection {background: rgb(181, 213, 255);}.ace-github.ace_multiselect .ace_selection.ace_start {box-shadow: 0 0 3px 0px white;}.ace-github.ace_nobold .ace_line > span {font-weight: normal !important;}.ace-github .ace_marker-layer .ace_step {background: rgb(252, 255, 0);}.ace-github .ace_marker-layer .ace_stack {background: rgb(164, 229, 101);}.ace-github .ace_marker-layer .ace_bracket {margin: -1px 0 0 -1px;border: 1px solid rgb(192, 192, 192);}.ace-github .ace_gutter-active-line {background-color : rgba(0, 0, 0, 0.07);}.ace-github .ace_marker-layer .ace_selected-word {background: rgb(250, 250, 255);border: 1px solid rgb(200, 200, 250);}.ace-github .ace_invisible {color: #BFBFBF}.ace-github .ace_print-margin {width: 1px;background: #e8e8e8;}.ace-github .ace_indent-guide {background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;}';var r=e("../lib/dom");r.importCssString(t.cssText,t.cssClass)});                (function() {
                    window.require(["ace/theme/github"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            