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

// var Blockly = require('blockly/core');
// import Blockly from 'blockly/core';

/** GLOBAL VARIABLES **/


/**
 * The default number of minutes to wait until the user is prompted
 * to save the altered project.
 *
 * @type {number}
 */
const SAVE_PROJECT_TIMER_DELAY = 20;


/**
 *  Timestamp to indicate the amount of time that must expire before
 *  the user is advised to save their project.
 *
 * @type {number}
 */
var last_saved_timestamp = 0;


/**
 * Timestamp to record the amount of time that has gone by since the
 * current project was last saved to storage.
 *
 * @type {number}
 */
var last_saved_time = 0;


/**
 * Uploaded project XML code
 *
 * @type {string}
 */
var uploadedXML = '';








// TODO: set up a markdown editor (removed because it doesn't work in a Bootstrap modal...)


// ------------------------------------------------------------------
//
// Project save timestamp and interval functions
//
// ------------------------------------------------------------------


/**
 * Ping the Rest API every 60 seconds
 *
 * @type {number}
 */
const pingInterval = setInterval(() => {
        $.get(BASE_URL + 'ping');
    },
    60000
);


/**
 *
 * @param delayMinutes
 * @param resetTimer
 */
const timestampSaveTime = (delayMinutes, resetTimer) => {
    const timeNow = getTimestamp();

    // If the proposed delay is less than the delay that's already in
    // process, don't update the delay to a new shorter time.
    if (timeNow + (delayMinutes * 60000) > last_saved_timestamp) {
        last_saved_timestamp = timeNow + (delayMinutes * 60000);

        if (resetTimer) {
            last_saved_time = timeNow;
        }
    }
};


/**
 * Get the current time stamp
 *
 * @returns {number} Number of seconds since 1/1/1970
 */
function getTimestamp() {
    const date = new Date();
    return date.getTime();
}


// TODO: We have to have a better way to manage the timer than using
//  an HTML tag.
/**
 * Checks a time value embedded within a <span> element to determine
 * if it is time to prompt the user to save their project code.
 *
 * The <span> tag is introduced as part of a message, located in the
 * messages.js file, page_text_label['editor_save-check_warning'].
 */
const checkLastSavedTime = function () {
    const t_now = getTimestamp();
    const s_save = Math.round((t_now - last_saved_time) / 60000);

    // Write the timestamp to the DOM
    $('#save-check-warning-time').html(s_save.toString(10));

    //if (s_save > 58) {
    // TODO: It's been to long - auto-save, then close/set URL back to login page.
    //}

    if (t_now > last_saved_timestamp && checkLeave()) {
        // It's time to pop up a modal to remind the user to save.
        ShowProjectTimerModalDialog();
    }
};


// ------------------------------------------------------------------
// -----          End of project save timer functions          ------
// ------------------------------------------------------------------


/**
 * Execute this code as soon as the DOM becomes ready.
 * Replaces the old document.ready() construct
 */
$(() => {
    RenderPageBrandingElements();

    // Set the compile toolbar buttons to unavailable
    // setPropToolbarButtons();
    PropToolbarButtonController(false);

    /* -- Set up amy event handlers once the DOM is ready -- */

    // Update the blockly workspace to ensure that it takes
    // the remainder of the window. This is an async call.
    $(window).on('resize', function () {
        // TODO: Add correct parameters to the resetToolBoxSizing()
        resetToolBoxSizing(100, true);
    });

    // Event handler for the OnBeforeUnload event
    // ------------------------------------------------------------------------
    // This event fires just before the document begins to unload. The unload
    // can be stopped by returning a string message. The browser will then
    // open a modal dialog the presents the message and options for Cancel and
    // Leave. If the Cancel option is selected the unload event is cancelled
    // and page processing continues.
    // ------------------------------------------------------------------------
    window.addEventListener('beforeunload', function (e) {
        // Call checkLeave only if we are NOT loading a new project
        if (window.getURLParameter('openFile') === "true") {
            return;
        }

        // Or creating a new project
        if (window.getURLParameter('newProject') === "true") {
            return;
        }

        // If the localStorage is empty, store the current project into the
        // localStore so that if the page is being refreshed, it will
        // automatically be reloaded.
        if (projectData &&
            projectData.name !== "undefined" &&
            ! window.localStorage.getItem(LOCAL_PROJECT_STORE_NAME)) {

            if (! window.localStorage.getItem(LOCAL_PROJECT_STORE_NAME)) {
                // Deep copy of the projectData object
                let tempProject = {};
                Object.assign(tempProject, projectData);

                // Overwrite the code blocks with the current project state
                tempProject.code = getXml();
                tempProject.timestamp = getTimestamp();

                // Save the current project into the browser store where it will
                // get picked up by the page loading code.
                window.localStorage.setItem(LOCAL_PROJECT_STORE_NAME, JSON.stringify(tempProject));
            }
        }

        if (checkLeave()) {
            e.preventDefault();     // Cancel the event
            e.returnValue = Blockly.Msg.DIALOG_CHANGED_SINCE;
            return Blockly.Msg.DIALOG_CHANGED_SINCE;
        }
    });

    initInternationalText();
    initEditorIcons();
    initEventHandlers();

    // This is necessary only because the target modal is being
    // used for multiple but similar purposes.
    // TODO: Make separate modals for each purpose
    initUploadModalLabels();

    // Reset the upload/import modal to its default state when closed
    $('#upload-dialog').on('hidden.bs.modal', resetUploadImportModalDialog());

    $('.url-prefix').attr('href', function (idx, cur) {
        return BASE_URL + cur;
    });

    initCdnImageUrls();
    initClientDownloadLinks();


    // TODO: Use the ping endpoint to verify that we are offline.

    // Stop pinging the Rest API
    clearInterval(pingInterval);

    // Load a project file from local storage
    if (window.getURLParameter('openFile') === "true") {
        // Show the Open Project modal dialog
        OpenProjectModal();

    } else if (window.getURLParameter('newProject') === "true") {
        // Show the New Project modal dialog
        NewProjectModal();

    } else if (window.localStorage.getItem(LOCAL_PROJECT_STORE_NAME)) {
        // Load a project from localStorage if available
        try {
            // Get a copy of the last know state of the current project
            let localProject = JSON.parse(window.localStorage.getItem(LOCAL_PROJECT_STORE_NAME));

            // TODO: Address clear workspace has unexpected result
            // **************************************************
            // This should clear out the existing blockly project
            // and reset Blockly core for a new project. That
            // does not appear to be happening.
            // **************************************************

            setupWorkspace(localProject, function () {
                window.localStorage.removeItem(LOCAL_PROJECT_STORE_NAME);
            });

            // Set the compile toolbar buttons to unavailable
            // setPropToolbarButtons();
            PropToolbarButtonController(false);

        } catch (objError) {
            if (objError instanceof SyntaxError) {
                console.error(objError.name);
                utils.showMessage(Blockly.Msg.DIALOG_ERROR, objError.message);
            } else {
                console.error(objError.message);
                ClearBlocklyWorkspace();
                projectData = null;
                utils.showMessage(Blockly.Msg.DIALOG_ERROR, Blockly.Msg.DIALOG_LOADING_ERROR);
            }
        }
    } else {
        // No viable project available, so redirect to index page.
        window.location.href = 'index.html' + window.getAllURLParameters();
    }

    // Make sure the toolbox appears correctly, just for good measure.
    // And center the blocks on the workspace. This assumes that there is
    // an active project in the Blockly object.
    resetToolBoxSizing(250, true);

    // Initialize the terminal
    pTerm = new PropTerm(
        document.getElementById('serial_console'),
        function(characterToSend) {
            if (clientService.type === 'http' && clientService.activeConnection) {
                clientService.activeConnection.send(btoa(characterToSend));

            } else if (clientService.type === 'ws') {
                var msg_to_send = {
                    type: 'serial-terminal',
                    outTo: 'terminal',
                    portPath: getComPort(),
                    baudrate: baudrate.toString(10),
                    msg: (clientService.rxBase64 ? btoa(characterToSend) : characterToSend),
                    action: 'msg'
                };
                clientService.activeConnection.send(JSON.stringify(msg_to_send));
            }
        }
    );
});


