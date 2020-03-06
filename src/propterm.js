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
 * @description A lightweight, generic in-browser terminal with cursor positioning, clearing, and text-wrapping support.
 * @author Matthew Matz matt.m.matz@gmail.com
 * @function PropTerm
 */
// eslint-disable-next-line no-unused-vars
class PropTerm {
    /**
     * @param {HTMLElement} terminalElement HTML element to populate the terminal into.
     * @param {object} outputCallback function to call and send characters typed into the terminal.
     * @param {TerminalOptions} options for configuring the terminal.
     */
    constructor(terminalElement, outputCallback, options) {
        this.callback = outputCallback;
        this.element = terminalElement;

        this.buffer = {
            alert: false,
            alertTimeout: null,
            chars: '',
            textArray: ['']
        };
        this.echo = {
            keys: true,
            trap: false,
            buffer: []
        };
        this.cursor = {
            x: 0,            // horizontal position
            y: 0,            // vertical position
            xf: 0,           // horizontal target (final)
            yf: 0,           // vertical target (final)
            setFlag: 0,
            scrollTo: true,
            scrolled: 0
        };
        this.size = {
            charactersWide: 256,
            tabSpacing: 5
        };
        this.ascii2unicode = [
            '\u00C7', '\u00FC', '\u00E9', '\u00E2', '\u00E4', '\u00E0', '\u00E5', '\u00E7', '\u00EA',
            '\u00EB', '\u00E8', '\u00EF', '\u00EE', '\u00EC', '\u00C4', '\u00C5', '\u00C9', '\u00E6',
            '\u00C6', '\u00F4', '\u00F6', '\u00F2', '\u00FB', '\u00F9', '\u00FF', '\u00D6', '\u00DC',
            '\u00A2', '\u00A3', '\u00A5', '\u20A7', '\u0192', '\u00E1', '\u00ED', '\u00F3', '\u00FA',
            '\u00F1', '\u00D1', '\u00AA', '\u00BA', '\u00BF', '\u2310', '\u00AC', '\u00BD', '\u00BC',
            '\u00A1', '\u00AB', '\u00BB', '\u2591', '\u2592', '\u2593', '\u2502', '\u2524', '\u2561',
            '\u2562', '\u2556', '\u2555', '\u2563', '\u2551', '\u2557', '\u255D', '\u255C', '\u255B',
            '\u2510', '\u2514', '\u2534', '\u252C', '\u251C', '\u2500', '\u253C', '\u255E', '\u255F',
            '\u255A', '\u2554', '\u2569', '\u2566', '\u2560', '\u2550', '\u256C', '\u2567', '\u2568',
            '\u2564', '\u2565', '\u2559', '\u2558', '\u2552', '\u2553', '\u256B', '\u256A', '\u2518',
            '\u250C', '\u2588', '\u2584', '\u258C', '\u2590', '\u2580', '\u03B1', '\u00DF', '\u0393',
            '\u03C0', '\u03A3', '\u03C3', '\u00B5', '\u03C4', '\u03A6', '\u0398', '\u03A9', '\u03B4',
            '\u221E', '\u03C6', '\u03B5', '\u2229', '\u2261', '\u00B1', '\u2265', '\u2264', '\u2320',
            '\u2321', '\u00F7', '\u2248', '\u00B0', '\u2219', '\u00B7', '\u221A', '\u207F', '\u00B2',
            '\u25A0', '\u00A0'];

        if (options) {
            if (options.echoKeys) {
                this.echo.keys = options.echoKeys;
            }
            if (options.trapEchos) {
                this.echo.trap = options.trapEchos;
            }
            if (options.scrollToCursor) {
                this.cursor.scrollTo = options.scrollToCursor;
            }
            if (options.extendedAsciiMap) {
                this.ascii2unicode = options.extendedAsciiMap;
            }
            if (options.charactersWide && !isNaN(options.charactersWide) && options.charactersWide > 1) {
                this.size.charactersWide = options.charactersWide;
            }
            if (options.tabSpacing && !isNaN(options.tabSpacing) && options.tabSpacing > 1) {
                this.size.tabSpacing = options.tabSpacing;
            }
        }

        this._setupTerminalCss(options);
        this._setupWarningBox(options);
        this._addSoundElement();
        this._setupListeners(this);

        this.resize();
    }

    // ---------------------------------------------------------
    // Private Methods
    // ---------------------------------------------------------

