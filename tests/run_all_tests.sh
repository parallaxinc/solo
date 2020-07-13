#!/bin/bash

# Check to see if we are running the tests locally
if [ -n "$TRAVIS" ]; then
  echo "Executing run_all_tests.sh from $(pwd)";
fi

echo "Running lint tests."
./node_modules/.bin/eslint src/modules

echo "End lint tests."