/**
 * Check project state to see if it has changed before leaving the page
 *
 * @returns {boolean}
 * Return true if the project has been changed but has not been
 * persisted to storage.
 *
 * @description
 * The function assumes that the projectData global variable holds
 * the original copy of the project, prior to any user modification.
 * The code then compares the code in the Blockly core against the
 * original version of the project to determine if any changes have
 * occurred.
 *
 * This only examines the project data. This code should also check
 * the project name and descriptions for changes.
 */
function checkLeave() {
    // The projectData variable is now officially an object. Consider it empty
    // if it is null or if the name property is undefined.
    if (!projectData || typeof projectData.name === 'undefined') {
        return false;
    }

    let currentXml = getXml();
    let savedXml = projectData.code;

    return compareProjectCode(currentXml, savedXml);
}


/**
 * Compare the project block code of two projects for equality
 *
 * @param {string} projectA is one of the two projects to compare for equality
 * @param {string} projectB is the second of two projects to compare for equalityy.
 *
 * @returns {boolean} True if projects are unequal, otherwise return false
 */
function compareProjectCode(projectA, projectB) {
    // Sanity checks
    if (typeof projectA === 'undefined') {
        console.log("project A is undefined.");
        return true;
    }

    if (typeof projectB === 'undefined') {
        console.log("project B is undefined.");
        return true;
    }

    // Looking for the first <block> XML element
    const searchTerm = '<block';

    // Get the offset to the first <block> xml element
    let indexA = projectA.indexOf(searchTerm);
    let indexB = projectB.indexOf(searchTerm);

    // No blocks in either copy of the project
    // They must be equally devoid of a project
    if (indexA === -1 && indexB === -1) {
        return false;
    }

    // Return false if the first block is not found
    // in one of the two projects.
    if (indexA === -1 || indexB === -1) {
        return true;
    }

    // Start comparing the projects beginning with the first block
    // that appears after the namespace declaration
    let result = findFirstDiffPos(
        projectA.substring(indexA, projectA.length),
        projectB.substring(indexB, projectB.length));

    // findFirstDiffPos() will return a -1 if the projects are
    // identical, that is, the project was not altered.
    return result !== -1;
}


/**
 * Insert the text strings (internationalization) for all of the UI
 * elements on the editor page once the page has been loaded.
 */
function initInternationalText() {
    // Locate each HTML element of class 'keyed-lang-string'
    $(".keyed-lang-string").each(function () {

        // Set a reference to the current selected element
        let span_tag = $(this);

        // Get the associated key value that will be used to locate
        // the text string in the page_text_label array. This array
        // is declared in messages.js
        let pageLabel = span_tag.attr('data-key');

        // If there is a key value
        if (pageLabel) {
            if (span_tag.is('a')) {
                // if the html element is an anchor, add a link
                span_tag.attr('href', page_text_label[pageLabel]);
            } else if (span_tag.is('input')) {
                // if the html element is a form input, set the
                // default value for the element
                span_tag.attr('value', page_text_label[pageLabel]);
            } else {
                // otherwise, assume that we're inserting html
                span_tag.html(page_text_label[pageLabel]);
            }
        }
    });

    // insert text strings (internationalization) into button/link tooltips
    for (let i = 0; i < tooltip_text.length; i++) {
        if (tooltip_text[i] && document.getElementById(tooltip_text[i][0])) {
            $('#' + tooltip_text[i][0]).attr('title', tooltip_text[i][1]);
        }
    }
}


/**
 * Initialize the tool bar icons
 */
function initEditorIcons() {
    // ------------------------------------------------------------------------
    // Locate each element that has a class 'bpIcon' assigned and contains a
    // 'data-icon' attribute. Iterate through each match and draw the custom
    // icons into the specified element.
    // ------------------------------------------------------------------------
    $('.bpIcon[data-icon]').each(function () {
        $(this).html(bpIcons[$(this).attr('data-icon')]);
    });
}

/**
 * Set up event handlers - Attach events to nav/action menus/buttons
 */
