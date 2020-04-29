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

'use strict';
// import {NudgeTimer} from './nudge_timer';

/**
 * Constant string that represents the base, empty project header
 *
 * @type {string}
 *
 * @description Converting the string to a constant because it is referenced
 * in a number of places. The string is sufficiently complex that it could
 * be misspelled without detection.
 */
const EmptyProjectCodeHeader = '<xml xmlns="https://developers.google.com/blockly/xml">';

/**
 * Preserve the initial state of the project
 * @type {Project | null}
 */
let projectInitialState = null;

/**
 * Current project profile
 * @type {
 *  {
 *    digital: string[][], saves_to: ((string)[])[], analog: ((string)[])[],
 *    earphone_jack_inverted: string, baudrate: number, sd_card: string,
 *    name: string, description: string, earphone_jack: string,
 *    contiguous_pins_end: number, contiguous_pins_start: number
 *  } |
 *  {
 *    digital: string[][], saves_to: ((string)[])[], analog: *[],
 *    earphone_jack_inverted: string, baudrate: number, sd_card: string,
 *    name: string, description: string, earphone_jack: string,
 *    contiguous_pins_end: number, contiguous_pins_start: number
 *  } |
 *  ProjectProfiles |
 *  {
 *    saves_to: *[], name: string, description: string
    } |
 *  {
 *    saves_to: [], name: string, description: string
 *  }
 * }
 */
let defaultProfile = null;


/**
 * Reset the initial project state to null
 */
function clearProjectInitialState() {
  projectInitialState = null;
}

/**
 * Getter that exposes the projectInitialState
 * @return {Project | null}
 */
function getProjectInitialState() {
  return projectInitialState;
}


/**
 * Set the project state from an existing project object
 * @param {Project} project
 * @return {Project | null}
 */
