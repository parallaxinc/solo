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
export const page_text_label = [];

// ------------------------------------------------------------------------
//  *** These elements have been verified as still being used in Solo  ****
// ------------------------------------------------------------------------
// BP Client dialog messages - used in blockyc.html
page_text_label['client_unknown'] =
    'BlocklyProp is unable to determine what version of BlocklyProp Launcher is installed on your' +
    ' computer.<br>You may need to install or reinstall the BlocklyProp Launcher.';
page_text_label['client_update_warning'] =
    'BlocklyProp Solo requires BlocklyProp Launcher version' +
    ' <span class="client-required-version"></span>, or later.<br><br>The version detected on' +
    ' your system, BlocklyProp Client version <span class="client-your-version"></span> may not' +
    ' work<br>correctly with Solo. We recommend downloading and installing the latest software' +
    ' for<br>best results. You can use the link below to get started.';
page_text_label['client_update_danger'] =
    'BlocklyProp now requires at least version <span class="client-required-version"></span> of' +
    ' the BlocklyProp Launcher.<br>You appear to be using BlocklyProp Launcher version' +
    ' <span class="client-your-version"></span>.<br>You will not be able to load projects to' +
    ' your device until you upgrade your BlocklyProp Launcher.<br>Please use the link below to' +
    ' download the newest version.';

// eslint-disable-next-line max-len
page_text_label['editor_client_available'] = '<strong>Select the correct port,</strong> then click <svg xmlns="http://www.w3.org/2000/svg" width="12" height="15" style="vertical-align: middle;"><path d="M4.4,0 L6.8,0 6.8,7.2 10,7.2 5.6,11.6 1.2,7.2 4.4,7.2 Z" style="stroke:#000;stroke-width:1;fill:#000;"/></svg> or <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" style="vertical-align: middle;"><path d="M4.4,0 L6.8,0 6.8,4.8 10,4.8 5.6,9.2 1.2,4.8 4.4,4.8 Z M0.4,9.6 L10.8,9.6 10.8,11.6 0.4,11.6 Z" style="stroke:#000;stroke-width:1;fill:#000;"/></svg>.';
// eslint-disable-next-line max-len
page_text_label['editor_client_available_short'] = '<strong>Select the correct port,</strong> then click <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" style="vertical-align: middle;"><path d="M4.4,0 L6.8,0 6.8,4.8 10,4.8 5.6,9.2 1.2,4.8 4.4,4.8 Z M0.4,9.6 L10.8,9.6 10.8,11.6 0.4,11.6 Z" style="stroke:#000;stroke-width:1;fill:#000;"/></svg>.';
// eslint-disable-next-line max-len
page_text_label['editor_client_not-available'] = 'Unable to contact the BlocklyProp Launcher. Click for more information.';

page_text_label['editor_client_title'] = 'BlocklyProp Launcher';

page_text_label['menu_code'] = 'Code';
page_text_label['menu_blocks'] = 'Blocks';
page_text_label['editor_view_xml'] = 'XML';
page_text_label['editor_new_button'] = 'New';
page_text_label['editor_open_button'] = 'Open';
page_text_label['editor_save'] = 'Save';
page_text_label['editor_edit-details'] = 'Edit Project Details';
page_text_label['menu_help_reference'] = 'Help & Reference';
page_text_label['menu_download_simpleide'] = 'Download SimpleIDE files';
page_text_label['editor_upload'] = 'Import Project';
page_text_label['editor_run_configure'] = 'Configure client';
page_text_label['editor_upload_selectfile'] = 'Select File';
page_text_label['editor_upload_valid'] = 'The selected file appears valid.';
page_text_label['editor_upload_notvalid'] = 'The selected file is not valid.';
page_text_label['editor_upload_boardtype_warning'] =
    '<strong>Warning!</strong> You are about to upload a blocks file from a different' +
    ' board/device than you are currently using.  If the blocks you are trying to upload' +
    ' are not available for your current board, uploading this blocks file into your project' +
    ' may <strong>break your project</strong>.  If your project does break after uploading this' +
    ' file - do not save it! Click your browser\'s refresh button to reload your project.';