function initEventHandlers() {
    // Toolbar - left side
    $('#prop-btn-comp').on('click', () => compile());
    $('#prop-btn-ram').on('click', () => {
        loadInto('Load into RAM', 'bin', 'CODE', 'RAM');
    });

    $('#prop-btn-eeprom').on('click', () => {
        loadInto('Load into EEPROM', 'eeprom', 'CODE', 'EEPROM');
    });

    $('#prop-btn-term').on('click', () => serial_console());
    $('#prop-btn-graph').on('click', () => graphing_console());
    $('#prop-btn-find-replace').on('click', () => findReplaceCode());
    $('#prop-btn-pretty').on('click', () => formatWizard());

    $('#prop-btn-undo').on('click', () => codePropC.undo());
    $('#prop-btn-redo').on('click', () => codePropC.redo());

    // TODO: The event handler is just stub code.
    $('#term-graph-setup').on('click', () => configureTermGraph());

    $('#propc-find-btn').on('click', () => {
        codePropC.find(document.getElementById('propc-find').value, {}, true);
    });

    $('#propc-replace-btn').on('click', () => {
        codePropC.replace(document.getElementById(
            'propc-replace').value,
            {needle: document.getElementById('propc-find').value},
            true);
    });

    $('#find-replace-close').on('click', () => findReplaceCode());

    // Close upload project dialog event handler
    $('#upload-close').on('click', () => clearUploadInfo(false));


    // **********************************
    // **     Toolbar - right side     **
    // **********************************
    // Project Name listing

    // Make the text in the project-name span editable
    $('.project-name').attr('contenteditable', 'true')
    // Change the styling to indicate to the user that they are editing this field
        .on('focus', () => {
            let projectName = $('.project-name');
            projectName.html(projectData.name);
            projectName.addClass('project-name-editable');
        })
        // reset the style and save the new project name to the projectData object
        .on('blur', () => {
            let projectName = $('.project-name');

            if (projectName.setSelectionRange) {
                projectName.focus();
                projectName.setSelectionRange(0, 0);
            } else if (projectName.createTextRange) {
                let range = projectName.createTextRange();
                range.moveStart('character', 0);
                range.select();
            }

            projectName.removeClass('project-name-editable');
            // if the project name is greater than 25 characters, only display the first 25
            if (projectData.name.length > PROJECT_NAME_DISPLAY_MAX_LENGTH) {
                projectName.html(
                    projectData.name.substring(0, PROJECT_NAME_DISPLAY_MAX_LENGTH - 1) + '...');
            }
        })
        // change the behavior of the enter key
        .on('keydown', (e) => {
            if (e.which === 13 || e.keyCode === 13) {
                e.preventDefault();
                $('.project-name').trigger('blur');
            }
        })
        // validate the input to ensure it's not too long, and save changes as the user types.
        .on('keyup', () => {
            let tempProjectName = $('.project-name').html()
            if (tempProjectName.length > PROJECT_NAME_MAX_LENGTH || tempProjectName.length < 1) {
                $('.project-name').html(projectData.name);
            } else {
                projectData.name = tempProjectName;
            }
        });

    // Blocks/Code/XML button
    $('#btn-view-propc').on('click', () => renderContent('tab_propc'));
    $('#btn-view-blocks').on('click', () => renderContent('tab_blocks'));
    $('#btn-view-xml').on('click', () => renderContent('tab_xml'));

    // NEW Button
    // New Project toolbar button
    // TODO: New Project should be treated the same way as Open Project.
    $('#new-project-button').on('click', () => NewProjectModal());

    // OPEN Button
    // Open Project toolbar button. Stash the current project into the
    // browser localStorage and then redirect to the OpenFile URL.
    $('#open-project-button').on('click', () => OpenProjectModal());
    // {
    //     // Save the project to localStorage
    //     window.localStorage.setItem(LOCAL_PROJECT_STORE_NAME, JSON.stringify(projectData));
    //     window.location = "blocklyc.html?openFile=true" + window.getAllURLParameters().replace('?', '&');
    // });

    // Save button
    // Save Project modal 'Save' button click handler
    $('#save-btn, #save-project').on('click', () => downloadCode());


    // --------------------------------
    // Hamburger menu items
    // --------------------------------

    // Edit project details
    $('#edit-project-details').on('click', () => editProjectDetails());

    // Help and Reference - online help web pages
    // Implemented as an href in the menu

    // ---- Hamburger drop down horizontal line ----

    // Download project to Simple IDE
    $('#download-side').on('click', () => downloadPropC());

    /**
     * Import project file menu selector
     *
     * @description
     * Import (upload) project from storage. This is designed to
     * merge code from an existing project into the current project.
     */
    $('#upload-project').on('click', () => uploadCode());

    // ---- Hamburger drop down horizontal line ----

    // Configure client menu selector
    // Client configuration is only possible with the deprecated
    // BlocklyProp Client. The BlocklyProp Launcher does not require
    // a configuration dialog
    // TODO: Client configuration is deprecated. No needed for Launcher
    $('#client-setup').on('click', () => configureConnectionPaths());

    // --------------------------------
    // End of hamburger menu items
    // --------------------------------


    // Save As button
    $('#save-as-btn').on('click', () => saveAsDialog());
    // Save-As Project
    $('#save-project-as').on('click', () => saveAsDialog());

    // Save As new board type
    $('#save-as-board-type').on('change', () => checkBoardType(
        $('#saveAsDialogSender').html()));
    $('#save-as-board-btn').on('click', () => saveProjectAs(
        $('#save-as-board-type').val(),
        $('#save-as-project-name').val()
    ));

    // Clear the select project file dialog event handler
    $('#selectfile-clear').on('click', () => clearUploadInfo(true));

    $('#btn-graph-play').on('click', () => graph_play());
    $('#btn-graph-snapshot').on('click', () => downloadGraph());
    $('#btn-graph-csv').on('click', () => downloadCSV());
    $('#btn-graph-clear').on('click', () => graphStartStop('clear'));


    // Client install instruction modals
    $('.show-os-win').on('click', () => showOS('Windows'));
    $('.show-os-mac').on('click', () => showOS('MacOS'));
    $('.show-os-chr').on('click', () => showOS('ChromeOS'));
    $('.show-os-lnx').on('click', () => showOS('Linux'));


    // --------------------------------------------------------------
    // Bootstrap modal event handler for the Save Project Timer
    // dialog. The hidden.bs.model event occurs when the modal is
    // fully hidden (after CSS transitions have completed)
    // --------------------------------------------------------------
    $('#save-check-dialog').on('hidden.bs.modal', () => {
        timestampSaveTime(5, false);
    });


    // Hide these elements of the Open Project File modal when it
    // receives focus
    $("#selectfile").focus(function () {
        $('#selectfile-verify-notvalid').css('display', 'none');
        $('#selectfile-verify-valid').css('display', 'none');
        $('#selectfile-verify-boardtype').css('display', 'none');
    });
}


/**
 * Set the BlocklyProp Client download links
 *
 * Set the href for each of the client links to point to the correct files
 * available on the downloads.parallax.com S3 site. The URL is stored in a
 * HTML meta tag.
 */
function initClientDownloadLinks() {
    // Windows 32-bit
    $('.client-win32-link').attr('href', $("meta[name=win32client]").attr("content"));
    $('.client-win32zip-link').attr('href', $("meta[name=win32zipclient]").attr("content"));

    // Windows 64-bit
    $('.client-win64-link').attr('href', $("meta[name=win64client]").attr("content"));
    $('.client-win64zip-link').attr('href', $("meta[name=win64zipclient]").attr("content"));
    $('.launcher-win64-link').attr('href', $("meta[name=win64launcher]").attr("content"));
    $('.launcher-win64zip-link').attr('href', $("meta[name=win64ziplauncher]").attr("content"));

    // MacOS
    $('.client-mac-link').attr('href', $("meta[name=macOSclient]").attr("content"));
    $('.launcher-mac-link').attr('href', $("meta[name=macOSlauncher]").attr("content"));

}


/**
 * Set the URLs for all of the CDN-sourced images
 */
function initCdnImageUrls() {
    $("img").each(function () {
        let img_tag = $(this);

        // Set the source of the image
        let img_source = img_tag.attr('data-src');
        if (img_source) {
            img_tag.attr('src', CDN_URL + img_source);
        }
    });
}


/**
 * Reset the sizing of blockly's toolbox and canvas.
 *
 * NOTE: This is a workaround to ensure that it renders correctly
 * TODO: Find a permanent replacement for this workaround.
 *
 * @param {number} resizeDelay milliseconds to delay the resizing, especially
 * if used after a change in the window's location or a during page
 * reload.
 * @param {boolean} centerBlocks Center the project blocks if true.
 */
function resetToolBoxSizing(resizeDelay, centerBlocks) {
    // Vanilla Javascript is used here for speed - jQuery
    // could probably be used, but this is faster. Force
    // the toolbox to render correctly
    setTimeout(() => {
        // find the height of just the blockly workspace by
        // subtracting the height of the navigation bar
        let navTop = document.getElementById('editor').offsetHeight;
        let navHeight = window.innerHeight - navTop;
        let navWidth = window.innerWidth;

        // Build an array of UI divs that display content
        let blocklyDiv = [
            document.getElementById('content_blocks'),
            document.getElementById('content_propc'),
            document.getElementById('content_xml')
        ];

        // Set the size of the divs
        for (let i = 0; i < 3; i++) {
            blocklyDiv[i].style.left = '0px';
            blocklyDiv[i].style.top = navTop + 'px';
            blocklyDiv[i].style.width = navWidth + 'px';
            blocklyDiv[i].style.height = navHeight + 'px';
        }

        // Update the Blockly editor canvas to use the new space
        if (Blockly.mainWorkspace && blocklyDiv[0].style.display !== 'none') {
            Blockly.svgResize(Blockly.mainWorkspace);

            // center the blocks on the workspace
            if (centerBlocks) {
                Blockly.getMainWorkspace().scrollCenter();
            }
        }

    }, resizeDelay || 10);  // 10 millisecond delay
}


