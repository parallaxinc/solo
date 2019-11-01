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
 *  The relative path for the hosting web site. The default is '/'.
 *
 *  @description
 *  This requires that the hosting page define the <meta> tag that
 *  contains this setting
 *
 *      <meta name="base" content="">
 *
 * @type {*|jQuery}
 */
const BASE_URL = $('meta[name=base]').attr("content");


/*
* TODO: This is used in the  blocklypropclient.js file, but that file is loaded
*  first, so when JS is condensed, make sure this global is declared at the top
*  of the file
*/

/**
 *  The root URL string that points to the base of the static web page content
 *
 *  @description
 *  The hosting web page must contain a <meta> tag that sets this attribute
 *
 *      <meta name="cdn" content="src/">
 *
 * @type {*|jQuery}
 */
const CDN_URL = $('meta[name=cdn]').attr("content");



// TODO: Enumerate the OS version
// window.navigator.oscpu


/**
 * Constant string that represents the base, empty project header
 *
 * @type {string}
 *
 * @description Converting the string to a constant because it is referenced
 * in a number of places. The string is sufficiently complex that it could
 * be misspelled without detection.
 */
const EMPTY_PROJECT_CODE_HEADER = '<xml xmlns="http://www.w3.org/1999/xhtml">';


/**
 * Constant number that represents the maximum length of a project name
 *
 * @type {number}
 */
const PROJECT_NAME_MAX_LENGTH = 100;


/**
 * Constant number that represents the maximum number of 
 * characters of the project name that are displayed in the UI
 *
 * @type {number}
 */
const PROJECT_NAME_DISPLAY_MAX_LENGTH = 24;


 /**
 *
 * @type {number}
 */
var last_saved_timestamp = 0;


/**
 * Timestamp to record when the current project was last saved to
 * storage
 *
 * @type {number}
 */
var last_saved_time = 0;


/**
 * The primary key for the project (online version)
 *
 * @type {number}
 * @deprecated
 *  Solo does not have a concept of unique project identifiers.
 */
var idProject = 0;


/**
 * Uploaded project XML code
 *
 * @type {string}
 */
var uploadedXML = '';


/**  WIP/TODO: generate svg icons and inject them.  This keeps the HTML simple and clean.
 *
 * @type {object}
 */
