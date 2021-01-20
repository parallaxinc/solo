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
 * @fileoverview C code generator
 * @author Matthew Matz, Michel Lampo
 * @description This file registers the PropC C source code generator
 * with the Blockly environment.
 */
'use strict';

import Blockly from 'blockly/core.js';
import {getDefaultProfile} from '../../project.js';
import {isExperimental} from '../../utility';
import {WarnDeprecatedBlocks} from '../../constants';

Blockly.propc = new Blockly.Generator('propc');
Blockly.HSV_SATURATION = 0.75;
Blockly.HSV_VALUE = 0.60;
Blockly.RTL = false;

/**
 * Color Palette - Created by Michel on 30-4-2016.
 */
const colorPalette = {
  defaultColors: {
    'deprecated': 60,
    'input': 140,
    'output': 165,
    'io': 185,
    'programming': 205,
    'functions': 225,
    'variables': 250,
    'math': 275,
    'binary': 275,
    'robot': 295,
    'heb': 295,
    'ab': 320,
    'protocols': 340,
    'system': 320,
  },
  grayscaleColors: {
    'deprecated': '#a85c39',
    'input': '#AAAAAA',
    'output': '#222222',
    'io': '#333333',
    'programming': '#444444',
    'functions': '#555555',
    'variables': '#666666',
    'math': '#777777',
    'binary': '#777777',
    'robot': '#888888',
    'heb': '#888888',
    'ab': '#999999',
    'protocols': '#111111',
    'system': '#999999',
  },
  activePalette: null,
  getColor: function(type) {
    if (colorPalette.activePalette &&
        colorPalette.activePalette[type] !== undefined) {
      return colorPalette.activePalette[type];
    }
    return '#000000';
  },
};

if (document.referrer.indexOf('?') === -1) {
  colorPalette.activePalette = colorPalette.defaultColors;
} else {
  if (document.referrer.split('?')[1].indexOf('grayscale=1') === -1) {
    colorPalette.activePalette = colorPalette.defaultColors;
  } else {
    colorPalette.activePalette = colorPalette.grayscaleColors;
  }
}

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
// Propeller directives
Blockly.propc.addReservedWords(
    'INA,INB,OUTA,OUTB,DIRA,DIRB,CTRA,CTRB,PHSA,PHSB,CNT,CLKFREQ,');

// C language reserved words
Blockly.propc.addReservedWords(
    'auto,else,long,switch,break,enum,register,typedef,case,extern,return,' +
    'union,char,float,short,unsigned,const,for,signed,void,continue,goto,' +
    'sizeof,volatile,default,if,static,while,do,int,struct,');

// Compiler and Simple Library bits - there are a few
Blockly.propc.addReservedWords(
    '_Packed,double,_bss_end,_bss_start,_byteReadyFlag,_byteToSend,_byteType,' +
    '_C_LOCK,_clkfreq,_clkmodeval,_CLZSI,_CLZSI_ret,_cs,' +
    '_doscanf,_doscanf_ct,_dosprnt,_driverlist,_FileDriver,_font,' +
    '_gps_baud,_gps_rx_pin,_gps_tx_pin,_height,_hub_end,_intsprnt,' +
    '_LMM_CALL_INDIRECT,_LMM_FCACHE_START,_LMM_RET,' +
    '_load_start_adcACpropab_cog,_MASK_0000FFFF,_MASK_FFFFFFFF,_MULSI,' +
    '_MULSI_ret,_rs,_rst,_safe_gets,_scanf_getf,_scanf_getl,' +
    '_sclk,_screenLock,_servoPulseReps,_sid,_SimpleSerialDriver,_stack_end,' +
    '_TMP0,_width,(float,int, long long, short, float, short, int),abd_abs,' +
    'abd_blockGoto,');

// adb library
Blockly.propc.addReservedWords(
    'abd_checkActivityBotStrings,abd_checkCenterPulseWidth,' +
    'abd_checkForNoSignal,abd_checkForSwappedCables,abd_checkServoCalSupply,' +
    'abd_cntrIdx,abd_cog,abd_dc,abd_dca,abd_displaySide,abd_dist,' +
    'abd_distError,abd_ditherA,abd_ditherAa,abd_ditherAd,abd_ditherAp,' +
    'abd_ditherV,abd_ditherVa,abd_ditherVd,abd_ditherVp,abd_dsr,abd_dvFlag,' +
    'abd_ea,abd_ed,abd_edMax,abd_eeAddr,abd_elCnt,abd_encoders,abd_ePin,' +
    'abd_ePinL,abd_ePinR,abd_gotoFlag,abd_gotoRampStep,abd_gotoSpeedLimit,' +
    'abd_i,abd_intTabSetup,abd_nudgeCtr,abd_nudgeInc,abd_p,abd_rampStep,' +
    'abd_record,abd_sample,abd_sampleCount,abd_senseEncoders,abd_spdmL,' +
    'abd_spdmR,abd_spdrL,abd_spdrR,abd_speed,abd_speedd,abd_speedi,' +
    'abd_speedLimit,abd_speedOld,abd_speedT,abd_sPin,abd_sPinL,abd_sPinR,' +
    'abd_stack,abd_stopCtr,abd_stopPulseReps,abd_td,abd_tdst,abd_ticks,' +
    'abd_ticksf,abd_ticksGuard,abd_ticksi,abd_trimB,abd_trimF,' +
    'abd_trimticksB,abd_trimticksF,abd_us,abd_zdir,abd_zeroDelay,');

// And more stuff
Blockly.propc.addReservedWords(
    'abort,abortChain__,abvolts_daCtrBits,abvolts_scale,accel,accel_shaken,' +
    'accels,ad_in,ad_init,ad_volts,adc_in,adc_init,adc_start,adc_stop,' +
    'adc_volts,adc124S021dc,adcACpropab_code,add_driver,AR,ard_blockGoto,' +
    'ard_blockSpeed,ard_blockSpeedPrev,ard_cycles,ard_deadZone,' +
    'ard_dhb10_arlo,ard_dhb10_terminal,ard_feedback,ard_gotoDoneReps,' +
    'ard_increment,ard_mode,ard_offset,ard_opened,ard_ramp_interval,' +
    'ard_rampStep,ard_rampStepMode,ard_replyMode,ard_servo_pin_L,' +
    'ard_servo_pin_R,ard_speedAccLim,ard_speedL,ard_speedLimit,ard_speedR,' +
    'ard_tRampStepPrev,asin,atan2,atof,atoi,audio_dac,audio0,badge_setup,' +
    'badgeLight,badgeScreen,binary_audiosynth_dat_end,' +
    'binary_audiosynth_dat_size,binary_audiosynth_dat_start,' +
    'binary_pst_dat_end,binary_pst_dat_size,binary_pst_dat_start,' +
    'binary_VGA_dat_end,binary_VGA_dat_size,binary_VGA_dat_start,' +
    'binary_ws2812_driver_dat_end,binary_ws2812_driver_dat_size,');

