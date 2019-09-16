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

define("ace/theme/twilight",["require","exports","module","ace/lib/dom"],function(e,t,n){t.isDark=!0,t.cssClass="ace-twilight",t.cssText=".ace-twilight .ace_gutter {background: #232323;color: #E2E2E2}.ace-twilight .ace_print-margin {width: 1px;background: #232323}.ace-twilight {background-color: #141414;color: #F8F8F8}.ace-twilight .ace_cursor {color: #A7A7A7}.ace-twilight .ace_marker-layer .ace_selection {background: rgba(221, 240, 255, 0.20)}.ace-twilight.ace_multiselect .ace_selection.ace_start {box-shadow: 0 0 3px 0px #141414;}.ace-twilight .ace_marker-layer .ace_step {background: rgb(102, 82, 0)}.ace-twilight .ace_marker-layer .ace_bracket {margin: -1px 0 0 -1px;border: 1px solid rgba(255, 255, 255, 0.25)}.ace-twilight .ace_marker-layer .ace_active-line {background: rgba(255, 255, 255, 0.031)}.ace-twilight .ace_gutter-active-line {background-color: rgba(255, 255, 255, 0.031)}.ace-twilight .ace_marker-layer .ace_selected-word {border: 1px solid rgba(221, 240, 255, 0.20)}.ace-twilight .ace_invisible {color: rgba(255, 255, 255, 0.25)}.ace-twilight .ace_keyword,.ace-twilight .ace_meta {color: #CDA869}.ace-twilight .ace_constant,.ace-twilight .ace_constant.ace_character,.ace-twilight .ace_constant.ace_character.ace_escape,.ace-twilight .ace_constant.ace_other,.ace-twilight .ace_heading,.ace-twilight .ace_markup.ace_heading,.ace-twilight .ace_support.ace_constant {color: #CF6A4C}.ace-twilight .ace_invalid.ace_illegal {color: #F8F8F8;background-color: rgba(86, 45, 86, 0.75)}.ace-twilight .ace_invalid.ace_deprecated {text-decoration: underline;font-style: italic;color: #D2A8A1}.ace-twilight .ace_support {color: #9B859D}.ace-twilight .ace_fold {background-color: #AC885B;border-color: #F8F8F8}.ace-twilight .ace_support.ace_function {color: #DAD085}.ace-twilight .ace_list,.ace-twilight .ace_markup.ace_list,.ace-twilight .ace_storage {color: #F9EE98}.ace-twilight .ace_entity.ace_name.ace_function,.ace-twilight .ace_meta.ace_tag,.ace-twilight .ace_variable {color: #AC885B}.ace-twilight .ace_string {color: #8F9D6A}.ace-twilight .ace_string.ace_regexp {color: #E9C062}.ace-twilight .ace_comment {font-style: italic;color: #5F5A60}.ace-twilight .ace_variable {color: #7587A6}.ace-twilight .ace_xml-pe {color: #494949}.ace-twilight .ace_indent-guide {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWMQERFpYLC1tf0PAAgOAnPnhxyiAAAAAElFTkSuQmCC) right repeat-y}";var r=e("../lib/dom");r.importCssString(t.cssText,t.cssClass)});                (function() {
                    window.require(["ace/theme/twilight"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            