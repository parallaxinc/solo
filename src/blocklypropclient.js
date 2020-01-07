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
    portListReceiveCountUp: 0,  // This is set to 0 each time the port list is received, and incremented once each 4 second heartbeat
    activeConnection: null,
    url: function (protocol) {
        return protocol + '://' + this.path + ':' + this.port + '/';
    },
    version: {
        // Constants
        MINIMUM_ALLOWED: '0.7.0',
        RECOMMENDED: '0.11.0',
        CODED_MINIMUM: '0.7.5',  // Minimum client/launcher version supporting coded/verbose responses (remove after MINIMUM_ALLOWED > this)

        // Variables
        current: '0.0.0',
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
            this.isValid = (this.getNumeric(rawVersion) >= this.getNumeric(this.MINIMUM_ALLOWED));
            this.isRecommended = (this.getNumeric(rawVersion) >= this.getNumeric(this.RECOMMENDED));
            this.isCoded = (this.getNumeric(rawVersion) >= this.getNumeric(this.CODED_MINIMUM));   // remove after MINIMUM_ALLOWED is greater
        }
    }
}



// BP Launcher result log and download message flag
var launcher_result = "";
var launcher_download = false;

// Status Notice IDs
const NS_DOWNLOADING                 = 2;
const NS_DOWNLOAD_SUCCESSFUL         = 5;

// Error Notice IDs
const NE_DOWNLOAD_FAILED             = 102;


$(document).ready(function () {
    checkClient();
    setInterval(checkClient, 3500);
});

var checkClient = function () {
    // Try to connect to the BP-Launcher (websocket) first.
    if (!clientService.available && clientService.type !== 'http') {
        establishBPLauncherConnection();
    }

    // If the BP-Launcher is not found, try to connect to the BP-Client.
    if (clientService.type !== 'ws') {
        establishBPClientConnection();
    }

    // Check the last time the port list was received from the BP-Launcher.
    // If it's been too long, close the connection.
    if (clientService.type === 'ws') {

        clientService.messageReceived++;

        if (clientService.messageReceived > 2) {
            // Client is taking too long to check in - close the connection and clean up
            clientService.activeConnection.close();
            // TODO: this may not be necessary (gets called by 'onclose' in websocket)
            lostWSConnection();
        }
    }

    // If connected to the BP-Client, poll it for changes in the com port list
    if (clientService.type === 'http') {
        checkForComPorts();
    }
};

var setPropToolbarButtons = function () {
    if (clientService.available) {
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
 * This attempts to connect to an http client (BP-Client) only after
 * an attempted connection to the BP-Launcher has failed.
 * If both attempts have failed, it sets the client availablility to null
 * and sets an interval to continue checking for a client.
 */
var establishBPClientConnection = function () {
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
            setPropToolbarButtons();
        }

    }).fail(function () {
        if (clientService.type !== 'ws') {
            clientService.type = null;
            clientService.available = false;
            clientService.portsAvailable = false;
            setPropToolbarButtons();
        }
        
    });
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
function establishBPLauncherConnection() {

    // TODO: set/clear and load buttons based on status
    if (!clientService.available) {

        // Clear the port list
        setComPortList();

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
            if (!clientService.type) {
                console.log('Unable to find websocket client');
                connection.close();
            } else {
                console.log('Websocket Communication Error');
                console.log(error);
            }
        };

        // handle messages from the client
        connection.onmessage = function (e) {
            var ws_msg = JSON.parse(e.data);

            // set this to zero to note that the connection is still alive.
            clientService.messageReceived = 0;

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
                setPropToolbarButtons();

                var portRequestMsg = JSON.stringify({type: 'port-list-request', msg: 'port-list-request'});
                connection.send(portRequestMsg);

            }

            // --- com port list/change
            else if (ws_msg.type === 'port-list') {
                // type: 'port-list',
                // ports: ['port1', 'port2', 'port3'...]
                setComPortList(ws_msg.ports);
            }

            // --- serial terminal/graph
            else if (ws_msg.type === 'serial-terminal' &&
                    (typeof ws_msg.msg === 'string' || ws_msg.msg instanceof String)) {
                // sometimes some weird stuff comes through...
                // type: 'serial-terminal'
                // msg: [String Base64-encoded message]

                var msg_in = '';
                try {
                    msg_in = atob(ws_msg.msg);
                } catch (error) {
                    // only show the error if it's something other than the base64 encoding
                    if (error.toString().indexOf("'atob'") < 0) {
                        console.log(error);
                    }
                    msg_in = ws_msg.msg;
                }

                if (term !== null && msg_in !== '' && ws_msg.packetID) {
                    pTerm.display(msg_in);
                    pTerm.focus();
                } else if (graph !== null && msg_in !== '' && ws_msg.packetID) { // is the graph open?
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

        connection.onclose = function () {
            lostWSConnection();
        };
    }
}

function lostWSConnection() {
    // Lost websocket connection, clean up and restart find_client processing
    if (clientService.type !== 'http') {
        clientService.activeConnection = null;
        clientService.type = null;
        clientService.available = false;
        setPropToolbarButtons();
    }
    
    term = null;

    // Clear ports list
    setComPortList();
};


// set communication port list
// leave data unspecified when searching
var setComPortList = function (data) {
    var selected_port = clearComPortUI();

    if (typeof (data) === 'object' && data.length > 0) {
        data.forEach(function (port) {
            addComPortDeviceOption(port);
        });
        clientService.portsAvailable = true;
    } else {
        addComPortDeviceOption(clientService.available ? Blockly.Msg.DIALOG_PORT_SEARCHING : Blockly.Msg.DIALOG_NO_DEVICE);
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
