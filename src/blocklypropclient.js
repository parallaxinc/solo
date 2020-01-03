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


// Annotations to help the closure compiler to be even more efficient.
// https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler

var clientService = {
    available: false,
    portsAvailable: false,
    path: 'localhost',
    port: 6009,
    type: null,
    rxBase64: true,
    activeConnection: null,
    url: function (protocol) {
        return protocol + '://' + this.path + ':' + this.port + '/';
    },
    version: {
        minimumAllowed: '0.7.0',
        recommended: '0.11.0',
        current: '0.0.0',
        codedMinimum: '0.7.5',  // Minimum client/launcher version supporting coded/verbose responses (remove after minimumAllowed > this)
        currentAsNumber: 0,
        isValid: false,
        isRecommended: false,
        isCoded: false,
        getNumeric: function (rawVersion) {
            var tempVersion = rawVersion.toString().split(".");
            tempVersion.push('0');
        
            if (tempVersion.length < 3) {
                if (tempVersion.length === 1)
                    tempVersion = '0.0.0';
                else
                    tempVersion.unshift('0');
            }
        
            // Allow for any of the three numbers to be between 0 and 1023.
            // Equivalent to: (Major * 104856) + (Minor * 1024) + Revision.
            return (Number(tempVersion[0]) << 20 | Number(tempVersion[1]) << 10 | Number(tempVersion[2]));
        },
        set: function (rawVersion) {
            this.current = rawVersion;
            this.currentAsNumber = this.getNumeric(rawVersion);
            this.isValid = (this.getNumeric(rawVersion) >= this.getNumeric(this.minimumAllowed));
            this.isRecommended = (this.getNumeric(rawVersion) >= this.getNumeric(this.recommended));
            this.isCoded = (this.getNumeric(rawVersion) >= this.getNumeric(this.codedMinimum));   // remove after minimumAllowed is greater
        }
    }
}



// TODO: Uninitialized variable
// TODO: Document what the 'client_ws_heatbeat' variable represents
/**
 *
 */
var client_ws_heartbeat;



var client_ws_heartbeat_interval = null;

var check_com_ports_interval = null;
var check_ws_socket_timeout = null;

// BP Launcher result log and download message flag
var launcher_result = "";
var launcher_download = false;

// Status Notice IDs
//const NS_DOWNLOADING               = 002;
//const NS_DOWNLOAD_SUCCESSFUL       = 005;
const NS_DOWNLOADING                 = 2;
const NS_DOWNLOAD_SUCCESSFUL         = 5;

// Error Notice IDs
const NE_DOWNLOAD_FAILED             = 102;


$(document).ready(function () {
    find_client();
});

var find_client = function () {
    if (check_ws_socket_timeout) {
        //Clear timeout if it exists; without this, back-to-back find_client() calls seem to occur
        clearTimeout(check_ws_socket_timeout);
    }

    establish_socket();

    if (clientService.type !== 'ws') {
        // WebSocket'd launcher not found?  Try Http'd client
        check_client();
    }
};

var set_ui_buttons = function (ui_btn_state) {
    if (ui_btn_state === 'available') {
        if (projectData && projectData.board === 's3') {
            // Hide the buttons that are not required for the S3 robot
            $('#prop-btn-ram').addClass('hidden');
            $('#prop-btn-graph').addClass('hidden');
            $('#client-available').addClass('hidden');
            // Reveal the short client available message
            $('#client-available-short').removeClass('hidden');
        } else {
            // Reveal these buttons
            $('#prop-btn-ram').removeClass('hidden');
            $('#prop-btn-graph').removeClass('hidden');
            $('#client-available').removeClass('hidden');
            $('#client-available-short').addClass('hidden');
        }

        $("#client-searching").addClass("hidden");
        $("#client-unavailable").addClass("hidden");
        $("#prop-btn-ram").removeClass("disabled");
        $("#prop-btn-eeprom").removeClass("disabled");
        $("#prop-btn-term").removeClass("disabled");
        $("#prop-btn-graph").removeClass("disabled");
    } else {
        // Disable the toolbar buttons
        $("#client-available").addClass("hidden");
        $("#client-available-short").addClass("hidden");
        $("#prop-btn-ram").addClass("disabled");
        $("#prop-btn-eeprom").addClass("disabled");
        $("#prop-btn-term").addClass("disabled");
        $("#prop-btn-graph").addClass("disabled");

        if (ui_btn_state === 'searching') {
            $("#client-searching").removeClass("hidden");
            $("#client-unavailable").addClass("hidden");
        } else {
            $("#client-searching").addClass("hidden");
            $("#client-unavailable").removeClass("hidden");
        }
    }
};

