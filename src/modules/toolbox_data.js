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

// import {getKeyValue} from './url_parameters.js';
// eslint-disable-next-line camelcase
import {toolbox_label} from './blockly/language/en/messages.js';

/**
 * Create a string representation of an XML array that defines the menu
 * system used in the editor page.
 *
 * @type {string}
 *
 * @description
 *
 * Block definitions may contain the 'experimental=true' attribute. This
 * designates the menu item as 'not ready for production' and will be excluded
 * from systems that are configured to disable experimental code. See the
 * configuration option 'experimental' for additional details.
 *
 * Note that the code below currently detects that the attribute
 * exists and DOES NOT evaluate the value of the attribute.
 */
// eslint-disable-next-line no-unused-vars
let xmlToolbox = '<xml id="toolbox">';

xmlToolbox += menuControl();
xmlToolbox += menuOperators();
xmlToolbox += '<sep></sep>';
xmlToolbox += menuValues();
xmlToolbox += menuOperatorArrays();

xmlToolbox += '<category key="category_variables" custom="VARIABLE" colour="250"></category>';
xmlToolbox += '<category key="category_functions" custom="PROCEDURE" colour="225"></category>';

xmlToolbox += menuIOPinStates();

xmlToolbox += '<sep include="heb,heb-wx,"></sep>';

xmlToolbox += menuCommunication();
/* END OF THE COMMUNICATIONS CATEGORY */


xmlToolbox += '    <category key="category_sensor-input" include="heb,heb-wx," colour="140">';

xmlToolbox += '        <category key="category_hackable-electronic-badge_accelerometer" >';
xmlToolbox += '            <block type="heb_badge_axis_acceleration"></block>';
xmlToolbox += '            <block type="heb_badge_was_shaken"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_hackable-electronic-badge_touchpad-control" >';
xmlToolbox += '            <block type="heb_touchpad_status"></block>';
xmlToolbox += '            <block type="heb_touchpad_sensitivity" include="heb-wx,">';
xmlToolbox += '                <field name="LEVEL">7</field>';
xmlToolbox += '            </block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_sony-remote" >';
xmlToolbox += '            <block type="sirc_get"></block>';
xmlToolbox += '        </category>';
xmlToolbox += '    </category>';


xmlToolbox += '    <category key="category_memory" include="heb,heb-wx," colour="165">';

xmlToolbox += '        <category key="category_memory_contacts">';
xmlToolbox += '            <block type="heb_badge_eeprom_store">';
xmlToolbox += '                <value name="CONTACT">';
xmlToolbox += '                    <block type="string_type_block">';
xmlToolbox += '                        <field name="TEXT">Last, First</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="heb_badge_eeprom_is_stored">';
xmlToolbox += '                <value name="CONTACT">';
xmlToolbox += '                    <block type="string_type_block">';
xmlToolbox += '                        <field name="TEXT">Last, First</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="heb_badge_eeprom_retrieve">';
xmlToolbox += '                <value name="INDEX">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="heb_count_contacts"></block>';
xmlToolbox += '            <block type="heb_erase_all_contacts"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_memory_sdcard" include="heb-wx,">';
// Solo-473 Add SD_Init block to menu for Flip board type
// Solo-537 Add SD_close block
xmlToolbox += '            <block type="sd_init" exclude="activity-board,"></block>';
xmlToolbox += '            <block type="sd_open"></block>';
xmlToolbox += '            <block type="sd_read">';
xmlToolbox += '                <value name="SIZE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">10</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="sd_file_pointer"></block>';
xmlToolbox += '            <block type="sd_close"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '    </category>';


xmlToolbox += '    <category key="category_sensor-input" exclude="s3,heb,heb-wx," colour="140">';

// eslint-disable-next-line max-len
xmlToolbox += '        <category key="category_sensor-input_2axis-joystick" include="activity-board,">';
xmlToolbox += '            <block type="joystick_input_xaxis"></block>';
xmlToolbox += '            <block type="joystick_input_yaxis"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_4x4-keypad" >';
xmlToolbox += '            <block type="keypad_initialize"></block>';
xmlToolbox += '            <block type="keypad_read"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_BME680">';
xmlToolbox += '            <block type="bme680_init"></block>';
xmlToolbox += '            <block type="bme680_read"></block>';
xmlToolbox += '            <block type="bme680_get_value"></block>';
xmlToolbox += '            <block type="bme680_heater"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_colorpal" >';
xmlToolbox += '            <block type="colorpal_enable"></block>';
xmlToolbox += '            <block type="colorpal_get_colors_raw"></block>';
xmlToolbox += '            <block type="colorpal_get_colors"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_ping" >';
xmlToolbox += '            <block type="sensor_ping"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_gps" >';
xmlToolbox += '            <block type="GPS_init"></block>';
xmlToolbox += '            <block type="GPS_hasFix"></block>';
xmlToolbox += '            <block type="GPS_latitude"></block>';
xmlToolbox += '            <block type="GPS_longitude"></block>';
xmlToolbox += '            <block type="GPS_heading"></block>';
xmlToolbox += '            <block type="GPS_altitude"></block>';
xmlToolbox += '            <block type="GPS_velocity"></block>';
xmlToolbox += '            <block type="GPS_satsTracked"></block>';
xmlToolbox += '            <block type="GPS_date_time"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_fingerprint" >';
xmlToolbox += '            <block type="fp_scanner_init"></block>';
xmlToolbox += '            <block type="fp_scanner_add">';
xmlToolbox += '                <value name="USER">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">1</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="fp_scanner_scan"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_hmc5883l" include="other,activity-board,">';
xmlToolbox += '            <block type="HMC5883L_init"></block>';
xmlToolbox += '            <block type="HMC5883L_read"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_LIS3DH" >';
xmlToolbox += '            <block type="lis3dh_init"></block>';
xmlToolbox += '            <block type="lis3dh_read"></block>';
xmlToolbox += '            <block type="lis3dh_temp"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_LSM9DS1" >';
xmlToolbox += '            <block type="lsm9ds1_init"></block>';
xmlToolbox += '            <block type="lsm9ds1_mag_calibrate"></block>';
xmlToolbox += '            <block type="lsm9ds1_read"></block>';
xmlToolbox += '            <block type="lsm9ds1_tilt"></block>';
xmlToolbox += '            <block type="lsm9ds1_heading"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_mma7455" include="other,">';
xmlToolbox += '            <block type="MMA7455_init"></block>';
xmlToolbox += '            <block type="MMA7455_acceleration"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_memsic-2axis" >';
xmlToolbox += '            <block type="MX2125_acceleration_xaxis"></block>';
xmlToolbox += '            <block type="MX2125_acceleration_yaxis"></block>';
xmlToolbox += '            <block type="MX2125_rotation"></block>';
xmlToolbox += '            <block type="MX2125_tilt_xaxis"></block>';
xmlToolbox += '            <block type="MX2125_tilt_yaxis"></block>';
xmlToolbox += '        </category>';

