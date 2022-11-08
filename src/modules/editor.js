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

import 'bootstrap';
import Blockly from 'blockly/core';
import * as saveAs from 'file-saver';
import * as JSZip from 'jszip';

// eslint-disable-next-line camelcase
import {initHtmlLabels, getHtmlText} from './blockly/language/en/page_text_labels';
import {tooltipText} from './blockly/language/en/messages';
import /* webpackPrefetch: true */ './blockly/generators/propc';
import './blockly/generators/propc/base';
import './blockly/generators/propc/communicate';
import './blockly/generators/propc/control';
import './blockly/generators/propc/cogs';
import './blockly/generators/propc/custom_code';
import './blockly/generators/propc/gpio';
import './blockly/generators/propc/oled';
import './blockly/generators/propc/heb';
import './blockly/generators/propc/procedures';
import './blockly/generators/propc/s3';
import './blockly/generators/propc/sd_card';

import './blockly/generators/propc/sensors/bme680_gas';
import './blockly/generators/propc/sensors/color_pal';
import './blockly/generators/propc/sensors/temp_dht22';
import './blockly/generators/propc/sensors/fingerprint_scanner';
import './blockly/generators/propc/sensors/gps';
import './blockly/generators/propc/sensors/hmc5883l_compass';
import './blockly/generators/propc/sensors/joystick';
import './blockly/generators/propc/sensors/keypad_4x4';
import './blockly/generators/propc/sensors/lis3dh_accelerometer';
import './blockly/generators/propc/sensors/lsm9ds1_imu';
import './blockly/generators/propc/sensors/mma7455';
import './blockly/generators/propc/sensors/mx2125';
import './blockly/generators/propc/sensors/ping';
import './blockly/generators/propc/sensors/pir';
import './blockly/generators/propc/sensors/rfid_reader';
import './blockly/generators/propc/sensors/sony_remote';
import './blockly/generators/propc/sensors/sound_impact';

import './blockly/generators/propc/variables';

import {compile, loadInto, initializeBlockly, configureConnectionPaths} from './blocklyc';
import {downloadCSV, graphingConsole, graphPlay, downloadGraph, graphStartStop} from './graph';

import {serialConsole} from './serial_console';
import {watchdog} from './client_connection';
import {clientService, initTerminal} from './client_service';

import {
  APP_BUILD,
  APP_QA,
  APP_VERSION,
  ClientDownloadURIRoot,
  LOCAL_PROJECT_STORE_NAME,
} from './constants';

import {PROJECT_NAME_MAX_LENGTH} from './constants';
import {PROJECT_NAME_DISPLAY_MAX_LENGTH, ApplicationName} from './constants';
import {TestApplicationName, productBannerHostTrigger} from './constants';
import {CodeEditor, propcAsBlocksXml, getSourceEditor} from './code_editor.js';
import {editProjectDialog} from './dialogs/edit_project';
import {NudgeTimer} from './nudge_timer';
import {Project, getProjectInitialState, getDefaultProfile} from './project';
import {setProjectInitialState, setDefaultProfile} from './project';
import {ProjectTypes, clearProjectInitialState} from './project';
import {projectJsonFactory} from './project';
import {buildDefaultProject} from './project/project_default';
import {propToolbarButtonController} from './toolbar_controller';
import {filterToolbox} from './toolbox_data';
import {
  getAllUrlParameters, getURLParameter, prettyCode,
  utils, logConsoleMessage, sanitizeFilename,
} from './utility';
import {getXmlCode} from './code_editor';

import {newProjectDialog} from './dialogs/new_project';
import {openProjectDialog} from './dialogs/open_project';
import {importProjectDialog} from './dialogs/import_project';

import {deferredPrompt} from '../index';

/**
 * The call to Blockly.svgResize() requires a reference to the
 * Blockly.WorkspaceSvg workspace that was returned from the
 * Blockly.inject() call.
 *
 * @type {Blockly.Workspace | null}
 */
let injectedBlocklyWorkspace = null;

/**
 * This is replacing the references to the codePropC variable.
 * @type {CodeEditor | null}
 */
let codeEditor = null;

// eslint-disable-next-line no-unused-vars
// const connectionWatchDogTimer = setInterval(findClient, 2000);

/**
 * Getter for the current WorkspaceSvg object
 * @return {Blockly.WorkspaceSvg | null}
 */
function getWorkspaceSvg() {
  return injectedBlocklyWorkspace;
}

/**
 * Execute this code as soon as the DOM becomes ready.
 * Replaces the old document.ready() construct
 */
document.addEventListener('DOMContentLoaded', function(event) {
  logConsoleMessage(`Blockly Core: ${Blockly.VERSION}`);

  // This will initiate a number of async calls to set up the page
  const result = initializePage();
  result.catch((err) => console.log(err));

  // Set up all UI event handlers before we call UI stuff
  initEventHandlers();

  // Set compile toolbar buttons to unavailable
  // setPropToolbarButtons();
  // Hide the loading... message
  document.getElementById('client-loading').classList.add('hidden');
  propToolbarButtonController();

  // The BASE_URL is deprecated since it is always the empty string
  // $('.url-prefix').attr('href', function(idx, cur) {
  //   // return BASE_URL + cur;
  //   return cur;
  // });

  // Init the BP Launcher socket connection watchdog timer
  watchdog(2);

  // TODO: This should be lazy-loaded when a terminal is first requested.
  initTerminal();

  const backup = window.localStorage.getItem(LOCAL_PROJECT_STORE_NAME);
  if (backup) {
    // Load this project
    // Copy the stored temp project to the stored local project
    const project = projectJsonFactory(JSON.parse(backup));
    // const currentProject = getProjectInitialState();
    // logConsoleMessage(`Current project and new project are equal?  ` +
    //     `${Project.compare(project, currentProject)}`);
    insertProject(project);
  } else {
    logConsoleMessage(`Creating default project`);
    initDefaultProject();
  }

  // Check for application installation as a PWA
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(`Choice result is: ${choiceResult.outcome}`);
      if (choiceResult.outcome === 'dismissed') {
        console.log(`User dismissed the choice.`);
      } else {
        console.log(`User installed the application.`);
      }
    });
  }
});

/**
 * Init page elements
 * @return {Promise<void>}
 */
async function initializePage() {
  renderPageBrandingElements();
  await initInternationalText();

  // Set up the URLs to download new Launchers and BP Clients
  await initClientDownloadLinks();
  await showAppName();
}

/**
 * Insert the text strings (internationalization) for all UI
 * elements on the editor page once the page has been loaded.
 */
async function initInternationalText() {
  const labels = document.getElementsByClassName('keyed-lang-string');
  for (let index = 0; index < labels.length; index++) {
    await initHtmlLabels(labels[index]);
  }

  // Insert text strings (internationalization) into button/link tooltips
  // The tooltipText array is 2 dimensions consisting of a key and a value.
  // The key is a HTMLElement id and the value is the text contained in the
  // balloon help popup.
  const elementId = 0;
  const balloonText = 1;

  for (let i = 0; i < tooltipText.length; i++) {
    const element = document.getElementById(tooltipText[i][elementId]);
    if (tooltipText[i] && element) {
      element.setAttribute('title', tooltipText[i][balloonText]);
    }
  }
}

