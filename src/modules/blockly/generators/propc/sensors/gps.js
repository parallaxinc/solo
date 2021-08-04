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

// ------------------ GPS module Blocks -----------------------

import Blockly from 'blockly/core';
import {colorPalette} from '../../propc';
import {getDefaultProfile} from '../../../../project';
import {buildConstantsList} from './sensors_common';

/**
 * GPS Initialization
 * @type {{
 *  init: Blockly.Blocks.GPS_init.init,
 *  setPinMenus: Blockly.Blocks.GPS_init.setPinMenus,
 *  helpUrl: string, updateConstMenu: *
 *  }}
 */
Blockly.Blocks.GPS_init = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS');
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');

    // Prepare the Pin dropdown list
    this.userDefinedConstantsList_ = buildConstantsList();
    this.setPinMenus();
  },

  /**
   * Repopulate the pin drop down menus
   * @param {string} oldValue
   * @param {string} newValue
   */
  setPinMenus: function(oldValue='', newValue='') {
    const profile = getDefaultProfile();
    const m = this.getFieldValue('TXPIN');
    const b = this.getFieldValue('BAUD');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('GPS module initialize TX')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(
                this.userDefinedConstantsList_.map(function(value) {
                  return [value, value];
                }))), 'TXPIN')
        .appendField('baud')
        .appendField(new Blockly.FieldDropdown([
          ['9600', '9600'],
          ['2400', '2400'],
          ['4800', '4800'],
          ['19200', '19200'],
        ]), 'BAUD');
    this.setFieldValue(b, 'BAUD');
    if (m && m === oldValue && newValue) {
      this.setFieldValue(newValue, 'TXPIN');
    } else if (m) {
      this.setFieldValue(m, 'TXPIN');
    }
  },
};

/**
 * GPS Initialization C code generator
 * @return {string}
 */
Blockly.propc.GPS_init = function() {
  const profile = getDefaultProfile();
  let txPin = this.getFieldValue('TXPIN');
  if (profile.digital.toString().indexOf(txPin + ',' + txPin) === -1) {
    txPin = 'MY_' + txPin;
  }
  const baud = this.getFieldValue('BAUD');

  if (!this.disabled) {
    Blockly.propc.definitions_['include GPS'] = '#include "gps.h"';
  }
  return 'gps_open(' + txPin + ', 32, ' + baud + ');\npause(100);';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_hasFix.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_hasFix.onchange
 *  }}
 */
Blockly.Blocks.GPS_hasFix = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_HASFIX_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS has valid satellite fix');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_hasFix = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initialize block!';
  } else {
    return ['gps_fixValid()', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_latitude.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_latitude.onchange
 *  }}
 */
Blockly.Blocks.GPS_latitude = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_LAT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS latitude (\u00B5\u00B0)');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_latitude = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initialize block!';
  } else {
    return ['(int) (gps_latitude() * 1000000)', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_longitude.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_longitude.onchange
 *  }}
 */
Blockly.Blocks.GPS_longitude = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_LONG_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS longitude (\u00B5\u00B0)');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {[string, number]}
 * @constructor
 */
Blockly.propc.GPS_longitude = function() {
  Blockly.propc.definitions_['include GPS'] = '#include "gps.h"';
  const code = '(int) (gps_longitude() * 1000000)';

  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_heading.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_heading.onchange
 *  }}
 */
Blockly.Blocks.GPS_heading = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_HEADING_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS heading (\u00B0)');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_heading = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initialize block!';
  } else {
    return ['(int) gps_heading()', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_altitude.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_altitude.onchange
 *  }}
 */
Blockly.Blocks.GPS_altitude = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_ALTITUDE_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS altitude (cm)');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_altitude = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initialize block!';
  } else {
    return ['(int) (gps_altitude() * 100)', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_satsTracked.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_satsTracked.onchange
 *  }}
 */
Blockly.Blocks.GPS_satsTracked = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_SATS_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS number of satellites');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_satsTracked = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initalize block!';
  } else {
    return ['gps_satsTracked()', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_velocity.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_velocity.onchange
 *  }}
 */
Blockly.Blocks.GPS_velocity = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_VELOCITY_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS speed in')
        .appendField(new Blockly.FieldDropdown([
          ['mph', 'MPH'],
          ['knots', 'KNOTS'],
        ]), 'VELOCITYUNITS');

    this.setOutput(true, 'Number');
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_velocity = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initalize block!';
  } else {
    const velocityUnits = this.getFieldValue('VELOCITYUNITS');
    return [
      '(int) gps_velocity(' + velocityUnits + ')',
      Blockly.propc.ORDER_ATOMIC,
    ];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_date_time.init,
 *  updateShape_: Blockly.Blocks.GPS_date_time.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_date_time.onchange,
 *  domToMutation: Blockly.Blocks.GPS_date_time.domToMutation
 *  }}
 */
