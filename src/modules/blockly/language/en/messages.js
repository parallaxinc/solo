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
 * @fileOverview English strings.
 */

import Blockly from 'blockly/core';

// ------------------------------------------------------------------
// Text for the balloon help that appears when the cursor hovers
// over a button in the editor toolbar. The buttons are initialized
// in the editor.js file.
// ------------------------------------------------------------------
const tooltipText = [
  ['prop-btn-comp', 'Verify code (compile)'],
  ['prop-btn-ram', 'Run once (load code to RAM)'],
  ['prop-btn-eeprom', 'Load and run (save code to EEPROM)'],
  ['prop-btn-term', 'Open Serial Terminal'],
  ['prop-btn-graph', 'Open Graphing Output'],

  ['btn-graph-play', 'Pause/Resume the graph'],
  ['btn-graph-snapshot', 'Download a snapshot of the graph'],
  ['btn-graph-csv', 'Download graph data as CSV'],
  ['btn-graph-clear', 'Clear the graph']
];

// Context menus.
Blockly.MSG_DUPLICATE_BLOCK = 'Duplicate';
Blockly.MSG_REMOVE_COMMENT = 'Remove Comment';
Blockly.MSG_ADD_COMMENT = 'Add Comment';
Blockly.MSG_EXTERNAL_INPUTS = 'External Inputs';
Blockly.MSG_INLINE_INPUTS = 'Inline Inputs';
Blockly.MSG_DELETE_BLOCK = 'Delete Block';
Blockly.MSG_DELETE_X_BLOCKS = 'Delete %1 Blocks';
Blockly.MSG_COLLAPSE_BLOCK = 'Collapse Block';
Blockly.MSG_EXPAND_BLOCK = 'Expand Block';
Blockly.MSG_DISABLE_BLOCK = 'Disable Block';
Blockly.MSG_ENABLE_BLOCK = 'Enable Block';
Blockly.MSG_HELP = 'Help';

// Editor dialogs.
// Blockly.Msg.DIALOG_CLEAR_WORKSPACE = 'Clear Workspace';
// Blockly.Msg.DIALOG_CLEAR_WORKSPACE_WARNING =
//     'Are you sure you want to clear your workspace?  This action cannot be undone!';
Blockly.Msg.DIALOG_CHANGED_SINCE = 'The project has been changed since the last save.';
Blockly.Msg.DIALOG_PROJECT_SAVED = 'Project saved';
Blockly.Msg.DIALOG_SAVE_TITLE = 'Save';
Blockly.Msg.DIALOG_SAVE_FIRST = 'Save current project first?';
Blockly.Msg.DIALOG_PROJECT_SAVED_TEXT = 'The project has been saved';
Blockly.Msg.DIALOG_DOWNLOAD_GRAPH_DIALOG = 'Download Graph Output - Filename:';
Blockly.Msg.DIALOG_DOWNLOAD_DATA_DIALOG = 'Download Graph data as CSV - Filename:';
Blockly.Msg.DIALOG_ERROR = 'Error';
Blockly.Msg.DIALOG_LOADING_ERROR = 'Unable to load the project';
Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER = 'BlocklyProp Launcher';
Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER_CONFIGURE_TITLE = 'Configure the BlocklyProp-Launcher connection';
Blockly.Msg.DIALOG_SIDE_FILES_ERROR = 'A problem occurred when trying to create the SimpleIDE files: ';
Blockly.Msg.DIALOG_NO_CLIENT = '<i class="glyphicon glyphicon-exclamation-sign"></i> BlocklyProp Launcher <strong>is not running</strong>';
Blockly.Msg.DIALOG_NO_DEVICE_TEXT = 'Ensure it is connected, powered on, and selected in the ports list. Make sure your BlocklyProp Launcher is up-to-date.';
Blockly.Msg.DIALOG_DEVICE_COMM_ERROR_TEXT = 'BlocklyProp Launcher not available to communicate with a microcontroller. It may help to "Force Refresh" by pressing Control-Shift-R (Windows/Linux) or Command-Shift-R (Mac).';
Blockly.Msg.DIALOG_NO_DEVICE = 'No devices found';
Blockly.Msg.DIALOG_DEVICE_COMM_ERROR = 'Device communication error';
Blockly.Msg.DIALOG_PORT_SEARCHING = 'Searching...';
Blockly.Msg.DIALOG_CLIENT_SEARCHING = '<i class="glyphicon glyphicon-info-sign"></i> Looking for BlocklyProp Launcher';
Blockly.Msg.DIALOG_DOWNLOAD = 'Download Project - Filename:';
Blockly.Msg.DIALOG_UNSAVED_PROJECT = 'Unsaved Project';
Blockly.Msg.DIALOG_EMPTY_PROJECT = 'Empty Project';
Blockly.Msg.DIALOG_CANNOT_SAVE_EMPTY_PROJECT = 'You cannot save an empty project';
Blockly.Msg.DIALOG_CANNOT_COMPILE_EMPTY_PROJECT = 'You cannot compile an empty project';
Blockly.Msg.DIALOG_SAVE_BEFORE_ADD_BLOCKS = 'You must save your project before you can upload a blocks file to it.';
Blockly.Msg.DIALOG_MISSING_BLOCKS = 'Blocks missing';
Blockly.Msg.DIALOG_MISSING_BLOCKS_GRAPHING = 'To use the graphing feature, your program must have both a graph initialize block and a graph value block.';
Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES_TO_CONNECT = 'Simulated terminal because there are no devices available to connect to';
Blockly.Msg.DIALOG_GRAPH_NO_DEVICES_TO_CONNECT = 'Simulated graph because there are no devices available to connect to';
Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES = 'No connection established.';
Blockly.Msg.DIALOG_TERMINAL_CONNECTION_ESTABLISHED = 'Connection established with';
Blockly.Msg.DIALOG_TERMINAL_AT_BAUDRATE = 'at baudrate';


// Variable renaming.
Blockly.MSG_CHANGE_VALUE_TITLE = 'Change value:';
Blockly.MSG_NEW_VARIABLE = 'New variable...';
Blockly.MSG_NEW_VARIABLE_TITLE = 'New variable name:';
Blockly.MSG_RENAME_VARIABLE = 'Rename variable...';
Blockly.MSG_RENAME_VARIABLE_TITLE = 'Rename all "%1" variables to:';
Blockly.LANG_VARIABLES_SET_ITEM = 'item';
Blockly.LANG_VARIABLES_GET_ITEM = 'item';

// Control Blocks.
Blockly.LANG_CATEGORY_CONTROLS = 'Control';
Blockly.LANG_CONTROLS_IF_MSG_IF = 'if';
Blockly.LANG_CONTROLS_IF_MSG_ELSEIF = 'else if';
Blockly.LANG_CONTROLS_IF_MSG_ELSE = 'else';
Blockly.LANG_CONTROLS_IF_MSG_THEN = 'do';

Blockly.LANG_CONTROLS_IF_IF_TITLE_IF = 'if';
Blockly.LANG_CONTROLS_IF_IF_TOOLTIP = 'Add, remove, or reorder sections\nto reconfigure this if block.';
Blockly.LANG_CONTROLS_IF_ELSEIF_TITLE_ELSEIF = 'else if';
Blockly.LANG_CONTROLS_IF_ELSEIF_TOOLTIP = 'Add a condition to the if block.';

Blockly.LANG_CONTROLS_IF_ELSE_TITLE_ELSE = 'else';
Blockly.LANG_CONTROLS_IF_ELSE_TOOLTIP = 'Add a final, catch-all condition to the if block.';

Blockly.LANG_CONTROLS_REPEAT_TITLE_REPEAT = 'repeat';
Blockly.LANG_CONTROLS_REPEAT_TITLE_TIMES = 'times';
Blockly.LANG_CONTROLS_REPEAT_INPUT_DO = 'do';
Blockly.LANG_CONTROLS_FLOW_STATEMENTS_INPUT_OFLOOP = 'of loop';
Blockly.LANG_CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK = 'break out';
Blockly.LANG_CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE = 'continue with next iteration';
Blockly.LANG_CONTROLS_FLOW_STATEMENTS_WARNING = 'Warning:\nThis block may only\nbe used within a loop.';

// Logic Blocks.
Blockly.LANG_CATEGORY_LOGIC = 'Logic';
Blockly.LANG_LOGIC_OPERATION_AND = 'and';
Blockly.LANG_LOGIC_OPERATION_OR = 'or';
Blockly.LANG_LOGIC_NEGATE_INPUT_NOT = 'not';
Blockly.LANG_LOGIC_BOOLEAN_TRUE = 'true';
Blockly.LANG_LOGIC_BOOLEAN_FALSE = 'false';
Blockly.LANG_LOGIC_NULL = 'null';

// Math Blocks.
Blockly.LANG_CATEGORY_MATH = 'Math';

// Procedures Blocks.
Blockly.LANG_PROCEDURES_DEFNORETURN_PROCEDURE = 'method';
Blockly.LANG_PROCEDURES_DEFNORETURN_DO = 'do';
Blockly.LANG_PROCEDURES_DEFRETURN_PROCEDURE = Blockly.LANG_PROCEDURES_DEFNORETURN_PROCEDURE;
Blockly.LANG_PROCEDURES_DEFRETURN_DO = Blockly.LANG_PROCEDURES_DEFNORETURN_DO;
Blockly.LANG_PROCEDURES_DEFRETURN_RETURN = 'return';
Blockly.LANG_PROCEDURES_DEF_DUPLICATE_WARNING = 'Warning:\nThis method has\nduplicate parameters.';
Blockly.LANG_PROCEDURES_CALLNORETURN_CALL = 'do';
Blockly.LANG_PROCEDURES_CALLNORETURN_PROCEDURE = 'method';
Blockly.LANG_PROCEDURES_CALLRETURN_CALL = Blockly.LANG_PROCEDURES_CALLNORETURN_CALL;
Blockly.LANG_PROCEDURES_CALLRETURN_PROCEDURE = Blockly.LANG_PROCEDURES_CALLNORETURN_PROCEDURE;
Blockly.LANG_PROCEDURES_MUTATORCONTAINER_TITLE = 'parameters';
Blockly.LANG_PROCEDURES_MUTATORARG_TITLE = 'variable:';
Blockly.LANG_PROCEDURES_HIGHLIGHT_DEF = 'Highlight Procedure';
Blockly.LANG_PROCEDURES_IFRETURN_WARNING = 'Warning:\nThis block may only be\nused within a method.';

