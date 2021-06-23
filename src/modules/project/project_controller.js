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

import {TEMP_PROJECT_STORE_NAME} from '../constants';
import {refreshEditorCanvas} from '../editor';
import {getProjectInitialState, projectJsonFactory} from '../project';
import {logConsoleMessage} from '../utility';

/**
 * Append a project to the current project or replace the current project
 * with the specified project.
 *
 * @description This code looks for the code that will be appended to the current project
 * in the browser's localStorage temp project location.
 */
export function appendProjectCode() {
  let projectData = '';
  const currentProject = getProjectInitialState();
  const newProjectJson = JSON.parse(window.localStorage.getItem(TEMP_PROJECT_STORE_NAME));
  if (!newProjectJson) {
    logConsoleMessage(`Imported project Json conversion failed`);
    return;
  }

  const newProject = projectJsonFactory(newProjectJson);
  if (newProject.code.length === 0) {
    logConsoleMessage(`Imported project contains no code segment`);
    return;
  }

  logConsoleMessage(
      `Adding project '${newProject.name}' to current project '${currentProject.name}'`);

  const uploadedXML = newProject.code;
  const xmlTagLength = '</xml>'.length;
  let projCode = '';
  let newCode = uploadedXML;

  // Variable blocks are defined before all other block types. Determine if the
  // new project contains variables. If so, start parsing at the variable block
  // definition. Otherwise, begin at the first non-variable block.
  if (newCode.indexOf('<variables>') === -1) {
    newCode = newCode.substring(
        uploadedXML.indexOf('<block'),
        newCode.length - xmlTagLength);
  } else {
    newCode = newCode.substring(
        uploadedXML.indexOf('<variables'),
        newCode.length - xmlTagLength);
  }

  // check for newer blockly XML code (contains a list of variables)
  if (newCode.indexOf('<variables') > -1 &&
      projCode.indexOf('<variables') > -1) {
    const findVarRegExp = /type="(\w*)" id="(.{20})">(\w+)</g;
    const newBPCvars = [];
    const oldBPCvars = [];

    let varCodeTemp = newCode.split('</variables>');
    newCode = varCodeTemp[1];
    // use a regex to match the id, name, and type of the variables in both
    // the old and new code.
    let tmpv = varCodeTemp[0]
        .split('<variables')[1]
        .replace(findVarRegExp,
            // type, id, name
            function(p, m1, m2, m3) {
              newBPCvars.push([m3, m2, m1]); // name, id, type
              return p;
            });
    varCodeTemp = projCode.split('</variables>');
    projCode = varCodeTemp[1];
    // type, id, name
    tmpv = varCodeTemp[0].replace(
        findVarRegExp,
        function(p, m1, m2, m3) {
          oldBPCvars.push([m3, m2, m1]); // name, id, type
          return p;
        });
    // record how many variables are in the original and new code
    tmpv = [oldBPCvars.length, newBPCvars.length];
    // iterate through the captured variables to detemine if any overlap
    for (let j = 0; j < tmpv[0]; j++) {
      for (let k = 0; k < tmpv[1]; k++) {
        // see if var is a match
        if (newBPCvars[k][0] === oldBPCvars[j][0]) {
          // replace old variable IDs with new ones
          const tmpVars = newCode.split(newBPCvars[k][1]);
          newCode = tmpVars.join(oldBPCvars[j][1]);
          // null the ID to mark that it's a duplicate and
          // should not be included in the combined list
          newBPCvars[k][1] = null;
        }
      }
    }
    for (let k = 0; k < tmpv[1]; k++) {
      if (newBPCvars[k][1]) {
        // Add var from uploaded xml to the project code
        oldBPCvars.push(newBPCvars[k]);
      }
    }

    // rebuild vars from both new/old
    tmpv = '<variables>';
    oldBPCvars.forEach(function(vi) {
      tmpv += '<variable id="' + vi[1] + '" type="' + vi[2] + '">' +
          vi[0] + '</variable>';
    });
    tmpv += '</variables>';
    // add everything back together
    projectData = tmpv + projCode + newCode;
  } else if (newCode.indexOf('<variables') > -1 &&
      projCode.indexOf('<variables') === -1) {
    projectData = newCode + projCode;
  } else {
    projectData = projCode + newCode;
  }
  currentProject.setCodeWithNamespace(projectData);
  refreshEditorCanvas(currentProject);
}