Blockly.propc.addReservedWords(
    'binary_ws2812_driver_dat_start,BOTTOM,box,boxFilled,bt_accelInitFlag,' +
    'button,buttons,cal_activityBot,cal_drive_display,cal_drive_pins,' +
    'cal_drive_setramp,cal_drive_sleep,cal_drive_speeds,cal_drive_stop,' +
    'cal_encoderPins,cal_encoders,cal_servoPins,CFG,circle,circleFilled,' +
    'clear,clear_bit,cog_end,cog_endStackTest,cog_num,cog_run,' +
    'cog_runStackTest,cogIRcom,cogstart,cogstart_stackTest,' +
    'cogstop_stackTest,colorPal_close,colorPal_getRGB,colorPal_init,' +
    'colorPal_open,colorPal_reset,colorPalRRGGBB,compareRRGGBB,' +
    'compass_init,compass_read,ComputeOutCode,constrain,contacts_count,' +
    'contacts_displayAll,contacts_eraseAll,contacts_setStartAddr,count,' +
    'cpcog,cursor,cursor_x,cursor_y,da_ctr_cog,da_ctr_stop,da_init,' +
    'da_out,da_res,da_setupScale,da_useScale,da_volts,dac_close,' +
    'dac_ctr,dac_ctr_cog,dac_ctr_res,dac_ctr_stop,dac_loop,dac_set,' +
    'dac_setup,dac_start,dac_stop,dev_ee_show,dfs_mount,dhb10_com,' +
      'dhb10_reply,dhb10_terminal,dport_ptr,dprint,dprinti,');

Blockly.propc.addReservedWords(
    'drive_calibrationResults,drive_clearTicks,drive_close,drive_com,' +
    'drive_displayInterpolation,drive_encoderPins,drive_feedback,' +
    'drive_getSpeed,drive_getTicks,drive_getTicksCalc,drive_goto' +
    ',drive_gotoBlocking,drive_gotoDoneDelay,drive_gotoMode,drive_gotoStatus,' +
    'drive_open,drive_pins,drive_ramp,drive_rampStep,drive_servoPins,' +
    'drive_setAcceleration,drive_setErrorLimit,drive_setMaxSpeed,' +
    'drive_setMaxVelocity,drive_setramp,drive_setRampStep,drive_sleep,' +
    'drive_speed,drive_speedBlocking,drive_speeds,drive_stop,' +
    'DRIVER_LIST_SIZE,dscan,dt_end,dt_fromDateStr,dt_fromEt,dt_fromTimeStr,' +
    'dt_get,dt_getms,dt_run,dt_set,dt_toDateStr,dt_toEt,dt_toTimeStr,' +
    'dte_dateETV,dte_timeETV,dte_toCal,dte_toJD,dte_toSPD,ee_badgeCheck,' +
    'ee_config,ee_displayIndex,ee_getByte,ee_getFloat32,ee_getInt,' +
    'ee_getStr,ee_init,ee_putByte,ee_putFloat32,ee_putInt,ee_putStr,' +
    'ee_readByte,ee_readFloat32,ee_readInt,ee_readShort,ee_readStr,' +
    'ee_writeByte,ee_writeFloat32,');

Blockly.propc.addReservedWords(
    'ee_writeInt,ee_writeShort,ee_writeStr,eeBadgeOk,eeBus,eeHome,eei2cLock,' +
  'eei2cLockFlag,eeNext,eeNextAddr,eeprint,eeprinted,eeRecCount,eeRecHome,' +
  'eeRecOffice,eeRecs,eeRecsAddr,eescan,encoderFeedback,encoderLeds_start,' +
  'encoderLeds_stop,endianSwap,fclose,fdserial_close,fdserial_open,' +
  'fdserial_rxChar,fdserial_rxCheck,fdserial_rxCount,fdserial_rxFlush,' +
  'fdserial_rxPeek,fdserial_rxReady,fdserial_rxTime,fdserial_txChar,' +
  'fdserial_txEmpty,fdserial_txFlush,fingerprint_add,' +
  'fingerprint_allowOverwrite,fingerprint_close,fingerprint_countUsers,' +
  'fingerprint_deleteUser,fingerprint_lookupUserPrivlage,fingerprint_open,' +
  'fingerprint_readResponse,fingerprint_scan,fingerprint_sendCommand,' +
  'fingerprint_setStrictness,fingerprint_setTimeout,float2string,' +
  'font_lg_bubble_data,font_lg_bubble_index,font_lg_bubble_zeroMap,' +
  'font_lg_sans_data,font_lg_sans_index,font_lg_sans_zeroMap,' +
  'font_lg_script_data,font_lg_script_index,font_lg_script_zeroMap,');

Blockly.propc.addReservedWords(
    'font_lg_serif_data,font_lg_serif_index,font_lg_serif_zeroMap,' +
  'font_med_bubble_data,font_med_sans_data_01,font_med_sans_data_02,' +
  'font_med_sans_data_03,font_med_sans_data_04,font_med_sans_data_05,' +
  'font_med_sans_data_06,font_med_sans_data_07,font_med_sans_data_08,' +
  'font_med_sans_data_09,font_med_sans_data_10,font_med_sans_data_11,' +
  'font_med_sans_data_12,font_med_sans_data_13,font_med_sans_data_14,' +
  'font_med_sans_data_15,font_med_sans_data_16,font_med_sans_data_17,' +
  'font_med_script_data,font_med_serif_data,fopen,fp,fread,free,freqout,' +
  'get_bit,get_direction,get_directions,get_output,get_outputs,get_state,' +
  'get_states,get8bitColor,getBin,getChar,getColorRRGGBB,getDec,getFloat,' +
  'getHex,getStr,gps_altitude,gps_changeBaud,gps_close,gps_cog,gps_data,' +
  'gps_fix,gps_fixValid,gps_heading,gps_latitude,gps_longitude,' +
  'gps_magneticVariation,gps_open,gps_rawDate,gps_rawTime,gps_run,' +
  'gps_satsTracked,gps_ser,gps_stack,gps_stopping,gps_txByte,gps_velocity,');

