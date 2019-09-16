
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
 *
 * @type {{SPIN: string, PROPC: string}}
 */
var projectTypes = {
    "PROPC": "blocklyc.jsp",
    "SPIN": "blocklyc.jsp"
};


/**
 *
 * @type {null}
 */
var simplemde = null;


/**
 *  Offline project details object
 *
 * @type {{}} is an empty object
 */
var pd = {};


/**
 *
 * @type {boolean}
 */
var isOffline = ($("meta[name=isOffline]").attr("content") === 'true') ? true : false;


/**
 *
 */
$(document).ready(function () {
    /*  Activate the tooltips      */
    $('[rel="tooltip"]').tooltip();

    simplemde = new SimpleMDE({
        element: document.getElementById("project-description"),
        hideIcons: ["link"],
        spellChecker: false
    });

    $('#project-type').val(getURLParameter('lang'));

    $('[data-toggle="wizard-radio"]').click(function () {
        wizard = $(this).closest('.wizard-card');
        wizard.find('[data-toggle="wizard-radio"]').removeClass('active');
        $(this).addClass('active');
        $(wizard).find('[type="radio"]').removeAttr('checked');
        $(this).find('[type="radio"]').attr('checked', 'true');
    });

    $('[data-toggle="wizard-checkbox"]').click(function () {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).find('[type="checkbox"]').removeAttr('checked');
        } else {
            $(this).addClass('active');
            $(this).find('[type="checkbox"]').attr('checked', 'true');
        }
    });

    // Stretch the page vertically to fill the browser window
    $height = $(document).height();
    $('.set-full-height').css('height', $height);

    // Set the project create and update timestamps
    var projectTimestamp = new Date();
    var isEdit = getURLParameter('edit');

    if (isOffline) {
        if (isEdit === true) {
            pd = JSON.parse(window.localStorage.getItem('localProject'));
            $('#project-name').val(pd['name']);
            simplemde.value(pd['description']);
            $("#project-description-html").html(pd['description-html']);
            $('#board-type').val(pd.board);
        }
        else {
            // Set default project details in the global offline project variable
            pd = {
                'board': '',
                'code': '<xml xmlns=\"http://www.w3.org/1999/xhtml\"></xml>',
                'created': projectTimestamp,
                'description': '',
                'description-html': '',
                'id': 0,
                'modified': projectTimestamp,
                'name': '',
                'private': true,
                'shared': false,
                'type': "PROPC",
                'user': "offline",
                'yours': true,
            }
        }
    }
});


/**
 * Verify that the project name and board type fields have data
 *
 * @returns {boolean} True if form contains data, otherwise False
 */
function validateFirstStep() {

    $(".proj").validate({
        rules: {
            'project-name': "required",
            'board-type': "required"
        },
        messages: {
            'project-name': "Please enter a project name",
            'board-type': "Please select a board type"
        }
    });

    if (!$(".proj").valid()) {
        //form is invalid
        return false;
    }

    return true;
}


/**
 *
 */
$.fn.serializeObject = function ()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


/**
 * Handle on_click event from the 'Finish' button
 */
$('#finish').on('click', function () {

    if (validateFirstStep()) {
        // if the form has valid data, serialize the form data
        var formData = $(".proj").serializeObject();

        // Get the project description in text and HTML formats
        formData['project-description'] = simplemde.value();
        formData['project-description-html'] = simplemde.options.previewRender(simplemde.value());
        
        if (!isOffline) {
            // Online - Create a basic project and get the project id
            $.post('createproject', formData, function (data) {
                if (data['success']) {
                    window.location = $('#finish').data('editor') + projectTypes[getURLParameter('lang')] + "?project=" + data['id'];
                } else {
                    if (typeof data['message'] === "string")
                        alert("There was an error when BlocklyProp tried to create your project:\n" + data['message']);
                    else
                        alert("There was an error when BlocklyProp tried to create your project:\n" + data['message'].toString());
                }
            });
        } else {
            // Save the project details in the browser's local storage
            // and let the editor figure it out.
            pd.board = formData['board-type'];
            pd.description = formData['project-description'];
            pd['name'] = formData['project-name'];
            pd['description-html'] = formData['project-description-html'];

            // Save the project details to the browser store & redirect the browser to the editor.
            window.localStorage.setItem('localProject', JSON.stringify(pd));
        	window.location = 'blocklyc.html?openFile=true';
        }
    }
});