page_text_label['editor_button_cancel'] = 'Cancel';
page_text_label['editor_button_open'] = 'Open';
page_text_label['editor_button_replace'] = 'Replace';
page_text_label['editor_button_append'] = 'Append';
page_text_label['editor_save-check'] = 'Save project reminder';
page_text_label['editor_button_close'] = 'Close';
page_text_label['project_saveaslink'] = 'Save As';
page_text_label['project_savelink'] = 'Save';
page_text_label['editor_run_compile'] = 'Compile';
page_text_label['editor_title_result'] = 'Result';
page_text_label['editor_title_terminal'] = 'Terminal';
page_text_label['editor_title_graphing'] = 'Graphing';
page_text_label['editor_graph_time_label'] = 'Time (seconds)';
page_text_label['editor_save-as'] = 'Save project as';
page_text_label['project_create_project_name'] = 'Project name';
page_text_label['project_create_board_type'] = 'Board/Device/Project type';
page_text_label['project_create_board_type_select'] = '- board/device/project type -';
page_text_label['editor_saveas_boardtype_warning'] =
    '<strong>Warning!</strong> You are about to save the blocks from your current project into' +
    ' a project that is for a different board/device.  If the blocks that are in your project' +
    ' are not available for the board/device you selected, the new project may <strong>not' +
    ' work!</strong>';
page_text_label['editor_new_project_title'] = 'New project';
page_text_label['project_name'] = 'Project Name';
page_text_label['project_created'] = 'Created On';
page_text_label['project_modified'] = 'Last Modified';
page_text_label['project_create_description'] = 'Description';
page_text_label['editor_button_continue'] = 'Continue';
page_text_label['client_macOS_run_title'] = 'Running the BlocklyProp Launcher on your Mac';
page_text_label['client_macOS_run_instructions1'] =
    'Find the BlocklyProp Launcher application by opening a Finder window and clicking' +
    ' &quot;Applications&quot; on the left. Then look for the BlocklyProp Launcher application' +
    ' and double-click it:';
page_text_label['client_run_instructions2'] =
    'Once the BlocklyProp Launcher is running and connected, you may return to your browser' +
    ' and load programs to your device.';
page_text_label['client_windows_run_title'] = 'Running the BlocklyProp Launcher on your Windows PC';
page_text_label['client_windows_run_instructions1'] =
    'Click the Windows (start) icon in the lower-left corner of your screen. Then look for' +
    ' the BlocklyProp Launcher application inside of the &quot;Parallax Inc&quot; folder:';
page_text_label['client_chrome_run_title'] = 'Running the BlocklyProp Launcher on your Chromebook';
page_text_label['client_chrome_run_instructions1'] =
    'Click the App icon (circle) in the bottom-left corner of the screen. Find the BlocklyProp' +
    ' Launcher app and double-click it:';
page_text_label['os_name_win'] = 'Windows';
page_text_label['os_name_mac'] = 'Mac OS';
page_text_label['os_name_chr'] = 'Chrome OS';
page_text_label['clientdownload_download_installer'] = 'Download the installer';

// MacOS Launcher installations
page_text_label['client_download_launcher_macos_big_sur_installer'] =
    'BP-Launcher installer for MacOS Big Sur';
page_text_label['client_download_launcher_macos_catalina_installer'] =
    'BP-Launcher installer for MacOS Catalina';
page_text_label['client_download_launcher_macos_mojave_installer'] =
    'BP-Launcher installer for MacOS Mojave';
page_text_label['client_download_launcher_macos_high_sierra_installer'] =
    'BP-Launcher installer for MacOS High Sierra';
page_text_label['clientdownload_launcher_windows64_installer'] =
    'Windows 7/8/8.1/10 (64-bit) BP-Launcher installer';
page_text_label['clientdownload_launcher_windows64zip_installer'] =
    'Windows 7/8/8.1/10 (64-bit) BP-Launcher installer (zip)';