Blockly.propc.addReservedWords(
    'greypalette,gVgaScreen,gVgaText,hdserial,high,HSA,HSB,i2c_busy,i2c_in,' +
  'i2c_newbus,i2c_open,i2c_out,i2c_poll,i2c_readByte,i2c_readData,i2c_start,' +
  'i2c_stop,i2c_writeByte,i2c_writeData,i2cLock,imu_accelAvailable,' +
  'imu_calibrateAG,imu_calibrateMag,imu_clearAccelInterrupt,' +
  'imu_clearGyroInterrupt,imu_clearMagInterrupt,imu_getAccelCalibration,' +
  'imu_getAccelScale,imu_getGyroCalibration,imu_getGyroScale,' +
  'imu_getMagCalibration,imu_getMagScale,imu_gyroAvailable,imu_init,' +
  'imu_magAvailable,imu_readAccel,imu_readAccelCalculated,imu_readGyro,' +
  'imu_readGyroCalculated,imu_readMag,imu_readMagCalculated,imu_readTemp,' +
  'imu_readTempCalculated,imu_setAccelCalibration,imu_setAccelInterrupt,' +
  'imu_setAccelScale,imu_setGyroCalibration,imu_setGyroInterrupt,' +
  'imu_setGyroScale,imu_setMagCalibration,imu_setMagInterrupt,' +
  'imu_setMagScale,imu_SPIreadBytes,imu_SPIwriteByte,imu_tempAvailable,' +
  'inbox,inBuff,init_MMA7660FC,input,INSIDE,int_fraction,interpolate2,');

Blockly.propc.addReservedWords(
    'interpolation_table_setup,invert,ir_receive,ir_send,IRA,IRB,irclear,' +
  'ircom_dec,ircom_hex,ircom_rjdec,ircom_rx,ircom_rxcheck,ircom_rxflush,' +
  'ircom_rxtime,ircom_start,ircom_stop,ircom_str,ircom_tx,ircom_tx_bin,' +
  'ircom_txflush,irprint,irscan,irself,keypad_getNumber,' +
  'keypad_getNumberEndKey,keypad_read,keypad_readFrom,keypad_setup,led,' +
  'led_off,led_on,leddat,leds,ledsself,LEFT,letter,light_clear,' +
  'light_set_all,light_set_rgb,light_set_rgb1,light_set_rgb2,light_start,' +
  'light_stop,line,longjmp,low,main_ret,malloc,map,mark,memcpy,memmove,' +
  'memset,MMA7455_getMode,MMA7455_getxyz10,MMA7455_getxyz8,MMA7455_gRange,' +
  'MMA7455_gRangeVal,MMA7455_init,MMA7455_pinClk,MMA7455_pinDat,' +
  'MMA7455_pinEn,MMA7455_readByte,MMA7455_setMode,MMA7455_setOffsetX,' +
  'MMA7455_setOffsetY,MMA7455_setOffsetZ,MMA7455_writeByte,ms,ms_timer,' +
  'mstime_get,mstime_reset,mstime_set,mstime_start,mstime_stop,mx_accel,' +
  'mx_rotate,mx_tilt,NA,NB,NT');

// OLED library
Blockly.propc.addReservedWords(
    'oledc_bitmap,oledc_clear,oledc_color565,oledc_copy,' +
    'oledc_drawCharLarge,oledc_drawCharMedium,oledc_drawCharSmall,' +
    'oledc_drawCircle,oledc_drawCircleHelper,oledc_drawFastHLine,' +
    'oledc_drawFastVLine,oledc_drawLine,oledc_drawLinePrimative,' +
    'oledc_drawNumber,oledc_drawPixel,oledc_drawPixelPrimative,' +
    'oledc_drawRect,oledc_drawRoundRect,oledc_drawText,oledc_drawTriangle,' +
    'oledc_fillCircle,oledc_fillCircleHelper,oledc_fillRect,' +
    'oledc_fillRectPrimative,oledc_fillRoundRect,oledc_fillTriangle,' +
    'oledc_font_sm,oledc_fontLoader,oledc_getCursorX,oledc_getCursorY,' +
    'oledc_getHeight,oledc_getRotation,oledc_getWidth,oledc_goTo,' +
    'oledc_init,oledc_invertDisplay,oledc_isScrolling,oledc_print,' +
    'oledc_screenLock,oledc_screenLockClr,oledc_screenLockSet,' +
    'oledc_scrollStart,oledc_scrollStop,oledc_setCursor,oledc_setRotation,' +
    'oledc_setTextColor,oledc_setTextFont,oledc_setTextSize,' +
    'oledc_setTextWrap,oledc_sleep,oledc_spiWrite,oledc_startup,' +
    'oledc_wake,oledc_write,oledc_writeCommand,oleddat,oledprint');

Blockly.propc.addReservedWords(
    'ParseGGA,ParseRMC,pause,ping,ping_cm,ping_inches,point,PrepBuff,print,' +
    'printi,printNumber,ptrBuff,pulse_in,pulse_out,putBin,putBinLen,putChar,' +
    'putDec,putDecLen,putFloat,putFloatPrecision,putHex,putHexLen,putLine,' +
    'putln,putStr,putStrLen,pw,pwL,pwm_set,pwm_start,pwm_stop,pwR,r,rand,' +
    'raw2g100,rc_time,readBin,readChar,readDec,readFloat,readHex,readStr,' +
    'receive,remainder,remapColor,replace_byte,retrieve,reverse,rfid_disable,' +
    'rfid_enable,rfid_get,rfid_open,rfid_reset,rfidser_close,rgb,rgbs,RIGHT,' +
    'rotate180,RQA,RQB');

// S3 - Scribbler Robot library
Blockly.propc.addReservedWords(
    'S3,s3_booleanRandom,s3_buttonCount,s3_buttonPressed,s3_enableMic,' +
    's3_lightSensor,s3_lineSensor,s3_motorSet,s3_motorSetDistance,' +
    's3_motorSetRotate,s3_motorsMoving,s3_ping,s3_playNote,s3_randomRange,' +
    's3_readBars,s3_readMic,s3_readObstacle,s3_resetButtonCount,' +
    's3_runWithoutResult,s3_setLED,s3_setup,s3_setVoices,s3_setVolume,' +
    's3_simpleButton,s3_simpleDrive,s3_simpleLight,s3_simpleLine,' +
    's3_simpleObstacle,s3_simplePlay,s3_simpleRandom,s3_simpleSpin,' +
    's3_simpleStalled,s3_simpleStop,s3_stalled,scan');

