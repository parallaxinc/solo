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
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
var term = null;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
var graph = null;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
var codePropC = null;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
var codeXml = null;


/**
 * Terminal baudrate setting
 *
 * @type {number}
 */
var baudrate = 115200;


/**
 * Graph temporary storage array
 *
 * @type {any[]}
 */
var graph_temp_data = new Array;


/**
 * Flag that indicates if the graph system is ready
 *
 * @type {boolean}
 */
var graph_data_ready = false;


/**
 * Graph data series start timestamp
 *
 * @type {null}
 */
var graph_timestamp_start = null;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {number}
 */
var graph_timestamp_restart = 0;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {boolean}
 */
var graph_paused = false;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {boolean}
 */
var graph_start_playing = false;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {String}
 */
var graph_temp_string = new String;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {number}
 */
var graph_time_multiplier = 0;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
var graph_interval_id = null;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {number}
 */
const fullCycleTime = 4294967296 / 80000000;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
var graph_labels = null;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {any[]}
 */
var graph_csv_data = new Array;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
var active_connection = null;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {string}
 */
var connString = '';


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {boolean}
 */
var connStrYet = false;


/**
 * Graph system settings
 *
 * @type {{graph_type: string, fullWidth: boolean, showPoint: boolean, refreshRate: number, axisX: {onlyInteger: boolean, type: *}, sampleTotal: number}}
 */
var graph_options = {
    showPoint: false,
    fullWidth: true,
    axisX: {
        type: Chartist.AutoScaleAxis,
        onlyInteger: true
    },
    refreshRate: 250,
    sampleTotal: 40,
    graph_type: 'S'
};


/**
 * Array to store source data for the graph system
 *
 * @type {{series: *[]}}
 */
var graph_data = {
    series: [// add more here for more possible lines...
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ]
};


// Flag offline docker mode
var docker = $("meta[name=docker]").attr("content");


/**
 * Minimum client/launcher version supporting base64-encoding
 */
const minEnc64Ver = version_as_number('0.7.0');


/**
 *  Minimum client/launcher version supporting coded/verbose responses
 */
const minCodedVer = version_as_number('0.7.5');


/**
 * Minimum client/launcher allowed for use with this system
 */
const minVer = version_as_number(client_min_version);


/**
 * Switch the visible pane when a tab is clicked.
 * 
 * @param {string} id ID of tab clicked.
 */
function renderContent(id) {
    // Select the active tab.
    const selectedTab = id.replace('tab_', '');
    const isPropcOnlyProject = (projectData['board'] === 'propcfile');

    let isDebug = getURLParameter('debug');
    if (!isDebug) {
        isDebug = false;
    }

    if (isPropcOnlyProject) {
        id = 'propc';
    }

    switch (selectedTab) {
      case 'blocks':
        $('.blocklyToolboxDiv').css('display', 'block')

        $('#content_xml').css('display', 'none');
        $('#content_propc').css('display', 'none');
        $('#content_blocks').css('display', 'block');

        $('#btn-view-xml').css('display', 'none');
        $('#btn-view-propc').css('display', 'inline-block');
        $('#btn-view-blocks').css('display', 'none');

        if ((isDebug || isOffline) && codeXml.getValue().length > 40) {
            Blockly.Xml.clearWorkspaceAndLoadFromXml(Blockly.Xml.textToDom(codeXml.getValue()), Blockly.mainWorkspace);
        } else {
            Blockly.svgResize(Blockly.mainWorkspace);
            Blockly.mainWorkspace.render();
        }
        break;
      case 'propc':
        $('.blocklyToolboxDiv').css('display', 'none')

        $('#content_xml').css('display', 'none');
        $('#content_propc').css('display', 'block');
        $('#content_blocks').css('display', 'none');

        if (isDebug || (isOffline && !docker)) {
            if (!isPropcOnlyProject) {
                $('#btn-view-xml').css('display', 'inline-block');
            } else {
                $('#btn-view-xml').css('display', 'none');
            }
            $('#btn-view-blocks').css('display', 'none');
        } else {
            $('#btn-view-xml').css('display', 'none');
            $('#btn-view-blocks').css('display', (isPropcOnlyProject ? 'none' : 'inline-block'));   
        }
        $('#btn-view-propc').css('display', 'none');
        if (!isPropcOnlyProject) {
            let raw_c = prettyCode(Blockly.propc.workspaceToCode(Blockly.mainWorkspace));
            codePropC.setValue(raw_c);
            codePropC.gotoLine(0);
        } else {
            if (!codePropC || codePropC.getValue() === '') {
                codePropC.setValue(atob((projectData['code'].match(/<field name="CODE">(.*)<\/field>/) || ['', ''])[1] || ''));
                codePropC.gotoLine(0);
            }
            if (codePropC.getValue() === '') {
                let blankProjectCode = '// ------ Libraries and Definitions ------\n';
                blankProjectCode += '#include "simpletools.h"\n\n\n';
                blankProjectCode += '// ------ Global Variables and Objects ------\n\n\n';
                blankProjectCode += '// ------ Main Program ------\n';
                blankProjectCode += 'int main() {\n\n\nwhile (1) {\n\n\n}}';
    
                let raw_c = prettyCode(blankProjectCode);
                codePropC.setValue(raw_c);
                codePropC.gotoLine(0);
            } 
        }
        break;
      case 'xml':
        $('.blocklyToolboxDiv').css('display', 'none')

        $('#content_xml').css('display', 'block');
        $('#content_propc').css('display', 'none');
        $('#content_blocks').css('display', 'none');

        $('#btn-view-xml').css('display', 'none');
        $('#btn-view-propc').css('display', 'none');
        $('#btn-view-blocks').css('display', 'inline-block');

        // Load project code
        codeXml.setValue(Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)));
        codeXml.getSession().setUseWrapMode(true);
        codeXml.gotoLine(0);

        break;
                                
    }

}


/**
 * Formats code in editor and sets cursor to the line is was on
 * Used by the code formatter button in the editor UI
 * 
 * @returns {*} raw_code 
 */
