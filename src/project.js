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



/**
 * Default implementation of a project object
 * @constructor
 */
class Project {
    /**
     * Stores a unique project identifier.
     * @type {number}
     * @private
     */
    id = 0;

    /**
     * Board type used in the defined project
     * @type {null}
     */
    boardType = ProjectProfiles.unknown;

    /**
     *  Project type
     * @type {string}
     * @private
     */
    type = ProjectTypes.UNKNOWN;

    /**
     * Project name. This also serves as the project file name.
     * @type {string}
     * @private
     */
    name = "";

    /**
     *
     * @type {string}
     * @private
     */
    description = "";

    /**
     *
     * @type {string}
     * @private
     */
    descriptionHtml = "";

    /**
     *
     * @type {string}
     * @private
     */
    code = EmptyProjectCodeHeader;

    /**
     *
     * @type {null}
     * @private
     */
    created = null;

    /**
     *
     * @type {null}
     * @private
     */
    modified = null;

    /**
     *
     * @type {boolean}
     * @private
     */
    private = true;

    /**
     *
     * @type {boolean}
     * @private
     */
    shared = false;

    /**
     *
     * @type {string}
     * @private
     */
    user = 'offline';

    /**
     *
     * @type {boolean}
     * @private
     */
    yours = true;

    /**
     *
     * @type {number}
     * @private
     */
    timestamp = getTimestamp();

    constructor(name, description, profile, code) {
        this.name = name;
        this.description = description;
        this.type = profile;
        this.code = code;
    }
}

/*
 *  Setter and Getter methods
 */

// Setters and Getters
Project.prototype.getId = () => {return this.id};
Project.prototype.setId = (value) => this.id = value;

Project.prototype.getName = () => { return this.name};
Project.prototype.setName = (value) => this.name = value;

Project.prototype.getBoardType = () => {return this.boardType};
Project.prototype.setBoardType = (value)=> this.boardType = value;

Project.prototype.getType = () => {return this.type};
Project.prototype.setType = (value)=> this.type = value;

Project.prototype.getDescription = () => {return this.description};
Project.prototype.setDescription = (value) => this.description = value;

Project.prototype.getDescriptionHtml = () => {return this.descriptionHtml};
Project.prototype.setDescriptionHtml = (value) => this.descriptionHtml = value;

Project.prototype.getCode = () => {return this.code};
Project.prototype.setCode = (value) => this.code = value;

Project.prototype.getCreated = () => {return this.created};
Project.prototype.setCreated = (value) => this.created = value;

Project.prototype.getModified = () => {return this.modified};
Project.prototype.setModified = (value) => this.modified = value;

Project.prototype.getPrivate = () => {return this.private};
Project.prototype.setPrivate = (value) => this.private = value;

Project.prototype.getShared = () => {return this.shared};
Project.prototype.setShared = (value) => this.shared = value;

Project.prototype.getUser = () => {return this.user};
Project.prototype.setUser = (value) => this.user = value;

Project.prototype.getYours = () => {return this.yours};
Project.prototype.setYours = (value) => this.yours = value;

Project.prototype.getTimestamp = () => {return this.timestamp};
Project.prototype.setTimestamp = (value) => this.timestamp = value;


/**
 * Get all of the project details in one function call
 * @returns {{shared: *, private: *, boardType: *, code: *, created: *, description: *, type: *, name: *, modified: *, descriptionHtml: *, id: *, user: *, yours: *, timestamp: *}}
 */
Project.prototype.getDetails = function() {
    return {
        id: this.id,
        boardType: this.boardType,
        type: this.type,
        name: this.name,
        description: this.description,
        descriptionHtml: this.descriptionHtml,
        code: this.code,
        created: this.created,
        modified: this.modified,
        private: this.private,
        shared: this.shared,
        user: this.user,
        yours: this.yours,
        timestamp: this.timestamp
    };
};


/**
 * The project type defines the code that the blocks will emit. There
 * used to be a SPIN output, but it has been deprecated. Saving this
 * implementation in case we want to introduce another language, such
 * as Python or GoLang.
 *
 * @type {{UNKNOWN: string, PROPC: string}}
 */
const ProjectTypes = {
    "PROPC": 'PROPC',
    "UNKNOWN": 'UNKNOWN'
};