Blockly.propc.addReservedWords(
    'SCL,screen_auto,screen_char32x16,screen_char7x5,screen_dataAddr,' +
    'screen_getAuto,screen_getBuffer,screen_GetDisplayHeight,' +
    'screen_GetDisplayType,screen_GetDisplayWidth,screen_getSplash,' +
    'screen_HIGH,screen_image,screen_init,screen_LOW,screen_scrollLeft,' +
    'screen_scrollLeftDiag,screen_scrollRight,screen_scrollRightDiag,' +
    'screen_scrollStop,screen_setcommand,screen_SHIFTOUT,' +
    'screen_ssd1306_Command,screen_ssd1306_Data,screen_start,screen_stop,' +
    'screen_string16x4,screen_string8x1,screen_string8x2,screen_swap,');

Blockly.propc.addReservedWords(
    'screen_update,screen_WRITEBUFF,screenLock,scribbler_align_with,' +
    'scribbler_arc,scribbler_arc_by,scribbler_arc_deg,scribbler_arc_deg_now,' +
    'scribbler_arc_now,scribbler_arc_to,scribbler_beep,scribbler_begin_path,' +
    'scribbler_button_count,scribbler_button_mode,scribbler_button_press,' +
    'scribbler_command_tone,scribbler_default_light_calibration,' +
    'scribbler_default_line_threshold,scribbler_default_obstacle_threshold,' +
    'scribbler_default_wheel_calibration,scribbler_delay_tenths,' +
    'scribbler_ee_read_byte,scribbler_ee_write_byte,scribbler_end_path,' +
    'scribbler_get_adc_results,scribbler_get_charging,' +
    'scribbler_get_light_calibration,scribbler_get_line_threshold,' +
    'scribbler_get_mic_env,scribbler_get_model_s2,scribbler_get_model_s3,' +
    'scribbler_get_obstacle_threshold,scribbler_get_results,' +
    'scribbler_get_sync,scribbler_get_timer,scribbler_get_usb_powered');

Blockly.propc.addReservedWords(
    'scribbler_get_wheel_calibration,scribbler_go_back,scribbler_go_forward,' +
    'scribbler_go_left,scribbler_go_right,scribbler_heading_is,' +
    'scribbler_heading_is_deg,scribbler_here_is,scribbler_light_sensor,' +
    'scribbler_light_sensor_log,scribbler_light_sensor_raw,' +
    'scribbler_light_sensor_word,scribbler_line_sensor,scribbler_motion,' +
    'scribbler_motion_addr,scribbler_move,scribbler_move_by,' +
    'scribbler_move_now,scribbler_move_ready,scribbler_move_to,' +
    'scribbler_moving,scribbler_obstacle,scribbler_play_pause,' +
    'scribbler_play_sync,scribbler_play_tone,scribbler_play_tones,' +
    'scribbler_read_light_calibration,scribbler_read_line_threshold,' +
    'scribbler_read_obstacle_threshold,scribbler_read_wheel_calibration,' +
    'scribbler_reset_button_count,scribbler_run_motors,scribbler_set_led,' +
    'scribbler_set_leds,scribbler_set_light_calibration');

Blockly.propc.addReservedWords(
    'scribbler_set_line_threshold,scribbler_set_obstacle_threshold,' +
    'scribbler_set_power_off,scribbler_set_speed,scribbler_set_voices,' +
    'scribbler_set_volume,scribbler_set_wheel_calibration,scribbler_stalled,' +
    'scribbler_start,scribbler_start_mic_env,scribbler_start_motors,' +
    'scribbler_start_timer,scribbler_start_tones,scribbler_stop_all,' +
    'scribbler_stop_now,scribbler_turn,scribbler_turn_by,' +
    'scribbler_turn_by_deg,scribbler_turn_deg,scribbler_turn_deg_now,' +
    'scribbler_turn_now,scribbler_turn_to,scribbler_turn_to_deg,' +
    'scribbler_wait_stop,scribbler_wait_sync,scribbler_wheels_now,' +
    'scribbler_write_light_calibration,scribbler_write_line_threshold,' +
    'scribbler_write_obstacle_threshold,scribbler_write_wheel_calibration');

Blockly.propc.addReservedWords(
    'sd_mount,sleep,secondctr,self,send,serial_close,serial_open,' +
    'serial_rxChar,serial_txChar,servo_angle,servo_disable,servo_get,' +
    'servo_set,servo_setramp,servo_speed,servo_stop,servoAux_angle,' +
    'servoAux_get,servoAux_set,servoAux_setRamp,servoAux_speed,' +
    'servoAux_stop,set_1_blue,set_1_rgb,set_bit,set_direction,' +
    'set_directions,set_drive_speed,set_io_dt,set_io_timeout,set_output,' +
    'set_outputs,set_pause_dt,shape,shift_in,shift_out,sign');

Blockly.propc.addReservedWords(
    'simpleterm_close,simpleterm_fromTxDo,simpleterm_open,simpleterm_pointer,' +
    'simpleterm_reopen,simpleterm_toRxDi,sirc_button,sirc_code,sirc_device,' +
    'sirc_setTimeout,sound_adsr,sound_config,sound_end,sound_endAllSound,' +
    'sound_endSound,sound_envelopeSet,sound_envelopeStart,sound_freq,' +
    'sound_freqRaw,sound_loadPatch,sound_note,sound_param,sound_playChords,' +
    'sound_playSound,sound_run,sound_sampleSet,sound_volume,sound_wave,' +
    'soundImpact,soundImpact_end,soundImpact_getCount,soundImpact_run,' +
    'spdL,spdR,speedPrev,sprint,sprinti,SPUTC,SPUTL,SPUTS,square_wave,' +
    'square_wave_cog,square_wave_setup,square_wave_stop,srand,sscan,' +
    'sscan_ct,st_buscnt,st_eeInitFlag,st_eeprom,st_iodt,st_mark,st_msTicks,' +
    'st_pauseTicks,st_timeout,st_usTicks,store,stored,strcmp,strcpy,string,' +
    'string2float,stringView,strlen,strncmp,strstr,strtok,talk_end,talk_run,' +
    'talk_say,talk_set_speaker,talk_spell,tcL,tcR,term,term_cmd,text_size,' +
    'textbgcolor,textcolor,textsize,TFTINVERTED,TFTROTATION,TFTSCROLLING');