page_text_label['clientdownload_download_launcher'] = 'Install the Launcher App';
page_text_label['clientdownload_client_chromeos_installer'] = 'Add to Chrome';
page_text_label['clientdownload_os_menu'] = 'Choose a different operating system';


// ----------------------------------------------------------------------------
//  *** These elements have not been verified as still being used in Solo  ****
// ----------------------------------------------------------------------------

page_text_label['back'] = 'Back';
page_text_label['browser_detection_ms_warning'] =
    'WARNING: You appear to be using MS Edge or Internet Explorer as your web browser.' +
    ' BlocklyProp is not currently compatible with these browsers. Please use Chrome or' +
    ' Firefox instead.';
page_text_label['cancel'] = 'Cancel';
// BP Client installation for Chrome OS
page_text_label['clientdownload_client_chromeos_alreadyinstalled'] =
    'BlocklyProp Launcher is already installed.  Make sure it is open and running.';

// BP Client installation for MacOS
page_text_label['clientdownload_client_macos_installer'] = 'MacOS client installer';

// BP Client installations for Windows
page_text_label['clientdownload_client_windows32_installer'] =
    'Windows 7/8/8.1/10 (32-bit) client installer';
page_text_label['clientdownload_client_windows32zip_installer'] =
    'Windows 7/8/8.1/10 (32-bit) client installer (zip)';
page_text_label['clientdownload_client_windows64_installer'] =
    'Windows 7/8/8.1/10 (64-bit) client installer';
page_text_label['clientdownload_client_windows64zip_installer'] =
    'Windows 7/8/8.1/10 (64-bit) client installer (zip)';


// Windows Launcher installations
page_text_label['clientdownload_launcher_windows32_installer'] =
    'Windows 7/8/8.1/10 (32-bit) BP-Launcher installer';
page_text_label['clientdownload_launcher_windows32zip_installer'] =
    'Windows 7/8/8.1/10 (32-bit) BP-Launcher installer (zip)';

page_text_label['clientdownload_instructions'] =
    'The BlocklyProp Launcher application loads your programs into the Propeller and' +
    ' allows you to have a serial terminal in your browser connected to your Propeller.';
page_text_label['clientdownload_showall'] = 'Show clients for all operating systems';
page_text_label['clientdownload_title'] = 'BlocklyProp Launcher';

page_text_label['confirm_do_email'] = 'Email:';
page_text_label['confirm_do_error_invalid_combination'] = 'Invalid token/email combination';
page_text_label['confirm_do_submit'] = 'Confirm';
page_text_label['confirm_do_title'] = 'Please confirm';
page_text_label['confirm_do_token'] = 'Token:';
page_text_label['confirm_error_requested_too_often'] = 'Confirm requested too often';
page_text_label['confirm_error_wrong_authentication_source'] =
    'Email confirm is not for users using third party authentication sources.';
page_text_label['confirm_request_email'] = 'Email:';
page_text_label['confirm_request_submit'] = 'Request';
page_text_label['confirm_request_title'] = 'Email confirm request';
page_text_label['confirm_requested'] = 'Please check your email';

