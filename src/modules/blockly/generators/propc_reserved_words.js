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

import Blockly from 'blockly/core.js';

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
export const loadReservedWords = () => {
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
};