var bpIcons = {
    warningCircle: '<svg width="15" height="15"><path d="M7,8 L8,8 8,11 8,11 7,11 Z" style="stroke-width:1px;stroke:#8a6d3b;fill:none;"/><circle cx="7.5" cy="7.5" r="6" style="stroke-width:1.3px;stroke:#8a6d3b;fill:none;"/><circle cx="7.5" cy="5" r="1.25" style="stroke-width:0;fill:#8a6d3b;"/></svg>',
    dangerTriangleBlack: '<svg width="15" height="15"><path d="M1,12 L2,13 13,13 14,12 8,2 7,2 1,12 Z M7.25,6 L7.75,6 7.5,9 Z" style="stroke-width:1.5px;stroke:#000;fill:none;"/><circle cx="7.5" cy="10.75" r="1" style="stroke-width:0;fill:#000;"/><circle cx="7.5" cy="5.5" r="1" style="stroke-width:0;fill:#000;"/></svg>',
    dangerTriangle: '<svg width="15" height="15"><path d="M1,12 L2,13 13,13 14,12 8,2 7,2 1,12 Z M7.25,6 L7.75,6 7.5,9 Z" style="stroke-width:1.5px;stroke:#a94442;fill:none;"/><circle cx="7.5" cy="10.75" r="1" style="stroke-width:0;fill:#a94442;"/><circle cx="7.5" cy="5.5" r="1" style="stroke-width:0;fill:#a94442;"/></svg>',
    checkMarkWhite: '<svg width="14" height="15"><path d="M2.25,6 L5.5,9.25 12,2.5 13.5,4 5.5,12 1,7.5 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>',
    checkMarkGreen: '<svg width="14" height="15"><path d="M2.25,6 L5.5,9.25 12,2.5 13.5,4 5.5,12 1,7.5 Z" style="stroke:#3c763d;stroke-width:1;fill:#3c763d;"/></svg>',
    downArrowWhite: '<svg width="14" height="15"><path d="M5.5,0 L8.5,0 8.5,9 12.5,9 7,14.5 1.5,9 5.5,9 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>',
    downArrowBoxWhite: '<svg width="14" height="15"><path d="M5.5,0 L8.5,0 8.5,6 12.5,6 7,11.5 1.5,6 5.5,6 Z M0.5,12 L13.5,12 13.5,14.5 0.5,14.5 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>',
    terminalWhite: '<svg width="14" height="15"><path d="M3,4.5 L10,4.5 M3,6.5 L6,6.5 M3,8.5 L8,8.5 M1,1 L13,1 13,14 1,14 1,1 M2,0 L12,0 M14,2 L14,13 M12,15 L2,15 M0,2 L0,13" style="stroke:#fff;stroke-width:1;fill:none;"/></svg>',
    graphWhite: '<svg width="13" height="14"><path d="M.5,0 L.5,13.5 L12.5,13.5 M3.5,0 L3.5,13.5 M6.5,0 L6.5,13.5 M9.5,0 L9.5,13.5 M12.5,0 L12.5,13.5 M.5,3.5 L12.5,3.5 M.5,7 L12.5,7 M.5,10.5 L12.5,10.5 M.5,.5 L12.5,.5" style="stroke:rgba(255,255,255,.6);stroke-width:1;fill:none;"/><path d="M0,13 L6,5 L9,8 L14,2" style="stroke:#fff;stroke-width:2;fill:none;"/></svg>',
    searchWhite: '<svg width="14" height="15"><path d="M1.5,13.25 L4.5,8.75" style="stroke:#fff;stroke-width:2px;fill:none;"/><circle cx="7" cy="5" r="3.5" style="stroke:#fff;stroke-width:1.5px;fill:none;"></circle></svg>',
    magicWandWhite: '<svg width="14" height="15"><path d="M1,10 L5,10 5,11 1,11 Z M2,12 L6,12 6,13 2,13 Z M1,14 5,14 5,15 1,15 Z M0.5,2.75 L2.5,0.6 5.5,3.5 3.5,5.5 Z M5,7 L7,4.75 14,12 12,14 Z M0,7 Q1.5,6.5 2,5 Q2.5,6.5 4,7 Q2.5,7.5 2,9 Q1.5,7.5 0,7 Z M7,3 Q9.5,2.5 10,0 Q10.5,2.5 13,3 Q10.5,3.5 10,6 Q9.5,3.5 7,3 Z" style="stroke-width:0;fill:#fff;"/></svg>',
    undoWhite: '<svg width="15" height="15"><path d="M3.5,6.5 L2.25,4.5 0.75,10.25 6,10.5 5,8.5 Q8.5,5.5 12,7 Q8,3.5 3.5,6.5 Z M11,11 L14.5,11 Q12.5,6 7,8.25 Q11,8 11,11 Z" style="stroke-width:0;fill:#fff;"/></svg>',
    redoWhite: '<svg width="15" height="15"><path d="M11.5,6.5 L12.75,4.5 14.25,10.25 9,10.5 10,8.5 Q6.5,5.5 3,7 Q7,3.5 11.5,6.5 Z M4,11 L0.5,11 Q2.5,6 8,8.25 Q4,8 4,11 Z" style="stroke-width:0;fill:#fff;"/></svg>',
    eyeBlack: '<svg width="14" height="15" style="vertical-align: middle;"><path d="M0.5,7 C4,1.5 10,1.5 13.5,7 C10,12.5 4,12.5 0.5,7 M0.5,7 C4,3.5 10,3.5 13.5,7" style="stroke:#000;stroke-width:1.5;fill:none;"/><circle cx="7" cy="6.5" r="2.75" style="stroke:#000;stroke-width:1.5;fill:none;"></circle><circle cx="7" cy="6.5" r=".5" style="stroke:#000;stroke-width:1.5;fill:#000;"></circle></svg>',
    eyeWhite: '<svg width="14" height="15" style="vertical-align: middle;"><path d="M0.5,7 C4,1.5 10,1.5 13.5,7 C10,12.5 4,12.5 0.5,7 M0.5,7 C4,3.5 10,3.5 13.5,7" style="stroke:#fff;stroke-width:1.5;fill:none;"/><circle cx="7" cy="6.5" r="2.75" style="stroke:#fff;stroke-width:1.5;fill:none;"></circle><circle cx="7" cy="6.5" r=".5" style="stroke:#fff;stroke-width:1.5;fill:#fff;"></circle></svg>',
    playWhite: '<svg width="14" height="15"><path d="M4,3 L4,11 10,7 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>',
    pauseWhite: '<svg width="14" height="15"><path d="M5.5,2 L4,2 4,11 5.5,11 Z M8.5,2 L10,2 10,11 8.5,11 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>',
    fileWhite: '<svg width="14" height="15"><path d="M2,.5 L2,13.5 12,13.5 12,7.5 5.5,7.5 5.5,.5 Z M 8,1.5 L8,5 11,5 Z" style="stroke:#fff;stroke-width:1;fill:#fff;" fill-rule="evenodd"/></svg>',
    eraserWhite: '<svg width="15" height="15"><path d="M2,12 A1.5,1.5 0 0 1 2,10 L10,2 14.5,6.5 7,14 M10,11 L5.5,6.5 M15,14 L4,14 2,12 M15,13.2 5,13.2" style="stroke:#fff;stroke-width:1;fill:none;"/><path d="M2,12 A1.5,1.5 0 0 1 2,10 L5.5,6.5 10,11 7,14 4,14 Z" style="stroke-width:0;fill:#fff;"/></svg>',
    cameraWhite: '<svg width="14" height="15"><path d="M1.5,13.5 L.5,12.5 .5,5.5 1.5,4.5 2.5,4.5 4,3 7,3 8.5,4.5 12.5,4.5 13.5,5.5 13.5,12.5 12.5,13.5 Z M 2,9 A 4,4,0,0,0,10,9 A 4,4,0,0,0,2,9 Z M 4.5,9 A 1.5,1.5,0,0,0,7.5,9 A 1.5,1.5,0,0,0,4.5,9 Z M 10.5,6.5 A 1,1,0,0,0,13.5,6.5 A 1,1,0,0,0,10.5,6.5 Z" style="stroke:#fff;stroke-width:1;fill:#fff;" fill-rule="evenodd"/></svg>',
}