/**
 * @function checkClientVersionModal Displays a modal with information 
 * about the client version if the one being used is outdated.
 * If the version is below the recommended version, the user is 
 * warned, and versions below the minimum are alerted. 
 */
function checkClientVersionModal() {
    if (!clientService.version.isRecommended) {
        $('.bpc-version').addClass('hidden');

        if (clientService.version.currentAsNumber === 0) {
            $("#client-unknown-span").removeClass("hidden");
        } else if (clientService.version.isValid) {
            $("#client-warning-span").removeClass("hidden");
        } else {
            $("#client-danger-span").removeClass("hidden");     
        }

        $(".client-required-version").html(clientService.version.recommended);
        if (clientService.version.currentAsNumber === 0) {
            $(".client-your-version").html('<b>UNKNOWN</b>')
        } else {
            $(".client-your-version").html(clientService.version.current);
        }
        $('#client-version-modal').modal('show');
    }
}

/**
 * This attempts to connect to an http client (BP-Client) only after
 * an attempted connection to the BP-Launcher has failed.
 * If both attempts have failed, it sets the client availablility to null
 * and sets an interval to continue checking for a client.
 */
var check_client = function () {
    $.get(clientService.url('http'), function (data) {
        if (!clientService.available) {
            let client_version_str = (typeof data.version_str !== "undefined") ? data.version_str : data.version;
            if (!data.server || data.server !== 'BlocklyPropHTTP') {
                client_version_str = '0.0.0';
            }

            clientService.version.set(client_version_str);

            checkClientVersionModal(client_version_str);

            clientService.type = 'http';
            clientService.available = true;
            set_ui_buttons('available');
            if (check_com_ports && typeof (check_com_ports) === "function") {
                check_com_ports();
                check_com_ports_interval = setInterval(check_com_ports, 5000);
            }
        }
        setTimeout(check_client, 20000);

    }).fail(function () {
        clearInterval(check_com_ports_interval);
        clientService.type = null;
        clientService.available = false;
        clientService.portsAvailable = false;
        set_ui_buttons('unavailable');
        check_ws_socket_timeout = setTimeout(find_client, 3000);
    });
};

var connection_heartbeat = function () {
    // Check the last time the port list was received.
    // If it's been too long, close the connection.
    if (clientService.type === 'ws') {
        var d = new Date();
        if (client_ws_heartbeat + 12000 < d.getTime()) {
            console.log("Lost client websocket connection");
            // Client is taking too long to check in - close the connection and clean up
            clientService.activeConnection.close();
            lostWSConnection();
        }
    }
};

/**
 * @deprecated - This function will become obsolete when the
 * BlocklyProp Client is deprecated and removed from service.
 */
var configure_client = function () {
    // All of this code is building the UI for the Configure
    // BlocklyProp Client dialog.
    let url_input = $("<form/>", {
        class: "form-inline"
    });

    // This is hard-coding the HTTP protocol for the BlocklyProp Client
    $("<span/>", {
        class: "space_right"
    }).text("http://").appendTo(url_input);

    // Add the form group to the DOM for the input field defined next
    let domain_name_group = $("<div/>", {
        class: "form-group"
    }).appendTo(url_input);

    // Default the domain input box
    $("<input/>", {
        id: "domain_name",
        type: "text",
        class: "form-control",
        value: clientService.path
    }).appendTo(domain_name_group);

    // Hard code the ':' between the domain name and port input fields
    $("<span/>", {
        class: "space_left space_right"
    }).text(":").appendTo(url_input);

    // Add the form group to the DOM for the next input field
    let domain_port_group = $("<div/>", {
        class: "form-group"
    }).appendTo(url_input);

    // Get the port number
    $("<input/>", {
        id: "port_number",
        type: "number",
        class: "form-control",
        value: clientService.port
    }).appendTo(domain_port_group);

    // Show the modal dialog
    utils.confirm(Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER_CONFIGURE_TITLE, url_input, function (action) {
        if (action) {
            clientService.path = $("#domain_name").val();
            clientService.port = $("#port_number").val();
        }
    }, Blockly.Msg.DIALOG_SAVE_TITLE);
};