    /**
     * @private
     * @param {TerminalOptions} options
     * @description Adds CSS to the HTML page to support the appearance of the Terminal
     */
    _setupTerminalCss(options) {
        // Read the color styles from the terminal element to use in 
        // the inverted color styles for the visual beep
        let terminalComputedStyle = window.getComputedStyle(this.element);
        let terminalTextColor = terminalComputedStyle.getPropertyValue('color');
        let terminalBkgColor = terminalComputedStyle.getPropertyValue('background-color');

        // set the scrolling and text alignment
        let sheet = window.document.styleSheets[0];
        let propTermCSStext;
        propTermCSStext =  '.propTerm_ {';
        propTermCSStext += 'vertical-align: text-top;';
        propTermCSStext += 'overflow-y: scroll;';
        propTermCSStext += 'overflow-x: scroll;';
        propTermCSStext += '}';
        sheet.insertRule(propTermCSStext, sheet.cssRules.length);

        // remove the focus ring (since the cursor indicates focus)
        sheet = window.document.styleSheets[0];
        propTermCSStext =  '.propTerm_:focus {';
        propTermCSStext += 'outline-width: 0;';
        propTermCSStext += '}';
        sheet.insertRule(propTermCSStext, sheet.cssRules.length);
        
        // create a visual-beep animation class that inverts colors
        sheet = window.document.styleSheets[0];
        propTermCSStext =  '.visual-beep_ {';
        propTermCSStext += 'animation-name: vbeep_;';
        propTermCSStext += 'animation-duration: .25s;';
        propTermCSStext += '}';
        sheet.insertRule(propTermCSStext, sheet.cssRules.length);
        
        // provide animation keyframes for the visual beep class
        sheet = window.document.styleSheets[0];
        propTermCSStext =  '@keyframes vbeep_ {';
        propTermCSStext += '0% {';
        propTermCSStext += 'background: ' + terminalTextColor + ';';
        propTermCSStext += 'color: ' + terminalBkgColor + ';';
        propTermCSStext += '}';
        propTermCSStext += '100% {';
        propTermCSStext += 'background: ' + terminalBkgColor + ';';
        propTermCSStext += 'color: ' + terminalTextColor + ';';
        propTermCSStext += '}';
        propTermCSStext += '}';
        sheet.insertRule(propTermCSStext, sheet.cssRules.length);

        // Add a default class for the warning text box
        sheet = window.document.styleSheets[0];
        propTermCSStext =  '.warning-text_ {';
        propTermCSStext += 'font-size: 11px;';
        propTermCSStext += 'background-color: #f2dede;';
        propTermCSStext += 'border: 1px solid rgb(235, 204, 209);';
        propTermCSStext += 'border-radius: 4px;';
        propTermCSStext += 'margin-bottom: 5px;';
        propTermCSStext += 'padding: 3px;';
        propTermCSStext += 'color:rgb(169, 68, 66);';
        propTermCSStext += '}';
        sheet.insertRule(propTermCSStext, sheet.cssRules.length);

        // add the propTerm_ class to the element
        this.element.classList.add("propTerm_");

        // set the tabindex of the HTML element to make it editable.
        let tabIndex = 1;
        if (options && options.tabIndex) {
            tabIndex = options.tabIndex;
        }
        this.element.setAttribute("tabindex", tabIndex.toString(10));
    }

