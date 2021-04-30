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

/*
 *  Embedded UI messages
 */
// eslint-disable-next-line camelcase
import {logConsoleMessage} from '../../../utility';

export const PageTextLabels = [];

// ------------------------------------------------------------------------
//  *** These elements have been verified as still being used in Solo  ****
// ------------------------------------------------------------------------
// BP Client dialog messages - used in blockyc.html
PageTextLabels['client_unknown'] =
    'BlocklyProp is unable to determine what version of BlocklyProp Launcher is installed on your' +
    ' computer.<br>You may need to install or reinstall the BlocklyProp Launcher.';
PageTextLabels['client_update_warning'] =
    'BlocklyProp Solo requires BlocklyProp Launcher version' +
    ' <span class="client-required-version"></span>, or later.<br><br>The version detected on' +
    ' your system, BlocklyProp Client version <span class="client-your-version"></span> may not' +
    ' work<br>correctly with Solo. We recommend downloading and installing the latest software' +
    ' for<br>best results. You can use the link below to get started.';
PageTextLabels['client_update_danger'] =
    'BlocklyProp now requires at least version <span class="client-required-version"></span> of' +
    ' the BlocklyProp Launcher.<br>You appear to be using BlocklyProp Launcher version' +
    ' <span class="client-your-version"></span>.<br>You will not be able to load projects to' +
    ' your device until you upgrade your BlocklyProp Launcher.<br>Please use the link below to' +
    ' download the newest version.';

PageTextLabels['editor_client_available'] = '<strong>Select the correct port,</strong> then click <svg xmlns="http://www.w3.org/2000/svg" width="12" height="15" style="vertical-align: middle;"><path d="M4.4,0 L6.8,0 6.8,7.2 10,7.2 5.6,11.6 1.2,7.2 4.4,7.2 Z" style="stroke:#000;stroke-width:1;fill:#000;"/></svg> or <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" style="vertical-align: middle;"><path d="M4.4,0 L6.8,0 6.8,4.8 10,4.8 5.6,9.2 1.2,4.8 4.4,4.8 Z M0.4,9.6 L10.8,9.6 10.8,11.6 0.4,11.6 Z" style="stroke:#000;stroke-width:1;fill:#000;"/></svg>.';
PageTextLabels['editor_client_available_short'] = '<strong>Select the correct port,</strong> then click <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" style="vertical-align: middle;"><path d="M4.4,0 L6.8,0 6.8,4.8 10,4.8 5.6,9.2 1.2,4.8 4.4,4.8 Z M0.4,9.6 L10.8,9.6 10.8,11.6 0.4,11.6 Z" style="stroke:#000;stroke-width:1;fill:#000;"/></svg>.';
PageTextLabels['editor_client_not-available'] = 'Unable to contact the BlocklyProp Launcher. Click for more information.';
PageTextLabels['editor_client_title'] = 'BlocklyProp Launcher';
PageTextLabels['editor_import'] = 'Import project file';
PageTextLabels['editor_append'] = 'Append project file';
PageTextLabels['editor_view_xml'] = 'XML';
PageTextLabels['editor_new_button'] = 'New';
PageTextLabels['editor_open_button'] = 'Open';
PageTextLabels['editor_save'] = 'Save';
PageTextLabels['editor_edit-details'] = 'Edit Project Details';
PageTextLabels['editor_upload'] = 'Import Project';
PageTextLabels['editor_run_configure'] = 'Configure client';
PageTextLabels['editor_upload_selectfile'] = 'Select File';
PageTextLabels['editor_upload_valid'] = 'The selected file appears valid.';
PageTextLabels['editor_upload_notvalid'] = 'The selected file is not valid.';
PageTextLabels['editor_upload_boardtype_warning'] =
    '<strong>Warning!</strong> You are about to upload a blocks file from a different' +
    ' board/device than you are currently using.  If the blocks you are trying to upload' +
    ' are not available for your current board, uploading this blocks file into your project' +
    ' may <strong>break your project</strong>.  If your project does break after uploading this' +
    ' file - do not save it! Click your browser\'s refresh button to reload your project.';
PageTextLabels['editor_button_cancel'] = 'Cancel';
PageTextLabels['editor_button_open'] = 'Open';
PageTextLabels['editor_button_replace'] = 'Replace';
PageTextLabels['editor_button_append'] = 'Append';
PageTextLabels['editor_save-check'] = 'Save project reminder';
PageTextLabels['editor_button_close'] = 'Close';
PageTextLabels['editor_run_compile'] = 'Compile';
PageTextLabels['editor_title_result'] = 'Result';
PageTextLabels['editor_title_terminal'] = 'Terminal';
PageTextLabels['editor_title_graphing'] = 'Graphing';
PageTextLabels['editor_graph_time_label'] = 'Time (seconds)';
PageTextLabels['editor_save-as'] = 'Save project as';
PageTextLabels['editor_saveas_boardtype_warning'] =
    '<strong>Warning!</strong> You are about to save the blocks from your current project into' +
    ' a project that is for a different board/device.  If the blocks that are in your project' +
    ' are not available for the board/device you selected, the new project may <strong>not' +
    ' work!</strong>';