/**
 * Set up event handlers - Attach events to nav/action menus/buttons
 */
function initEventHandlers() {
  // Leave editor page exit processing
  leavePageHandler();

  // Dialog Windows
  newProjectDialog.initEventHandlers();
  openProjectDialog.initEventHandlers();
  importProjectDialog.initEventHandlers();

  // Update the blockly workspace to ensure that it takes
  // the remainder of the window.
  window.addEventListener('resize', () => resetToolBoxSizing(100));

  // ----------------------------------------------------------------------- //
  // Left side toolbar event handlers                                        //
  // ----------------------------------------------------------------------- //
  // Compile the program
  const compilerButton = document.getElementById('prop-btn-comp');
  compilerButton.addEventListener('click', () => compile());
  // $('#prop-btn-comp').on('click', () => compile());

  // Load the program to the device RAM
  const ramButton = document.getElementById('prop-btn-ram');
  ramButton.addEventListener('click', () => loadInto('Load into RAM','bin','CODE','RAM'));
  // $('#prop-btn-ram').on('click', () => {
  //   loadInto('Load into RAM', 'bin', 'CODE', 'RAM');
  // });

  // Load the program into the device EEPROM
  const eepromButton = document.getElementById('prop-btn-eeprom');
  eepromButton.addEventListener('click', () => loadInto('Load into EEPROM', 'eeprom', 'CODE', 'EEPROM'));
  // $('#prop-btn-eeprom').on('click', () => {
  //   loadInto('Load into EEPROM', 'eeprom', 'CODE', 'EEPROM');
  // });

  // Open a serial terminal window
  $('#prop-btn-term').on('click', () => serialConsole());

  // Open a graphing window
  $('#prop-btn-graph').on('click', () => graphingConsole());

  // Init C source editor toolbar event handlers
  initCSourceEditorButtonEvenHandlers();

  // TODO: The event handler is just stub code.
  $('#term-graph-setup').on('click', () => configureTermGraph());

  // Close upload project dialog event handler
  $('#upload-close').on('click', () => clearUploadInfo());


  // **********************************
  // **     Toolbar - right side     **
  // **********************************

  // Project Name listing
  projectNameUIEvents();

  // Blocks/Code/XML button
  $('#btn-view-propc').on('click', () => renderContent('tab_propc'));
  $('#btn-view-blocks').on('click', () => renderContent('tab_blocks'));
  $('#btn-view-xml').on('click', () => renderContent('tab_xml'));

  // New Project toolbar button
  // TODO: New Project should be treated the same way as Open Project.
  $('#new-project-button').on('click', () => newProjectEvent());

  // Open Project toolbar button
  // $('#open-project-button').on('click', () => openProjectDialog.show());
  $('#open-project-button').on('click', () => openProjectEvent());

  // Save Project toolbar button
  $('#save-btn, #save-project').on('click', () => saveProject());

  // Save project nudge dialog onclose event handler
  // Not implemented
  $('#save-check-dialog').on('hidden.bs.modal', () => {
    logConsoleMessage('Closing the project save timer dialog.');
  });

  // --------------------------------
  // Hamburger menu items
  // --------------------------------

  // Edit project details
  document.getElementById('edit-project-details').addEventListener('click', () => {
    editProjectDialog.editProjectDetails();
  });

  // $('#edit-project-details').on('click', () => {
  //   editProjectDialog.editProjectDetails();
  // });

  // Help and Reference - online help web pages
  // Implemented as an href in the menu

  // ---- Hamburger drop down horizontal line ----

  // Download project to Simple IDE
  // TODO: Investigate why downloadPropC() is missing.
  $('#download-side').on('click', () => downloadPropC());

  // Import project file menu selector
  // Import (upload) project from storage. This is designed to merge code from an existing
  // project into the current project or to simply replace the contents of the current
  // project with the contents of the imported project.
  $('#upload-project').on('click', () => importProjectDialog.show());

  // ---- Hamburger drop down horizontal line ----

  // Configure client menu selector
  // Client configuration is only possible with the deprecated
  // BlocklyProp Client. The BlocklyProp Launcher does not require
  // a configuration dialog
  // TODO: Client configuration is deprecated. No needed for Launcher
  document.getElementById('client-setup')
      .addEventListener('click', configureConnectionPaths, false);

  // ---- Hamburger drop down horizontal line ----

  // About Solo
  document.getElementById('editor-about')
      .addEventListener('click', showEditorAbout, false);

  // Display the license in a modal when the link is clicked
  document.getElementById('editor-license')
      .addEventListener('click', showLicenseEventHandler, false);

  // --------------------------------
  // End of hamburger menu items
  // --------------------------------


  // Save As button
  $('#save-as-btn').on('click', () => saveAsDialog());

  // Save-As Project
  $('#save-project-as').on('click', () => saveAsDialog());

  // Save As new board type
  $('#save-as-board-type').on('change', () => checkBoardType($('#saveAsDialogSender').html()));

  // popup modal
  $('#save-as-board-btn').on('click', () => saveProjectAs(
      $('#save-as-board-type').val(),
      $('#save-as-project-name').val(),
  ));

  $('#btn-graph-play').on('click', () => graphPlay(''));
  $('#btn-graph-snapshot').on('click', () => downloadGraph());
  $('#btn-graph-csv').on('click', () => downloadCSV());
  $('#btn-graph-clear').on('click', () => graphStartStop('clear'));


  // Client install instruction modals
  $('.show-os-win').on('click', () => showOS('Windows'));
  $('.show-os-mac').on('click', () => showOS('MacOS'));
  $('.show-os-chr').on('click', () => showOS('ChromeOS'));
  $('.show-os-lnx').on('click', () => showOS('Linux'));

  // Serial port drop down onClick event handler
  $('#comPort').on('change', (event) => {
    logConsoleMessage(`Selecting port: ${event.target.value}`);
    clientService.setSelectedPort(event.target.value);
    propToolbarButtonController();
  });
}

/**
 * Stub function to open the Open Project dialog
 */
function newProjectEvent() {
  newProjectDialog.show();
}


/**
 * Stub function to open the Open Project dialog
 */
function openProjectEvent() {
  openProjectDialog.show();
}

/**
 * Display the Solo license
 */
function showLicenseEventHandler() {
  $('#licenseModal').modal();
}

/**
 * Display the Solo About dialog
 */
function showEditorAbout() {
  const d = new Date();
  const year = d.getFullYear().toString();

  // Populate the UI with application details
  const version = document.getElementById('about-solo-version');
  version.innerHTML = `BlocklyProp Solo ${getFullVersion()}, ` +
      `Copyright &copy; 2015, ${year}, Parallax Inc.`;

  const launcher = document.getElementById('about-solo-launcher-version');
  let versionString;
  if (clientService.getLauncherVersion().length > 0) {
    versionString = `v${clientService.getLauncherVersion()}, `;
  } else {
    versionString = '';
  }

  launcher.innerHTML = `BlocklyProp Launcher ${versionString} ` +
      `Copyright &copy; ${year}, Parallax Inc.`;
  $('#about-solo-dialog').modal();
}

/**
 * Interrupt browser from leaving the editor page if the current project
 * has been modified until the project is explicitly saved or abandoned.
 */
