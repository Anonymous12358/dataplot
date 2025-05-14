// (?.) and (??) operations are not supported in this version of TypeScript
// So code for the create() methods is messy
// This also means that Falsy values (such as 0) will be interpreted as undefined
// which may be undesirable

enum Icon {
    //% block="cross X"
    Cross,
    //% block="plus +"
    Plus,
    //% block="bowtie ⋈"
    Bowtie,
    //% block="circle ●"
    Circle,
    //% block="diamond ⧫"
    Diamond,
    //% block="square ■"
    Square,
    //% block="triangle ▲"
    Triangle
}

/**
 * Send plotting data to flash storage
 */
//% block="Data Plotter"
//% color="#AA278D"
//% icon="\uf080"
//% groups=["Setup", "Plots", "others"]
namespace dataplot {
    /**
     * An icon to appear on the web app.
     * @param icon The icon to display
     * @returns A value representing the icon, to be recognised by the web app
     */
    //% blockId=dataplot_icon
    //% block="$icon"
    //% blockHidden=true
    export function _icon(icon: Icon): string {
        switch (icon) {
            case Icon.Cross: return "x-thin-open";
            case Icon.Plus: return "cross-thin-open";
            case Icon.Bowtie: return "bowtie-open";
            case Icon.Circle: return "circle-open";
            case Icon.Diamond: return "diamond-tall";
            case Icon.Square: return "square";
            case Icon.Triangle: return "triangle-up";
        }
    }

    export enum OutputMode {
        //% block="serial"
        Serial,
        //% block="bluetooth"
        Bluetooth
    }

    // Connection related code ----------------------

    let outputMode: OutputMode = OutputMode.Serial
    let isConnected: boolean = false;
    let buffer: string = ".........................\n";

    /**
     * Set how plotting data should be sent to the web app.
     * @param mode Medium to send data through
     */
    //% block="set output mode $mode"
    //% blockId=dataplotsetoutputmode
    //% group="Setup"
    export function setOutputMode(mode: OutputMode) {
        outputMode = mode;
    }