// checks for and, if found, uses a newer WebSockets-only client
function establish_socket() {

    // TODO: set/clear and load buttons based on status
    if (!clientService.available) {

        // Clear the port list
        set_port_list();

        var connection = new WebSocket(clientService.url('ws'));

        connection.onopen = function () {

            if (clientService.activeConnection !== null) {
                clientService.activeConnection.close();
            }

            var ws_msg = {type: 'hello-browser', baud: baudrate};
            clientService.activeConnection = connection;
            connection.send(JSON.stringify(ws_msg));
        };

        // Log errors
        connection.onerror = function (error) {
            // Only display a message on the first attempt
            if (!clientService.type && !check_ws_socket_timeout) {
                console.log('Unable to find websocket client');
            } else {
                console.log('Websocket Communication Error');
            }
        };

        // handle messages from the client
        connection.onmessage = function (e) {
            var ws_msg = JSON.parse(e.data);

            // --- hello handshake - establish new connection
            if (ws_msg.type === 'hello-client') {
                // type: 'hello-client',
                // version: [String version (semantic versioning)]
                // rxBase64: [boolean, accepts base64-encoded serial comms (all versions transmit base64)]

                clientService.rxBase64 = (ws_msg.rxBase64 || false);

                if (window.getURLParameter('debug')) {
                    console.log("Websocket client/launcher found - version " + ws_msg.version);
                }

                // update the clientService version info, then display a modal if necessary
                clientService.version.set(ws_msg.version)
                checkClientVersionModal();

                clientService.type = 'ws';
                clientService.available = true;

                set_ui_buttons('available');

                var portRequestMsg = JSON.stringify({type: 'port-list-request', msg: 'port-list-request'});
                connection.send(portRequestMsg);

            }

            // --- com port list/change
            else if (ws_msg.type === 'port-list') {
                // type: 'port-list',
                // ports: ['port1', 'port2', 'port3'...]

                // mark the time that this was received
                var d = new Date();
                client_ws_heartbeat = d.getTime();

                if (!client_ws_heartbeat_interval) {
                    client_ws_heartbeat_interval = setInterval(connection_heartbeat, 4000);
                }

                set_port_list(ws_msg.ports);
            }

            // --- serial terminal/graph
            else if (ws_msg.type === 'serial-terminal' &&
                    (typeof ws_msg.msg === 'string' || ws_msg.msg instanceof String)) {
                // sometimes some weird stuff comes through...
                // type: 'serial-terminal'
                // msg: [String Base64-encoded message]

                console.log(ws_msg);
                var msg_in = '';
                try {
                    msg_in = atob(ws_msg.msg);
                } catch (error) {
                    console.log(error);
                    msg_in = ws_msg.msg;
                }

                if (term !== null) { // is the terminal open?
                    pTerm.display(msg_in);
                    pTerm.focus();
                } else if (graph !== null) { // is the graph open?
                    graph_new_data(msg_in);
                }
            }

            // --- UI Commands coming from the client
            else if (ws_msg.type === 'ui-command') {
                // type: 'ui-command',
                // action: ['open-terminal','open-graph','close-terminal','close-graph','close-compile','clear-compile','message-compile','alert']
                // msg: [String message]

                if (ws_msg.action === 'open-terminal') {
                    serial_console();

                } else if (ws_msg.action === 'open-graph') {
                    graphing_console();

                } else if (ws_msg.action === 'close-terminal') {
                    $('#console-dialog').modal('hide');
                    newTerminal = false;
                    pTerm.display(null);

                } else if (ws_msg.action === 'close-graph') {
                    $('#graphing-dialog').modal('hide');
                    graph_reset();

                } else if (ws_msg.action === 'clear-compile') {
                    $('#compile-console').val('');

                } else if (ws_msg.action === 'message-compile') {
                    //Messages are coded; check codes, log all and filter out NS_DOWNLOADING duplicates
                    var msg = ws_msg.msg.split("-");
                    if (msg[0] != NS_DOWNLOADING || !launcher_download) {
                        launcher_result = launcher_result + msg[1] + "\n";
                        launcher_download |= (msg[0] == NS_DOWNLOADING);
                    }
                    if (msg[0] == NS_DOWNLOAD_SUCCESSFUL) {
                        //Success! Keep it simple
                        $('#compile-console').val($('#compile-console').val() + ' Succeeded.');
                    } else if (msg[0] == NE_DOWNLOAD_FAILED) {
                        //Failed! Show the details
                        $('#compile-console').val($('#compile-console').val() + ' Failed!\n\n-------- loader messages --------\n' + launcher_result);
                    } else {
                        //Show progress during downloading
                        $('#compile-console').val($('#compile-console').val() + ".");
                    }

                    // Scoll automatically to the bottom after new data is added
                    var compileConsoleObj = document.getElementById("compile-console");
                    compileConsoleObj.scrollTop = compileConsoleObj.scrollHeight;

                } else if (ws_msg.action === 'close-compile') {
                    $('#compile-dialog').modal('hide');
                    $('#compile-console').val('');

                } else if (ws_msg.action === 'console-log') {
                    console.log(ws_msg.msg);

                } else if (ws_msg.action === 'websocket-close') {
                    clientService.activeConnection.close();

                } else if (ws_msg.action === 'alert') {
                    utils.showMessage(Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER, ws_msg.msg);
                }
            }

            // --- older client - disconnect it?
            else {
                console.log('Unknown WS msg: ' + JSON.stringify(ws_msg));
            }
        };

        connection.onclose = function (code) {
            console.log(code);
            lostWSConnection();
        };
    }
}