function leavePageHandler() {
  // Event handler for the OnBeforeUnload event
  // ------------------------------------------------------------------------
  // This event fires just before the document begins to unload. The unload
  // can be stopped by returning a string message. The browser will then
  // open a modal dialog the presents the message and options for Cancel and
  // Leave. If the Cancel option is selected the unload event is cancelled
  // and page processing continues.
  // ------------------------------------------------------------------------
  window.addEventListener('beforeunload', function(e) {
    logConsoleMessage(`Leaving the page`);

    // If the localStorage is empty, store the current project into the
    // localStore so that if the page is being refreshed, it will
    // automatically be reloaded.
    if (getProjectInitialState() &&
        getProjectInitialState().name !== undefined) {
      // Deep copy of the project
      const tempProject = {};
      Object.assign(tempProject, getProjectInitialState());

      // Overwrite the code blocks with the current project state
      tempProject.code = getXml();
      const today = new Date();
      tempProject.timestamp = today.getTime();

      // Save the current project into the browser store where it will
      // get picked up by the page loading code.
      window.localStorage.setItem(
          LOCAL_PROJECT_STORE_NAME,
          JSON.stringify(tempProject));
    }

    if (isProjectChanged()) {
      e.preventDefault(); // Cancel the event
      e.returnValue = Blockly.Msg.DIALOG_CHANGED_SINCE;
      return Blockly.Msg.DIALOG_CHANGED_SINCE;
    }
  });
}

/**
 * Set the BlocklyProp Client download links
 *
 * Set the href for each of the client links to point to the correct files
 * available on the downloads.parallax.com S3 site. The URL is stored in an
 * HTML meta tag.
 *
 * Be sure to update the text for these links in
 * modules/blockly/language/en/page_Text_labels.js
 */
async function initClientDownloadLinks() {
  // BP Client for Windows 32-bit
  $('.client-win32-link').attr('href',
      `${ClientDownloadURIRoot}/clients/BlocklyPropClient-setup-32.exe`);

  $('.client-win32zip-link').attr('href',
      `${ClientDownloadURIRoot}/clients/BlocklyPropClient-setup-32.zip`);

  // BP Client for Windows 64-bit
  $('.client-win64-link').attr('href',
      `${ClientDownloadURIRoot}/clients/BlocklyPropClient-setup-64.exe`);

  $('.client-win64zip-link').attr('href',
      `${ClientDownloadURIRoot}/clients/BlocklyPropClient-setup-64.zip`);

  // BP Launcher for Windows
  $('.launcher-win64-link').attr('href',
      `${ClientDownloadURIRoot}/launcher/Setup-BPLauncher-Win.exe`);

  $('.launcher-win64zip-link').attr('href',
      `${ClientDownloadURIRoot}/launcher/Setup-BPLauncher-Win.exe.zip`);

  // BP Client for macOS
  $('.client-mac-link').attr('href',
      `${ClientDownloadURIRoot}/clients/BlocklyPropClient-setup-MacOS.pkg`);

  // BP Launchers for macOS
  $('.launcher-mac-link-ventura').attr('href',
      `${ClientDownloadURIRoot}/launcher/Setup-BPLauncher-macOS-Ventura.zip`);

  $('.launcher-mac-link-monterey').attr('href',
      `${ClientDownloadURIRoot}/launcher/Setup-BPLauncher-macOS-Monterey.zip`);

  $('.launcher-mac-link-big-sur').attr('href',
      `${ClientDownloadURIRoot}/launcher/Setup-BPLauncher-macOS-Big-Sur.zip`);

  $('.launcher-mac-link-catalina').attr('href',
      `${ClientDownloadURIRoot}/launcher/Setup-BPLauncher-macOS-Catalina.zip`);

  $('.launcher-mac-link-mojave').attr('href',
      `${ClientDownloadURIRoot}/launcher/Setup-BPLauncher-macOS-Mojave.zip`);

  $('.launcher-mac-link-high_sierra').attr('href',
      `${ClientDownloadURIRoot}/launcher/Setup-BPLauncher-macOS-High-Sierra.zip`);
}

/**
 * Initialize the event handlers for the C source editor buttons
 *
 * @deprecated
 * The XML editor will be removed soon
 */
function initCSourceEditorButtonEvenHandlers() {
  // Clean up C source code
  // $('#prop-btn-pretty').on('click', () => formatWizard());

  // C source editor Undo button
  // $('#prop-btn-undo').on('click', () => getSourceEditor().undo());

  // C source editor Redo button
  // $('#prop-btn-redo').on('click', () => getSourceEditor().redo());

  // C source Find button
  $('#propc-find-btn').on('click', () => {
    getSourceEditor().find(
        document.getElementById('propc-find').value, {}, true);
  });

  // C source Replace button
  $('#propc-replace-btn').on('click', () => {
    getSourceEditor().replace(
        document.getElementById('propc-replace').value,
        {needle: document.getElementById('propc-find').value});
  });

  // C source Find and Replace button
  $('#find-replace-close').on('click', () => {
    if (document.getElementById('find-replace').style.display === 'none') {
      document.getElementById('find-replace').style.display = 'block';
    } else {
      document.getElementById('find-replace').style.display = 'none';
    }
  });
}

/**
 * Create a default project in the Blockly workspace
 */
function initDefaultProject() {
  // No viable project available, so redirect to index page.
  // Create a default project and press forward
  // window.location.href = 'index.html' + getAllUrlParameters();
  // TODO: New Default Project
  const defaultProject = buildDefaultProject();
  const myProject = setProjectInitialState(defaultProject);

  // Update the terminal serial port baud rate
  if (myProject) {
    clientService.setTerminalBaudRate(myProject.boardType.baudrate);
  }

  // Create an instance of the CodeEditor class
  codeEditor = new CodeEditor(defaultProject.boardType.name);
  if (!codeEditor) {
    console.log('Error allocating CodeEditor object');
  }
  setupWorkspace(defaultProject);
  propToolbarButtonController();
}

/**
 * Populate the Blockly workspace with the new project
 *
 * @param {Project} data is the current project object
 * @param {function=} callback is called if provided when the function completes
 * @return {number} Error code
 */
