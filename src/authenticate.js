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
 *  Submit a login form and process the result
 */
$(document).ready(function () {
    var loginForm = $('#loginform');

    loginForm.submit(function (event) {
        $("#login-failure").addClass("hidden");
        // Stop form from submitting normally
        event.preventDefault();

        var jqxhr = $.post(loginForm.attr('action'), loginForm.serialize(), onLoginSuccess);
        jqxhr.fail(function (jqXHR, textStatus, errorThrown) {
            alert("An unexpected error occured. Please try again later or contact the webmaster.");
        });

    });
});


/**
 * Login callback function to handle login results
 *
 * @param response
 * @param statusText
 * @param xhr
 * @param $form
 */
function onLoginSuccess(response, statusText, xhr, $form) {
    if (response.success === true) {
        if (typeof window['post-authenticate'] === 'function') {
            window['post-authenticate']();
        } else {
            location.reload(true);
        }
    } else {
        $("#login-failure").removeClass("hidden");
        if (typeof window['failed-authentication'] === 'function') {
            window['failed-authentication']();
        }
    }
}