Blockly.Msg.ADD_COMMENT = 'Add Comment';
Blockly.Msg.AUTH = 'Please authorize this app to enable your work to be saved and to allow it to be shared by you.';
Blockly.Msg.CHANGE_VALUE_TITLE = 'Change value:';
Blockly.Msg.CHAT = 'Chat with your collaborator by typing in this box!';
Blockly.Msg.CLEAN_UP = 'Clean up Blocks';
Blockly.Msg.COLLAPSE_ALL = 'Collapse Blocks';
Blockly.Msg.COLLAPSE_BLOCK = 'Collapse Block';

Blockly.Msg.DELETE_ALL_BLOCKS = 'Delete all %1 blocks?';
Blockly.Msg.DELETE_BLOCK = 'Delete Block';
Blockly.Msg.DELETE_X_BLOCKS = 'Delete %1 Blocks';
Blockly.Msg.DISABLE_BLOCK = 'Disable Block';
Blockly.Msg.DUPLICATE_BLOCK = 'Duplicate';
Blockly.Msg.ENABLE_BLOCK = 'Enable Block';
Blockly.Msg.EXPAND_ALL = 'Expand Blocks';
Blockly.Msg.EXPAND_BLOCK = 'Expand Block';
Blockly.Msg.EXTERNAL_INPUTS = 'External Inputs';
Blockly.Msg.HELP = 'Help';
Blockly.Msg.INLINE_INPUTS = 'Inline Inputs';

Blockly.Msg.LOGIC_BOOLEAN_FALSE = Blockly.LANG_LOGIC_BOOLEAN_FALSE;
Blockly.Msg.LOGIC_BOOLEAN_TRUE = Blockly.LANG_LOGIC_BOOLEAN_TRUE;
Blockly.Msg.LOGIC_NEGATE_TITLE = 'not %1';
Blockly.Msg.LOGIC_NULL = Blockly.LANG_LOGIC_NULL;
Blockly.Msg.LOGIC_OPERATION_AND = Blockly.LANG_LOGIC_OPERATION_AND;
Blockly.Msg.LOGIC_OPERATION_OR = Blockly.LANG_LOGIC_OPERATION_OR;
Blockly.Msg.LOGIC_TERNARY_CONDITION = 'test';
Blockly.Msg.LOGIC_TERNARY_IF_FALSE = 'if false';
Blockly.Msg.LOGIC_TERNARY_IF_TRUE = 'if true';
Blockly.Msg.MATH_CHANGE_TITLE = 'change %1 by %2';
Blockly.Msg.MATH_CONSTRAIN_TITLE = 'constrain %1 low %2 high %3';
Blockly.Msg.MATH_ADDITION_SYMBOL = '+';
Blockly.Msg.MATH_DIVISION_SYMBOL = '÷';
Blockly.Msg.MATH_MULTIPLICATION_SYMBOL = '×';
Blockly.Msg.MATH_SUBTRACTION_SYMBOL = '-';

Blockly.Msg.ME = 'Me';
Blockly.Msg.NEW_VARIABLE = 'New variable...';
Blockly.Msg.NEW_VARIABLE_TITLE = 'New variable name:';
Blockly.Msg.ORDINAL_NUMBER_SUFFIX = '';
Blockly.Msg.PROCEDURES_ALLOW_STATEMENTS = 'allow statements';
Blockly.Msg.PROCEDURES_BEFORE_PARAMS = 'with:';
Blockly.Msg.PROCEDURES_CALL_BEFORE_PARAMS = 'with:';
Blockly.Msg.PROCEDURES_CREATE_DO = 'Create \'%1\'';
Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT = 'Describe this function...';
Blockly.Msg.PROCEDURES_DEFNORETURN_DO = '';
Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = 'my function';
Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE = 'function';
Blockly.Msg.PROCEDURES_DEFRETURN_RETURN = 'return';
Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP = 'Creates a function with an output.';
Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING = 'Warning: This function has duplicate parameters.';
Blockly.Msg.PROCEDURES_HIGHLIGHT_DEF = 'Highlight function definition';
Blockly.Msg.PROCEDURES_IFRETURN_WARNING = 'Warning: This block may be used only within a function definition.';
Blockly.Msg.PROCEDURES_MUTATORARG_TITLE = 'input name:';
Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TITLE = 'inputs';
Blockly.Msg.REDO = 'Redo';
Blockly.Msg.REMOVE_COMMENT = 'Remove Comment';
Blockly.Msg.RENAME_VARIABLE = 'Rename variable...';
Blockly.Msg.DELETE_VARIABLE = 'Delete variable \'%1\'';
Blockly.Msg.RENAME_VARIABLE_TITLE = 'Rename all \'%1\' variables to:';
Blockly.Msg.DELETE_VARIABLE_CONFIRMATION = 'Delete blocks containing %1 uses of the \'%2\' variable?';

Blockly.Msg.TODAY = 'Today';
Blockly.Msg.UNDO = 'Undo';
Blockly.Msg.VARIABLES_DEFAULT_NAME = 'item';
Blockly.Msg.VARIABLES_GET_CREATE_SET = 'Create \'set %1\'';
Blockly.Msg.VARIABLES_SET = 'set %1 to %2';
Blockly.Msg.VARIABLES_SET_CREATE_GET = 'Create \'get %1\'';
Blockly.Msg.PROCEDURES_DEFRETURN_TITLE = Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE;

// Blockly.Msg.CONTROLS_IF_MSG_IF
Blockly.Msg.CONTROLS_IF_IF_TITLE_IF = Blockly.LANG_CONTROLS_IF_MSG_IF;

// Blockly.Msg.CONTROLS_REPEAT_INPUT_DO
Blockly.Msg.CONTROLS_WHILEUNTIL_INPUT_DO = Blockly.LANG_CONTROLS_REPEAT_INPUT_DO;

// Blockly.Msg.CONTROLS_REPEAT_INPUT_DO
Blockly.Msg.CONTROLS_IF_MSG_THEN = Blockly.LANG_CONTROLS_REPEAT_INPUT_DO;

// Blockly.Msg.CONTROLS_IF_MSG_ELSE
Blockly.Msg.CONTROLS_IF_ELSE_TITLE_ELSE = Blockly.LANG_CONTROLS_IF_MSG_ELSE;
Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE = Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE;
Blockly.Msg.MATH_CHANGE_TITLE_ITEM = Blockly.Msg.VARIABLES_DEFAULT_NAME;
Blockly.Msg.MATH_NUMBER_RANGE_TOO_LARGE_WARNING = 'WARNING: Your value is too small!  It must be greater than or equal to ';
Blockly.Msg.MATH_NUMBER_RANGE_TOO_SMALL_WARNING = 'WARNING: Your value is too large!  It must be less than or equal to ';
Blockly.Msg.MATH_NUMBER_RANGE_VALUE_INVALID_WARNING = 'WARNING: The value you entered is not available or not allowed!';
Blockly.Msg.PROCEDURES_DEFRETURN_DO = Blockly.Msg.PROCEDURES_DEFNORETURN_DO;

// Blockly.Msg.CONTROLS_IF_MSG_ELSEIF
Blockly.Msg.CONTROLS_IF_ELSEIF_TITLE_ELSEIF = Blockly.LANG_CONTROLS_IF_MSG_ELSEIF;

// Blockly.Msg.CONTROLS_REPEAT_INPUT_DO
Blockly.Msg.CONTROLS_FOREACH_INPUT_DO = Blockly.LANG_CONTROLS_REPEAT_INPUT_DO;

// Blockly.Msg.CONTROLS_REPEAT_INPUT_DO
Blockly.Msg.CONTROLS_FOR_INPUT_DO = Blockly.LANG_CONTROLS_REPEAT_INPUT_DO;
Blockly.Msg.TEXT_APPEND_VARIABLE = Blockly.Msg.VARIABLES_DEFAULT_NAME;
Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TITLE_ITEM = Blockly.Msg.VARIABLES_DEFAULT_NAME;
Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT = Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT;

Blockly.DROPDOWN_MULTIPLIER = [
  ['1', '1'],
  ['10', '10'],
  ['100', '100'],
  ['1000', '1000'],
  ['10,000', '10000'],
  ['100,000', '100000'],
  ['1,000,000', '1000000']];