function setupWorkspace(data, callback) {
  // TODO: Calling the callback BEFORE the method has completed?
  if (data && typeof(data.boardType.name) === 'undefined') {
    if (callback) {
      callback({
        'error': 1,
        'message': 'Project data is null.',
      });
    }
    return -1;
  }

  // Set the project if the current project does not match the one supplied
  // by the caller
  let project = getProjectInitialState();
  if (project && (data !== project)) {
    project = setProjectInitialState(data);
  }

  if (!project) {
    // Something has gone sideways
    throw new Error('Unable to load the project.');
  }
  // Update the terminal serial port baud rate
  if (project) {
    clientService.setTerminalBaudRate(project.boardType.baudrate);
  }


  setDefaultProfile(project.boardType);

  if (!project.isTimerSet()) {
    const myTime = new NudgeTimer(0);
    // Set the callback
    myTime.myCallback = function() {
      if (isProjectChanged()) {
        showProjectTimerModalDialog();
      }
    };
    // Start the timer and attach it to the project object
    myTime.start(10);
    project.setProjectTimer(myTime);
  }
  // Delete all existing blocks, comments and undo stacks
  clearBlocklyWorkspace();

  // Set various project settings based on the project board type
  displayProjectName(project.name);
  displayProjectBoardIcon(project.boardType.name);

  // Set the help link to the ab-blocks, s3 reference, or propc reference
  // TODO: modify blocklyc.html/jsp and use an id or class selector
  if (project.boardType.name === 's3') {
    initToolbox(project.boardType.name);
    $('#online-help').attr('href', 'https://learn.parallax.com/s3-blocks');
    // Create UI block content from project details
    renderContent('blocks');
  } else if (project.boardType.name === 'propcfile') {
    initializeBlockly(Blockly);
    $('#online-help').attr('href', 'https://learn.parallax.com/support/C/propeller-c-reference');
    // Create UI block content from project details
    renderContent('propc');
  } else {
    initToolbox(project.boardType.name);
    $('#online-help').attr('href', 'https://learn.parallax.com/ab-blocks');
    // Create UI block content from project details
    renderContent('blocks');
  }

  // --------------------------------------------------------------------------
  // The project file may contain a namespace declaration for the variable
  // block. This declaration is not retained within the Blockly code.
  // Subsequent comparisons of the original project code with the code that
  // is retrieved from the Blockly core will fail if this extra namespace
  // remains intact in the original code image.
  //
  // Here we obtain a copy of the code blocks from the Blockly core immediately
  // after the project code is loaded. This will become the base image from
  // which future comparisons will be made. If anything changes it will be
  // due to a change in the code blocks contained within the Blockly core.
  // --------------------------------------------------------------------------
  // refreshEditorCanvas(project);
  project.setCode(getXml());

  // Edit project details menu item
  // if (projectData) {
  if (getProjectInitialState()) {
    // $('#edit-project-details').html(PageTextLabels['editor_edit-details']);
    $('#edit-project-details').html(getHtmlText('editor_edit-details'));
  }

  resetToolBoxSizing(0, true);

  // Execute the callback function if one was provided
  if (callback) {
    callback();
  }
  return 0;
}

/**
 * Display the project name
 * @param {string} name
 */
export function displayProjectName(name) {
  // Display the project name
  if (name.length > PROJECT_NAME_DISPLAY_MAX_LENGTH) {
    $('.project-name')
        .html(name.substring(0, PROJECT_NAME_DISPLAY_MAX_LENGTH - 1) + '...');
  } else {
    $('.project-name').html(name);
  }
}

/**
 * Display an icon representing the selected board type.
 * @param {string} boardType
 */
export function displayProjectBoardIcon(boardType) {
  // Create an array of board type icons
  const projectBoardIcon = {
    'activity-board': 'images/board-icons/IconActivityBoard.png',
    's3': 'images/board-icons/IconS3.png',
    'heb': 'images/board-icons/IconBadge.png',
    'heb-wx': 'images/board-icons/IconBadgeWX.png',
    'flip': 'images/board-icons/IconFlip.png',
    'other': 'images/board-icons/IconOtherBoards.png',
    'propcfile': 'images/board-icons/IconC.png',
  };

  // Set the project icon to the correct board type
  const element = document.getElementById('project-icon');
  if (element) {
    element.innerHTML = `
        <img src="${projectBoardIcon[boardType]}"
             title="Project board type is: ${boardType}"
             alt="${boardType}"/>`;
  }
}

/**
 * Persist the current project to local storage
 */
function saveProject() {
  const project = getProjectInitialState();
  downloadCode(project);
  project.setCode(getXml());
}

/**
 * Save project as a different board type
 */
function saveAsDialog() {
  // Prompt user to save current project first if unsaved
  if (isProjectChanged()) {
    utils.confirm(
        Blockly.Msg.DIALOG_SAVE_TITLE,
        Blockly.Msg.DIALOG_SAVE_FIRST,
        function(value) {
          if (value) {
            const project = getProjectInitialState();
            downloadCode(project);
          }
        }, 'Yes', 'No');
  }

  // Reset the save-as modal's fields
  $('#save-as-project-name').val(getProjectInitialState().name);
  const saveAsElement = $('#save-as-board-type');
  saveAsElement.empty();

  getDefaultProfile().saves_to.forEach(function(bt) {
    saveAsElement.append($('<option />').val(bt[1]).text(bt[0]));
  });

  // Open modal
  $('#save-as-type-dialog').modal({keyboard: false, backdrop: 'static'});
//  }
}

/**
 *
 * @param {string} requester
 */
function checkBoardType(requester) {
  if (requester !== 'offline') {
    const currentType = getProjectInitialState().boardType.name;
    const saveAsType = $('#save-as-board-type').val();

    // save-as-verify-boardtype
    if (currentType === saveAsType || saveAsType === 'propcfile') {
      document.getElementById('save-as-verify-boardtype')
          .style.display = 'none';
    } else {
      document.getElementById('save-as-verify-boardtype')
          .style.display = 'block';
    }
  }
}

/**
 * Save an existing project under a new project ID with the new project owner
 * @param {string} boardType
 * @param {string} projectName
 */
function saveProjectAs(boardType, projectName) {
  // TODO: Wrap this in a project object
  const tt = new Date();
  const pd = {
    'board': boardType,
    'code': Project.getEmptyProjectCodeHeader(),
    'created': tt,
    'description': '',
    'description-html': '',
    'id': 0,
    'modified': tt,
    'name': projectName,
    'private': true,
    'shared': false,
    'type': 'PROPC',
    'user': 'offline',
    'yours': true,
    'timestamp': tt.getTime(),
  };

  window.localStorage.setItem(LOCAL_PROJECT_STORE_NAME, JSON.stringify(pd));
  redirectToEditorPage(getAllUrlParameters());
}

/**
 * Encode a string to an XML-safe string by replacing unsafe
 * characters with HTML entities
 *
 * @param {string} str
 * @return {string}
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
 * Retrieve the project blocks from the Blockly workspace
 * @return {Document | XMLDocument}
 */
function getBlocklyProjectXML() {
  // Create an XML parser and parse the project XML
  const xmlParser = new DOMParser();
  return xmlParser.parseFromString(getXml(), 'text/xml');
}

/**
 * Save project to persistent storage
 * @param {Project} project is the project object to persist
 * @description The project metadata is retrieved from the static project
 * object. The current the current state of the project code is retrieved
 * from the Blockly workspace as an XMLDocument, which is required when the
 * code is embedded in an SVG document.
 *
 * An SVG document is created and then persisted to local storage. There is
 * no process confirmation message and, right now, there is no error message
 * either. That needs to be addressed.
 *
 * Once the project file has been stored, the current static project object
 * is updated to reflect the new last update timestamp and the current
 * state of the project code.
 */