// Editor canvas messages
page_text_label['editor_clear-workspace'] = 'Clear workspace';
page_text_label['editor_offline_title'] = 'Offline Expermiental Version';
page_text_label['editor_demo_dialog_continue'] = 'Continue demo';
page_text_label['editor_demo_dialog_continue_text'] = 'Compiling and saving are disabled';
page_text_label['editor_demo_dialog_login'] = 'Log in';
page_text_label['editor_demo_dialog_login_loginlink'] = 'Log in if you want to start compiling or making changes.';
page_text_label['editor_demo_dialog_login_registerlink'] = 'If you don\'t yet have an account, register.';
page_text_label['editor_demo_dialog_title'] = 'You are not logged in';
page_text_label['editor_demonstration_mode_info'] = '<strong>Demo mode:</strong> Log in to use all of BlocklyProp\'s features.';
page_text_label['editor_demonstration_mode_instructions'] = 'Click here to log in or sign up';
page_text_label['editor_download'] = 'Download blocks file';
page_text_label['editor_view-details'] = 'View Project details';
page_text_label['editor_find_next'] = 'Find Next';
page_text_label['editor_replace'] = 'Replace';
page_text_label['editor_find_label'] = 'Find: ';
page_text_label['editor_replace_label'] = 'Replace: ';
page_text_label['editor_newproject_c'] = 'Propeller C';
page_text_label['editor_newproject_spin'] = 'Scribbler Robot';
page_text_label['editor_open'] = 'Open project file';
page_text_label['editor_import'] = 'Import project file';
page_text_label['editor_project'] = 'Project';
page_text_label['editor_projects_title'] = 'Projects';
page_text_label['editor_run_eeprom'] = 'Load EEPROM';
page_text_label['editor_run_ram'] = 'Load RAM';
page_text_label['editor_run_terminal'] = 'Serial terminal';
page_text_label['editor_run_title'] = 'Run';
page_text_label['editor_save-check_warning-1'] = 'It has been ';
page_text_label['editor_save-check_warning-2'] = ' minutes since you last saved your project. Save now?';
page_text_label['editor_term_graph_setup'] = 'Terminal &amp; Graph setup';
page_text_label['editor_view_blocks'] = 'Blocks';
page_text_label['editor_view_c'] = 'Propeller C';
page_text_label['editor_view_code'] = 'Code';
page_text_label['editor_view_spin'] = 'Spin';
page_text_label['editor_view_title'] = 'View';
page_text_label['error_generic'] = 'A problem occurred';
page_text_label['error_unknownemail'] = 'Unknown email';

page_text_label['footer_librarieslink'] = 'External libraries';
page_text_label['footer_licenselink'] = 'License';
page_text_label['footer_releases'] = 'Releases';

// Help system links
page_text_label['help_invalid-path'] = 'Invalid help file';
page_text_label['help_link_contest-ideas'] = 'http://learn.parallax.com/educators/contest/home';
page_text_label['help_link_educator-resources_activity-board'] = 'http://learn.parallax.com';
page_text_label['help_link_educator-resources_activity-bot'] = 'http://learn.parallax.com/educators/resource/activitybot-resources';
page_text_label['help_link_educator-resources_badge'] = 'http://learn.parallax.com';
page_text_label['help_link_getting-started_ab'] = 'http://learn.parallax.com/tutorials/language/blocklyprop/getting-started-blocklyprop';
page_text_label['help_link_getting-started_s3'] = 'http://learn.parallax.com/tutorials/robot/scribbler-robot/getting-started-blocklyprop-s3';
page_text_label['help_link_reference_ab'] = 'http://learn.parallax.com/support/reference/propeller-blocklyprop-block-reference';
page_text_label['help_link_reference_s3'] = 'http://learn.parallax.com/support/reference/scribbler-3-robot-block-reference';
page_text_label['help_link_tutorials_activity-board'] = 'http://learn.parallax.com/tutorials/language/blocklyprop';
page_text_label['help_link_tutorials_activity-bot'] = 'http://learn.parallax.com/tutorials/activitybot';
page_text_label['help_link_tutorials_badge'] = 'http://learn.parallax.com';
page_text_label['help_link_tutorials_s3'] = 'http://learn.parallax.com/tutorials/robot/scribbler-robot/scribbler-3';