// xmlToolbox += '        <!--';
// xmlToolbox += '                    <category key="category_sensor-input_mma7455" >';
// xmlToolbox += '                        <block type="MMA7455_init"></block>';
// xmlToolbox += '                        <block type="MMA7455_acceleration"></block>';
// xmlToolbox += '                    </category>';
// xmlToolbox += '        -->';

xmlToolbox += '        <category key="category_sensor-input_pir" >';
xmlToolbox += '            <block type="PIR_Sensor"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_rfid" >';
xmlToolbox += '            <block type="rfid_enable"></block>';
xmlToolbox += '            <block type="rfid_get"></block>';
xmlToolbox += '            <block type="rfid_disable"></block>';
xmlToolbox += '            <block type="rfid_close"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_sony-remote" >';
xmlToolbox += '            <block type="sirc_get"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_sound-impact-sensor" >';
xmlToolbox += '            <block type="sound_impact_run"></block>';
xmlToolbox += '            <block type="sound_impact_get"></block>';
xmlToolbox += '            <block type="sound_impact_end"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_temperature-humidity" >';
xmlToolbox += '            <block type="dht22_read"></block>';
xmlToolbox += '            <block type="dht22_value"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '    </category>';

/*
 * MEMORY blocks
 */
// eslint-disable-next-line max-len
xmlToolbox += '    <category key="category_memory" include="activity-board,flip,other," colour="165">';

xmlToolbox += '        <category key="category_memory_eeprom" >';
xmlToolbox += '            <block type="eeprom_read">';
xmlToolbox += '                <value name="ADDRESS">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="eeprom_write">';
xmlToolbox += '                <value name="ADDRESS">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_memory_sdcard">';
xmlToolbox += '            <block type="sd_init" exclude="activity-board,"></block>';
xmlToolbox += '            <block type="sd_open"></block>';
xmlToolbox += '            <block type="sd_read">';
xmlToolbox += '                <value name="SIZE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">10</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="sd_file_pointer"></block>';
xmlToolbox += '            <block type="sd_close"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '    </category>';

/*
 * ANALOG/PULSE blocks
 */
xmlToolbox += '    <category key="category_analog-pulses" exclude="s3,heb,heb-wx," colour="185">';

xmlToolbox += '        <category key="category_analog-pulses_pulse-in-out" exclude="s3,">';
xmlToolbox += '            <block type="pulse_in"></block>';
xmlToolbox += '            <block type="pulse_out">';
xmlToolbox += '                <value name="PULSE_LENGTH">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="base_count">';
xmlToolbox += '                <value name="DURATION">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">1</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_analog-pulses_pwm">';
xmlToolbox += '            <!-- <block type="pwm_start"></block> -->';
xmlToolbox += '            <block type="pwm_set">';
xmlToolbox += '                <value name="DUTY_CYCLE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">50</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="pwm_stop"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_analog-pulses_rc">';
xmlToolbox += '            <block type="rc_charge_discharge"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_analog-pulses_voltage" include="activity-board,">';
xmlToolbox += '            <block type="ab_volt_in"></block>';
xmlToolbox += '            <block type="ab_volt_out">';
xmlToolbox += '                <value name="VALUE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_analog-pulses_voltage" include="flip,other,">';
xmlToolbox += '            <block type="mcp320x_read"></block>';
xmlToolbox += '            <block type="mcp320x_set_vref"></block>';
xmlToolbox += '        </category>';
xmlToolbox += '    </category>';

/*
 * AUDIO blocks
 */
xmlToolbox += '    <category key="category_audio" exclude="s3," colour="185">';

xmlToolbox += '        <category key="category_audio_freqout" >';
xmlToolbox += '            <block type="base_freqout">';
xmlToolbox += '                <value name="DURATION">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="FREQUENCY">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="sound_init" include="activity-board,">';
xmlToolbox += '                <field name="PINL">26</field>';
xmlToolbox += '                <field name="PINR">27</field>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="sound_init" include="flip,other,"></block>';
xmlToolbox += '            <block type="sound_play"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_hackable-electronic-badge_text-to-speech" >';
xmlToolbox += '            <block type="heb_text_to_speech_pins"></block>';
xmlToolbox += '            <block type="heb_text_to_speech_volume"></block>';
xmlToolbox += '            <block type="heb_text_to_speech_say">';
xmlToolbox += '                <value name="STRING">';
xmlToolbox += '                    <block type="string_type_block">';
xmlToolbox += '                        <field name="TEXT">heloa</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="heb_text_to_speech_spell">';
xmlToolbox += '                <value name="STRING">';
xmlToolbox += '                    <block type="string_type_block">';
xmlToolbox += '                        <field name="TEXT">hello</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_audio_audio" exclude="flip,">';
xmlToolbox += '            <block type="wav_set_pins" include="activity-board,">';
xmlToolbox += '                <field name="PINL">26</field>';
xmlToolbox += '                <field name="PINR">27</field>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="wav_play"></block>';
xmlToolbox += '            <block type="wav_status"></block>';
xmlToolbox += '            <block type="wav_volume">';
xmlToolbox += '                <value name="VOLUME">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="wav_stop"></block>';
xmlToolbox += '        </category>';
xmlToolbox += '    </category>';

