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
 * @type {{}}
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


/**
 *  Minimum client/launcher version supporting coded/verbose responses
 */
const minCodedVer = version_as_number('0.7.5');


/**
 * Switch the visible pane when a tab is clicked.
 *
 * @param {string} id ID of tab clicked.
 */
function renderContent(id) {
    // Select the active tab.
    const selectedTab = id.replace('tab_', '');
    const isPropcOnlyProject = (projectData.board === 'propcfile');

    let isDebug = window.getURLParameter('debug');
    if (!isDebug) {
        isDebug = false;
    }

    if (isPropcOnlyProject) {
        // Show PropC editing UI elements
        $('.propc-only').removeClass('hidden');        
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

            if ((isDebug) && codeXml.getValue().length > 40) {
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

            $('#btn-view-xml').css('display', 'none');
            $('#btn-view-blocks').css('display', (isPropcOnlyProject ? 'none' : 'inline-block'));
            $('#btn-view-propc').css('display', 'none');
            if (!isPropcOnlyProject) {
                let raw_c = prettyCode(Blockly.propc.workspaceToCode(Blockly.mainWorkspace));
                codePropC.setValue(raw_c);
                codePropC.gotoLine(0);
            } else {
                if (!codePropC || codePropC.getValue() === '') {
                    codePropC.setValue(atob((projectData.code.match(/<field name="CODE">(.*)<\/field>/) || ['', ''])[1] || ''));
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
    codePropC.setValue(prettyCode(codePropC.getValue()));
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
    // Prevent JS beautify from improperly formatting reference, dereference, and arrow operators
    raw_code = raw_code.replace(/\*([_a-zA-Z\()])/g, "___REFERENCE_OPERATOR___$1")
            .replace(/([_a-zA-Z\()])\*/g, "$1___REFERENCE_OPERATOR___")
            .replace(/&([_a-zA-Z\()])/g, "___DEREFERENCE_OPERATOR___$1")
            .replace(/->/g, '___ARROW_OPERATOR___');

    // run the beatufier
    raw_code = js_beautify(raw_code, {
        'brace_style': 'expand',
        'indent_size': 2
    });

    // restore the reference, dereference, and arrow operators
    raw_code = raw_code.replace(/,\n[\s\xA0]+/g, ", ")
            .replace(/___REFERENCE_OPERATOR___/g, '*')
            .replace(/___DEREFERENCE_OPERATOR___/g, '&')
            .replace(/___ARROW_OPERATOR___/g, '->')

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
    let code = EMPTY_PROJECT_CODE_HEADER;
    code += '<block type="propc_file" id="' + 
            generateBlockId(codePropC ? codePropC.getValue() : 'thequickbrownfoxjumpedoverthelazydog') + 
            '" x="100" y="100">';
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
    if (!codePropC) {
        codePropC = ace.edit("code-propc");
        codePropC.setTheme("ace/theme/chrome");
        codePropC.getSession().setMode("ace/mode/c_cpp");
        codePropC.getSession().setTabSize(2);
        codePropC.$blockScrolling = Infinity;
        codePropC.setReadOnly(true);

        // if the project is a propc code-only project, enable code editing.
        if (projectData.board === 'propcfile') {
            codePropC.setReadOnly(false);
        }
    }

    if (!codeXml && (window.getURLParameter('debug'))) {
        codeXml = ace.edit("code-xml");
        codeXml.setTheme("ace/theme/chrome");
        codeXml.getSession().setMode("ace/mode/xml");
        //codeXml.setReadOnly(true);
    }

    window.Blockly = blockly;

    // TODO: Use constant EMPTY_PROJECT_CODE_HEADER instead of string.
    //  Replace string length check with code that detects the first
    //  <block> xml element.
    if (projectData) {
        // Looking for the first <block> XML element
        const searchTerm = '<block';

        if (!projectData.code || projectData.code.indexOf(searchTerm) < 0) {
            projectData.code = EMPTY_PROJECT_CODE_HEADER + '</xml>';
        }
        if (projectData.board !== 'propcfile') {
            loadToolbox(projectData.code);
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
        utils.showMessage(Blockly.Msg.DIALOG_EMPTY_PROJECT, Blockly.Msg.DIALOG_CANNOT_COMPILE_EMPTY_PROJECT);
    } else {
        $("#compile-dialog-title").text(text);
        $("#compile-console").val('Compile... ');
        $('#compile-dialog').modal('show');

        let terminalNeeded = false;

        if (propcCode.indexOf("SERIAL_TERMINAL USED") > -1)
            terminalNeeded = 'term';
        else if (propcCode.indexOf("SERIAL_GRAPHING USED") > -1)
            terminalNeeded = 'graph';

        // Contact the container running cloud compiler. If the browser is
        // connected via https, direct the compile request to the same port and
        // let the load balancer direct the request to the compiler.
        // --------------------------------------------------------------------
        let postUrl;
        if (window.location.protocol === 'http:') {
            postUrl = 'http://' + window.location.hostname + ':5001/single/prop-c/' + action;
        }
        else {
            postUrl = 'https://' + window.location.hostname + ':443/single/prop-c/' + action;
        }

        $.ajax({
            'method': 'POST',
            'url': postUrl,
            'data': {"code": propcCode}
        }).done(function (data) {
            console.log(data);

            // Check for an error response from the compiler
            if (!data || data["compiler-error"] != "") {
                // Get message as a string, or blank if undefined
                let message = (typeof data["compiler-error"] === "string") ? data["compiler-error"] : "";
                // Display the result in the compile console modal <div>
                $("#compile-console").val($("#compile-console").val() + data['compiler-output'] + data['compiler-error'] + loadWaitMsg);
            } else {
                var loadWaitMsg = (action !== 'compile') ? '\nDownload...' : '';

                $("#compile-console").val($("#compile-console").val() + data['compiler-output'] + data['compiler-error'] + loadWaitMsg);
                if (data.success && successHandler) {
                    successHandler(data, terminalNeeded);
                }

                // Scroll automatically to the bottom after new data is added
                document.getElementById("compile-console").scrollTop = document.getElementById("compile-console").scrollHeight;
            }
        }).fail(function (data) {
            // Data appears to be an HTTP response object
            if (data) {
                let message = "A compiler server error '" + data.status + "' has been detected.";
                $("#compile-console").val($("#compile-console").val() + message);
            }
        });
    }
}


/**
 * Stub function to the cloudCompile function
 */
function compile() {
    cloudCompile('Compile', 'compile');
}


/**
 * return the addres for the cloud compiler
 * @returns {string}
 */
function getCompilerUrl(action) {
    // Prepare a url for the local Docker environment
    if (window.location.hostname === 'localhost') {
        return window.location.protocol + '//localhost:5001/single/prop-c/' + action;
    }

    // Direct compilation to the cloud compiler service
    return  window.location.protocol + '//' + window.location.hostname + 'compile/single/prop-c/' + action;
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
                // Prep for new download messages
                launcher_result = "";
                launcher_download = false;
                var prog_to_send = {
                    type: 'load-prop',
                    action: load_action,
                    payload: data.binary,
                    debug: (terminalNeeded === 'term' || terminalNeeded === 'graph') ? terminalNeeded : 'none',
                    extension: data.extension,
                    portPath: getComPort()
                };

                client_ws_connection.send(JSON.stringify(prog_to_send));

            } else {

                if (client_version >= minCodedVer) {
                    //Request load with options from BlocklyProp Client
                    $.post("http://" + client_domain_name + ":" + client_domain_port + "/load.action", {
                        option: load_option,
                        action: load_action,
                        binary: data.binary,
                        extension: data.extension,
                        "comport": getComPort()
                    }, function (loaddata) {
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
                    //TODO: Remove this once client_min_version is >= minCodedVer
                    //Request load without options from old BlocklyProp Client
                    $.post("http://" + client_domain_name + ":" + client_domain_port + "/load.action", {
                        action: load_action,
                        binary: data.binary,
                        extension: data.extension,
                        "comport": getComPort()
                    }, function (loaddata) {
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
        utils.showMessage(Blockly.Msg.DIALOG_NO_DEVICE, Blockly.Msg.DIALOG_NO_DEVICE_TEXT);
    } else {
        utils.showMessage(Blockly.Msg.DIALOG_DEVICE_COMM_ERROR, Blockly.Msg.DIALOG_DEVICE_COMM_ERROR_TEXT);
    }
}


/**
 * Serial console support
 */
function serial_console() {
    var newTerminal = false;

    // HTTP client
    if (client_use_type !== 'ws') {
        if (term === null) {
            term = {
                portPath: getComPort()
            };
            newTerminal = true;
        }

        if (ports_available) {
            var url = "http://" + client_domain_name + ":" + client_domain_port + "/serial.connect";
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
                // incoming data is base64 encoded
                var c_buf = atob(e.data);
                if (connStrYet) {
                    pTerm.display(c_buf);
                } else {
                    connString += c_buf;
                    if (connString.indexOf(baudrate.toString(10)) > -1) {
                        connStrYet = true;
                        displayTerminalConnectionStatus(connString.trim());
                    } else {
                        pTerm.display(e.data);
                    }
                }
                $('#serial_console').focus();
            };

            if (!newTerminal) {
                pTerm.display(null);
            }

            $('#console-dialog').on('hidden.bs.modal', function () {
                active_connection = null;
                connString = '';
                connStrYet = false;
                connection.close();
                displayTerminalConnectionStatus(null);
                pTerm.display(null);
                term = null;
            });
        } else {
            active_connection = 'simulated';

            if (newTerminal) {
                displayTerminalConnectionStatus(Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES_TO_CONNECT);
                pTerm.display(Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES + '\n');
            }

            $('#console-dialog').on('hidden.bs.modal', function () {
                active_connection = null;
                pTerm.display(null);
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
        displayTerminalConnectionStatus([
            Blockly.Msg.DIALOG_TERMINAL_CONNECTION_ESTABLISHED,
            msg_to_send.portPath,
            Blockly.Msg.DIALOG_TERMINAL_AT_BAUDRATE,
            msg_to_send.baudrate
        ].join[' ']);
        client_ws_connection.send(JSON.stringify(msg_to_send));

        $('#console-dialog').on('hidden.bs.modal', function () {
            if (msg_to_send.action !== 'close') { // because this is getting called multiple times...?
                msg_to_send.action = 'close';
                displayTerminalConnectionStatus(null);
                active_connection = null;
                client_ws_connection.send(JSON.stringify(msg_to_send));
            }
            pTerm.display(null);
        });
    }

    $('#console-dialog').modal('show');
}

/**
 * Display information about the serial connection to the device
 * @param {string} connectionInfo text to display above the console or graph
 */
function displayTerminalConnectionStatus(connectionInfo) {
    if (!connectionInfo) {
        connectionInfo = '';
    }
    $('.connection-string').html(connectionInfo);
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
            if (window.getURLParameter('debug')) console.log(graph_options);
        } else {
            graph.update(graph_data, graph_options);
        }

        if (client_use_type !== 'ws' && ports_available) {
            var connection = new WebSocket("ws://" + client_domain_name + ":" + client_domain_port + "/serial.connect");

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
                var c_buf = atob(e.data);
                if (connStrYet) {
                    graph_new_data(c_buf);
                } else {
                    connString += c_buf;
                    if (connString.indexOf(baudrate.toString(10)) > -1) {
                        connStrYet = true;
                        // send remainder of string to terminal???  Haven't seen any leak through yet...
                        $('.connection_string').html(connString.trim());
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
                $('.connection-string').html('');
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

            if (msg_to_send.portPath !== 'none') {
                displayTerminalConnectionStatus([
                    Blockly.Msg.DIALOG_TERMINAL_CONNECTION_ESTABLISHED,
                    msg_to_send.portPath,
                    Blockly.Msg.DIALOG_TERMINAL_AT_BAUDRATE,
                    msg_to_send.baudrate
                ].join(' '));
            } else {
                displayTerminalConnectionStatus(Blockly.Msg.DIALOG_GRAPH_NO_DEVICES_TO_CONNECT);
            }

            client_ws_connection.send(JSON.stringify(msg_to_send));

            if (!graph_interval_id) {
                graphStartStop('start');
            }

            $('#graphing-dialog').on('hidden.bs.modal', function () {
                graphStartStop('stop');
                if (msg_to_send.action !== 'close') { // because this is getting called multiple times.... ?
                    msg_to_send.action = 'close';
                    $('.connection-string').html('');
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
        utils.showMessage(Blockly.Msg.DIALOG_MISSING_BLOCKS, Blockly.Msg.DIALOG_MISSING_BLOCKS_GRAPHING);
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
 * Update the list of serial ports available on the host machine
 */
var check_com_ports = function () {
    // TODO: We need to evaluate this when using web sockets ('ws') === true
    if (client_use_type !== 'ws') {
        if (client_domain_name && client_domain_port) {
            $.get("http://" + client_domain_name + ":" + client_domain_port + "ports.json", function (data) {
                set_port_list(data);
            }).fail(function () {
                set_port_list();
            });
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
        // The project is empty, so warn and exit.
        utils.showMessage(Blockly.Msg.DIALOG_EMPTY_PROJECT, Blockly.Msg.DIALOG_CANNOT_SAVE_EMPTY_PROJECT);
        return;
    } else {
        // Make sure the filename doesn't have any illegal characters
        value = sanitizeFilename(projectData.name);

        var sideFileContent = ".c\n>compiler=C\n>memtype=cmm main ram compact\n";
        sideFileContent += ">optimize=-Os\n>-m32bit-doubles\n>-fno-exceptions\n>defs::-std=c99\n";
        sideFileContent += ">-lm\n>BOARD::ACTIVITYBOARD";

        var fileCblob = new Blob([propcCode], {type: 'text/plain'});
        var fileSIDEblob = new Blob([value + sideFileContent], {type: 'text/plain'});
        
        var zip = new JSZip();
        var sideFolder = zip.folder(value);
        sideFolder.file(value + ".c", fileCblob);
        sideFolder.file(value + ".side", fileSIDEblob);

        sideFolder.generateAsync({type:"blob"}).then(function (blob) { // 1) generate the zip file
            saveAs(blob, value + ".zip");                                 // 2) trigger the download
        }, function (err) {
            utils.showMessage(Blockly.Msg.DIALOG_ERROR, Blockly.Msg.DIALOG_SIDE_FILES_ERROR + err);
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
        $(".connection-string").html(stream);

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
                        for (j = 2; j < graph_temp_data[row].length; j++) {
                            graph_csv_temp += graph_temp_data[row][j] + ',';
                            graph_data.series[j - 2].push({
                                x: graph_temp_data[row][0],
                                y: graph_temp_data[row][j] || null
                            });
                            $('.ct_line').css('stroke-width', '2.5px');  // TODO: if this slows performance too much - explore changing the stylesheet (https://stackoverflow.com/questions/50036922/change-a-css-stylesheets-selectors-properties/50036923#50036923)
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
    utils.prompt(Blockly.Msg.DIALOG_DOWNLOAD_GRAPH_DIALOG, 'BlocklyProp_Graph', function (value) {
        if (value) {
            // Make sure filename is safe
            value = sanitizeFilename(value);
                
            var svgGraph = document.getElementById('serial_graphing');
            var pattern = new RegExp('xmlns="http://www.w3.org/2000/xmlns/"', 'g');
            var findY = 'class="ct-label ct-horizontal ct-end"';
            var chartStyle = '<style>.ct-grid-background,.ct-line{fill:none}.ct-point{stroke-width:10px;stroke-linecap:round}.ct-grid{stroke:rgba(0,0,0,.2);stroke-width:1px;stroke-dasharray:2px}.ct-area{stroke:none;fill-opacity:.1}.ct-line{stroke-width:1px}.ct-point{stroke-width:5px}.ct-series-a{stroke:#00f}.ct-series-b{stroke:#0bb}.ct-series-c{stroke:#0d0}.ct-series-d{stroke:#dd0}.ct-series-e{stroke:#f90}.ct-series-f{stroke:red}.ct-series-g{stroke:#d09}.ct-series-h{stroke:#90d}.ct-series-i{stroke:#777}.ct-series-j{stroke:#000}text{font-family:sans-serif;fill:rgba(0,0,0,.4);color:rgba(0,0,0,.4);font-size:.75rem;line-height:1;overflow:visible}</style>';
            var svgxml = new XMLSerializer().serializeToString(svgGraph);

            svgxml = svgxml.replace(pattern, '');
            svgxml = svgxml.replace(/foreignObject/g, 'text');
            svgxml = svgxml.replace(/([<|</])a[0-9]+:/g, '$1');
            svgxml = svgxml.replace(/xmlns: /g, '');
            svgxml = svgxml.replace(/x="10" /g, 'x="40" ');

            svgxml = svgxml.substring(svgxml.indexOf('<svg'), svgxml.length - 6);
            var foundY = svgxml.indexOf(findY);
            var theY = parseFloat(svgxml.substring(svgxml.indexOf(' y="', foundY + 20) + 4, svgxml.indexOf('"', svgxml.indexOf(' y="', foundY + 20) + 4)));
            var regY = new RegExp('y="' + theY + '"', 'g');
            svgxml = svgxml.replace(regY, 'y="' + (theY + 12) + '"');
            var breakpoint = svgxml.indexOf('>') + 1;
            svgxml = svgxml.substring(0, breakpoint) + chartStyle + svgxml.substring(breakpoint, svgxml.length);
            svgxml = svgxml.replace(/<text style="overflow: visible;" ([xy])="([0-9.-]+)" ([xy])="([0-9.-]+)" [a-z]+="[0-9.]+" [a-z]+="[0-9.]+"><span[0-9a-zA-Z =.":;/-]+>([0-9.-]+)<\/span>/g, '<text $1="$2" $3="$4">$5');

            var blob = new Blob([svgxml], {type: 'image/svg+xml'});
            saveAs(blob, value + '.svg');
        }
    });
}


/**
 * Download the graph as a csv file to the local file system
 */
function downloadCSV() {
    utils.prompt(Blockly.Msg.DIALOG_DOWNLOAD_DATA_DIALOG, 'BlocklyProp_Data', function (value) {
        if (value) {
            // Make sure filename is safe
            value = sanitizeFilename(value);

            var graph_csv_temp = graph_csv_data.join('\n');
            var idx1 = graph_csv_temp.indexOf('\n') + 1;
            var idx2 = graph_csv_temp.indexOf('\n', idx1 + 1);
            var blob = new Blob([graph_csv_temp.substring(0, idx1) + graph_csv_temp.substring(idx2 + 1, graph_csv_temp.length - 1)], {type: 'text/csv'});
            saveAs(blob, value + '.csv');
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
    var labelClass = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    var labelPre = ["", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    if (graph_options.graph_type === 'X') {
        labelClass = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
        labelPre = ["x: ", "y: ", "x: ", "y: ", "x: ", "y: ", "x: ", "y: ", "x: ", "y: ", "x: ", "y: ", "x: ", "y: "];
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