    /**
     * @private
     * @description Adds a sound element to the end of the HTML 
     * page that is used by the terminal if it recieves a ASCII 7 (BEEP)
     */
    _addSoundElement() {
        if (!document.getElementById('term-beep_')) {
            // add the terminal beep this.sound to the end of the HTML body.
            let sound      = document.createElement('audio');
            sound.id       = 'term-beep_';
            sound.style.display = 'none';

            // If present, the browser will offer controls to allow the user
            // to control audio playback, including volume, seeking, and
            // pause/resume playback.
            sound.controls = false;

            sound.src      = 'data:audio/wav;base64,UklGRrQJAABXQVZFZm10IBAAAAABAAIAESsAACJWAAACAAgATElTVBoAAABJTkZPSVNGVA4AAABMYXZmNTguMjAuMTAwAGRhdGFuCQAAg4OqqrCwiYlfX0lJbm6Wlre3m5tyckpKW1uEhK6ura2Dg1lZS0t0dJyct7eUlGxsSUlhYYqKsrKnp35+U1NQUHl5o6O1tY6OZmZHR2hokJC2tqGheHhPT1VVf3+pqbGxiYlgYElJbW2Vlbe3m5tzc0tLWlqEhK6urq6EhFpaS0tzc5ubt7eVlW1tSUlgYImJsrKoqH5+VFRPT3l5oqK1tY+PZ2dHR2dnj4+1taKieXlPT1RUfn6oqLKyiYlgYElJbW2UlLe3nJx0dEtLWVmDg62trq6EhFtbSkpycpubt7eWlm5uSUlgYIiIsbGpqX9/VVVPT3h4oaG2tpCQaGhHR2Zmjo61taOjeXlQUFNTfn6np7KyiophYUlJbGyUlLe3nJx1dUxMWVmCgqysr6+FhVxcSkpycpqat7eXl29vSUlfX4iIsbGpqYCAVlZOTnd3oKC2tpCQaGhISGVljY21taOjenpQUFNTfX2mprOzi4tiYkhIa2uUlLe3nZ10dExMWVmBgaysr6+GhlxcSkpxcZmZuLiXl29vSUleXoeHsLCqqoCAVlZOTnd3n5+2tpGRaWlISGRkjY21taSke3tRUVJSfHymprS0i4tjY0hIa2uTk7a2np51dU1NWFiCgqysr6+Ghl1dSkpwcJiYuLiYmHBwSkpdXYaGsLCrq4GBV1dNTXZ2n5+2tpKSampISGRkjIy0tKWle3tRUVFRe3ulpbS0jIxkZEhIamqSkra2n592dk1NV1eBgaursLCGhl1dSkpwcJeXuLiZmXFxSkpcXIaGr6+srIGBWFhNTXV1np62tpOTa2tISGNji4u0tKamfHxSUlFRe3ukpLW1jY1kZEhIaWmRkba2n593d05OVlaAgKqqsLCHh15eSUlvb5eXuLiZmXJySkpcXIWFr6+srIKCWVlMTHR0nZ23t5SUa2tISGJii4uzs6amfX1TU1BQenqjo7W1jY1lZUhIaGiQkLa2oKB3d05OVlaAgKmpsbGIiF9fSUlvb5eXt7eamnJySkpbW4SErq6trYODWVlLS3R0nJy3t5SUbGxJSWFhioqysqenfn5TU1BQeXmjo7W1jo5mZkdHaGiQkLa2oaF4eE9PVVV/f6mpsbGIiGBgSUlubpaWt7ebm3JySkpbW4SErq6trYSEWlpLS3Nzm5u3t5WVbW1JSWBgiYmysqiofn5UVE9PeXmiorW1j49nZ0dHZ2ePj7W1oqJ5eU9PVFR+fqiosrKJiWBgSUltbZWVt7ebm3NzS0taWoSErq6uroODWlpLS3Jym5u3t5aWbm5JSWBgiIixsampf39VVU9PeHihoba2kJBoaEdHZmaOjrW1o6N5eVBQU1N+fqensrKKimFhSUlsbJSUt7ecnHR0S0tZWYODra2uroSEW1tKSnJympq4uJeXb29JSV9fiIixsampgIBWVk5Od3egoLa2kJBoaEhIZWWNjbW1o6N6elBQU1N9faams7OLi2JiSEhra5SUt7ednXR0TExZWYKCrKyvr4WFXFxKSnJympq3t5eXb29JSV5eh4ewsKqqgIBWVk5Od3efn7a2kZFpaUhIZGSNjbW1pKR7e1FRUlJ8fKamtLSLi2NjSEhra5OTtraennV1TU1YWIGBrKyvr4aGXFxKSnFxmZm4uJeXb29JSV5eh4ewsKurgYFXV01Ndnafn7a2kpJqakhIZGSMjLS0paV7e1FRUVF7e6WltLSMjGRkSEhqapKStrafn3Z2TU1XV4GBq6uwsIaGXV1KSnBwmJi4uJiYcHBKSl1dhoawsKurgYFXV0xMdXWenra2k5Nra0hIY2OLi7S0pqZ8fFJSUVF7e6SktbWNjWRkSEhpaZGRtrafn3d3Tk5WVoCAqqqwsIeHXl5JSW9vl5e4uJmZcXFKSlxchoavr6ysgYFYWExMdXWenre3lJRra0hIYmKLi7OzpqZ9fVNTUFB6eqOjtbWNjWVlSEhoaJCQtragoHd3Tk5WVoCAqamxsYiIX19JSW9vl5e3t5qacnJKSlxchYWvr6ysgoJZWUxMdHSdnbe3lJRsbEhIYWGKirOzp6d+flNTUFB5eaOjtbWOjmZmR0doaJCQtrahoXh4T09VVX9/qamxsYiIYGBJSW5ulpa3t5ubcnJKSltbhISurq2tg4NZWUtLdHScnLe3lJRsbElJYWGKirKyqKh+flRUT095eaKitbWPj2dnR0dnZ4+PtbWionl5T09UVH5+qKiysomJYWFKSm1tlJS2tpubdHRMTFtbg4Otra2tg4NbW0xMdHSbm7a2lJRtbUpKYWGJibGxp6d+flVVUFB4eKCgtbWPj2hoSEhnZ46OtbWionl5UVFUVH5+pqaysomJYmJJSW1tlJS2tpubdHRMTFpag4OsrK2thIRcXEtLc3Oamre3lZVubkpKYGCIiLGxqKh/f1ZWT094eKCgtbWQkGlpSEhmZo2NtLSjo3p6UVFTU319pqaysoqKY2NJSWxsk5O2tpycdXVNTVlZgoKsrK6uhYVcXEtLcnKZmbe3lpZvb0pKYGCIiLCwqal/f1ZWT093d5+ftbWQkGpqSEhlZYyMtLSjo3t7UlJTU3x8paWzs4uLZGRJSWtrkpK2tp2ddnZNTVlZgYGrq6+vhoZdXUpKcXGYmLe3l5dwcEpKX1+Hh7CwqamAgFdXTk53d5+ftbWRkWpqSEhlZYyMs7OkpHx8UlJSUnx8pKSzs4uLZGRJSWtrkpK1tZ6ednZOTlhYgYGqqq+vhoZeXkpKcXGXl7e3l5dxcUpKXl6Ghq+vqqqBgVhYTk52dp6etbWRkWtrSUlkZIuLs7OkpHx8U1NSUnt7o6O0tIyMZWVISGpqkZG1tZ+fd3dOTldXgICpqbCwh4dfX0pKcHCXl7e3mJhxcUpKXV2Ghq+vq6uBgVlZTU12dp2dtraSkmtrSUlkZIuLs7OlpXx8U1NSUnt7o6O0tI2NZmZISGlpkJC1tZ+fd3dPT1ZWgICpqbCwiIhgYEpKb2+Wlre3mZlycktLXFyFha6uq6uCgllZTU11dZyctraTk2xsSUljY4qKsrKlpX19VFRRUXp6o6O0tI2NZ2dISGhoj4+1taCgeHhQUFZWf3+oqLCwiIhgYEpKbm6Vlba2mppzc0tLXFyEhK2trKyDg1paTEx0dJubtraUlG1tSkpiYomJsbGmpn5+VVVRUXp6np6rq4qKcHBhYXV1hYWOjoaGfn4=';
            sound.type     = 'audio/wav';
            document.getElementsByTagName('body')[0].appendChild(sound);
        }     
    }