// --------------ActivityBoard Help URLs -----------------------
Blockly.MSG_CONTROL_HELPURL = 'https://learn.parallax.com/ab-blocks/control';
Blockly.MSG_NUMBERS_HELPURL = 'https://learn.parallax.com/ab-blocks/numbers';
Blockly.MSG_STRINGS_HELPURL = 'https://learn.parallax.com/ab-blocks/strings';
Blockly.MSG_ARRAYS_HELPURL = 'https://learn.parallax.com/ab-blocks/arrays';
Blockly.MSG_VALUES_HELPURL = 'https://learn.parallax.com/ab-blocks/values';
Blockly.MSG_VARIABLES_HELPURL = 'https://learn.parallax.com/ab-blocks/variables';
Blockly.MSG_FUNCTIONS_HELPURL = 'https://learn.parallax.com/ab-blocks/functions';
Blockly.MSG_PINS_HELPURL = 'https://learn.parallax.com/ab-blocks/pins';
Blockly.MSG_SERIAL_LCD_HELPURL = 'https://learn.parallax.com/ab-blocks/serial-lcd';
Blockly.MSG_PARALLEL_LCD_HELPURL = 'https://learn.parallax.com/ab-blocks/parallel-lcd';
Blockly.MSG_GRAPHING_HELPURL = 'https://learn.parallax.com/ab-blocks/graph';
Blockly.MSG_OLED_HELPURL = 'https://learn.parallax.com/ab-blocks/oled';
Blockly.MSG_EPAPER_HELPURL = 'https://learn.parallax.com/ab-blocks/epaper';
Blockly.MSG_BADGE_DISPLAY_HELPURL = 'https://learn.parallax.com/ab-blocks/badgedisplay';
Blockly.MSG_BADGE_IR_COMM_HELPURL = 'https://learn.parallax.com/ab-blocks/badgeir';
Blockly.MSG_TERMINAL_HELPURL = 'https://learn.parallax.com/ab-blocks/terminal';
Blockly.MSG_PROTOCOLS_HELPURL = 'https://learn.parallax.com/ab-blocks/protocols';
Blockly.MSG_SWX_HELPURL = 'https://learn.parallax.com/ab-blocks/simple-wx';
Blockly.MSG_AWX_HELPURL = 'https://learn.parallax.com/ab-blocks/advanced-wx';
Blockly.MSG_XBEE_HELPURL = 'https://learn.parallax.com/ab-blocks/xbee';
Blockly.MSG_KEYPAD_HELPURL = 'https://learn.parallax.com/ab-blocks/keypad';
Blockly.MSG_BME680_HELPURL = 'https://learn.parallax.com/ab-blocks/air-quality';
Blockly.MSG_FPS_HELPURL = 'https://learn.parallax.com/ab-blocks/fingerprint';
Blockly.MSG_COMPASS_HELPURL = 'https://learn.parallax.com/ab-blocks/compass';
Blockly.MSG_GPS_HELPURL = 'https://learn.parallax.com/ab-blocks/gps';
Blockly.MSG_JOYSTICK_HELPURL = 'https://learn.parallax.com/ab-blocks/joystick';
Blockly.MSG_MEMSIC_HELPURL = 'https://learn.parallax.com/ab-blocks/memsic';
Blockly.MSG_ACCELEROMETER_HELPURL = 'https://learn.parallax.com/ab-blocks/accelerometer';
Blockly.MSG_PING_HELPURL = 'https://learn.parallax.com/ab-blocks/ping';
Blockly.MSG_PIR_HELPURL = 'https://learn.parallax.com/ab-blocks/pir';
Blockly.MSG_RFID_HELPURL = 'https://learn.parallax.com/ab-blocks/rfid';
Blockly.MSG_SONY_REMOTE_HELPURL = 'https://learn.parallax.com/ab-blocks/sony-remote';
Blockly.MSG_SOUND_IMPACT_HELPURL = 'https://learn.parallax.com/ab-blocks/sound-impact';
Blockly.MSG_TEMPERATURE_HELPURL = 'https://learn.parallax.com/ab-blocks/temp-humidity';
Blockly.MSG_COLORPAL_HELPURL = 'https://learn.parallax.com/ab-blocks/colorpal';
Blockly.MSG_EEPROM_HELPURL = 'https://learn.parallax.com/ab-blocks/memory';
Blockly.MSG_SD_HELPURL = 'https://learn.parallax.com/ab-blocks/memory';
Blockly.MSG_ANALOG_PULSES_HELPURL = 'https://learn.parallax.com/ab-blocks/analog-pins';
Blockly.MSG_ANALOG_PWM_HELPURL = 'https://learn.parallax.com/ab-blocks/pwm';
Blockly.MSG_ANALOG_PULSE_IN_OUT_HELPURL = 'https://learn.parallax.com/ab-blocks/pulsein-out';
Blockly.MSG_ANALOG_RC_TIME_HELPURL = 'https://learn.parallax.com/ab-blocks/rc-time';
Blockly.MSG_AUDIO_HELPURL = 'https://learn.parallax.com/ab-blocks/audio';
Blockly.MSG_SERVO_HELPURL = 'https://learn.parallax.com/ab-blocks/servo';
Blockly.MSG_ROBOT_HELPURL = 'https://learn.parallax.com/ab-blocks/robot';
Blockly.MSG_IMU_HELPURL = 'https://learn.parallax.com/ab-blocks/lsm9ds1';
Blockly.MSG_LIS3DH_HELPURL = 'https://learn.parallax.com/ab-blocks/lis3dh';
Blockly.MSG_WS2812B_HELPURL = 'https://learn.parallax.com/ab-blocks/ws2812b';
Blockly.MSG_SYSTEM_HELPURL = 'https://learn.parallax.com/ab-blocks/system';
Blockly.MSG_BADGE_LEDS_HELPURL = 'https://learn.parallax.com/ab-blocks/badge-leds';
Blockly.MSG_BADGE_IR_HELPURL = 'https://learn.parallax.com/ab-blocks/badgeir';
Blockly.MSG_BADGE_WX_LOCK = 'https://learn.parallax.com/ab-blocks/badge-lock';
Blockly.MSG_BADGE_DISPLAY_HELPURL = 'https://learn.parallax.com/ab-blocks/badgedisplay';
Blockly.MSG_BADGE_BUTTONS_HELPURL = 'https://learn.parallax.com/ab-blocks/badge-buttons';
Blockly.MSG_BADGE_ACCEL_HELPURL = 'https://learn.parallax.com/ab-blocks/badge-accel';

