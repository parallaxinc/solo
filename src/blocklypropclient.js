
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

// TODO: Document what the 'client_ws_connection' variable represents
/**
 * Not sure what this does
 *
 * @type {WebSocket}
 */
export var client_ws_connection = null;


// TODO: Uninitialized variable
// TODO: Document what the 'client_ws_heatbeat' variable represents
/**
 *  @type {number}
 */
var client_ws_heartbeat;


/**
 *
 * @type {number}
 */
var client_ws_heartbeat_interval = null;


var check_com_ports_interval = null;
var check_ws_socket_timeout = null;

// BP Launcher result log and download message flag
export var launcher_result = "";
export var launcher_download = false;


/**
 * Client Service Object
 */
var clientService = {
    available: false,           // Available for ?
    portsAvailable: false,      // Are any serial ports enumerated?
    path: 'localhost',          // Is this always localhost?
    port: 6009,                 // BlocklyProp Client/Launcher port number
    type: null,                 // {string} Seems to be one of "", "ws", "http"

    /*
    rxBase64: true,
    portListReceiveCountUp: 0,  // This is set to 0 each time the port list is received, and incremented once each 4 second heartbeat
    activeConnection: null,
    */
    url: function (location, protocol) {
        return (protocol || window.location.protocol.replace(':', '')) + '://' + this.path + ':' + this.port + '/' + (location || '');
    },
    version: {
        // Constants
        MINIMUM_ALLOWED: '0.7.0',
        RECOMMENDED: '0.11.0',
        CODED_MINIMUM: '0.7.5',  // Minimum client/launcher version supporting coded/verbose responses (remove after MINIMUM_ALLOWED > this)

        // Variables
        current: '0.0.0',       // Current version
        currentAsNumber: 0,
        isValid: false,         // What determines this?
        isRecommended: false,   // What is this?
        isCoded: false,         // Also, what is this?

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
            this.isValid = (this.getNumeric(rawVersion) >= this.getNumeric(this.MINIMUM_ALLOWED));
            this.isRecommended = (this.getNumeric(rawVersion) >= this.getNumeric(this.RECOMMENDED));
            this.isCoded = (this.getNumeric(rawVersion) >= this.getNumeric(this.CODED_MINIMUM));   // remove after MINIMUM_ALLOWED is greater
        }
    }
}

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
 * @function checkClientVersionModal Displays a modal with information 
 * about the client version if the one being used is outdated.
 * If the version is below the recommended version, the user is 
 * warned, and versions below the minimum are alerted. 
 * @param {string} rawVersion string representing the client version in '0.0.0' format (Semantic versioning)
 */
function checkClientVersionModal(rawVersion) {
    if (rawVersion) {
        clientService.version.set(rawVersion);
    }
    if (!clientService.version.isRecommended) {
        $('.bpc-version').addClass('hidden');

        if (clientService.version.currentAsNumber === 0) {
            $("#client-unknown-span").removeClass("hidden");
        } else if (clientService.version.isValid) {
            $("#client-warning-span").removeClass("hidden");
        } else {
            $("#client-danger-span").removeClass("hidden");     
        }

        $(".client-required-version").html(clientService.version.RECOMMENDED);
        if (clientService.version.currentAsNumber === 0) {
            $(".client-your-version").html('<b>UNKNOWN</b>')
        } else {
            $(".client-your-version").html(clientService.version.current);
        }
        $('#client-version-modal').modal('show');
    }
}

/**
 * This is evaluating the BlocklyProp Client or BlocklyProp Launcher version??
 */
var check_client = function () {
    // Load data from the server using a HTTP GET request.
    $.get(clientService.url(), function (data) {
        if (!clientService.available) {
            let client_version_str = (typeof data.version_str !== "undefined") ? data.version_str : data.version;
            if (!data.server || data.server !== 'BlocklyPropHTTP') {
                client_version_str = '0.0.0';
            }
            checkClientVersionModal(client_version_str);

            clientService.type = 'http';
            clientService.available = true;
            setPropToolbarButtons('available');
            if (checkForComPorts && typeof (checkForComPorts) === "function") {
                checkForComPorts();
                check_com_ports_interval = setInterval(checkForComPorts, 5000);
            }
        }
        setTimeout(check_client, 20000);

    }).fail(function () {
        clearInterval(check_com_ports_interval);
        clientService.type = 'none';
        clientService.available = false;
        clientService.portsAvailable = false;
        setPropToolbarButtons('unavailable');
        check_ws_socket_timeout = setTimeout(find_client, 3000);
    });
};

var connection_heartbeat = function () {
    // Check the last time the port list was received.
    // If it's been too long, close the connection.
    if (clientService.type === 'ws') {
        var d = new Date();
        if (client_ws_heartbeat + 12000 < d.getTime()) {
            // Client is taking too long to check in - close the connection and clean up
            console.log("Lost client websocket connection");
            client_ws_connection.close();
            lostWSConnection();
``        }
    }
};

/**
 * @deprecated - This function will become obsolete when the
 * BlocklyProp Client is deprecated and removed from service.
 */
export var configure_client = function () {
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
        setPortListUI();

        var connection = new WebSocket(clientService.url('', 'ws'));

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
            if (clientService.type !== 'ws' && !check_ws_socket_timeout) {
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

                clientService.type = 'ws';
                clientService.available = true;

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

                setPortListUI(ws_msg.ports);
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

    clientService.type = 'none';
    clientService.available = false;
    clientService.portsAvailable = false;

    setPropToolbarButtons('unavailable');

    term = null;
    newTerminal = false;

    // Clear ports list
    setPortListUI();

    if (client_ws_heartbeat_interval) {
        clearInterval(client_ws_heartbeat_interval);
        client_ws_heartbeat_interval = null;
    }

    //Create new ws socket timeout (find_client)
    check_ws_socket_timeout = setTimeout(find_client, 3000);
};


// set communication port list
// leave data unspecified when searching
var setPortListUI = function (data) {
    data = (data ? data : 'searching');
    var selected_port = clearComPortUI();

    if (typeof (data) === 'object' && data.length) {
        data.forEach(function (port) {
            addComPortDeviceOption(port);
        });
        clientService.portsAvailable = true;
    } else {
        addComPortDeviceOption((data === 'searching') ? Blockly.Msg.DIALOG_PORT_SEARCHING : Blockly.Msg.DIALOG_NO_DEVICE);
        clientService.portsAvailable = false;
    }
    selectComPort(selected_port);
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