Blockly.propc.addReservedWords(
    'ticksL,ticksR,timeout,timeTicksSetup,toggle,TOP,touch_start,TPCount,' +
    'TPDischarge,TPPins,TRA,track,TRB,triangle,triangleFilled,us,UTA,UTB,' +
    'vgatext_clear,vgatext_clearEOL,vgatext_close,vgatext_getColors,' +
    'vgatext_getColumns,vgatext_getRows,vgatext_getX,vgatext_getY,' +
    'vgatext_home,vgatext_open,vgatext_out,vgatext_putchar,' +
    'vgatext_setColorPalette,vgatext_setColors,vgatext_setCoordPosition,' +
    'vgatext_setX,vgatext_setXY,vgatext_setY,vgatext_start,vgatext_stop,' +
    'VocalTract_aural_id,VocalTract_empty,VocalTract_full,VocalTract_go,' +
    'VocalTract_sample_ptr,VocalTract_set_attenuation,VocalTract_set_pace' +
    ',VocalTract_start,VocalTract_stop,wait,wav_close,wav_play,wav_playing,' +
    'wav_reader,wav_stop,wav_volume,wavDacBufferH,wavDacBufferL,wifi_baud,' +
    'wifi_buf,wifi_buf_size,wifi_bufferSize,wifi_command,wifi_comSelect,' +
    'wifi_comSelectPin,wifi_connect,wifi_disconnect,wifi_event,wifi_fds,' +
    'wifi_handle,wifi_id,wifi_ip,wifi_ipAddr,wifi_join,wifi_leave');

Blockly.propc.addReservedWords(
    'wifi_listen,wifi_mode,wifi_msReplyTimeout,wifi_pin_di,wifi_pin_do,' +
    'wifi_poll,wifi_print,wifi_recv,wifi_replyStringCopy,' +
    'wifi_replyStringDisplay,wifi_replyStringIn,wifi_scan,wifi_send,' +
    'wifi_setBuffer,wifi_simpletermResume,wifi_simpletermSuspend,' +
    'wifi_start,wifi_stationIp,wifi_status,wifi_stop,wifi_stringDisplay,' +
    'wifi_timeoutFlag,wrap,writeBin,writeBinLen,writeChar,writeDec,' +
    'writeDecLen,writeFloat,writeFloatPrecision,writeHex,writeHexLen,' +
    'writeLine,writeStr,writeStrLen,ws_start,ws2812_close,ws2812_open,' +
    'ws2812_set,ws2812_start,ws2812_stop,ws2812_wheel,ws2812_wheel_dim,' +
    'ws2812b_open,ws2812b_start');

/**
 * SD File reserved words
 */
Blockly.propc.addReservedWords(
    'fp,fclose,fopen,fread,fseek,ftell,fwrite,sd_init,sd_mount,');

/**
 * Order of operation ENUMs.
 *
 */
Blockly.propc.ORDER_ATOMIC = 0; // 0 "" ...
Blockly.propc.ORDER_UNARY_POSTFIX = 1; // expr++ expr-- () [] .
Blockly.propc.ORDER_UNARY_PREFIX = 2; // -expr !expr ~expr ++expr --expr
Blockly.propc.ORDER_MULTIPLICATIVE = 3; // * / % ~/
Blockly.propc.ORDER_ADDITIVE = 4; // + -
Blockly.propc.ORDER_SHIFT = 5; // << >>
Blockly.propc.ORDER_RELATIONAL = 7; // is is! >= > <= <
Blockly.propc.ORDER_EQUALITY = 8; // == != === !==
Blockly.propc.ORDER_BITWISE_AND = 9; // &
Blockly.propc.ORDER_BITWISE_XOR = 10; // ^
Blockly.propc.ORDER_BITWISE_OR = 11; // |
Blockly.propc.ORDER_LOGICAL_AND = 12; // &&
Blockly.propc.ORDER_LOGICAL_OR = 13; // ||
Blockly.propc.ORDER_CONDITIONAL = 14; // expr ? expr : expr
Blockly.propc.ORDER_ASSIGNMENT = 15; // := *= /= ~/= %= += -= <<= >>= &= ^= |=
Blockly.propc.ORDER_NONE = 99; // (...)


/**
 * Initialize the database of variable names.
 * @param {Blockly.Workspace} workspace The active workspace.
 */