xmlToolbox += '    <category key="category_servo" exclude="s3,heb,heb-wx," colour="165">';
xmlToolbox += '        <block type="servo_move">';
xmlToolbox += '            <value name="ANGLE">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">0</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="servo_speed">';
xmlToolbox += '            <value name="SPEED">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">0</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="servo_set_ramp">';
xmlToolbox += '            <value name="RAMPSTEP">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">50</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="fb360_init"></block>';
xmlToolbox += '        <block type="fb360_setup">';
xmlToolbox += '            <field name="PARAM">setAcceleration</field>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="fb360_set">';
xmlToolbox += '            <value name="VALUE">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">0</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="fb360_get"></block>';
xmlToolbox += '        <block type="fb360_status"></block>';
xmlToolbox += '        <block type="scribbler_stop_servo"></block>';
xmlToolbox += '    </category>';

xmlToolbox += '    <category key="category_robot"  include="activity-board," colour="295">';
xmlToolbox += '        <block type="ab_drive_init"></block>';
xmlToolbox += '        <block type="ab_drive_ramping">';
xmlToolbox += '            <field name="RAMPING">600</field>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="ab_drive_speed">';
xmlToolbox += '            <value name="LEFT">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">64</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '            <value name="RIGHT">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">64</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="ab_drive_goto">';
xmlToolbox += '            <value name="LEFT">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">64</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '            <value name="RIGHT">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">64</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="ab_drive_goto_max_speed">';
xmlToolbox += '            <value name="SPEED">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">64</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="ab_drive_stop"></block>';
xmlToolbox += '        <block type="ab_drive_get_ticks"></block>';
xmlToolbox += '        <block type="activitybot_calibrate"></block>';
xmlToolbox += '        <block type="activitybot_display_calibration"></block>';
xmlToolbox += '        <block type="activitybot_parallaxy_load"></block>';
xmlToolbox += '    </category>';

xmlToolbox += '    <category key="category_s3-math" include="s3," colour="275">';
xmlToolbox += '        <block type="math_number"></block>';
xmlToolbox += '        <block type="scribbler_boolean"></block>';
xmlToolbox += '        <block type="scribbler_random_boolean"></block>';
xmlToolbox += '        <block type="math_random">';
xmlToolbox += '            <value name="A">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">1</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '            <value name="B">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">10</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="math_arithmetic"></block>';
xmlToolbox += '        <block type="math_limit"></block>';
xmlToolbox += '        <block type="logic_operation"></block>';
xmlToolbox += '        <block type="math_crement"></block>';
xmlToolbox += '        <block type="logic_negate"></block>';
xmlToolbox += '        <block type="logic_compare"></block>';
xmlToolbox += '        <block type="constrain_value"></block>';
xmlToolbox += '        <block type="map_value"></block>';
xmlToolbox += '        <block type="math_advanced"></block>';
xmlToolbox += '        <block type="math_inv_trig">';
xmlToolbox += '            <value name="ARG3">';
xmlToolbox += '                <block type="math_number">';
xmlToolbox += '                    <field name="NUM">1</field>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '        </block>';
xmlToolbox += '    </category>';

xmlToolbox += '    <category key="category_sensor-input" include="s3," colour="140">';

xmlToolbox += '        <category key="category_sensor-input_s3-line" >';
xmlToolbox += '            <block type="calibrate_line_sensor"></block>';
xmlToolbox += '            <!-- <block type="scribbler_if_line"></block> -->';
xmlToolbox += '            <block type="scribbler_simple_line"></block>';
xmlToolbox += '            <block type="line_sensor"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_s3-obstacle" >';
xmlToolbox += '            <!-- <block type="scribbler_if_obstacle"></block>';
xmlToolbox += '            <block type="obstacle_sensor"></block> -->';
xmlToolbox += '            <block type="scribbler_simple_obstacle"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_s3-light" >';
xmlToolbox += '            <!-- <block type="scribbler_if_light"></block> -->';
xmlToolbox += '            <block type="scribbler_simple_light"></block>';
xmlToolbox += '            <block type="light_sensor"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_s3-stall" >';
xmlToolbox += '            <!-- <block type="scribbler_if_stalled"></block> -->';
xmlToolbox += '            <block type="stall_sensor"></block>';
xmlToolbox += '            <!-- <block type="spinning_sensor"></block> -->';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_s3-sirc" >';
xmlToolbox += '            <block type="sirc_s3_get"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_s3-mic" >';
xmlToolbox += '            <block type="mic_s3_get"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_sensor-input_s3-button" >';
xmlToolbox += '            <block type="reset_button_presses"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '    </category>';


xmlToolbox += '    <category key="category_s3-actions" include="s3," colour="185">';

xmlToolbox += '        <category key="category_s3-actions_motors" >';
xmlToolbox += '            <block type="scribbler_drive">';
xmlToolbox += '                <field name="DRIVE_ANGLE">STRAIGHT</field>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="scribbler_spin"></block>';
xmlToolbox += '            <block type="scribbler_stop"></block>';
xmlToolbox += '            <block type="move_motors">';
xmlToolbox += '                <value name="LEFT_MOTOR_SPEED">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="RIGHT_MOTOR_SPEED">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="MOTOR_DURATION">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="move_motors_distance">';
xmlToolbox += '                <value name="LEFT_MOTOR_DISTANCE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="RIGHT_MOTOR_DISTANCE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="MOTOR_SPEED">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="move_motors_xy">';
xmlToolbox += '                <value name="X_DISTANCE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="Y_DISTANCE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="MOTOR_SPEED">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="move_motors_angle">';
xmlToolbox += '                <value name="ROTATE_ANGLE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="ROTATE_RADIUS">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="ROTATE_SPEED">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_s3-actions_sound" include="s3,">';
xmlToolbox += '            <block type="scribbler_play">';
xmlToolbox += '                <field name="NOTE_DURATION">250</field>';
xmlToolbox += '                <field name="NOTE_OCTAVE">4</field>';
xmlToolbox += '                <field name="NOTE_FREQUENCY">4186</field>';
xmlToolbox += '                <field name="NOTE_VOLUME">50</field>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="play_polyphony">';
xmlToolbox += '                <value name="FREQUENCY_1">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="FREQUENCY_2">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="POLYPHONY_DURATION">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="POLYPHONY_VOLUME">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_s3-actions_leds" include="s3,">';
xmlToolbox += '            <block type="scribbler_LED"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_communicate" include="s3,">';
xmlToolbox += '            <block type="scribbler_serial_send_text"></block>';
xmlToolbox += '            <block type="scribbler_serial_send_decimal"></block>';
xmlToolbox += '            <block type="scribbler_serial_send_char"></block>';
xmlToolbox += '            <block type="scribbler_serial_send_ctrl"></block>';