/**
 * Populate the projectData global
 *
 * @param {{}} data is the current project object
 * @param {function} callback is called if provided when the function completes
 */
function setupWorkspace(data, callback) {
    if (data && typeof(data.board) === 'undefined') {
        if (callback) {
            callback({
                "error": 1,
                "message": "Project data is null."
            });
        }
        return -1;
    }

    // Delete all existing blocks, comments and undo stacks
    ClearBlocklyWorkspace();

    projectData = data;     // Set the master project image
    showInfo(data);         // Update the UI with project related details

    // Set various project settings based on the project board type
    // NOTE: This function is in propc.js
    setProfile(projectData.board);

    // Set the help link to the ab-blocks, s3 reference, or propc reference
    // TODO: modify blocklyc.html/jsp and use an id or class selector
    if (projectData.board === 's3') {
        initToolbox(projectData.board);
        $('#online-help').attr('href', 'https://learn.parallax.com/s3-blocks');
        // Create UI block content from project details
        renderContent('blocks');
    } else if (projectData.board === 'propcfile') {
        init(Blockly);
        $('#online-help').attr('href', 'https://learn.parallax.com/support/C/propeller-c-reference');
        // Create UI block content from project details
        renderContent('propc');
    } else {
        initToolbox(projectData.board);
        $('#online-help').attr('href', 'https://learn.parallax.com/ab-blocks');
        // Create UI block content from project details
        renderContent('blocks');
    }

    // Edit project details menu item
    if (projectData) {
        $('#edit-project-details').html(page_text_label['editor_edit-details']);
    }

    resetToolBoxSizing();
    timestampSaveTime(SAVE_PROJECT_TIMER_DELAY, true);

    // Save project reminder timer. Check every 60 seconds
    setInterval(checkLastSavedTime, 60000);

    // Execute the callback function if one was provided
    if (callback) {
        callback();
    }
}


/**
 * Set the UI fields for the project name, project owner and project type icon
 *
 * @param {{}} data is the project data structure
 */
function showInfo(data) {
    // Display the project name
    if (data.name.length > PROJECT_NAME_DISPLAY_MAX_LENGTH) {
        $('.project-name').html(data['name'].substring(0, PROJECT_NAME_DISPLAY_MAX_LENGTH - 1) + '...');
    } else {
        $(".project-name").html(data.name);
    }

    // Create an array of board type icons
    let projectBoardIcon = {
        "activity-board": "images/board-icons/IconActivityBoard.png",
        "s3": "images/board-icons/IconS3.png",
        "heb": "images/board-icons/IconBadge.png",
        "heb-wx": "images/board-icons/IconBadgeWX.png",
        "flip": "images/board-icons/IconFlip.png",
        "other": "images/board-icons/IconOtherBoards.png",
        "propcfile": "images/board-icons/IconC.png"
    };

    // Set the project icon to the correct board type
    $(".project-icon").html('<img src="' + CDN_URL + projectBoardIcon[data.board] + '"/>');
};


/**
 * @deprecated Cannot find any references to this function in code.
 */
function saveProject() {
    // TODO: Refactor to remove the concept of project ownership
    if (projectData.yours) {
        var code = getXml();
        projectData.code = code;

        $.post(BASE_URL + 'rest/project/code', projectData, function (data) {
            var previousOwner = projectData.yours;
            projectData = data;
            projectData.code = code; // Save code in projectdata to be able to verify if code has changed upon leave

            // If the current user doesn't own this project, a new one is created and the page is redirected to the new project.
            if (!previousOwner) {
                window.location.href = BASE_URL + 'projecteditor?id=' + data['id'];
            }
        }).done(function () {
            // Save was successful, show green with checkmark
            var elem = document.getElementById('save-project');
            elem.style.paddingLeft = '10px';
            elem.style.background = 'rgb(92, 184, 92)';
            elem.style.borderColor = 'rgb(76, 174, 76)';

            setTimeout(function () {
                elem.innerHTML = 'Save &#x2713;';
            }, 600);

            setTimeout(function () {
                elem.innerHTML = 'Save&nbsp;&nbsp;';
                elem.style.paddingLeft = '15px';
                elem.style.background = '#337ab7';
                elem.style.borderColor = '#2e6da4';
            }, 1750);
        }).fail(function () {
            // Save failed.  Show red with "x"
            var elem = document.getElementById('save-project');
            elem.style.paddingLeft = '10px';
            elem.style.background = 'rgb(214, 44, 44)';
            elem.style.borderColor = 'rgb(191, 38, 38)';

            setTimeout(function () {
                elem.innerHTML = 'Save &times;';
            }, 600);

            setTimeout(function () {
                elem.innerHTML = 'Save&nbsp;&nbsp;';
                elem.style.paddingLeft = '15px';
                elem.style.background = '#337ab7';
                elem.style.borderColor = '#2e6da4';
            }, 1750);

            utils.showMessage('Not logged in', 'BlocklyProp was unable to save your project.\n\nYou may still be able to download it as a Blockls file.\n\nYou will need to return to the homepage to log back in.');
        });

        // Mark the time when saved, add 20 minutes to it.
        timestampSaveTime(SAVE_PROJECT_TIMER_DELAY, true);

    } else {

        // If user doesn't own the project - prompt for a new project name and route through
        // an endpoint that will make the project private.
        saveAsDialog();
    }
}


// TODO: Is this function relevant in Solo?
/**
 * Save project as a different board type
 */
function saveAsDialog() {
    // Production still uses the uses the plain 'save-as' endpoint for now.
    if (isExperimental.indexOf('saveas') > -1) {     // if (1 === 1) {

        // Old function - still in use because save-as+board type is not approved for use.
        utils.prompt("Save project as", projectData.name, function (value) {
            if (value) {
                var code = getXml();
                projectData.code = code;
                projectData.name = value;

                $.post(BASE_URL + 'rest/project/code-as', projectData, function (data) {
                    var previousOwner = projectData.yours;
                    projectData = data;
                    projectData.code = code; // Save code in projectdata to be able to verify if code has changed upon leave
                    utils.showMessage(Blockly.Msg.DIALOG_PROJECT_SAVED, Blockly.Msg.DIALOG_PROJECT_SAVED_TEXT);
                    // Reloading project with new id
                    window.location.href = BASE_URL + 'projecteditor?id=' + data['id'];
                });
            }
        });

    } else {

        // Prompt user to save current project first if unsaved
        if (checkLeave() && projectData.yours) {
            utils.confirm(Blockly.Msg.DIALOG_SAVE_TITLE, Blockly.Msg.DIALOG_SAVE_FIRST, function (value) {
                if (value) {
                    downloadCode();
                }
            }, 'Yes', 'No');
        }

        // Reset the save-as modal's fields
        $('#save-as-project-name').val(projectData.name);
        $("#save-as-board-type").empty();
        profile.default.saves_to.forEach(function (bt) {
            $("#save-as-board-type").append($('<option />').val(bt[1]).text(bt[0]));
        });

        // Until the propc editor is ready, hide the save as propc option
        if (isExperimental.indexOf('saveas') > -1) {
            $("#save-as-board-type").append($('<option />').val('propcfile').text('Propeller C (code-only)'));
        }

        // Open modal
        $('#save-as-type-dialog').modal({keyboard: false, backdrop: 'static'});
    }
}