    /**
     * @private
     * @param {object} options 
     * @description Adds a hidden <div> element that contains text that warns the user
     * when the Terminal's buffer has overrun.
     */
    _setupWarningBox(options) {
        let overrunWarningText = 'Your program is sending too much data to the terminal at once.<br>Try adding pauses or sending less data.';
        this.warningBox = document.createElement('div');

        if (options && options.overrunWarningText) {
            overrunWarningText = options.overrunWarningText;
        }

        if (options && options.warningDivClassName) {
            this.warningBox.classList.add(options.warningDivClassName);
        } else {
            this.warningBox.classList.add('warning-text_');
        }

        this.warningBox.style.display = 'none';
        this.warningBox.innerHTML = overrunWarningText;
        this.element.parentNode.insertBefore(this.warningBox, this.element);
    }

    /**
     * @private
     * @param {String} font String representing a valid CSS font definition
     * @description Calculates the width of single character in pixels.  
     * Only works well with monospaced fonts.
     */
    _getCharacterSize(font) {
        // re-use canvas object for better performance
        let canvas = this._getCharacterSize.canvas ||
            (this._getCharacterSize.canvas = document.createElement("canvas"));
        let context = canvas.getContext("2d");
        context.font = font;
        return context.measureText('AA').width - context.measureText('A').width;
    }