// ----------Activity Board (Propeller C) block tooltips ----------------------------
Blockly.MSG_COMMENT_TOOLTIP = 'add comment: Leave a note for people that will not affect the program.';
Blockly.MSG_CONTROLS_IF_TOOLTIP = 'If...do: when condition attached is true. Click the gear to add conditions.';
Blockly.MSG_CONTROLS_SELECT_TOOLTIP = 'switch...case: does statements when case condition is true. Click the gear to add conditions.';
Blockly.MSG_CONTROLS_REPEAT_TOOLTIP = 'conditional repeat: forever, x times , until, or while attached condition is true.';
Blockly.MSG_CONTROL_REPEAT_FOR_LOOP_TOOLTIP = 'repeat item: use variable and value blocks for counted loop.';
Blockly.MSG_CONTROLS_BREAK_TOOLTIP = 'break: Exit loop and skip to the next block.';
Blockly.MSG_CONSTANT_DEF_TOOLTIP = 'define constant: provide a named constant and give it a value.';
Blockly.MSG_CONSTANT_VALUE_TOOLTIP = 'constant value: returns the value of a named constant.';
Blockly.MSG_ARRAY_GET_TOOLTIP = 'array get element: gets a the value of the specified element in the array.';
Blockly.MSG_ARRAY_INIT_TOOLTIP = 'array initialize: sets up the array with the specified number of elements.';
Blockly.MSG_ARRAY_FILL_TOOLTIP = 'array fill: fills the array with the specified values.  Must be a comma separated list of integers.';
Blockly.MSG_ARRAY_SET_TOOLTIP = 'array set element: sets the value of the specified element in the array.';
Blockly.MSG_ARRAY_CLEAR_TOOLTIP = 'array clear: sets all of the elements of the array to 0 (zero).';
Blockly.MSG_BASE_DELAY_TOOLTIP = 'pause: wait for specified time (in milliseconds) then continue.';
Blockly.MSG_BASE_COUNT_TOOLTIP = 'count pulses: counts the number of times the selected pin detects high pulses during the specified duration.';
Blockly.MSG_COG_NEW_TOOLTIP = 'new processor: launch attached “run function” block if processor is available.';
Blockly.MSG_CONTROLS_RETURN_TOOLTIP = 'return: Required at the end of code enclosed in a “define function” block.';
Blockly.MSG_MATH_ARITHMETIC_TOOLTIP = 'math operation: + addition, - subtraction, x multiplication, / division, or % modulus.';
Blockly.MSG_MATH_LIMIT_TOOLTIP = 'limit: use first value, but if it\'s outside of second value, use second value instead.';
Blockly.MSG_MATH_CREMENT_TOOLTIP = 'de/increment: increase or decrease attached variable by 1.';
Blockly.MSG_MATH_RANDOM_TOOLTIP = 'random: Pick random number between the low “from” and high “to” values.';
Blockly.MSG_MATH_BITWISE_TOOLTIP = 'bitwise:& AND, | OR, ^ XOR, >> right shift, << left shift.';
Blockly.MSG_LOGIC_OPERATION_TOOLTIP = 'boolean comparison: and, or, and not, or not; return 1/true or 0/false.';
Blockly.MSG_LOGIC_NEGATE_TOOLTIP = 'not: Get boolean (1/true or 0/false) opposite,\nnegate: get the negative decimal value,\nabs: get the absolute value of.';
Blockly.MSG_PARENS_TOOLTIP = 'parentheses: Surrounds the enclosed block with parentheses ().  Use to change the order of mathematical operations in a series of blocks.';
Blockly.MSG_LOGIC_COMPARE_TOOLTIP = 'compare values: boolean comparison returns 1/true or 0/false.';
Blockly.MSG_STRING_COMPARE_TOOLTIP = 'compare strings: returns 1/true or 0/false. Case sensitive.';
Blockly.MSG_STRING_LENGTH_TOOLTIP = 'length of string: number of characters in string or string variable.';
Blockly.MSG_COMBINE_STRINGS_TOOLTIP = 'combine strings: join inserted strings and store in chosen variable.';
Blockly.MSG_FIND_SUBSTRING_TOOLTIP = 'find string location: of first character in substring from larger string.';
Blockly.MSG_GET_CHAR_AT_POSITION_TOOLTIP = 'get character at position: ASCII value (0 to 255) for nth character in string.';
Blockly.MSG_SET_CHAR_AT_POSITION_TOOLTIP = 'set character at position: nth in string, set with ASCII value (0 to 255).';
Blockly.MSG_GET_SUBSTRING_TOOLTIP = 'get part of string: in range of positions; store in variable item.';
Blockly.MSG_MATH_NUMBER_TOOLTIP = 'number value: positive or negative; truncates to integers.';
Blockly.MSG_STRING_TYPE_BLOCK_TOOLTIP = 'text string: up to 128 characters.';
Blockly.MSG_CHAR_TYPE_BLOCK_TOOLTIP = 'character value: Get value (32 to 126) of printable ASCII character selected.';
Blockly.MSG_MUSIC_NOTE_BLOCK_TOOLTIP = 'music note: Get frequency value of specified note.';
Blockly.MSG_LOGIC_BOOLEAN_TOOLTIP = 'true/false: Choose a value of 1 (true) or 0 (false).';
Blockly.MSG_HIGH_LOW_VALUE_TOOLTIP = 'high/low: Choose a value of 1 (high) or 0 (low).';
Blockly.MSG_COLOR_PICKER_TOOLTIP = 'color: Get 24-bit integer for color selected in box.';
Blockly.MSG_COLOR_VALUE_FROM_TOOLTIP = 'color value from: inserted red, green, and blue values (0 to 255).';
Blockly.MSG_GET_CHANNEL_FROM_TOOLTIP = 'get red/green/blue: value (0 to 255) for chosen component of color.';
Blockly.MSG_COMPARE_COLORS_TOOLTIP = 'compare colors: returns value from 0 (opposite) to 255 (identical).';
Blockly.MSG_SYSTEM_COUNTER_TOOLTIP = 'system counter: 0 to 4,294,967,295 before rolling over, or current clock frequency in MHz.';
Blockly.MSG_WAITCNT_TOOLTIP = 'wait until counter: waits until the system counter reaches the specified value.';
Blockly.MSG_WAIT_PIN_TOOLTIP = 'wait until pin: waits until the pin (or pins when using a mask) is or is not equal to the specified state.';
Blockly.MSG_REGISTER_SET_TOOLTIP = 'cog set register: sets the value of the specified cog register.';
Blockly.MSG_REGISTER_GET_TOOLTIP = 'cog get register: retrieves the value of the specified cog register.';
Blockly.MSG_CUSTOM_CODE_TOOLTIP = 'user code: must be properly written Propeller C code.  Places code input into specified location.';
Blockly.MSG_CUSTOM_CODE_MULTIPLE_TOOLTIP = 'User defined code: Set label, color, code, block type, and inputs.\nAdd correctly formatted Propeller C code to the includes,\nglobals, setups, main, and functions sections.\n Use "@1, @2, @3, @4, or @5" to insert values from inputs 1, 2, 3, 4, or 5 into your custom C code.';
Blockly.MSG_SYSTEM_RUN_AS_SETUP_TOOLTIP = 'Run as setup: executes any code generated by the blocks inside this block at the setup, immediately after the main() function.  Allows regular blocks be be executed ahead of initialize blocks.';
Blockly.MSG_VARIABLES_SET_TOOLTIP = 'set variable: name and attach initial value block.';
Blockly.MSG_VARIABLES_GET_TOOLTIP = 'use variable: choose set variables from dropdown.';
Blockly.MSG_PROCEDURES_DEFNORETURN_TOOLTIP = 'define function: group blocks to re-use ending with return; name group.';
Blockly.MSG_PROCEDURES_CALLNORETURN_TOOLTIP = 'return: use in a “define function” block to go back to the main code.';
Blockly.MSG_MAKE_PIN_TOOLTIP = 'make PIN (dropdown): Select I/O pin and setting with menus.';
Blockly.MSG_MAKE_PIN_INPUT_TOOLTIP = 'make PIN (programmable): Select I/O pin with value and setting with menu.';
Blockly.MSG_CHECK_PIN_TOOLTIP = 'check PIN (dropdown): Set I/O pin to an input and get its state; high = 1, low = 0.';
Blockly.MSG_CHECK_PIN_INPUT_TOOLTIP = 'check PIN (programmable): Set I/O pin of inserted value to an input and get its state; high = 1, low = 0.';
Blockly.MSG_SET_PINS_TOOLTIP = 'set multiple pins: define group then set each pin. Do not use on P29-P31.';
Blockly.MSG_GET_PINS_TOOLTIP = 'binary get pins: gets the value of a group of pins as a binary value. Highest pin is MSB.';
Blockly.MSG_SET_PINS_BINARY_TOOLTIP = 'binary set pins: define group then set each pins using a binary value. Highest pin is MSB. Do not use on P29-P31.';
Blockly.MSG_GRAPH_SETTINGS_TOOLTIP = 'Graph initialize: set how long data is held and the range of the graph.';
Blockly.MSG_GRAPH_OUTPUT_TOOLTIP = 'Graph output: send attached values to the graph.  Use in a repeat loop with a pause block, don\'t send data more than once every 25 ms.';
Blockly.MSG_DEBUG_LCD_INIT_TOOLTIP = 'LCD initialize: set I/O pin to LCD; match baud to LCD switches.';
Blockly.MSG_DEBUG_LCD_PRINT_TOOLTIP = 'LCD print text: display on serial LCD.';
Blockly.MSG_DEBUG_LCD_PRINT_MULTIPLE_TOOLTIP = 'LCD print multiple: send attached values or text to the LCD.';
Blockly.MSG_DEBUG_LCD_NUMBER_TOOLTIP = 'LCD print number: display on serial LCD.';
Blockly.MSG_DEBUG_LCD_ACTION_TOOLTIP = 'LCD command: select from dropdown.';
Blockly.MSG_DEBUG_LCD_SET_CURSOR_TOOLTIP = 'LCD set cursor: row and column.';
Blockly.MSG_DEBUG_LCD_MUSIC_NOTE_TOOLTIP = 'LCD play note: at octave for time set.';
Blockly.MSG_OLED_INITIALIZE_TOOLTIP = 'Display initialize: match to Propeller I/O pin connections.';
Blockly.MSG_OLED_UPDATE_TOOLTIP = 'Display update: send new drawings to the display.';
Blockly.MSG_OLED_FONT_LOADER_TOOLTIP = 'Display font loader: run alone to add fonts to EEPROM.';
Blockly.MSG_OLED_GET_MAX_HEIGHT_TOOLTIP = 'Display max height in pixels, accounts for screen orientation.';
Blockly.MSG_OLED_GET_MAX_WIDTH_TOOLTIP = 'Display max width in pixels, accounts for screen orientation.';
Blockly.MSG_OLED_CLEAR_SCREEN_TOOLTIP = 'Display command: clear screen, sleep, wake, invert screen.';
Blockly.MSG_OLED_TEXT_COLOR_TOOLTIP = 'Display font color: background is transparent if matched to font.';
Blockly.MSG_OLED_TEXT_SIZE_TOOLTIP = 'Display set text: Med, large, script and bubble require font loader.';
Blockly.MSG_OLED_SET_CURSOR_TOOLTIP = 'Display set cursor: 0,0 is top-left corner of display.';
Blockly.MSG_OLED_PRINT_TEXT_TOOLTIP = 'Display print text: send string to display.';
Blockly.MSG_OLED_PRINT_NUMBER_TOOLTIP = 'Display print number: display value as decimal, hex, or binary.';
Blockly.MSG_OLED_PRINT_MULTIPLE_TOOLTIP = 'Display print multiple: send attached values or text to the display.';
Blockly.MSG_OLED_DRAW_PIXEL_TOOLTIP = 'Display draw pixel: at x, y from top-left corner.';
Blockly.MSG_OLED_DRAW_LINE_TOOLTIP = 'Display draw line: set start and end points; 0,0 is top-left.';
Blockly.MSG_OLED_DRAW_TRIANGLE_TOOLTIP = 'Display draw triangle: set x,y position of each corner.';
Blockly.MSG_OLED_DRAW_RECTANGLE_TOOLTIP = 'Display draw rectangle: set x,y position of each corner.';
Blockly.MSG_OLED_DRAW_CIRCLE_TOOLTIP = 'Display draw circle: x,y of center point, radius, color, fill. ';
Blockly.MSG_OLED_BITMAP_TOOLTIP = 'Display Bitmap: Enter the name of the file (don\'t include the .bmp at the end) and the\nx,y position (top-left corner) to begin drawing the bitmap image.';
Blockly.MSG_CONSOLE_PRINT_TOOLTIP = 'Terminal print text: display contents of string block.';
Blockly.MSG_CONSOLE_PRINT_VARIABLES_TOOLTIP = 'Terminal print number: display value as decimal, hex, binary, or ASCII.';
Blockly.MSG_CONSOLE_PRINT_MULTIPLE_TOOLTIP = 'Terminal print multiple: send attached values or text to the terminal.';
Blockly.MSG_CONSOLE_SCAN_TEXT_TOOLTIP = 'Terminal receive text: up to 128-character string in variable.';
Blockly.MSG_CONSOLE_SCAN_NUMBER_TOOLTIP = 'Terminal receive number: as integer in variable.';
Blockly.MSG_CONSOLE_NEWLINE_TOOLTIP = 'Terminal new line: move cursor to far left of the next line.';
Blockly.MSG_CONSOLE_CLEAR_TOOLTIP = 'Terminal clear screen: then move cursor to 0,0 top left.';
Blockly.MSG_CONSOLE_MOVE_TO_POSITION_TOOLTIP = 'Terminal set cursor: at position x,y. Use Clear screen block first.';
Blockly.MSG_CONSOLE_CLOSE_TOOLTIP = 'Terminal close: closes the Simple Terminal object so that pins 30 and 31 can be used for other purposes such as a full-duplex serial connection.';
Blockly.MSG_SERIAL_OPEN_TOOLTIP = 'Serial initialize: match to Propeller I/O pin connections and device Baud rate.';
Blockly.MSG_SERIAL_TX_TOOLTIP = 'Serial transmit number: sends 32-bit integer as 4 bytes MSB-first.';
Blockly.MSG_SERIAL_SEND_TEXT_TOOLTIP = 'Serial transmit text: sends text as characters terminated by a 0 (NULL).';
Blockly.MSG_SERIAL_STATUS_TOOLTIP = 'Serial status: returns true (1), false (0), or a character depending on the status of the serial connection and the type of status requested.';
Blockly.MSG_SERIAL_RX_TOOLTIP = 'Serial receive number: receives 4 bytes MSB first and stores a a 32-bit integer.';
Blockly.MSG_SERIAL_RECEIVE_TEXT_TOOLTIP = 'Serial receive text: receives and stores characters into a variable until a 0 (NULL).';
Blockly.MSG_SERIAL_PRINT_MULTIPLE_TOOLTIP = 'Serial send multiple: send attached values or text to the device connected to the specified pin.';
Blockly.MSG_SERIAL_SCAN_MULTIPLE_TOOLTIP = 'Serial receive multiple: receive numbers or characters from the specified pin and store them in the specified variables.';
Blockly.MSG_SHIFT_IN_TOOLTIP = 'shift in: serially shift in a specified number of bits and provides an integer value.';
Blockly.MSG_SHIFT_OUT_TOOLTIP = 'shift out: serially shift out a specified number of bits from the specified value.';
Blockly.MSG_I2C_SEND_TOOLTIP = 'i2c send: send data to the specified device and register/memory address using the i2c/TWI protocol.  Refer to the device\'s datasheet for device address and register information.';
Blockly.MSG_I2C_RECEIVE_TOOLTIP = 'i2c receive: receive data from the specified device and register/memory address using the i2c/TWI protocol.  Refer to the device\'s datasheet for device address and register information.';
Blockly.MSG_I2C_MODE_TOOLTIP = 'i2c mode: specify whether the i2c clock line (SCL) is open-collector (default) or driven/push-pull by the Propeller MCU.';
Blockly.MSG_I2C_BUSY_TOOLTIP = 'i2c busy: returns true if the i2c if the specified device is busy.  Refer to the device\'s datasheet for device address information.';
Blockly.MSG_SWX_INIT_TOOLTIP = 'Simple WX initialize: Requires simplewx.html file. Match DO/DI to Propeller I/O pin connections, set terminal and program routing.';
Blockly.MSG_SWX_CONFIG_PAGE_TOOLTIP = 'Simple WX configure page: Requires simplewx.html file. Set terminal page title and background color.';
Blockly.MSG_SWX_SET_TOOLTIP = 'Simple WX set widget: Requires simplewx.html file. Set location, type, color, and values for a new widget.';
Blockly.MSG_SWX_READ_TOOLTIP = 'Simple WX read widgets: Requires simplewx.html file. Reads the current values of all the widgets.';
Blockly.MSG_SWX_GET_TOOLTIP = 'Simple WX widget value: Requires simplewx.html file. Provides the value of a widget from when it was last read.';
Blockly.MSG_SWX_SEND_TOOLTIP = 'Simple WX send to widget: Requires simplewx.html file. Send a value to a widget.';
Blockly.MSG_AWX_INIT_ADV_TOOLTIP = 'Advanced WX initialize: Match DO/DI to Propeller I/O pin connections, set terminal and program routing.';
Blockly.MSG_AWX_GET_IP_TOOLTIP = 'WX Get IP address: provides the module\'s IP address as a text string.';
Blockly.MSG_AWX_SCAN_MULTIPLE_TOOLTIP = 'Advanced WX scan multiple: scans the incoming string and stores the data as specified.';
Blockly.MSG_AWX_PRINT_TOOLTIP = 'Advanced WX print: prints the specified data to the WX module.';
Blockly.MSG_AWX_SCAN_STRING_TOOLTIP = 'Advanced WX scan string: stores an incoming string in the specified variable.';
Blockly.MSG_AWX_SEND_TOOLTIP = 'Advanced WX send: sends the specified data to the TCP connection.';
Blockly.MSG_AWX_RECEIVE_TOOLTIP = 'Advanced WX receive: receives and stores TCP data.';
Blockly.MSG_AWX_POLL_TOOLTIP = 'Advanced WX poll: Instructs the WX module to monitor for a connection and data.';
Blockly.MSG_AWX_LISTEN_TOOLTIP = 'Advanced WX connect: listens for incoming data and provides the connection information.';
Blockly.MSG_AWX_CODE_TOOLTIP = 'Advanced WX code: provides the value for one of the codes used by the WX module.';
Blockly.MSG_AWX_MODE_TOOLTIP = 'Advanced WX mode: sets or gets the current mode of the WX module.';
Blockly.MSG_AWX_BUFFER_TOOLTIP = 'Advanced WX buffer: use to set up a receive buffer variable.';
Blockly.MSG_AWX_DISCONNECT_TOOLTIP = 'Advanced WX disconnect: disconnected from the specified connection.';
Blockly.MSG_AWX_JOIN_NETWORK_TOOLTIP = 'Advanced WX join network: Join a network by specifying its SSID and that network\'s passphrase.';
Blockly.MSG_AWX_GET_IP_TOOLTIP = 'Advanced WX get IP address: provides the IP address of the specified mode as a string.';
Blockly.MSG_XBEE_SETUP_TOOLTIP = 'XBee initialize: match to Propeller I/O pin connections and XBee Baud rate.';
Blockly.MSG_XBEE_TRANSMIT_TOOLTIP = 'XBee transmit: sends information to an XBee.  Strings and numbers are terminated with an ASCII 13';
Blockly.MSG_XBEE_RECEIVE_TOOLTIP = 'XBee receive: receives information from an XBee.  Expects strings and numbers to be terminated with an ASCII 13';
Blockly.MSG_XBEE_PRINT_MULTIPLE_TOOLTIP = 'XBee send multiple: send attached values or text to the Xbee module.';
Blockly.MSG_XBEE_SCAN_MULTIPLE_TOOLTIP = 'XBee receive multiple: receive numbers or characters from the XBee module and store them in the specified variables.';
Blockly.MSG_WS2812B_INIT_TOOLTIP = 'RGB-LED init: match to Propeller I/O pin connections and number of LEDs.';
Blockly.MSG_BADGE_RGB_INIT_TOOLTIP = 'RGB-LED number: set the number of RGB (WS2812b) LEDs.';
Blockly.MSG_WS2812B_SET_TOOLTIP = 'RGB-LED set: specify color for a specific LED.';
Blockly.MSG_WS2812B_MULTIPLE_TOOLTIP = 'RGB-LED set multiple: specify color for a range of consecutive LEDs.';
Blockly.MSG_WS2812B_UPDATE_TOOLTIP = 'RGB-LED update: update colors of all connected RGB-LEDs.';
Blockly.MSG_KEYPAD_INIT_TOOLTIP = '4x4 Keypad init: match to Propeller I/O pins:\nWith the keypad facing you, start match from the leftmost pin to the rightmost pin.\nThe four rightmost pins must be connected to pull down resistors\n of a resistance from 1 to 100 kOhm.';
Blockly.MSG_BME680_INIT_TOOLTIP = 'Air Quality init: match to Propeller I/O pin connections.';
Blockly.MSG_BME680_GET_VALUE_TOOLTIP = 'Air Quality get value: retrieves a value in the specified units from the last sensor reading.';
Blockly.MSG_BME680_READ_TOOLTIP = 'Air Quality read: trigger the sensor to take and store a reading.';
Blockly.MSG_BME680_HEATER = 'Air Quality heater: Enable or Disable the internal heating element in the Air Quality sensor.  If the heater is disabled, gas resistance will not provide a meaningful value.';
Blockly.MSG_KEYPAD_READ_TOOLTIP = '4x4 Keypad read: provides the value of the key pressed.\nIf none are pressed, provides (-1).';
Blockly.MSG_GPS_INIT_TOOLTIP = 'GPS Init: match to Propeller I/O pin connections and GPS module baud rate.';
Blockly.MSG_GPS_HASFIX_TOOLTIP = 'GPS has satellite fix: Returns 1 if there is a valid fix, 0 (zero) if not.';
Blockly.MSG_GPS_LAT_TOOLTIP = 'GPS latitude: provides latitude in microdegrees. North latitudes are positive, South latitudes are negative.';
Blockly.MSG_GPS_LONG_TOOLTIP = 'GPS longitude: provides longitude in microdegrees. East longitudes are positive, West longitudes are negative.';
Blockly.MSG_GPS_HEADING_TOOLTIP = 'GPS heading: provides compass heading in degrees.  Values are only valid when in motion';
Blockly.MSG_GPS_ALTITUDE_TOOLTIP = 'GPS altitude: provides altitude in centimeters above sea level.';
Blockly.MSG_GPS_SATS_TOOLTIP = 'GPS satellites tracked: provides the number of satellites the GPS module can see.';
Blockly.MSG_GPS_VELOCITY_TOOLTIP = 'GPS speed: provides the speed the module is travelling in the specified units.';
Blockly.MSG_FPS_INIT_TOOLTIP = 'Fingerprint scanner initialize: match to Propeller I/O pin connections.';
Blockly.MSG_FPS_ADD_TOOLTIP = 'Fingerprint scanner capture: capture and save or delete a capture or captures and their ID(s).';
Blockly.MSG_FPS_SCAN_TOOLTIP = 'Fingerprint scanner scan: scan and identify or scan and compare a fingerprint, or count the number of saved captures.';
Blockly.MSG_HMC5883L_INIT_TOOLTIP = 'Compass initialize: match to Propeller I/O pin connections.';
Blockly.MSG_HMC5883L_READ_TOOLTIP = 'Compass heading: get current heading in degrees.';
Blockly.MSG_JOYSTICK_INPUT_TOOLTIP = 'Joystick: gets position of specified Joystick axis, match to A/D socket.';
Blockly.MSG_MX2125_ACCELERATION_XAXIS_TOOLTIP = 'Memsic x acceleration: gets side-to-side acceleration, match to Propeller I/O pin.';
Blockly.MSG_MX2125_ACCELERATION_YAXIS_TOOLTIP = 'Memsic y acceleration: gets front to back acceleration, match to Propeller I/O pin.';
Blockly.MSG_MX2125_ROTATION_TOOLTIP = 'Memsic rotation: gets rotation in degrees when held like a steering wheel, match to Propeller I/O pins.';
Blockly.MSG_MX2125_TILT_XAXIS_TOOLTIP = 'Memsic x tilt: gets x-\tilt in degrees from level with horizon, match to Propeller I/O pin.';
Blockly.MSG_MX2125_TILT_YAXIS_TOOLTIP = 'Memsic y tilt: gets y-tilt in degrees from level with horizon, match to Propeller I/O pin.';
Blockly.MSG_MMA7455_INIT_TOOLTIP = 'Accelerometer initialize: match to Propeller I/O pin connections.';
Blockly.MSG_MMA7455_ACCELERATION_TOOLTIP = 'Accelerometer store values: stores measured x, y, & z acceleration in specified variables.';
Blockly.MSG_LSM9DS1_INIT_TOOLTIP = 'IMU initialize: match to Propeller I/O pin connections.';
Blockly.MSG_LSM9DS1_READ_TOOLTIP = 'IMU read: get measurements from specified sensor.';
Blockly.MSG_LSM9DS1_MAG_CALIBRATE_TOOLTIP = 'IMU Calibrate Magnetometer: Initialize first. Rotate slowly thru all 3 axes until P26/P27 LEDs turn off.';
Blockly.MSG_LSM9DS1_TILT_TOOLTIP = 'IMU tilt: gets tilt along specified axis.';
Blockly.MSG_LSM9DS1_HEADING_TOOLTIP = 'IMU heading: specify axes, get current heading in degrees.';
Blockly.MSG_LIS3DH_INIT_TOOLTIP = 'LIS3DH initialize: match to Propeller I/O pin connections. If measuring tilt, set a smoothing factor (0-100). If measuring temperature, set an initial value and units. If measuring ADC voltage, set the measured ground and 3.3V values. \nRight click and choose Help for more information.';
Blockly.MSG_LIS3DH_READ_TOOLTIP = 'LIS3DH read: Select the sensors to read, then select the variables to store the readings into.';
Blockly.MSG_LIS3DH_TEMP_TOOLTIP = 'LIS3DH temperature: read the temperature.';
Blockly.MSG_SENSOR_PING_TOOLTIP = 'Ping))) distance: gets distance measured in the specified units, match to Propeller I/O pin.';
Blockly.MSG_PIR_SENSOR_TOOLTIP = 'PIR sensor: returns 1/true if motion is detected, match to Propeller I/O pin.';
Blockly.MSG_RFID_ENABLE_TOOLTIP = 'RFID initialize: match to Propeller I/O pin connections.';
Blockly.MSG_RFID_GET_TOOLTIP = 'RFID read: gets ID from RFID tag near sensor, returns 0 if no tag detected.';
Blockly.MSG_RFID_DISABLE_TOOLTIP = 'RFID disable/enable: enables or disables the RFID reader.';
Blockly.MSG_RFID_CLOSE_TOOLTIP = 'RFID close: Closes RFID object, frees resources used.';
Blockly.MSG_SIRC_GET_TOOLTIP = 'Sony Remote value: returns button pressed on remote, returns -1 if none, match to Propeller I/O pin.';
Blockly.MSG_SOUND_IMPACT_RUN_TOOLTIP = 'Sound Impact initialize: match to Propeller I/O pin connections.';
Blockly.MSG_SOUND_IMPACT_GET_TOOLTIP = 'Sound Impact get count: gets number of sound impacts since last block was used last.';
Blockly.MSG_SOUND_IMPACT_END_TOOLTIP = 'Sound Impact close: Closes Sound Impact sensor object, frees resources used.';
Blockly.MSG_COLORPAL_ENABLE_TOOLTIP = 'ColorPal initialize: match to Propeller I/O pin connections.';
Blockly.MSG_COLORPAL_GET_COLORS_RAW_TOOLTIP = 'ColorPal raw colors: stores raw (uncalibrated) color measurements in specified variables.';
Blockly.MSG_COLORPAL_GET_COLORS_TOOLTIP = 'ColorPal get color: stores approximate color as a single integer into the specified variable.';
Blockly.MSG_DHT22_READ_TOOLTIP = 'Temp & Humidity read: trigger a DHT22/AM2302/CM2302 sensor connected to the specified pin to take and store a reading.  Must use a 10kOhm pullup resistor.';
Blockly.MSG_DHT22_VALUE_TOOLTIP = 'Temp & Humidity value: returns the specified measurement from the last sensor read using the Temp & Humidity read block.';
Blockly.MSG_EEPROM_READ_TOOLTIP = 'EEPROM read: reads information from EEPROM memory starting at the specified address.';
Blockly.MSG_EEPROM_WRITE_TOOLTIP = 'EEPROM write: writes information to EEPROM memory starting at the specified address.';
Blockly.MSG_RC_CHARGE_DISCHARGE_TOOLTIP = 'RC charge/discharge: returns the charge/discharge time of an RC circuit connected to the specified I/O pin.';
Blockly.MSG_AB_VOLT_IN_TOOLTIP = 'A/D read: returns the value measured by the connected A/D channel in volt-100ths.';
Blockly.MSG_AB_VOLT_OUT_TOOLTIP = 'D/A output: outputs voltage on the connected D/A channel in volt-100ths.';
Blockly.MSG_PULSE_IN_TOOLTIP = 'Pulse-in: measures the duration a high or low pulse received by the connected I/O pin.';
Blockly.MSG_PULSE_OUT_TOOLTIP = 'Pulse-out: outputs a high or low pulse to the specified I/O pin for the specified duration.';
Blockly.MSG_PWM_START_TOOLTIP = 'PWM initialize: sets up PWM object in the Propeller.';
Blockly.MSG_PWM_SET_TOOLTIP = 'PWM set: sends the specified PWM pulses out the Propeller I/O pin specified. Set duty cycle to 0 to stop sending pulses.';
Blockly.MSG_PWM_STOP_TOOLTIP = 'PWM stop: Stops PWM object, frees up resources used on the Propeller.';
Blockly.MSG_MCP320X_SET_VREF_TOOLTIP = 'A/D chip set Vref: Set to the Vref voltage of the A/D chip.';
Blockly.MSG_MCP320X_READ_TOOLTIP = 'A/D chip read: Reads an analog voltage from the specified channel. Match to Propeller I/O pin connections.';
Blockly.MSG_WAV_PLAY_TOOLTIP = 'WAV play: Plays named WAV file stored on the SD card. MUST be used with other types of blocks, see Help.';
Blockly.MSG_WAV_STATUS_TOOLTIP = 'WAV status: returns 1/true if a .WAV file is playing, returns 0/false if not.';
Blockly.MSG_WAV_VOLUME_TOOLTIP = 'WAV volume: sets the volume of the WAV player - 0 (quietest) to 10 (loudest).';
Blockly.MSG_WAV_STOP_TOOLTIP = 'WAV stop: Stops the WAV player object, frees up resources on the Propeller.';
Blockly.MSG_WAV_SET_PINS_TOOLTIP = 'WAV set pins: Use only at the beginning of your program to send the WAV file player output to different pins.';
Blockly.MSG_BASE_FREQOUT_TOOLTIP = 'frequency out: sends pulses to the I/O pin at the specified frequency.';
Blockly.MSG_SOUND_INIT_TOOLTIP = 'sound initialize: starts the polyphonic (multi-tone) sound process.';
Blockly.MSG_SOUND_PLAY_TOOLTIP = 'sound play: set or stop the frequency, set the volume, and/or set the waveform of one of the four available channels.';
Blockly.MSG_SD_INIT_TOOLTIP = 'SD card initialize: start the SD card utility.';
Blockly.MSG_SD_OPEN_TOOLTIP = 'SD card open: open or create the specified file on the SD card';
Blockly.MSG_SD_READ_TOOLTIP = 'SD card read: read from, write to, or close the current file on the SD card.';
Blockly.MSG_SD_FILE_POINTER_TOOLTIP = 'SD card file pointer: ';
Blockly.MSG_SD_CLOSE_TOOLTIP = 'Close SD card file.';
Blockly.MSG_SERVO_MOVE_TOOLTIP = 'Standard servo: sets the position of a standard servo connected to the I/O pin.';
Blockly.MSG_SERVO_SPEED_TOOLTIP = 'CR servo speed: sets the speed of a continuous rotation servo connected to the I/O pin.';
Blockly.MSG_SERVO_SET_RAMP_TOOLTIP = 'CR servo set ramp: sets the amount a servo\'s speed can change each update cycle.';
Blockly.MSG_FB360_INIT_TOOLTIP = 'Feedback 360 servo initialize: sets up the feedback control system for the servo.  Match the signal and feedback pins to the Propeller I/O pin connections.';
Blockly.MSG_FB360_SETUP_TOOLTIP = 'Feedback 360 servo configure: use to set the maximum acceleration or maximum speed of the servo. Specify either the servo\'s signal or feedback pin.';
Blockly.MSG_FB360_SET_TOOLTIP = 'Feedback 360 servo set: sets the speed, absolute angle (where 0 is the position the servo was initialized in), or relative angle (change from current position). Specify either the servo\'s signal or feedback pin.';
Blockly.MSG_FB360_GET_TOOLTIP = 'Feedback 360 servo get: retrieves the servo\'s absolute angle (where 0 is the position the servo was initialized in). Specify either the servo\'s signal or feedback pin.';
Blockly.MSG_FB360_STATUS_TOOLTIP = 'Feedback 360 servo status: returns whether the FB360 servo is (true) or is not (false) in the state selected in the dropdown.';
Blockly.MSG_ROBOT_DRIVE_INIT_TOOLTIP = 'Robot drive init: set up the Robot\'s drive system on the Propeller.';
Blockly.MSG_ROBOT_DRIVE_DISTANCE_TOOLTIP = 'Robot drive distance: drives each wheel a specified distance.';
Blockly.MSG_ROBOT_RAMPING_TOOLTIP = 'Robot set acceleration: sets how slowly or quickly the robot is\nable to change its speed.  Higher values allow for faster speed changes.';
Blockly.MSG_ROBOT_DISTANCE_MAX_SPEED_TOOLTIP = 'Robot drive maximum speed: Sets the maximum speed the robot is allowed to drive.';
Blockly.MSG_ROBOT_DRIVE_SPEED_TOOLTIP = 'Robot drive speed: drives each wheel at a specified speed.';
Blockly.MSG_ROBOT_DRIVE_STOP_TOOLTIP = 'Robot drive stop: stops the robot from driving.';
Blockly.MSG_ROBOT_GET_TICKS_TOOLTIP = 'Robot encoder counts: retrieves the current encoder counts and stores them in the specified variables.';
Blockly.MSG_ROBOT_ACTIVITYBOT_CALIBRATE_TOOLTIP = 'ActivityBot calibrate: runs the ActivityBot calibration routine.';
Blockly.MSG_ROBOT_ACTIVITYBOT_DISPLAY_CALIBRATION_TOOLTIP = 'ActivityBot display calibration: displays the calibration results on the terminal.';
Blockly.MSG_ROBOT_PARALLAXY_LOAD_TOOLTIP = 'ActivityBot load firmware: loads the specified pre-written program to the robot.';
Blockly.MSG_STRING_TO_NUMBER_TOOLTIP = 'string to number: convert a number (integer) value to a string.';
Blockly.MSG_NUMBER_TO_STRING_TOOLTIP = 'number to string: convert a string representing a number to an integer.';
Blockly.MSG_NUMBER_BINARY_TOOLTIP = 'binary value: use to enter a binary number.';
Blockly.MSG_NUMBER_HEX_TOOLTIP = 'hexadecimal value: use to enter a hexadecimal number.';
Blockly.MSG_CONSTRAIN_VALUE_TOOLTIP = 'constrain value: prevent a value from being too large or too small.';
Blockly.MSG_MAP_VALUE_TOOLTIP = 'map value: scale a value from one range to a different range.';
Blockly.MSG_MATH_ADVANCED_TOOLTIP = 'advanced math: perform a trigonometric, exponential, or logarithmic function.\nAngles are in degrees.';
Blockly.MSG_MATH_INV_TRIG_TOOLTIP = 'inverse trig: perform an inverse trigonometric function.\nAngles are in degrees.';
Blockly.MSG_STRING_SCAN_MULTIPLE_TOOLTIP = 'scan string: look for and extract values or characters from a string.';
Blockly.MSG_STRING_SPLIT_TOOLTIP = 'split string: use to split up a string separated by the defined character. Use more than once to extract multiple string parts.';
Blockly.MSG_STRING_NULL_TOOLTIP = 'string empty: use to test if a string is null or empty.';
Blockly.MSG_STRING_TRIM_TOOLTIP = 'trim string: remove extra spaces at the beginning and end of a string of text.';
Blockly.MSG_STRING_VAR_LENGTH_TOOLTIP = 'string variable set length: set the size (in characters + 1) of the variables that store text.';
Blockly.MSG_STRING_SPRINT_MULTIPLE_TOOLTIP = 'create string: make a new string from attached values or text.';
Blockly.MSG_HEB_BADGE_AXIS_ACCELERATION_TOOLTIP = 'Accelerometer get: returns acceleration and tilt on one of 3 axes (AX, AY, or AZ) in centigravity (cg) units, which is 100ths of 1 gravity (1 g).';
Blockly.MSG_HEB_BADGE_EEPROM_IS_STORED_TOOLTIP = 'Memory contact: check if a string of text has already been stored in EEPROM memory.';
Blockly.MSG_HEB_BADGE_EEPROM_RETRIEVE_TOOLTIP = 'Memory get contact: retrieve text with a certain index number from EEPROM memory.';
Blockly.MSG_HEB_BADGE_EEPROM_STORE_TOOLTIP = 'Memory store contact: store text up to 128 characters to EEPROM memory.';
Blockly.MSG_HEB_BADGE_WAS_SHAKEN_TOOLTIP = 'Accelerometer shaken: check if accelerometer was shaken within the last half second.';
Blockly.MSG_HEB_CLEAR_SCREEN_TOOLTIP = 'Badge Display clear screen: clears screen by setting all pixels to black.';
Blockly.MSG_HEB_COLOR_VAL_TOOLTIP = 'Badge color value: use with the Badge set RGB-LED block to specify the RGB-LED color.';
Blockly.MSG_HEB_COUNT_CONTACTS_TOOLTIP = 'Memory count contacts: returns how many contacts are currently stored in EEPROM memory.';
Blockly.MSG_HEB_SET_FONT_TOOLTIP = 'Badge Display set font: sets the displayed text to be either large or small.';
Blockly.MSG_HEB_CURSOR_POSITION_TOOLTIP = 'Badge Display set cursor: 0,0 is top-left corner of display.';
Blockly.MSG_HEB_ERASE_ALL_CONTACTS_TOOLTIP = 'Memory erase contacts: erases entire user portion of EEPROM memory by placing 255 in each location.';
Blockly.MSG_HEB_IR_CLEAR_BUFFER_TOOLTIP = 'IR clear buffer: clear the infrared send/receive buffers.';
Blockly.MSG_HEB_IR_READ_SIGNAL_TOOLTIP = 'IR receive message: receive text from another badge.';
Blockly.MSG_HEB_IR_SEND_SIGNAL_TOOLTIP = 'IR send text: send text to another badge.';
Blockly.MSG_HEB_OLED_BOX_TOOLTIP = 'Badge Display draw rectangle: set x,y position of each corner.';
Blockly.MSG_HEB_OLED_CIRCLE_TOOLTIP = 'Badge Display draw circle: x,y of center point, radius, color, fill. ';
Blockly.MSG_HEB_OLED_LINE_TOOLTIP = 'Badge Display draw line: set start and end points; 0,0 is top-left.';
Blockly.MSG_HEB_OLED_POINT_TOOLTIP = 'Badge Display draw point: at x, y from top-left corner.';
Blockly.MSG_HEB_OLED_TRIANGLE_TOOLTIP = 'Badge Display draw triangle: set x,y position of each corner.';
Blockly.MSG_HEB_PRINT_MULTIPLE_TOOLTIP = 'Badge Display print multiple: send attached values or text to the display.';
Blockly.MSG_HEB_PRINT_NUMERIC_VAR_TOOLTIP = 'Badge Display print number: display value as decimal, hex, or binary.';
Blockly.MSG_HEB_PRINT_STRING_VAR_TOOLTIP = 'Badge Display print text: send string to display.';
Blockly.MSG_HEB_PWM_LED_TOOLTIP = 'Badge set LED brightness: set the brightness of the specified LED.';
Blockly.MSG_HEB_ROTATE_TOOLTIP = 'Badge Display rotate: rotate the screen image 180 degrees.';
Blockly.MSG_HEB_SET_LED_RGB_TOOLTIP = 'Badge set RGB-LED: set the specified RGB LED to a specific color.';
Blockly.MSG_HEB_TEXT_TO_SPEECH_SAY_TOOLTIP = 'TTS say: speaks the specified string of text based on what phonemes are used.';
Blockly.MSG_HEB_TEXT_TO_SPEECH_SPELL_TOOLTIP = 'TTS spell: speaks each letter in the specified string of text individually.';
Blockly.MSG_HEB_TEXT_TO_SPEECH_PINS_TOOLTIP = 'TTS set pins: sets the pins used to output text-to-speech. If you do not hear sound when\nusing a speaker on the earphone jack, set the left and right\nto the same pin';
Blockly.MSG_HEB_TEXT_TO_SPEECH_VOLUME_TOOLTIP = 'TTS volume: sets volume of the text-to-speech output (0-quiet/off to 7-loudest).';
Blockly.MSG_HEB_TOGGLE_LED_OPEN_TOOLTIP = 'Badge set LED: turn the specified LED on or off.';
Blockly.MSG_HEB_TOGGLE_LED_TOOLTIP = 'Badge set LED: turn the specified LED on or off.';
Blockly.MSG_HEB_TOUCHPAD_SENSITIVITY_TOOLTIP = 'Touch sensitivity: sets the sensitivity of the touchpads (A & B) on the badge.';
Blockly.MSG_HEB_TOUCHPAD_STATUS_TOOLTIP = 'Button: returns the state of the specified rocker or touchpad button (1) pressed, (0) not pressed. ';
Blockly.MSG_HEB_WX_LOCK_TOOLTIP = 'Badge WiFi Lock: set the badge to allow or prevent itself from being programmed over WiFi.';