// xmlToolbox += '            <!--';
// xmlToolbox += '                            <block type="scribbler_serial_cursor_xy">';
// xmlToolbox += '                                <value name="X">';
// xmlToolbox += '                                    <block type="spin_integer">';
// xmlToolbox += '                                        <field name="INT_VALUE">0</field>';
// xmlToolbox += '                                    </block>';
// xmlToolbox += '                                </value>';
// xmlToolbox += '                                <value name="Y">';
// xmlToolbox += '                                    <block type="spin_integer">';
// xmlToolbox += '                                        <field name="INT_VALUE">0</field>';
// xmlToolbox += '                                    </block>';
// xmlToolbox += '                                </value>';
// xmlToolbox += '                            </block>';
// xmlToolbox += '            -->';

xmlToolbox += '            <block type="scribbler_serial_rx_byte"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_memory" include="s3,">';
xmlToolbox += '            <block type="s3_eeprom_read">';
xmlToolbox += '                <value name="ADDR">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="s3_eeprom_write">';
xmlToolbox += '                <value name="ADDR">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '                <value name="VALUE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">0</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_s3-actions_reset" include="s3,">';
xmlToolbox += '            <block type="factory_reset"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '    </category>';


xmlToolbox += '    <category key="category_s3-hacker-port" include="s3," colour="295">';

xmlToolbox += '        <category key="category_s3-hacker-port_sensors" >';
xmlToolbox += '            <block type="scribbler_ping"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_s3-hacker-port_pins" >';
xmlToolbox += '            <block type="make_pin"></block>';
xmlToolbox += '            <block type="check_pin"></block>';
xmlToolbox += '            <block type="analog_input"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '        <category key="category_s3-hacker-port_servo" >';
xmlToolbox += '            <block type="servo_move">';
xmlToolbox += '                <value name="ANGLE">';
xmlToolbox += '                    <block type="math_number">';
xmlToolbox += '                        <field name="NUM">90</field>';
xmlToolbox += '                    </block>';
xmlToolbox += '                </value>';
xmlToolbox += '            </block>';
xmlToolbox += '            <block type="scribbler_stop_servo"></block>';
xmlToolbox += '        </category>';

xmlToolbox += '    </category>';


xmlToolbox += '    <category key="category_system" colour="320">';

// eslint-disable-next-line max-len
xmlToolbox += '        <block type="custom_code_multiple" include="activity-board,flip,heb,heb-wx,other,s3,"></block>';
xmlToolbox += '        <block type="waitcnt">';
xmlToolbox += '            <value name="TARGET">';
xmlToolbox += '                <block type="math_arithmetic">';
xmlToolbox += '                    <value name="A">';
xmlToolbox += '                        <block type="system_counter"></block>';
xmlToolbox += '                    </value>';
xmlToolbox += '                </block>';
xmlToolbox += '            </value>';
xmlToolbox += '        </block>';
xmlToolbox += '        <block type="register_set" exclude="s3," ></block>';
xmlToolbox += '        <block type="register_get" exclude="s3," ></block>';
xmlToolbox += '        <block type="system_counter" exclude="s3," include="other,"></block>';
xmlToolbox += '    </category>';

xmlToolbox += '</xml>';


/**
 * Menu items for the control section
 * @return {string}
 */
function menuControl() {
  return `
  <category key="category_control" colour="205">
    <block type="comment"></block>
    <block type="controls_if"></block>
    <block type="controls_repeat">
      <mutation TYPE="FOREVER"></mutation>
    </block>
    <block type="controls_repeat" include="s3,">
      <mutation type="TIMES"></mutation>
      <field name="TYPE">TIMES</field>
        <value name="TIMES">
          <block type="math_number">
            <field name="NUM">10</field>
          </block>
        </value>
      </block>
    <block type="control_repeat_for_loop">
      <value name="START">
        <block type="math_number">
          <field name="NUM">1</field>
        </block>
      </value>
      <value name="END">
        <block type="math_number">
          <field name="NUM">10</field>
        </block>
      </value>
      <value name="STEP">
        <block type="math_number">
          <field name="NUM">1</field>
        </block>
      </value>
    </block>
    <block type="scribbler_exit_loop" include="s3,"></block>
    <block type="controls_select">
      <value name="SWITCH">
        <block type="variables_get"></block>
     </value>
   </block>
   <block type="controls_break" exclude="s3,"></block>
   <block type="base_delay" exclude="s3,">
     <value name="DELAY_TIME">
       <block type="math_number">
         <field name="NUM">1000</field>
       </block>
     </value>
   </block>
   <block type="scribbler_wait" include="s3,">
     <value name="WAITTIME">
       <block type="math_number">
         <field name="NUM">500</field>
       </block>
     </value>
     <field name="TIMESCALE">1</field>
   </block>
   <block type="cog_new" exclude="s3,"></block>
   <block type="controls_return" exclude="s3,"></block>
 </category>
`;
}

/**
 * Menu items for the Operators category
 *
 * @return {string}
 */
function menuOperators() {
  let menu = `<category key="category_operators" exclude="s3," colour="275">`;
  menu += menuOperatorNumbers();
  menu += menuOperatorStrings();
  menu += `</category>`;

  return menu;
}

/**
 * Menu items for the Operators/Numbers category
 *
 * @return {string}
 */
function menuOperatorNumbers() {
  return `
    <category key="category_operators_numbers" >
      <block type="math_arithmetic"></block>
      <block type="math_limit"></block>
      <block type="constrain_value"></block>
      <block type="math_crement"></block>
      <block type="math_random">
        <value name="A">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
        <value name="B">
          <block type="math_number">
            <field name="NUM">100</field>
          </block>
        </value>
      </block>
      <block type="math_bitwise"></block>
      <block type="logic_operation"></block>
      <block type="logic_negate"></block>
      <block type="parens"></block>
      <block type="logic_compare"></block>
      <block type="map_value"></block>
      <block type="math_advanced"></block>
      <block type="math_inv_trig">
        <value name="ARG3">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
      </block>
    </category>
  `;
}

