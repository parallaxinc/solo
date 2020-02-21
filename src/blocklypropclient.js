
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

/**
 * Client_available flags whether BP Client/Launcher is found
 *
 * @type {boolean}
 */
var client_available = false;


/**
 * Ports_available flags whether one or more communication ports are available
 *
 * @type {boolean}
 */
var ports_available = false;


/**
 * The version number the BlocklyProp Client reported
 *
 * @type {number}
 */
var client_version = 0;


// TODO: Verify that this variable is a host name and not a domain name
/**
 * Client host name
 *
 * @type {string}
 */
var client_domain_name = "localhost";


/**
 * Port number component of the BlocklyProp Client interface
 *
 * @type {number}
 */
var client_domain_port = 6009;


/**
 * The minimum version of the BlocklyProp Client that can be used with this interface
 *
 * @type {string}
 */
var client_min_version = "0.7.0";


/**
 * The most recent version of the BlocklyPro Client that can be used with this interface
 *
 * @type {string}
 */
var client_recommended_version = "0.8.0";


// TODO: Document what the 'client_use_type' variable represents
/**
 * Not sure what this does
 *
 * @type {string}
 */
var client_use_type = 'none';


// TODO: Document what the 'client_ws_connection' variable represents
/**
 * Not sure what this does
 *
 * @type {null}
 */
var client_ws_connection = null;


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
//const nsDownloading                = 002;
//const nsDownloadSuccessful         = 005;
const nsDownloading                = 2;
const nsDownloadSuccessful         = 5;


// Error Notice IDs
const neDownloadFailed             = 102;


$(document).ready(function () {
    find_client();
});

var find_client = function () {
    if (check_ws_socket_timeout) {
        //Clear timeout if it exists; without this, back-to-back find_client() calls seem to occur
        clearTimeout(check_ws_socket_timeout);
    }

    establish_socket();
    if (client_use_type !== 'ws') {
        // WebSocket'd launcher not found?  Try Http'd client
        check_client();
    }
};

var version_as_number = function (rawVersion) {
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
};

var setPropToolbarButtons = function (ui_btn_state) {
    if (ui_btn_state === 'available') {
        if (projectData && projectData.board === 's3') {
            // Hide the buttons that are not required for the S3 robot
            $('.no-s3').addClass('hidden');
            $('#client-available').addClass('hidden');
            // Reveal the short client available message
            $('#client-available-short').removeClass('hidden');
        } else {
            // Reveal these buttons
            $('.no-s3').removeClass('hidden');
            $('#client-available').removeClass('hidden');
            $('#client-available-short').addClass('hidden');
        }

        $("#client-unavailable").addClass("hidden");
        $(".client-action").removeClass("disabled");
    } else {
        // Disable the toolbar buttons
        $("#client-unavailable").removeClass("hidden");
        $("#client-available").addClass("hidden");
        $("#client-available-short").addClass("hidden");
        $(".client-action").addClass("disabled");
    }
};

/**
 * @function checkClientVersionModal Evaluates the client version based on the string it reports its version with.
 * If the version is below the recommended version, the user is warned, and versions below the minimum are alerted. 
 * @param {string} clientVersionString string representing the client version in '0.0.0' format (Semantic versioning)
 */
function checkClientVersionModal(clientVersionString) {
    let clientVersion = version_as_number(clientVersionString);
    if (clientVersion < version_as_number(client_recommended_version)) {
        $('.bpc-version').addClass('hidden');

        if (clientVersion === 0) {
            $("#client-unknown-span").removeClass("hidden");
        } else if (clientVersion >= version_as_number(client_min_version)) {
            $("#client-warning-span").removeClass("hidden");
        } else {
            $("#client-danger-span").removeClass("hidden");     
        }

        $(".client-required-version").html(client_recommended_version);
        $(".client-your-version").html(clientVersion > 0 ? clientVersionString : '<b>UNKNOWN</b>');
        $('#client-version-modal').modal('show');
    }
}

/**
 * This is evaluating the BlocklyProp Client or BlocklyProp Launcher version??
 */