/**
 * The name used to store a project that is being loaded from
 * offline storage.
 *
 * temp... is used to persist the imported SVG file. This file is a
 * candidate until the user selects the 'Open' button to confirm that
 * this file is the one to be loaded into the app.
 *
 * local... is used as the project that will either replace the
 * current project or be appended to the current project.
 *
 * @type {string}
 */
const TEMP_PROJECT_STORE_NAME = "tempProject";
const LOCAL_PROJECT_STORE_NAME = 'localProject';


/**
 * This is the object returned from the call to Blockly.inject()
 */
var blocklyWorkSpace;


/**
 * The default number of minutes to wait until the user is prompted
 * to save the altered project.
 *
 * @type {number}
 */
const SAVE_PROJECT_TIMER_DELAY = 20;


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
 * _messages.js file, page_text_label['editor_save-check_warning'].
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
    /* -- Set up amy event handlers once the DOM is ready -- */

    // Update the blockly workspace to ensure that it takes
    // the remainder of the window. This is an async call.
    $(window).on('resize', function () {
        resetToolBoxSizing()
    });

    // Event handler for the OnBeforeUnload event
    // --------------------------------------------------------------
    // This event fires just before the document begins to unload.
    // The unload can be stopped by returning a string message. The
    // browser will then open a modal dialog the presents the
    // message and options for Cancel and Leave. If the Cancel option
    // is selected the unload event is cancelled and page processing
    // continues.
    // --------------------------------------------------------------
    window.addEventListener('beforeunload', function (e) {

        // Call checkLeave only if we are NOT loading a new project
        if (getURLParameter('openFile') === "true") {
            return;
        }

        // Store the current project into the localStore so that
        // if the page is being refreshed, it will automatically
        // be reloaded
        // ------------------------------------------------------
        if (projectData) {
            if (projectData['name'] !== "undefined") {
                let tempProject = {};
                Object.assign(tempProject, projectData);

                tempProject.code = getXml();
                tempProject.timestamp = getTimestamp();

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

    idProject = getURLParameter('project');

    // TODO: Use the ping endpoint to verify that we are offline.

    // Stop pinging the Rest API
    clearInterval(pingInterval);

    // hide save interaction elements
    $('.online-only').addClass('hidden');
    $('.offline-only').removeClass('hidden');

    // Load a project file from local storage
    if (getURLParameter('openFile') === "true") {
        // Check for an existing project in localStorage
        if (window.localStorage.getItem(LOCAL_PROJECT_STORE_NAME)) {
            // put a copy into projectData
            projectData = JSON.parse(window.localStorage.getItem(LOCAL_PROJECT_STORE_NAME));
        }
        OpenProjectModal();
    } else if (getURLParameter('newProject') === "true") {
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
            setupWorkspace(localProject,
                function () {
                    window.localStorage.removeItem(LOCAL_PROJECT_STORE_NAME);
                });
        } catch (objError) {
            if (objError instanceof SyntaxError) {
                console.error(objError.name);
                alert(objError.message);
            } else {
                console.error(objError.message);
                alert("Unable to load the project.");
            }
            // No viable project available, so redirect to index page.
            window.location.href = 'index.html';
        }
    } else {
        // No viable project available, so redirect to index page.
        window.location.href = 'index.html';
    }

    // Make sure the toolbox appears correctly, just for good measure.
    resetToolBoxSizing(250);
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
    // Return if there is no project data
    if (!projectData || projectData.length === 0) {
        return false;
    }

    let currentXml = getXml();
    let savedXml = projectData['code'];

    return !(savedXml === currentXml);
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
        // is declared in _messages.js
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
    // Locate each element that has a class 'bpIcon' assigned and
    // contains a 'data-icon' attribute. Itereate through each
    // match and draw the custom icons into the specified element
    // --------------------------------------------------------------
    // TODO: not sure why, but the ES6 shorthand function notation
    //      breaks this...
    //      ... because the arrow function does not set the 'this'
    //          value whereas an anonymous function does.
    // --------------------------------------------------------------
    $('.bpIcon[data-icon]').each(function () {
        $(this).html(bpIcons[$(this).attr('data-icon')]);
    });
}

/**
 * Configure all of the event handlers
 */
function initEventHandlers() {
    /*
 * TODO: Move javascript that is inline in the HTML files to included scripts.
 *    This keeps the HTML simple and clean.
 *
 * This is a WIP.
*/
    // Set up event handlers - Attach events to nav/action menus/buttons
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

    // This arrived on 6/6/2019 from CDN PR#129.
    // zfi merged 1 commit into parallaxinc:1.2 from MatzElectronics:1.2on Jun 6
    // TODO: Correct missing configure_term_graph() function.
    $('#term-graph-setup').on('click', () => configure_term_graph());


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
    $('#upload-close').on('click', () => clearUploadInfo(false));


    // **********************************
    // **     Toolbar - right side     **
    // **********************************
    // Project Name listing

    // Make the text in the project-name span editable
    $('.project-name').attr('contenteditable', 'true')  

            // Change the styling to indicate to the user that they are editing this field
            .on('focus', () => {
                $('.project-name').html(projectData.name);
                $('.project-name').addClass('project-name-editable');
            })
            // reset the style and save the new project name to the projectData object 
            .on('blur', () => {
                $('.project-name').removeClass('project-name-editable');
                // if the project name is greater than 25 characters, only display the first 25
                if (projectData.name.length > PROJECT_NAME_DISPLAY_MAX_LENGTH) {
                    $('.project-name').html(projectData.name.substring(0,PROJECT_NAME_DISPLAY_MAX_LENGTH - 1) + '...');
                }
            })
            // validate the input to ensure it's not too long, and save changes as the user types.
            .on('keyup', () => {
                var tempProjectName = $('.project-name').html()
                if (tempProjectName.length > PROJECT_NAME_MAX_LENGTH) {
                    $('.project-name').html(projectData.name);
                } else {
                    projectData.name = tempProjectName;
                }
            });

    // New Project toolbar button
    $('#new-project-button').on('click', () => NewProjectModal());

    // Open Project toolbar button
    $('#open-project-button').on('click', () => {
        // Save the project to localStorage
        window.localStorage.setItem(LOCAL_PROJECT_STORE_NAME, JSON.stringify(projectData));
        window.location = "blocklyc.html?openFile=true";
    });

    // Save Project button goes here!


    // Hamburger menu items
    //    $('#selectfile-replace').on('click',    function () {  uploadMergeCode(false); });
    //    $('#selectfile-append').on('click',     function () {  uploadMergeCode(true); });

    // Edit project details
    $('#edit-project-details').on('click', () => editProjectDetails());

    // New Project - Load a new project menu click handler
    /**
     * @deprecated
     */
    $('#new-project-menu-item').on('click', () => NewProjectModal());

    // Help and Reference - online help web pages
    // Implemented as an href in the menu

    // ---- Hamburger drop down horizontal line ----

    // Download project to Simple IDE
    $('#download-side').on('click', () => downloadPropC());

    /**
     * Download project to disk
     * @deprecated
     */
    $('#download-project').on('click', () => downloadCode());


    /**
     * Import (upload) project from storage
     * @description This is designed to merge code from an existing
     * project into the current project.
     */
    $('#upload-project').on('click', () => uploadCode());

    // ---- Hamburger drop down horizontal line ----

    // Still looking for these buttons in the UI
    $('#client-setup').on('click', () => configure_client());


    // **  End of Drop-down menu
    // **************************************************************


    $('#selectfile-clear').on('click', () => clearUploadInfo(true));
    $('#save-as-btn').on('click', () => saveAsDialog());


    // Save Project modal 'Save' button click handler
    $('#save-btn, #save-project').on('click', () => downloadCode());


    $('#btn-graph-play').on('click', () => graph_play());
    $('#btn-graph-snapshot').on('click', () => downloadGraph());
    $('#btn-graph-csv').on('click', () => downloadCSV());
    $('#btn-graph-clear').on('click', () => graphStartStop('clear'));

    $('#save-as-board-type').on('change', () => checkBoardType($('#saveAsDialogSender').html()));

    $('#save-as-board-btn').on('click', () => saveProjectAs(
        $('#save-as-board-type').val(),
        $('#save-as-project-name').val()
    ));

    $('#win1-btn').on('click', () => showStep('win', 1, 3));
    $('#win2-btn').on('click', () => showStep('win', 2, 3));
    $('#win3-btn').on('click', () => showStep('win', 3, 3));
    $('#chr1-btn').on('click', () => showStep('chr', 1, 3));
    $('#chr2-btn').on('click', () => showStep('chr', 2, 3));
    $('#chr3-btn').on('click', () => showStep('chr', 3, 3));
    $('#mac1-btn').on('click', () => showStep('mac', 1, 4));
    $('#mac2-btn').on('click', () => showStep('mac', 2, 4));
    $('#mac3-btn').on('click', () => showStep('mac', 3, 4));
    $('#mac4-btn').on('click', () => showStep('mac', 4, 4));

    $('.show-os-win').on('click', () => showOS('Windows'));
    $('.show-os-mac').on('click', () => showOS('MacOS'));
    $('.show-os-chr').on('click', () => showOS('ChromeOS'));
    $('.show-os-lnx').on('click', () => showOS('Linux'));

    // Save-As Project
    $('#save-project-as').on('click', () => saveAsDialog());

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

    // MacOS
    $('.client-mac-link').attr('href', $("meta[name=macOSclient]").attr("content"));
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
 * @param resizeDelay milliseconds to delay the resizing, especially
 * if used after a change in the window's location or a during page
 * reload.
 */
function resetToolBoxSizing(resizeDelay) {
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
        }
    }, resizeDelay || 10);  // 10 millisecond delay
}


