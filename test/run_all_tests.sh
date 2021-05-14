#!/bin/bash

#
#   TERMS OF USE: MIT License
#
#   Permission is hereby granted, free of charge, to any person obtaining a
#   copy of this software and associated documentation files (the "Software"),
#   to deal in the Software without restriction, including without limitation
#   the rights to use, copy, modify, merge, publish, distribute, sublicense,
#   and/or sell copies of the Software, and to permit persons to whom the
#   Software is furnished to do so, subject to the following conditions:
#
#   The above copyright notice and this permission notice shall be included in
#   all copies or substantial portions of the Software.
#
#   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#   FITNESS FOR A PARTICULAR PURPOSE AND NONINFINGEMENT. IN NO EVENT SHALL
#   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
#   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
#   DEALINGS IN THE SOFTWARE.
#

# Check to see if we are running the tests locally
if [ -n "$TRAVIS" ]; then
  echo "Executing run_all_tests.sh from $(pwd)";
fi

echo "Running lint tests."
if  ./node_modules/.bin/eslint src/modules ; then
  echo "Lint succeeded."
else
    echo "Lint detected issues. Exiting"
    exit 1;
fi


echo "End lint tests."

echo "Running unit tests"
node test/mocha/run_mocha_tests_in_browser.js


# "jsunit" "node tests/jsunit/run_jsunit_tests_in_browser.js"