/**
 * Menu items for the Operators/Strings category
 *
 * @return {string}
 */
function menuOperatorStrings() {
  return `
    <category key="category_operators_strings" >
      <block type="string_var_length"></block>
      <block type="string_compare"></block>
      <block type="string_length"></block>
      <block type="combine_strings"></block>
      <block type="find_substring_zero">
        <value name="LOC">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
        </value>
      </block>
      <block type="get_char_at_position_zero">
        <value name="POSITION">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
        </value>
      </block>
      <block type="set_char_at_position_zero">
        <value name="POSITION">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
        </value>
      </block>
      <block type="get_substring_zero">
        <value name="START">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
        </value>
        <value name="END">
          <block type="math_number">
            <field name="NUM">2</field>
          </block>
        </value>
      </block>
      <block type="string_split">
        <value name="CHAR">
          <block type="char_type_block"></block>
        </value>
      </block>
      <block type="string_trim"></block>
      <block type="string_null"></block>
      <block type="string_sprint_multiple"></block>
      <block type="string_scan_multiple"></block>
    </category>
  `;
}

/**
 * Menu items for the Values category
 *
 * @return {string}
 */
function menuValues() {
  return `
    <category key="category_values" exclude="s3," colour="205">
      <block type="math_number"></block>
      <block type="string_type_block"></block>
      <block type="char_type_block"></block>
      <block type="music_note">
        <field name="OCTAVE">0.125</field>
      </block>
      <block type="number_binary"></block>
      <block type="number_hex"></block>
      <block type="logic_boolean"></block>
      <block type="high_low_value"></block>
      <block type="constant_define"></block>
      <block type="constant_value"></block>
      <block type="color_picker" exclude="heb,"></block>
      <block type="color_value_from" exclude="heb,">
        <value name="RED_VALUE">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
        </value>
        <value name="GREEN_VALUE">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
        </value>
        <value name="BLUE_VALUE">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
        </value>
      </block>
      <block type="get_channel_from" exclude="heb,">
        <value name="COLOR">
          <block type="color_picker"></block>
        </value>
      </block>
      <block type="compare_colors" exclude="heb,">
        <value name="COLOR1">
          <block type="color_picker"></block>
        </value>
        <value name="COLOR2">
          <block type="color_picker"></block>
        </value>
      </block>
      <block type="heb_color_val" include="heb,"></block>
      <block type="system_counter" exclude="other,"></block>
    </category>
  `;
}

/**
 * Menu items for the Arrays category
 *
 * @return {string}
 */
function menuOperatorArrays() {
  return `
    <category key="category_operators_arrays" colour="250">
      <block type="array_init"></block>
      <block type="array_fill"></block>';
      <block type="array_get">
        <value name="NUM">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
        </value>
      </block>
      <block type="array_set">
        <value name="NUM">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
        </value>
        <value name="VALUE">
          <block type="math_number">
             <field name="NUM">0</field>
          </block>
        </value>
      </block>
      <block type="array_clear"></block>
    </category>
  `;
}

/**
 * Menu items for the I/O pin state category
 *
 * @return {string}
 */
function menuIOPinStates() {
  return `
    <category key="category_input-output_pin-states" exclude="s3,heb,heb-wx," colour="185">
      <block type="make_pin"></block>
      <block type="make_pin_input">
        <value name="PIN">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
        </value>
      </block>
      <block type="check_pin"></block>
      <block type="check_pin_input">
         <value name="PIN">
           <block type="math_number">
             <field name="NUM">0</field>
           </block>
         </value>
       </block>
       <block type="set_pins"></block>
       <block type="get_pins"></block>
       <block type="set_pins_binary">
         <value name="VALUE">
           <block type="number_binary"></block>
         </value>
       </block>
     </category>
  `;
}

/**
 * Menu items in the Communications/Display Badge category
 *
 * @return {string}
 */
function menuCommunicationBadgeDisplay() {
  return `
  <category key="category_hackable-electronic-badge_oled" include="heb,heb-wx,">
      <block type="heb_print_numeric_var">
          <value name="VALUE">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
      </block>
      <block type="heb_print_string_var">
          <value name="VALUE">
              <block type="string_type_block">
                  <field name="TEXT">Hello</field>
              </block>
          </value>
      </block>
      <block type="heb_print_multiple"></block>
      <block type="heb_cursor_position_large"></block>
      <block type="heb_cursor_position_small">
          <value name="ROWS">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="COLS">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
      </block>
      <block type="heb_clear_screen"></block>
      <block type="heb_rotate"></block>
      <block type="heb_oled_point">
          <value name="X0">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="Y0">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
      </block>
      <block type="heb_oled_line">
          <value name="X0">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="Y0">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="X1">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="Y1">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
      </block>
      <block type="heb_oled_box">
          <value name="X0">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="Y0">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="W">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="H">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
      </block>
      <block type="heb_oled_circle">
          <value name="X0">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="Y0">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="R">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
      </block>
      <block type="heb_oled_triangle">
          <value name="X0">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="Y0">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="X1">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="Y1">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="X2">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
          <value name="Y2">
              <block type="math_number">
                  <field name="NUM">0</field>
              </block>
          </value>
      </block>
  </category>
  `;
}

/**
 * Menu items in the Communications Badge/IR category
 *
 * @return {string}
 */
function menuCommunicationsBadgeIR() {
  return `
    <category key="category_hackable-electronic-badge_ir-communication" include="heb,heb-wx,">
        <block type="heb_ir_send_signal">
            <value name="MESSAGE">
                <block type="string_type_block">
                    <field name="TEXT">Hello</field>
                </block>
            </value>
        </block>
        <block type="heb_ir_read_signal"></block>
        <block type="heb_ir_clear_buffer"></block>
    </category>
  `;
}

/**
 * Menu items in the Communications/Graphing category
 *
 * @return {string}
 */
