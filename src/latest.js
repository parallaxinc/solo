
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
 * Project language types
 *
 * @type is an array of project language types
 */
var projectTypes = {
    "PROPC": {
        "editor": "blocklyc.jsp",
        "class": "editor-c-link"
    },
    "SPIN": {
        "editor": "blocklyc.jsp",
        "class": "editor-c-link"
    }
};


/**
 * Suppoted project board types
 *
 * @type is an array of project board types and their associated icons
 */
var projectBoard = {
    "activity-board": "icon-board-ab",
    "s3": "icon-board-s3",
    "heb": "icon-board-heb",
    "heb-wx": "icon-board-heb-wx",
    "flip": "icon-board-flip",
    "other": "icon-board-other",
    "propcfile": "icon-board-propc"
};

/**
 * Create a linked list of the five most recent projects.
 * Each link will display the project name and the project onwner.
 */
$.get("rest/shared/project/list?sort=modified&order=desc&limit=5&offset=0", function (data) {
    // Loop through each row returned
    $.each(data['rows'], function (index, project) {
        var user = '';

        // Set the user name for use in the anchor element below
        if (project['user']) {
            user = ' (' + project['user'] + ')';
        }

        var projectItem = $("<li/>", {
            "class": "project"
        });

        $("<a/>", {
            "class": "editor-view-link editor-icon " + projectBoard[project['board']],
            "href": "editor/" + projectTypes[project['type']]['editor'] + "?project=" + project['id'],
            "text": project['name'] + user
        }).appendTo(projectItem);

        $(".latest-projects").append(projectItem);
    });
});