var formatWizard = function () {
    var currentLine = codePropC.getCursorPosition()['row'] + 1;
    codePropC.setValue(prettyCode());
    codePropC.focus();
    codePropC.gotoLine(currentLine);
};


/**
 * Pretty formatter for C code
 *
 * @param raw_code
 * @returns {*}
 */
var prettyCode = function (raw_code) {
    if (!raw_code) {
        raw_code = codePropC.getValue();
    }

    raw_code = js_beautify(raw_code, {
        'brace_style': 'expand',
        'indent_size': 2
    });
    raw_code = raw_code.replace(/,\n[\s\xA0]+/g, ", ")

            // improve the way reference and dereference operands are rendered
            .replace(/, & /g, ", &")
            .replace(/, \* /g, ", *")
            .replace(/\( & /g, "(&")
            .replace(/\( \* /g, "(*")
            .replace(/char \* /g, "char *")
            .replace(/bme680 \* /g, "bme680 *")
            .replace(/serial \* /g, "serial *")
            .replace(/lcdParallel \* /g, "lcdParallel *")
            .replace(/colorPal \* /g, "colorPal *")
            .replace(/ws2812 \* /g, "ws2812 *")
            .replace(/i2c \* /g, "i2c *")
            .replace(/talk \* /g, "talk *")
            .replace(/sound \* /g, "sound *")
            .replace(/screen \* /g, "screen *")
            .replace(/FILE \* /g, "FILE* ")

            // improve the way functions and arrays are rendered
            .replace(/\)\s*[\n\r]\s*{/g, ") {")
            .replace(/\[([0-9]*)\]\s*=\s*{\s*([0-9xXbBA-F,\s]*)\s*};/g, function (str, m1, m2) {
                m2 = m2.replace(/\s/g, '').replace(/,/g, ', ');
                return "[" + m1 + "] = {" + m2 + "};";
            });

    return (raw_code);
};


/**
 * Toggle the find-replace display style between 'block' and 'none'
 */
var findReplaceCode = function () {
    if (document.getElementById('find-replace').style.display === 'none') {
        document.getElementById('find-replace').style.display = 'block';
    } else {
        document.getElementById('find-replace').style.display = 'none';
    }
};


/**
 * Generate a unique block ID
 *
 * @param nonce
 * @returns {string}
 */
function generateBlockId(nonce) {
    let blockId = btoa(nonce).replace(/=/g, '');
    let l = blockId.length;

    if (l < 20) {
        blockId = 'zzzzzzzzzzzzzzzzzzzz'.substr(l - 20) + blockId;
    } else {
        blockId = blockId.substr(l - 20);
    }

    return blockId;
}



/**
 * Covert C source code into a Blockly block
 *
 * @returns {string}
 */
var propcAsBlocksXml = function () {
    let code = '<xml xmlns="http://www.w3.org/1999/xhtml">';
    code += '<block type="propc_file" id="' + generateBlockId(codePropC ? codePropC.getValue() : 'thequickbrownfoxjumpedoverthelazydog') + '" x="100" y="100">';
    code += '<field name="FILENAME">single.c</field>';
    code += '<field name="CODE">';

    if (codePropC) {
        code += btoa(codePropC.getValue().replace('/* EMPTY_PROJECT */\n', ''));
    }

    code += '</field></block></xml>';
    return code;
};



/**
 * Initialize Blockly
 *
 * Called on page load. Loads a Blockly project onto the editor pallet
 *
 * @param {!Blockly} blockly Instance of Blockly from iframe.
 */
function init(blockly) {
    if(!codePropC) {
        codePropC = ace.edit("code-propc");
        codePropC.setTheme("ace/theme/chrome");
        codePropC.getSession().setMode("ace/mode/c_cpp");
        codePropC.getSession().setTabSize(2);
        codePropC.$blockScrolling = Infinity;
        codePropC.setReadOnly(true);

        // if the project is a propc code-only project, enable code editing.
        if (projectData['board'] === 'propcfile') {
            codePropC.setReadOnly(false);
            codePropC.commands.addCommand({
                name: "undo",
                bindKey: {win: "Ctrl-z", mac: "Command-z"},
                exec: function (codePropC) {
                    codePropC.undo();
                },
                readOnly: true
            });
            codePropC.commands.addCommand({
                name: "redo",
                bindKey: {win: "Ctrl-y", mac: "Command-y"},
                exec: function (codePropC) {
                    codePropC.redo();
                },
                readOnly: true
            });
            codePropC.commands.addCommand({
                name: "find_replace",
                bindKey: {win: "Ctrl-f", mac: "Command-f"},
                exec: function () {
                    findReplaceCode();
                },
                readOnly: true
            });
            renderContent('tab_propc');
        }
    }

    if (!codeXml && (getURLParameter('debug') || isOffline)) {
        codeXml = ace.edit("code-xml");
        codeXml.setTheme("ace/theme/chrome");
        codeXml.getSession().setMode("ace/mode/xml");
        //codeXml.setReadOnly(true);
    }

    window.Blockly = blockly;

    if (projectData) {
        if ( ! projectData['code'] || projectData['code'].length < 50) {
            projectData['code'] = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';
        }
        if (projectData['board'] !== 'propcfile') {
            loadToolbox(projectData['code']);
        }
    }
}


/**
 * Set the global value for baudrate
 *
 * @param _baudrate
 */
function setBaudrate(_baudrate) {
    // TODO: Check the supplied baudrate value to ensure that it is reasonable
    // Set the global baudrate variable
    baudrate = _baudrate;
}


/**
 * Submit a project's source code to the cloud compiler
 *
 * @param text
 * @param action
 * @param successHandler
 */
function cloudCompile(text, action, successHandler) {

    // if PropC is in edit mode, get it from the editor, otherwise render it from the blocks.
    let propcCode = '';

    if (codePropC.getReadOnly()) {
        propcCode = prettyCode(Blockly.propc.workspaceToCode(Blockly.mainWorkspace));
    } else {
        propcCode = codePropC.getValue();
    }

    let isEmptyProject = propcCode.indexOf("EMPTY_PROJECT") > -1;

    if (isEmptyProject) {
        alert("You can't compile an empty project");
    } else {
        $("#compile-dialog-title").text(text);
        $("#compile-console").val('Compile... ');
        $('#compile-dialog').modal('show');

        let terminalNeeded = false;

        if (propcCode.indexOf("SERIAL_TERMINAL USED") > -1)
            terminalNeeded = 'term';
        else if (propcCode.indexOf("SERIAL_GRAPHING USED") > -1)
            terminalNeeded = 'graph';

        // OFFLINE MODE
        if (isOffline) {
            if (docker) {
                // Contact the local docker container running cloud compiler

                // baseUrl = /blockly/
                // action = 'compile'
                // idProject = an integer project number
                // data = {'code: propCode}
                //propCode = "// ------ Libraries and Definitions ------↵#include "simpletools.h"↵↵↵↵// ------ Main Program ------↵int main() {↵↵  //↵↵}"

                // Compute the url based on where we are now
                let postUrl = window.location.protocol + '//' + window.location.hostname + ':5001/single/prop-c/' + action;

                $.ajax({
                    'method': 'POST',
                    'url':  postUrl,
                    'data': {"code": propcCode}
                }).done(function (data) {
                    console.log(data);

                    // Check for an error response from the compiler
                    if (! data || data["compiler-error"] != "") {
                        // Get message as a string, or blank if undefined
                        let message =  (typeof data["compiler-error"] === "string") ? data["compiler-error"] : "";
                        // Display the result in the compile console modal <div>
                        $("#compile-console").val($("#compile-console").val() + data['compiler-output'] + data['compiler-error'] + loadWaitMsg);
                   } else {
                        var loadWaitMsg = (action !== 'compile') ? '\nDownload...' : '';

                        $("#compile-console").val($("#compile-console").val() + data['compiler-output'] + data['compiler-error'] + loadWaitMsg);
                        if (data.success) {
                            successHandler(data, terminalNeeded);
                        }

                        // Scoll automatically to the bottom after new data is added
                        document.getElementById("compile-console").scrollTop = document.getElementById("compile-console").scrollHeight;
                    }
                }).fail(function (data) {
                    // Data appears to be an HTTP response object
                    if (data) {
                        let message = "Aw snap. A server error " + data.status + " has been detected.";
                        $("#compile-console").val($("#compile-console").val() +  message);
                    }
                });
            }
            else {  // Use the webpack version
                /*
                 * Compiler optimization options:
                 *
                 *  -O0 (None)
                 *  -O1 (Mixed)
                 *  -O2 (Speed)
                 *  -Os (Size)
                 */

                localCompile(action, {'single.c': propcCode}, 'single.c', '-Os', '-Os', function(data) {
                    if (data.error) {
                        console.log(data);
                        // Get message as a string, or blank if undefined
                        alert("BlocklyProp was unable to compile your project:\n" + data['message']
                            + "\nIt may help to \"Force Refresh\" by pressing Control-Shift-R (Windows/Linux) or Shift-Command-R (Mac)");
                    } else {
                        var loadWaitMsg = (action !== 'compile') ? '\nDownload...' : '';
                        $("#compile-console").val($("#compile-console").val() + data['message'] + loadWaitMsg);
                        console.log(data);

                        // The success handler will transfer the binary data to the BP client
                        if (data.success && data.binary) {
                            successHandler(data, terminalNeeded);
                        }

                        // Scoll automatically to the bottom after new data is added
                        document.getElementById("compile-console").scrollTop = document.getElementById("compile-console").scrollHeight;
                    }
                });
            }
        }
        else {  // ONLINE MODE
            $.ajax({
                'method': 'POST',
                'url': baseUrl + 'rest/compile/c/' + action + '?id=' + idProject,
                'data': {"code": propcCode}
            }).done(function (data) {
                if (data.error || typeof data.error === "undefined") {
                    // console.log(data);
                    // Get message as a string, or blank if undefined
                    var message = (typeof data['message'] === "string") ? data['message'] : (typeof data.error !== "undefined") ? data['message'].toString() : "";
                    alert("BlocklyProp was unable to compile your project:\n" + message
                            + "\nIt may help to \"Force Refresh\" by pressing Control-Shift-R (Windows/Linux) or Shift-Command-R (Mac)");
                } else {
                    var loadWaitMsg = (action !== 'compile') ? '\nDownload...' : '';
                    $("#compile-console").val($("#compile-console").val() + data['compiler-output'] + data['compiler-error'] + loadWaitMsg);
                    if (data.success) {
                        successHandler(data, terminalNeeded);
                    }

                    // Scoll automatically to the bottom after new data is added
                    document.getElementById("compile-console").scrollTop = document.getElementById("compile-console").scrollHeight;
                }
            }).fail(function (data) {
                // console.log(data);
                var message = (typeof data === "string") ? data : data.toString();
                alert("BlocklyProp was unable to compile your project:\n----------\n" + message
                        + "\nIt may help to \"Force Refresh\" by pressing Control-Shift-R (Windows/Linux) or Shift-Command-R (Mac)");
            });
        }
    }
}


/**
 * Stub function to the cloudCompile function
 */
function compile() {
    cloudCompile('Compile', 'compile', function (data, terminalNeeded) {});
}



/**
 * Begins loading process
 *
 * @param modal_message message shown at the top of the compile/load modal.
 * @param compile_command for the cloud compiler (bin/eeprom).
 * @param load_option command for the loader (CODE/VERBOSE/CODE_VERBOSE).
 * @param load_action command for the loader (RAM/EEPROM).
 *
 * USED by the COMPILE, LOAD TO RAM, and LOAD TO EEPROM UI buttons directly (blocklyc.jsp/blocklyc.html)
 */
function loadInto(modal_message, compile_command, load_option, load_action) {

    if (ports_available) {
        cloudCompile(modal_message, compile_command, function (data, terminalNeeded) {

            if (client_use_type === 'ws') {

                //Prep for new download messages
                launcher_result = "";
                launcher_download = false;
                //Set dbug flag if needed
                var dbug = 'none';
                if (terminalNeeded === 'term' || terminalNeeded === 'graph') {
                    dbug = terminalNeeded;
                }
                var prog_to_send = {
                    type: 'load-prop',
                    action: load_action,
                    payload: data.binary,
                    debug: dbug,
                    extension: data.extension,
                    portPath: getComPort()
                };

                client_ws_connection.send(JSON.stringify(prog_to_send));

            } else {

                if (client_version >= minCodedVer) {
                    //Request load with options from BlocklyProp Client
                    $.post(client_url + 'load.action', {option: load_option, action: load_action, binary: data.binary, extension: data.extension, "comport": getComPort()}, function (loaddata) {
                        //Replace response message's consecutive white space with a new-line, then split at new lines
                        var message = loaddata.message.replace(/\s{2,}/g, '\n').split('\n');
                        //If responses have codes, check for all success codes (< 100)
                        var success = true;
                        var coded = (load_option === "CODE" || load_option === "CODE_VERBOSE");
                        if (coded) {
                            message.forEach(function (x) {
                                success = success && x.substr(0, 3) < 100;
                            });
                        }
                        //Display results
                        var result = '';
                        if (success && coded) {
                            //Success! Keep it simple
                            result = ' Succeeded.';
                        } else {
                            //Failed (or not coded); Show the details
                            var error = [];
                            message.forEach(function (x) {
                                error.push(x.substr((coded) ? 4 : 0));
                            });
                            result = ((coded) ? ' Failed!' : "") + '\n\n-------- loader messages --------\n' + error.join('\n');
                        }

                        $("#compile-console").val($("#compile-console").val() + result);

                        // Scoll automatically to the bottom after new data is added
                        document.getElementById("compile-console").scrollTop = document.getElementById("compile-console").scrollHeight;

                        //console.log(loaddata);
                        if (terminalNeeded === 'term' && loaddata.success) {
                            serial_console();
                        } else if (terminalNeeded === 'graph' && loaddata.success) {
                            graphing_console();
                        }
                    });
                } else {
                    //todo - Remove this once client_min_version (and thus minVer) is >= minCodedVer
                    //Request load without options from old BlocklyProp Client
                    $.post(client_url + 'load.action', {action: load_action, binary: data.binary, extension: data.extension, "comport": getComPort()}, function (loaddata) {
                        $("#compile-console").val($("#compile-console").val() + loaddata.message);

                        // Scoll automatically to the bottom after new data is added
                        document.getElementById("compile-console").scrollTop = document.getElementById("compile-console").scrollHeight;

                        //console.log(loaddata);
                        if (terminalNeeded === 'term' && loaddata.success) {
                            serial_console();
                        } else if (terminalNeeded === 'graph' && loaddata.success) {
                            graphing_console();
                        }
                    });
                }
            }
        });
    } else if (client_available) {
        alert("No device detected - ensure it is connected, powered, and selected in the ports list.\n\nMake sure your BlocklyPropClient is up-to-date.");
    } else {
        alert("BlocklyPropClient not available to communicate with a microcontroller."
                + "\n\nIt may help to \"Force Refresh\" by pressing Control-Shift-R (Windows/Linux) or Shift-Command-R (Mac).");
    }
}


/**
 * Serial console support
 */
function serial_console() {
    var newTerminal = false;

    if (client_use_type !== 'ws') {
        if (term === null) {
            term = {
                portPath: getComPort()
            };
            newTerminal = true;
        }

        if (ports_available) {
            var url = client_url + 'serial.connect';
            url = url.replace('http', 'ws');
            var connection = new WebSocket(url);

            // When the connection is open, open com port
            connection.onopen = function () {
                connString = '';
                connStrYet = false;
                connection.send('+++ open port ' + getComPort() + (baudrate ? ' ' + baudrate : ''));
                active_connection = connection;
            };
            // Log errors
            connection.onerror = function (error) {
                console.log('WebSocket Error');
                console.log(error);
            };

            connection.onmessage = function (e) {
                var c_buf = (client_version >= minEnc64Ver) ? atob(e.data) : e.data;
                if (connStrYet) {
                    displayInTerm(c_buf);
                } else {
                    connString += c_buf;
                    if (connString.indexOf(baudrate.toString(10)) > -1) {
                        connStrYet = true;
                        if (document.getElementById('serial-conn-info')) {
                            document.getElementById('serial-conn-info').innerHTML = connString.trim();
                            // send remainder of string to terminal???  Haven't seen any leak through yet...
                        }
                    } else {
                        displayInTerm(e.data);
                    }
                }
                $('#serial_console').focus();
            };

            if (!newTerminal) {
                updateTermBox(0);
            }

            $('#console-dialog').on('hidden.bs.modal', function () {
                active_connection = null;
                connString = '';
                connStrYet = false;
                connection.close();
                if (document.getElementById('serial-conn-info')) {
                    document.getElementById('serial-conn-info').innerHTML = '';
                }
                updateTermBox(0);
                term_been_scrolled = false;
                term = null;
            });
        } else {
            active_connection = 'simulated';

            if (newTerminal) {
                displayInTerm("Simulated terminal because you are in demo mode\n");
                displayInTerm("Connection established with: " + getComPort() + "\n");
            }

            $('#console-dialog').on('hidden.bs.modal', function () {
                term_been_scrolled = false;
                active_connection = null;
                updateTermBox(0);
                term = null;
            });
        }
    } else if (client_use_type === 'ws') {
        // using Websocket-only client

        term = {
            portPath: getComPort()
        };

        var msg_to_send = {
            type: 'serial-terminal',
            outTo: 'terminal',
            portPath: getComPort(),
            baudrate: baudrate.toString(10),
            msg: 'none',
            action: 'open'
        };

        active_connection = 'websocket';
        if (document.getElementById('serial-conn-info')) {
            document.getElementById('serial-conn-info').innerHTML = 'Connection established with ' +
                    msg_to_send.portPath + ' at baudrate ' + msg_to_send.baudrate;
        }
        client_ws_connection.send(JSON.stringify(msg_to_send));

        $('#console-dialog').on('hidden.bs.modal', function () {
            if (msg_to_send.action !== 'close') { // because this is getting called multiple times...?
                msg_to_send.action = 'close';
                if (document.getElementById('serial-conn-info')) {
                    document.getElementById('serial-conn-info').innerHTML = '';
                }
                active_connection = null;
                client_ws_connection.send(JSON.stringify(msg_to_send));
            }
            term_been_scrolled = false;
            updateTermBox(0);
        });
    }

    $('#console-dialog').modal('show');
}


/**
 * Graphing console
 */
function graphing_console() {
    var propcCode = Blockly.propc.workspaceToCode(Blockly.mainWorkspace);

    // If there are graph settings, extract them
    var graph_settings_start = propcCode.indexOf("// GRAPH_SETTINGS_START:");
    var graph_labels_start = propcCode.indexOf("// GRAPH_LABELS_START:");

    if (graph_settings_start > -1 && graph_labels_start > -1) {
        var graph_settings_end = propcCode.indexOf(":GRAPH_SETTINGS_END //") + 22;
        var graph_settings_temp = propcCode.substring(graph_settings_start, graph_settings_end).split(':');
        var graph_settings_str = graph_settings_temp[1].split(',');

        // GRAPH_SETTINGS_START:rate,x_axis_val,x_axis_type,y_min,y_max:GRAPH_SETTINGS_END //

        var graph_labels_end = propcCode.indexOf(":GRAPH_LABELS_END //") + 20;
        var graph_labels_temp = propcCode.substring(graph_labels_start, graph_labels_end).split(':');
        graph_labels = graph_labels_temp[1].split(',');

        graph_options.refreshRate = Number(graph_settings_str[0]);

        graph_options.graph_type = graph_settings_str[2];
        if (Number(graph_settings_str[3]) !== 0 || Number(graph_settings_str[4]) !== 0) {
            graph_options.axisY = {
                type: Chartist.AutoScaleAxis,
                low: Number(graph_settings_str[3]),
                high: Number(graph_settings_str[4]),
                onlyInteger: true
            };
        } else {
            graph_options.axisY = {
                type: Chartist.AutoScaleAxis,
                onlyInteger: true
            };
        }
        $('#graph_x-axis_label').css('display', 'block');
        graph_options.showPoint = false;
        graph_options.showLine = true;
        if (graph_settings_str[2] === 'X') {
            $('#graph_x-axis_label').css('display', 'none');
            if (Number(graph_settings_str[5]) !== 0 || Number(graph_settings_str[6]) !== 0) {
                graph_options.axisX = {
                    type: Chartist.AutoScaleAxis,
                    low: Number(graph_settings_str[5]),
                    high: Number(graph_settings_str[6]),
                    onlyInteger: true
                };
            } else {
                graph_options.axisX = {
                    type: Chartist.AutoScaleAxis,
                    onlyInteger: true
                };
            }
            graph_options.showPoint = true;
            graph_options.showLine = false;
        }

        if (graph_options.graph_type === 'S' || graph_options.graph_type === 'X')
            graph_options.sampleTotal = Number(graph_settings_str[1]);

        if (graph === null) {
            graph_reset();
            graph_temp_string = '';
            graph = new Chartist.Line('#serial_graphing', graph_data, graph_options);
            if (getURLParameter('debug')) console.log(graph_options);
        } else {
            graph.update(graph_data, graph_options);
        }

        if (client_use_type !== 'ws' && ports_available) {
            var url = client_url + 'serial.connect';
            url = url.replace('http', 'ws');
            var connection = new WebSocket(url);

            // When the connection is open, open com port
            connection.onopen = function () {
                if (baudrate) {
                    connection.send('+++ open port ' + getComPort() + ' ' + baudrate);
                } else {
                    connection.send('+++ open port ' + getComPort());
                }

                graphStartStop('start');

            };
            // Log errors
            connection.onerror = function (error) {
                console.log('WebSocket Error');
                console.log(error);
            };

            connection.onmessage = function (e) {
                var c_buf = (client_version >= minEnc64Ver) ? atob(e.data) : e.data;
                if (connStrYet) {
                    graph_new_data(c_buf);
                } else {
                    connString += c_buf;
                    if (connString.indexOf(baudrate.toString(10)) > -1) {
                        connStrYet = true;
                        if (document.getElementById('graph-conn-info')) {
                            document.getElementById('graph-conn-info').innerHTML = connString.trim();
                            // send remainder of string to terminal???  Haven't seen any leak through yet...
                        }
                    } else {
                        graph_new_data(c_buf);
                    }
                }
            };

            $('#graphing-dialog').on('hidden.bs.modal', function () {
                connection.close();
                graphStartStop('stop');
                connString = '';
                connStrYet = false;
                document.getElementById('graph-conn-info').innerHTML = '';
            });

        } else if (client_use_type === 'ws' && ports_available) {
            var msg_to_send = {
                type: 'serial-terminal',
                outTo: 'graph',
                portPath: getComPort(),
                baudrate: baudrate.toString(10),
                msg: 'none',
                action: 'open'
            };

            if (document.getElementById('graph-conn-info')) {
                document.getElementById('graph-conn-info').innerHTML = 'Connection established with ' +
                        msg_to_send.portPath + ' at baudrate ' + msg_to_send.baudrate;
            }

            client_ws_connection.send(JSON.stringify(msg_to_send));

            if (!graph_interval_id) {
                graphStartStop('start');
            }

            $('#graphing-dialog').on('hidden.bs.modal', function () {
                graphStartStop('stop');
                if (msg_to_send.action !== 'close') { // because this is getting called multiple times.... ?
                    msg_to_send.action = 'close';
                    if (document.getElementById('graph-conn-info')) {
                        document.getElementById('graph-conn-info').innerHTML = '';
                    }
                    client_ws_connection.send(JSON.stringify(msg_to_send));
                }
            });

        } else {
            // create simulated graph?
        }

        $('#graphing-dialog').modal('show');
        if (document.getElementById('btn-graph-play')) {
            document.getElementById('btn-graph-play').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M5.5,2 L4,2 4,11 5.5,11 Z M8.5,2 L10,2 10,11 8.5,11 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
        }
    } else {
        alert('To use the graphing feature, your program must have both a graph initialize block and a graph value block.');
    }
}


/**
 * Graphing system control
 *
 * @param action
 * Supported actions:
 *     start
 *     play
 *     stop
 *     pause
 *     clear
 */
var graphStartStop = function (action) {
    if (action === 'start' || action === 'play') {
        graph_new_labels();
        if (graph_interval_id) {
            clearInterval(graph_interval_id);
        }
        graph_interval_id = setInterval(function () {
            graph.update(graph_data);
            graph_update_labels();
        }, graph_options.refreshRate);
    } else if (action === 'stop' || action === 'pause') {
        clearInterval(graph_interval_id);
        graph_interval_id = null;
    }
    if (action === 'stop') {
        graph_paused = false;
        graph_reset();
        graph_play('play');
    }
    if (action === 'clear') {
        graph_reset();
    }
    if (action === 'play') {
        if (graph_data.series[0].length === 0) {
            graph_reset();
        }
        graph_paused = false;
        graph_start_playing = true;
    }
    if (action === 'pause' && graph_temp_data.slice(-1)[0]) {
        graph_paused = true;
        graph_temp_string = '';
        graph_timestamp_start = 0;
        graph_time_multiplier = 0;
        graph_timestamp_restart = graph_temp_data.slice(-1)[0][0];
    }
};


/**
 * Update the list of serail ports available on the host machine
 */
var check_com_ports = function () {
    if (client_use_type !== 'ws') {
        if (client_url !== undefined) {
            if (client_version >= minVer) {
                // Client is >= minimum supported version
                $.get(client_url + "ports.json", function (data) {
                    set_port_list(data);
                }).fail(function () {
                    set_port_list();
                });
            } else {
                // else keep port list clear (searching...)
                set_port_list();
            }
        }
    }
};

var select_com_port = function (com_port) {
    if (com_port !== null) {
        $("#comPort").val(com_port);
    }
    if ($("#comPort").val() === null && $('#comPort option').size() > 0) {
        $("#comPort").val($('#comPort option:first').text());
    }
};



/**
 * Check for active com ports when the DOM processing has finished
 */
$(document).ready(function () {
    // Display the app name in the upper-left corner of the page
    showAppName();

    check_com_ports();
});


/**
 * Return the select com port name
 *
 * @returns {jQuery}
 */
var getComPort = function () {
    return $('#comPort').find(":selected").text();
};


/**
 * Save a project to the local file system
 */
function downloadPropC() {
    var propcCode = Blockly.propc.workspaceToCode(Blockly.mainWorkspace);
    var isEmptyProject = propcCode.indexOf("EMPTY_PROJECT") > -1;
    if (isEmptyProject) {
        alert("You can't download an empty project");
    } else {
        utils.confirm('Downloading a SimpleIDE project', 'To open your project in SimpleIDE, two files will be downloaded.  They must both be saved in the same folder on your computer.', function (confirmed) {
            if (confirmed) {
                utils.prompt("Enter a filename:", 'Project' + idProject, function (value) {
                    if (value) {

                        var sideFileContent = ".c\n>compiler=C\n>memtype=cmm main ram compact\n";
                        sideFileContent += ">optimize=-Os\n>-m32bit-doubles\n>-fno-exceptions\n>defs::-std=c99\n";
                        sideFileContent += ">-lm\n>BOARD::ACTIVITYBOARD";
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
                        // Check for any file extentions at the end of the submitted name, and truncate if any
                        if (value.indexOf(".") !== -1)
                            value = value.substring(0, value.indexOf("."));
                        // Check to make sure the filename is not too long
                        if (value.length >= 30)
                            value = value.substring(0, 29);
                        // Replace any illegal characters
                        value = value.replace(/[\\/:*?\"<>|]/g, '_');
                        saveData(propcCode, value + ".c");
                        saveData(value + sideFileContent, value + ".side");
                    }
                });
            }
        });
    }
}


/**
 * Graph the data represented in the stream parameter
 *
 * @param stream
 */
function graph_new_data(stream) {

    // Check for a failed connection:
    if (stream.indexOf('ailed') > -1) {
        $("#graph-conn-info").html(stream);

    } else {
        var ts = 0;
        for (var k = 0; k < stream.length; k++) {
            if (stream[k] === '\n')
                stream[k] = '\r';
            if (stream[k] === '\r' && graph_data_ready) {
                if (!graph_paused) {
                    graph_temp_data.push(graph_temp_string.split(','));
                    var row = graph_temp_data.length - 1;
                    ts = Number(graph_temp_data[row][0]) || 0;

                    // convert to seconds:
                    // Uses Propeller system clock (CNT) left shifted by 16.
                    // Assumes 80MHz clock frequency.
                    ts = ts / 1220.703125;
                }
                if (!graph_timestamp_start || graph_timestamp_start === 0) {
                    graph_timestamp_start = ts;
                    if (graph_start_playing) {
                        graph_timestamp_start -= graph_timestamp_restart;
                        graph_timestamp_restart = 0;
                    }
                }
                if (row > 0 && !graph_start_playing) {
                    if (parseFloat(graph_temp_data[row][0]) < parseFloat(graph_temp_data[row - 1][1])) {
                        graph_time_multiplier += fullCycleTime;
                    }
                }
                graph_start_playing = false;
                if (!graph_paused) {
                    graph_temp_data[row].unshift(ts + graph_time_multiplier -
                            graph_timestamp_start);
                    var graph_csv_temp = (Math.round(graph_temp_data[row][0] * 10000) / 10000) + ',';

                    if (graph_options.graph_type === 'X') {   // xy scatter plot
                        var jk = 0;
                        for (var j = 2; j < graph_temp_data[row].length; j = j + 2) {
                            graph_csv_temp += graph_temp_data[row][j] + ',' + graph_temp_data[row][j + 1] + ',';
                            graph_data.series[jk].push({
                                x: graph_temp_data[row][j] || null,
                                y: graph_temp_data[row][j + 1] || null
                            });
                            if (graph_temp_data[row][0] > graph_options.sampleTotal)
                                graph_data.series[jk].shift();
                            jk++;
                        }
                    } else {    // Time series graph
                        for (var j = 2; j < graph_temp_data[row].length; j++) {
                            graph_csv_temp += graph_temp_data[row][j] + ',';
                            graph_data.series[j - 2].push({
                                x: graph_temp_data[row][0],
                                y: graph_temp_data[row][j] || null
                            });
                            $('.ct_line').css('stroke-width','2.5px');  // TODO: if this slows performance too much - explore changing the stylesheet (https://stackoverflow.com/questions/50036922/change-a-css-stylesheets-selectors-properties/50036923#50036923)
                            if (graph_temp_data[row][0] > graph_options.sampleTotal)
                                graph_data.series[j - 2].shift();
                        }                        
                    }

                    graph_csv_data.push(graph_csv_temp.slice(0, -1).split(','));

                    // limits total number of data points collected to prevent memory issues
                    if (graph_csv_data.length > 15000) {
                        graph_csv_data.shift();
                    }
                }

                graph_temp_string = '';
            } else {
                if (!graph_data_ready) {            // wait for a full set of data to
                    if (stream[k] === '\r') {       // come in before graphing, ends up
                        graph_data_ready = true;    // tossing the first point but prevents
                    }                               // garbage from mucking up the graph.
                } else {
                    // make sure it's a number, comma, CR, or LF
                    if ('-0123456789.,\r\n'.indexOf(stream[k]) > -1) {
                        graph_temp_string += stream[k];
                    }
                }
            }
        }
    }
}


/**
 * Reset the graphing system
 */
function graph_reset() {
    graph_temp_data.length = 0;
    graph_csv_data.length = 0;
    for (var k = 0; k < 10; k++) {
        graph_data.series[k] = [];
    }
    if (graph) {
        graph.update(graph_data, graph_options, true);
    }
    graph_temp_string = '';
    graph_timestamp_start = 0;
    graph_time_multiplier = 0;
    graph_timestamp_restart = 0;
    graph_data_ready = false;
}


/**
 * Draw graph
 *
 * @param setTo
 */
function graph_play(setTo) {
    if (document.getElementById('btn-graph-play')) {
        var play_state = document.getElementById('btn-graph-play').innerHTML;
        if (setTo !== 'play' && (play_state.indexOf('pause') > -1 || play_state.indexOf('<!--p') === -1)) {
            document.getElementById('btn-graph-play').innerHTML = '<!--play--><svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M4,3 L4,11 10,7 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
            if (!setTo) {
                graphStartStop('pause');
            }
        } else {
            document.getElementById('btn-graph-play').innerHTML = '<!--pause--><svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M5.5,2 L4,2 4,11 5.5,11 Z M8.5,2 L10,2 10,11 8.5,11 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
            if (!graph_interval_id && !setTo) {
                graphStartStop('play');
            }
        }
    }
}


/**
 * Save a graph to the local file system
 */
function downloadGraph() {
    utils.prompt("Download Graph Output - Filename:", 'Graph' + idProject, function (value) {
        if (value) {

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

            // TODO: The chartStyle contains 16 CSS errors. These need to be addressed.
            var svgGraph = document.getElementById('serial_graphing'),
                    pattern = new RegExp('xmlns="http://www.w3.org/2000/xmlns/"', 'g'),
                    findY = 'class="ct-label ct-horizontal ct-end"',
                    chartStyle = '<style>.ct-perfect-fourth:after,.ct-square:after{content:"";clear:both}.ct-label{fill:rgba(0,0,0,.4);color:rgba(0,0,0,.4);font-size:.75rem;line-height:1}.ct-grid-background,.ct-line{fill:none}.ct-chart-line .ct-label{display:block;display:-webkit-box;display:-moz-box;display:-ms-flexbox;display:-webkit-flex;display:flex}.ct-chart-donut .ct-label,.ct-chart-pie .ct-label{dominant-baseline:central}.ct-label.ct-horizontal.ct-start{-webkit-box-align:flex-end;-webkit-align-items:flex-end;-ms-flex-align:flex-end;align-items:flex-end;-webkit-box-pack:flex-start;-webkit-justify-content:flex-start;-ms-flex-pack:flex-start;justify-content:flex-start;text-align:left;text-anchor:start}.ct-label.ct-horizontal.ct-end{-webkit-box-align:flex-start;-webkit-align-items:flex-start;-ms-flex-align:flex-start;align-items:flex-start;-webkit-box-pack:flex-start;-webkit-justify-content:flex-start;-ms-flex-pack:flex-start;justify-content:flex-start;text-align:left;text-anchor:start}.ct-label.ct-vertical.ct-start{-webkit-box-align:flex-end;-webkit-align-items:flex-end;-ms-flex-align:flex-end;align-items:flex-end;-webkit-box-pack:flex-end;-webkit-justify-content:flex-end;-ms-flex-pack:flex-end;justify-content:flex-end;text-align:right;text-anchor:end}.ct-label.ct-vertical.ct-end{-webkit-box-align:flex-end;-webkit-align-items:flex-end;-ms-flex-align:flex-end;align-items:flex-end;-webkit-box-pack:flex-start;-webkit-justify-content:flex-start;-ms-flex-pack:flex-start;justify-content:flex-start;text-align:left;text-anchor:start}.ct-grid{stroke:rgba(0,0,0,.2);stroke-width:1px;stroke-dasharray:2px}.ct-point{stroke-width:10px;stroke-linecap:round}.ct-line{stroke-width:4px}.ct-area{stroke:none;fill-opacity:.1}.ct-series-a .ct-line,.ct-series-a .ct-point{stroke: #00f;}.ct-series-a .ct-area{fill:#d70206}.ct-series-b .ct-line,.ct-series-b .ct-point{stroke: #0bb;}.ct-series-b .ct-area{fill:#f05b4f}.ct-series-c .ct-line,.ct-series-c .ct-point{stroke: #0d0;}.ct-series-c .ct-area{fill:#f4c63d}.ct-series-d .ct-line,.ct-series-d .ct-point{stroke: #dd0;}.ct-series-d .ct-area{fill:#d17905}.ct-series-e .ct-line,.ct-series-e .ct-point{stroke-width: 1px;stroke: #f90;}.ct-series-e .ct-area{fill:#453d3f}.ct-series-f .ct-line,.ct-series-f .ct-point{stroke: #f00;}.ct-series-f .ct-area{fill:#59922b}.ct-series-g .ct-line,.ct-series-g .ct-point{stroke:#c0c}.ct-series-g .ct-area{fill:#0544d3}.ct-series-h .ct-line,.ct-series-h .ct-point{stroke:#000}.ct-series-h .ct-area{fill:#6b0392}.ct-series-i .ct-line,.ct-series-i .ct-point{stroke:#777}.ct-series-i .ct-area{fill:#f05b4f}.ct-square{display:block;position:relative;width:100%}.ct-square:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:100%}.ct-square:after{display:table}.ct-square>svg{display:block;position:absolute;top:0;left:0}.ct-perfect-fourth{display:block;position:relative;width:100%}.ct-perfect-fourth:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:75%}.ct-perfect-fourth:after{display:table}.ct-perfect-fourth>svg{display:block;position:absolute;top:0;left:0}.ct-line {stroke-width: 1px;}.ct-point {stroke-width: 2px;}text{font-family:sans-serif;}</style>',
                    svgxml = new XMLSerializer().serializeToString(svgGraph);

            svgxml = svgxml.replace(pattern, '');

            // TODO: Lint is complaining about the search values. Should they be enclosed in quotes?
            // No: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            svgxml = svgxml.replace(/foreignObject/g, 'text');
            svgxml = svgxml.replace(/([<|</])a[0-9]+:/g, '$1');
            svgxml = svgxml.replace(/xmlns: /g, '');
            svgxml = svgxml.replace(/span/g, 'tspan');
            svgxml = svgxml.replace(/x="10" /g, 'x="40" ');

            svgxml = svgxml.substring(svgxml.indexOf('<svg'), svgxml.length - 6);
            var foundY = svgxml.indexOf(findY);
            var theY = parseFloat(svgxml.substring(svgxml.indexOf(' y="', foundY + 20) + 4, svgxml.indexOf('"', svgxml.indexOf(' y="', foundY + 20) + 4)));
            var regY = new RegExp('y="' + theY + '"', 'g');
            svgxml = svgxml.replace(regY, 'y="' + (theY + 12) + '"');
            var breakpoint = svgxml.indexOf('>') + 1;
            svgxml = svgxml.substring(0, breakpoint) + chartStyle + svgxml.substring(breakpoint, svgxml.length);
            saveData(svgxml, value + '.svg');
        }
    });
}


/**
 * Download the graph as a csv file to the local file system
 */
function downloadCSV() {
    utils.prompt("Download Graph data as CSV - Filename:", 'graph_data' + idProject, function (value) {
        if (value) {

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
            var graph_csv_temp = graph_csv_data.join('\n');
            var idx1 = graph_csv_temp.indexOf('\n') + 1;
            var idx2 = graph_csv_temp.indexOf('\n', idx1 + 1);
            saveData(graph_csv_temp.substring(0, idx1) + graph_csv_temp.substring(idx2 + 1, graph_csv_temp.length - 1), value + '.csv');
        }
    });
}


/**
 *
 */
function graph_new_labels() {
    var graph_csv_temp = '';
    var labelsvg = '<svg width="60" height="300">';
    graph_csv_temp += '"time",';
    var labelClass = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
    var labelPre = ["","","","","","","","","","","","","",""];
    if (graph_options.graph_type === 'X') {
        labelClass = [1,1,2,2,3,3,4,4,5,5,6,6,7,7];
        labelPre = ["x: ","y: ","x: ","y: ","x: ","y: ","x: ","y: ","x: ","y: ","x: ","y: ","x: ","y: "];
    }
    for (var t = 0; t < graph_labels.length; t++) {
        labelsvg += '<g id="labelgroup' + (t + 1) + '" transform="translate(0,' + (t * 30 + 25) + ')">';
        labelsvg += '<rect x="0" y = "0" width="60" height="26" rx="3" ry="3" id="label' + (t + 1) + '" ';
        labelsvg += 'style="stroke:1px;stroke-color:blue;" class="ct-marker-' + labelClass[t] + '"/><rect x="3" y="12"';
        labelsvg += 'width="54" height="11" rx="3" ry="3" id="value' + (t + 1) + 'bkg" style="fill:rgba';
        labelsvg += '(255,255,255,.7);stroke:none;"/><text id="label' + (t + 1) + 'text" x="3" ';
        labelsvg += 'y="9" style="font-family:Arial;font-size: 9px;fill:#fff;font-weight:bold;">' + labelPre[t];
        labelsvg += graph_labels[t] + '</text><text id="gValue' + (t + 1) + '" x="5" y="21" style="align:right;';
        labelsvg += 'font-family:Arial;font-size: 10px;fill:#000;"></text></g>';
        graph_csv_temp += '"' + graph_labels[t].replace(/"/g, '_') + '",';
    }
    labelsvg += '</svg>';
    graph_csv_data.push(graph_csv_temp.slice(0, -1));
    $('#serial_graphing_labels').html(labelsvg);
}


/**
 *
 */
function graph_update_labels() {
    let row = graph_temp_data.length - 1;
    if (graph_temp_data[row]) {
        let col = graph_temp_data[row].length;
        for (let w = 2; w < col; w++) {
            let theLabel = document.getElementById('gValue' + (w - 1).toString(10));
            if (theLabel) {
                theLabel.textContent = graph_temp_data[row][w];
            }
        }
    }
}

// Display the application name
function showAppName() {
    let html = 'BlocklyProp<br><strong>Solo</strong>';
    $('#nav-logo').html(html);
}