function downloadCode(project) {
  const projectXml = getBlocklyProjectXML();

  if (project && project.boardType.name !== 'propcfile' &&
      projectXml.getElementsByTagName('block').length < 1) {
    // The project is empty. notify the user
    utils.showMessage(
        Blockly.Msg.DIALOG_EMPTY_PROJECT,
        Blockly.Msg.DIALOG_CANNOT_SAVE_EMPTY_PROJECT);
    return;
  }

  // Create a filename from the project title
  const projectFilename = sanitizeFilename(project.name);

  // Get the text of just the project inside of the outer XML tag
  const projectXmlCode = projectXml.children[0].innerHTML;

  // Get the paths of the blocks themselves and the size/position
  // of the blocks
  const projectSVG = document.getElementsByClassName('blocklyBlockCanvas');
  const projectSVGCode = projectSVG[0].outerHTML.replace(/&nbsp;/g, ' ');

  // Get project elements canvas dimensions
  const projectSize = projectSVG[0].getBoundingClientRect();
  const projectHeight = projectSize.height + projectSize.top;
  const projectWidth = projectSize.width + projectSize.left;

  // a Blocklyprop project SVG file header to lead the text of the file
  // and hold project metadata.
  const svgHeader = generateSvgHeader( projectWidth, projectHeight );

  // Generate a watermark with the project's metadate at the bottom-right
  // corner of the SVG.
  const svgFooter = generateSvgFooter(project);

  // Deprecating project checksum. Install a dummy checksum to keep
  // the project loader happy.
  const xmlChecksum = '000000000000';

  // Assemble both the SVG (image) of the blocks and the
  // blocks' XML definition
  const blob = new Blob([
    svgHeader + projectSVGCode + svgFooter + projectXmlCode +
            '<ckm>' + xmlChecksum + '</ckm></svg>',
  ], {type: 'image/svg+xml'});

  // TODO: Wrap this in a try/catch and maybe even a Promise, if needed
  // Persist the svg date to a project file
  // Notes: The call to saveAs() is asynchronous because saveAs references a
  // timer object. There does not appear to be a callback or a promise
  // available from saveAs, so the code - including the optional filesystem
  // dialog box will happen at some point after this function is executed.
  // We also will never know if the save was truly successful, so we
  // operate as if it was.
  saveAs(blob, `${projectFilename}.svg`);

  // Save the project into localStorage with a timestamp - if the page is
  // simply refreshed, this will allow the project to be reloaded.
  const date = new Date();
  project.timestamp = date.getTime();
  project.setCodeWithNamespace(projectXmlCode);
  window.localStorage.setItem(
      LOCAL_PROJECT_STORE_NAME, JSON.stringify(project));
}

/**
 * Generate a blocklyprop project SVG file header to lead the text of the file
 * and hold project metadata.
 *
 * @param {number} width SVG image width
 * @param {number} height SVG image height
 * @return {string}
 */
function generateSvgHeader( width, height ) {
  const projectHeight = (height + 100).toString();
  const projectWidth = (width + 236).toString();

  // Generate a header with the necessary svg XML header and style
  // information to make the blocks render correctly
  // TODO: Make SVG valid. How?
  let svgHeader = '';

  svgHeader += '<svg blocklyprop="blocklypropproject" xmlns="http://www.w3.org/2000/svg" ';

  // eslint-disable-next-line max-len
  svgHeader += 'xmlns:html="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink" ';
  // eslint-disable-next-line max-len
  svgHeader += 'version="1.1" class="blocklySvg"><style>.blocklySvg { background-color: #fff; ';
  // eslint-disable-next-line max-len
  svgHeader += 'overflow: auto; width:' + projectWidth + 'px; height:' + projectHeight + 'px;} .blocklyWidgetDiv {display: none; position: absolute; ';
  // eslint-disable-next-line max-len
  svgHeader += 'z-index: 999;} .blocklyPathLight { fill: none; stroke-linecap: round; ';
  // eslint-disable-next-line max-len
  svgHeader += 'stroke-width: 2;} .blocklyDisabled>.blocklyPath { fill-opacity: .5; ';
  // eslint-disable-next-line max-len
  svgHeader += 'stroke-opacity: .5;} .blocklyDisabled>.blocklyPathLight, .blocklyDisabled>';
  // eslint-disable-next-line max-len
  svgHeader += '.blocklyPathDark {display: none;} .blocklyText {cursor: default; fill: ';
  // eslint-disable-next-line max-len
  svgHeader += '#fff; font-family: sans-serif; font-size: 11pt;} .blocklyNonEditableText>text { ';
  // eslint-disable-next-line max-len
  svgHeader += 'pointer-events: none;} .blocklyNonEditableText>rect, .blocklyEditableText>rect ';
  // eslint-disable-next-line max-len
  svgHeader += '{fill: #fff; fill-opacity: .6;} .blocklyNonEditableText>text, .blocklyEditableText>';
  // eslint-disable-next-line max-len
  svgHeader += 'text {fill: #000;} .blocklyBubbleText {fill: #000;} .blocklySvg text {user';
  // eslint-disable-next-line max-len
  svgHeader += '-select: none; -moz-user-select: none; -webkit-user-select: none; cursor: ';
  // eslint-disable-next-line max-len
  svgHeader += 'inherit;} .blocklyHidden {display: none;} .blocklyFieldDropdown:not(.blocklyHidden) ';
  // eslint-disable-next-line max-len
  svgHeader += '{display: block;} .bkginfo {cursor: default; fill: rgba(0, 0, 0, 0.3); font-family: ';
  // eslint-disable-next-line max-len
  svgHeader += 'sans-serif; font-size: 10pt;}</style>';

  return svgHeader;
}

/**
 * Generate a watermark with the project's information at the bottom-right
 * corner of the SVG and hold project metadata.
 *
 * @param {Project} project contains the project details
 * @return {string}
 */
function generateSvgFooter( project ) {
  let svgFooter = '';
  const dt = new Date();

  svgFooter += '<rect x="100%" y="100%" rx="7" ry="7" width="218" '+
            'height="84" style="fill:rgba(255,255,255,0.4);" '+
            'transform="translate(-232,-100)" />';

  svgFooter += '<text class="bkginfo" x="100%" y="100%" '+
            'transform="translate(-225,-83)" style="font-weight:bold;">'+
            'Parallax BlocklyProp Project</text>';

  // The name of the project owner (deprecated)
  // svgFooter += '<text class="bkginfo" x="100%" y="100%" '+
  //           'transform="translate(-225,-68)">' +
  //           'User: ' + encodeToValidXml(project.user) + '</text>';

  // The project name
  svgFooter += '<text class="bkginfo" x="100%" y="100%" '+
            'transform="translate(-225,-53)">' +
            'Title: ' + encodeToValidXml(project.name) + '</text>';

  // Project ID (deprecated)
  // svgFooter += '<text class="bkginfo" x="100%" y="100%" '+
  //           'transform="translate(-225,-38)">' +
  //           'Project ID: 0</text>';

  // Propeller device attached to the project
  svgFooter += '<text class="bkginfo" x="100%" y="100%" '+
            'transform="translate(-225,-23)">' +
            'Device: ' + project.boardType.name + '</text>';

  // Project description
  svgFooter += '<text class="bkginfo" x="100%" y="100%" '+
            'transform="translate(-225,-8)">' +
            'Description: ' + encodeToValidXml(project.description) + '</text>';

  // This transform places the dates outside of the display box and are,
  // therefore, not visible in the watermark.
  svgFooter += '<text class="bkginfo" x="100%" y="100%" '+
            'transform="translate(-225,13)">data-createdon="' +
            project.getCreated() + '" data-lastmodified="' + dt + '"></text>';

  // Persist the project uuid and file layout version number.
  svgFooter += `<text class="bkginfo" x="100%" y="100%" transform="translate(-225,23)">` +
      `uuid="${project.uuid}" version="${project.version}"></text>`;

  return svgFooter;
}