// -------Scribbler 3 help URLs ---------------------------------------------
Blockly.MSG_S3_COMMUNICATE_HELPURL = 'https://learn.parallax.com/s3-blocks/communicate';
Blockly.MSG_S3_CONTROL_HELPURL = 'https://learn.parallax.com/s3-blocks/control';
Blockly.MSG_S3_FACTORY_RESET_HELPURL = 'https://learn.parallax.com/s3-blocks/factory-reset';
Blockly.MSG_S3_FUNCTIONS_HELPURL = 'https://learn.parallax.com/s3-blocks/functions';
Blockly.MSG_S3_LEDS_HELPURL = 'https://learn.parallax.com/s3-blocks/leds';
Blockly.MSG_S3_LIGHT_HELPURL = 'https://learn.parallax.com/s3-blocks/light';
Blockly.MSG_S3_LINE_HELPURL = 'https://learn.parallax.com/s3-blocks/line';
Blockly.MSG_S3_MATH_HELPURL = 'https://learn.parallax.com/s3-blocks/math';
Blockly.MSG_S3_MOTORS_HELPURL = 'https://learn.parallax.com/s3-blocks/motors';
Blockly.MSG_S3_MEMORY_HELPURL = 'https://learn.parallax.com/s3-blocks/memory';
Blockly.MSG_S3_SERVO_HELPURL = 'https://learn.parallax.com/s3-blocks/servo';
Blockly.MSG_S3_OBSTACLE_HELPURL = 'https://learn.parallax.com/s3-blocks/obstacle';
Blockly.MSG_S3_PING_HELPURL = 'https://learn.parallax.com/s3-blocks/ping';
Blockly.MSG_S3_MIC_HELPURL = 'https://learn.parallax.com/s3-blocks/microphone';
Blockly.MSG_S3_SIRC_HELPURL = 'https://learn.parallax.com/s3-blocks/sirc';
Blockly.MSG_S3_RESET_BUTTON_HELPURL = 'https://learn.parallax.com/s3-blocks/reset-button';
Blockly.MSG_S3_SIMPLE_ACTIONS_HELPURL = 'https://learn.parallax.com/s3-blocks/simple-actions';
Blockly.MSG_S3_SIMPLE_CONTROL_HELPURL = 'https://learn.parallax.com/s3-blocks/simple-control';
Blockly.MSG_S3_SIMPLE_SENSORS_HELPURL = 'https://learn.parallax.com/s3-blocks/simple-sensors';
Blockly.MSG_S3_SOUND_HELPURL = 'https://learn.parallax.com/s3-blocks/sound';
Blockly.MSG_S3_STALL_HELPURL = 'https://learn.parallax.com/s3-blocks/stall';
Blockly.MSG_S3_VARIABLES_HELPURL = 'https://learn.parallax.com/s3-blocks/variables';
Blockly.MSG_S3_IO_HELPURL = 'https://learn.parallax.com/s3-blocks/io';


