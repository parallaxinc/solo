
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


// TODO: Remove this file. This code appears to reference BP server forms.

$(document).ready(function () {
    if (getURLParameter('debug')) {
        $.get('rest/profile/get/', function(res) {
                console.log(res);
            }).fail(function(res) {
            console.log('user info failure:');
            console.log(res);
        });
    }
    
    $('#loginform').ajaxForm({
//        beforeSubmit: function (arr, $form, options) {
//            $(".form-message").addClass("hidden");
//        },
        success: function (response) {
            if (response['success']) {
                $("#unlock-form").collapse("hide");
                $("#profile-form").collapse("show");
                $(".password").val($("#password").val());
                $("#password").val('');
            } else {
                $("#unlock-error").removeClass("hidden");
            }
        }
    });

    $('#baseInfoForm').ajaxForm({
        beforeSubmit: function (arr, $form, options) {
            $(".form-message").addClass("hidden");
        },
        success: function (response) {
            if (response['success']) {
                $("#base-success").removeClass("hidden");
            } else {
                if (response['message'] === "screenname-used") {
                    $("#base-screenname-error").removeClass("hidden");
                } else {
                    $("#base-error").removeClass("hidden");
                }
            }
        }
    });
    $('#passwordForm').ajaxForm({
        beforeSubmit: function (arr, $form, options) {
            $(".form-message").addClass("hidden");

            var passwordFields = $(".password-match");
            if ($(passwordFields[0]).val() !== $(passwordFields[1]).val()) {
                $("#password-matching-error").removeClass("hidden");
                return false;
            }
        },
        success: function (response) {
            if (response['success']) {
                $("#password-success").removeClass("hidden");

                $(".password-match").val('');

                $("#unlock-form").collapse("show");
                $("#profile-form").collapse("hide");
            } else {
                if (response['message'] === "password-complexity") {
                    $("#password-complexity-error").removeClass("hidden");
                } else {
                    $("#password-error").removeClass("hidden");
                }
            }
        }
    });
});


window['post-authenticate'] = function () {
    $("#unlock-form").collapse("hide");
    $("#profile-form").collapse("show");
    $(".password").val($("#password").val());
    $("#password").val('');
};

window['failed-authentication'] = function () {
    $("#unlock-error").removeClass("hidden");
};