function setProjectInitialState(project) {
  if (project instanceof Project) {
    if (project !== projectInitialState) {
      projectInitialState = project;
      defaultProfile = project.boardType;
    }
    return projectInitialState;
  }

  // We did not receive a valid object
  return null;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Return the current project profile
 *
 * @return {
 *    {
 *      digital: string[][],
 *      saves_to: string[][],
 *      analog: string[][],
 *      earphone_jack_inverted: string,
 *      baudrate: number,
 *      sd_card: string,
 *      name: string,
 *      description: string,
 *      earphone_jack: string,
 *      contiguous_pins_end: number,
 *      contiguous_pins_start: number
 *    } |
 *    {
 *      digital: string[][],
 *      saves_to: string[][],
 *      analog: *[],
 *      earphone_jack_inverted: string,
 *      baudrate: number,
 *      sd_card: string,
 *      name: string,
 *      description: string,
 *      earphone_jack: string,
 *      contiguous_pins_end: number,
 *      contiguous_pins_start: number
 *    } |
 *    ProjectProfiles |
 *    {
 *      saves_to: *[],
 *      name: string,
 *      description: string
 *  }}
 */
function getDefaultProfile() {
  return defaultProfile;
}

/**
 * Set the current project profile
 * @param {Project.boardType}  value
 */
function setDefaultProfile(value) {
  defaultProfile = value;
}

/**
 * Default implementation of a project object
 * @constructor
 */
class Project {
  /**
    * Project constructor
    * @param {string} name
    * @param {string} description
    * @param {ProjectProfiles} board
    * @param {ProjectTypes} projectType // 'PropC'
    * @param {string} code
    * @param {Date} created
    * @param {Date} modified
    * @param {number} timestamp
    * @param {boolean} [isDefault] - is this project the default project
    *
    * @description
    * The board types, also referenced as a specific board profile, are
    * identified by a text string, such as 'heb' or 'activity-board'. The
    * project class stores a reference to the specific profile in the
    * boardType field instead of the text reference. This allows one to
    * reference the various elements in the specific profile with a '.'
    * dot notation and eliminates some potential sources of errors due to
    * misspelling or array vs object references.
    */
  constructor(name, description, board, projectType,
      code, created, modified, timestamp, isDefault = false) {
    // Preserve the instance if one is not set
    projectInitialState = this;

    this.name = (name) ? name : '';
    this.description = (description) ? description : '';

    // board is an element of the ProjectProfiles object.
    // It should never be a string
    if (board && typeof board === 'object' && board['name']) {
      // Handle legacy board types.
      if (board['name'] === 'activity-board') {
        this.boardType = ProjectProfiles['activityboard'];
      } else if (board['name'] === 'heb-wx') {
        this.boardType = ProjectProfiles['hebwx'];
      } else {
        this.boardType = board;
      }
    } else {
      console.warn('Unknown board type received on object initialization.');
      this.boardType = ProjectProfiles.unknown;
    }

    /**
     * Set the project type.
     * @private
     * @description The only currently valid project type is "PROPC". If a
     * project is received and specifies another project type, it is set to
     * the default 'UNKNOWN' project type. There is a side effect to this in
     * that code throughout the system expects this value to be a real project
     * type, and not 'unknown'.
     * TODO: Throw an error here if the project type is "UNKNOWN".
     */
    this.projectType = (projectType) ?
        ProjectTypes[projectType] : ProjectTypes.UNKNOWN;

    /**
     * Initialize code to the default namespace if the code parameter is null
     * or is an empty string. Otherwise, use the code string passed in
     * @type {string}
     */
    this.code = (code && code.length > 0) ?
        code : EmptyProjectCodeHeader;

    // This should be a timestamp but is received as a string
    // TODO: Convert timestamp string to numeric values
    this.created = created;
    this.modified = modified;
    this.timestamp = timestamp;

    // instance properties that are deprecated
    /**
     * The unique project ID, used in the BlocklyProp server implementation.
     * @type {number}
     * @private
     * @deprecated All Solo projects are identified by unique path/filename
     * combinations on the user's local file system
     */
    this.id = 0;

    /**
     * The HTML encoded version of the project description.
     * @type {string}
     * @private
     * @deprecated The HTML description is no longer used in the Solo project.
     */
    this.descriptionHtml = description;

    /**
     * A flag to indicate the that the project is not public nor is it shared.
     * @type {boolean}
     * @private
     * @deprecated This flag is not used in the Solo project
     */
    this.private = true;

    /**
     * A flag to indicate that the online project is public and shared
     * @type {boolean}
     * @private
     * @deprecated This flag is not used in the Solo project
     */
    this.shared = false;

    /**
     * Flag to indicate if the project is being accessed through the
     * BlocklyProp server
     * @type {string} is 'online' to indicate use with the BlocklyProp
     * server, 'offline' when used with the Solo project.
     * @private
     * @deprecated This flag is not used in the Solo project
     */
    this.user = 'offline';

    /**
     * Flag to indicate that the project is owned by the current user
     * @type {boolean}
     * @private
     * @deprecated This flag is not used in the Solo project
     */
    this.yours = true;

    /**
     * Store a timer that will nudge the user to save project changes
     * @type {NudgeTimer}
     * @private
     */
    this.saveTimer = null;

    // Set the project initial state
    if (isDefault) {
      this.projectData = this.getDetails();
    }
  }

  /**
     * Get all of the project details in one function call. This is
     * a direct replacement for the code that is converted to JSON
     * to persist the project to storage.
     * @return {
     *   {
     *     shared: *, private: *, boardType: *, code: *, created: *,
     *     description: *, type: *, name: *, modified: *, descriptionHtml: *,
     *     id: *, user: *, yours: *, timestamp: *
     *   }
     * }
     */
  getDetails() {
    return {
      'id': this.id,
      'board': this.boardType.name,
      'type': this.projectType,
      'name': this.name,
      'description': this.description,
      'description-html': this.descriptionHtml,
      'code': this.code,
      'created': this.created,
      'modified': this.modified,
      'private': this.private,
      'shared': this.shared,
      'user': this.user,
      'yours': this.yours,
      'timestamp': this.timestamp,
    };
  }

  /**
   * Returns a reference to the project data encapsulated into a single object
   * @return {
   *   {
   *     shared: *, private: *, boardType: *, code: *, created: *,
   *     description: *, type: *, name: *, modified: *, descriptionHtml: *,
   *     id: *, user: *, yours: *, timestamp: *
   *   }
   * }
   */

  /**
     * Save the project details to a specified location in the browser's
     * localStorage.
     * @param {string} localStoreName
     */
  stashProject(localStoreName) {
    window.localStorage.setItem(
        localStoreName,
        JSON.stringify(this.getDetails()));
  }

  /**
   * Getter for the empty project code header constant
   * @return {string}
   */
  static getEmptyProjectCodeHeader() {
    return EmptyProjectCodeHeader;
  }

  /**
     * Convert a string project board type
     * @param {string} board
     * @return {object}
     */
  static convertBoardType(board) {
    switch (board) {
      case ProjectProfiles.activityboard.name:
        return ProjectProfiles.activityboard;

      case ProjectProfiles.hebwx.name:
        return ProjectProfiles.hebwx;

      case ProjectProfiles.heb.name:
        return ProjectProfiles.heb;

      case ProjectProfiles.s3.name:
        return ProjectProfiles.s3;

      case ProjectProfiles.flip.name:
        return ProjectProfiles.flip;

      case ProjectProfiles.propcfile.name:
        return ProjectProfiles.propcfile;

      case ProjectProfiles.other.name:
        return ProjectProfiles.other;

      default:
        return ProjectProfiles.unknown;
    }
  }

  /**
   * Compare the user-editable project fields for equality.
   * @param {Project} projectA
   * @param {Project }projectB
   * @return {boolean}
   */
  static compare(projectA, projectB) {
    if (!projectA) return false;
    if (!projectB) return false;

    if (projectA.name !== projectB.name) return false;
    if (projectA.description !== projectB.description) return false;
    return projectA.code === projectB.code;
  }

  /**
     * Compare two instances of a Project.
     *
     * @param {object} projectA
     * @param {object} projectB
     *
     * @return {boolean} True if the Project objects are equivalent,
     *         otherwise returns false.
     */
  static testProjectEquality(projectA, projectB) {
    let result = true;

    if (!projectA) {
      console.log('Project A is empty');
      result = false;
    }

    if (!projectB) {
      console.log('Project B is empty');
      result = false;
    }

    if (!projectA.name) {
      console.log('Project-A name is missing.');
      result = false;
    }

    if (!projectB.name) {
      console.log('Project-B name is missing.');
      result = false;
    }

    if (projectA.name !== projectB.name) {
      console.log('Project name A: %s Does not match B: %s',
          projectA.name, projectB.name);
      result = false;
    }

    if (!projectA.description || !projectB.description) {
      console.log('Project description is undefined.');
      result = false;
    }

    if (projectA.description !== projectB.description) {
      console.log('Project description mismatch');
      result = false;
    }

    if (projectA.type !== projectB.type) {
      console.log('ProjectType mismatch');
      result = false;
    }

    if (projectA.board !== projectB.board) {
      console.log('Board type mismatch');
      result = false;
    }

    if (projectA.code !== projectB.code) {
      console.log('Code segment mismatch');
      result = false;
    }

    if (projectA.created !== projectB.created) {
      console.log('Project created timestamp mismatch');
      result = false;
    }

    if (projectA.modified !== projectB.modified) {
      console.log('Project last modified timestamp mismatch');
      result = false;
    }

    if (projectA.descriptionHtml !== projectB.descriptionHtml) {
      console.log('Project HTML description mismatch');
      result = false;
    }

    if (projectA.id !== projectB.id) {
      console.log('Project A is not the same object as project B');
      result = false;
    }

    // private: true
    // shared: false
    // timestamp: 1572365783099
    // user: "offline"
    // yours: true

    return result;
  }

  /**
   * Get the state of the project when it was first loaded.
   * @return {Project}
   */
  static getProjectState() {
    return projectInitialState;
  }
}

/**
 * The Json representation of a project v0.
 *
 * @typedef {Object} JsonProjectType
 * @property {string} name - The project filename.
 * @property {string} board - The project board type.
 * @property {string} code - The XML block code in this project.
 * @property {string} created - The string representation of the project
 * created date/time.
 * @property {string} description - Notes that describe the project
 * @property {string} description-html - (deprecated) HTML version of the
 * description.
 * @property {number} id - (deprecated) The unique project ID.
 * @property {string} modified - Date/Time string noting the last time
 * the project was modified.
 * @property {boolean} private - (deprecated) Is the project private.
 * @property {boolean} shared - (deprecated) Is the project publicly shared.
 * @property {string} type - The project code generator output type.
 * @property {string} user - (deprecated) The project user name.
 * @property {boolean} yours - (deprecated) Is the project owned by the
 * current user.
 * @property {number} timestamp - The current epoch time.
 */

/**
 * The Json representation of a project v1.
 *
 * @typedef {Object} JsonProjectTypeV1
 * @property {string} name - The project filename.
 * @property {string} boardType - The project board type.
 * @property {string} code - The XML block code in this project.
 * @property {string} created - The string representation of the project
 * created date/time.
 * @property {string} description - Notes that describe the project
 * @property {string} description-html - (deprecated) HTML version of the
 * description.
 * @property {number} id - (deprecated) The unique project ID.
 * @property {string} modified - Date/Time string noting the last time
 * the project was modified.
 * @property {boolean} private - (deprecated) Is the project private.
 * @property {boolean} shared - (deprecated) Is the project publicly shared.
 * @property {string} type - The project code generator output type.
 * @property {string} user - (deprecated) The project user name.
 * @property {boolean} yours - (deprecated) Is the project owned by the
 * current user.
 * @property {number} timestamp - The current epoch time.
 * @property {string} version - The version of this typedef
 */

/**
 * Create a new Project object from JSON data
 *
 * @param {JsonProjectType | JsonProjectTypeV1} json Submit JSON data to
 * create a new project object
 *
 * @return {Project}
 */
function projectJsonFactory(json) {
  const date = new Date();
  let tmpBoardType;

  // Check for a version 0 project file.
  if (json && json.board) {
    tmpBoardType = Project.convertBoardType(json.board);
  } else {
    tmpBoardType = Project.convertBoardType(json.boardType.name);
  }
  if (tmpBoardType === undefined) {
    console.log('Unknown board type: %s', json.boardType.name);
  }

  return new Project(
      json.name,
      json.description,
      tmpBoardType,
      ProjectTypes.PROPC,
      json.code,
      Date.parse(json.created),
      Date.parse(json.modified),
      date.getTime()
  );
}

/**
 * The original code block XML namespace reference
 * @type {string}
 * @deprecated Use the EmptyProjectCodeHeader constant instead
 */
Project.prototype.EmptyProjectCodeHeader_V0 = '<xml xmlns="http://www.w3.org/1999/xhtml">';

/**
 * Install a project save timer into the project
 * @param {NudgeTimer} timer
 */
Project.prototype.setProjectTimer = function(timer) {
  this.saveTimer = timer;
};

/**
 * Reset the epoch base time
 */
Project.prototype.resetProjectTimer = function() {
  console.log('Resetting the project save timer');
  this.saveTimer.reset();
};

/**
 * Retrieve the time since the last save operation
 * @return {number}
 */
Project.prototype.getProjectTimeSinceLastSave = function() {
  return this.saveTimer.getTimeSinceLastSave();
};

/**
 * Get the timer epoch value
 * @return {number}
 */
Project.prototype.getProjectTimerEpoch = function() {
  return this.saveTimer.getEpochTime();
};

/**
 * The project type defines the code that the blocks will emit. There
 * used to be a SPIN output, but it has been deprecated. Saving this
 * implementation in case we want to introduce another language, such
 * as Python or GoLang.
 *
 * @type {{
 *  UNKNOWN: string,
 *  PROPC: string
 *  }}
 */
const ProjectTypes = {
  'PROPC': 'PROPC',
  'UNKNOWN': 'UNKNOWN',
};

/**
 * Board types describe the various types of hardware the project
 * will support. This includes robots, project boards and the S3
 *
 * // This returns a board type object
 * @type {{
 *  propcfile: {
 *    digital: string[][],
 *    saves_to: [],
 *    analog: [],
 *    baudrate: number,
 *    name: string,
 *    description: string,
 *    contiguous_pins_end: number,
 *    contiguous_pins_start: number
 *    },
 *  s3: {
 *    digital: string[][],
 *    saves_to: [
 *      [string, string]
 *    ],
 *    analog: [
 *      [string, string],
 *      [string, string]
 *    ],
 *    baudrate: number,
 *    name: string,
 *    description: string,
 *    contiguous_pins_end: number,
 *    contiguous_pins_start: number
 *    },
 *  activityboard: {
 *    digital: string[][],
 *    saves_to: [
 *      [string, string],
 *      [string, string],
 *      [string, string]
 *      ],
 *    analog: [
 *      [string, string],
 *      [string, string],
 *      [string, string],
 *      [string, string]
 *      ],
 *    earphone_jack_inverted: string,
 *    baudrate: number,
 *    sd_card: string,
 *    name: string,
 *    description: string,
 *    earphone_jack: string,
 *    contiguous_pins_end: number,
 *    contiguous_pins_start: number
 *    },
 *  other: {
 *    digital: string[][],
 *    saves_to: [
 *      [string, string],
 *      [string, string],
 *      [string, string]
 *      ],
 *    analog: [],
 *    baudrate: number,
 *    name: string,
 *    description: string,
 *    contiguous_pins_end: number,
 *    contiguous_pins_start: number
 *    },
 *  heb: {
 *    digital: string[][],
 *    saves_to: [
 *      [string, string],
 *      [string, string]
 *    ],
 *    analog: [],
 *    earphone_jack_inverted: string,
 *    baudrate: number,
 *    name: string,
 *    description: string,
 *    earphone_jack: string,
 *    contiguous_pins_end: number,
 *    contiguous_pins_start: number
 *    },
 *  flip: {
 *    digital: string[][],
 *    saves_to: [
 *      [string, string],
 *      [string, string],
 *      [string, string]
 *      ],
 *    analog: [],
 *    baudrate: number,
 *    name: string,
 *    description: string,
 *    contiguous_pins_end: number,
 *    contiguous_pins_start: number
 *    },
 *  hebwx: {
 *    digital: string[][],
 *    saves_to: [
 *      [string, string],
 *      [string, string]
 *      ],
 *    analog: [],
 *    earphone_jack_inverted: string,
 *    baudrate: number,
 *    sd_card: string,
 *    name: string,
 *    description: string,
 *    earphone_jack: string,
 *    contiguous_pins_end: number,
 *    contiguous_pins_start: number
 *    },
 *  unknown: {
 *    saves_to: [],
 *    name: string,
 *    description: string
 *    }
 *  }}
 */
const ProjectProfiles = {
  'activityboard': {
    name: 'activity-board',
    description: 'Propeller Activity Board',
    digital: [
      ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
      ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'],
      ['10', '10'], ['11', '11'], ['12', '12'], ['13', '13'], ['14', '14'],
      ['15', '15'], ['16', '16'], ['17', '17'], ['26', '26'], ['27', '27'],
    ],
    analog: [
      ['A0', '0'], ['A1', '1'], ['A2', '2'], ['A3', '3'],
    ],
    earphone_jack: '26, 27',
    earphone_jack_inverted: '-1, 27',
    sd_card: '22, 23, 24, 25',
    baudrate: 115200,
    contiguous_pins_start: 0,
    contiguous_pins_end: 17,
    saves_to: [
      ['Propeller Activity Board', 'activity-board'],
      ['Propeller FLiP or Project Board', 'flip'],
      ['Other Propeller Boards', 'other'],
    ],
  },
  'flip': {
    name: 'flip',
    description: 'Propeller FLiP or Project Board',
    digital: [
      ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'],
      ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'],
      ['11', '11'], ['12', '12'], ['13', '13'], ['14', '14'], ['15', '15'],
      ['16', '16'], ['17', '17'], ['18', '18'], ['19', '19'], ['20', '20'],
      ['21', '21'], ['22', '22'], ['23', '23'], ['24', '24'], ['25', '25'],
      ['26', '26'], ['27', '27'],
    ],
    analog: [],
    baudrate: 115200,
    contiguous_pins_start: 0,
    contiguous_pins_end: 27,
    saves_to: [
      ['Propeller FLiP or Project Board', 'flip'],
      ['Propeller Activity Board', 'activity-board'],
      ['Other Propeller Boards', 'other'],
    ],
  },
  'heb': {
    name: 'heb',
    description: 'Hackable Electronic Badge',
    digital: [
      ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'],
      ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'],
      ['11', '11'],
    ],
    earphone_jack: '9, 10',
    earphone_jack_inverted: '-1, 10',
    analog: [],
    baudrate: 115200,
    contiguous_pins_start: 0,
    contiguous_pins_end: 11,
    saves_to: [
      ['Hackable Electronic Badge', 'heb'],
      ['Badge WX', 'heb-wx'],
    ],
  },
  'hebwx': {
    name: 'heb-wx',
    description: 'Badge WX',
    digital: [
      ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'],
      ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'],
      ['11', '11'],
    ],
    analog: [],
    earphone_jack: '0, 1',
    earphone_jack_inverted: '-1, 1',
    sd_card: '8, 7, 6, 5',
    baudrate: 115200,
    contiguous_pins_start: 0,
    contiguous_pins_end: 11,
    saves_to: [
      ['Hackable Electronic Badge', 'heb'],
      ['Badge WX', 'heb-wx'],
    ],
  },
  'other': {
    name: 'other',
    description: 'Other Propeller Boards',
    digital: [
      ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'],
      ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'],
      ['11', '11'], ['12', '12'], ['13', '13'], ['14', '14'], ['15', '15'],
      ['16', '16'], ['17', '17'], ['18', '18'], ['19', '19'], ['20', '20'],
      ['21', '21'], ['22', '22'], ['23', '23'], ['24', '24'], ['25', '25'],
      ['26', '26'], ['27', '27'], ['28', '28'], ['29', '29'], ['30', '30'],
      ['31', '31'],
    ],
    analog: [],
    baudrate: 115200,
    contiguous_pins_start: 0,
    contiguous_pins_end: 27,
    saves_to: [
      ['Other Propeller Boards', 'other'],
      ['Propeller Activity Board', 'activity-board'],
      ['Propeller FLiP or Project Board', 'flip'],
    ],
  },
  'propcfile': {
    name: 'propcfile',
    description: 'Propeller C (code-only)',
    digital: [
      ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'],
      ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'],
      ['11', '11'], ['12', '12'], ['13', '13'], ['14', '14'], ['15', '15'],
      ['16', '16'], ['17', '17'], ['18', '18'], ['19', '19'], ['20', '20'],
      ['21', '21'], ['22', '22'], ['23', '23'], ['24', '24'], ['25', '25'],
      ['26', '26'], ['27', '27'], ['28', '28'], ['29', '29'], ['30', '30'],
      ['31', '31'],
    ],
    analog: [],
    baudrate: 115200,
    contiguous_pins_start: 0,
    contiguous_pins_end: 27,
    saves_to: [],
  },
  's3': {
    name: 's3',
    description: 'Scribbler Robot',
    digital: [
      ['P0', '0'], ['P1', '1'], ['P2', '2'], ['P3', '3'], ['P4', '4'],
      ['P5', '5'],
    ],
    analog: [
      ['A0', '0'], ['A1', '1'],
    ],
    baudrate: 9600,
    contiguous_pins_start: 0,
    contiguous_pins_end: 5,
    saves_to: [
      ['Scribbler Robot', 's3'],
    ],
  },
  'unknown': {
    name: 'unknown',
    description: 'Board type is unknown',
    digital: [['P0', '0']],
    analog: [['A0', '0']],
    saves_to: [],
  },
};


/**
 * A board type interface definition
 *
 * @typedef {{
 *    boardType:object,
 *    board:string,
 *    board.name:string,
 *    board.description:string,
 *    board.digital:string [][],
 *    board.analog:string [][],
 *    [board.earphone_jack]:string,
 *    [board.earphone_jack_inverted]:string,
 *    [board.baudrate]:number,
 *    [board.sd_card]:string,
 *    [board.contiguous_pins_start]:number,
 *    [board.contiguous_pins_end],
 *     board.saves_to:string [][]
 *    }}
 */
Project.aBoardType;

export {
  Project,
  clearProjectInitialState,
  getProjectInitialState,
  setProjectInitialState,
  getDefaultProfile,
  setDefaultProfile,
  projectJsonFactory,
  ProjectProfiles, ProjectTypes};
