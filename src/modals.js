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


/* ------------------------------------------------------------------
 *                       Modal dialog boxes
 *                  ----------------------------
 *
 *  [done]  New Project
 *  [wip ]  Open an Existing Project
 *          Import from Existing Project
 *  [done[  Edit Project Details
 *  [wip ]  Save Current Project
 *          Save Current Project Timer
 * ----------------------------------------------------------------*/


/**
 *
 * @description
 *
 * This is code that was refactored out of the editor.js
 * document.ready() handler.
 */
function NewProjectModal() {
    // If the current project has been modified, give the user
    // an opportunity to abort the new project process.
    if (checkLeave()) {
        const message =
            'The current project has been modified. Click OK to\n' +
            'discard the current changes and create a new project.';

        utils.confirm("Save Project", message, (result) => {
            if (result) {
                downloadCode();
            }
        }, "OK", "Cancel");
    } else {
        // Reset the values in the form to defaults
        $('#new-project-name').val('');
        $('#new-project-description').val('');
        $('#new-project-dialog-title').html(page_text_label['editor_newproject_title']);

        showNewProjectModal();
    }
}


/**
 *  Displays the new project modal.
 *
 *  Modal dialog that presents user with options to provide a project
 *  name, a description and drop down menu to select a project board
 *  type.
 *
 *  The modal provides options to cancel, escape and accept the new
 *  project details. If accepted, the accept button callback will
 *  update the global projectData object with a new, empty project.
 */
function showNewProjectModal() {

    // Set up element event handlers
    NewProjectModalCancelClick();
    NewProjectModalAcceptClick();
    NewProjectModalEnterClick();

    // let dialog = $("#new-project-board-type");
    PopulateProjectBoardTypesUIElement($("#new-project-board-type"));

    // Show the New Project modal dialog box
    $('#new-project-dialog').modal({keyboard: false, backdrop: 'static'});

    // Populate the time stamp fields
    // TODO: These settings only apply to the Edit Project dialog
    let projectTimestamp = new Date();
    $('#edit-project-created-date').html(projectTimestamp);
    $('#edit-project-last-modified').html(projectTimestamp);
}


/**
 * Handle the <enter> keypress in the modal form
 */
function NewProjectModalEnterClick() {
    // Ignore <enter> key pressed in a form field
    $('#new-project-dialog').on('keydown', function (e) {

        // Let it go if the user is in the description textarea
        if (document.activeElement.id === "new-project-description") {
            return;
        }

        if (e.key === "Enter") {

            if (!validateNewProjectForm()) {
                e.preventDefault();
                $(this).trigger('submit');
            } else {
                $('#new-project-dialog').modal('hide');
                CreateNewProject();
            }
        }
    });
}


/**
 *  New project modal Accept button onClick handler
 */
function NewProjectModalAcceptClick() {

    // Click event handler. When the user clicks the 'Continue'
    // button, validate the form
    // --------------------------------------------------------------
    $('#new-project-continue').on('click', function () {
        // verify that the project contains a valid board type and project name
        if (validateNewProjectForm()) {
            $('#new-project-dialog').modal('hide');
            CreateNewProject();
        }
        // TODO: Add test for existing project before resizing
        resetToolBoxSizing(100); // use a short delay to ensure the DOM is fully ready (TODO: may not be necessary)
    });
}


/**
 *  New project modal Cancel button onClick handler
 */
function NewProjectModalCancelClick() {
    // Set up the click even handler for the "New Project" modal
    // dialog return to the splash screen if the user clicks the
    // cancel button
    // ----------------------------------------------------------
    // This is also handling the 'Edit Project Details' modal
    // dialog box
    // ----------------------------------------------------------
    $('#new-project-cancel').on('click', () => {

        // Dismiss the modal in the UX
        $('#new-project-dialog').modal('hide');

        if (!projectData) {
            // If there is no project, go to home page.
            window.location.href = 'index.html';
        }

        // if the project is being edited, clear the fields and close the modal
        $('#new-project-board-dropdown').removeClass('hidden');
        $('#edit-project-details-static').addClass('hidden');

        $('#new-project-board-type').val('');
        $('#edit-project-board-type').html('');
        $('#edit-project-created-date').html('');
        $('#edit-project-last-modified').html('');
    });
}