    /**
     * @private
     * @param {object} obj The 'this' object of the object created by the PropTerm class.
     * @description Sets up the key and mouse click listeners for the terminal element.
     */
    _setupListeners(obj) {
        // Register a keydown event callback function
        this.element.addEventListener('keydown', function (e) {
            //Validate key (or emit special key character)
            let keyCode = e.keyCode || e.which;

            if (keyCode === 8 || keyCode === 13) {
                //Emit special character
                obj._processKey(keyCode, obj);
            }

            //Validate key
            if ((keyCode === 32)                 ||  //  spacebar
                (keyCode > 47  && keyCode < 58)  ||  //  number keys
                (keyCode > 64  && keyCode < 91)  ||  //  letter keys
                (keyCode > 95  && keyCode < 112) ||  //  numpad keys
                (keyCode > 185 && keyCode < 193) ||  //  ;=,-./` (in order)
                (keyCode > 218 && keyCode < 223)) {  //  [\]' (in order)
                    obj._processKey(e.key.charCodeAt(0), obj);
            }
        });

        let el = obj.element;

        // Register a click event callback function
        el.addEventListener('click', function () {
            if (el.innerHTML[el.innerHTML.length - 1] !== '\u258D') {
                el.innerHTML = el.innerHTML + '\u258D';
            }
        });

        // Register a blur event callback function
        el.addEventListener('blur', function () {
            if (el.innerHTML[el.innerHTML.length - 1] === '\u258D') {
                el.innerHTML = el.innerHTML.slice(0, -1);
                if (el.innerHTML === '\u258D') {
                    el.innerHTML = '';
                }
            }
        });
    }

    /**
     * @private
     * @param {number} keyPressCode ASCII code of the key pressed
     * @param {object} obj The 'this' object of the object created by the PropTerm class.
     */
    _processKey(keyPressCode, obj) {
        let characterToSend = String.fromCharCode(keyPressCode);
        if (obj.echo.keys) {
            obj.display(characterToSend);
        }
        if (obj.echo.trap) {
            obj.echo.buffer.push(keyPressCode);
        }
        
        //Emit key keyPressCode to its proper destination
        obj.callback(characterToSend);
    }

    /**
     * @private
     * @param {number} dx delta-x for the horizontal position of the cursor
     * @param {number} dy delta-y for the horizontal position of the cursor
     * @description Helper function used to reposition the cursor
     */
    _changeCursor(dx, dy) {
        if (dy === 1 && this.buffer.textArray[this.cursor.y].length >= this.cursor.x) {
            this.buffer.textArray[this.cursor.y] = this.buffer.textArray[this.cursor.y].substr(0, this.cursor.x);
        }
    
        this.cursor.x += dx;
        this.cursor.y += dy;
    
        if (this.cursor.x > this.size.charactersWide - 1) {
            this.cursor.x -= this.size.charactersWide;
            this.cursor.y++;
            if (!this.buffer.textArray[this.cursor.y])
                this.buffer.textArray[this.cursor.y] = '';
        }
    
        if (this.cursor.x < 0 && this.cursor.y > 0) {
            this.cursor.y--;
            this.cursor.x = this.buffer.textArray[this.cursor.y].length;
            if (this.cursor.x > this.size.charactersWide - 1) {
                this.cursor.x = this.size.charactersWide - 1;
                this.buffer.textArray[this.cursor.y] = this.buffer.textArray[this.cursor.y].substr(0, this.cursor.x);
            }
        } else if (this.cursor.x < 0) {
            this.cursor.x = 0;
        }
    
        if (dy === 1) {
            this.cursor.x = 0;
            if (!this.buffer.textArray[this.cursor.y]) {
                this.buffer.textArray[this.cursor.y] = '';
            }
        }

        // since the cursor location has changed, set the scroll to show the cursor.
        this.cursor.scrolled = 2;
    }

