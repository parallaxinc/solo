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

import {Project, ProjectTypes} from '../project';
import {logConsoleMessage} from '../utility';

/**
 * @module project_io
 */

/**
 * @typedef module:project_io.ProjectLoadResult
 * @type {Object}
 * @property {number} status
 * @property {string} message
 * @property {Project} project
 */

/**
 * Load a project .sgv or .svge file from the filesystem
 *
 * @param {FileList} files
 * @return {module:project_io.ProjectLoadResult}
 *
 * @description
 *   Status Codes:
 *    0   Successful operation
 *   -1   General failure loading the project
 *   -2   No files were selected to load
 *   -3   Unknown file format or corrupt project file
 */
export async function loadProjectFile(files) {
  if (!files || files.length === 0) {
    return formatResult(-2, 'No files were selected', null);
  }

  // Enumerate the FileList object into an array of file names
  const fileList = [];
  for (let loop = 0; loop < files.length; loop++ ) {
    fileList.push(files[loop]);
  }

  const fileType = fileList[0].type;

  try {
    // Load the project file into a Blob and return as an XML string
    const resData = await blobToData(new Blob(fileList, {type: 'text/strings'}));

    // Parse the XML string to validate content as a valid project
    await parseProjectFileString(fileList[0].name, fileType, resData);

    // Convert project XML string to a Project object
    const project = filestreamToProject(fileList[0].name, resData);
    if (project) {
      return formatResult(0, 'success', project);
    }
  } catch (err) {
    logConsoleMessage(`Error in loadProjectFile: ${err.message}`);
    return formatResult(-1, err.message, null);
  }

  return formatResult(-3, 'Project file format is unknown', null);
}

/**
 * Convert an svg project file content to a Project object
 * @param {string} projectName is the text name of the project
 * @param {string} rawCode This is the raw XML code from the project file
 *  without a namespace
 * @return {Project}
 */
export const filestreamToProject = (projectName, rawCode) => {
  // TODO: Solo #261
  // validateProjectBlockList(this.result);

  // Search the project file for the first variable or block
  const codeStartIndex =
      (rawCode.indexOf('<variables') > -1) ? '<variables' : '<block';

  // Extract everything from the first variable or block tag to the
  // beginning of the checksum block. This is the project code
  const blockCode = rawCode.substring(
      rawCode.indexOf(codeStartIndex),
      rawCode.indexOf('<ckm>'));

  const projectXmlCode = (blockCode.length > 0) ?
      Project.getEmptyProjectCodeHeader() + blockCode + '</xml>' :
      Project.getEmptyProjectCodeHeader() + '</xml>';

  const date = new Date();
  const projectDesc = getProjectDescriptionFromXML(rawCode);
  const projectModified = getProjectModifiedDateFromXML(rawCode, date);
  const projectBoardType = getProjectBoardTypeFromXML(rawCode);
  let projectNameString = getProjectTitleFromXML(rawCode);
  console.log(`Project Title: ${projectNameString}`);
  if (projectNameString === '') {
    projectNameString = projectName;
  }

  // Project create date can be missing in some projects. Set it to the
  // last modify date as a last-ditch default
  let projectCreated = getProjectCreatedDateFromXML(rawCode, date);
  if (! projectCreated) {
    projectCreated = projectModified;
  }

  try {
    const tmpBoardType = Project.convertBoardType(projectBoardType);
    if (tmpBoardType === undefined) {
      console.log(`Unknown board type: ${projectBoardType}`);
    }

    return new Project(
        projectNameString,
        decodeFromValidXml(projectDesc),
        tmpBoardType,
        ProjectTypes.PROPC,
        projectXmlCode,
        projectCreated,
        projectModified,
        date.getTime(),
        true);
  } catch (e) {
    console.log('Error while creating project object. %s', e.message);
  }

  return null;
};

/**
 * Parse the xml string to locate and return the text of the project description
 *
 * @param {string} xmlString
 * @return {string}
 */
function getProjectDescriptionFromXML(xmlString) {
  const titleIndex = xmlString.indexOf(
      'transform="translate(-225,-8)">Description: ');

  if (titleIndex > -1) {
    return xmlString.substring(
        (titleIndex + 44),
        xmlString.indexOf('</text>', (titleIndex + 44)));
  }

  return '';
}


/**
 * Retrieve the project board type from the raw project XML
 * @param {string} xml
 * @return {string}
 */
function getProjectBoardTypeFromXML(xml) {
  //  transform=\"translate(-225,-23)\">Device: activity-board</text>
  const searchString = `transform="translate(-225,-23)">Device: `;
  const index = xml.indexOf(searchString);

  if (index === -1) {
    return '';
  }

  return xml.substring(
      (index + searchString.length),
      xml.indexOf('</text>', (index + searchString.length)));
}



/**
 * Retrieve the project board type from the raw project XML
 * @param {string} xml
 * @return {string}
 */
