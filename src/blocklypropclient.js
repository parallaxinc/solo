
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
 * Client Service Object
 */
var clientService = {
    available: false,             // {boolean} Has a client (BPC/BPL) successfully connected
    portsAvailable: false,        // {boolean} Are any serial ports enumerated
    path: 'localhost',            // {string} usually "localhost", but can be configured to point to a client at any reachable IP/DNS address
    port: 6009,                   // {number} BlocklyProp Client/Launcher port number
    type: null,                   // {string} null, "ws", "http"

    rxBase64: true,               // {boolean} BP Lancher full base64 encoding support flag
    loadBinary: false,            // {boolean} BP Launcher download message flag
    resultLog: '',                // {boolean} BP Launcher result log

    portListReceiveCountUp: 0,    // This is set to 0 each time the port list is received, and incremented once each 4 second heartbeat
    activeConnection: null,       // Used differently by BPL and BPC - pointer to connection object

    sendCharacterStreamTo: null,  // {string} null, "term", or "graph". Flag to inform connection methods which modal/class to send characters to be displayed to

    url: function (location, protocol) {
        return (protocol || window.location.protocol.replace(':', '')) + '://' + this.path + ':' + this.port + '/' + (location || '');
    },
    version: {
        // Constants
        MINIMUM_ALLOWED: '0.7.0', // {string} Semantic versioning, minimum client (BPL/BPC) allowed
        RECOMMENDED: '0.11.0',    // {string} Semantic versioning, minimum recommended client/launcher version
        CODED_MINIMUM: '0.7.5',   // {string} Semantic versioning, Minimum client/launcher version supporting coded/verbose responses (remove after MINIMUM_ALLOWED > this)

        // Variables
        current: '0.0.0',         // {string} Semantic versioning, Current version
        currentAsNumber: 0,       // {number} Version as an integer calulated from string representation
        isValid: false,           // {boolean} current >= MINIMUM_ALLOWED
        isRecommended: false,     // {boolean} current >= RECOMMENDED
        isCoded: false,           // {boolean} current >= CODED_MINIMUM

        // Returns integer calulated from passed in string representation of version
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

        // Sets self-knowledge of current client/launcher version.
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
const NS_DOWNLOADING                 = 2;   // 002;
const NS_DOWNLOAD_SUCCESSFUL         = 5;   // 005;

// Error Notice IDs
const NE_DOWNLOAD_FAILED             = 102;


$(document).ready(function () {
    findClient();
    setInterval(findClient, 3500);
});

var findClient = function () {
    // Try to connect to the BP-Launcher (websocket) first
    if (!clientService.available && clientService.type !== 'http') {
        establishBPLauncherConnection();
    }

    // Check how much time has passed since the port list was received from the BP-Launcher
    if (clientService.type === 'ws') {
        clientService.portListReceiveCountUp++;

        // Is the BP-Launcher taking to long to respond?  If so, close the connection
        if (clientService.portListReceiveCountUp > 2) {
            clientService.activeConnection.close();
            // TODO: check to see if this is really necesssary - it get's called by the WS onclose handler
            lostWSConnection();
        }
    }

    // BP-Launcher not found? Try connecting to the BP-Client
    if (clientService.type !== 'ws') {
        establishBPClientConnection();
    }

    // If connected to the BP-Client, poll for an updated port list
    if (clientService.type === 'http') {
        checkForComPorts();
    }
};


/**
 * Set button state for the Compiler toolbar
 * @deprecated Replaced with PropToolbarButtonController()
 */
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
 *  Update the state of the Compiler toolbar buttons
 *
 * @param {boolean} connected
 *
 * @constructor
 */
const PropToolbarButtonController = (connected) => {
    if (projectData && projectData.board === 's3') {
        /* ----------------------------------------------------------------
         * Hide the buttons that are not required for the S3 robot
         *
         * Find all of the HTML elements that have a class id of 'no-s3'
         * and append a hidden attribute to the selected HTML elements.
         * This currently applies to the elements prop-btn-ram and
         *  prop-btn-graph.
         * --------------------------------------------------------------*/
        $('.no-s3').addClass('hidden');

        // Toggle the client available message to display the short form
        $('#client-available').addClass('hidden');
        $('#client-available-short').removeClass('hidden');
    } else {
        // Reveal these buttons
        $('.no-s3').removeClass('hidden');

        // Toggle the client available message to display the long form
        $('#client-available').removeClass('hidden');
        $('#client-available-short').addClass('hidden');
    }

    // Update elements when we are connected
    if (connected) {
        // Hide the 'client unavailable' message
        $("#client-unavailable").addClass("hidden");

        /* Enable these buttons:
         *   Compile to RAM
         *   Compile to EEPROM
         *   Open Terminal
         *   Open graphing window
         */
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
 * Establish a connection to the BlocklyProp-Client (BPC) application
 * Retrieves the BPC's version
 * Sets parameters in the clientService object
 * Calls UI configuration functions
 */
var establishBPClientConnection = function () {
    // Load data from the server using a HTTP GET request.
    $.get(clientService.url(), function (data) {
        if (!clientService.available) {
            let client_version_str = (typeof data.version_str !== "undefined") ? data.version_str : data.version;
            if (!data.server || data.server !== 'BlocklyPropHTTP') {
                client_version_str = '0.0.0';
            }

            checkClientVersionModal(client_version_str);

            clientService.type = 'http';
            clientService.available = true;         // Connected to the Launcher/Client

            // Set the compiler toolbar elements
            // setPropToolbarButtons();
            PropToolbarButtonController(clientService.available);
        }
    }).fail(function () {
        clientService.type = null;
        clientService.available = false;            // Not connected to the Launcher/Client
        clientService.portsAvailable = false;

        // Set the compiler toolbar elements
        // setPropToolbarButtons();
        PropToolbarButtonController(clientService.available);
    });
};


/**
 * Create a modal that allows the user to set a different port or path
 * to the BlocklyProp-Client or -Launcher
 *
 * TODO: Add fields for setting a different path to the compile service (for anyone wanting to host their own)
 */
var configureConnectionPaths = function () {
    // All of this code is building the UI for the Configure
    // BlocklyProp Client dialog.
    let pathPortInput = $("<form/>", {
        class: "form-inline"
    });

    // This is hard-coding the HTTP protocol for the BlocklyProp Client
    $("<span/>", {
        class: "space_right"
    }).text("http://").appendTo(pathPortInput);

    // Add the form group to the DOM for the input field defined next
    let domainNameGroup = $("<div/>", {
        class: "form-group"
    }).appendTo(pathPortInput);

    // Default the domain input box
    $("<input/>", {
        id: "domain_name",
        type: "text",
        class: "form-control",
        value: clientService.path
    }).appendTo(domainNameGroup);

    // Hard code the ':' between the domain name and port input fields
    $("<span/>", {
        class: "space_left space_right"
    }).text(":").appendTo(pathPortInput);

    // Add the form group to the DOM for the next input field
    let domain_port_group = $("<div/>", {
        class: "form-group"
    }).appendTo(pathPortInput);

    // Get the port number
    $("<input/>", {
        id: "port_number",
        type: "number",
        class: "form-control",
        value: clientService.port
    }).appendTo(domain_port_group);

    // Show the modal dialog
    utils.confirm(Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER_CONFIGURE_TITLE, pathPortInput, function (action) {
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
        setPortListUI();

        var connection = new WebSocket(clientService.url('', 'ws'));

        connection.onopen = function () {

            if (clientService.activeConnection !== null) {
                clientService.activeConnection.close();
            }

            var wsMessage = {type: 'hello-browser', baud: baudrate};
            clientService.activeConnection = connection;
            connection.send(JSON.stringify(wsMessage));
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
            var wsMessage = JSON.parse(e.data);

            // set this to zero to note that the connection is still alive (heartbeat)
            clientService.portListReceiveCountUp = 0;

            // --- hello handshake - establish new connection
            if (wsMessage.type === 'hello-client') {
                // type: 'hello-client',
                // version: [String version (semantic versioning)]
                // rxBase64: [boolean, accepts base64-encoded serial streams (all versions transmit base64)]
                checkClientVersionModal(wsMessage.version);

                if (window.getURLParameter('debug')) {
                    console.log("Websocket client/launcher found - version " + wsMessage.version);
                }

                clientService.rxBase64 = wsMessage.rxBase64 || false;
                clientService.type = 'ws';
                clientService.available = true;     // Connected to the Launcher/Client

                // Set the compiler toolbar elements
                // setPropToolbarButtons();
                PropToolbarButtonController(clientService.available);

                var portRequestMsg = JSON.stringify({type: 'port-list-request', msg: 'port-list-request'});
                connection.send(portRequestMsg);


            // --- com port list/change
            } else if (wsMessage.type === 'port-list') {
                // type: 'port-list',
                // ports: ['port1', 'port2', 'port3'...]
                setPortListUI(wsMessage.ports);


            // --- serial terminal/graph
            } else if (wsMessage.type === 'serial-terminal' &&
                    (typeof wsMessage.msg === 'string' || wsMessage.msg instanceof String)) {
                // sometimes some weird stuff comes through...
                // type: 'serial-terminal'
                // msg: [String Base64-encoded message]

                var messageText = '';
                try {
                    var messageText = atob(wsMessage.msg);
                } catch (error) {
                    // only show the error if it's something other than base-64 encoding
                    if (error.toString().indexOf("'atob'") < 0) {
                        console.error(error);
                    }
                    messageText = wsMessage.msg;
                }

                if (clientService.sendCharacterStreamTo && messageText !== '' && wsMessage.packetID) {
                    if (clientService.sendCharacterStreamTo === 'term') { // is the terminal open?
                        pTerm.display(messageText);
                        pTerm.focus();
                    } else {    // is the graph open?
                        graph_new_data(messageText);
                    }
                }


            // --- UI Commands coming from the client
            } else if (wsMessage.type === 'ui-command') {
                // type: 'ui-command',
                // action: ['open-terminal','open-graph','close-terminal','close-graph','close-compile','clear-compile','message-compile','alert']
                // msg: [String message]

                if (wsMessage.action === 'open-terminal') {
                    serial_console();

                } else if (wsMessage.action === 'open-graph') {
                    graphing_console();

                } else if (wsMessage.action === 'close-terminal') {
                    $('#console-dialog').modal('hide');
                    clientService.sendCharacterStreamTo = null;
                    pTerm.display(null);

                } else if (wsMessage.action === 'close-graph') {
                    $('#graphing-dialog').modal('hide');
                    clientService.sendCharacterStreamTo = null;
                    graph_reset();

                } else if (wsMessage.action === 'clear-compile') {
                    $('#compile-console').val('');

                } else if (wsMessage.action === 'message-compile') {
                    //Messages are coded; check codes, log all and filter out NS_DOWNLOADING duplicates
                    var msg = wsMessage.msg.split("-");
                    if (msg[0] != NS_DOWNLOADING || !clientService.loadBinary) {
                        clientService.resultLog = clientService.resultLog + msg[1] + "\n";
                        clientService.loadBinary |= (msg[0] == NS_DOWNLOADING);
                    }
                    if (msg[0] == NS_DOWNLOAD_SUCCESSFUL) {
                        //Success! Keep it simple
                        $('#compile-console').val($('#compile-console').val() + ' Succeeded.');
                    } else if (msg[0] == NE_DOWNLOAD_FAILED) {
                        //Failed! Show the details
                        $('#compile-console').val($('#compile-console').val() + ' Failed!\n\n-------- loader messages --------\n' + clientService.resultLog);
                    } else {
                        //Show progress during downloading
                        $('#compile-console').val($('#compile-console').val() + ".");
                    }

                    // Scoll automatically to the bottom after new data is added
                    var compileConsoleObj = document.getElementById("compile-console");
                    compileConsoleObj.scrollTop = compileConsoleObj.scrollHeight;

                } else if (wsMessage.action === 'close-compile') {
                    $('#compile-dialog').modal('hide');
                    $('#compile-console').val('');

                } else if (wsMessage.action === 'console-log') {
                    console.log(wsMessage.msg);

                } else if (wsMessage.action === 'websocket-close') {
                    clientService.activeConnection.close();

                } else if (wsMessage.action === 'alert') {
                    utils.showMessage(Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER, wsMessage.msg);
                }

            // --- older client - disconnect it?
            } else {
                console.log('Unknown WS msg: ' + JSON.stringify(wsMessage));
            }
        };

        connection.onclose = function () {
            lostWSConnection();
        };
    }
}

/**
 * Lost websocket connection, clean up and restart findClient processing
 */
function lostWSConnection() {
    if (clientService.type !== 'http') {
        clientService.activeConnection = null;
        clientService.type = null;
        clientService.available = false;        // Not connected to the Launcher/Client
    }

    // Set the compiler toolbar elements
    // setPropToolbarButtons();
    PropToolbarButtonController(clientService.available);

    // Clear ports list
    setPortListUI();
};


// set communication port list
// leave data unspecified when searching
var setPortListUI = function (data) {
    data = (data ? data : 'searching');
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