    /**
     * @private
     * @param {number} c ASCII character to display (or to set a positioning value)
     * @description Processes an ASCII character and calls the appropriate helpers based on the character entered
     */
    _updateTermBox(c) {
        let j;
        
        if (this.echo.trap) {
            for (let i = 0; i < this.echo.buffer.length; i++) {
                if (this.echo.buffer[i] === c) {
                    this.echo.buffer.splice(i, 1);
                    return;
                }
            }
        }
    
        this.cursor.yf = this.cursor.y;
    
        if (this.cursor.setFlag !== 4) {
            this.cursor.xf = this.cursor.x;
        }

        // https://www.parallax.com/portals/0/help/BASICStamp/PBASIC click on Debug
        switch (this.cursor.setFlag) {
            case 3:  // Save character into X, then, on the next loop through, use the next character to set Y
                this.cursor.xf = c;
                this.cursor.setFlag = 4;
                break;
            case 2:
                // fall through
            case 4:  // Set Y only
                this.cursor.yf = c;
                this.cursor.setFlag = 0;
                this.setCursor(this.cursor.xf, this.cursor.yf);
                break;
            case 1:  // Set X only
                this.cursor.xf = c;
                this.cursor.setFlag = 0;
                this.setCursor(this.cursor.xf, this.cursor.yf);
                break;
            case 0:  // No character positioning this round, process it as an ASCII character.
                // fall through
            default:
                // Null is important to Parallax - Ask Jeff
                switch (c) {
                    case 127:
                        // fall through
                    case 8:  // Backspace
                        if (this.cursor.x + this.cursor.y > -1) {
                            if (this.buffer.textArray[this.cursor.y].length > 1) {
                                if (this.cursor.x === this.buffer.textArray[this.cursor.y].length) {
                                    this.buffer.textArray[this.cursor.y] = this.buffer.textArray[this.cursor.y].slice(0, -1);
                                } else if (this.cursor.x > 0) {
                                    let currentLine = this.buffer.textArray[this.cursor.y];
                                    this.buffer.textArray[this.cursor.y] = currentLine.substr(0, this.cursor.x - 1) + ' ' + currentLine.substr(this.cursor.x);
                                }
                            } else if (this.buffer.textArray[this.cursor.y].length === 1) {
                                this.buffer.textArray[this.cursor.y] = this.buffer.textArray[this.cursor.y] = '';
                            }
                            this._changeCursor(-1, 0);
                            break;
                        }
                        // fall through
                    case 13:  // Carriage Return
                        // fall through
                    case 10:  // Line Feed
                        this._changeCursor(0, 1);
                        break;
                    case 9:   // Tab (default 5-character spacing)
                        j = 5 - (this.cursor.x) % this.size.tabSpacing;
                        for (let k = 0; k < j; k++) {
                            this.buffer.textArray[this.cursor.y] += ' ';
                            this._changeCursor(1, 0);
                        }
                        break;
                    case 0:
                        // fall through
                    case 16:  // Clear the terminal
                        this.buffer.textArray = null;
                        this.buffer.textArray = [];
                        this.buffer.textArray[0] = '';
                        // fall through
                    case 1:  // Return to Home (0,0)
                        this.cursor.x = 0;
                        this.cursor.y = 0;
                        this._changeCursor(0, 0);
                        break;
                    case 3:  // Move cursor left 1 position
                        this._changeCursor(-1, 0);
                        break;
                    case 4:  // Move cursor right 1 position
                        this._changeCursor(1, 0);
                        break;
                    case 5:  // Move character up 1 position
                        this._changeCursor(0, -1);
                        break;
                    case 6:  // Move character down 1 position
                        this._changeCursor(0, 1);
                        break;
                    case 7: // Beep
                        this.element.classList.remove("visual-beep_");
                        this.element.classList.add("visual-beep_");
                        document.getElementById('term-beep_').play();
                        break;
                    case 11: // Clear to end of line
                        this.buffer.textArray[this.cursor.y] = this.buffer.textArray[this.cursor.y].substr(0, this.cursor.x);
                        break;
                    case 12: // Clear down
                        for (let n = this.cursor.y + 1; n < this.buffer.textArray.length; n++) {
                            this.buffer.textArray[n].pop();
                        }
                        break;
                    case 2: // Set cursor position (use next two chars to set the position)
                        this.cursor.setFlag = 3;
                        break;
                    case 14: // Set the cursor X position (use next character to set the position)
                        // fall through
                    case 15: //  Set the cursor Y position (use next character to set the position)
                        this.cursor.setFlag = c - 13;
                        break;
                    default:  // The character is printable, so display it in the terminal at the current cursor position.
                        j = '';
                        if (c > 127 && c < 256) {
                            j = this.ascii2unicode[c - 128];
                        } else {
                            j = String.fromCharCode(c);
                        }
                        if ((this.buffer.textArray[this.cursor.y] || '').length > this.cursor.x) {
                            let currentLine = this.buffer.textArray[this.cursor.y] || '';
                            this.buffer.textArray[this.cursor.y] = currentLine.substr(0, this.cursor.x) + j + currentLine.substr(this.cursor.x + 1);
                        } else {
                            this.buffer.textArray[this.cursor.y] += j;
                        }
                        this._changeCursor(1, 0);
                        break;
                }
        }
    
        // If the character was not used to define a new cursor 
        // position, update and refresh the display.
        if (c === 0) {
            this._displayTerm();
        }
    }