/**
 *
 * @param {string} requester
 */
function checkBoardType(requester) {
    if (requester !== 'offline') {
        let current_type = projectData.board;
        let save_as_type = $('#save-as-board-type').val();

        // save-as-verify-boardtype
        if (current_type === save_as_type || save_as_type === 'propcfile') {
            document.getElementById('save-as-verify-boardtype').style.display = 'none';
        } else {
            document.getElementById('save-as-verify-boardtype').style.display = 'block';
        }
    }
}


/**
 * Save an existing project under a new project ID with the new project owner
 * @param {string} boardType
 * @param {string} projectName
 */
function saveProjectAs(boardType, projectName) {
    let tt = new Date();
    let pd = {
        'board': boardType,
        'code': EMPTY_PROJECT_CODE_HEADER,
        'created': tt,
        'description': "",
        'description-html': "",
        'id': 0,
        'modified': tt,
        'name': projectName,
        'private': true,
        'shared': false,
        'type': "PROPC",
        'user': "offline",
        'yours': true,
        'timestamp': getTimestamp(),
    };

    window.localStorage.setItem(LOCAL_PROJECT_STORE_NAME, JSON.stringify(pd));
    window.location = 'blocklyc.html' + window.getAllURLParameters();
}


/**
 *
 * @param {string} str
 * @returns {number}
 */
function hashCode(str) {
    let hash = 0, i = 0, len = str.length;
    while (i < len) {
        hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
    }
    return (hash + 2147483647) + 1;
}


/**
 * Encode a string to an XML-safe string by replacing unsafe
 * characters with HTML entities
 *
 * @param {string} str
 * @returns {string}
 */
function encodeToValidXml(str) {
    return (str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\t/g, '&#x9;')
            .replace(/\n/g, '&#xA;')
            .replace(/\r/g, '&#xD;')
    );
}


/**
 * Decode a string from an XML-safe string by replacing HTML
 * entities with their standard characters
 *
 * @param {string} str
 * @returns {string}
 */
function decodeFromValidXml(str) {
    return (str
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, '\'')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#x9;/g, '\t')
            .replace(/&#xA;/g, '\n')
            .replace(/&#xD;/g, '\r')
    );
}


/**
 * Save project to persistent storage
 */
function downloadCode() {
    // Create an XML parser and parse the project XML
    let xmlParser = new DOMParser();
    let projectXml = xmlParser.parseFromString(getXml(), "text/xml");

    if (projectData
        && projectData.board !== 'propcfile'
        && projectXml.getElementsByTagName('block').length < 1) {

        // The project is empty, so warn and exit.
        utils.showMessage(
            Blockly.Msg.DIALOG_EMPTY_PROJECT,
            Blockly.Msg.DIALOG_CANNOT_SAVE_EMPTY_PROJECT);
    } else {

        // Create a filename from the project title
        let projectFilename = sanitizeFilename(projectData.name);

        // get the text of just the project inside of the outer XML tag
        let projectXmlCode = projectXml.children[0].innerHTML;

        // get the paths of the blocks themselves and the size/position of the blocks
        let projSVG = document.getElementsByClassName('blocklyBlockCanvas');
        let projSVGcode = projSVG[0].outerHTML.replace(/&nbsp;/g, ' ');
        let projSize = projSVG[0].getBoundingClientRect();
        let projH = parseInt(projSize.height) + parseInt(projSize.top);
        let projW = parseInt(projSize.width) + parseInt(projSize.left);

        // a blocklyprop project SVG file header to lead the text of the file and hold project metadata.
        let SVGheader = generateSvgHeader( projW, projH )

        // a footer to generate a watermark with the project's information at the bottom-right corner of the SVG
        // and hold project metadata.
        let SVGfooter = generateSvgFooter(projectData);

        // Deprecating project checksum. Install a dummy checksum to keep the project loader happy.
        let xmlChecksum = '000000000000';

        // Assemble both the SVG (image) of the blocks and the blocks' XML definition
        let blob = new Blob(
            [SVGheader + projSVGcode + SVGfooter + projectXmlCode + '<ckm>' + xmlChecksum + '</ckm></svg>'],
            {type: 'image/svg+xml'});

        // Persist the svg date to a project file
        saveAs(blob, projectFilename + '.svg');

        // save the project into localStorage with a timestamp - if the page is simply refreshed,
        // this will allow the project to be reloaded.
        // make the projecData object reflect the current workspace and save it into localStorage
        projectData.timestamp = getTimestamp();
        // projectData.code = Project.prototype.EmptyProjectCodeHeader + projectXmlCode + '</xml>';
        projectData.code = EMPTY_PROJECT_CODE_HEADER + projectXmlCode + '</xml>';
        window.localStorage.setItem(LOCAL_PROJECT_STORE_NAME, JSON.stringify(projectData));

        // Mark the time when saved, add 20 minutes to it.
        timestampSaveTime(SAVE_PROJECT_TIMER_DELAY, true);
    }
}


/**
 * Generate a blocklyprop project SVG file header to lead the text of the file
 * and hold project metadata.
 *
 * @param {number} width SVG image width
 * @param {number} height SVG image height
 * @returns {string}
 */
function generateSvgHeader( width, height ) {

    let projH = (height + 100).toString();
    let projW = (width + 236).toString();

    // a header with the necessary svg XML header and style information to make the blocks render correctly
    // TODO: make SVG valid.
    let SVGheader = '';
    SVGheader += '<svg blocklyprop="blocklypropproject" xmlns="http://www.w3.org/2000/svg" ';
    SVGheader += 'xmlns:html="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink" ';
    SVGheader += 'version="1.1" class="blocklySvg"><style>.blocklySvg { background-color: #fff; ';
    SVGheader += 'overflow: auto; width:' + projW + 'px; height:' + projH + 'px;} .blocklyWidgetDiv {display: none; position: absolute; ';
    SVGheader += 'z-index: 999;} .blocklyPathLight { fill: none; stroke-linecap: round; ';
    SVGheader += 'stroke-width: 2;} .blocklyDisabled>.blocklyPath { fill-opacity: .5; ';
    SVGheader += 'stroke-opacity: .5;} .blocklyDisabled>.blocklyPathLight, .blocklyDisabled>';
    SVGheader += '.blocklyPathDark {display: none;} .blocklyText {cursor: default; fill: ';
    SVGheader += '#fff; font-family: sans-serif; font-size: 11pt;} .blocklyNonEditableText>text { ';
    SVGheader += 'pointer-events: none;} .blocklyNonEditableText>rect, .blocklyEditableText>rect ';
    SVGheader += '{fill: #fff; fill-opacity: .6;} .blocklyNonEditableText>text, .blocklyEditableText>';
    SVGheader += 'text {fill: #000;} .blocklyBubbleText {fill: #000;} .blocklySvg text {user';
    SVGheader += '-select: none; -moz-user-select: none; -webkit-user-select: none; cursor: ';
    SVGheader += 'inherit;} .blocklyHidden {display: none;} .blocklyFieldDropdown:not(.blocklyHidden) ';
    SVGheader += '{display: block;} .bkginfo {cursor: default; fill: rgba(0, 0, 0, 0.3); font-family: ';
    SVGheader += 'sans-serif; font-size: 10pt;}</style>';

    return SVGheader;
}

/**
 * Generate a watermark with the project's information at the bottom-right corner of the SVG
 * and hold project metadata.
 *
 * @param {{}} project Project details object
 * @returns {string}
 */
function generateSvgFooter( project ) {

    let svgFooter = '';
    let dt = new Date();

    svgFooter += '<rect x="100%" y="100%" rx="7" ry="7" width="218" height="84" style="fill:rgba(255,255,255,0.4);" transform="translate(-232,-100)" />';
    svgFooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-83)" style="font-weight:bold;">Parallax BlocklyProp Project</text>';

    svgFooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-68)">' +
        'User: ' + encodeToValidXml(project.user) + '</text>';

    svgFooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-53)">' +
        'Title: ' + encodeToValidXml(project.name) + '</text>';

    svgFooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-38)">' +
        'Project ID: 0</text>';

    svgFooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-23)">' +
        'Device: ' + project.board + '</text>';

    svgFooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-8)">' +
        'Description: ' + encodeToValidXml(project.description) + '</text>';

    svgFooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,13)" data-createdon="' +
        project.created + '" data-lastmodified="' + dt + '"></text>';

    return svgFooter;
}