/**
 * Filename object used to open an existing project .SVG file using
 * a blob object
 *
 * @typedef {Object} ProjectFileName
 * @property {number} lastModified
 * @property {Date} lastModifiedDate
 * @property {string} name
 * @property {number} size
 * @property {string} type
 * @property {string} webkitRelativePath
 */


/**
 * Reset the dialog prompts
 * TODO: This should be called on the front end before the dialog is opened.
 */
function clearUploadInfo() {
  $('#selectfile').val('');
  $('#selectfile-verify-notvalid').css('display', 'none');
  $('#selectfile-verify-valid').css('display', 'none');
  $('#selectfile-verify-boardtype').css('display', 'none');

  document.getElementById('selectfile-replace').disabled = true;
  document.getElementById('selectfile-append').disabled = true;
}

/**
 * Update the editor canvas with the current project blocks
 * @param {Project} project is the project object to use for the refresh
 */
export function refreshEditorCanvas(project) {
  logConsoleMessage(`Refreshing editor canvas`);
  initializeBlockly(Blockly);
  renderContent('blocks');

  // Create an instance of the CodeEditor class
  codeEditor = new CodeEditor(project.boardType.name);
  if (!codeEditor) {
    console.log('Error allocating CodeEditor object');
  }

  // Set the compile toolbar buttons to unavailable
  propToolbarButtonController();
}

/**
 * Replace the default Blockly fonts
 */
function initializeToolboxFonts() {
  // TODO: Verify that custom fonts are required
  if (Blockly.Css.CONTENT) {
    const font = getURLParameter('font');

    if (font) {
      // Replace font family in Blockly's inline CSS
      for (let f = 0; f < Blockly.Css.CONTENT.length; f++) {
        Blockly.Css.CONTENT[f] =
            Blockly.Css.CONTENT[f]
                .replace(/Arial, /g, '')
                .replace(/sans-serif;/g, '\'' + font + '\', sans-serif;');
      }

      $('html, body').css('font-family', '\'' + font + '\', sans-serif');
      $('.blocklyWidgetDiv .goog-menuitem-content')
          .css(
              'font',
              '\'normal 14px \'' + font + '\',' +
              ' sans-serif !important\'');
    } else {
      for (let f = 0; f < Blockly.Css.CONTENT.length; f++) {
        Blockly.Css.CONTENT[f] =
            Blockly.Css.CONTENT[f]
                .replace(/Arial, /g, '')
                .replace(/sans-serif;/g, 'Arimo, sans-serif;');
      }
    }
  }
}

/**
 * Initialize the Blockly toolbox with a collection of blocks that are
 * appropriate for the supplied board type.
 *
 * @param {string} profileName - aka Board Type
 */
function initToolbox(profileName) {
  initializeToolboxFonts();

  // Options are described in detail here:
  // https://developers.google.com/blockly/guides/get-started/web#configuration
  const blocklyOptions = {
    toolbox: filterToolbox(profileName),
    trashcan: true,
    media: 'images/blockly/',
    readOnly: (profileName === 'propcfile'),
    comments: false,

    // zoom defaults used here
    zoom: {
      controls: true,
      wheel: false,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
    },
    grid: {
      spacing: 20,
      length: 5,
      colour: '#fbfbfb',
      snap: false,
    },
  };

  // Solo-485 This is a sledgehammer approach to updating the toolbox. If the
  // toolbox is already defined, destroy the Blockly canvas inner HTML and
  // rebuild the whole thing from scratch, with the correct toolbox
  if (document.getElementsByClassName('blocklyToolboxDiv').length !== 0) {
    document.getElementById('content_blocks').innerHTML = '';
  }

  injectedBlocklyWorkspace = Blockly.inject(
      'content_blocks',
      blocklyOptions);

  initializeBlockly(Blockly);

  // TODO: find a better way to handle this.
  // https://groups.google.com/forum/#!topic/blockly/SgJoEEXuzsg
  Blockly.mainWorkspace.createVariable(Blockly.LANG_VARIABLES_GET_ITEM);
}

/**
 * Load the workspace
 * @param {string} xmlText
 * @description Despite the function name, this is NOT loading a Blockly
 * toolbox. Instead, it is attempting to load project blocks into an
 * existing, default Blockly workspace.
 */
export function loadToolbox(xmlText) {
  if (Blockly.mainWorkspace) {
    // The xmlText variable is assumed to be legitimate xml.
    try {
      const xmlDom = Blockly.Xml.textToDom(xmlText);
      Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace);
    } catch (e) {
      dumpErrorStack(e, 'Error while loading the toolbox.' );
      utils.showMessage(
          `Project Load Error`,
          `Project was load was not successful.\nLoading default project.`,
          () => {
            initDefaultProject();
          });
    }
  }
}

/**
 *
 * @param {object} error
 * @param {string} message
 */
function dumpErrorStack(error, message) {
  if (message) console.log('%s', message);

  console.log('%s', error.message);
  console.log(error.stack);
}

/**
 *
 * @param {string} os
 */
function showOS(os) {
  const body = $('body');
  body.removeClass('Windows')
      .removeClass('MacOS')
      .removeClass('Linux')
      .removeClass('ChromeOS');
  body.addClass(os);
}

/**
 * Clear the main workspace in the Blockly object
 */
function clearBlocklyWorkspace() {
  const workspace = Blockly.getMainWorkspace();

  if (workspace) {
    // Clear the undo/redo stacks in the workspace
    workspace.clearUndo();

    // Dispose of all blocks and comments in workspace.
    workspace.clear();
  }
}

/**
 * Placeholder function
 *
 * @return {boolean}
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
function renderPageBrandingElements() {
  let appName = ApplicationName;
  let html = 'BlocklyProp<br><strong>' + ApplicationName + '</strong>';

  if (window.location.hostname === productBannerHostTrigger ||
      window.location.hostname === 'localhost') {
    appName = TestApplicationName;
    html = 'BlocklyProp<br><strong>' + TestApplicationName + '</strong>';
    // document.getElementById('nav-logo').style.backgroundImage =
    //     'url(\'images/dev-toolkit.png\')';
  }

  $('#nav-logo').html(html);
  $('#app-banner-title').html('BlocklyProp ' + appName);
}

/**
 * Display the Timed Save Project modal dialog
 * @description This shows the nudge message to encourage the user to
 * save the project changes. It is an error if this gets called when the
 * current project is undefined.
 */
