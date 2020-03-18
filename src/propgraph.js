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
 * Graph system settings
 *
 * @type {{graph_type: string, fullWidth: boolean, showPoint: boolean, refreshRate: number, axisX: {onlyInteger: boolean, type: *}, sampleTotal: number}}
 */
var graph_options = {
    showPoint: false,
    fullWidth: true,
};

var PropGraph = {
    chartObject: null,
    elements: {
        container: null,
        graph: null,
        labels: null
    },
    settings: {
        lineColors: [],
        FULL_CYCLE_TIME: (4294967296 / 80000000),
        PROPGRAPH_TICKS_PER_SECOND: (80000000 / 65535),
        refreshRate: 250,
        sampleTotal: 40,
        type: 'AUTO'    
    },
    chartType: 'line',
    chartOptions: {
        responsive: false,
        scales: {
            xAxes: [{
                type: 'linear', 
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Time (seconds)' 
                },
            }], 
            yAxes: [{ // and your y axis customization as you see fit...
                type: 'linear',
                display: true,
                scaleLabel: {
                    display: false,
                }
            }],
        },
        legend: {
            display: false,
        },
        animation: {
            duration: 0 // general animation time
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
        tooltips: {
            enabled: false,   // diable tooltips for the graph
        },
        events: [],  // disable events for the graph
    },
    flags: {
        dataReady: false,
        isAtStart: false,
        paused: false,
    },
    counters: {
        rollovers: 0,
        startMark: null,
        shiftBy: 0,
    },
    buffers: {
        raw: '',
        characters: '',
        data: [],
        csv: [],
    },
    intervalId: null,

    setup: function(settings, elem) {
        if (elem) {
            this.elements.container = elem;

            this.elements.container.style.whiteSpace = 'nowrap';
            this.elements.container.style.overflowX = 'hidden';
            this.elements.container.style.overflowY = 'hidden';

            this.elements.graph = document.createElement('CANVAS');
            this.elements.graph.id = "graph-canvas";
            this.elements.graph.height = (Number(this.elements.container.offsetHeight) - 4).toString();
            this.elements.graph.width = (Number(this.elements.container.offsetWidth) - 69).toString();
            this.elements.graph.style.display = 'inline-block';
            this.elements.graph.style.whiteSpace = 'normal';
            this.elements.container.appendChild(this.elements.graph);

            this.elements.labels = document.createElement('DIV');
            this.elements.labels.id = "label-container";
            this.elements.labels.style.height = '300';
            this.elements.labels.style.width = '65';
            this.elements.labels.style.paddingLeft = '5';
            this.elements.labels.style.display = 'inline-block';
            this.elements.labels.style.whiteSpace = 'normal';
            this.elements.labels.style.verticalAlign = 'top';
            this.elements.container.appendChild(this.elements.labels);
        }

        if (settings) {
            if (settings.type) {
                this.settings.type = settings.type;

                if (settings.yMin || settings.yMax) {
                    this.chartOptions.scales.yAxes[0].min = Number(settings.yMin || '0');
                    this.chartOptions.scales.yAxes[0].max = Number(settings.yMax || '100');
                } else {
                    delete this.chartOptions.scales.yAxes[0].min;
                    delete this.chartOptions.scales.yAxes[0].max;
                }

                this.chartType = 'line';
                this.chartOptions.scales.xAxes[0].scaleLabel.display = true;  // show x-axis label

                if (this.settings.type === 'AUTOXY' || this.settings.type === 'FIXEDXY') {
                    if (settings.xMin || settings.xMax) {
                        this.chartOptions.scales.xAxes[0].min = Number(settings.yMin || '0');
                        this.chartOptions.scales.xAxes[0].max = Number(settings.yMax || '100');
                    } else {
                        delete this.chartOptions.scales.xAxes[0].min;
                        delete this.chartOptions.scales.xAxes[0].max;
                    }
                    this.chartType = 'scatter';
                    this.chartOptions.scales.xAxes[0].scaleLabel.display = false;  // hide x-axis label
                }

                if (this.settings.type !== 'AUTOSC' && this.settings.type !== 'FIXEDSC') {
                    this.settings.sampleTotal = Number(settings.visibleDuration || '10');
                }
            }

            if (settings.labels) {
                this.labels.text = settings.labels;
                this.labels.create.call(this);
            }
        }

        this.getColorsFromCss();
            
        this.data = {datasets: []}
        for (let i = 0; i < 10; i++) {
            this.data.datasets[i] = {
                borderColor: this.settings.lineColors[i],
                backgroundColor: 'rgba(0,0,0,0)',
                borderWidth: 1,
                radius: 0.5,
                data: []
            }
        }

        if (!this.chartObject) {
            this.chartObject = new Chart(this.elements.graph, {
                type: this.chartType,
                data: this.data,
                options: this.chartOptions,
            });
        } else {
            this.chartObject.update();
        }
    },

    getColorsFromCss: function () {
        this.settings.lineColors = [];
            for (var k = 1; k < 11; k++) {    
            for (var i = 0; i < document.styleSheets.length; i++) {
                var mysheet = document.styleSheets[i];
                var myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;
        
                for (var j = 0; j < myrules.length; j++) {
                    if (myrules[j].selectorText) {
                        if (myrules[j].selectorText.toLowerCase() === '.ct-marker-' + k) {
                            this.settings.lineColors.push(myrules[j].style['fill']);
                        }
                    }
                }
            }
        }
    },

    exportCSV: function(callback) {
        let csvTemp = this.buffers.csv.join('\n');
        let idx1 = csvTemp.indexOf('\n') + 1;
        let idx2 = csvTemp.indexOf('\n', idx1 + 1);
        callback(new Blob([csvTemp.substring(0, idx1) + csvTemp.substring(idx2 + 1, csvTemp.length - 1)], {type: 'text/csv'}));
    },

    exportPNG: function(callback) {
        this.elements.graph.toBlob(callback, 'image/png');
    },

    labels: {
        text: [],
        set: function(labelArray) {
            this.labels.text = labelArray;
        },
        create: function () {
            let csvTemp = '';
            let labelsvg = '<svg width="60" height="300">';
            csvTemp += '"time",';
            let labelClass = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
            let labelPre = ["", "", "", "", "", "", "", "", "", "", "", "", "", ""];
            if (this.settings.type === 'AUTOXY' || this.settings.type === 'FIXEDXY') {
                labelClass = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                labelPre = ["x: ", "y: ", "x: ", "y: ", "x: ", "y: ", "x: ", "y: ", "x: ", "y: ", "x: ", "y: ", "x: ", "y: "];
            }
            for (let i = 0; i < this.labels.text.length; i++) {
                labelsvg += '<g id="labelgroup' + (i + 1) + '" transform="translate(0,' + (i * 30 + 25) + ')">';
                labelsvg += '<rect x="0" y = "0" width="60" height="26" rx="3" ry="3" id="label' + (i + 1) + '" ';
                labelsvg += 'style="stroke:1px;stroke-color:blue;" class="ct-marker-' + labelClass[i] + '"/><rect x="3" y="12"';
                labelsvg += 'width="54" height="11" rx="3" ry="3" id="value' + (i + 1) + 'bkg" style="fill:rgba';
                labelsvg += '(255,255,255,.7);stroke:none;"/><text id="label' + (i + 1) + 'text" x="3" ';
                labelsvg += 'y="9" style="font-family:Arial;font-size: 9px;fill:#fff;font-weight:bold;">' + labelPre[i];
                labelsvg += this.labels.text[i] + '</text><text id="gValue' + (i + 1) + '" x="5" y="21" style="align:right;';
                labelsvg += 'font-family:Arial;font-size: 10px;fill:#000;"></text></g>';
                csvTemp += '"' + this.labels.text[i].replace(/"/g, '_') + '",';
            }
            labelsvg += '</svg>';
            this.buffers.csv.push(csvTemp.slice(0, -1));
            this.elements.labels.innerHTML = labelsvg;
        },

        update: function() {
            let row = this.buffers.data.length - 1;
            if (this.buffers.data[row]) {
                let col = this.buffers.data[row].length;
                for (let i = 2; i < col; i++) {
                    let theLabel = document.getElementById('gValue' + (i - 1).toString(10));
                    if (theLabel) {
                        theLabel.textContent = this.buffers.data[row][i];
                    }
                }
            }
        }
    },

    state: {
        current: 'stop',

        /**
        * Graphing system control
        *
        * @param action
        * Supported actions: 'start', 'play', 'stop', 'pause', 'clear'
        */
        set: function (action) {
            if (action === 'start' || action === 'play') {
                this.labels.create.call(this);
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                }
                const currentPropGraph = this;
                this.intervalId = setInterval(function () {
                    currentPropGraph.chartObject.update();
                    currentPropGraph.labels.update.call(currentPropGraph);
                }, this.settings.refreshReate);
            } else if (action === 'stop' || action === 'pause') {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            if (action === 'stop') {
                this.flags.paused = false;
                this.reset();
            }
            if (action === 'clear') {
                this.reset();
            }
            if (action === 'play') {
                if (this.data.datasets[0].data.length === 0) {
                    this.reset();
                }
                this.flags.paused = false;
                this.flags.isAtStart = true;
            }
            if (action === 'pause' && this.buffers.data.slice(-1)[0]) {
                this.flags.paused = true;
                this.buffers.characters = '';
                this.counters.startMark = 0;
                this.counters.rollovers = 0;
                this.counters.shiftBy = this.buffers.data.slice(-1)[0][0];
            }
            this.state.current = action;
        },
        get: function() {
            return this.state.current;
        }

    },

    play: function() {
        this.state.set.call(this, 'play');
    },
    pause: function() {
        this.state.set.call(this, 'pause');
    },
    stop: function() {
        this.state.set.call(this, 'stop');
    },
    start: function() {
        this.state.set.call(this, 'start');
    },
    clear: function() {
        this.state.set.call(this, 'clear');
    },
    
    /**
     * Reset the graphing system
     */
    reset: function() {
        this.buffers.data.length = 0;
        this.buffers.csv.length = 0;
        for (let i = 0; i < 10; i++) {
            this.data.datasets[i].data = [];
        }
        if (this.chartObject) {
            this.chartObject.update();
        }
        this.buffers.characters = '';
        this.counters.startMark = 0;
        this.counters.rollovers = 0;
        this.counters.shiftBy = 0;
        this.flags.dataReady = false;
    },

    display: function(chars) {
        let bufferSize = this.buffers.raw.length;
        this.buffers.raw += chars;
        if (bufferSize < 1) {
            this.processCharacters();
        } else if (bufferSize > 255) {
            // TODO: throw a warning about a too many characters incoming
        }
        
    },

    /**
    * Graph the data represented in the chars parameter
    */
    processCharacters: function() {
        let dd = new Date();
        let t = 0;
        let row = 0;
        while (this.buffers.raw.length > 0) {
            let theChar = this.buffers.raw.slice(0,1);
            this.buffers.raw = this.buffers.raw.slice(1);

            if ((theChar === '\r' || theChar === '\n') && this.flags.dataReady) {
                if (!this.flags.paused) {
                    this.buffers.data.push(this.buffers.characters.split(','));
                    row = this.buffers.data.length - 1;
                    t = Number(this.buffers.data[row][0]) || 0;
    
                    // convert raw timestamp to seconds:
                    // The raw timestamp is the Propeller system clock (CNT) left shifted by 16.
                    // Assumes 80MHz clock frequency.
                    t /= this.settings.PROPGRAPH_TICKS_PER_SECOND;
                }
                if (!this.counters.startMark || this.counters.startMark === 0) {
                    this.counters.startMark = t;
                    if (this.flags.isAtStart) {
                        this.counters.startMark -= this.counters.shiftBy;
                        this.counters.shiftBy = 0;
                    }
                }
                if (row > 0 && !this.flags.isAtStart) {
                    if (parseInt(this.buffers.data[row][0]) < parseInt(this.buffers.data[row - 1][1]) - 20000) {
                        this.counters.rollovers += this.settings.FULL_CYCLE_TIME;
                        console.log(Math.floor(dd.getTime() / 1000 / this.settings.FULL_CYCLE_TIME));
                    }
                }
                this.flags.isAtStart = false;
                if (!this.flags.paused) {
                    let csvTemp = t + this.counters.rollovers - this.counters.startMark
                    csvTemp = Math.floor(csvTemp * 1000) / 1000;
                    this.buffers.data[row].unshift(csvTemp);
                    csvTemp += ',';
    
                    // xy scatter plot
                    if (this.settings.type === 'AUTOXY' || this.settings.type === 'FIXEDXY') {
                        let k = 0;
                        for (let j = 2; j < this.buffers.data[row].length; j = j + 2) {
                            csvTemp += this.buffers.data[row][j] + ',' + this.buffers.data[row][j + 1] + ',';
                            this.data.datasets[k].data.push({
                                x: this.buffers.data[row][j] || null,
                                y: this.buffers.data[row][j + 1] || null
                            });
                            if (this.buffers.data[row][0] > this.settings.sampleTotal)
                                this.data.datasets[k].data.shift();
                            k++;
                        }
    
                    // time series graph
                    } else {    
                        for (j = 2; j < this.buffers.data[row].length; j++) {
                            csvTemp += this.buffers.data[row][j] + ',';
                            this.data.datasets[j - 2].data.push({
                                x: this.buffers.data[row][0],
                                y: this.buffers.data[row][j] || null
                            });
                            if (this.buffers.data[row][0] > this.settings.sampleTotal)
                                this.data.datasets[j - 2].data.shift();
                        }
                    }
    
                    // push complete set of data into the CSV buffer
                    this.buffers.csv.push(csvTemp.slice(0, -1).split(','));
    
                    // limits total number of data points collected to prevent memory issues
                    if (this.buffers.csv.length > 15000) {
                        this.buffers.csv.shift();
                    }
                }
    
                this.buffers.characters = '';
            } else {
                if (!this.flags.dataReady) {            // wait for a full set of data to
                    if (theChar === '\r' || theChar === '\n') {            // come in before graphing, ends up
                        this.flags.dataReady = true;    // tossing the first point but prevents
                    }                                   // garbage from mucking up the graph.
                } else {
                    // make sure it's a number, comma, CR, or LF
                    if ('-0123456789.,\r\n'.indexOf(theChar) > -1) {
                        this.buffers.characters += theChar;
                    }
                }
            }
        }
    }
}












/**
 * getGraphSettingsFromBlocks
 * @description sets the graphing engine's settings and graph labels
 * based on values in the graph setup and output blocks
 * @returns {boolean} true if the appropriate graphing blocks are present and false if they are not
 */
function getGraphSettingsFromBlocks() {
    // TODO: propc editor needs UI for settings for terminal and graphing
    if (projectData.board === 'propcfile') {
        return false;
    }

    let graphSettingsBlocks = Blockly.getMainWorkspace().getBlocksByType('graph_settings');
    let graphLabels = [];

    if (graphSettingsBlocks.length > 0) {
        let graphOutputBlocks = Blockly.getMainWorkspace().getBlocksByType('graph_output');
        if (graphOutputBlocks.length > 0) {
            let i = 0;
            while (graphOutputBlocks[0].getField("GRAPH_LABEL" + i)) {
                graphLabels.push(graphOutputBlocks[0].getFieldValue("GRAPH_LABEL" + i));
                i++;
            }
        } else {
            return false;
        }

        return {
            type: graphSettingsBlocks[0].getFieldValue('YSETTING'),
            yMin: graphSettingsBlocks[0].getFieldValue('YMIN'),
            yMax: graphSettingsBlocks[0].getFieldValue('YMAX'),
            xMin: graphSettingsBlocks[0].getFieldValue('XMIN'),
            xMax: graphSettingsBlocks[0].getFieldValue('XMAX'),
            visibleDuration: graphSettingsBlocks[0].getFieldValue('XAXIS'),
            labels: graphLabels,
        };

    } else {
        return false;
    }
}












/**
 * Draw graph
 *
 * @param setTo
 */
function graph_play(setTo) {
    if (document.getElementById('btn-graph-play')) {
        var play_state = document.getElementById('btn-graph-play').innerHTML;
        if (setTo !== 'play' && (play_state.indexOf('pause') > -1 || play_state.indexOf('<!--p') === -1)) {
            document.getElementById('btn-graph-play').innerHTML = '<!--play--><svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M4,3 L4,11 10,7 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
            if (!setTo) {
                graphStartStop('pause');
            }
        } else {
            document.getElementById('btn-graph-play').innerHTML = '<!--pause--><svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M5.5,2 L4,2 4,11 5.5,11 Z M8.5,2 L10,2 10,11 8.5,11 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
            if (!PropGraph.intervalId && !setTo) {
                graphStartStop('play');
            }
        }
    }
}