    /**
    * Registers an event that establishes the connection
    * when a newline is received over serial,
    * and sends any data stored in the buffer.
    */
    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        if (outputMode === OutputMode.Serial && !isConnected && serial.readLine() === "dataplot") {
            isConnected = true;
            if (buffer !== "") {
                serial.writeString(buffer);
            }
        }
    });

    /**
     * Registers an event that establishes the connection
     * when a newline is received over bluetooth,
     * and sends any data stored in the buffer.
     */
    bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), () => {
        if (outputMode === OutputMode.Bluetooth && !isConnected && bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)) === "dataplot") {
            isConnected = true;
            if (buffer !== "") {
                bluetooth.uartWriteString(buffer);
            }
        }
    });

    /**
     * Sends using the chosen output method.
     * Stores the data in a buffer if not connected.
     * @param data Data to be logged to flash storage
     */
    function outputData(data: string) {
        if (!isConnected) {
            buffer += data + "\n";
        } else if (outputMode === OutputMode.Serial) {
            serial.writeLine(data);
            basic.pause(100);  // Small delay to ensure full transmission
        } else {
            bluetooth.uartWriteLine(data);
        }
    }

    /** 
     * Extends dataplot.logData so that extra plotting information
     * is sent along with the data on the desired medium.
     * The original data is still logged to flash storage unmodified.
     * @param data Array of data to be sent
     */
    export function onLogged(data: datalogger.ColumnValue[]) {
        let outputObject: { [key: string]: any } = {
            "type": "data",
            "timestamp": input.runningTime(),
            "values": {}
        };
        for (let columnValue of data) {
            if (!isNaN(+columnValue.value)) {
                outputObject.values[columnValue.column] = +columnValue.value
            }
        }
        if (!!outputObject.values) {
            outputData(JSON.stringify(outputObject));
        }
    }

    // Shared plotting classes --------------------------

    // Default axis informatiomn
    const defaultX = {
        "label": "X axis",
        "min": 0,
        "max": 0,
    }

    const defaultY = {
        "label": "Y axis",
        "min": 0,
        "max": 0,
    }

    // Stores axis data
    export class AxisOptions {
        constructor(
            public titleX?: string,
            public titleY?: string,
            public minX?: number,
            public maxX?: number,
            public minY?: number,
            public maxY?: number,
        ) { }

        /**
         * @returns Information about the X axis in JSON format
         */
        public createX(): any {
            return {
                "label": this.titleX || "X axis",
                "min": this.minX || "",
                "max": this.maxX || "",
            };
        }

        /**
         * @returns Information about the Y axis in JSON format
         */
        public createY(): any {
            return {
                "label": this.titleY || "Y axis",
                "min": this.minY,
                "max": this.maxY,
            };
        }
    }

    /**
     * Information about the axes of a plot
     * @param titleX [optional] Title of the X axis
     * @param titleY [optional] Title of the Y axis
     * @param minX [optional] The minimum value shown on the X axis
     * @param maxX [optional] The maximum value shown on the X axis
     * @param minY [optional] The minimum value shown on the Y axis
     * @param maxY [optional] The maximum value shown on the Y axis
     * @returns An object storing the data, to be added to the plot.
     */
    //% block="X axis:|Title $titleX|Values $minX to $maxX| |Y axis:|Title $titleY|Values $minY to $maxY"
    //% blockId=dataplotcreateaxisoptions
    //% titleX.defl="X axis"
    //% titleY.defl="Y axis"
    //% blockHidden=true
    //% inlineInputMode="external"
    //% group="Plots"
    export function createAxisOptions(
        titleX?: string,
        titleY?: string,
        minX?: number,
        maxX?: number,
        minY?: number,
        maxY?: number
        ): AxisOptions {
        return new AxisOptions(titleX, titleY, minX, maxX, minY, maxY);
    }

    /**
     * Information about the axes of a plot
     * where the X axis does not have a specified range.
     * @param titleX [optional] Title of the X axis
     * @param titleY [optional] Title of the Y axis
     * @param minY [optional] The minimum value shown on the Y axis
     * @param maxY [optional] The maximum value shown on the Y axis
     * @returns An object storing the data, to be added to the plot.
     */
    //% block="X axis:|Title $titleX| |Y axis:|Title $titleY|Values $minY to $maxY"
    //% blockId=dataplotcreateaxisoptionsnox
    //% titleX.defl="X axis"
    //% titleY.defl="Y axis"
    //% blockHidden=true
    //% inlineInputMode="external"
    //% group="Plots"
    export function createAxisOptionsNoX(
        titleX?: string,
        titleY?: string,
        minY?: number,
        maxY?: number
        ): AxisOptions {
        return new AxisOptions(titleX, titleY, minY, maxY);
    }

    /**
     * Below are sections for each type of plot,
     * each consisting of Plot, Series and SeriesOptions classes.
     * 
     * Plot classes represent the graph itself, and are uniquely identified by their title.
     * They store information about the plot as a whole (in this case just axis info)
     * * Should titles be unique for all plots, or just those of the same type?
     * * This is determined by the web app implementation.
     * The Plot class contains a create() method which converts
     * its stored data into a JSON format recognised by the web app.
     * 
     * Series classes define which data is used to create the plot
     * as well as customisation options for each series,
     * referencing datalogger columns by name.
     * It also has a create() method which can be used as a subroutine by Plot.create
     * 
     * SeriesOptions classes contain any extra fields which can be
     * used to customise a series, but are not as significant.
     * Currently they are mostly redundant.
     */
    // Bar plots ----------------------------

    export class BarPlot {
        constructor(
            public title: string,
            public axisoptions?: AxisOptions,
            public series?: BarSeries[]
        ) { }

        /** Convert plot information into JSON format recognised by the web app,
         * replacing undefined values with defaults.
         */
        public create(): any {
            const temp = this.axisoptions;
            const xdata = temp === undefined ? undefined : temp.createX();
            const ydata = temp === undefined ? undefined : temp.createY();
            return {
                "type": "config",
                "graphType": "bar",
                "title": this.title,
                "x": xdata || defaultX,
                "y": ydata || defaultY,
                "series": this.series.map(s => s.create())
            };
        }
    }

    /**
     * Configure a bar chart to be plotted,
     * with up to 10 total series.     
     * @param plot Information about the plot
     * @param s1 Title for first series to be added
     * @param s2 [optional] Title for second series to be added
     * @param s3 [optional] Title for third series to be added
     * @param s4 [optional] Title for fourth series to be added
     * @param s5 [optional] Title for fifth series to be added
     * @param s6 [optional] Title for sixth series to be added
     * @param s7 [optional] Title for seventh series to be added
     * @param s8 [optional] Title for eighth series to be added
     * @param s9 [optional] Title for ninth series to be added
     * @param s10 [optional] Title for tenth series to be added
     */
    //% block="add bar plot|$plot|with series|$s1||$s2 $s3 $s4 $s5 $s6 $s7 $s8 $s9 $s10"
    //% blockId=dataplotaddbarplot
    //% group="Plots"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatebarplot
    //% s1.shadow=dataplotcreatebarseries
    //% s2.shadow=dataplotcreatebarseries
    //% s3.shadow=dataplotcreatebarseries
    //% s4.shadow=dataplotcreatebarseries
    //% s5.shadow=dataplotcreatebarseries
    //% s6.shadow=dataplotcreatebarseries
    //% s7.shadow=dataplotcreatebarseries
    //% s8.shadow=dataplotcreatebarseries
    //% s9.shadow=dataplotcreatebarseries
    //% s10.shadow=dataplotcreatebarseries
    //% weight=95
    export function addBarPlot(
        plot: BarPlot,
        s1: BarSeries,
        s2?: BarSeries,
        s3?: BarSeries,
        s4?: BarSeries,
        s5?: BarSeries,
        s6?: BarSeries,
        s7?: BarSeries,
        s8?: BarSeries,
        s9?: BarSeries,
        s10?: BarSeries): void {
        plot.series = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10].filter(s => !!s);
        outputData(JSON.stringify(plot.create()));
    }
    
    /**
     * The bar chart, uniquely identified by its title.
     * @param title Title for the bar chart
     * @param axops [optional] Data about the axes of the plot
     * @returns Plot object storing the data
     */
    //% block="bar plot titled $title||axis options|$axops"
    //% blockId=dataplotcreatebarplot
    //% blockHidden=true
    //% axops.shadow=dataplotcreateaxisoptionsnox
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    export function createBarPlot(
        title: string,
        axops?: AxisOptions
        ): BarPlot {
        return new BarPlot(title, axops);
    }

    export class BarSeries { 
        constructor(
            public name: string,
            public column: string,
            public options?: BarSeriesOptions
        ) { }

        /** Convert series information into JSON format recognised by the web app,
         * replacing undefined values with defaults.
         */
        public create(): any {
            const temp = this.options;
            const colour = temp === undefined ? undefined : temp.colour;
            return {
                "x_column": "",
                "y_column": this.column,
                "color": colour || "",
                "displayName": this.name || ""
            }
        }
    }
    
    /**
     * A single series of bars representing a column of data.
     * @param title Title for the series
     * @param column The datalogger column for the series to read data from
     * @param seriesops [optional] Options to customise how the series is drawn
     * @returns Series object storing the data
     */
    //% block="bar series named $title|using data from column $column||options|$seriesops"
    //% blockId=dataplotcreatebarseries
    //% group="Plots"
    //% column.shadow=datalogger_columnfield
    //% seriesops.shadow=dataplotcreatebarseriesoptions
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createBarSeries (
        title: string,
        column: string,
        seriesops?: BarSeriesOptions
    ): BarSeries {
        return new BarSeries(title, column, seriesops);
    }
    
    export class BarSeriesOptions {
        constructor(
            public colour?: number,
        ) { }
    }

    /**
     * Additional options for a bar series
     * @param colour [optional] The colour of all bars in the series
     * @returns An object to be kept in the BarSeries class
     */
    //% block="bar colour $colour"
    //% blockId=dataplotcreatebarseriesoptions
    //% group="Plots"
    //% colour.shadow="colorNumberPicker"
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createBarSeriesOptions(
        colour?: number
        ): BarSeriesOptions {
        return new BarSeriesOptions(colour);
    }

    // Line plots ---------------------------

    export class LinePlot {
        constructor(
            public title: string,
            public axisoptions?: AxisOptions,
            public series?: LineSeries[]
        ) { }

        /** Convert plot information into JSON format recognised by the web app,
         * replacing undefined values with defaults.
         */
        public create(): any { 
            const temp = this.axisoptions;
            const xdata = temp === undefined ? undefined : temp.createX();
            const ydata = temp === undefined ? undefined : temp.createY();
            return {
                "type": "config",
                "graphType": "line",
                "title": this.title,
                "x": xdata || defaultX,
                "y": ydata || defaultY,
                "series": this.series.map(s => s.create())
            };
        }
    }

    /**
     * Configure a line chart to be plotted,
     * with up to 10 total series.
     * @param plot Information about the plot
     * @param s1 Title for first series to be added
     * @param s2 [optional] Title for second series to be added
     * @param s3 [optional] Title for third series to be added
     * @param s4 [optional] Title for fourth series to be added
     * @param s5 [optional] Title for fifth series to be added
     * @param s6 [optional] Title for sixth series to be added
     * @param s7 [optional] Title for seventh series to be added
     * @param s8 [optional] Title for eighth series to be added
     * @param s9 [optional] Title for ninth series to be added
     * @param s10 [optional] Title for tenth series to be added
     */
    //% block="add line plot|$plot|with series|$s1||$s2 $s3 $s4 $s5 $s6 $s7 $s8 $s9 $s10"
    //% blockId=dataplotaddlineplot
    //% group="Plots"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatelineplot
    //% s1.shadow=dataplotcreatelineseries
    //% s2.shadow=dataplotcreatelineseries
    //% s3.shadow=dataplotcreatelineseries
    //% s4.shadow=dataplotcreatelineseries
    //% s5.shadow=dataplotcreatelineseries
    //% s6.shadow=dataplotcreatelineseries
    //% s7.shadow=dataplotcreatelineseries
    //% s8.shadow=dataplotcreatelineseries
    //% s9.shadow=dataplotcreatelineseries
    //% s10.shadow=dataplotcreatelineseries
    //% weight=96
    export function addLinePlot(
        plot: LinePlot,
        s1: LineSeries,
        s2?: LineSeries,
        s3?: LineSeries,
        s4?: LineSeries,
        s5?: LineSeries,
        s6?: LineSeries,
        s7?: LineSeries,
        s8?: LineSeries,
        s9?: LineSeries,
        s10?: LineSeries,
        ): void {
        plot.series = [s1, s2, s3, s4, s5].filter(s => !!s);
        outputData(JSON.stringify(plot.create()));
    }

    /**
     * The line chart, uniquely identified by its title.
     * @param title Title for the line chart
     * @param axops [optional] Data about the axes of the plot
     * @returns Plot object storing the data
     */
    //% block="line plot titled $title||axis options|$axops"
    //% blockId=dataplotcreatelineplot
    //% axops.shadow=dataplotcreateaxisoptions
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    //% group="Plots"
    export function createLinePlot(
        title: string,
        axops?: AxisOptions,
    ): LinePlot {
        return new LinePlot(title, axops);
    }

    export class LineSeries {
        constructor(
            public name: string,
            public x_column: string,
            public y_column: string,
            public icon?: string,
            public options?: LineSeriesOptions
        ) { }

        /** Convert series information into JSON format recognised by the web app,
         * replacing undefined values with defaults.
         */
        public create(): any {
            const temp = this.options;
            const colour = temp === undefined ? undefined : temp.colour;
            return {
                "x_column": this.x_column,
                "y_column": this.y_column,
                "color": colour || "",
                "icon": this.icon || "",
                "displayName": this.name || ""
            };
        }
    }

    /**
     * A single line over two columns of data.
     * @param title Title for the series
     * @param x_column The datalogger column for the series to read x values from
     * @param y_column The datalogger column for the series to read y values from
     * @param icon [optional] The icon to draw points with
     * @param seriesops [optional] Options to customise how the series is drawn
     * @returns Series object storing the data
     */
    //% block="line series named $title|using X data from column $x_column|Y data from column $y_column||draw points as $icon options|$seriesops"
    //% blockId=dataplotcreatelineseries
    //% group="Plots"
    //% x_column.shadow=datalogger_columnfield
    //% y_column.shadow=datalogger_columnfield
    //% icon.shadow=dataplot_icon
    //% seriesops.shadow=dataplotcreatelineseriesoptions
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createLineSeries(
        title: string,
        x_column: string,
        y_column: string,
        icon?: string,
        seriesops?: LineSeriesOptions
    ): LineSeries {
        return new LineSeries(title, x_column, y_column, icon, seriesops);
    }

    export class LineSeriesOptions {
        constructor(
            public colour?: number,
        ) { }
    }

    /**
     * Additional options for a single line
     * @param colour [optional] The colour of the line
     * @returns An object to be kept in the LineSeries class
     */
    //% block="line colour $colour"
    //% blockId=dataplotcreatelineseriesoptions
    //% group="Plots"
    //% colour.shadow="colorNumberPicker"
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createLineSeriesOptions(
        colour?: number
        ): LineSeriesOptions {
        return new LineSeriesOptions(colour);
    }

    // Scatter plots ------------------------

    export class ScatterPlot {
        constructor(
            public title: string,
            public axisoptions?: AxisOptions,
            public series?: ScatterSeries[]
        ) { }

        /** Convert plot information into JSON format recognised by the web app,
         * replacing undefined values with defaults.
         */
        public create(): any {
            const temp = this.axisoptions;
            const xdata = temp === undefined ? undefined : temp.createX();
            const ydata = temp === undefined ? undefined : temp.createY();
            return {
                "type": "config",
                "graphType": "scatter",
                "title": this.title,
                "x": xdata || defaultX,
                "y": ydata || defaultY,
                "series": this.series.map(s => s.create())
            };
        }
    }

    /**
     * Configure a scatter graph to be plotted,
     * with up to 10 total series.
     * @param plot Information about the plot
     * @param s1 Title for first series to be added
     * @param s2 [optional] Title for second series to be added
     * @param s3 [optional] Title for third series to be added
     * @param s4 [optional] Title for fourth series to be added
     * @param s5 [optional] Title for fifth series to be added
     * @param s6 [optional] Title for sixth series to be added
     * @param s7 [optional] Title for seventh series to be added
     * @param s8 [optional] Title for eighth series to be added
     * @param s9 [optional] Title for ninth series to be added
     * @param s10 [optional] Title for tenth series to be added
     */
    //% block="add scatter plot|$plot|with series|$s1||$s2 $s3 $s4 $s5 $s6 $s7 $s8 $s9 $s10"
    //% blockId=dataplotaddscatterplot
    //% group="Plots"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatescatterplot
    //% s1.shadow=dataplotcreatescatterseries
    //% s2.shadow=dataplotcreatescatterseries
    //% s3.shadow=dataplotcreatescatterseries
    //% s4.shadow=dataplotcreatescatterseries
    //% s5.shadow=dataplotcreatescatterseries
    //% s6.shadow=dataplotcreatescatterseries
    //% s7.shadow=dataplotcreatescatterseries
    //% s8.shadow=dataplotcreatescatterseries
    //% s9.shadow=dataplotcreatescatterseries
    //% s10.shadow=dataplotcreatescatterseries
    //% weight=94
    export function addScatterPlot(
        plot: ScatterPlot,
        s1: ScatterSeries,
        s2?: ScatterSeries,
        s3?: ScatterSeries,
        s4?: ScatterSeries,
        s5?: ScatterSeries,
        s6?: ScatterSeries,
        s7?: ScatterSeries,
        s8?: ScatterSeries,
        s9?: ScatterSeries,
        s10?: ScatterSeries
        ): void {
        plot.series = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10].filter(s => !!s);
        outputData(JSON.stringify(plot.create()));
    }

    /**
     * The scatter plot, uniquely identified by its title.
     * @param title Title for the scatter plot
     * @param axops [optional] Data about the axes of the plot
     * @returns Plot object storing the data
     */
    //% block="scatter plot titled $title||axis options|$axops"
    //% blockId=dataplotcreatescatterplot
    //% axops.shadow=dataplotcreateaxisoptions
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    //% group="Plots"
    export function createScatterPlot(
        title: string,
        axops?: AxisOptions,
    ): ScatterPlot {
        return new ScatterPlot(title, axops);
    }

    // One set of points
    export class ScatterSeries {
        constructor(
            public name: string,
            public x_column: string,
            public y_column: string,
            public icon?: string,
            public options?: ScatterSeriesOptions
        ) { }

        /** Convert series information into JSON format recognised by the web app,
         * replacing undefined values with defaults.
         */
        public create(): any {
            const temp = this.options;
            const colour = temp === undefined ? undefined : temp.colour;
            return {
                "x_column": this.x_column,
                "y_column": this.y_column,
                "color": colour || "",
                "icon": this.icon || "",
                "displayName": this.name || ""
            };
        }
    }

    /**
     * A single set of points over two columns of data.
     * @param title Title for the series
     * @param x_column The datalogger column for the series to read x values from
     * @param y_column The datalogger column for the series to read y values from
     * @param icon [optional] The icon to draw points with
     * @param seriesops [optional] Options to customise how the series is drawn
     * @returns Series object storing the data
     */
    //% block="scatter series named $title|using X data from column $x_column|Y data from column $y_column||draw points as $icon options|$seriesops"
    //% blockId=dataplotcreatescatterseries
    //% group="Plots"
    //% x_column.shadow=datalogger_columnfield
    //% y_column.shadow=datalogger_columnfield
    //% icon.shadow=dataplot_icon
    //% seriesops.shadow=dataplotcreatescatterseriesoptions
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createScatterSeries(
        title: string,
        x_column: string,
        y_column: string,
        icon?: string,
        seriesops?: ScatterSeriesOptions
    ): ScatterSeries {
        return new ScatterSeries(title, x_column, y_column, icon, seriesops);
    }

    export class ScatterSeriesOptions {
        constructor(
            public colour?: number,
        ) { }
    }

    /**
     * Additional options for a series of points
     * @param colour [optional] The colour of all points in the series
     * @returns An object to be kept in the ScatterSeries class
     */
    //% block="point colour $colour"
    //% blockId=dataplotcreatescatterseriesoptions
    //% group="Plots"
    //% colour.shadow="colorNumberPicker"
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createScatterSeriesOptions(
        colour?: number
        ): ScatterSeriesOptions {
        return new ScatterSeriesOptions(colour);
    }

    // Pie plots ----------------------------

    export class PiePlot {
        constructor(
            public title: string,
            public series?: PieSeries[]
        ) { }

        /** Convert plot information into JSON format recognised by the web app,
         * replacing undefined values with defaults.
         */
        public create(): any {
            return {
                "type": "config",
                "graphType": "pie",
                "title": this.title,
                "series": this.series.map(s => s.create())
            };
        }
    }

    /**
     * Configure a pie chart to be plotted,
     * with up to 10 total wedges.
     * @param plot Information about the plot
     * @param s1 Title for first wedge to be added
     * @param s2 [optional] Title for second wedge to be added
     * @param s3 [optional] Title for third wedge to be added
     * @param s4 [optional] Title for fourth wedge to be added
     * @param s5 [optional] Title for fifth wedge to be added
     * @param s6 [optional] Title for sixth wedge to be added
     * @param s7 [optional] Title for seventh wedge to be added
     * @param s8 [optional] Title for eighth wedge to be added
     * @param s9 [optional] Title for ninth wedge to be added
     * @param s10 [optional] Title for tenth wedge to be added
     */
    //% block="add pie plot|$plot|with wedges|$s1||$s2 $s3 $s4 $s5 $s6 $s7 $s8 $s9 $s10"
    //% blockId=dataplotaddpieplot
    //% group="Plots"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatepieplot
    //% s1.shadow=dataplotcreatepieseries
    //% s2.shadow=dataplotcreatepieseries
    //% s3.shadow=dataplotcreatepieseries
    //% s4.shadow=dataplotcreatepieseries
    //% s5.shadow=dataplotcreatepieseries
    //% s6.shadow=dataplotcreatepieseries
    //% s7.shadow=dataplotcreatepieseries
    //% s8.shadow=dataplotcreatepieseries
    //% s9.shadow=dataplotcreatepieseries
    //% s10.shadow=dataplotcreatepieseries
    //% weight=93
    export function addPiePlot(
        plot: PiePlot,
        s1: PieSeries,
        s2?: PieSeries,
        s3?: PieSeries,
        s4?: PieSeries,
        s5?: PieSeries,
        s6?: PieSeries,
        s7?: PieSeries,
        s8?: PieSeries,
        s9?: PieSeries,
        s10?: PieSeries,
        ): void {
        plot.series = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10].filter(s => !!s);
        outputData(JSON.stringify(plot.create()));
    }

    /**
     * The pie chart, uniquely identified by its title.
     * @param title Title for the pie chart
     * @returns Plot object storing the data
     */
    //% block="pie plot titled $title"
    //% blockId=dataplotcreatepieplot
    //% group="Plots"
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    export function createPiePlot(
        title: string,
    ): PiePlot {
        return new PiePlot(title);
    }

    export class PieSeries {
        constructor(
            public title: string,
            public column: string,
            public options?: PieSeriesOptions,
        ) { }

        /** Convert series information into JSON format recognised by the web app,
         * replacing undefined values with defaults.
         */
        public create(): any {
            const temp = this.options;
            const colour = temp === undefined ? undefined : temp.colour;
            return {
                "x_column": "",
                "y_column": this.column,
                "color": colour || "",
                "displayName": ""
            };
        }
    }

    /**
     * A single wedge representing a column of data.
     * @param title Title for the wedge
     * @param column The datalogger column for the wedge to read data from
     * @param seriesops [optional] Options to customise how the wedge is drawn
     * @returns Series object storing the data
     */
    //% block="wedge named $title|using data from column $column||options|$seriesops"
    //% blockId=dataplotcreatepieseries
    //% group="Plots"
    //% column.shadow=datalogger_columnfield
    //% seriesops.shadow=dataplotcreatepieseriesoptions
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createPieSeries(
        title: string,
        column: string,
        seriesops?: PieSeriesOptions
    ): PieSeries {
        return new PieSeries(title, column, seriesops);
    }

    /** Stores series data */
    export class PieSeriesOptions {
        constructor(
            public colour?: number,
        ) { }
    }

    /**
     * Additional options for a wedge
     * @param colour [optional] The colour of the wedge
     * @returns An object to be kept in the PieSeries class
     */
    //% block="colour $colour"
    //% blockId=dataplotcreatepieseriesoptions
    //% group="Plots"
    //% colour.shadow="colorNumberPicker"
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createPieSeriesOptions(
        colour?: number): PieSeriesOptions {
        return new PieSeriesOptions(colour);
    }

    // Hist plots ---------------------------

    export class HistPlot {
        constructor(
            public title: string,
            public axisoptions?: AxisOptions,
            public series?: HistSeries[]
        ) { }

        /** Convert plot information into JSON format recognised by the web app,
         * replacing undefined values with defaults.
         */
        public create(): any {
            const temp = this.axisoptions;
            const xdata = temp === undefined ? undefined : temp.createX();
            const ydata = temp === undefined ? undefined : temp.createY();
            return {
                "type": "config",
                "graphType": "histogram",
                "title": this.title,
                "x": xdata || defaultX,
                "y": ydata || defaultY,
                "series": this.series.map(s => s.create())
            };
        }
    }

    /**
     * Configure a histogram to be plotted,
     * with up to 10 total series.
     * @param plot Information about the plot
     * @param s1 Title for first series to be added
     * @param s2 [optional] Title for second series to be added
     * @param s3 [optional] Title for third series to be added
     * @param s4 [optional] Title for fourth series to be added
     * @param s5 [optional] Title for fifth series to be added
     * @param s6 [optional] Title for sixth series to be added
     * @param s7 [optional] Title for seventh series to be added
     * @param s8 [optional] Title for eighth series to be added
     * @param s9 [optional] Title for ninth series to be added
     * @param s10 [optional] Title for tenth series to be added
     */
    //% block="add histogram|$plot|with series|$s1||$s2 $s3 $s4 $s5 $s6 $s7 $s8 $s9 $s10"
    //% blockId=dataplotaddhistplot
    //% group="Plots"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatehistplot
    //% s1.shadow=dataplotcreatehistseries
    //% s2.shadow=dataplotcreatehistseries
    //% s3.shadow=dataplotcreatehistseries
    //% s4.shadow=dataplotcreatehistseries
    //% s5.shadow=dataplotcreatehistseries
    //% s6.shadow=dataplotcreatehistseries
    //% s7.shadow=dataplotcreatehistseries
    //% s8.shadow=dataplotcreatehistseries
    //% s9.shadow=dataplotcreatehistseries
    //% s10.shadow=dataplotcreatehistseries
    //% weight=92
    //% blockHidden=true
    export function addHistPlot(
        plot: HistPlot,
        s1: HistSeries,
        s2?: HistSeries,
        s3?: HistSeries,
        s4?: HistSeries,
        s5?: HistSeries,
        s6?: HistSeries,
        s7?: HistSeries,
        s8?: HistSeries,
        s9?: HistSeries,
        s10?: HistSeries
        ): void {
        plot.series = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10].filter(s => !!s);
        outputData(JSON.stringify(plot.create()));
    }

    /**
     * The histogram, uniquely identified by its title.
     * @param title Title for the histogram
     * @param axops [optional] Data about the axes of the plot
     * @returns Plot object storing the data
     */
    //% block="histogram titled $title||axis options|$axops"
    //% blockId=dataplotcreatehistplot
    //% axops.shadow=dataplotcreateaxisoptionsnox
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    export function createHistPlot(
        title: string,
        axops?: AxisOptions
        ): HistPlot {
        return new HistPlot(title, axops);
    }

    export class HistSeries {
        constructor(
            public name: string,
            public y_column: string,
            public options?: HistSeriesOptions
        ) { }

        /** Convert series information into JSON format recognised by the web app,
         * replacing undefined values with defaults.
         */
        public create(): any {
            const temp = this.options;
            const colour = temp === undefined ? undefined : temp.colour;
            return {
                "x_column": "",
                "y_column": this.y_column,
                "color": colour || "",
                "displayName": this.name || ""
            };
        }
    }

    /**
     * A single series of bars representing a column of data.
     * @param title Title for the series
     * @param column The datalogger column for the series to read data from
     * @param seriesops [optional] Options to customise how the series is drawn
     * @returns Series object storing the data
     */
    //% block="histogram series named $title|using data from column $column||options|$seriesops"
    //% blockId=dataplotcreatehistseries
    //% group="Plots"
    //% column.shadow=datalogger_columnfield
    //% seriesops.shadow=dataplotcreatehistseriesoptions
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createHistSeries(
        title: string,
        column: string,
        seriesops?: HistSeriesOptions
    ): HistSeries {
        return new HistSeries(title, column, seriesops);
    }

    export class HistSeriesOptions {
        constructor(
            public colour?: number
        ) { }
    }

    /**
     * Additional options for a histogram series
     * @param colour [optional] The colour of all bars in the series
     * @returns An object to be kept in the HistSeries class
     */
    //% block="bar colour $colour"
    //% blockId=dataplotcreatehistseriesoptions
    //% group="Plots"
    //% colour.shadow="colorNumberPicker"
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createHistSeriesOptions(
        colour?: number
    ): HistSeriesOptions {
        return new HistSeriesOptions(colour);
    }
}