function showProjectTimerModalDialog() {
  const project = getProjectInitialState();
  if (!project) {
    logConsoleMessage(`Project save timer: project is null.`);
    return;
  }

  const lastSave = Math.ceil(project.getProjectTimeSinceLastSave());
  if (lastSave === 0) {
    logConsoleMessage(`Nudge timer is likely no longer working`);
    return;
  }

  const message = [
    getHtmlText('editor_save-check_warning-1'),
    getHtmlText('editor_save-check_warning-2'),
  ];

  // The embedded anonymous function builds the message string
  // for the modal dialog
  $('#save-check-warning-message')
      .html( ((strings, message) => {
        const str0 = strings[0];
        const str1 = strings[1];
        return `${str0}${message}${str1}`;
      })(message, lastSave));

  $('#save-check-dialog').modal({keyboard: false, backdrop: 'static'});
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
 *
 * @description
 * This function is replicated in the editor_js.js file to support a call from
 * the modals.js file. That copy will be deprecated when the modals.js file
 * is converted to a module.
 */
export function resetToolBoxSizing(resizeDelay, centerBlocks = false) {
  // Vanilla Javascript is used here for speed - jQuery
  // could probably be used, but this is faster. Force
  // the toolbox to render correctly
  setTimeout(() => {
    // find the height of just the blockly workspace by
    // subtracting the height of the navigation bar
    const navTop = document.getElementById('editor').offsetHeight;
    const navHeight = window.innerHeight - navTop;
    const navWidth = window.innerWidth;

    // Build an array of UI divs that display content
    const blocklyDiv = [
      document.getElementById('content_blocks'),
      document.getElementById('content_propc'),
      document.getElementById('content_xml'),
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
      // Blockly.svgResize(Blockly.mainWorkspace);
      Blockly.svgResize(injectedBlocklyWorkspace);

      // center the blocks on the workspace
      if (centerBlocks) {
        Blockly.getMainWorkspace().scrollCenter();
      }
    }
    //  10 millisecond delay
  }, resizeDelay || 10);
}

/**
 * Check project state to see if it has changed before leaving the page
 *
 * @return {boolean}
 * Return true if the project has been changed but has not been
 * persisted to storage.
 *
 * @description
 * This function retrieves the initial state of the project that is
 * displayed on the editor canvas and compares the initial state of
 * the code with the code contained in the Blockly core to determine
 * if any changes have occurred.
 *
 * This only examines the project code block. It does not evaluate
 * changes in the project name or description.
 */
export function isProjectChanged() {
  const project = getProjectInitialState();

  if (!project || typeof project.name === 'undefined') {
    console.log('There is no project defined.');
    console.log('This should probably be investigated.');
    return false;
  }

  // TODO: Compare the project name to the initial project name
  // TODO: Compare the project description with the initial description

  const code = getXml();
  const isChanged = project.code.localeCompare(code);
  return isChanged !== 0;
}

/**
 * Convert the current project workspace into an XML document
 *
 * @return {string}
 */
function getXml() {
  // TODO: This feels like propcfile is hijacking this method.
  const project = getProjectInitialState();
  if (project && project.boardType.name === 'propcfile') {
    // TODO: This needs to be converted to using a Project class
    return propcAsBlocksXml();
  }

  if (Blockly.Xml && Blockly.mainWorkspace) {
    const xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    return Blockly.Xml.domToText(xml);
  } else if (project && project.code) {
    return project.code;
  }

  // Return the XML for a blank project if none is found.
  return Project.getEmptyProjectCodeHeader() + '</xml>';
}

/**
 * Create a new project object, store it in the browser localStorage
 * and redirect to the editor.html page to force a project reload
 * from the browser localStorage
 */
export function createNewProject() {
  logConsoleMessage(`Creating a new project`);
  // Save the form fields into the projectData object
  // The projectData variable is defined in globals.js
  const projectName = $('#new-project-name').val();
  const description = $('#new-project-description').val();
  const boardType = $('#new-project-board-type').val();

  try {
    const tmpBoardType = Project.convertBoardType(boardType);
    if (tmpBoardType === undefined) {
      console.log('Unknown board type: %s', boardType);
    }

    const date = new Date();
    const timestamp = date.getTime();
    const newProject = new Project(
        projectName,
        description,
        tmpBoardType,
        ProjectTypes.PROPC,
        '',
        date,
        date,
        timestamp,
        true);

    newProject.stashProject(LOCAL_PROJECT_STORE_NAME);
    clearProjectInitialState();

    // Update the Blockly core
    const myProject = setProjectInitialState(newProject);

    // Update the terminal serial port baud rate
    if (myProject) {
      clientService.setTerminalBaudRate(myProject.boardType.baudrate);
    }
    // Create a new nudge timer
    const myTime = new NudgeTimer(0);
    // Set the callback
    myTime.myCallback = function() {
      if (isProjectChanged) {
        showProjectTimerModalDialog();
      }
    };

    // Start the timer and save it to the project object
    myTime.start(10);
    newProject.setProjectTimer(myTime);
    setupWorkspace(newProject);

    propToolbarButtonController();
  } catch (e) {
    logConsoleMessage(`Error while creating project object. ${e.message}.`);
  }
}

/**
 * Insert or replace an existing project in the Blockly core
 * @param {Project} project
 */
export function insertProject(project) {
  try {
    // project.stashProject(LOCAL_PROJECT_STORE_NAME);
    clearProjectInitialState();
    const myProject = setProjectInitialState(project);

    // Update the terminal serial port baud rate
    if (myProject) {
      clientService.setTerminalBaudRate(myProject.boardType.baudrate);
    }

    // if (!project.isTimerSet()) {
    //   // Create a new nudge timer
    //   const myTime = new NudgeTimer(0);
    //   // Set the callback
    //   myTime.myCallback = function() {
    //     if (isProjectChanged) {
    //       showProjectTimerModalDialog();
    //     }
    //   };
    //
    //   // Start the timer and save it to the project object
    //   myTime.start(10);
    //   project.setProjectTimer(myTime);
    // }

    setupWorkspace(project);

    // Create an instance of the CodeEditor class
    codeEditor = new CodeEditor(project.boardType.name);
    if (!codeEditor) {
      console.log('Error allocating CodeEditor object');
    }
    propToolbarButtonController();
  } catch (e) {
    logConsoleMessage(`Error while creating project object. ${e.message}.`);
  }
}

/**
 *Display the application name
 */
async function showAppName() {
  const html = 'BlocklyProp<br><strong>Solo</strong>';
  $('#nav-logo').html(html);
}

/**
 * Redirect the the editor page
 * @param {string} parameters is any query string elements
 */
function redirectToEditorPage(parameters = '') {
  logConsoleMessage('Redirecting to the editor page');
  clientService.closeConnection();
  window.location = (parameters.length > 0) ?
      `blocklyc.html${parameters}` : `\\blocklyc.html`;
}

/**
 * Set the event handlers for the project name UI element
 */
function projectNameUIEvents() {
  // Make the text in the project-name span editable
  $('.project-name').attr('contenteditable', 'true')
      .on('focus', () => {
        // Change the styling to indicate to the user that they
        // are editing this field
        const projectName = $('.project-name');
        projectName.html(getProjectInitialState().name);
        projectName.addClass('project-name-editable');
      })
      .on('blur', () => {
        // reset the style and save the new project name to the project
        const projectName = $('.project-name');
        if (projectName.setSelectionRange) {
          projectName.focus();
          projectName.setSelectionRange(0, 0);
        } else if (projectName.createTextRange) {
          const range = projectName.createTextRange();
          range.moveStart('character', 0);
          range.select();
        }
        projectName.removeClass('project-name-editable');
        // Limit project name characters that are displayed
        if (getProjectInitialState().name.length >
            PROJECT_NAME_DISPLAY_MAX_LENGTH) {
          projectName.html(
              getProjectInitialState().name.substring(
                  0,
                  PROJECT_NAME_DISPLAY_MAX_LENGTH - 1) + '...');
        }
      })
      .on('keydown', (e) => {
        // change the behavior of the enter key
        if (e.which === 13 || e.keyCode === 13) {
          e.preventDefault();
          $('.project-name').trigger('blur');
        }
      })
      .on('keyup', () => {
        // validate the input to ensure it's not too long, and save
        // changes as the user types.
        const tempProjectName = $('.project-name').html();
        if (tempProjectName.length > PROJECT_NAME_MAX_LENGTH ||
            tempProjectName.length < 1) {
          // $('.project-name').html(projectData.name);
          $('.project-name').html(getProjectInitialState().name);
        } else {
          // projectData.name = tempProjectName;
          getProjectInitialState().name = tempProjectName;
        }
      });
}

/**
 * Switch the visible pane when a tab is clicked.
 *
 * @param {string} id ID of tab clicked.
 */
function renderContent(id) {
  // Get the initial project state
  const project = getProjectInitialState();
  const codePropC = getSourceEditor();
  const codeXml = getXmlCode();

  // Select the active tab.
  const selectedTab = id.replace('tab_', '');

  // Is this project a C source code only project?
  const isPropcOnlyProject = (project.boardType.name === 'propcfile');

  if (isPropcOnlyProject) {
    // Show PropC editing UI elements
    $('.propc-only').removeClass('hidden');
  }

  switch (selectedTab) {
    case 'blocks':
      $('.blocklyToolboxDiv').css('display', 'block');

      $('#content_xml').css('display', 'none');
      $('#content_propc').css('display', 'none');
      $('#content_blocks').css('display', 'block');

      $('#btn-view-xml').css('display', 'none');
      $('#btn-view-propc').css('display', 'inline-block');
      $('#btn-view-blocks').css('display', 'none');

      Blockly.svgResize(getWorkspaceSvg());
      getWorkspaceSvg().render();
      break;
    case 'propc':
      $('.blocklyToolboxDiv').css('display', 'none');

      $('#content_xml').css('display', 'none');
      $('#content_propc').css('display', 'block');
      $('#content_blocks').css('display', 'none');

      $('#btn-view-xml').css('display', 'none');
      $('#btn-view-blocks').css('display', (isPropcOnlyProject) ? 'none' : 'inline-block');
      $('#btn-view-propc').css('display', 'none');

      if (!isPropcOnlyProject) {
        // Load C code for Ace editor
        const rawC = prettyCode(
            Blockly.propc.workspaceToCode(Blockly.mainWorkspace));
        const codePropC = getSourceEditor();
        codePropC.setValue(rawC);
        codePropC.gotoLine(0);
      } else {
        if (!codePropC || codePropC.getValue() === '') {
          codePropC.setValue(atob(
              (project.code.match(/<field name="CODE">(.*)<\/field>/) || ['',
                ''])[1] || ''));
          codePropC.gotoLine(0);
        }
        if (codePropC.getValue() === '') {
          let blankProjectCode = '// ------ Libraries and Definitions ------\n';
          blankProjectCode += '#include "simpletools.h"\n\n\n';
          blankProjectCode += '// ------ Global Variables and Objects ------';
          blankProjectCode += '\n\n\n// ------ Main Program ------\n';
          blankProjectCode += 'int main() {\n\n\nwhile (1) {\n\n\n}}';

          const rawC = prettyCode(blankProjectCode);
          codePropC.setValue(rawC);
          codePropC.gotoLine(0);
        }
      }
      break;
    case 'xml':
      $('.blocklyToolboxDiv').css('display', 'none');

      $('#content_xml').css('display', 'block');
      $('#content_propc').css('display', 'none');
      $('#content_blocks').css('display', 'none');

      $('#btn-view-xml').css('display', 'none');
      $('#btn-view-propc').css('display', 'none');
      $('#btn-view-blocks').css('display', 'inline-block');

      // Load project code
      codeXml.setValue(Blockly.Xml.domToPrettyText(
          Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)) || '');
      codeXml.getSession().setUseWrapMode(true);
      codeXml.gotoLine(0);
      break;
  }
}

