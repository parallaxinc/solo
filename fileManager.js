/*
 * File Manager
 */

// Project data holds the project details
let projectData = null;

 /**
 *
 * @param str
 * @returns {number}
 */
function computeHashCode(str) {
    var hash = 0, i = 0, len = str.length;
    while (i < len) {
        hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
    }
    return (hash + 2147483647) + 1;
}


// http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}


/**
 *
 */
function clearUploadInfo() {
    // Reset all of the upload fields and containers
//    uploadedXML = '';
    $('#selectfile').val('');
    $('#selectfile-verify-notvalid').css('display', 'none');
    $('#selectfile-verify-valid').css('display', 'none');
    $('#selectfile-verify-boardtype').css('display', 'none');
    document.getElementById("selectfile-replace").disabled = true;
    document.getElementById("selectfile-append").disabled = true;
}

/**
 *
 * @param files
 */
function uploadFileHandler(files) {
    let UploadReader = new FileReader();

    UploadReader.onload = function () {
        let uploadedXML = "";
        var xmlString = this.result;
        var xmlValid = false;
        var uploadBoardType = '';

        //validate file, screen for potentially malicious code.
        if (files[0].type === 'image/svg+xml'
                && xmlString.indexOf("<svg blocklyprop=\"blocklypropproject\"") === 0
                && xmlString.indexOf("<!ENTITY") === -1
                && xmlString.indexOf("CDATA") === -1
                && xmlString.indexOf("<!--") === -1) {

            var uploadedChecksum = xmlString.substring((xmlString.length - 24), (xmlString.length - 12));
            var findBPCstart = '<block';
            if (xmlString.indexOf("<variables>") > -1) {
                findBPCstart = '<variables>';
            }
            uploadedXML = xmlString.substring(xmlString.indexOf(findBPCstart), (xmlString.length - 29));
            
            var computedChecksum = computeHashCode(uploadedXML).toString();
            computedChecksum = '000000000000'.substring(computedChecksum.length, 12) + computedChecksum;

            var boardIndex = xmlString.indexOf('transform="translate(-225,-23)">Device: ');
            uploadBoardType = xmlString.substring((boardIndex + 40), xmlString.indexOf('</text>', (boardIndex + 41)));

            if (computedChecksum === uploadedChecksum) {
                xmlValid = true;
            }
            if (xmlValid) {
                // Set open file dialog UI elements
                if (projectData && uploadBoardType !== projectData['board']) {
                    // Display a green box with a checkmark - this is a good file
                    $('#selectfile-verify-boardtype').css('display', 'block');
                } else {
                    $('#selectfile-verify-boardtype').css('display', 'none');
                }
            }

            // Add required XML emlements
            if (uploadedXML !== '') {
                uploadedXML = '<xml xmlns="http://www.w3.org/1999/xhtml">' + uploadedXML + '</xml>';
            };

            let openFileParam = getURLParameter('openFile');

    	    if (openFileParam && openFileParam === "true" && isOffline) {
                var titleIndex = xmlString.indexOf('transform="translate(-225,-53)">Title: ');
                var projectTitle = xmlString.substring((titleIndex + 39), xmlString.indexOf('</text>', (titleIndex + 40)));
		        // TODO: set up board type, get other info...
		        // name, html-description, description, boardtype
                // set into local storage and reload window.

	            var tt = new Date();
		        pd = {
            	    'board': uploadBoardType,
            	    'code': uploadedXML,
            	    'created': tt,
            	    'description': '',
            	    'description-html': '',
            	    'id': 0,
            	    'modified': tt,
            	    'name': projectTitle,
                    'private': true,
            	    'shared': false,
            	    'type': "PROPC",
            	    'user': "offline",
            	    'yours': true,
		        }

                window.localStorage.setItem('localProject', JSON.stringify(pd));
		        window.location = 'blocklyc.html';
	        }
        }

        if (xmlValid === true) {
            $('#selectfile-verify-valid').css('display', 'block');
            document.getElementById("selectfile-replace").disabled = false;
            document.getElementById("selectfile-append").disabled = false;
            uploadedXML = xmlString;
        } else {
            $('#selectfile-verify-notvalid').css('display', 'block');
            document.getElementById("selectfile-replace").disabled = true;
            document.getElementById("selectfile-append").disabled = true;
            uploadedXML = '';
        }
    };

    UploadReader.readAsText(files[0]);
}
