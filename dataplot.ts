/**
 * Send plotting data to flash storage
 * Follows the same structure seen in datalogger
 * Currently just uses the blocks as a template,
 * so no data is sent
 */
//% block="Data Plotter"
//% color="#AA278D"
//% icon="\uf080"
//% groups=["Plotting", "others"] // Not working?
namespace dataplot {
    //TODO: More output modes?
    //TODO: Docstrings

    export enum OutputMode {
        //% block="serial"
        Serial,
        //% block="bluetooth"
        Bluetooth
    }

    let outputMode: OutputMode = OutputMode.Serial

    // Plots and Series base classes ----------------
    
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

        public create() { }
    }

    // TODO: Make it so that X and Y range can be optional
    // i.e. not defining a max means the max depends on the stored data
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

    // Bar plots ----------------------------

    export class BarPlot {
        constructor(
            public title: string,
            public series?: BarSeries[]
        ) { }

        // Convert data to JSON format (or similar)
        // ignoring undefined values
        public create() { }
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

    // One set of bars?
    // Multiple series creates a graph with multiple bars per x value
    export class BarSeries { 
        constructor(
            public name: string,
            public options?: BarSeriesOptions
        ) { }
    }

    //% block="bar series $title||options|$seriesops"
    //% blockId=dataplotcreatebarseries
    //% group="Plotting"
    //% seriesops.shadow=dataplotcreatebarseriesoptions
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    export function createBarSeries (
        title: string,
        seriesops?: BarSeriesOptions
    ): BarSeries {
        return new BarSeries(title, seriesops);
    }
    
    /** Stores series data */
    export class BarSeriesOptions {
        constructor(
            public colour?: number,
            public barwidth?: number
        ) { }

        public create() { }
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
            title: string,
            public axisoptions?: AxisOptions,
            public series?: LineSeries[]
        ) { }
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
            public options?: LineSeriesOptions
        ) { }
    }

    //% block="line series $title||options|$seriesops"
    //% blockId=dataplotcreatelineseries
    //% group="Plotting"
    //% seriesops.shadow=dataplotcreatelineseriesoptions
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    export function createLineSeries(
        title: string,
        seriesops?: LineSeriesOptions
    ): LineSeries {
        return new LineSeries(title, seriesops);
    }

    /** Stores series data */
    export class LineSeriesOptions {
        constructor(
            public colour?: number,
            public barwidth?: number
        ) { }

        public create() { }
    }

    //% block="line colour $colour icon"
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
            title: string,
            public axisoptions?: AxisOptions,
            public series?: ScatterSeries[]
        ) { }
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
        plot.series = [s1, s2, s3, s4, s5].filter(s => !!s)
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
            public options?: ScatterSeriesOptions
        ) { }
    }

    //% block="scatter series $title||options|$seriesops"
    //% blockId=dataplotcreatescatterseries
    //% group="Plotting"
    //% seriesops.shadow=dataplotcreatescatterseriesoptions
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    export function createScatterSeries(
        title: string,
        seriesops?: ScatterSeriesOptions
    ): ScatterSeries {
        return new ScatterSeries(title, seriesops);
    }

    /** Stores series data */
    export class ScatterSeriesOptions {
        constructor(
            public colour?: number,
        ) { }

        public create() { }
    }

    //% block="point colour $colour icon"
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
            title: string,
            public series?: PieSeries
        ) { }
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
            public name: string,
            public options?: PieSeriesOptions
        ) { }
    }

    //% block="options|$seriesops"
    //% blockId=dataplotcreatepieseries
    //% group="Plotting"
    //% seriesops.shadow=dataplotcreatepieseriesoptions
    //% blockHidden=true
    //% inlineInputMode="external"
    //% inlineInputModeLimit=1
    export function createPieSeries(
        title: string,
        seriesops?: PieSeriesOptions
    ): PieSeries {
        return new PieSeries(title, seriesops);
    }

    /** Stores series data */
    export class PieSeriesOptions {
        constructor(
            public colours?: number[],
        ) { }

        public create() { }
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
    //% weight=90
    export function setOutputMode(mode: OutputMode) {
        outputMode = mode;
    }

    export class Test {constructor(public name:string) {}}

    //% block="make test $value"
    //% blockId=testtest
    //% group="Plotting"
    //% weight=0
    export function test(value: string): Test {
        return new Test(value);
    }
}