function getProjectTitleFromXML(xml) {
  const searchString = `transform="translate(-225,-53)">Title: `;
  const index = xml.indexOf(searchString);

  if (index === -1) {
    return '';
  }

  const title = xml.substring(
      (index + searchString.length),
      xml.indexOf('</text>', (index + searchString.length)));

  if (! title) {
    return '';
  }

  if (title.endsWith('.svg')) {
    return title.substr(0,title.length - 4);
  }

  if (title.endsWith('.svge')) {
    return title.substr(0,title.length - 5);
  }

  return title;

}

/**
 * Parse the xml string to locate and return the project created timestamp
 *
 * @param {string} xmlString
 * @param {Date} defaultTimestamp
 * @return {string|*}
 */
function getProjectCreatedDateFromXML(xmlString, defaultTimestamp) {
  const titleIndex = xmlString.indexOf('data-createdon="');

  if (titleIndex > -1) {
    return xmlString.substring(
        (titleIndex + 16),
        xmlString.indexOf('"', (titleIndex + 17)));
  }

  return defaultTimestamp;
}

/**
 * Parse the xml string to locate and return the project last modified timestamp
 *
 * @param {string} xmlString
 * @param {Date} defaultTimestamp
 * @return {string|*}
 */
function getProjectModifiedDateFromXML(xmlString, defaultTimestamp) {
  const titleIndex = xmlString.indexOf('data-lastmodified="');

  if (titleIndex > -1) {
    return xmlString.substring(
        (titleIndex + 19),
        xmlString.indexOf('"', (titleIndex + 20)));
  } else {
    return defaultTimestamp;
  }
}

/**
 * Decode a string from an XML-safe string by replacing HTML
 * entities with their standard characters
 *
 * @param {string} str
 * @return {string}
 */
function decodeFromValidXml(str) {
  return (
    str.replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, '\'')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#x9;/g, '\t')
        .replace(/&#xA;/g, '\n')
        .replace(/&#xD;/g, '\r')
  );
}

/**
 * Read the project file and convert it to an XML string
 *
 * @param {Blob} blob
 * @return {Promise<string>}
 */
export const blobToData = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(blob);
  });
};

/**
 * Convenience function for loadProjectFile return object
 *
 * @param {number} status
 * @param {string} message
 * @param {Project | null} project
 * @return {{project, message, status}}
 */
function formatResult(status, message, project) {
  return {
    status: status,
    message: message,
    project: project,
  };
}

/**
 * Scan the project file XML string to validate markers within the string
 *
 * When an error is detected, the function will throw a StringException
 *
 * @param {string} filename
 * @param {string} fileType
 * @param {string} xmlString
 * @throws StringException
 */
async function parseProjectFileString(filename, fileType, xmlString) {
  // The project board type string
  const uploadBoardType = getProjectBoardTypeName(xmlString);
  if (uploadBoardType.length === 0) {
    throw new StringException(
        uploadBoardType,
        'Project board type was not found');
  }

  // The text name of the project
  // const projectName = filename.substring(0, filename.lastIndexOf('.'));
  // logConsoleMessage(`Loading project :=> ${projectName}`);

  // TODO: Solo #261
  // Loop through blocks to verify blocks are supported for the project
  // board type
  // validateProjectBlockList(this.result);

  const isSvgFile = (fileType === 'image/svg+xml');

  // Flag to indicate that we are importing a file that was exported from the
  // blockly.parallax.com site
  let isSvgeFile = false;

  // We need to support our rouge .svge type
  if (fileType === '') {
    const name = filename;
    if (name.slice(name.length - 4) === 'svge') {
      isSvgeFile = true;
    }
  }

  // validate file, screen for potentially malicious code.
  if ((! isSvgFile) && (! isSvgeFile)) {
    throw new StringException(
        fileType,
        `Project file extension is not one of '.svg' or '.svge'`);
  }

  if (xmlString.indexOf('<svg blocklyprop="blocklypropproject"') === -1) {
    throw new StringException(
        'blocklypropproject',
        `Unable to locate BlocklyProp project start tag`);
  }

  if (xmlString.indexOf('<!ENTITY') !== -1) {
    throw new StringException(
        'ENTITY',
        `Found an invalid ENTITY tag`);
  }

  if (xmlString.indexOf('CDATA') !== -1) {
    throw new StringException(
        'CDATA',
        `Found invalid CDATA tag`);
  }

  if (xmlString.indexOf('<!--') !== -1) {
    throw new StringException(
        'XML Comment',
        `Found an invalid XML comment tag`);
  }
}

/**
 * Parse the xml string to locate and return the project board type
 *
 * @param {string} xmlString
 * @return {string}
 *
 * @description
 *  The xmlString parameter contains the raw text from the project .svg file.
 *  This function looks for the Device preamble and the computes an offset
 *  to reach the actual board type string.
 */
export function getProjectBoardTypeName(xmlString) {
  const boardIndex = xmlString.indexOf('transform="translate(-225,-23)">Device: ');
  if (boardIndex === -1) return '';
  return xmlString.substring(
      (boardIndex + 40),
      xmlString.indexOf('</text>', (boardIndex + 41)));
}

/**
 * String Exception
 *
 * @param {string} value
 * @param {string} message
 * @constructor
 */
function StringException(value, message) {
  this.value = value;
  this.message = message;
  this.toString = function() {
    return this.value + this.message;
  };
}
