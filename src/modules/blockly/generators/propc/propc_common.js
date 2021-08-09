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


import Blockly from 'blockly/core';
import {getDefaultProfile} from '../../../project';

/**
 * Build a list of user-defined constant values
 *
 * @return {[]}
 */
export function buildConstantsList() {
  const BLOCK_TYPE = 'constant_define';
  const userDefinedConstantsList = [];

  const allBlocks = Blockly.getMainWorkspace().getBlocksByType(BLOCK_TYPE, false);
  for (let x = 0; x < allBlocks.length; x++) {
    const vName = allBlocks[x].getFieldValue('CONSTANT_NAME');
    if (vName) {
      userDefinedConstantsList.push(vName);
    }
  }
  return userDefinedConstantsList.sortedUnique();
}

/**
 * Gets an array for Blockly blocks that match the parameter 'type'.
 *
 * @param {string} type
 * @return {Blockly.Block[]}
 */
export function getBlocksByType( type ) {
  return Blockly.getMainWorkspace().getBlocksByType(type, false);
}

/**
 * Verify that there is at least one block of the specified type defined
 *
 * @param {string} type
 * @return {number}
 */
export function verifyBlockTypeExists( type ) {
  const allBlocks = getBlocksByType(type);
  return (allBlocks.length > 0 ? 0 : -1);
}

/**
 * Ensure that there is at least one block of the specified type that is enabled
 *
 * @param {string} type
 * @return {boolean} True if at least one block of the specified type is enabled.
 * Otherwise, returns false.
 */
export function verifyBlockTypeEnabled( type ) {
  const allBlocks = getBlocksByType(type);
  let enabled = false;

  // Look for at least one copy of the block that is enabled
  allBlocks.forEach((block) => {
    if (block.isEnabled()) {
      enabled = true;
    }
  });

  return enabled;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Retrieve the digital array of the project board type.
 * @return {string[][] | *}
 */
export function getProfileDigital() {
  return getDefaultProfile().digital;
}