/**
 * Verify that the project name and board type form fields have data
 *
 * @returns {boolean} True if form contains valid data, otherwise false
 */
function validateNewProjectForm() {

    // Select the 'proj' class
    let project = $(".proj");

    // Validate the jQuery object based on these rules. Supply helpful
    // error messages to use when a rule is violated
    project.validate({
        rules: {
            'new-project-name': "required",
            'new-project-board-type': "required"
        },
        messages: {
            'new-project-name': "Please enter a project name",
            'new-project-board-type': "Please select a board type"
        }
    });

    return !!project.valid();
}


/**
 *  Validate the required elements of the edit project form
 *
 * @returns {boolean}
 */
function validateEditProjectForm() {
    // Select the form element
    let project = $("#edit-project-form");

    // Validate the jQuery object based on these rules. Supply helpful
    // error messages to use when a rule is violated
    project.validate({
        rules: {
            'edit-project-name': "required",
            'edit-project-board-type': "required"
        },
        messages: {
            'edit-project-name': "Please enter a project name",
            'edit-project-board-type': "Please select a board type"
        }
    });

    return !!project.valid();
}


/**
 * Create a new project object, store it in the browser localStorage
 * and redirect to the editor.html page to force a project reload
 * from the browser localStorage
 */
function CreateNewProject() {
    let code = '';

    // If editing details, preserve the code, otherwise start over
    if (projectData && $('#new-project-dialog-title').html() === page_text_label['editor_edit-details']) {
        code = getXml();
    } else {
        code = EMPTY_PROJECT_CODE_HEADER;
    }

    // Save the form fields into the projectData object
    // The projectData variable is defined in globals.js
    let projectName = $('#new-project-name').val();
    let createdDateHtml = $('#edit-project-created-date').html();
    let description = $("#new-project-description").val();
    let boardType = $('#new-project-board-type').val();

    let newProject = new Project(
        projectName, description, boardType, "PROPC", code,
        createdDateHtml, createdDateHtml, getTimestamp());

    // Save the project to the browser local store for the page
    // transition
    newProject.stashProject(LOCAL_PROJECT_STORE_NAME);

    // ------------------------------------------------------
    // Clear the projectData global to prevent the onLeave
    // event handler from storing the old project code into
    // the browser storage.
    // ------------------------------------------------------
    projectData = '';

    // Redirect to the editor page
    window.location = 'blocklyc.html';
}


/**
 *  Open the modal to select a project file to load
 */
function OpenProjectModal() {

    // set title to Open file
    $('#open-project-dialog-title').html(page_text_label['editor_open']);

    // Set button onClick event handlers
    // ----------------------------------------------------------
    // This is also handling the 'Edit Project Details' modal
    // dialog box
    // ----------------------------------------------------------
    $('#open-project-select-file-cancel').on('click', () => {

        // Dismiss the modal in the UX
        $('#open-project-dialog').modal('hide');

        if (!projectData) {
            // If there is no project, go to home page.
            window.location.href = 'index.html';
        }
        // A copy of the current project is located in the browser localStorage
        setupWorkspace(projectData,
            function () {
                window.localStorage.removeItem(LOCAL_PROJECT_STORE_NAME);
            });
    });


    $('#open-project-select-file-open').on('click', () => {
        if (window.localStorage.getItem(TEMP_PROJECT_STORE_NAME)) {
            window.localStorage.setItem(
                LOCAL_PROJECT_STORE_NAME,
                window.localStorage.getItem(TEMP_PROJECT_STORE_NAME));
            window.localStorage.removeItem(TEMP_PROJECT_STORE_NAME);
            window.location = 'blocklyc.html';
        }
    });

    // Import a project .SVG file
    $('#open-project-dialog').modal({keyboard: false, backdrop: 'static'});

    // If the user selects a file and successfully uploads it, the
    // project will be stored in localStorage.TEMP_PROJECT_STORE_NAME.
    // The form Accept button handler should look there when it is
    // time to proces the new project.
}