// -------Scribbler 3 block tooltips --------------------------
Blockly.MSG_S3_SCRIBBLER_LOOP_TOOLTIP = 'simple loop: repeats code inside the loop until an exit loop block is used.';
Blockly.MSG_S3_SCRIBBLER_LIMITED_LOOP_TOOLTIP = 'counted loop: repeats code a number of times';
Blockly.MSG_S3_SCRIBBLER_EXIT_LOOP_TOOLTIP = 'exit loop: exits out of a loop that is repeating code';
Blockly.MSG_S3_SCRIBBLER_SIMPLE_WAIT_TOOLTIP = 'simple wait: waits a set amount of time before moving on the to the next block';
Blockly.MSG_S3_SCRIBBLER_IF_LINE_TOOLTIP = 'detect line: detects a line underneath the Scribbler';
Blockly.MSG_S3_SCRIBBLER_IF_OBSTACLE_TOOLTIP = 'detect obstacle: detects if something is in front of the Scribbler';
Blockly.MSG_S3_SCRIBBLER_IF_LIGHT_TOOLTIP = 'detect ambient light: detects a light in front of the Scribbler';
Blockly.MSG_S3_SCRIBBLER_IF_STALLED_TOOLTIP = 'detect stall: detects if the Scribbler\'s wheels are stuck';
Blockly.MSG_S3_SCRIBBLER_IF_RANDOM_TOOLTIP = 'flip a coin: randomly returns a true or false';
Blockly.MSG_S3_SCRIBBLER_DRIVE_TOOLTIP = 'drive: used to move the Scribbler';
Blockly.MSG_S3_SCRIBBLER_SPIN_TOOLTIP = 'rotate: used to rotate the Scribbler';
Blockly.MSG_S3_SCRIBBLER_STOP_TOOLTIP = 'stop driving: stops the Scribbler\'s motors';
Blockly.MSG_S3_SCRIBBLER_PLAY_TOOLTIP = 'play note: plays a note using the Scribbler\'s speaker';
Blockly.MSG_S3_SCRIBBLER_LED_TOOLTIP = 'change LEDs: used to change the LED\'s on the Scribbler';
Blockly.MSG_S3_CONTROLS_REPEAT_TOOLTIP = 'conditional repeat: forever, x times , until, or while attached condition is true.';
Blockly.MSG_S3_CONTROLS_IF_TOOLTIP = 'if...do: when condition attached is true. Click the gear to add conditions.';
Blockly.MSG_S3_SCRIBBLER_WAIT_TOOLTIP = 'wait: waits a set amount of time before moving on the to the next block';
Blockly.MSG_S3_SPIN_COMMENT_TOOLTIP = 'note: use to add a note to your program.  Does not affect the program.';
Blockly.MSG_S3_PROCEDURES_DEFNORETURN_TOOLTIP = 'define function: group blocks to re-use ending with return; name group.';
Blockly.MSG_S3_PROCEDURES_CALLNORETURN_TOOLTIP = 'return: use in a “define function” block to go back to the main code.';
Blockly.MSG_S3_VARIABLES_SET_TOOLTIP = 'set variable: name and attach initial value block.';
Blockly.MSG_S3_VARIABLES_GET_TOOLTIP = 'use variable: choose set variables from dropdown.';
Blockly.MSG_S3_SPIN_INTEGER_TOOLTIP = 'number value: positive or negative; truncates to integers.';
Blockly.MSG_S3_MATH_INT_ANGLE_TOOLTIP = 'number of degrees: indicate how many degrees (rotation) to turn or move.';
Blockly.MSG_S3_SCRIBBLER_BOOLEAN_TOOLTIP = 'true/false: choose a true or false value';
Blockly.MSG_S3_SCRIBBLER_RANDOM_BOOLEAN_TOOLTIP = 'random true/false: randomly returns a true or false';
Blockly.MSG_S3_SCRIBBLER_RANDOM_NUMBER_TOOLTIP = 'random number: pick random number between the low “from” and high “to” values.';
Blockly.MSG_S3_MATH_ARITHMETIC_TOOLTIP = 'math operation: + addition, - subtraction, x multiplication, / division, or % modulus.';
Blockly.MSG_S3_MATH_LIMIT_TOOLTIP = 'highest/lowest: returns the highest or lowest of the two values inputted';
Blockly.MSG_S3_LOGIC_OPERATION_TOOLTIP = 'boolean comparison: and, or, and not, or not; returns true or false.';
Blockly.MSG_S3_LOGIC_NEGATE_TOOLTIP = 'not: returns false if input is true and true if input is false';
Blockly.MSG_S3_LOGIC_COMPARE_TOOLTIP = 'compare values: boolean comparison returns true or false';
Blockly.MSG_S3_LINE_SENSOR_TOOLTIP = 'line sensor reading: detection of a line by the sensors under the Scribbler';
Blockly.MSG_S3_LINE_CALIBRATE_TOOLTIP = 'line sensor calibrate: Use this block at the top of a line following program.\nSpins the Scribbler robot in place and calibrates the\nline following sensors by scanning the surface beneath it.';
Blockly.MSG_S3_OBSTACLE_SENSOR_TOOLTIP = 'obstacle sensor reading: detection of obstacles from the front sensors';
Blockly.MSG_S3_LIGHT_SENSOR_TOOLTIP = 'light sensor reading: measurements of light from the front sensors';
Blockly.MSG_S3_STALL_SENSOR_TOOLTIP = 'tail wheel stall: returns true of tail wheel is not spinning';
Blockly.MSG_S3_SPINNING_SENSOR_TOOLTIP = 'drive wheel stall: returns true if drive wheels are not spinning but should be';
Blockly.MSG_S3_RESET_BUTTON_PRESSES_TOOLTIP = 'button sensor: returns how many times the reset button was pressed';
Blockly.MSG_S3_SCRIBBLER_PING_TOOLTIP = 'Ping))) distance: measures distances using a Ping))) sensor attached to the hacker port';
Blockly.MSG_S3_SCRIBBLER_MIC_TOOLTIP = 'microphone: returns the volume of sound detected by the microphone as a percentage 0 to 100.';
Blockly.MSG_S3_SCRIBBLER_SIRC_TOOLTIP = 'Sony Remote value: returns button pressed on remote, returns -1 if none.';
Blockly.MSG_S3_MOVE_MOTORS_TOOLTIP = 'motor speed: use to move the Scribbler at specific speeds';
Blockly.MSG_S3_MOVE_MOTORS_DISTANCE_TOOLTIP = 'move distance: use to move the Scribbler specific distances';
Blockly.MSG_S3_MOVE_MOTORS_ANGLE_TOOLTIP = 'rotate by radius: rotates the scribbler by driving it';
Blockly.MSG_S3_MOVE_MOTORS_XY_TOOLTIP = 'move XY: use to move Scribbler to a new XY coordinate.\nChanges in position are relative to the position and\ndirection at the start of your program.\nOnly accurate when all movements are straight lines.';
Blockly.MSG_S3_SCRIBBLER_SERVO_TOOLTIP = 'rotate Servo: turns a servo connected to the hacker port to a position';
Blockly.MSG_S3_SCRIBBLER_STOP_SERVO_TOOLTIP = 'disable Servo: stops sending signals to the connected servo';
Blockly.MSG_S3_ANALOG_INPUT_TOOLTIP = 'analog read pin: Get the voltage input on the specified pin.';
Blockly.MSG_S3_DIGITAL_OUTPUT_TOOLTIP = 'digital set pin: Select I/O pin and setting with menus.';
Blockly.MSG_S3_DIGITAL_INPUT_TOOLTIP = 'digital read pin: Get the state of I/O pin; high = 1, low = 0.';
Blockly.MSG_S3_PLAY_POLYPHONY_TOOLTIP = 'play tone: mix two frequencies set in Hz.';
Blockly.MSG_S3_SCRIBBLER_MEMORY_READ_TOOLTIP = 'memory read: retrieve a value from the specified address (0 to 7936).';
Blockly.MSG_S3_SCRIBBLER_MEMORY_WRITE_TOOLTIP = 'memory write: save a value to the specified address (0 to 7936).  Values stay in memory even after the Scribbler is powered off.';
Blockly.MSG_S3_SERIAL_SEND_TEXT_TOOLTIP = 'send message: send text out from the serial port';
Blockly.MSG_S3_SERIAL_SEND_DECIMAL_TOOLTIP = 'send number: send a number out from the serial port';
Blockly.MSG_S3_SERIAL_SEND_CHAR_TOOLTIP = 'send character: send a character out from the serial port';
Blockly.MSG_S3_SERIAL_SEND_CTRL_TOOLTIP = 'send control character: send a special character out from the serial port';
Blockly.MSG_S3_SERIAL_CURSOR_XY_TOOLTIP = 'set cursor position: set the cursor position in the terminal';
Blockly.MSG_S3_SERIAL_RX_BYTE_TOOLTIP = 'receive character: receive a character from the serial port';
Blockly.MSG_S3_FACTORY_RESET_TOOLTIP = 'factory reset: use to reload the factory default demo program back onto the Scribbler';
Blockly.MSG_S3_ERROR_NO_WAS_CONDITION = 'WARNING: "was" ans "was not" conditions have been deprecated.\nPlease choose "is" or "is not".\nUse a variable block to keep track of the state of this sensor instead.';

export {tooltipText};
