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

/*
 * Create a default project if one is not yet loaded onto the editor canvas.
 */


import {EMPTY_PROJECT_CODE_HEADER} from './constants.js';

import {Project, ProjectProfiles, ProjectTypes} from './project.js';

/**
 * Generate an empty default project
 * @return {Project}
 */
function buildDefaultProjectFile() {
  const date = new Date();
  return new Project(
      'MyProject',
      'Empty default project',
      ProjectProfiles.activityboard,
      ProjectTypes.PROPC,
      EMPTY_PROJECT_CODE_HEADER,
      date.getTime(),
      date.getTime(),
      date.getTime()
  );
}


export {buildDefaultProjectFile};