PageTextLabels['editor_new_project_title'] = 'New project';
PageTextLabels['editor_button_continue'] = 'Continue';

PageTextLabels['project_saveaslink'] = 'Save As';
PageTextLabels['project_savelink'] = 'Save';
PageTextLabels['project_create_project_name'] = 'Project name';
PageTextLabels['project_create_board_type'] = 'Board/Device/Project type';
PageTextLabels['project_create_board_type_select'] = '- board/device/project type -';
PageTextLabels['project_name'] = 'Project Name';
PageTextLabels['project_created'] = 'Created On';
PageTextLabels['project_modified'] = 'Last Modified';
PageTextLabels['project_create_description'] = 'Description';

PageTextLabels['client_macOS_run_title'] = 'Running the BlocklyProp Launcher on your Mac';
PageTextLabels['client_macOS_run_instructions1'] = 'Find the BlocklyProp Launcher application by opening a Finder window and clicking &quot;Applications&quot; on the left. Then look for the BlocklyProp Launcher application and double-click it:';
PageTextLabels['client_run_instructions2'] = 'Once the BlocklyProp Launcher is running and connected, you may return to your browser and load programs to your device.';
PageTextLabels['client_windows_run_title'] = 'Running the BlocklyProp Launcher on your Windows PC';
PageTextLabels['client_windows_run_instructions1'] = 'Click the Windows (start) icon in the lower-left corner of your screen. Then look for the BlocklyProp Launcher application inside of the &quot;Parallax Inc&quot; folder:';
PageTextLabels['client_chrome_run_title'] = 'Running the BlocklyProp Launcher on your Chromebook';
PageTextLabels['client_chrome_run_instructions1'] = 'Click the App icon (circle) in the bottom-left corner of the screen. Find the BlocklyProp Launcher app and double-click it:';
PageTextLabels['clientdownload_download_installer'] = 'Download the installer';

// MacOS Launcher installations
PageTextLabels['client_download_launcher_macos_big_sur_installer'] = 'BP-Launcher installer for MacOS Big Sur';
PageTextLabels['client_download_launcher_macos_catalina_installer'] = 'BP-Launcher installer for MacOS Catalina';
PageTextLabels['client_download_launcher_macos_mojave_installer'] = 'BP-Launcher installer for MacOS Mojave';
PageTextLabels['client_download_launcher_macos_high_sierra_installer'] = 'BP-Launcher installer for MacOS High Sierra';
PageTextLabels['clientdownload_launcher_windows64_installer'] = 'Windows 7/8/8.1/10 (64-bit) BP-Launcher installer';
PageTextLabels['clientdownload_launcher_windows64zip_installer'] = 'Windows 7/8/8.1/10 (64-bit) BP-Launcher installer (zip)';
PageTextLabels['clientdownload_download_launcher'] = 'Install the Launcher App';
PageTextLabels['clientdownload_client_chromeos_installer'] = 'Add to Chrome';
PageTextLabels['clientdownload_os_menu'] = 'Choose a different operating system';

PageTextLabels['menu_code'] = 'Code';
PageTextLabels['menu_blocks'] = 'Blocks';
PageTextLabels['menu_help_reference'] = 'Help & Reference';
PageTextLabels['menu_download_simpleide'] = 'Download SimpleIDE files';

PageTextLabels['os_name_win'] = 'Windows';
PageTextLabels['os_name_mac'] = 'Mac OS';
PageTextLabels['os_name_chr'] = 'Chrome OS';

/**
 * Initialize the text within the HTML elements
 * @param {HTMLElement} value
 */
export const initHtmlLabels = async (value) => {
  try {
    const spanTag = $(value);

    // Get the associated key value that will be used to locate
    // the text string in the PageTextLabels array. This array
    // is declared in messages.js
    const pageLabel = spanTag.attr('data-key');

    // If there is a key value
    if (pageLabel) {
      if (spanTag.is('a')) {
        // if the html element is an anchor, add a link
        spanTag.attr('href', PageTextLabels[pageLabel]);
      } else if (spanTag.is('input')) {
        // if the html element is a form input, set the
        // default value for the element
        spanTag.attr('value', PageTextLabels[pageLabel]);
      } else {
        // otherwise, assume that we're inserting html
        spanTag.html(PageTextLabels[pageLabel]);
      }
    }
  } catch (e) {
    logConsoleMessage(`Missing page_text_label: ${e.message}`);
  }
};

export const getHtmlText = (key) => {
  try {
    return PageTextLabels[key];
  } catch (e) {
    logConsoleMessage(`Unable to find ${key} in text labels`);
  }
};