function menuCommunicationsGraphing() {
  return `
    <category key="category_communicate_graphing" exclude="heb-wx,">
        <block type="graph_settings">
            <field name="XAXIS">40,S</field>
        </block>
        <block type="graph_output"></block>
    </category>
  `;
}

/**
 * Menu items in the Communications/LED Control category
 *
 * @return {string}
 */
function menuCommunicationsLedControl() {
  return `
    <category key="category_hackable-electronic-badge_led_control" include="heb,heb-wx,">
        <block type="ws2812b_init" include="heb-wx,"></block>
        <block type="ws2812b_set" include="heb-wx,">
            <value name="LED">
                <block type="math_number">
                    <field name="NUM">1</field>
                </block>
            </value>
            <value name="COLOR">
                <block type="color_picker"></block>
            </value>
        </block>
        <block type="ws2812b_set_multiple" include="heb-wx,">
            <value name="START">
                <block type="math_number">
                    <field name="NUM">1</field>
                </block>
            </value>
            <value name="END">
                <block type="math_number" include="heb-wx,">
                    <field name="NUM">4</field>
                </block>
            </value>
            <value name="COLOR">
                <block type="color_picker">#000000</block>
            </value>
        </block>
        <block type="ws2812b_update" include="heb-wx,"></block>
        <block type="heb_toggle_led" include="heb,"></block>
        <block type="heb_toggle_led_open" include="heb,">
            <value name="LED_NUM">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="LED_STATE">
                <block type="high_low_value">
                    <field name="VALUE">1</field>
                </block>
            </value>
        </block>
        <block type="heb_pwm_led" include="heb-wx,">
            <value name="BRIGHTNESS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="heb_set_led_rgb" include="heb,">
            <value name="RGB">
                <block type="heb_color_val"></block>
            </value>
        </block>
    </category>
  `;
}

/**
 * Menu item(s) in the Communications/Badge category
 *
 * @return {string}
 */
function menuCommunicationsBadgeLock() {
  return `
    <category key="category_communicate_badge_lock" include="heb-wx,">
        <block type="heb_wx_lock"></block>
    </category>
  `;
}

/**
 * Menu items in the Communications/OLED category
 *
 * @return {string}
 */
function menuCommunicationsOled() {
  return `
    <category key="category_communicate_oled" exclude="heb,heb-wx,">
        <block type="oled_initialize"></block>
        <block type="oled_font_loader"></block>
        <block type="oled_get_max_height"></block>
        <block type="oled_get_max_width"></block>
        <block type="oled_clear_screen"></block>
        <block type="oled_text_color">
            <value name="FONT_COLOR">
                <block type="color_picker"></block>
            </value>
            <value name="BACKGROUND_COLOR">
                <block type="color_picker"></block>
            </value>
        </block>
        <block type="oled_text_size"></block>
        <block type="oled_set_cursor">
            <value name="X_POS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="Y_POS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="oled_print_text">
            <value name="MESSAGE">
                <block type="string_type_block"></block>
            </value>
        </block>
        <block type="oled_print_number">
            <value name="NUMIN">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="oled_print_multiple"></block>
        <block type="oled_draw_pixel">
            <value name="X_AXIS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="Y_AXIS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="COLOR">
                <block type="color_picker"></block>
            </value>
        </block>
        <block type="oled_draw_line">
            <value name="X_ONE">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="Y_ONE">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="X_TWO">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="Y_TWO">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="COLOR">
                <block type="color_picker"></block>
            </value>
        </block>
        <block type="oled_draw_triangle">
            <value name="POINT_X0">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_Y0">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_X1">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_Y1">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_X2">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_Y2">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="COLOR">
                <block type="color_picker"></block>
            </value>
        </block>
        <block type="oled_draw_rectangle">
            <value name="POINT_X">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_Y">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="RECT_WIDTH">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="RECT_HEIGHT">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="RECT_ROUND">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="COLOR">
                <block type="color_picker"></block>
            </value>
        </block>
        <block type="oled_draw_circle">
            <value name="POINT_X">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_Y">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="RADIUS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="COLOR">
                <block type="color_picker"></block>
            </value>
        </block>
        <block type="oled_bitmap">
            <value name="POS_X">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POS_Y">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
    </category>
  `;
}

/**
 * Menu items in the Communications/E-Paper category
 *
 * @return {string}
 */
function menuCommunicationsEPaper() {
  return `
    <category key="category_communicate_epaper" exclude="heb,heb-wx,">
        <block type="epaper_initialize"></block>
        <block type="oled_font_loader"></block>
        <block type="epaper_update"></block>
        <block type="epaper_get_max_height"></block>
        <block type="epaper_get_max_width"></block>
        <block type="epaper_clear_screen"></block>
        <block type="epaper_text_color"></block>
        <block type="epaper_text_size"></block>
        <block type="epaper_set_cursor">
            <value name="X_POS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="Y_POS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="epaper_print_text">
            <value name="MESSAGE">
                <block type="string_type_block"></block>
            </value>
        </block>
        <block type="epaper_print_number">
            <value name="NUMIN">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="epaper_print_multiple"></block>
        <block type="epaper_draw_pixel">
            <value name="X_AXIS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="Y_AXIS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="epaper_draw_line">
            <value name="X_ONE">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="Y_ONE">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="X_TWO">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="Y_TWO">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="epaper_draw_triangle">
            <value name="POINT_X0">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_Y0">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_X1">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_Y1">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_X2">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_Y2">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="epaper_draw_rectangle">
            <value name="POINT_X">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_Y">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="RECT_WIDTH">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="RECT_HEIGHT">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="RECT_ROUND">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="epaper_draw_circle">
            <value name="POINT_X">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POINT_Y">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="RADIUS">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="epaper_bitmap">
            <value name="POS_X">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="POS_Y">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
    </category>
  `;
}


/**
 * Menu items in the Communications/Protocols category
 *
 * @return {string}
 */
function menuCommunicationsProtocols() {
  let menu = `<category key="category_communicate_protocols" exclude="heb,heb-wx,">`;
  menu += menuCommunicationsProtocolsSerial();
  // menu += menuCommunicationsProtocolIC2();
  menu += menuCommunicationsProtocolsShift();
  menu += `</category>`;

  return menu;
}

/**
 * Menu items in the Communications/Serial Protocols category
 *
 * @return {string}
 */