Blockly.Blocks.GPS_date_time = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_VELOCITY_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS current ')
        .appendField(new Blockly.FieldDropdown([
          ['year', 'GPS_UNIT_YEAR'],
          ['month', 'GPS_UNIT_MONTH'],
          ['day', 'GPS_UNIT_DAY'],
          ['hour', 'GPS_UNIT_HOUR'],
          ['minute', 'GPS_UNIT_MINUTE'],
          ['second', 'GPS_UNIT_SECOND'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().updateShape_(action);
        }), 'TIME_UNIT');
    this.setOutput(true, 'Number');
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
    this.setInputsInline(true);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('unit', this.getFieldValue('TIME_UNIT'));
    return container;
  },
  domToMutation: function(container) {
    // Create array of timezones
    this.timeZones = [['UTC+0', '0']];
    for (let tz = -1; tz != 0; tz--) {
      if (tz < -12) {
        tz = 14;
      }
      this.timeZones.push(['UTC' + (tz > -1 ? '+' : '') +
      tz.toString(10), tz.toString(10)]);
    }
    this.updateShape_(container.getAttribute('unit') || '');
  },
  updateShape_: function(action) {
    const show = ([
      'GPS_UNIT_HOUR',
      'GPS_UNIT_DAY',
      'GPS_UNIT_MONTH',
      'GPS_UNIT_YEAR',
    ].indexOf(action) >= 0);
    if (show && !this.getInput('ZONE_FIELDS')) {
      this.appendDummyInput('ZONE_FIELDS')
          .appendField('time zone', 'ZONE_LABEL')
          .appendField(new Blockly.FieldDropdown(this.timeZones), 'ZONE_VALUE');
    } else if (!show && this.getInput('ZONE_FIELDS')) {
      this.removeInput('ZONE_FIELDS');
    }
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {[string, number]|string}
 * @constructor
 */
Blockly.propc.GPS_date_time = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initalize block!';
  } else {
    const timeUnit = this.getFieldValue('TIME_UNIT');
    let zoneUnit = '0';
    if (timeUnit === 'GPS_UNIT_HOUR' ||
        timeUnit === 'GPS_UNIT_DAY' ||
        timeUnit === 'GPS_UNIT_MONTH' ||
        timeUnit === 'GPS_UNIT_YEAR') {
      zoneUnit = this.getFieldValue('ZONE_VALUE');
    }

    Blockly.propc.definitions_['include GPS'] = '#include "gps.h"';

    let dtDefines = '#define GPS_UNIT_YEAR     1\n';
    dtDefines += '#define GPS_UNIT_DAY      2\n';
    dtDefines += '#define GPS_UNIT_MONTH    3\n';
    dtDefines += '#define GPS_UNIT_HOUR     4\n';
    dtDefines += '#define GPS_UNIT_MINUTE   5\n';
    dtDefines += '#define GPS_UNIT_SECOND   6\n';
    Blockly.propc.definitions_['GPS_dateTime_units'] = dtDefines;

    const dtDeclare = 'int gps_dateTimeByUnit(char __u, int __z);\n';
    let dtFunction = 'int gps_dateTimeByUnit(char __u, int __z){';
    dtFunction += 'int __gpsTime = gps_rawTime();int __gpsDate =' +
        ' gps_rawDate();\n';
    dtFunction += 'int __monthDays[13] = {31, 31, 28, 31, 30, 31, 30, 31,' +
        ' 31, 30, 31, 30, 31};\n';
    dtFunction += 'int __gpsDay = __gpsDate / 10000;\n';
    dtFunction += 'int __gpsMonth = __gpsDate / 100 - (__gpsDate / 10000)' +
        ' * 100;\n';
    dtFunction += 'int __gpsYear = __gpsDate - (__gpsDate / 100) * 100;\n';
    dtFunction += 'if (__gpsYear % 4 == 0) __monthDays[2] = 29;\n';
    dtFunction += 'int __gpsHour = __gpsTime / 10000 + __z;\n';
    dtFunction += 'if (__gpsHour < 0) { __gpsHour += 24; __gpsDay--; }\n';
    dtFunction += 'if (__gpsHour > 23) { __gpsHour -= 24; __gpsDay++; }\n';
    dtFunction += 'if (__gpsDay > __monthDays[__gpsMonth]) { __gpsDay = 1;' +
        ' __gpsMonth++; }\n';
    dtFunction += 'if (__gpsDay < 1) { __gpsMonth--; __gpsDay =' +
        ' __monthDays[__gpsMonth]; }\n';
    dtFunction += 'if (__gpsMonth < 1) { __gpsYear--; __gpsMonth = 12; }\n';
    dtFunction += 'if (__gpsMonth > 12) { __gpsYear++; __gpsMonth = 1; }\n';
    dtFunction += 'switch (__u){case GPS_UNIT_DAY:return __gpsDay;break;\n';
    dtFunction += 'case GPS_UNIT_MONTH:\nreturn __gpsMonth;break;\n';
    dtFunction += 'case GPS_UNIT_YEAR:\nreturn __gpsYear;break;\n';
    dtFunction += 'case GPS_UNIT_HOUR:\nreturn __gpsHour;break;\n';
    dtFunction += 'case GPS_UNIT_MINUTE:\nreturn __gpsTime / 100 - (__gpsTime' +
        ' / 10000) * 100;break;\n';
    dtFunction += 'case GPS_UNIT_SECOND:\nreturn __gpsTime -' +
        ' (__gpsTime / 100) * 100;break;\n';
    dtFunction += 'default:\nreturn -1;break;}}';

    if (!this.disabled) {
      Blockly.propc.methods_['gps_time_func'] = dtFunction;
      Blockly.propc.method_declarations_['gps_time_func'] = dtDeclare;
    }
    return ['gps_dateTimeByUnit(' + timeUnit + ', ' + zoneUnit +
    ')', Blockly.propc.ORDER_ATOMIC];
  }
};