/**
 * Import project file from disk
 */
function uploadCode() {
    if (checkLeave()) {
        utils.showMessage(
            Blockly.Msg.DIALOG_UNSAVED_PROJECT,
            Blockly.Msg.DIALOG_SAVE_BEFORE_ADD_BLOCKS);
    } else {
        $('#upload-dialog').modal({keyboard: false, backdrop: 'static'});
    }
}


/**
 *  Retrieve an SVG project file from storage.
 *
 *  This is the .selectfile.onChange() event handler.
 *  This function loads an .svg file, parses it for reasonable values
 *  and then stores the verified resulting project into the uploadXML
 *  string.
 *
 * @param files []
 */
function uploadHandler(files) {
    var UploadReader = new FileReader();

    // Event handler that fires when the file that the user selected is loaded
    // from local storage
    UploadReader.onload = function () {
        // Save the file contents in xmlString
        let xmlString = this.result;
        const xmlValid = true;
        let uploadBoardType = '';

        // TODO: Solo #261
        // Loop through blocks to verify blocks are supported for the project board type
        // validateProjectBlockList(this.result);

        // Flag to indicate that we are importing a file that
        // was exported from the blockly.parallax.com site
        let isSvgeFile = false;

        // We need to support our rouge .svge type
        if (files[0].type === "") {
            let name = files[0].name;
            if (name.slice(name.length - 4) === "svge") {
                isSvgeFile = true;
            }
        }

        //validate file, screen for potentially malicious code.
        if ((files[0].type === 'image/svg+xml' || isSvgeFile)
            && xmlString.indexOf("<svg blocklyprop=\"blocklypropproject\"") === 0
            && xmlString.indexOf("<!ENTITY") === -1
            && xmlString.indexOf("CDATA") === -1
            && xmlString.indexOf("<!--") === -1) {

            // TODO: instead of parsing by text indexOf's, use XML properly.
            let findBPCstart = '<block';

            if (xmlString.indexOf("<variables") > -1) {
                findBPCstart = '<variables';
            }

            uploadedXML = xmlString.substring(xmlString.indexOf(findBPCstart), (xmlString.length - 29));
            uploadBoardType = getProjectBoardType(xmlString);

            if (xmlValid) {
                if (projectData && uploadBoardType !== projectData.board) {
                    $('#selectfile-verify-boardtype').css('display', 'block');
                } else {
                    $('#selectfile-verify-boardtype').css('display', 'none');
                }
            }
            if (uploadedXML !== '') {
                uploadedXML = EMPTY_PROJECT_CODE_HEADER + uploadedXML + '</xml>';
            }

            // TODO: check to see if this is used when opened from the editor
            //  (and not the splash screen)
            // maybe projectData.code.length < 43??? i.e. empty project? instead of the URL parameter...

            // Loading a .SVG project file. Create a project object and
            // save it into the browser store.
            let projectTitle = getProjectTitleFromXML(xmlString);
            let projectDesc = getProjectDescriptionFromXML(xmlString);

            let tt = new Date();
            let projectCreated = getProjectCreatedDateFromXML(xmlString, tt);
            let projectModified = getProjectModifiedDateFromXML(xmlString, tt);

            let pd = {
                'board': uploadBoardType,
                'code': uploadedXML,
                'created': projectCreated,
                'description': decodeFromValidXml(projectDesc),
                'description-html': '',
                'id': 0,
                'modified': projectModified,
                'name': files[0].name.substring(0, files[0].name.lastIndexOf('.')),
                'private': true,
                'shared': false,
                'type': "PROPC",
                'user': "offline",
                'yours': true,
                'timestamp': getTimestamp(),
            };

            // Compute a parallel dataset to replace 'pd'
            try {
                // Convert the string board type name to a ProjectBoardType object

                let tmpBoardType = Project.convertBoardType(uploadBoardType);
                if (tmpBoardType === undefined) {
                    console.log("Unknown board type: %s", uploadBoardType);
                }

                let project = new Project(
                    decodeFromValidXml(projectTitle),
                    decodeFromValidXml(projectDesc),
                    tmpBoardType,
                    ProjectTypes.PROPC,
                    uploadedXML,
                    projectCreated,
                    projectModified,
                    getTimestamp());

                // Convert the Project object details to projectData object
                let projectOutput = project.getDetails();
                if (projectOutput === undefined) {
                    console.log("Unable to convert Project to projectData object.");
                }

                if (! Project.testProjectEquality(pd, projectOutput)) {
                    console.log("Project output differs.");
                }
            }
            catch (e) {
                console.log("Error while creating project object. %s", e.message);
            }

            // Save the output in a temp storage space
            // TODO: Test this result with the value 'pd'
            // window.localStorage.setItem(
            //     "tempProject",
            //     JSON.stringify(projectOutput));

            // Save the project to the browser store
            window.localStorage.setItem(TEMP_PROJECT_STORE_NAME, JSON.stringify(pd));
        }

        if (xmlValid === true) {
            $('#selectfile-verify-valid').css('display', 'block');
            document.getElementById("selectfile-replace").disabled = false;
            document.getElementById("selectfile-append").disabled = false;
            uploadedXML = xmlString;
        } else {
            $('#selectfile-verify-notvalid').css('display', 'block');
            document.getElementById("selectfile-replace").disabled = true;
            document.getElementById("selectfile-append").disabled = true;
            uploadedXML = '';
        }
    };

    // Load the SVG project file.
    UploadReader.readAsText(files[0]);
}


/**
 * Parse the xml string to locate and return the project board type
 *
 * @param {string} xmlString
 * @return {string}
 */