var check_client = function () {
    $.get("http://" + client_domain_name + ":" + client_domain_port + "/", function (data) {
        if (!client_available) {
            let client_version_str = (typeof data.version_str !== "undefined") ? data.version_str : data.version;
            if (!data.server || data.server !== 'BlocklyPropHTTP') {
                client_version_str = '0.0.0';
            }

            checkClientVersionModal(client_version_str);

            client_use_type = 'http';
            client_available = true;
            setPropToolbarButtons('available');
            if (check_com_ports && typeof (check_com_ports) === "function") {
                check_com_ports();
                check_com_ports_interval = setInterval(check_com_ports, 5000);
            }
        }
        setTimeout(check_client, 20000);

    }).fail(function () {
        clearInterval(check_com_ports_interval);
        client_use_type = 'none';
        client_available = false;
        ports_available = false;
        setPropToolbarButtons('unavailable');
        check_ws_socket_timeout = setTimeout(find_client, 3000);
    });
};

var connection_heartbeat = function () {
    // Check the last time the port list was received.
    // If it's been too long, close the connection.
    if (client_use_type === 'ws') {
        var d = new Date();
        if (client_ws_heartbeat + 12000 < d.getTime()) {
            console.log("Lost client websocket connection");
            // Client is taking too long to check in - close the connection and clean up
            client_ws_connection.close();
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
        value: client_domain_name
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
        value: client_domain_port
    }).appendTo(domain_port_group);

    // Show the modal dialog
    utils.confirm(Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER_CONFIGURE_TITLE, url_input, function (action) {
        if (action) {
            client_domain_name = $("#domain_name").val();
            client_domain_port = $("#port_number").val();
        }
    }, Blockly.Msg.DIALOG_SAVE_TITLE);
};

// checks for and, if found, uses a newer WebSockets-only client
function establish_socket() {

    // TODO: set/clear and load buttons based on status
    if (!client_available) {

        // Clear the port list
        set_port_list();

        var url = "ws://" + client_domain_name + ":" + client_domain_port + "/";
        var connection = new WebSocket(url);

        connection.onopen = function () {

            if (client_ws_connection !== null) {
                client_ws_connection.close();
            }

            var ws_msg = {type: 'hello-browser', baud: baudrate};
            client_ws_connection = connection;
            connection.send(JSON.stringify(ws_msg));
        };

        // Log errors
        connection.onerror = function (error) {
            // Only display a message on the first attempt
            if (client_use_type !== 'ws' && !check_ws_socket_timeout) {
                console.log('Unable to find websocket client');
            } else {
                console.log('Websocket Communication Error');
                console.log(error);
            }
        };

        // handle messages from the client
        connection.onmessage = function (e) {
            var ws_msg = JSON.parse(e.data);

            // --- hello handshake - establish new connection
            if (ws_msg.type === 'hello-client') {
                // type: 'hello-client',
                // version: [String version (semantic versioning)]
                checkClientVersionModal(ws_msg.version);

                if (window.getURLParameter('debug')) {
                    console.log("Websocket client/launcher found - version " + ws_msg.version);
                }

                // TODO: Add version checking here.

                client_use_type = 'ws';
                client_available = true;

                setPropToolbarButtons('available');

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

                var msg_in = atob(ws_msg.msg);

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
                    //Messages are coded; check codes, log all and filter out nsDownloading duplicates
                    var msg = ws_msg.msg.split("-");
                    if (msg[0] != nsDownloading || !launcher_download) {
                        launcher_result = launcher_result + msg[1] + "\n";
                        launcher_download |= (msg[0] == nsDownloading);
                    }
                    if (msg[0] == nsDownloadSuccessful) {
                        //Success! Keep it simple
                        $('#compile-console').val($('#compile-console').val() + ' Succeeded.');
                    } else if (msg[0] == neDownloadFailed) {
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
                    client_ws_connection.close();

                } else if (ws_msg.action === 'alert') {
                    utils.showMessage(Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER, ws_msg.msg);
                }
            }

            // --- older client - disconnect it?
            else {
                console.log('Unknown WS msg: ' + JSON.stringify(ws_msg));
            }
        };

        connection.onClose = function () {
            lostWSConnection();
        };
    }
}

function lostWSConnection() {
// Lost websocket connection, clean up and restart find_client processing
    client_ws_connection = null;
    client_use_type = 'none';
    client_available = false;
    ports_available = false;

    setPropToolbarButtons('unavailable');
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
        ports_available = true;
    } else {
        addComPortDeviceOption((data === 'searching') ? Blockly.Msg.DIALOG_PORT_SEARCHING : Blockly.Msg.DIALOG_NO_DEVICE);
        ports_available = false;
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