function menuCommunicationsProtocolsSerial() {
  return `
    <block type="serial_open"><field name="TXPIN">1</field></block>
    <block type="serial_send_text"></block>
    <block type="serial_status"></block>
    <block type="serial_print_multiple"></block>
    <block type="serial_receive_text"></block>
    <block type="serial_scan_multiple"></block>
  `;
}

/**
 * Menu items in the Communications/IC2 protocols category
 *
 * @return {string}
 *
 * @description
 * NOTE: The blocks in the menu are considered experimental and are currently
 * not implamented in the production application.
 */
// eslint-disable-next-line no-unused-vars,require-jsdoc
function menuCommunicationsProtocolIC2() {
  return `
    <block type="i2c_send" experimental="true">
        <value name="DATA">
            <block type="math_number">
                <field name="NUM">10</field>
            </block>
        </value>
        <value name="ADDR">
            <block type="number_hex"></block>
        </value>
        <value name="DEVICE">
            <block type="number_hex"></block>
        </value>
    </block>
    <block type="i2c_receive" experimental="true">
        <value name="ADDR">
            <block type="number_hex"></block>
        </value>
        <value name="DEVICE">
            <block type="number_hex"></block>
        </value>
    </block>
    <block type="i2c_busy" experimental="true">
        <value name="DEVICE">
            <block type="number_hex"></block>
        </value>
    </block>
    <block type="i2c_mode" experimental="true"></block>
  `;
}

/**
 * Menu items in the Communications/Shift category
 *
 * @return {string}
 */
function menuCommunicationsProtocolsShift() {
  return `
    <block type="shift_in"></block>
    <block type="shift_out">
        <value name="VALUE">
            <block type="math_number">
                <field name="NUM">10</field>
            </block>
        </value>
    </block>
  `;
}

/**
 * Menu items in the Communication category for the WS2812B device
 *
 * @return {string}
 */
function menuCommunicationWS2812B() {
  return `
    <category key="category_communicate_WS2812B" exclude="heb,heb-wx,">
        <block type="ws2812b_init"></block>
        <block type="ws2812b_set">
            <value name="LED">
                <block type="math_number">
                    <field name="NUM">1</field>
                </block>
            </value>
            <value name="COLOR">
                <block type="color_picker"></block>
            </value>
        </block>
        <block type="ws2812b_set_multiple">
            <value name="START">
                <block type="math_number">
                    <field name="NUM">1</field>
                </block>
            </value>
            <value name="END">
                <block type="math_number">
                    <field name="NUM">4</field>
                </block>
            </value>
            <value name="COLOR">
                <block type="color_picker">#000000</block>
            </value>
        </block>
        <block type="ws2812b_update"></block>
    </category>
  `;
}

/**
 * Menu items in the Communication/Serial LCD category
 *
 * @return {string}
 */
function menuCommunicationSerialLCD() {
  return `
    <category key="category_communicate_serial-lcd" exclude="heb,heb-wx,">
        <block type="debug_lcd_init"></block>
        <block type="debug_lcd_print">
            <value name="MESSAGE">
                <block type="string_type_block"></block>
            </value>
        </block>
        <block type="debug_lcd_number">
            <value name="VALUE">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="debug_lcd_print_multiple"></block>
        <block type="debug_lcd_action"></block>
        <block type="debug_lcd_set_cursor">
            <value name="ROW">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
            <value name="COLUMN">
                <block type="math_number">
                    <field name="NUM">0</field>
                </block>
            </value>
        </block>
        <block type="debug_lcd_music_note"></block>
    </category>
    `;
}

/**
 * Menu items in the Communication/Parallel LCD category
 *
 * @return {string}
 *
 * @description
 *
 * NOTE: The parallel LCD blocks are experimental and are not currently
 * included in the production version of the application.
 */
// function menuCommunicationParallelLCD() {
//   return `
//     <category key="category_communicate_parallel-lcd" exclude="heb,heb-wx," experimental="true">
//         <block type="parallel_lcd_init"></block>
//         <block type="parallel_lcd_print">
//             <value name="MESSAGE">
//                 <block type="string_type_block"></block>
//             </value>
//         </block>
//         <block type="parallel_lcd_number">
//             <value name="VALUE">
//                 <block type="math_number">
//                     <field name="NUM">0</field>
//                 </block>
//             </value>
//         </block>
//         <block type="parallel_lcd_print_multiple"></block>
//         <block type="parallel_lcd_action"></block>
//         <block type="parallel_lcd_set_cursor">
//             <value name="ROW">
//                 <block type="math_number">
//                     <field name="NUM">0</field>
//                 </block>
//             </value>
//             <value name="COLUMN">
//                 <block type="math_number">
//                     <field name="NUM">0</field>
//                 </block>
//             </value>
//         </block>
//     </category>
//     `;
// }

/**
 * Menu items in the Communication/Serial Terminal category
 *
 * @return {string}
 */
function menuCommunicationSerialTerminal() {
  return `
    <category key="category_communicate_serial-terminal" exclude="heb-wx,">';
        <block type="console_print">';
            <value name="MESSAGE">';
                <block type="string_type_block"></block>';
            </value>';
        </block>';
        <block type="console_print_variables">';
            <value name="VALUE">';
                <block type="math_number">';
                    <field name="NUM">0</field>';
                </block>';
            </value>';
        </block>';
        <block type="console_print_multiple"></block>';
        <block type="console_scan_text"></block>';
        <block type="console_scan_number"></block>';
        <block type="console_newline"></block>';
        <block type="console_clear"></block>';
        <block type="console_move_to_position">';
            <value name="ROW">';
                <block type="math_number">';
                    <field name="NUM">0</field>';
                </block>';
            </value>';
            <value name="COLUMN">';
                <block type="math_number">';
                    <field name="NUM">0</field>';
                </block>';
            </value>';
        </block>';
        <block type="console_close"></block>';
    </category>';
    `;
}

/**
 * Menu items in the Communication/WX Module category
 * @return {string}
 */
function menuCommunicationsWX() {
  let menu = `<category name="WX Module" exclude="heb,">`;
  // menu += menuCommunicationsWXSimple();
  menu += menuCommunicationsWXAdvanced();
  menu += `</category>`;
  return menu;
}