function getProjectBoardType(xmlString) {
    let boardIndex = xmlString.indexOf('transform="translate(-225,-23)">Device: ');

    return xmlString.substring(
        (boardIndex + 40),
        xmlString.indexOf('</text>', (boardIndex + 41)));
}


/**
 * Parse the xml string to locate and return the project title
 *
 * @param {string} xmlString
 * @return {string}
 */
function getProjectTitleFromXML(xmlString) {
    const titleIndex = xmlString.indexOf('transform="translate(-225,-53)">Title: ');

    if (titleIndex > -1) {
        return xmlString.substring(
            (titleIndex + 39),
            xmlString.indexOf('</text>', (titleIndex + 39)));
    }
    else {
        return "New Project";
    }
}


/**
 * Parse the xml string to locate and return the text of the project description
 *
 * @param {string} xmlString
 * @return {string}
 */
function getProjectDescriptionFromXML(xmlString) {
    const titleIndex = xmlString.indexOf('transform="translate(-225,-8)">Description: ');

    if (titleIndex > -1) {
        return xmlString.substring(
            (titleIndex + 44),
            xmlString.indexOf('</text>', (titleIndex + 44)));
    }

    return "";
}


/**
 * Parse the xml string to locate and return the project created timestamp
 *
 * @param {string} xmlString
 * @param {Date} defaultTimestamp
 * @return {string|*}
 */
function getProjectCreatedDateFromXML(xmlString, defaultTimestamp) {
    const titleIndex = xmlString.indexOf('data-createdon="');

    if (titleIndex > -1) {
        return xmlString.substring(
            (titleIndex + 16),
            xmlString.indexOf('"', (titleIndex + 17)));
    }

    return defaultTimestamp;
}


/**
 * Parse the xml string to locate and return the project last modified timestamp
 *
 * @param {string} xmlString
 * @param {Date} defaultTimestamp
 * @return {string|*}
 */
function getProjectModifiedDateFromXML(xmlString, defaultTimestamp) {
    const titleIndex = xmlString.indexOf('data-lastmodified="');

    if (titleIndex > -1) {
        return xmlString.substring(
            (titleIndex + 19),
            xmlString.indexOf('"', (titleIndex + 20)));
    } else {
        return defaultTimestamp;
    }
}


/**
 *
 * @param redirect boolean flag to permit page redirection
 */
function clearUploadInfo(redirect) {
    // Reset all of the upload fields and containers
    uploadedXML = '';

    $('#selectfile').val('');
    $('#selectfile-verify-notvalid').css('display', 'none');
    $('#selectfile-verify-valid').css('display', 'none');
    $('#selectfile-verify-boardtype').css('display', 'none');

    document.getElementById("selectfile-replace").disabled = true;
    document.getElementById("selectfile-append").disabled = true;

    // when opening a file but the user cancels, return to the splash screen
    if (redirect === true) {
        if (window.getURLParameter('openFile') === 'true') {
            window.location = 'index.html' + window.getAllURLParameters();
        }
    }
}


/**
 * Open and load an svg project file
 *
 * @param append is true if the project being loaded will be appended
 * to the existing project
 *
 * @description
 * This is called when the 'Open' button on the Open Project dialog
 * box is selected. At this point, the projectData global object
 * has been populated. In the offline mode, the function copies the
 * project to the browser's localStorage and then redirects the
 * browser back to the same page, but without the 'opeFile..' query
 * string.
 *
 * For offline mode, the project may not have been loaded yet.
 */
function uploadMergeCode(append) {

    // Hide the Open Project modal dialog
    $('#upload-dialog').modal('hide');

    // When opening a file when directed from the splash screen in
    // the offline app, load the selected project
    if (!append && window.getURLParameter('openFile') === 'true') {
        // The project was loaded into the localStorage. The global
        // variable tempProjectStoreName holds the name of the object
        // in the localStorage. At this point, load the projectData
        // into the uploadXML global and then let the code below take
        // and load the project.
        //
        // The global xmlString is initialized by the project loader
        // code in uploadHandler()
        //
        // Set a timestamp to note when the project was saved into localStorage

        //projectData = JSON.parse(window.localStorage.getItem(tempProjectStoreName));

        // Store the temp project into the localProject and redirect
        window.localStorage.setItem(
            LOCAL_PROJECT_STORE_NAME,
            window.localStorage.getItem(TEMP_PROJECT_STORE_NAME));

        window.localStorage.removeItem(TEMP_PROJECT_STORE_NAME);

        window.location = 'blocklyc.html' + window.getAllURLParameters();
    }

    if (uploadedXML !== '') {
        var projCode = '';
        if (append) {
            projCode = getXml();
            projCode = projCode.substring(42, projCode.length);
            projCode = projCode.substring(0, (projCode.length - 6));
        }

        var newCode = uploadedXML;
        if (newCode.indexOf('<variables>') === -1) {
            newCode = newCode.substring(uploadedXML.indexOf('<block'), newCode.length);
        } else {
            newCode = newCode.substring(uploadedXML.indexOf('<variables'), newCode.length);
        }
        newCode = newCode.substring(0, (newCode.length - 6));

        // check for newer blockly XML code (contains a list of variables)
        if (newCode.indexOf('<variables') > -1 && projCode.indexOf('<variables') > -1) {
            var findVarRegExp = /type="(\w*)" id="(.{20})">(\w+)</g;
            var newBPCvars = [];
            var oldBPCvars = [];

            var varCodeTemp = newCode.split('</variables>');
            newCode = varCodeTemp[1];
            // use a regex to match the id, name, and type of the varaibles in both the old and new code.
            var tmpv = varCodeTemp[0].split('<variables')[1].replace(findVarRegExp, function (p, m1, m2, m3) {  // type, id, name
                newBPCvars.push([m3, m2, m1]);  // name, id, type
                return p;
            });
            varCodeTemp = projCode.split('</variables>');
            projCode = varCodeTemp[1];
            tmpv = varCodeTemp[0].replace(findVarRegExp, function (p, m1, m2, m3) {  // type, id, name
                oldBPCvars.push([m3, m2, m1]);  // name, id, type
                return p;
            });
            // record how many variables are in the original and new code
            tmpv = [oldBPCvars.length, newBPCvars.length];
            // iterate through the captured variables to detemine if any overlap
            for (var j = 0; j < tmpv[0]; j++) {
                for (var k = 0; k < tmpv[1]; k++) {
                    // see if var is a match
                    if (newBPCvars[k][0] === oldBPCvars[j][0]) {
                        // replace old variable IDs with new ones
                        var tmpr = newCode.split(newBPCvars[k][1]);
                        newCode = tmpr.join(oldBPCvars[j][1]);
                        // null the ID to mark that it's a duplicate and
                        // should not be included in the combined list
                        newBPCvars[k][1] = null;
                    }
                }
            }
            for (k = 0; k < tmpv[1]; k++) {
                if (newBPCvars[k][1]) {
                    // Add var from uploaded xml to the project code
                    oldBPCvars.push(newBPCvars[k]);
                }
            }

            // rebuild vars from both new/old
            tmpv = '<variables>';
            oldBPCvars.forEach(function (vi, j) {
                tmpv += '<variable id="' + vi[1] + '" type="' + vi[2] + '">' + vi[0] + '</variable>';
            });
            tmpv += '</variables>';
            // add everything back together
            projectData.code = EMPTY_PROJECT_CODE_HEADER + tmpv + projCode + newCode + '</xml>';
        } else if (newCode.indexOf('<variables') > -1 && projCode.indexOf('<variables') === -1) {
            projectData.code = EMPTY_PROJECT_CODE_HEADER + newCode + projCode + '</xml>';
        } else {
            projectData.code = EMPTY_PROJECT_CODE_HEADER + projCode + newCode + '</xml>';
        }

        ClearBlocklyWorkspace();

        // This call fails because there is no Blockly workspace context
        loadToolbox(projectData.code);

        // CAUTION: This call can redirect to the home page
        clearUploadInfo(false);
    }
}


