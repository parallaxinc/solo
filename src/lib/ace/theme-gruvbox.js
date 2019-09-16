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

define("ace/theme/gruvbox",["require","exports","module","ace/lib/dom"],function(e,t,n){t.isDark=!0,t.cssClass="ace-gruvbox",t.cssText='.ace-gruvbox .ace_gutter-active-line {background-color: #3C3836;}.ace-gruvbox {color: #EBDAB4;background-color: #1D2021;}.ace-gruvbox .ace_invisible {color: #504945;}.ace-gruvbox .ace_marker-layer .ace_selection {background: rgba(179, 101, 57, 0.75)}.ace-gruvbox.ace_multiselect .ace_selection.ace_start {box-shadow: 0 0 3px 0px #002240;}.ace-gruvbox .ace_keyword {color: #8ec07c;}.ace-gruvbox .ace_comment {font-style: italic;color: #928375;}.ace-gruvbox .ace-statement {color: red;}.ace-gruvbox .ace_variable {color: #84A598;}.ace-gruvbox .ace_variable.ace_language {color: #D2879B;}.ace-gruvbox .ace_constant {color: #C2859A;}.ace-gruvbox .ace_constant.ace_language {color: #C2859A;}.ace-gruvbox .ace_constant.ace_numeric {color: #C2859A;}.ace-gruvbox .ace_string {color: #B8BA37;}.ace-gruvbox .ace_support {color: #F9BC41;}.ace-gruvbox .ace_support.ace_function {color: #F84B3C;}.ace-gruvbox .ace_storage {color: #8FBF7F;}.ace-gruvbox .ace_keyword.ace_operator {color: #EBDAB4;}.ace-gruvbox .ace_punctuation.ace_operator {color: yellow;}.ace-gruvbox .ace_marker-layer .ace_active-line {background: #3C3836;}.ace-gruvbox .ace_marker-layer .ace_selected-word {border-radius: 4px;border: 8px solid #3f475d;}.ace-gruvbox .ace_print-margin {width: 5px;background: #3C3836;}.ace-gruvbox .ace_indent-guide {background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNQUFD4z6Crq/sfAAuYAuYl+7lfAAAAAElFTkSuQmCC") right repeat-y;}';var r=e("../lib/dom");r.importCssString(t.cssText,t.cssClass)});                (function() {
                    window.require(["ace/theme/gruvbox"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            