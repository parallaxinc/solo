##Custom Blocks
This is a list of the blocks that were modified during the conversion to modules.

### base.js
* Blockly.Blocks.base_freqout
* Blockly.Blocks.lis3dh_init
* Blockly.Blocks.logic_compare
* Blockly.Blocks.logic_negate
* Blockly.Blocks.logic_operation
* Blockly.Blocks.math_arithmetic
* Blockly.Blocks.math_crement
* Blockly.Blocks.math_number
* Blockly.Blocks.math_random
* Blockly.Blocks.parens
* Blockly.Blocks.system_counter

### communicate.js
* Blockly.Blocks.debug_lcd_init
* Blockly.propc.debug_lcd_init
* Blockly.Blocks.i2c_busy
* Blockly.Blocks.i2c_mode
* Blockly.Blocks.i2c_receive
* Blockly.propc.i2c_receive
* Blockly.Blocks.i2c_send
* Blockly.propc.i2c_send
* Blockly.propc.oled_bitmap
* Blockly.Blocks.oled_initialize
* Blockly.propc.oled_initialize
* Blockly.Blocks.parallel_lcd_init
* Blockly.Blocks.serial_open
* Blockly.Blocks.shift_in
* Blockly.propc.shift_in
* Blockly.propc.shift_out
* Blockly.Blocks.ws2812b_init
* Blockly.Blocks.wx_init
* Blockly.Blocks.wx_init_adv
* Blockly.Blocks.xbee_setup
* Blockly.propc.xbee_setup

### control.js
* Blockly.Blocks.control_repeat_for_loop
* Blockly.Blocks.controls_if
* Blockly.Blocks.controls_select
* Blockly.Blocks.controls_repeat

### gpio.js
* Blockly.Blocks.ab_drive_init
* Blockly.Blocks.ab_volt_in
* Blockly.Blocks.check_pin
* Blockly.Blocks.check_pin_input
* Blockly.Blocks.fb360_init
* Blockly.Blocks.fb360_get
* Blockly.Blocks.fb360_set
* Blockly.Blocks.fb360_setup
* Blockly.Blocks.fb360_status
* Blockly.Blocks.get_pins
* Blockly.Blocks.make_pin
* Blockly.Blocks.make_pin_input
* Blockly.Blocks.mcp320x_read
* Blockly.Blocks.servo_move
* Blockly.Blocks.servo_speed
* Blockly.propc.sd_file_pointer
* Blockly.Blocks.sd_init
* Blockly.propc.sd_open
* Blockly.propc.sd_read
* Blockly.Blocks.set_pins
* Blockly.Blocks.set_pins_binary
* Blockly.Blocks.sound_init
* Blockly.propc.sound_play
* Blockly.Blocks.wav_set_pins
* Blockly.propc.wav_play

### heb.js
* Blockly.Blocks.heb_text_to_speech_pins
* Blockly.propc.heb_text_to_speech_say
* Blockly.propc.heb_text_to_speech_spell

### procedures.js
* Blockly.Blocks['procedures_callnoreturn']
* Blockly.Blocks['procedures_defnoreturn']

### propc.js
* Blockly.propc.finish
* Blockly.propc.init

### s3.js
* Blockly.Blocks.analog_input
* Blockly.Blocks.scribbler_ping
* Blockly.Blocks.scribbler_stop_servo
* Blockly.Blocks.sirc_s3_get

### sensors.js
* Blockly.Blocks.bme680_init
Blockly.propc.bme680_init
* Blockly.Blocks.colorpal_enable
* Blockly.Blocks.fp_scanner_init
* Blockly.propc.fp_scanner_init
* Blockly.Blocks.GPS_init
* Blockly.propc.GPS_init
* Blockly.Blocks.joystick_input_yaxis
* Blockly.Blocks.keypad_initialize
* Blockly.propc.keypad_initialize
* Blockly.Blocks.lsm9ds1_init
* Blockly.propc.lsm9ds1_init
* Blockly.Blocks.MMA7455_init
* Blockly.Blocks.HMC5883L_init
* Blockly.Blocks.rfid_enable
* Blockly.propc.rfid_enable
* Blockly.Blocks.sensor_ping
* Blockly.Blocks.sound_impact_run
* Blockly.propc.sound_impact_run

### variables.js
No matches.


## BlocklyProp Launcher

### Checking for Updates
The application looks for and attempts to open a connection to the BlocklyProp
Launcher each time the blocklyc.html DOM becomes ready by calling findClient().
It also sets up a timer to check for a client connection every 3.5 seconds.
```javascript 1.5
$(document).ready(function() {
  findClient();
  setInterval(findClient, 3500);
});
```
The findClient() function tries to establish a connection to the underlying
client, first attempting to contact the BlocklyProp Launcher via a
websocket using establishBPLauncherConnection(). If that attempt fails,
findClient then attempts to contact the older BlocklyProp Client stack via
HTTP using establishBPClientConnection(). If that also fails, the application
updates the UI to inform the user that the client cannot be contacted.

Once the connection to the client has been established, the application
compares the version information reported by the client with the it's copy of
the current version information. If they differ, the checkClientVersionModal()
function is called. The checkClientVersionModal() function displays a modal
dialog with information about the client version if the one being used is
outdated. If the version is below the recommended version the user is warned,
and versions below the minimum are alerted.

The modal references the 'client-version-modal' DIV tag in the blocklyc.html
page.

The initClientDownloadLinks() function sets the href for each of the client
links to point to the correct files available on the downloads.parallax.com
S3 site. The URLs are defined in the initClientDownloadLinks() function.
