# BlocklyProp Solo

A simplified implementation of Google's Blockly project configured to support
Parallax robots and sensors.

[https://solo.parallax.com/](https://solo.parallax.com)

*develop* [![Build Status](https://travis-ci.org/parallaxinc/solo.svg?branch=develop)](https://travis-ci.org/parallaxinc/solo)

## Experimental Options
Several experimental options are available and they can be activated using flags in the URL.  To use one or more of the
experimental features, add `?experimental=` and whichever feature name(s) below, separated by a pipe `|` character.  For
example, to turn on experimental blocks and the XML editing features, you would use the URL
[https://solo.parallax.com/?experimental=blocks|xedit](https://solo.parallax.com/?experimental=blocks|xedit).

*NOTE: No support is provided from Parallax Inc. for use of these features!*

### Experimental Features
- `propc` Adds "Propeller C (code only) option to the available board/device types, allowing you to use the BlocklyProp
Solo website as a simplified Propeller C editor.
- `volatile` The blockly propc editor adds a "volatile" declaration to functions that are run in different cogs on the
Propeller MCU.  This would allow for code optimization by prop-gcc.  Currently, the cloud compiler does not support
changing the optimization level, and optimization is set to "O0 (none)".
- `blocks` Makes experimental (pre-release) blocks available in the toolbox.  These blocks can change and they may not
work, so use them with caution.
- `xedit` Allows the BlocklyProp's XML to be edited.  The button that normally switches between "code" and "blocks" will
gain a third state: "XML".

## Additional Debugging/Console messages
There are numerous `console.log()` debugging points throughout the codebase, and most of them are behind a flag:
[https://solo.parallax.com/?debug=true](https://solo.parallax.com/?debug=true).

*NOTE: NO guarantees are made about what is displayed in the console.  What is displayed may change at any time.*


