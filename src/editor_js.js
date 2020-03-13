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
 * Reset the sizing of blockly's toolbox and canvas.
 *
 * NOTE: This is a workaround to ensure that it renders correctly
 * TODO: Find a permanent replacement for this workaround.
 *
 * @param {number} resizeDelay milliseconds to delay the resizing, especially
 * if used after a change in the window's location or a during page
 * reload.
 * @param {boolean} centerBlocks Center the project blocks if true.
 */
function resetToolBoxSizing(resizeDelay, centerBlocks) {
    // Vanilla Javascript is used here for speed - jQuery
    // could probably be used, but this is faster. Force
    // the toolbox to render correctly
    setTimeout(() => {
        // find the height of just the blockly workspace by
        // subtracting the height of the navigation bar
        let navTop = document.getElementById('editor').offsetHeight;
        let navHeight = window.innerHeight - navTop;
        let navWidth = window.innerWidth;

        // Build an array of UI divs that display content
        let blocklyDiv = [
            document.getElementById('content_blocks'),
            document.getElementById('content_propc'),
            document.getElementById('content_xml')
        ];

        // Set the size of the divs
        for (let i = 0; i < 3; i++) {
            blocklyDiv[i].style.left = '0px';
            blocklyDiv[i].style.top = navTop + 'px';
            blocklyDiv[i].style.width = navWidth + 'px';
            blocklyDiv[i].style.height = navHeight + 'px';
        }

        // Update the Blockly editor canvas to use the new space
        if (Blockly.mainWorkspace && blocklyDiv[0].style.display !== 'none') {
            Blockly.svgResize(Blockly.mainWorkspace);

            // center the blocks on the workspace
            if (centerBlocks) {
                Blockly.getMainWorkspace().scrollCenter();
            }
        }

    }, resizeDelay || 10);  // 10 millisecond delay
}


/**
 * Load the workspace
 * @param xmlText
 */
function loadToolbox(xmlText) {
    if (Blockly.mainWorkspace) {
        const xmlDom = Blockly.Xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace);
    }
}


/**
 * Check project state to see if it has changed before leaving the page
 *
 * @returns {boolean}
 * Return true if the project has been changed but has not been
 * persisted to storage.
 *
 * @description
 * The function assumes that the projectData global variable holds
 * the original copy of the project, prior to any user modification.
 * The code then compares the code in the Blockly core against the
 * original version of the project to determine if any changes have
 * occurred.
 *
 * This only examines the project data. This code should also check
 * the project name and descriptions for changes.
 */
function checkLeave() {
    // The projectData variable is now officially an object. Consider it empty
    // if it is null or if the name property is undefined.
    if (!projectData || typeof projectData.name === 'undefined') {
        return false;
    }

    let currentXml = getXml();
    let savedXml = projectData.code;

    return Project.testProjectEquality(currentXml, savedXml);
}


/**
 * Convert the current project workspace into an XML document
 *
 * @return {string}
 */
function getXml() {
    if (projectData && projectData.board === 'propcfile') {
        return propcAsBlocksXml();
    }

    if (Blockly.Xml && Blockly.mainWorkspace) {
        const xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        return Blockly.Xml.domToText(xml);
    }

    if (projectData && projectData.code) {
        return projectData.code;
    }

    // Return the XML for a blank project if none is found.
    return EMPTY_PROJECT_CODE_HEADER + '</xml>';
}