/**
 * Menu items in the Communication/WX Simple Module category
 *
 * @return {string}
 *
 * @description
 *
 * NOTE: The Simple WX Module blocks are experimental. Leaving these here
 * in case we decide to return to this and finally deploy these blocks.
 */
// function menuCommunicationsWXSimple() {
//   return `
//     <category name="Simple" experimental="true">
//         <block type="wx_init" exclude="heb-wx,"></block>
//         <block type="wx_config_page"></block>
//         <block type="wx_set_widget"></block>
//         <block type="wx_send_widget">
//             <value name="NUM">
//                 <block type="math_number">
//                     <field name="NUM">10</field>
//                 </block>
//             </value>
//         </block>
//         <block type="wx_read_widgets"></block>
//         <block type="wx_get_widget"></block>
//         <block type="wx_evt_connected"></block>
//         <block type="wx_reconnect"></block>
//     </category>
//   `;
// }

/**
 * Menu items in the Communication/WX Advanced Module category
 *
 * @return {string}
 */
function menuCommunicationsWXAdvanced() {
  return `
    <category name="Advanced">
        <block type="wx_init_adv" exclude="heb-wx,"></block>
        <block type="wx_listen">
            <field name="ID">wxConnId1</field>
            <value name="PATH">
                <block type="string_type_block">
                    <field name="TEXT">path</field>
                </block>
            </value>
        </block>
        <block type="wx_poll">
            <field name="EVENT">wxEvent</field>
            <field name="ID">wxId</field>
            <field name="HANDLE">wxHandle</field>
        </block>
        <block type="wx_print_multiple">
            <field name="HANDLE">wxHandle</field>
        </block>
        <block type="wx_send_string">
            <field name="HANDLE">wxHandle</field>
            <value name="DATA">
                <block type="string_type_block"></block>
            </value>
        </block>
        <block type="wx_scan_multiple">
            <field name="HANDLE">wxHandle</field>
        </block>
        <block type="wx_scan_string">
            <field name="HANDLE">wxHandle</field>
        </block>
        <block type="wx_receive_string">
            <field name="HANDLE">wxHandle</field>
            <value name="MAX">
                <block type="math_number">
                    <field name="NUM">64</field>
                </block>
            </value>
        </block>
        <block type="wx_mode"></block>
        <block type="wx_code"></block>
        <block type="wx_buffer">
            <field name="BUFFER">wxBuffer</field>
        </block>
        <block type="wx_join"></block>
        <block type="wx_disconnect">
            <field name="ID">wxId</field>
        </block>
        <block type="wx_ip"></block>
    </category>
  `;
}


/**
 * Menu items in the Communications category
 *
 * @return {string}
 */
function menuCommunication() {
  let menu =`<category key="category_communicate" exclude="s3," colour="340">`;
  menu += menuCommunicationBadgeDisplay();
  menu += menuCommunicationsBadgeIR();
  menu += menuCommunicationsGraphing();
  menu += menuCommunicationsLedControl();
  menu += menuCommunicationsBadgeLock();
  menu += menuCommunicationsOled();
  menu += menuCommunicationsEPaper();
  menu += menuCommunicationsProtocols();
  menu += menuCommunicationWS2812B();
  menu += menuCommunicationSerialLCD();
  // menu += menuCommunicationParallelLCD();
  menu += menuCommunicationSerialTerminal();
  menu += menuCommunicationsWX();
  menu += menuCommunicationXBee();
  menu += `</category>`;
  return menu;
}

/**
 * Menu items on the Communications/XBee category
 *
 * @return {string}
 */
function menuCommunicationXBee() {
  return `
    <category key="category_communicate_xbee" exclude="heb,heb-wx,">';
        <block type="xbee_setup"></block>';
        <block type="xbee_transmit"></block>';
        <block type="xbee_print_multiple"></block>';
        <block type="xbee_receive"></block>';
        <block type="xbee_scan_multiple"></block>';
    </category>';
  `;
}

/**
 * Filter the blocks available in the toolbox.
 *
 * @param {string} profileName
 * @return {string}
 */
function filterToolbox(profileName) {
  console.log(`Filtering toolbox`);

  // Set the category's label (internationalization)
  xmlToolbox = xmlToolbox.replace(
      /key="([\S]+)"/g, function(m, p) {
        return 'name="' + toolbox_label[p] + '"';
      });

  // Convert the xmlToolBox string to an XML object
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlToolbox, 'text/xml');

  // Loop through the specified tags and filter based on their attributes
  const tagSearch = ['category', 'sep', 'block'];

  // Toolbox entries to be removed from the menu
  const toRemove = [];

  // Scan the toolBox XML document for each search tag
  for (let j = 0; j < tagSearch.length; j++) {
    const xmlElem = xmlDoc.getElementsByTagName(tagSearch[j]);

    for (let t = 0; t < xmlElem.length; t++) {
      // Get the current XML element
      const toolboxEntry = xmlElem[t];

      // The include attribute defines specific supported board types
      const include = toolboxEntry.getAttribute('include');

      // The exclude attribute defines board types that are specifically
      // excluded from the block under consideration
      const exclude = toolboxEntry.getAttribute('exclude');

      if (include && include.indexOf(profileName + ',') === -1) {
        // Place this entry on the removal list if the include attribute is
        // defined and is does not match the board type that is currently
        // defined for the project.
        toRemove.push(toolboxEntry);
      } else if (exclude && exclude.indexOf(profileName + ',') > -1) {
        // Place this entry on the removal list if the exclude attribute is
        // defined and does match the board type that is currently defined
        // for the project.
        toRemove.push(toolboxEntry);
      }
    }
  }

  // Remove the XML nodes that were set to be deleted
  for (let j = 0; j < toRemove.length; j++) {
    toRemove[j].parentNode.removeChild(toRemove[j]);
  }

  // Turn the XML object back into a string
  const out = new XMLSerializer();
  let outStr = out.serializeToString(xmlDoc);
  outStr = outStr
      .replace(/ include="[\S]+"/g, '')
      .replace(/ exclude="[\S]+"/g, '');

  return outStr;
}

export {filterToolbox, xmlToolbox};
