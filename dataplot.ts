/**
 * Send plotting data to flash storage
 * Follows the same structure seen in datalogger
 * Currently just uses the blocks as a template,
 * so no data is sent
 */
//% block="Data Plotter"
//% color="#AA278D"
//% icon="\uf080"
//% groups=["Plotting", "Axis Options", "Series Options", "others"] // Not working?
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

    // Plots and Series ---------------------------
    
    /**
     * A single graph of any type
     * Graphs are uniquely identified by their title
     */
    export class Plot {
        constructor(
            public title: string,
            public options: PlotOption[]
        ) {}
    }

    export class BarPlot extends Plot {
        constructor(
            title: string,
            options: PlotOption[],
            public series?: Series[]
        ) { super(title, options) }
    }

    //% block="add bar plot|$plot|with series|$s1||$s2 $s3 $s4 $s5"
    //% blockId=dataplotaddbarplot
    //% group="Plotting"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatebarplot
    //% s1.shadow=dataplotcreateseries
    //% s2.shadow=dataplotcreateseries
    //% s3.shadow=dataplotcreateseries
    //% s4.shadow=dataplotcreateseries
    //% s5.shadow=dataplotcreateseries
    //% weight=95
    export function addBarPlot(
        plot: BarPlot,
        s1: Series,
        s2?: Series,
        s3?: Series,
        s4?: Series,
        s5?: Series): void {
        plot.series = [s1, s2, s3, s4, s5].filter(s => !!s)
    }

    export class LinePlot extends Plot {
        constructor(
            title: string,
            options: PlotOption[],
            public series?: Series[]
        ) { super(title, options) }
    }

    //% block="add line plot|$plot|with series|$s1||$s2 $s3 $s4 $s5"
    //% blockId=dataplotaddlineplot
    //% group="Plotting"
    //% inlineInputMode="external"
    //% plot.shadow=dataplotcreatelineplot
    //% s1.shadow=dataplotcreateseries
    //% s2.shadow=dataplotcreateseries
    //% s3.shadow=dataplotcreateseries
    //% s4.shadow=dataplotcreateseries
    //% s5.shadow=dataplotcreateseries
    //% weight=96
    export function addLinePlot(
        plot: LinePlot,
        s1: Series,
        s2?: Series,
        s3?: Series,
        s4?: Series,
        s5?: Series): void {
        plot.series = [s1, s2, s3, s4, s5].filter(s => !!s)
    }

    export class Series {
        constructor(
            public name: string,
            public options: SeriesOption[]
        ) {}
    }

    /** 
     * Expect titles to be unique
     */
    export class Option {
        constructor(
            public name: string,
            public value: any,
        ) {}

        public apply(): String {
            return "{" + this.name + ": " + this.value + "}" 
        }
    }

    // Plot Options -------------------------------

    export class PlotOption extends Option {
        constructor(
            name: string,
            value: any,
        ) { super(name, value) }
    }

    export class BarOption extends PlotOption {
        constructor(
            name: string,
            value: any,
        ) { super(name, value) }
    }

    export class LineOption extends PlotOption {
        constructor(
            public name: string,
            public value: any,
        ) { super(name, value) }
    }

    export class AxisOption extends (BarOption) {
        constructor(
            public name: string,
            public value: any,
        ) { super(name, value) }
    }

    export class XOption extends AxisOption {
        constructor(
            public name: string,
            public value: any,
        ) { super(name, value) }
    }

    export class YOption extends AxisOption {
        constructor(
            public name: string,
            public value: any,
        ) { super(name, value) }
    }

    export class XMinOption extends XOption {
        constructor(public value: number) { super("X min", value) }
    }

    //% block="X min $value"
    //% blockId=dataplotcreatexminoption
    //% group="Axis Options"
    export function createMinXOption(value: number): XMinOption {
        return new XMinOption(value)
    }

    export class XMaxOption extends XOption {
        constructor(value: number) { super("X max", value) }
    }

    //% block="X max $value"
    //% blockId=dataplotcreatexmaxoption
    //% group="Axis Options"
    export function createMaxXOption(value: number): XMaxOption {
        return new XMaxOption(value)
    }

    export class XLabelOption extends XOption {
        constructor(public value: string) { super("X label", value) }
    }

    //% block="X label $value"
    //% blockId=dataplotcreatexlabeloption
    //% group="Axis Options"
    export function createXLabelOption(value: string): XLabelOption {
        return new XLabelOption(value)
    }

    export class YMinOption extends YOption {
        constructor(value: number) { super("Y min", value) }
    }

    //% block="Y min $value"
    //% blockId=dataplotcreateyminoption
    //% group="Axis Options"
    export function createYMinOption(value: number): YMinOption {
        return new YMinOption(value)
    }

    export class YMaxOption extends YOption {
        constructor(value: number) { super("Y max", value) }
    }

    //% block="Y max $value"
    //% blockId=dataplotcreateymaxoption
    //% group="Axis Options"
    export function createMaxYOption(value: number): YMaxOption {
        return new YMaxOption(value)
    }

    export class YLabelOption extends XOption {
        constructor(public value: string) { super("Y label", value) }
    }

    //% block="Y label $value"
    //% blockId=dataplotcreateylabeloption
    //% group="Axis Options"
    export function createYLabelOption(value: string): YLabelOption {
        return new YLabelOption(value)
    }

    // Series Options -----------------------------

    export class SeriesOption extends Option {
        constructor(
            public name: string,
            public value: any,
        ) { super(name, value) }
    }

    //% block="bar plot $title||options $op1 $op2 $op3 $op4 $op5 $op6 $op7 $op8 $op9 $op10"
    //% blockId=dataplotcreatebarplot
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    //% group="Plotting"
    export function createBarPlot(
        title: string,
        op1?: BarOption,
        op2?: BarOption,
        op3?: BarOption,
        op4?: BarOption,
        op5?: BarOption,
        op6?: BarOption,
        op7?: BarOption,
        op8?: BarOption,
        op9?: BarOption,
        op10?: BarOption
    ): BarPlot {
        return new BarPlot(title,
            [
                op1,
                op2,
                op3,
                op4,
                op5,
                op6,
                op7,
                op8,
                op9,
                op10,
            ].filter(op => !!op)
        );
    }

    //% block="line plot $title||options $op1 $op2 $op3 $op4 $op5 $op6 $op7 $op8 $op9 $op10"
    //% blockId=dataplotcreatelineplot
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    //% group="Plotting"
    export function createLinePlot(
        title: string,
        op1?: LineOption,
        op2?: LineOption,
        op3?: LineOption,
        op4?: LineOption,
        op5?: LineOption,
        op6?: LineOption,
        op7?: LineOption,
        op8?: LineOption,
        op9?: LineOption,
        op10?: LineOption
    ): LinePlot {
        return new LinePlot(title,
            [
                op1,
                op2,
                op3,
                op4,
                op5,
                op6,
                op7,
                op8,
                op9,
                op10,
            ].filter(op => !!op)
        );
    }

    //% block="series $title||options $op1 $op2 $op3 $op4 $op5 $op6 $op7 $op8 $op9 $op10"
    //% blockId=dataplotcreateseries
    //% blockHidden=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=1
    //% group="Plotting"
    export function createSeries(
        title: string,
        op1?: SeriesOption,
        op2?: SeriesOption,
        op3?: SeriesOption,
        op4?: SeriesOption,
        op5?: SeriesOption,
        op6?: SeriesOption,
        op7?: SeriesOption,
        op8?: SeriesOption,
        op9?: SeriesOption,
        op10?: SeriesOption
    ): Series {
        return new Series(title,
            [
                op1,
                op2,
                op3,
                op4,
                op5,
                op6,
                op7,
                op8,
                op9,
                op10,
            ].filter(op => !!op)
        );
    }

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