    /**
     * @private
     * @displays the buffer overrun warning and sets a timeout 
     * to remove the message if the buffer is no longer overrun.
     */
    _termBufferWarning() {
        this.buffer.alert = true;
        this.warningBox.style.display = 'block';

        if (this.buffer.alertTimeout) {
            clearTimeout(this.buffer.alertTimeout);
        }

        this.buffer.alertTimeout = setTimeout(function () {
            this.warningBox.style.display = 'none';
            this.buffer.alert = false;
        }, 5000);
    }

    /**
     * @private
     * @description Helper function to convert the text buffer to properly formatted HTML to display.
     */
    _displayTerm() {
        if (this.cursor.y < this.buffer.textArray.length - 1 &&
            this.buffer.textArray[this.buffer.textArray.length - 1] === '') {
            this.buffer.textArray.pop();
        }
    
        let terminalLinesHigh = Math.floor(this.size.height / this.size.linesHigh);
        let cursorChar = '';
        let tempText;

        // The activeElement read-only property of the Document and ShadowRoot
        // interfaces returns the Element within the DOM or shadow DOM tree
        // that currently has focus.
        // --------------------------------------------------------------------
        // if the current DOM element is equal to the currently active element
        if (this.element === document.activeElement) {
            cursorChar = '\u258D';
        }
    
        tempText = this.buffer.textArray.join('\r') + cursorChar;
    
        if (this.buffer.textArray.join('') === '') {
            tempText = cursorChar;
        }
    
        if (this.cursor.scrolled > 0 && this.cursor.scrollTo) {
            this.element.style['overflow-y'] = 'hidden';
            this.element.scroll(0, (this.cursor.y - terminalLinesHigh/2) * this.size.linesHigh);
            this.element.style['overflow-y'] = 'scroll';
            this.cursor.scrolled--;
        }
    
        this.element.innerHTML = tempText.replace(/ /g, '&nbsp;').replace(/\r/g, '<br>');
    }

    /**
     * @private
     * @description Helper function that sends the character buffer to the text buffer (array).
     */
    _sendBufferToTerm() {
        do {
            this._updateTermBox(this.buffer.chars.charCodeAt(0));
            this.buffer.chars = this.buffer.chars.substr(1);
        } while (this.buffer.chars.length > 0);
    
        this._displayTerm();
    }

    // ---------------------------------------------------------
    // Public Methods
    // ---------------------------------------------------------

    /**
     * @function getCursor a getter for the cursor
     * @returns {object} cursor location within the terminal element measured in characters (x) and lines (y)
     */ 
    getCursor() {
        return {x: this.cursor.x, y: this.cursor.y};
    }

    /**
     * @function setCursor 
     * @description used to set the cursor position in the terminal
     * @param {number} cx horizontal position (in characters) to set the cursor to
     * @param {number} cy vertical position (in lines) to set the cursor to
     */
    setCursor(cx, cy) {
        if (cx > this.size.charactersWide - 1) {
            cx = cx % this.size.charactersWide;
        }
        if (!this.buffer.textArray[cy]) {
            for (let i = this.buffer.textArray.length; i <= cy; i++) {
                this.buffer.textArray[i] = '';
            }
        }
    
        while (!this.buffer.textArray[cy][cx]) {
            this.buffer.textArray[cy] += ' ';
        }
    
        this.cursor.x = cx;
        this.cursor.y = cy;
        this._changeCursor(0, 0);
    }

    /**
     * 
     * @function resize
     * @description This is called autmatically during initialization 
     * and it should be called immediately after any time the element 
     * containing the terminal is resized.
     */
    resize() {
        // retrieve the calculated css styles and measurements from the window object
        let terminalComputedStyle = window.getComputedStyle(this.element);
        // calculate the width of area where there is text in the terminal in pixels
        this.size.width = parseFloat(terminalComputedStyle.getPropertyValue('width') || '0') - 
                parseFloat(terminalComputedStyle.getPropertyValue('border-left') || '0') - 
                parseFloat(terminalComputedStyle.getPropertyValue('border-right') || '0') - 
                parseFloat(terminalComputedStyle.getPropertyValue('padding-left') || '0') - 
                parseFloat(terminalComputedStyle.getPropertyValue('padding-right') || '0');
        // calculate the height of the area where there is text in the terminal in pixels
        this.size.height = parseFloat(terminalComputedStyle.getPropertyValue('height') || '0') - 
                parseFloat(terminalComputedStyle.getPropertyValue('border-top') || '0') - 
                parseFloat(terminalComputedStyle.getPropertyValue('border-bottom') || '0') - 
                parseFloat(terminalComputedStyle.getPropertyValue('padding-top') || '0') - 
                parseFloat(terminalComputedStyle.getPropertyValue('padding-bottom') || '0');
        // retrieve the line height in pixels
        this.size.linesHigh = parseFloat(terminalComputedStyle.getPropertyValue('line-height'));
        // if the width of ther terminal (in characters) has not been defined, 
        // determine how many will fit, which effectively causes the text to wrap in the terminal.
        if (!this.size.charactersWide) {
            this.size.charactersWide = Math.floor(((this.size.width - 20) / 
                this._getCharacterSize(terminalComputedStyle.getPropertyValue('font'))));
        }
    }