/**
 *  Open the Open Project File dialog
 */
function OpenProjectFileDialog() {

    // TODO: Check to see if a modified project is currently on the
    //  editor canvas. If there is, provide a warning to save the
    //  project before continuing.


    // set title to Open file
    $('#upload-dialog-title').html(page_text_label['editor_open']);

    // hide "append" button
    $('#selectfile-append').addClass('hidden');

    // change color of the "replace" button to blue and change text to "Open"
    let replace = $('#selectfile-replace');
    if (replace) {
        replace.removeClass('btn-danger').addClass('btn-primary');
        replace.html(page_text_label['editor_button_open']);
    }

    // Import a project .SVG file
    $('#upload-dialog').modal({keyboard: false, backdrop: 'static'});

    // TODO: what is this doing here? Shouldn't we be setting up projectData instead of localStore?
    //       Or can this simply be deleted, because the openFile functions will take care of this?
    if (projectData) {
        console.log("Loading workspace with project %s", LOCAL_PROJECT_STORE_NAME);
        setupWorkspace(JSON.parse(window.localStorage.getItem(LOCAL_PROJECT_STORE_NAME)));
    }
}


/**
 * Dialog box to allow editing project name and description
 *
 * @description
 * The dialog displays a number of project details.
 */
function editProjectDetails() {
    EditOfflineProjectDetails();
}


/**
 *  Present the Edit Project Details modal dialog box
 *
 *  The onClick event handlers for the Cancel and Continue buttons
 *  will manage the project state as required.
 */
function EditOfflineProjectDetails() {
    // Set the dialog buttons click event handlers
    setEditOfflineProjectDetailsContinueHandler();
    setEditOfflineProjectDetailsCancelHandler();
    setEditOfflineProjectDetailsEnterHandler();

    // Load the current project details into the html form data
    $('#edit-project-name').val(projectData['name']);
    $('#edit-project-description').val(projectData['description']);

    // Display additional project details.
    let projectBoardType = $('#edit-project-board-type-ro');
    projectBoardType.val(projectData['board']);
    projectBoardType.html(profile.default.description);
    $('#edit-project-created-date-ro').html(projectData['created']);
    $('#edit-project-last-modified-ro').html(projectData['modified']);

    // Show the dialog
    $('#edit-project-dialog').modal({keyboard: false, backdrop: 'static'});
}


/**
 *  Handle the Enter key press when processing a form
 */
function setEditOfflineProjectDetailsEnterHandler() {
    // Ignore <enter> key pressed in a form field
    $('#edit-project-dialog').on('keydown', (e) => {
        // Let it go if the user is in the description textarea
        if (document.activeElement.id === "edit-project-description") {
            return;
        }

        if (e.key === "Enter") {
            if (!validateEditProjectForm()) {
                e.preventDefault();
                $(this).trigger('submit');
            } else {
                $('#new-project-dialog').modal('hide');
                // Update project details.
                UpdateProjectDetails();
            }
        }
    });
}


/**
 *  Edit Project Details - Continue button onClick event handler
 */
function setEditOfflineProjectDetailsContinueHandler() {
    $('#edit-project-continue').on('click', function () {
        // verify that the project contains a valid board type and project name
        if (validateEditProjectForm()) {

            // Hide the Edit Project modal dialog
            $('#edit-project-dialog').modal('hide');

            UpdateProjectDetails();
            showInfo(projectData);
        }
    });
}


/**
 * Update the name and description details of the current project
 */
function UpdateProjectDetails() {
    let newName = $('#edit-project-name').val();
    if (!(projectData['name'] === newName)) {
        projectData['name'] = newName;
    }

    let newDescription = $('#edit-project-description').val();
    if (!(projectData['description'] === newDescription)) {
        projectData['description'] = newDescription;
    }
}