function lostWSConnection() {
// Lost websocket connection, clean up and restart find_client processing
    clientService.activeConnection = null;
    clientService.type = null;
    clientService.available = false;
    clientService.portsAvailable = false;

    set_ui_buttons('unavailable');
    term = null;
    newTerminal = false;

    // Clear ports list
    set_port_list();

    if (client_ws_heartbeat_interval) {
        clearInterval(client_ws_heartbeat_interval);
        client_ws_heartbeat_interval = null;
    }

    //Create new ws socket timeout (find_client)
    check_ws_socket_timeout = setTimeout(find_client, 3000);
};


// set communication port list
// leave data unspecified when searching
var set_port_list = function (data) {
    data = (data ? data : 'searching');
    var selected_port = clearComPortUI();

    if (typeof (data) === 'object' && data.length) {
        data.forEach(function (port) {
            addComPortDeviceOption(port);
        });
        clientService.portsAvailable = true;
    } else {
        addComPortDeviceOption((data === 'searching') ? 'Searching...' : 'No devices found');
        clientService.portsAvailable = false;
    }
    select_com_port(selected_port);
};


/**
 *  Clear the com port drop-down
 *
 * @returns {string | jQuery} the currently selected value in the drop-down
 * before the element is cleared.
 */
function clearComPortUI() {
    let portUI = $("#comPort");
    if (portUI) {
        try {
            let port = portUI.val();
            portUI.empty();
            return port;
        }
        catch (e){
            if (e) {
                console.log("Error: " + e.message);
            }
        }
    }

    portUI.empty();
    return null;
}


/**
 *  Add a device port to the Com Port drop-down list
 *
 * @param port
 */
function addComPortDeviceOption(port) {
    if (typeof(port) === 'string') {
        $("#comPort").append($('<option>', { text: port }));
    }
}
