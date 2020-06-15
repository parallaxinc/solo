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
 * Validates the blocks in the project
 *
 * @param {string} fileContent
 * @return {Array}  An arrray of block names
 */
// eslint-disable-next-line no-unused-vars,require-jsdoc
function validateProjectBlockList(fileContent) {
  // Loop through blocks to verify blocks are supported for the
  // project board type
  let blockList;
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(fileContent, 'image/svg+xml');
  const blockNodes = xmlDoc.getElementsByTagName('block');

  if (blockNodes.length > 0) {
    blockList = enumerateProjectBlockNames(blockNodes);
    for (const property in blockList) {
      if (! evaluateProjectBlockBoardType(blockList[property])) {
        blockList.push(property);
        console.log(
            'Block \'%s\' is incompatible with this project.',
            blockList[property]);
      }
    }
  }

  return blockList;
}


/**
 *
 * @param {Array} nodes
 * @return {[]}
 */
function enumerateProjectBlockNames(nodes) {
  const blockList = [];

  // blockNodes contains a list of block element objects and a list of block
  // name objects. The block element objects are enumerated as an array,
  // starting at 0. This loops through the block element objects to obtain the
  // individual block names.
  for (const property in nodes) {
    if (! isNaN(parseInt(property, 10))) {
      blockList.push(nodes[property].getAttribute('type'));
      console.log(`${property}: ${nodes[property].getAttribute('type')}`);
    }
  }

  return blockList;
}

/**
 *
 * @param {string} blockName
 * @return {boolean}
 */
function evaluateProjectBlockBoardType(blockName) {
  return blockName !== 'comments';
}