/**
 *  Edit Project Details - Cancel button onClick event handler
 */
function setEditOfflineProjectDetailsCancelHandler() {
    $('#edit-project-cancel').on('click', () => {
        // if the project is being edited, clear the fields and close the modal
        $('#edit-project-board-dropdown').removeClass('hidden');
        $('#edit-project-details-ro').addClass('hidden');
        $('#edit-project-board-type-select').val('');

        $('#edit-project-board-type-ro').html('');
        $('#edit-project-created-date-ro').html('');
        $('#edit-project-last-modified-ro').html('');

        // Hide the Edit Project modal dialog
        $('#edit-project-dialog').modal('hide');
    });
}


/**
 *  Configure the Save-As modal UI elements
 */
function SetupSaveAsModalDialog() {
// Set up Save-As modal dialog prompts
    $("#save_as_dialog_title_text").html('Choose a project name and board type');
    $("#save_as_dialog_button").html('Continue');
    $(".save-as-close").addClass('hidden');
    $('#save-as-project-name').val('MyProject');
    $("#saveAsDialogSender").html('offline');
    $("#save-as-board-type").empty();
}


/**
 * Invoke the Save-As project modal dialog window
 */
function SaveAsProjectModal() {
    PopulateProjectBoardTypesUIElement($("#save-as-board-type"));
    $('#save-as-type-dialog').modal({keyboard: false, backdrop: 'static'});
}


/*   Load a Project file    */

/**
 *
 */
function initUploadModalLabels() {

    // set the upload modal's title to "import" if offline
    $('#upload-dialog-title').html(page_text_label['editor_import']);
    $('#upload-project span').html(page_text_label['editor_import']);

    // Hide the save-as button.
    $('#save-project-as, save-as-btn').addClass('hidden');

    disableUploadDialogButtons();
}

/**
 * Reset the upload/import modal window to defaults after use
 */
function resetUploadImportModalDialog() {
    // reset the title of the modal
    $('upload-dialog-title').html(page_text_label['editor_import']);

    // hide "append" button
    $('#selectfile-append').removeClass('hidden');

    // change color of the "replace" button to blue and change text to "Open"
    $('#selectfile-replace').removeClass('btn-primary').addClass('btn-danger').html(page_text_label['editor_button_replace']);

    // reset the blockly toolbox sizing to ensure it renders correctly:
    resetToolBoxSizing(100);
}


/**
 * disable to upload dialog buttons until a valid file is uploaded
 */
function disableUploadDialogButtons() {
    document.getElementById("selectfile-replace").disabled = true;
    document.getElementById("selectfile-append").disabled = true;
}


// HELPER FUNCTIONS

/**
 * Populate the UI Project board type drop-down list
 *
 * @param element is the <select> HTML element that will be populated
 * with a collection of possible board types
 *
 * @param selected is an optional string parameter containing the
 * board type in the list that should be designated as the selected
 * board type.
 */
function PopulateProjectBoardTypesUIElement(element, selected = null) {

    if (element) {
        // Clear out the board type dropdown menu
        element.empty();

        // Populate the board type dropdown menu with a header first,

        element.append($('<option />')
            .val('')
            .text(page_text_label['project_create_board_type_select'])
            .attr('disabled', 'disabled')
            .attr('selected', 'selected')
        );

        // then populate the dropdown with the board types
        // defined in propc.js in the 'profile' object
        // (except 'default', which is where the current project's type is stored)
        for (let boardTypes in profile) {
            if (boardTypes !== 'default' && boardTypes !== 'propcfile') {

                element.append($('<option />')
                    .val(boardTypes)
                    .text(profile[boardTypes].description));
            }

            // Optionally set the selected option element
            if (selected && boardTypes === selected) {
                $(element).val(selected);
            }
        }
    }
}


/**
 * Display the Timed Save Project modal dialog
 *
 */
function ShowProjectTimerModalDialog() {
    $('#save-check-dialog').modal({keyboard: false, backdrop: 'static'});
}