// noinspection DuplicatedCode
/**
 * Board types describe the various types of hardware the project
 * will support. This includes robots, project boards and the S3
 *
 * @type Object - This returns a board type object
 */
const ProjectProfiles = {
    "activityboard": {
        description: "Propeller Activity Board",
        digital: [
            ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"],
            ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"],
            ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"],
            ["15", "15"], ["16", "16"], ["17", "17"], ["26", "26"], ["27", "27"]
        ],
        analog: [
            ["A0", "0"], ["A1", "1"], ["A2", "2"], ["A3", "3"]
        ],
        earphone_jack: "26, 27",
        earphone_jack_inverted: "-1, 27",
        sd_card: "22, 23, 24, 25",
        baudrate: 115200,
        contiguous_pins_start: 0,
        contiguous_pins_end: 17,
        saves_to: [
            ["Propeller Activity Board", "activity-board"],
            ["Propeller FLiP or Project Board", "flip"],
            ["Other Propeller Boards", "other"]
        ]
    },
    "heb": {
        description: "Hackable Electronic Badge",
        digital: [
            ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
            ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"]
        ],
        earphone_jack: "9, 10",
        earphone_jack_inverted: "-1, 10",
        analog: [],
        baudrate: 115200,
        contiguous_pins_start: 0,
        contiguous_pins_end: 11,
        saves_to: [
            ["Hackable Electronic Badge", "heb"],
            ["Badge WX", "heb-wx"]
        ]
    },
    "hebwx": {
        description: "Badge WX",
        digital: [
            ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
            ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"]
        ],
        analog: [],
        earphone_jack: "0, 1",
        earphone_jack_inverted: "-1, 1",
        sd_card: "8, 7, 6, 5",
        baudrate: 115200,
        contiguous_pins_start: 0,
        contiguous_pins_end: 11,
        saves_to: [
            ["Hackable Electronic Badge", "heb"],
            ["Badge WX", "heb-wx"]
        ]
    },
    "other": {
        description: "Other Propeller Boards",
        digital: [
            ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
            ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"],
            ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"],
            ["17", "17"], ["18", "18"], ["19", "19"], ["20", "20"], ["21", "21"],
            ["22", "22"], ["23", "23"], ["24", "24"], ["25", "25"], ["26", "26"],
            ["27", "27"], ["28", "28"], ["29", "29"], ["30", "30"], ["31", "31"]
        ],
        analog: [],
        baudrate: 115200,
        contiguous_pins_start: 0,
        contiguous_pins_end: 27,
        saves_to: [
            ["Other Propeller Boards", "other"],
            ["Propeller Activity Board", "activity-board"],
            ["Propeller FLiP or Project Board", "flip"]
        ]
    },
    "propcfile": {
        description: "Propeller C (code-only)",
        digital: [
            ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
            ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"],
            ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"],
            ["17", "17"], ["18", "18"], ["19", "19"], ["20", "20"], ["21", "21"],
            ["22", "22"], ["23", "23"], ["24", "24"], ["25", "25"], ["26", "26"],
            ["27", "27"], ["28", "28"], ["29", "29"], ["30", "30"], ["31", "31"]
        ],
        analog: [],
        baudrate: 115200,
        contiguous_pins_start: 0,
        contiguous_pins_end: 27,
        saves_to: []
    },
    "s3": {
        description: "Scribbler Robot",
        digital: [
            ["P0", "0"], ["P1", "1"], ["P2", "2"], ["P3", "3"], ["P4", "4"],
            ["P5", "5"]
        ],
        analog: [
            ["A0", "0"], ["A1", "1"]
        ],
        baudrate: 9600,
        contiguous_pins_start: 0,
        contiguous_pins_end: 5,
        saves_to: [
            ["Scribbler Robot", "s3"]
        ]
    },
    "unknown": {
        description: "Board type is unknown",
        saves_to: []
    }
};


/**
 * Constant string that represents the base, empty project header
 *
 * @type {string}
 *
 * @description Converting the string to a constant because it is referenced
 * in a number of places. The string is sufficiently complex that it could
 * be misspelled without detection.
 */
const EmptyProjectCodeHeader = '<xml xmlns="http://www.w3.org/1999/xhtml">';