/**
 * Initialize the Blockly toolbox with a collection of blocks that are
 * appropriate for the passe in board type.
 *
 * @param {string} profileName - aka Board Type
 */
function initToolbox(profileName) {

    // TODO: Verify that custom fonts are required
    if (Blockly.Css.CONTENT) {
        let ff = window.getURLParameter('font');

        if (ff) {
            // Replace font family in Blockly's inline CSS
            for (var f = 0; f < Blockly.Css.CONTENT.length; f++) {
                Blockly.Css.CONTENT[f] = Blockly.Css.CONTENT[f].replace(/Arial, /g, '').replace(/sans-serif;/g, "'" + ff + "', sans-serif;");
            }

            $('html, body').css('font-family', "'" + ff + "', sans-serif");
            $('.blocklyWidgetDiv .goog-menuitem-content').css('font', "'normal 14px '" + ff + "', sans-serif !important'"); //    font: normal 14px Arimo, sans-serif !important;
        } else {
            for (var f = 0; f < Blockly.Css.CONTENT.length; f++) {
                Blockly.Css.CONTENT[f] = Blockly.Css.CONTENT[f].replace(/Arial, /g, '').replace(/sans-serif;/g, "Arimo, sans-serif;");
            }
        }
    }

    // Options are described in detail here:
    // https://developers.google.com/blockly/guides/get-started/web#configuration
    const blocklyOptions = {
        toolbox: filterToolbox(profileName),
        trashcan: true,
        media: CDN_URL + 'images/blockly/',
        readOnly: (profileName === 'propcfile'),
        //path: CDN_URL + 'blockly/',
        comments: false,

        // zoom defaults used here
        zoom: {
            controls: true,
            wheel: false,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        },
        grid: {
            spacing: 20,
            length: 5,
            colour: '#fbfbfb',
            snap: false
        }
    };

    Blockly.inject('content_blocks', blocklyOptions);

    init(Blockly);

    // TODO: find a better way to handle this.
    // https://groups.google.com/forum/#!topic/blockly/SgJoEEXuzsg
    Blockly.mainWorkspace.createVariable(Blockly.LANG_VARIABLES_GET_ITEM);
}


/**
 * Load the workspace
 * @param xmlText
 */
function loadToolbox(xmlText) {
    if (Blockly.mainWorkspace) {
        let xmlDom = Blockly.Xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace);
    }
}


/**
 * Convert the current project workspace into an XML document
 *
 * @returns {string}
 */
function getXml() {
    if (projectData && projectData.board === 'propcfile') {
        return propcAsBlocksXml();
    }

    if (Blockly.Xml && Blockly.mainWorkspace) {
        const xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        return Blockly.Xml.domToText(xml);
    }

    if (projectData && projectData.code) {
        return projectData.code;
    }

    // Return the XML for a blank project if none is found.
    return EMPTY_PROJECT_CODE_HEADER + '</xml>';
}


/**
 *
 * @param o
 */
function showOS(o) {
    const body = $("body");
    body.removeClass('Windows')
        .removeClass('MacOS')
        .removeClass('Linux')
        .removeClass('ChromeOS');
    body.addClass(o);
}


/**
 * Clear the main workspace in the Blockly object
 */
function ClearBlocklyWorkspace() {
    let workspace = Blockly.getMainWorkspace();

    if (workspace) {
        // Clear the undo/redo stacks in the workspace
        workspace.clearUndo();

        // Dispose of all blocks and comments in workspace.
        workspace.clear();
    }
}


/**
 * Sanitize a string into an OS-safe filename
 *
 * @param input string representing a potential filename
 * @returns {string}
 */
function sanitizeFilename(input) {
    // if the input is not a string, or is an empty string, return a generic filename
    if (typeof input !== 'string' || input.length < 1) {
        return 'my_project';
    }

    // replace OS-illegal characters or phrases
    input = input.replace(/[\/\?<>\\:\*\|"]/g, '_')
    // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1f\x80-\x9f]/g, '_')
        .replace(/^\.+$/, '_')
        .replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, '_')
        .replace(/[\. ]+$/, '_');

    //if the filename is too long, truncate it
    if (input.length > 31) {
        return input.substring(0, 30);
    }

    return input;
}




/**
 * Placeholder function
 *
 * @returns {boolean}
 *
 * @description
 * This is a call is designed to allow someone who is using the
 * experimental code-only mode to set up graphing and terminal
 * baud rate
 */
function configureTermGraph() {
    return true;
}


/**
 * Render the branding logo and related text.
 */
function RenderPageBrandingElements() {
    let appName = ApplicationName;
    let html = 'BlocklyProp<br><strong>' + ApplicationName + '</strong>';

    if (window.location.hostname === productBannerHostTrigger) {
        appName = TestApplicationName;
        html = 'BlocklyProp<br><strong>' + TestApplicationName + '</strong>';
        document.getElementById('nav-logo').style.backgroundImage = 'url(\'src/images/dev-toolkit.png\')';
    }

    $('#nav-logo').html(html);
    $('#app-banner-title').html('BlocklyProp ' + appName);
}


/**
 * Validates the blocks in the project
 *
 * @param fileContent string
 * @return array of block names
 */
function validateProjectBlockList(fileContent) {
    // Loop through blocks to verify blocks are supported for the project board type
    const parser = new DOMParser();
    let xmlDoc = parser.parseFromString(fileContent,"image/svg+xml");
    let blockNodes = xmlDoc.getElementsByTagName("block");

    if (blockNodes.length > 0) {
        let blockList = enumerateProjectBlockNames(blockNodes);
        for (const property in blockList) {
            if (! evaluateProjectBlockBoardType(blockList[property])) {
                console.log("Block '" + blockList[property] + "' is incompatible with this project.");
            }
        }
    }
}


/**
 *
 * @param nodes
 * @return {[]}
 */
function enumerateProjectBlockNames(nodes) {
    let blockList = [];

    // blockNodes contains a list of block element objects and a list of block name objects.
    // The block element objects are enumerated as an array, starting at 0. This loops through
    // the block element objects to obtain the individual block names.
    for (const property in nodes) {
        if (! isNaN(parseInt(property, 10))) {
            blockList.push(nodes[property].getAttribute("type"));
            console.log(`${property}: ${nodes[property].getAttribute("type")}`);
        }
    }

    return blockList;
}

/**
 *
 * @param blockName
 * @return {boolean}
 */
function evaluateProjectBlockBoardType(blockName) {
    if (blockName === "comments") {
        return false;
    }
    return true;
}
