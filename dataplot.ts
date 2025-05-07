// Should these be exported?
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

enum OutputMode {
    //% block="serial"
    Serial,
    //% block="bluetooth"
    Bluetooth
}

/**
 * Send plotting data to flash storage
 * Follows the same structure seen in datalogger
 */
//% block="Data Plotter"
//% color="#AA278D"
//% icon="\uf080"
//% groups=["Plotting", "others"]
namespace dataplot {

    //TODO: Docstrings

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

    /**
     * Returns the constant string "time (seconds)".
     * This string is the name of the column in which timestamps are logged, so this block saves typing the string repeatedly when plotting against time.
     */
    //% blockId=time_column_name
    //% block="time (seconds)"
    //% weight=30
    export function time(): string {
        return "time (seconds)"
    }

    // Connection related code ----------------------

    let outputMode: OutputMode = OutputMode.Serial
    let isConnected: boolean = false;
    let buffer: string = ".........................\n";

    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        if (outputMode === OutputMode.Serial && !isConnected && serial.readLine() === "dataplot") {
            isConnected = true;
            if (buffer !== "") {
                serial.writeString(buffer);
            }
        }
    });

    bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), () => {
        if (outputMode === OutputMode.Bluetooth && !isConnected && bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)) === "dataplot") {
            isConnected = true;
            if (buffer !== "") {
                bluetooth.uartWriteString(buffer);
            }
        }
    });

    function outputData(data: string) {
        if (!isConnected) {
            buffer += data + "\n";
        } else if (outputMode === OutputMode.Serial) {
            serial.writeLine(data);
        } else {
            bluetooth.uartWriteLine(data);
        }
    }

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

    // Shared classes --------------------------
    
    /**
     * A single graph of any type
     * Graphs are uniquely identified by their title
     */

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

        public createX(): string {
            return JSON.stringify({
                "label": this.titleX,
                "min": this.minX || "",
                "max": this.maxX || "",
            });
        }

        public createY(): string {
            return JSON.stringify({
                "label": this.titleY,
                "min": this.minY,
                "max": this.maxY,
            });
        }
    }

    //% block="X axis:|Title $titleX|Values $minX to $maxX| |Y axis:|Title $titleY|Values $minY to $maxY"
    //% blockId=dataplotcreateaxisoptions
    //% titleX.defl="X axis"
    //% titleY.defl="Y axis"
    //% blockHidden=true
    //% inlineInputMode="external"
    //% group="Plotting"
    export function createAxisOptions(
        titleX?: string,
        titleY?: string,
        minX?: number,
        maxX?: number,
        minY?: number,
        maxY?: number): AxisOptions {
        return new AxisOptions(titleX, titleY, minX, maxX, minY, maxY);
    }

    //% block="X axis:|Title $titleX|Y axis:|Title $titleY|Values $minY to $maxY"
    //% blockId=dataplotcreateaxisoptionsbar
    //% titleX.defl="X axis"
    //% titleY.defl="Y axis"
    //% blockHidden=true
    //% inlineInputMode="external"
    //% group="Plotting"
    export function createAxisOptionsBar(
        titleX?: string,
        titleY?: string,
        minY?: number,
        maxY?: number): AxisOptions {
        return new AxisOptions(titleX, titleY, minY, maxY);
    }

    // Bar plots ----------------------------

    export class BarPlot {
        constructor(
            public title: string,
            public series?: BarSeries[]
        ) { }

        // Convert data to JSON format (or similar)
        // ignoring undefined values
        public create(): string {
            return JSON.stringify({
                "type": "config",
                "graphType": "bar",
                "title": this.title,
                "series": this.series.map(s => s.create())
            });
        }
    }

    //% block="add bar plot|$plot|with series|$s1||$s2 $s3 $s4 $s5"
    //% blockId=dataplotaddbarplot
    //% group="Plotting"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatebarplot
    //% s1.shadow=dataplotcreatebarseries
    //% s2.shadow=dataplotcreatebarseries
    //% s3.shadow=dataplotcreatebarseries
    //% s4.shadow=dataplotcreatebarseries
    //% s5.shadow=dataplotcreatebarseries
    //% weight=95
    export function addBarPlot(
        plot: BarPlot,
        s1: BarSeries,
        s2?: BarSeries,
        s3?: BarSeries,
        s4?: BarSeries,
        s5?: BarSeries): void {
        plot.series = [s1, s2, s3, s4, s5].filter(s => !!s)
        // Send configuration data here?
        // Use plot.create()
    }

    //% block="bar plot $title"
    //% blockId=dataplotcreatebarplot
    //% blockHidden=true
    //% axops.shadow=dataplotcreateaxisoptions
    //% inlineInputMode="variable"
    //% compileHiddenArguments=true // I assume this uses the default values for not extended arguments?
    //% inlineInputModeLimit=1
    //% duplicateShadowOnDrag
    export function createBarPlot(
        title: string): BarPlot {
        return new BarPlot(title);
    }

    // One set of bars
    // Multiple series creates a graph with multiple bars per x value?
    export class BarSeries { 
        constructor(
            public name: string,
            public y_column: string,
            public icon?: string,
            public options?: BarSeriesOptions
        ) { }

        public create(): string {
            return JSON.stringify({
                "x_column": "",
                "y_column": this.y_column,
                "color": this.options.colour || "",
                "icon": this.icon || "",
                "displayName": this.name || ""
            })
        }
    }

    //% block="bar series $title|using data from column $y_column||icon $icon options|$seriesops"
    //% blockId=dataplotcreatebarseries
    //% group="Plotting"
    //% y_column.shadow=datalogger_columnfield
    //% icon.shadow=dataplot_icon
    //% seriesops.shadow=dataplotcreatebarseriesoptions
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createBarSeries (
        title: string,
        y_column: string,
        icon?: string,
        seriesops?: BarSeriesOptions
    ): BarSeries {
        return new BarSeries(title, y_column, icon, seriesops);
    }
    
    /** Stores series data */
    export class BarSeriesOptions {
        constructor(
            public colour?: number,
            public barwidth?: number
        ) { }
    }

    //% block="bar colour $colour icon"
    //% blockId=dataplotcreatebarseriesoptions
    //% group="Plotting"
    //% compileHiddenArguments=true
    //% colour.shadow="colorNumberPicker"
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createBarSeriesOptions(
        colour?: number,
        barwidth?: number): BarSeriesOptions {
        return new BarSeriesOptions(colour, barwidth);
    }

    // Line plots ---------------------------

    export class LinePlot {
        constructor(
            public title: string,
            public axisoptions?: AxisOptions,
            public series?: LineSeries[]
        ) { }

        public create(): string { 
            return JSON.stringify({
                "type": "config",
                "graphType": "line",
                "title": this.title,
                "x": this.axisoptions.createX() || {},
                "y": this.axisoptions.createY() || {},
                "series": this.series.map(s => s.create())
            })
        }
    }

    //% block="add line plot|$plot|with series|$s1||$s2 $s3 $s4 $s5"
    //% blockId=dataplotaddlineplot
    //% group="Plotting"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatelineplot
    //% s1.shadow=dataplotcreatelineseries
    //% s2.shadow=dataplotcreatelineseries
    //% s3.shadow=dataplotcreatelineseries
    //% s4.shadow=dataplotcreatelineseries
    //% s5.shadow=dataplotcreatelineseries
    //% weight=96
    export function addLinePlot(
        plot: LinePlot,
        s1: LineSeries,
        s2?: LineSeries,
        s3?: LineSeries,
        s4?: LineSeries,
        s5?: LineSeries): void {
        plot.series = [s1, s2, s3, s4, s5].filter(s => !!s)
    }

    //% block="line plot $title||axis options|$axops"
    //% blockId=dataplotcreatelineplot
    //% axops.shadow=dataplotcreateaxisoptions
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% compileHiddenArguments=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    //% duplicateShadowOnDrag
    //% group="Plotting"
    export function createLinePlot(
        title: string,
        axops?: AxisOptions,
    ): LinePlot {
        return new LinePlot(title, axops);
    }

    // One line
    export class LineSeries {
        constructor(
            public name: string,
            public x_column: string,
            public y_column: string,
            public icon?: string,
            public options?: LineSeriesOptions
        ) { }

        public create(): string {
            return JSON.stringify({
                "x_column": this.x_column,
                "y_column": this.y_column,
                "color": this.options.colour || "",
                "icon": this.icon || "",
                "displayName": this.name || ""
            });
        }
    }

    //% block="line series $title|using X data from column $x_column|Y data from column $column_y||icon $icon options|$seriesops"
    //% blockId=dataplotcreatelineseries
    //% group="Plotting"
    //% x_column.shadow=datalogger_columnfield
    //% y_column.shadow=datalogger_columnfield
    //% icon.shadow=dataplot_icon
    //% seriesops.shadow=dataplotcreatelineseriesoptions
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createLineSeries(
        title: string,
        column_x: string,
        column_y: string,
        icon?: string,
        seriesops?: LineSeriesOptions
    ): LineSeries {
        return new LineSeries(title, column_x, column_y, icon, seriesops);
    }

    /** Stores series data */
    export class LineSeriesOptions {
        constructor(
            public colour?: number,
            public barwidth?: number
        ) { }
    }

    //% block="line colour $colour"
    //% blockId=dataplotcreatelineseriesoptions
    //% group="Plotting"
    //% colour.shadow="colorNumberPicker"
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createLineSeriesOptions(
        colour?: number,
        barwidth?: number): LineSeriesOptions {
        return new LineSeriesOptions(colour, barwidth);
    }

    // Scatter plots ------------------------

    export class ScatterPlot {
        constructor(
            public title: string,
            public axisoptions?: AxisOptions,
            public series?: ScatterSeries[]
        ) { }

        public create(): string {
            return JSON.stringify({
                "type": "config",
                "graphType": "scatter",
                "title": this.title,
                "x": this.axisoptions.createX() || {},
                "y": this.axisoptions.createY() || {},
                "series": this.series.map(s => s.create())
            })
        }
    }

    //% block="add scatter plot|$plot|with series|$s1||$s2 $s3 $s4 $s5"
    //% blockId=dataplotaddscatterplot
    //% group="Plotting"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatescatterplot
    //% s1.shadow=dataplotcreatescatterseries
    //% s2.shadow=dataplotcreatescatterseries
    //% s3.shadow=dataplotcreatescatterseries
    //% s4.shadow=dataplotcreatescatterseries
    //% s5.shadow=dataplotcreatescatterseries
    //% weight=94
    export function addScatterPlot(
        plot: ScatterPlot,
        s1: ScatterSeries,
        s2?: ScatterSeries,
        s3?: ScatterSeries,
        s4?: ScatterSeries,
        s5?: ScatterSeries): void {
        plot.series = [s1, s2, s3, s4, s5].filter(s => !!s);
        outputData(plot.create());
    }

    //% block="scatter plot $title||axis options|$axops"
    //% blockId=dataplotcreatescatterplot
    //% axops.shadow=dataplotcreateaxisoptions
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% compileHiddenArguments=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    //% duplicateShadowOnDrag
    //% group="Plotting"
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

        public create(): string {
            return JSON.stringify({
                "x_column": this.x_column,
                "y_column": this.y_column,
                "color": this.options.colour || "",
                "icon": this.icon || "",
                "displayName": this.name || ""
            });
        }
    }

    //% block="scatter series $title|using X data from column $x_column|Y data from column $column_y||icon $icon options|$seriesops"
    //% blockId=dataplotcreatescatterseries
    //% group="Plotting"
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

    /** Stores series data */
    export class ScatterSeriesOptions {
        constructor(
            public colour?: number,
        ) { }
    }

    //% block="point colour $colour"
    //% blockId=dataplotcreatescatterseriesoptions
    //% group="Plotting"
    //% colour.shadow="colorNumberPicker"
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createScatterSeriesOptions(
        colour?: number): ScatterSeriesOptions {
        return new ScatterSeriesOptions(colour);
    }

    // Pie plots ----------------------------

    export class PiePlot {
        constructor(
            public title: string,
            public series?: PieSeries
        ) { }

        public create(): string {
            return JSON.stringify({
                "type": "config",
                "graphType": "pie",
                "title": this.title,
                "series": this.series.create()
            })
        }
    }

    //% block="add pie plot|$plot|with data|$s1"
    //% blockId=dataplotaddpieplot
    //% group="Plotting"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatepieplot
    //% s1.shadow=dataplotcreatepieseries
    //% weight=93
    export function addPiePlot(
        plot: PiePlot,
        s1: PieSeries): void {
        plot.series = s1
    }

    //% block="pie plot $title"
    //% blockId=dataplotcreatepieplot
    //% axops.shadow=dataplotcreateaxisoptions
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% compileHiddenArguments=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    //% duplicateShadowOnDrag
    //% group="Plotting"
    export function createPiePlot(
        title: string,
    ): PiePlot {
        return new PiePlot(title);
    }

    // Only one series per pie plot
    export class PieSeries {
        constructor(
            public y_column: string,
            public options?: PieSeriesOptions,
            public series?: PieSeries
        ) { }

        public create(): string {
            return JSON.stringify({
                "x_column": "",
                "y_column": this.y_column,
                "color": "",
                "icon": "",
                "displayName": ""
            });
        }
    }

    //% block="using data from column $y_column||options|$seriesops"
    //% blockId=dataplotcreatepieseries
    //% group="Plotting"
    //% x_column.shadow=datalogger_columnfield
    //% seriesops.shadow=dataplotcreatepieseriesoptions
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createPieSeries(
        y_column: string,
        seriesops?: PieSeriesOptions
    ): PieSeries {
        return new PieSeries(y_column, seriesops);
    }

    /** Stores series data */
    export class PieSeriesOptions {
        constructor(
            public colours?: number[],
        ) { }
    }

    //% block="colours $colours"
    //% blockId=dataplotcreatepieseriesoptions
    //% group="Plotting"
    //% colours.shadow="lists_create_with"
    //% colours.defl="colorNumberPicker"
    //% blockHidden=true
    //% inlineInputMode="external"
    export function createPieSeriesOptions(
        colours?: number[]): PieSeriesOptions {
        return new PieSeriesOptions(colours);
    }

    // ------------------------------------

    //% block="set output mode $mode"
    //% blockId=dataplotsetoutputmode
    //% group="Plotting"
    export function setOutputMode(mode: OutputMode) {
        outputMode = mode;
    }

    /*
    function construct_graph_json(graph_type: string, graph_settings: GraphSettings, seriess: Series[]) {
        return JSON.stringify({
            "type": "config",
            "graphType": graph_type,
            "title": graph_settings.title,
            "x": graph_settings.x_axis || {},
            "y": graph_settings.y_axis || {},
            "series": seriess.map((series) => ({
                "x_column": series.x_column || "",
                "y_column": series.y_column,
                "color": series.color,
                "icon": series.icon || "",
                "displayName": series.display_name || ""
            }))
        });
    }
    */

    export class Test {constructor(public name:string) {}}

    //% block="make test $value"
    //% blockId=testtest
    //% group="Plotting"
    //% weight=0
    export function test(value: string): Test {
        return new Test(value);
    }
}