Blockly.propc.init = function(workspace) {
  const profile = getDefaultProfile();
  // Create a dictionary of definitions to be printed before setups.
  Blockly.propc.definitions_ = [];
  Blockly.propc.definitions_['include simpletools'] =
      '#include "simpletools.h"';
  Blockly.propc.methods_ = {};
  Blockly.propc.setups_ = {};
  Blockly.propc.method_declarations_ = {};
  Blockly.propc.global_vars_ = {};
  Blockly.propc.cog_methods_ = {};
  Blockly.propc.cog_setups_ = {};

  // Create a list of stacks
  Blockly.propc.stacks_ = [];
  Blockly.propc.vartype_ = {};
  Blockly.propc.varlength_ = {};
  Blockly.propc.string_var_lengths = [];

  // Set up specific libraries for devices like the Scribbler or Badge
  if (profile.description === 'Scribbler Robot') {
    Blockly.propc.definitions_['include_scribbler'] = '#include "s3.h"';
  } else if (profile.description === 'Hackable Electronic Badge') {
    Blockly.propc.definitions_['badgetools'] = '#include "badgetools.h"';
    Blockly.propc.setups_['badgetools'] = 'badge_setup();';
  } else if (profile.description === 'Badge WX') {
    Blockly.propc.definitions_['badgetools'] = '#include "badgewxtools.h"';
    Blockly.propc.setups_['badgetools'] = 'badge_setup();';
  }

  if (Blockly.Variables) {
    if (!Blockly.propc.variableDB_) {
      Blockly.propc.variableDB_ =
          new Blockly.Names(Blockly.propc.RESERVED_WORDS_);
    } else {
      Blockly.propc.variableDB_.reset();
    }

    Blockly.propc.variableDB_.setVariableMap(workspace.getVariableMap());

    const defvars = [];
    const variables = Blockly.Variables.allUsedVarModels(workspace);
    for (let x = 0; x < variables.length; x++) {
      const varName = Blockly.propc.variableDB_.getName(
          variables[x].getId(),
          Blockly.VARIABLE_CATEGORY_NAME);
      defvars[x] = '{{$var_type_' + varName + '}} ' + varName +
          '{{$var_length_' + varName + '}};';
      Blockly.propc.definitions_['variable' + x.toString(10)] = defvars[x];
    }
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 *
 * @description
 * Question: cogFunction is populated but never used. Why does it exist?
 */
Blockly.propc.finish = function(code) {
  const profile = getDefaultProfile();
  // Convert the definitions dictionary into a list.
  const imports = [];
  const methods = [];
  const uiSystemSettings = [];
  const declarations = [];
  const definitions = [];
  const definitionNames = [];
  const functionVariables = [];
  const cogFunctions = [];

  // Gives BlocklyProp developers the ability to add global variables
  for (const name in Blockly.propc.global_vars_) {
    if (Object.prototype.hasOwnProperty.call(
        Blockly.propc.global_vars_, name)) {
      const def = Blockly.propc.global_vars_[name];
      definitions.push(def);
      definitionNames.push(name);
    }
  }

  // Set the beginning of the variable definitions
  const userVariableStart = definitions.length;

  for (const name in Blockly.propc.definitions_) {
    if (Object.prototype.hasOwnProperty.call(
        Blockly.propc.definitions_, name)) {
      const def = Blockly.propc.definitions_[name];
      if (def.match(/^#include/) || def.match(/^#define/) ||
          def.match(/^#if/) || def.match(/^#end/) ||
          def.match(/^#else/) || def.match(/^#pragma/)) {
        imports.push(def);
      } else if (def.match(/\/\/ GRAPH_[A-Z]*_START:/)) {
        uiSystemSettings.push(def);
      } else {
        definitions.push(def);
        definitionNames.push(name);
      }
    }
  }

  // Set the end of the variable definitions
  const userVariableEnd = definitions.length;

  for (const declaration in Blockly.propc.method_declarations_) {
    if (Object.prototype.hasOwnProperty.call(
        Blockly.propc.method_declarations_, declaration)) {
      declarations.push(Blockly.propc.method_declarations_[declaration]);
      for (const functionIndex in Blockly.propc.cog_methods_) {
        if (Blockly.propc.cog_methods_[functionIndex].replace(/[^\w]+/g, '') ===
          // eslint-disable-next-line max-len
          Blockly.propc.method_declarations_[declaration].replace(/void/g, '').replace(/[^\w]+/g, '')) {
          cogFunctions.push(declaration);
        }
      }
    }
  }

  for (const method in Blockly.propc.methods_) {
    if (Object.prototype.hasOwnProperty.call(Blockly.propc.methods_, method)) {
      for (const cogSetup in Blockly.propc.cog_setups_) {
        if (Blockly.propc.cog_setups_[cogSetup][0] === method) {
          const cogFunctionCode = Blockly.propc.methods_[method];
          const bracePosition = cogFunctionCode.indexOf('{');
          Blockly.propc.methods_[method] =
            cogFunctionCode.substring(0, bracePosition + 1) +
            Blockly.propc.cog_setups_[cogSetup][1] +
            cogFunctionCode.substring(
                bracePosition + 1, bracePosition.length);
        }
      }
      methods.push(Blockly.propc.methods_[method]);
    }
  }

  for (const def in definitions) {
    if (Object.prototype.hasOwnProperty.call(definitions, def)) {
      for (const variable in Blockly.propc.vartype_) {
        if (definitions[def].indexOf('{{$var_type_' + variable + '}}') > -1) {
          if (Blockly.propc.vartype_[variable] !== 'LOCAL') {
            definitions[def] = definitions[def].replace(
                '{{$var_type_' + variable + '}}',
                Blockly.propc.vartype_[variable]);
          } else {
            definitions[def] = definitions[def].replace(
                '{{$var_type_' + variable + '}} ' + variable +
              '{{$var_length_' + variable + '}}', '');
          }
          if (Blockly.propc.varlength_[variable]) {
            definitions[def] = definitions[def].replace(
                '{{$var_length_' + variable + '}}',
                '[' + Blockly.propc.varlength_[variable] + ']');
          } else {
            definitions[def] = definitions[def].replace(
                '{{$var_length_' + variable + '}}', '');
          }
        }
      }

      if (definitions[def].indexOf('{{$var_type_') > -1) {
        definitions[def] = definitions[def]
            .replace(/\{\{\$var_type_.*?\}\}/ig, 'int')
            .replace(/\{\{\$var_length_.*?\}\}/ig, '');
      }

      // exclude custom code blocks from these modifiers
      if (definitionNames[def].indexOf('cCode') === -1) {
        // Exclude variables with "__" in the name for now because those
        // are buffers for private functions
        if (definitions[def].indexOf('char *') > -1 &&
          definitions[def].indexOf('__') === -1 &&
          definitions[def].indexOf('rfidBfr') === -1 &&
          definitions[def].indexOf('wxBuffer') === -1) {
          definitions[def] = definitions[def]
              .replace('char *', 'char ')
              .replace(';', '[64];');
        } else if (definitions[def].indexOf('wxBuffer') > -1) {
          definitions[def] = definitions[def]
              .replace('char *', 'char ')
              .replace('wxBuffer;', 'wxBuffer[64];');
        }

        // TODO: Temporary patch to correct some weirdness with char array
        //  pointer declarations
        definitions[def] = definitions[def]
            .replace(/char \*(\w+)\[/g, 'char $1[');
      }

      // Sets the length of string arrays based on the lengths specified
      // in the string set length block.
      const vl = Blockly.propc.string_var_lengths.length;
      for (let vt = 0; vt < vl; vt++) {
        const varMatch = new RegExp(
            'char\\s+' + Blockly.propc.string_var_lengths[vt][0] + '\\[');
        if (definitions[def].match(varMatch)) {
          definitions[def] = 'char ' +
          Blockly.propc.string_var_lengths[vt][0] +
          '[' +
          Blockly.propc.string_var_lengths[vt][1] +
          ' + 1];';
        }
      }

      // Looking for functions used in cog definitions.
      // WIP: .indexOf fails on a null methods_[method]
      for (const method in Blockly.propc.cog_methods_) {
        if (Blockly.propc.methods_[method]
            .indexOf(definitions[def]
                .replace(/[charint]* (\w+)[[\]0-9]*;/g, '$1')) > -1) {
          functionVariables.push(definitions[def]);
        }

        // TODO: Remove this code when the regEx above has been verified.
        // if (Blockly.propc.methods_[method]
        //     .indexOf(definitions[def]
        //         .replace(/[charint]* (\w+)[\[\]0-9]*;/g, '$1')) > -1) {
        //   functionVariables.push(definitions[def]);
        // }
      }
    }
  }

  for (const stack in Blockly.propc.stacks_) {
    if (Object.prototype.hasOwnProperty.call(Blockly.propc.stacks_, stack)) {
      definitions.push(Blockly.propc.stacks_[stack]);
      definitionNames.push(stack);
    }
  }

  // Convert the setups dictionary into a list.
  const setups = [];
  for (const name in Blockly.propc.setups_) {
    if (Object.prototype.hasOwnProperty.call(Blockly.propc.setups_, name)) {
      setups.push('  ' + Blockly.propc.setups_[name]);
    }
  }

  if (profile.description === 'Scribbler Robot') {
    // setups.unshift('  s3_setup();pause(100);');
    setups.unshift(' ');
    setups.unshift('  pause(100);');
    setups.unshift('  s3_setup();');
    setups.unshift('  // Initialize the robot');
  }

  // Add volatile to variable declarations in cogs
  for (let idx = userVariableStart; idx < userVariableEnd; idx++) {
    for (const idk in functionVariables) {
      if (definitions[idx] === functionVariables[idk] &&
          definitions[idx].indexOf('volatile') === -1) {
        // TODO: uncomment this when optimization is utilized!
        if (isExperimental.indexOf('volatile' > -1)) {
          definitions[idx] = 'volatile ' + definitions[idx];
        }

        // TODO: Apply 'volatile' to array definitions as well!
      }
    }
  }

  let spacerDefinitions = '\n\n';
  if (definitions.toString().trim().length > 0) {
    spacerDefinitions += '// ------ Global Variables and Objects ------\n';
  }

  const allDefs = '// ------ Libraries and Definitions ------\n' +
      imports.join('\n') +
      spacerDefinitions +
      definitions.join('\n') + '\n\n';

  if (code.indexOf('// RAW PROPC CODE\n//{{||}}\n') > -1) {
    const pcc = code.split('//{{||}}\n');
    return pcc[2];
  } else {
    // Indent every line.
    code = '  ' + code.replace(/\n/g, '\n  ');

    // Comment out any instance of 'pause(0);' - causes a compiler error
    code = code
        .replace(/\n\s+$/, '\n')
        .replace(/pause\(0\);\n/g, '// pause(0);\n');

    // Remove redundant casts
    code = code.replace(/\(float\)\s*\(int\)/g, '(float)');

    // Sweep for doubled-up parentheses
    while (code.match(/\(\(([^()]*)\)\)/g)) {
      code = code.replace(/\(\(([^()]*)\)\)/g, '($1)');
    }

    code = 'int main()\n{\n' + setups.join('\n') + '\n' + code + '\n}';
    let setup = '';
    if (Blockly.mainWorkspace.getAllBlocks().length === 0 &&
                profile.description !== 'Propeller C (code-only)') {
      setup += '/* EMPTY_PROJECT */\n';
    }
    setup += uiSystemSettings.join('\n') + '\n\n';

    let spacerDeclarations = '';
    if (declarations.length > 0) {
      spacerDeclarations += '// ------ Function Declarations ------\n';
    }

    let spacerFunctions = '\n\n';
    if (methods.length > 0) {
      spacerFunctions += '// ------ Functions ------\n';
    }

    if (Blockly.propc.definitions_['pure_code'] === '/* PURE CODE ONLY */\n') {
      code = Blockly.propc.methods_['pure_code'];
    } else {
      code = setup + allDefs
          .replace(/\n\n+/g, '\n\n')
          .replace(/\n*$/, '\n\n') +
          spacerDeclarations +
          declarations.join('\n\n')
              .replace(/\n\n+/g, '\n')
              .replace(/\n*$/, '\n') +
         '\n// ------ Main Program ------\n' + code + spacerFunctions +
          methods.join('\n');
    }

    // Change strings assigned to variables to strcpy functions
    code = code.replace(/(\w+)\s*=\s*\({0,1}"(.*)"\){0,1};/g,
        function(m, p1, p2) {
          if (p2.indexOf(',') === 0 && p2.indexOf(', "') > -1) {
            return m;
          } else {
            return 'strcpy(' + p1 + ', "' + p2 +
                '");\t\t\t// Save string into variable ' + p1 + '.';
          }
        });

    return code;
  }
};


/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.propc.scrubNakedValue = function(line) {
  return line + ';\n';
};


/**
 * Common tasks for generating Prop-c from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 *
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The propc code created for this block.
 * @return {string} Prop-c code with comments and subsequent blocks added.
 * @this {Blockly.CodeGenerator}
 * @private
 */
Blockly.propc.scrub_ = function(block, code) {
  if (code === null) {
    // Block has handled code generation itself.
    return '';
  }
  let commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    const comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.propc.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (let x = 0; x < block.inputList.length; x++) {
      // TODO: Possible type coercion issue
      if (block.inputList[x].type === Blockly.INPUT_VALUE) {
        const childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          const comment = Blockly.propc.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.propc.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

// Provides backward compatibility for some older browsers:
// From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
// TODO: Remove this statement once we decide what browser
//  revisions we are going to support
/*
if (!Object.keys) {
  Object.keys = (function() {
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
    const dontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor',
    ];
    const dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'function' &&
          (typeof obj !== 'object' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      const result = []; let prop; let i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
*/

// NOTE: Replaces core function!                   // USE WHEN CORE IS UPDATED
/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @override
 * @return {!Array.<string>} Array of variable names.
 * @this {Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownCreate = function() {
  if (!this.variable_) {
    throw new Error('Tried to call dropdownCreate on a variable field with no' +
          ' variable selected.');
  }
  const name = this.getText();
  let workspace = null;
  if (this.sourceBlock_) {
    workspace = this.getSourceBlock().workspace;
  }
  let variableModelList = [];
  if (workspace) {
    const variableTypes = this.getVariableTypes_();
    // Get a copy of the list, so that adding rename and new variable options
    // doesn't modify the workspace's list.
    for (let i = 0; i < variableTypes.length; i++) {
      const variableType = variableTypes[i];
      const variables = workspace.getVariablesOfType(variableType);
      variableModelList = variableModelList.concat(variables);
    }
  }

  variableModelList.sort(Blockly.VariableModel.compareByName);

  const options = [];
  for (let i = 0; i < variableModelList.length; i++) {
    // Set the UUID as the internal representation of the variable.
    options[i] = [variableModelList[i].name, variableModelList[i].getId()];
  }
  if (name !== Blockly.LANG_VARIABLES_SET_ITEM) {
    options.push([Blockly.Msg['RENAME_VARIABLE'], Blockly.RENAME_VARIABLE_ID]);
  }
  // Prevents user from deleting the default "item" variable
  if (Blockly.Msg['DELETE_VARIABLE'] &&
      name !== Blockly.LANG_VARIABLES_SET_ITEM) {
    options.push(
        [
          Blockly.Msg['DELETE_VARIABLE'].replace('%1', name),
          Blockly.DELETE_VARIABLE_ID,
        ]
    );
  }

  return options;
};


/**
 * Given a proposed entity name, generate a name that conforms to the
 * [_A-Za-z][_A-Za-z0-9]* format that most languages consider legal for
 * variables.
 * @override
 * @param {string} name Potentially illegal entity name.
 * @return {string} Safe entity name.
 * @private
 */
Blockly.Names.prototype.safeName_ = function(name) {
  if (!name) {
    name = 'unnamed';
  } else {
    // Unfortunately names in non-latin characters will look like
    // _E9_9F_B3_E4_B9_90 which is pretty meaningless.
    name = encodeURI(name.replace(/ /g, '_')).replace(/[^\w]/g, '_');
    // Most languages don't allow names with leading numbers. Addition here:
    // prevents collision with names with a leading double underscore.
    if ('0123456789'.indexOf(name[0]) !== -1 ||
        (name[0] === '_' && name[1] === '_')) {
      name = 'my_' + name;
    }
  }
  return name;
};

/*
const findBlocksByType = function(blockType) {
  const blockList = Blockly.getMainWorkspace().getAllBlocks();
  const blockMatchList = [];
  for (let idx = 0; idx < blockList.length; idx++) {
    if (blockList[idx].type === blockType) {
      blockMatchList.push(blockList[idx].id);
    }
  }
  if (blockMatchList.length > 0) {
    return blockMatchList;
  }
  return null;
};
*/

/**
 * Extends Blockly.Input to allow the input to have a specific range of
 * allowed values. Allows blocks to read the input's range and show warnings
 * if the user enters values outside of the range.
 * See base.js->Blockly.Blocks.math_number for more information about
 * formatting the range string.
 *
 * @param {string} rangeInfo
 *  String containing information about the range/allowed values:
 * @return {Object} this the specified input
 */
Blockly.Input.prototype.appendRange = function(rangeInfo) {
  this.inputRange = rangeInfo;
  return this;
};


/**
 * Extends Blockly.Input to allow the input to have a specific range or
 * allowed values. See base.js->Blockly.Blocks.math_number for more
 * information about formatting the range string.
 * @return {string} the String populated by Blockly.Input.appendRange()
 */
Blockly.Input.prototype.getRange = function() {
  return this.inputRange;
};


// TODO: Remove the following overrides after updating to a blockly core
//  with these patches (targeted for 2019Q4).
/**
 * Initialize the model for this field if it has not already been initialized.
 * If the value has not been set to a variable by the first render, we make up a
 * variable rather than let the value be invalid.
 * @override - Due to error in blockly core targeted to be fixed in release
 * 2019 Q4 - delete after replacing with a core containing these fixes
 * @package
 */
Blockly.FieldVariable.prototype.initModel = function() {
  if (this.variable_) {
    return; // Initialization already happened.
  }
  const variable = Blockly.Variables.getOrCreateVariablePackage(
      this.getSourceBlock().workspace, null,
      this.defaultVariableName, this.defaultType_);

  // Don't call setValue because we don't want to cause a rerender.
  this.doValueUpdate_(variable.getId());
};

/**
 * Update the source block when the mutator's blocks are changed.
 * Bump down any block that's too high.
 * Fired whenever a change is made to the mutator's workspace.
 * @override - Due to error in blockly core targeted to be fixed in
 * release 2019 Q4 - delete after replacing with a core containing these fixes
 * @param {!Blockly.Events.Abstract} e Custom data for event.
 * @private
 */
Blockly.Mutator.prototype.workspaceChanged_ = function(e) {
  if (e.type == Blockly.Events.UI ||
        (e.type == Blockly.Events.CHANGE && e.element == 'disabled')) {
    return;
  }

  if (!this.workspace_.isDragging()) {
    const blocks = this.workspace_.getTopBlocks(false);
    const MARGIN = 20;
    for (let b = 0, block; (block = blocks[b]); b++) {
      const blockXY = block.getRelativeToSurfaceXY();
      const blockHW = block.getHeightWidth();
      if (blockXY.y + blockHW.height < MARGIN) {
        // Bump any block that's above the top back inside.
        block.moveBy(0, MARGIN - blockHW.height - blockXY.y);
      }
    }
  }

  // When the mutator's workspace changes, update the source block.
  if (this.rootBlock_.workspace == this.workspace_) {
    Blockly.Events.setGroup(true);
    const block = this.block_;
    const oldMutationDom = block.mutationToDom();
    const oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
    // Allow the source block to rebuild itself.
    block.compose(this.rootBlock_);
    block.render();
    const newMutationDom = block.mutationToDom();
    const newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);
    if (oldMutation != newMutation) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          block, 'mutation', null, oldMutation, newMutation));
      // Ensure that any bump is part of this mutation's event group.
      const group = Blockly.Events.getGroup();
      setTimeout(function() {
        Blockly.Events.setGroup(group);
        block.bumpNeighbours();
        Blockly.Events.setGroup(false);
      }, Blockly.BUMP_DELAY);
    }

    if (oldMutation != newMutation &&
          this.workspace_.keyboardAccessibilityMode) {
      Blockly.navigation.moveCursorOnBlockMutation(block);
    }
    // Don't update the bubble until the drag has ended, to avoid moving blocks
    // under the cursor.
    if (!this.workspace_.isDragging()) {
      this.resizeBubble_();
    }
    Blockly.Events.setGroup(false);
  }
};

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @override - Due to error in blockly core targeted to be fixed in
 * release 2019 Q4 - delete after replacing with a core containing these fixes
 */
Blockly.BlockSvg.prototype.bumpNeighbours = function() {
  if (!this.workspace) {
    return; // Deleted block.
  }
  if (this.workspace.isDragging()) {
    return; // Don't bump blocks during a drag.
  }
  const rootBlock = this.getRootBlock();
  if (rootBlock.isInFlyout) {
    return; // Don't move blocks around in a flyout.
  }
  // Loop through every connection on this block.
  /** @type {Blockly.Connection[]} */
  const myConnections = this.getConnections_(false);
  /** @type {RenderedConnection} connection */
  // TODO: Correct assignment/boolean in for/next block
  for (let i = 0, connection; connection = myConnections[i]; i++) {
    // connection is of type Blockly.RenderedConnection
    // Spider down from this block bumping all sub-blocks.
    if (connection.isConnected() && connection.isSuperior()) {
      connection.targetBlock().bumpNeighbours();
    }

    const neighbours = connection.neighbours_(Blockly.SNAP_RADIUS);
    for (let j = 0, otherConnection; otherConnection = neighbours[j]; j++) {
      // If both connections are connected, that's probably fine.  But if
      // either one of them is unconnected, then there could be confusion.
      if (!connection.isConnected() || !otherConnection.isConnected()) {
        // Only bump blocks if they are from different tree structures.
        if (otherConnection.getSourceBlock().getRootBlock() != rootBlock) {
          // Always bump the inferior block.
          if (connection.isSuperior()) {
            otherConnection.bumpAwayFrom_(connection);
          } else {
            connection.bumpAwayFrom_(otherConnection);
          }
        }
      }
    }
  }
};

const isDeprecatedBlockWarningEnabled = function() {
  return WarnDeprecatedBlocks;
};

export {colorPalette, isDeprecatedBlockWarningEnabled};
