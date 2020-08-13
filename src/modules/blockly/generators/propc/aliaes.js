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

import Blockly from 'blockly/core';

/* BASE */
// Map deprecated block to its replacement
Blockly.Blocks.set_char_at_position_zero = Blockly.Blocks.set_char_at_position;
Blockly.propc.set_char_at_position_zero = Blockly.propc.set_char_at_position;
Blockly.Blocks.get_substring_zero = Blockly.Blocks.get_substring;
Blockly.propc.get_substring_zero = Blockly.propc.get_substring;

/* COMMUNICATE */
Blockly.propc.serial_print_multiple = Blockly.propc.console_print_multiple;
Blockly.propc.debug_lcd_print_multiple = Blockly.propc.console_print_multiple;
Blockly.Blocks.parallel_lcd_print = Blockly.Blocks.debug_lcd_print;
Blockly.propc.parallel_lcd_print = Blockly.propc.debug_lcd_print;
Blockly.Blocks.parallel_lcd_number = Blockly.Blocks.debug_lcd_number;
Blockly.propc.parallel_lcd_number = Blockly.propc.debug_lcd_number;
Blockly.Blocks.parallel_lcd_set_cursor = Blockly.Blocks.debug_lcd_set_cursor;
Blockly.propc.parallel_lcd_set_cursor = Blockly.propc.debug_lcd_set_cursor;

Blockly.Blocks.parallel_lcd_print_multiple =
    Blockly.Blocks.debug_lcd_print_multiple;
Blockly.propc.parallel_lcd_print_multiple =
    Blockly.propc.console_print_multiple;
Blockly.propc.xbee_print_multiple = Blockly.propc.console_print_multiple;
Blockly.propc.wx_print_multiple = Blockly.propc.console_print_multiple;
Blockly.Blocks.string_scan_str = Blockly.Blocks.console_print_str;
Blockly.Blocks.string_scan_dec = Blockly.Blocks.console_print_dec;
Blockly.Blocks.string_scan_hex = Blockly.Blocks.console_print_hex;
Blockly.Blocks.string_scan_bin = Blockly.Blocks.console_print_bin;
Blockly.Blocks.string_scan_float = Blockly.Blocks.console_print_float;
Blockly.Blocks.string_scan_char = Blockly.Blocks.console_print_char;
Blockly.propc.string_sprint_multiple = Blockly.propc.console_print_multiple;

/* GPIO */
Blockly.propc.fb360_set = Blockly.propc.fb360_setup;

/* OLED */
Blockly.Blocks.oled_get_max_width = Blockly.Blocks.oled_get_max_height;
Blockly.propc.oled_get_max_width = Blockly.propc.oled_get_max_height;

Blockly.propc.oled_print_multiple = Blockly.propc.console_print_multiple;

/* E-PAPER */
Blockly.Blocks.epaper_initialize = Blockly.Blocks.oled_initialize;
Blockly.propc.epaper_initialize = Blockly.propc.oled_initialize;

Blockly.Blocks.epaper_clear_screen = Blockly.Blocks.oled_clear_screen;
Blockly.propc.epaper_clear_screen = Blockly.propc.oled_clear_screen;

Blockly.Blocks.epaper_bitmap = Blockly.Blocks.oled_bitmap;
Blockly.propc.epaper_bitmap = Blockly.propc.oled_bitmap;

Blockly.Blocks.epaper_draw_circle = Blockly.Blocks.oled_draw_circle;
Blockly.propc.epaper_draw_circle = Blockly.propc.oled_draw_circle;

Blockly.Blocks.epaper_draw_line = Blockly.Blocks.oled_draw_line;
Blockly.propc.epaper_draw_line = Blockly.propc.oled_draw_line;

Blockly.Blocks.epaper_draw_pixel = Blockly.Blocks.oled_draw_pixel;
Blockly.propc.epaper_draw_pixel = Blockly.propc.oled_draw_pixel;

Blockly.Blocks.epaper_draw_triangle = Blockly.Blocks.oled_draw_triangle;
Blockly.propc.epaper_draw_triangle = Blockly.propc.oled_draw_triangle;

Blockly.Blocks.epaper_draw_rectangle = Blockly.Blocks.oled_draw_rectangle;
Blockly.propc.epaper_draw_rectangle = Blockly.propc.oled_draw_rectangle;

Blockly.Blocks.epaper_get_max_height = Blockly.Blocks.oled_get_max_height;
Blockly.propc.epaper_get_max_height = Blockly.propc.oled_get_max_height;

Blockly.Blocks.epaper_print_number = Blockly.Blocks.oled_print_number;
Blockly.propc.epaper_print_number = Blockly.propc.oled_print_number;

Blockly.Blocks.epaper_print_text = Blockly.Blocks.oled_print_text;
Blockly.propc.epaper_print_text = Blockly.propc.oled_print_text;

Blockly.Blocks.epaper_print_multiple = Blockly.Blocks.oled_print_multiple;
Blockly.propc.epaper_print_multiple = Blockly.propc.console_print_multiple;

Blockly.Blocks.epaper_set_cursor = Blockly.Blocks.oled_set_cursor;
Blockly.propc.epaper_set_cursor = Blockly.propc.oled_set_cursor;

Blockly.Blocks.epaper_text_color = Blockly.Blocks.oled_text_color;
Blockly.propc.epaper_text_color = Blockly.propc.oled_text_color;

Blockly.Blocks.epaper_text_size = Blockly.Blocks.oled_text_size;
Blockly.propc.epaper_text_size = Blockly.propc.oled_text_size;


/* HEB */

Blockly.Blocks.heb_print_multiple = Blockly.Blocks.oled_print_multiple;
Blockly.propc.heb_print_multiple = Blockly.propc.console_print_multiple;

/* PROCEEDURES */
Blockly.propc.procedures_callnoreturn = Blockly.propc.procedures_callreturn;

/* S3 */
Blockly.Blocks.scribbler_wait = Blockly.Blocks.scribbler_simple_wait;
Blockly.propc.scribbler_wait = Blockly.propc.scribbler_simple_wait;


/* Sensors */
Blockly.Blocks.joystick_input_xaxis = Blockly.Blocks.joystick_input_yaxis;
Blockly.propc.joystick_input_xaxis = Blockly.propc.joystick_input_yaxis;

Blockly.Blocks.MX2125_acceleration_yaxis =
    Blockly.Blocks.MX2125_acceleration_xaxis;
Blockly.propc.MX2125_acceleration_yaxis =
    Blockly.propc.MX2125_acceleration_xaxis;

Blockly.Blocks.MX2125_tilt_xaxis = Blockly.Blocks.MX2125_acceleration_xaxis;
Blockly.propc.MX2125_tilt_xaxis = Blockly.propc.MX2125_acceleration_xaxis;
Blockly.Blocks.MX2125_tilt_yaxis = Blockly.Blocks.MX2125_acceleration_xaxis;
Blockly.propc.MX2125_tilt_yaxis = Blockly.propc.MX2125_acceleration_xaxis;