page_text_label['help_menu_blocklyprop'] = 'BlocklyProp';
page_text_label['help_menu_blocks'] = 'Blocks';
page_text_label['help_menu_languagereference'] = 'Language reference';
page_text_label['help_not-found'] = 'Help file not found';
page_text_label['help_reference'] = 'Help and Reference';
page_text_label['help_search'] = 'Search';
page_text_label['help_search_no-results'] = 'No results';
page_text_label['help_search_results'] = 'Search results';
page_text_label['help_search_submit'] = 'Search';
page_text_label['help_text_contest-ideas'] = 'Contest Ideas';
page_text_label['help_text_educator-resources'] = 'Educator resources';
page_text_label['help_text_getting-started'] = 'Getting started';
page_text_label['help_text_reference'] = 'Block reference';
page_text_label['help_text_tutorials'] = 'Tutorials and projects';
page_text_label['help_title'] = 'Help';
page_text_label['help_title_activity-board'] = 'Activity Board';
page_text_label['help_title_activity-bot'] = 'Activity Bot';
page_text_label['help_title_badge'] = 'Hackable Badge';
page_text_label['help_title_flip'] = 'Propeller FLiP';
page_text_label['help_title_s3'] = 'Scribbler Robot';

page_text_label['home_c_project_newlink'] = 'New';
page_text_label['home_c_project_title'] = 'C Project';
page_text_label['home_latest_projects_title'] = 'Latest projects';
page_text_label['home_page_banner_slug'] = 'Making amazing projects and learning to code just became easier';
page_text_label['home_page_banner_title'] = 'Blockly for Propeller Multicore:';
page_text_label['home_page_product_title'] = 'BlocklyProp';
page_text_label['home_spin_project_newlink'] = 'New';
page_text_label['home_spin_project_title'] = 'S3 Robot Project';
page_text_label['html_content_missing'] = 'Content missing';
page_text_label['libraries_browser'] = 'Browser Libraries';
page_text_label['libraries_header'] = 'BlocklyProp utilizes a whole set of open source libraries, improving stability, compatibility and release times.';
page_text_label['libraries_server'] = 'Server Libraries';
page_text_label['libraries_title'] = 'Open Source Libraries';
page_text_label['license_copyright_head'] = 'Copyright &copy;';
page_text_label['license_copyright_owner'] = 'Parallax Inc.';
page_text_label['license_text_part1'] = 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:';
page_text_label['license_text_part2'] = 'The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.';
page_text_label['license_title'] = 'License';
page_text_label['license_type'] = 'The MIT License (MIT)';
page_text_label['license_warranty'] = 'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.';
page_text_label['login_email'] = 'Email:';
page_text_label['login_failed'] = 'Login was unsuccessful';
page_text_label['login_forgotlink'] = 'Forgot your password?';
page_text_label['login_notconfirmedlink'] = 'Email not yet confirmed?';
page_text_label['login_password'] = 'Password:';
page_text_label['login_registerlink'] = 'Register a new account';
page_text_label['login_submit'] = 'Login';
page_text_label['login_title'] = 'Please Log in';
page_text_label['logout'] = 'Logout';
page_text_label['menu_community_projects'] = 'Community projects';
page_text_label['menu_help'] = 'Help';
page_text_label['menu_login_and_register'] = 'Login/Register';
page_text_label['menu_my_projects'] = 'My projects';
page_text_label['menu_newproject_c'] = 'Propeller C';
page_text_label['menu_newproject_spin'] = 'Scribbler Robot';
page_text_label['menu_newproject_title'] = 'New project';
page_text_label['menu_privacy'] = 'Privacy Policy';
page_text_label['menu_product_title'] = 'BlocklyProp';
page_text_label['menu_profile'] = 'Profile';
page_text_label['menu_public-profile'] = 'Public profile';
page_text_label['my_project_list_title'] = 'My projects';
page_text_label['not_loggedin_login_loginlink'] = 'Login';
page_text_label['not_loggedin_login_registerlink'] = 'Register a new account';
page_text_label['not_loggedin_login_title'] = 'Log in';
page_text_label['not_loggedin_title'] = 'You are not logged in';
page_text_label['not_loggedin_try'] = 'Compiling and saving will be disabled';
page_text_label['not_loggedin_try_title'] = 'Try';
page_text_label['not_loggedin_try_trylink'] = 'Try editor';
page_text_label['not_loggedin_try_viewprojectlink'] = 'View project';
page_text_label['oauth_new-user'] = 'New user';
page_text_label['oauth_new-user_do_submit'] = 'Save';
page_text_label['oauth_new-user_error_screenname'] = 'Screen Name already in use';
page_text_label['oauth_new-user_screenname'] = 'Screen Name';
page_text_label['oauth_success'] = 'User logged in';
page_text_label['os_name_lnx'] = 'Linux';
page_text_label['password_complexity'] = 'The password should be at least 8 characters long';
page_text_label['password_complexity_error'] = 'Password is not complex enough';
page_text_label['password_reset_do_confirm_password'] = 'Confirm password:';
page_text_label['password_reset_do_email'] = 'Email:';
page_text_label['password_reset_do_error_invalid_combination'] = 'Invalid token/email combination';
page_text_label['password_reset_do_error_passwords_dont_match'] = 'Passwords don\'t match';
page_text_label['password_reset_do_password'] = 'Password:';
page_text_label['password_reset_do_submit'] = 'Change';
page_text_label['password_reset_do_title'] = 'Do password reset';
page_text_label['password_reset_do_token'] = 'Token:';
page_text_label['password_reset_error_requested_too_often'] = 'Reset requested too often';
page_text_label['password_reset_error_wrong_authentication_source'] = 'Password reset is not for users using third party authentication sources.';
page_text_label['password_reset_request_email'] = 'Email:';
page_text_label['password_reset_request_submit'] = 'Confirm';
page_text_label['password_reset_request_title'] = 'Request password reset';
page_text_label['profile_authentication-source'] = 'Authenticated using:';
page_text_label['profile_base_error'] = 'Your details could not be changed';
page_text_label['profile_base_error_screenname'] = 'Screenname already in use';
page_text_label['profile_base_success'] = 'Your details have been changed';
page_text_label['profile_confirm_password'] = 'Confirm password:';
page_text_label['profile_email'] = 'Email:';
page_text_label['profile_password'] = 'Password:';
page_text_label['profile_password_error'] = 'Password could not be changed';
page_text_label['profile_password_success'] = 'Your password has been changed';
page_text_label['profile_password-confirm_error'] = 'Passwords don\'t match';
page_text_label['profile_screenname'] = 'Screenname:';
page_text_label['profile_submit'] = 'Confirm';
page_text_label['profile_submit_password'] = 'Change password';
page_text_label['profile_title'] = 'Profile';
page_text_label['profile_unlock_error'] = 'Could not unlock your profile';
page_text_label['profile_unlock_password'] = 'Password:';
page_text_label['profile_unlock_submit'] = 'Unlock';
page_text_label['profile_unlock_title'] = 'Unlock to change';
page_text_label['project_board'] = 'Board Type';
page_text_label['project_board_activity-board'] = 'Propeller Activity Board WX';
page_text_label['project_board_flip'] = 'Propeller FLiP or Project Board';
page_text_label['project_board_heb'] = 'Hackable Electronic Badge';
page_text_label['project_board_heb-wx'] = 'Badge WX';
page_text_label['project_board_other'] = 'Other Propeller Board';
page_text_label['project_board_propcfile'] = 'Propeller C (code-only)';
page_text_label['project_board_s3'] = 'Scribbler Robot';
page_text_label['project_changed'] = 'Project changes have been saved';
page_text_label['project_clonelink'] = 'Clone';
page_text_label['project_create_basic'] = 'Basic info';
page_text_label['project_create_basic_title'] = 'Basic project info';
page_text_label['project_create_finishlink'] = 'Finish';
page_text_label['project_create_nextlink'] = 'Next';
page_text_label['project_create_previouslink'] = 'Previous';
page_text_label['project_create_sharing'] = 'Sharing';
page_text_label['project_create_sharing_title'] = 'Project sharing';
page_text_label['project_create_title'] = 'New project';
page_text_label['project_delete_confirm'] = 'Are you sure you want to delete this project?';
page_text_label['project_delete_confirm_shared'] = 'Are you sure you want to delete this project? You have it currently shared using a link.';
page_text_label['project_delete_confirm_title'] = 'Confirm delete';
page_text_label['project_deletelink'] = 'Delete';
page_text_label['project_description'] = 'Description';
page_text_label['project_details_title'] = 'Project details';
page_text_label['project_list_title'] = 'Community projects';
page_text_label['project_share-link'] = 'Share project using link';
page_text_label['project_sharing'] = 'Sharing';
page_text_label['project_sharing_private'] = 'Private';
page_text_label['project_sharing_shared'] = 'Shared';
page_text_label['project_sharing_tooltip_private'] = 'Hide project from other users';
page_text_label['project_sharing_tooltip_shared'] = 'Make project visible to other users';
page_text_label['project_table_board'] = 'Board';
page_text_label['project_table_description'] = 'Description';
page_text_label['project_table_name'] = 'Name';
page_text_label['project_table_user'] = 'User';
page_text_label['project_title'] = 'Project';
page_text_label['project_user'] = 'User Screen Name';
page_text_label['project_viewcode'] = 'View project code';
page_text_label['public-profile_friends'] = 'Friends';
page_text_label['public-profile_nav_profile'] = 'Profile';
page_text_label['public-profile_nav_projects'] = 'Projects';
page_text_label['public-profile_projects'] = 'Projects';
page_text_label['public-profile_title'] = 'User profile';
page_text_label['register_do_birth_month'] = 'Birth Month:';
page_text_label['register_do_birth_year'] = 'Birth Year:';
page_text_label['register_do_confirm_password'] = 'Confirm password:';
page_text_label['register_do_coppa_msg0'] = 'Why are we asking?';
page_text_label['register_do_coppa_msg1'] = 'To protect your privacy, especially if you are one of our younger users, US COPPA regulations require that we determine your age. More information is available';
page_text_label['register_do_coppa_msg2'] = 'here';
page_text_label['register_do_email'] = 'Email:';
page_text_label['register_do_password'] = 'Password:';