/**
 * Formats code in editor and sets cursor to the line is was on
 * Used by the code formatter button in the editor UI
 *
 * @deprecated
 * Feature will be removed soon.
 */
// eslint-disable-next-line no-unused-vars,require-jsdoc
function formatWizard() {
  const codePropC = getSourceEditor();
  const currentLine = codePropC.getCursorPosition()['row'] + 1;
  codePropC.setValue(prettyCode(codePropC.getValue()));
  codePropC.focus();
  codePropC.gotoLine(currentLine);
}

/**
 * Save a project to the local file system
 */
function downloadPropC() {
  const project = getProjectInitialState();
  const propcCode = Blockly.propc.workspaceToCode(Blockly.mainWorkspace);
  const isEmptyProject = propcCode.indexOf('EMPTY_PROJECT') > -1;
  if (isEmptyProject) {
    // The project is empty, so warn and exit.
    utils.showMessage(
        Blockly.Msg.DIALOG_EMPTY_PROJECT,
        Blockly.Msg.DIALOG_CANNOT_SAVE_EMPTY_PROJECT);
  } else {
    // Make sure the filename doesn't have any illegal characters
    const value = sanitizeFilename(project.boardType.name);

    let sideFileContent = '.c\n>compiler=C\n>memtype=cmm main ram compact\n';
    sideFileContent += '>optimize=-Os\n>-m32bit-doubles\n>-fno-exceptions\n';
    sideFileContent += '>defs::-std=c99\n';
    sideFileContent += '>-lm\n>BOARD::ACTIVITYBOARD';

    const fileCblob = new Blob([propcCode], {type: 'text/plain'});
    const fileSIDEblob = new Blob(
        [value + sideFileContent], {type: 'text/plain'});

    const zip = new JSZip();
    const sideFolder = zip.folder(value);
    sideFolder.file(value + '.c', fileCblob);
    sideFolder.file(value + '.side', fileSIDEblob);

    // Generate the zip file
    sideFolder.generateAsync({type: 'blob'})
        .then(function(blob) {
          // Trigger the download
          saveAs(blob, value + '.zip');
        }, function(err) {
          utils.showMessage(
              Blockly.Msg.DIALOG_ERROR,
              Blockly.Msg.DIALOG_SIDE_FILES_ERROR + err);
        });
  }
}

/**
 * Determine if this is deployed in a test or local dev environment
 *
 * @return {boolean}
 */
function isDevBuild() {
  return (window.location.hostname.indexOf(productBannerHostTrigger) >= 0 ||
      window.location.hostname.indexOf('localhost') >= 0);
}

/**
 * Return a full application version string
 *
 * @return {string}
 */
function getFullVersion() {
  let applicationVersion = `v${APP_VERSION}`;
  if (isDevBuild()) {
    applicationVersion += `.${APP_BUILD}-${APP_QA}`;
  }

  return applicationVersion;
}