    /** 
     * @function display 
     * @description Adds the string of text to the terminal at the current cursor position.  
     * @param {string|null} str String of text to display into the terminal element.  Set to null to
     * clear the terminal. Special characters can be used to control the cursor position and to 
     * clear parts or all of the terminal.  Strings containing ASCII 0 - ASCII 255 are supported, 
     * with characters 0-16 and 127 having special meaning: https://www.parallax.com/portals/0/help/BASICStamp/PBASIC 
     * then click on "Debug" and scroll down.
     */
    display(str) {
        if (!this.buffer.chars) {
            this.buffer.chars = '';
        }
        if (!str) {
            this._updateTermBox(0);
            this.buffer.chars = '';
        } else {
            let termStatus = this.buffer.chars.length;
            this.buffer.chars += str;

            if (termStatus === 0) {
                this._sendBufferToTerm();
            } else if (termStatus > 255 && this.buffer.alert === false) {
                this._termBufferWarning();
            }
        }
    }

    /** 
     * @function getText 
     * @description Retrieves the text displayed in the terminal element.  
     * @returns {string} String of text displayed in the terminal element.
     */
    getText() {
        return this.buffer.textArray.join('\r');
    }

    /**
     * @function focus
     * @description forces the terminal element to gain focus.
     */
    focus() {
        if (this.element.tagName.toLowerCase() === 'div') {
            this.element.focus();
        }
    }

    /**
     * @function blur
     * @description removes focus from the terminal element.
     */
    blur() {
        if (this.element.tagName.toLowerCase() === 'div') {
            this.element.blur();
        }
    }
}


/**
 * Terminal options for the PropTerm class
 */
// eslint-disable-next-line no-unused-vars
class TerminalOptions {
    /**
     * @param {boolean} echoKeys optional- if set to true, echo keys typed into the terminal.  Default is true.
     * @param {boolean} trapEchos optional - if set to true, trap and do not display characters echoed by the device.  Default is false.
     * @param {boolean} scrollToCursor optional - if set to true, automatically scroll to the cursor's location.  Only applies to the vertical scroll.  Default is true.
     * @param {array}  extendedAsciiMap optional - an array of 127 characters mapped to the 127 extended ASCII characters (ASCII 128-255).  A default set of unicode characters is available if not provided.
     * @param {number} charactersWide optional - number of characters wide the terminal should display in a single line before wrapping to the next line.  Default is 256.
     * @param {number} tabSpacing optional - set the size of a tab in the terminal (measured in characters).  Default is 5.
     * @param {number} tabIndex optional - set the tab index of the HTML element that contains the terminal.  Default is "1".
     * @param {string} overrunWarningText optional - text to display if the browser is unable to keep up with the display of incoming characters.  A default warning in American English is used if none is provided.
     * @param {string} warningDivClassName optional - CSS class to apply to the overrun warning element.  A default Bootstrap-v3-like 'danger' class is used if none is provided.
     */
    constructor(
        echoKeys, trapEchos, scrollToCursor, extendedAsciiMap,
        charactersWide, tabSpacing, tabIndex,overrunWarningText,
        warningDivClassName) {

        this.echoKeys = echoKeys;
        this.trapEchos = trapEchos;
        this.scrollToCursor = scrollToCursor;
        this.extendedAsciiMap = extendedAsciiMap;
        this.charactersWide = charactersWide;
        this.tabSpacing = tabSpacing;
        this.tabIndex = tabIndex;
        this.overrunWarningText = overrunWarningText;
        this.warningDivClassName = warningDivClassName;
        }
}
