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
     * Project constructor
     * @param name {string}
     * @param description {string}
     * @param board {ProjectProfiles}
     * @param projectType {ProjectTypes}
     * @param code {string}
     * @param created {Date}
     * @param modified {Date}
     * @param timestamp {number}
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
                code, created, modified, timestamp) {

        this.name = (name) ? name : "";
        this.description = (description) ? description : "";

        // board is an element of the ProjectProfiles object.
        // It should never be a string
        if (board && typeof board === 'object' && board.name) {
            // Handle legacy board types.
            if (board.name === 'activity-board') {
                this.boardType = ProjectProfiles['activityboard'];
            } else if (board.name === 'heb-wx') {
                this.boardType = ProjectProfiles['hebwx'];
            } else {
                this.boardType = board;
            }
        } else {
            console.warn("Unknown board type received on object initialization.");
            this.boardType = ProjectProfiles.unknown;
        }

        this.projectType = (projectType) ? ProjectTypes[projectType] : ProjectTypes.UNKNOWN;
        this.code = (code) ? code : this.EmptyProjectCodeHeader;

        // This should be a timestamp but is received as a string
        // TODO: Convert timestamp string to numeric values
        this.created = created;
        this.modified = modified;
        this.timestamp = timestamp;

        // instance properties that are deprecated
        this.id = 0;
        this.descriptionHtml = description;
        this.private = true;
        this.shared = false;
        this.user = 'offline';
        this.yours = true;
    }

    /**
     * Get all of the project details in one function call. This is
     * a direct replacement for the code that is converted to JSON
     * to persist the project to storage.
     * @returns {{shared: *, private: *, boardType: *, code: *, created: *, description: *, type: *, name: *, modified: *, descriptionHtml: *, id: *, user: *, yours: *, timestamp: *}}
     */
    getDetails() {
        return {
            id: this.id,
            board: this.boardType.name,
            type: this.projectType,
            name: this.name,
            description: this.description,
            "description-html": this.descriptionHtml,
            code: this.code,
            created: this.created,
            modified: this.modified,
            private: this.private,
            shared: this.shared,
            user: this.user,
            yours: this.yours,
            timestamp: this.timestamp
        };
    }


    /**
     * Save the project details to a specified location in the browser's
     * localStorage.
     * @param localStoreName
     */
    stashProject(localStoreName) {
        window.localStorage.setItem(
            localStoreName,
            JSON.stringify(this.getDetails()));
    }

    /**
     * Convert a string project board type
     * @param board {string}
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
     * Compare two instances of a Project.
     *
     * @param {object} projectA
     * @param {object} projectB
     *
     * @returns {boolean} True if the Project objects are equivalent, otherwise returns false.
     */
    static testProjectEquality(projectA, projectB) {
        if (!projectA) {
            console.log("Project A is empty");
            return false;
        }

        if (!projectB) {
            console.log("Project B is empty");
            return false;
        }

        if (!projectA.name || !projectB.name) {
            console.log("Project name is missing.");
            return false;
        }

        if (projectA.name !== projectB.name) {
           console.log("Project name A: %s Does not match B: %s", projectA.name, projectB.name);
           return false;
        }

        if (!projectA.description || !projectB.description) {
            console.log("Project description is undefined.");
            return false;
        }

        if (projectA.description !== projectB.description) {
            console.log("Project description mismatch");
        }

        if (projectA.type !== projectB.type) {
            console.log("ProjectType mismatch")
            return false;
        }

        if (projectA.board !== projectB.board) {
            console.log("Board type mismatch");
            return false;
        }

        if (projectA.code !== projectB.code) {
            console.log("Code segment mismatch");
            return false;
        }

        if (projectA.created !== projectB.created) {
            console.log("Project created timestamp mismatch");
            return false;
        }

        if (projectA.modified !== projectB.modified) {
            console.log("Project last modified timestamp mismatch");
            return false;
        }

        if (projectA.descriptionHtml !== projectB.descriptionHtml) {
            console.log("Project HTML description mismatch");
            return false;
        }

        if (projectA.id !== projectB.id) {
            console.log("Project A is not the same object as project B");
            return false;
        }

        // private: true
        // shared: false
        // timestamp: 1572365783099
        // user: "offline"
        // yours: true

        return true;
    }

}


/**
 * Constant string that represents the base, empty project header
 *
 * @type {string}
 *
 * @description Converting the string to a constant because it is referenced
 * in a number of places. The string is sufficiently complex that it could
 * be misspelled without detection.
 */
Project.prototype.EmptyProjectCodeHeader = '<xml xmlns="http://www.w3.org/1999/xhtml">';


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
        name: "activity-board",
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
    "flip": {
        name: "flip",
        description: "Propeller FLiP or Project Board",
        digital: [
            ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
            ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"],
            ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"],
            ["17", "17"], ["18", "18"], ["19", "19"], ["20", "20"], ["21", "21"],
            ["22", "22"], ["23", "23"], ["24", "24"], ["25", "25"], ["26", "26"],
            ["27", "27"]
        ],
        analog: [],
        baudrate: 115200,
        contiguous_pins_start: 0,
        contiguous_pins_end: 27,
        saves_to: [
            ["Propeller FLiP or Project Board", "flip"],
            ["Propeller Activity Board", "activity-board"],
            ["Other Propeller Boards", "other"]
        ]
    },
    "heb": {
        name: "heb",
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
        name: "heb-wx",
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
        name: "other",
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
        name: "propcfile",
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
        name: "s3",
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
        name: "unknown",
        description: "Board type is unknown",
        saves_to: []
    }
};