/**
 * Populate the projectData global
 *
 * @param data is the current project object
 * @param callback is called if provided when the function completes
 */
function setupWorkspace(data, callback) {
    ClearBlocklyWorkspace();

    projectData = data;
    showInfo(data);         // Update the UI with project related details

    // --------------------------------------------------------------
    // Set the global project ID. in the offline mode, the project
    // id is set to 0 when the project is loaded from local storage.
    // --------------------------------------------------------------
    // TODO: Remove this code
    if (!idProject) {
        idProject = projectData['id'];
    }

    // Set various project settings based on the project board type
    // NOTE: This function is in propc.js
    setProfile(projectData['board']);

    // Determine if this is a pure C project
    if (projectData['board'] !== 'propcfile') {
        initToolbox(projectData['board'], []);

        // Reinstate key bindings from block workspace if this is not a code-only project.
        if (Blockly.codeOnlyKeybind === true) {
            // TODO: Need to replace bindEvent_ call with something that is not deprecated.
            Blockly.bindEvent_(document, 'keydown', null, Blockly.onKeyDown_);
            Blockly.codeOnlyKeybind = false;
        }

        // Create UI block content from project details
        renderContent('blocks');

        // Set the help link to the ab-blocks or s3 reference
        // TODO: modify blocklyc.html/jsp and use an id or class selector
        if (projectData.board === 's3') {
            $('#online-help').attr('href', 'https://learn.parallax.com/s3-blocks');
        } else {
            $('#online-help').attr('href', 'https://learn.parallax.com/ab-blocks');
        }
    } else {
        // No, init the blockly interface
        init(Blockly);

        // Remove keybindings from block workspace if this is a code-only project.
        Blockly.unbindEvent_(document, 'keydown', null, Blockly.onKeyDown_);
        Blockly.codeOnlyKeybind = true;

        // Show PropC editing UI elements
        $('.propc-only').removeClass('hidden');

        // Create UI block content from project details
        renderContent('propc');

        // Set the help link to the prop-c reference
        // TODO: modify blocklyc.html/jsp and use an id or class selector
        $('#online-help').attr('href', 'https://learn.parallax.com/support/C/propeller-c-reference');
    }


    // View or edit project details menu item
    if (projectData && projectData['yours'] === false) {
        $('#edit-project-details').html(page_text_label['editor_view-details'])
    } else {
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
 * @param data is the project data structure
 */
function showInfo(data) {
    if (getURLParameter('debug')) {
        console.log(data);
    }

    // Display the project name
    if (projectData.name.length > PROJECT_NAME_DISPLAY_MAX_LENGTH) {
        $('.project-name').html(data['name'].substring(0,PROJECT_NAME_DISPLAY_MAX_LENGTH - 1) + '...');
    } else {
        $(".project-name").html(data['name']);
    }

    // Does the current user own the project?
    if (!data['yours']) {
        // If not, display owner username
        $(".project-owner").text("(" + data['user'] + ")");
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

    // Set the prject icon to the correct board type
    $(".project-icon").html('<img src="' + CDN_URL + projectBoardIcon[ data['board'] ] + '"/>');
};


/**
 *
 */
function saveProject() {
    // TODO: Refactor to remove the concept of project ownership
    if (projectData['yours']) {
        var code = getXml();
        projectData['code'] = code;

        $.post(BASE_URL + 'rest/project/code', projectData, function (data) {
            var previousOwner = projectData['yours'];
            projectData = data;
            projectData['code'] = code; // Save code in projectdata to be able to verify if code has changed upon leave

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
};


/**
 *
 */
function saveAsDialog() {
    // Production still uses the uses the plain 'save-as' endpoint for now.
    if (inDemo !== 'demo') {     // if (1 === 1) {

        // Old function - still in use because save-as+board type is not approved for use.
        utils.prompt("Save project as", projectData['name'], function (value) {
            if (value) {
                var code = getXml();
                projectData['code'] = code;
                projectData['name'] = value;
                $.post(BASE_URL + 'rest/project/code-as', projectData, function (data) {
                    var previousOwner = projectData['yours'];
                    projectData = data;
                    projectData['code'] = code; // Save code in projectdata to be able to verify if code has changed upon leave
                    utils.showMessage(Blockly.Msg.DIALOG_PROJECT_SAVED, Blockly.Msg.DIALOG_PROJECT_SAVED_TEXT);
                    // Reloading project with new id
                    window.location.href = BASE_URL + 'projecteditor?id=' + data['id'];
                });
            }
        });

    } else {

        // Prompt user to save current project first if unsaved
        if (checkLeave() && projectData['yours']) {
            utils.confirm(Blockly.Msg.DIALOG_SAVE_TITLE, Blockly.Msg.DIALOG_SAVE_FIRST, function (value) {
                if (value) {
                    downloadCode();
                }
            }, 'Yes', 'No');
        }

        // Reset the save-as modal's fields
        $('#save-as-project-name').val(projectData['name']);
        $("#save-as-board-type").empty();
        profile.default.saves_to.forEach(function (bt) {
            $("#save-as-board-type").append($('<option />').val(bt[1]).text(bt[0]));
        });

        // Until release to production, make sure we are on demo before displaying the propc option
        if (inDemo === 'demo') {
            $("#save-as-board-type").append($('<option />').val('propcfile').text('Propeller C (code-only)'));
        }

        // Open modal
        $('#save-as-type-dialog').modal({keyboard: false, backdrop: 'static'});
    }
};


/**
 *
 * @param requester
 */
function checkBoardType(requester) {
    if (requester !== 'offline') {
        var current_type = projectData['board'];
        var save_as_type = $('#save-as-board-type').val();
        // save-as-verify-boardtype
        if (current_type === save_as_type || save_as_type === 'propcfile') {
            document.getElementById('save-as-verify-boardtype').style.display = 'none';
        } else {
            document.getElementById('save-as-verify-boardtype').style.display = 'block';
        }
    }
};


/**
 *
 *
 * @param requestor
 */

/**
 * Save an existing project under a new project ID with the new project owner
 * @param boardType
 * @param projectName
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
    window.location = 'blocklyc.html';
}


/**
 *
 * @param str
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
 * @param str
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
 * @param str
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
    let projXMLcode = getXml();

    if (projectData && projectData['board'] !== 'propcfile' && projXMLcode.indexOf('<block') === -1) {
        alert('You can\'t save an empty project!');
        return;
    }

    // Create a filename from the project title
    let project_filename = projectData['name'].replace(/[^a-z0-9]/gi, '_').toLowerCase();

    projXMLcode = projXMLcode.substring(42, projXMLcode.length);
    projXMLcode = projXMLcode.substring(0, (projXMLcode.length - 6));

    utils.prompt(Blockly.Msg.DIALOG_DOWNLOAD, project_filename, function (value) {
        if (value) {
            // get the paths of the blocks themselves and the size/position of the blocks
            var projSVG = document.getElementsByClassName('blocklyBlockCanvas');
            var projSVGcode = projSVG[0].outerHTML.replace(/&nbsp;/g, ' ');
            var projSize = projSVG[0].getBoundingClientRect();
            var projH = (parseInt(projSize.height) + parseInt(projSize.top) + 100).toString();
            var projW = (parseInt(projSize.width) + parseInt(projSize.left) + 236).toString();

            // put all of the pieces together into a downloadable file
            var saveData = (function () {
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                return function (data, fileName) {
                    var blob = new Blob([data], {type: "octet/stream"});
                    var url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                };
            }());

            // a header with the necessary svg XML header and style information to make the blocks render correctly
            // TODO: make SVG valid.
            var SVGheader = '';
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

            // a footer to generate a watermark with the project's information at the bottom-right corner of the SVG
            // and hold project metadata.
            var SVGfooter = '';
            var dt = new Date();
            SVGfooter += '<rect x="100%" y="100%" rx="7" ry="7" width="218" height="84" style="fill:rgba(255,255,255,0.4);" transform="translate(-232,-100)" />';
            SVGfooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-83)" style="font-weight:bold;">Parallax BlocklyProp Project</text>';
            SVGfooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-68)">User: ' + encodeToValidXml(projectData['user']) + '</text>';
            SVGfooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-53)">Title: ' + encodeToValidXml(projectData['name']) + '</text>';
            SVGfooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-38)">Project ID: ' + idProject + '</text>';
            SVGfooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-23)">Device: ' + projectData['board'] + '</text>';
            SVGfooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,-8)">Description: ' + encodeToValidXml(projectData['description']) + '</text>';
            SVGfooter += '<text class="bkginfo" x="100%" y="100%" transform="translate(-225,13)" data-createdon="' + projectData['created'] + '" data-lastmodified="' + dt + '"></text>';

            // Check for any file extentions at the end of the submitted name, and truncate if any
            if (value.indexOf(".") !== -1)
                value = value.substring(0, value.indexOf("."));
            // Check to make sure the filename is not too long
            if (value.length >= 30)
                value = value.substring(0, 29);
            // Replace any illegal characters
            value = value.replace(/[\\/:*?\"<>|]/g, '_');

            var xmlChecksum = hashCode(projXMLcode).toString();

            var xmlChecksum = '000000000000'.substring(xmlChecksum.length, 12) + xmlChecksum;

            // Assemble both the SVG (image) of the blocks and the blocks' XML definition
            saveData(SVGheader + projSVGcode + SVGfooter + projXMLcode + '<ckm>' + xmlChecksum + '</ckm></svg>', value + '.svg');
        }
    });

    // save the project into localStorage with a timestamp - if the page is simply refreshed,
    // this will allow the project to be reloaded.
    // make the projecData object reflect the current workspace and save it into localStorage
    projectData.timestamp = getTimestamp();
    projectData.code = EmptyProjectCodeHeader + projXMLcode + '</xml>';
    window.localStorage.setItem(LOCAL_PROJECT_STORE_NAME, JSON.stringify(projectData));

    // Mark the time when saved, add 20 minutes to it.
    timestampSaveTime(SAVE_PROJECT_TIMER_DELAY, true);
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
 * @param files
 */
function uploadHandler(files) {
    var UploadReader = new FileReader();

    // Event handler that fires when the file that the user selected is loaded
    // from local storage
    UploadReader.onload = function () {
        // Save the file contents in xmlString
        var xmlString = this.result;
        var xmlValid = false;
        var uploadBoardType = '';

        // Flag to indicate that we are importing a file that
        // was exported from the blockly.parallax.com site
        var isSvgeFile = false;

        // We need to support our rouge .svge type
        if (files[0].type === "") {
            var name = files[0].name;
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
            var uploadedChecksum = xmlString.substring((xmlString.length - 24), (xmlString.length - 12));
            var findBPCstart = '<block';

            if (xmlString.indexOf("<variables>") > -1) {
                findBPCstart = '<variables>';
            }
            uploadedXML = xmlString.substring(xmlString.indexOf(findBPCstart), (xmlString.length - 29));

            var computedChecksum = hashCode(uploadedXML).toString();
            computedChecksum = '000000000000'.substring(computedChecksum.length, 12) + computedChecksum;

            var boardIndex = xmlString.indexOf('transform="translate(-225,-23)">Device: ');
            uploadBoardType = xmlString.substring(
                (boardIndex + 40),
                xmlString.indexOf('</text>', (boardIndex + 41)));

            if (computedChecksum === uploadedChecksum) {
                xmlValid = true;
            }
            if (xmlValid) {
                if (projectData && uploadBoardType !== projectData['board']) {
                    $('#selectfile-verify-boardtype').css('display', 'block');
                } else {
                    $('#selectfile-verify-boardtype').css('display', 'none');
                }
            }
            if (uploadedXML !== '') {
                uploadedXML = EMPTY_PROJECT_CODE_HEADER + uploadedXML + '</xml>';
            }

            // TODO: check to see if this is used when opened from the editor (and not the splash screen)
            // maybe projectData.code.length < 43??? i.e. empty project? instead of the URL parameter...

            if (getURLParameter('openFile') === "true") {
                // Loading an offline .SVG project file. Create a project object and
                // save it into the browser store.
                var titleIndex = xmlString.indexOf('transform="translate(-225,-53)">Title: ');
                var projectTitle = xmlString.substring(
                    (titleIndex + 39), xmlString.indexOf('</text>', (titleIndex + 39)));
                titleIndex = xmlString.indexOf('transform="translate(-225,-8)">Description: ');
                var projectDesc = '';

                if (titleIndex > -1) {
                    projectDesc = xmlString.substring(
                        (titleIndex + 44),
                        xmlString.indexOf('</text>', (titleIndex + 44)));
                }

                var tt = new Date();
                titleIndex = xmlString.indexOf('data-createdon="');
                var projectCreated = tt;

                if (titleIndex > -1) {
                    projectCreated = xmlString.substring(
                        (titleIndex + 16),
                        xmlString.indexOf('"', (titleIndex + 17)));
                }

                titleIndex = xmlString.indexOf('data-lastmodified="');
                var projectModified = tt;

                if (titleIndex > -1) {
                    projectModified = xmlString.substring(
                        (titleIndex + 19),
                        xmlString.indexOf('"', (titleIndex + 20)));
                }

                var pd = {
                    'board': uploadBoardType,
                    'code': uploadedXML,
                    'created': projectCreated,
                    'description': decodeFromValidXml(projectDesc),
                    'description-html': '',
                    'id': 0,
                    'modified': projectModified,
                    'name': decodeFromValidXml(projectTitle),
                    'private': true,
                    'shared': false,
                    'type': "PROPC",
                    'user': "offline",
                    'yours': true,
                    'timestamp': getTimestamp(),
                };

                // Compute a parallel dataset to replace 'pd'
                // let project = new Project(
                //     decodeFromValidXml(projectTitle),
                //     decodeFromValidXml(projectDesc),
                //     uploadBoardType,
                //     ProjectTypes.PROPC,
                //     uploadedXML,
                //     projectCreated,
                //     projectModified,
                //     getTimestamp());
                //
                // let projectOutput = project.getDetails();
                //
                // if (! testProjectEquality(pd, projectOutput)) {
                //     console.log("Project output differs.");
                //     console.log("Old: " + pd);
                //     console.log("New: " + projectOutput);
                // }

                // Save the output in a temp storage space
                // TODO: Test this result with the value 'pd'
                // window.localStorage.setItem(
                //     "tempProject",
                //     JSON.stringify(projectOutput));

                // Save the project to the browser store
                window.localStorage.setItem(TEMP_PROJECT_STORE_NAME, JSON.stringify(pd));
            }
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
        if (getURLParameter('openFile') === 'true') {
            window.location = 'index.html';
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
    if (!append && getURLParameter('openFile') === 'true') {
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

        window.location = 'blocklyc.html';
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
            newCode = newCode.substring(uploadedXML.indexOf('<variables>'), newCode.length);
        }
        newCode = newCode.substring(0, (newCode.length - 6));

        // check for newer blockly XML code (contains a list of variables)
        if (newCode.indexOf('<variables>') > -1 && projCode.indexOf('<variables>') > -1) {
            var findVarRegExp = /type="(\w*)" id="(.{20})">(\w+)</g;
            var newBPCvars = [];
            var oldBPCvars = [];

            var varCodeTemp = newCode.split('</variables>');
            newCode = varCodeTemp[1];
            // use a regex to match the id, name, and type of the varaibles in both the old and new code.
            var tmpv = varCodeTemp[0].split('<variables>')[1].replace(findVarRegExp, function (p, m1, m2, m3) {  // type, id, name
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
            projectData['code'] = EMPTY_PROJECT_CODE_HEADER + tmpv + projCode + newCode + '</xml>';
        } else if (newCode.indexOf('<variables>') > -1 && projCode.indexOf('<variables>') === -1) {
            projectData['code'] = EMPTY_PROJECT_CODE_HEADER + newCode + projCode + '</xml>';
        } else {
            projectData['code'] = EMPTY_PROJECT_CODE_HEADER + projCode + newCode + '</xml>';
        }

        ClearBlocklyWorkspace();

        // This call fails because there is no Blockly workspace context
        loadToolbox(projectData['code']);

        // CAUTION: This call can redirect to the home page
        clearUploadInfo(false);
    }
}


/**
 *
 * @param profileName - aka Board Type
 */
function initToolbox(profileName) {

    // TODO: Verify that custom fonts are required
    var ff = getURLParameter('font');

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

    blocklyWorkSpace = Blockly.inject('content_blocks', blocklyOptions);

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
    if (projectData && projectData['board'] === 'propcfile') {
        return propcAsBlocksXml();
    }

    if (Blockly.Xml && Blockly.mainWorkspace) {
        const xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        return Blockly.Xml.domToText(xml);
    }

    if (projectData && projectData['code']) {
        return projectData['code'];
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
 *
 * @param o
 * @param i
 * @param t
 */
function showStep(o, i, t) {
    for (var j = 1; j <= t; j++) {
        $('#' + o + j.toString() + '-btn').addClass('btn-default').removeClass('btn-primary');
        $('#' + o + j.toString()).addClass('hidden');
    }
    $('#' + o + i.toString() + '-btn').removeClass('btn-default').addClass('btn-primary');
    $('#' + o + i.toString()).removeClass('hidden');
}


function ClearBlocklyWorkspace() {
    let space = Blockly.getMainWorkspace();
    if (space) {
        space.clearUndo();
        space.clear();
    }
}


function testProjectEquality(projectA, projectB) {
    if (!projectA) {
        console.log("Project A is empty");
        return false;
    }

    if (!projectB) {
        console.log("Project B is empty");
        return false;
    }

    if ((projectA.name && projectB.name) && (projectA.name !== projectB.name)) {
        console.log("Project name mismatch");
        return false;
    }

    if ((projectA.description && projectB.description) && (projectA.description !== projectB.description)) {
        console.log("Project description mismatch");
    }

    if (projectA.type !== projectB.type) {
        return false;
    }

    if (projectA.board !== projectB.board) {
        console.log("Board type mismatch");
        return false;
    }

    if (projectA.code !== projectB.code) {
        console.log("Code segment mismatch");
        return false;
    }

    if (projectA.created !== projectB.created) {
        return false;
    }

    if (projectA.modified !== projectB.modified) {
        return false;
    }

    if (projectA.descriptionHtml !== projectB.descriptionHtml) {
        return false;
    }

    if (projectA.id !== projectB.id) {
        return false;
    }

    // private: true
    // shared: false
    // timestamp: 1572365783099
    // user: "offline"
    // yours: true

    return true;
}