// eslint-disable-next-line no-useless-escape
page_text_label['register_do_password_char_alert'] = 'Only the characters A-Z,a-z,0-9,[space], and .,!?:;`\'&quot;_~&num;$%&amp;@()[]{}*+-|\/^&lt;&gt;&equals; are allowed in your password. <em>(ASCII 32-126)</em>';
page_text_label['register_do_screenname'] = 'Screen name:';
page_text_label['register_do_sponsor_email'] = 'Alternate contact email:';
page_text_label['register_do_sponsor_emailtype'] = 'Select one:';
page_text_label['register_do_submit'] = 'Register';
page_text_label['register_do_title'] = 'Register';
page_text_label['register_done_text'] = 'Please check your email to confirm your email account.';
page_text_label['register_done_title'] = 'Registration successful';
page_text_label['register_error_birth_month_not_selected'] = 'Please select the month of your birthday';
page_text_label['register_error_birth_year_not_selected'] = 'Please select the year of your birthday';
page_text_label['register_error_email_already_used'] = 'Email already used';
page_text_label['register_error_email_format_error'] = 'The email address is not formatted correctly';
page_text_label['register_error_generic'] = 'Something has gone wrong while registering your account. Support has been notified.';
page_text_label['register_error_missing_fields'] = 'All fields must be completed';
page_text_label['register_error_password_confirm_empty'] = 'Please enter your password twice to ensure it matches';
page_text_label['register_error_password_empty'] = 'Please provide a password to secure your account';
page_text_label['register_error_passwords_dont_match'] = 'Passwords don\'t match';
page_text_label['register_error_screenname_empty'] = 'Please enter a screen name';
page_text_label['register_error_screenname_used'] = 'Screen name already in use';
page_text_label['register_error_sponsor_email_empty'] = 'Please enter a sponsor email address. Ask a parent or teacher if you can use their email address';
page_text_label['register_error_sponsor_email_format_error'] = 'The sponsor email address is not formatted correctly';
page_text_label['register_error_user_email_empty'] = 'Please enter your email address';


// *** Elements that are not found in the source files ****
page_text_label['editor_client_checking'] = 'Looking for BlocklyProp Launcher...';
