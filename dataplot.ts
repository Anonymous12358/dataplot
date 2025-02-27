//% color="#AA278D"
namespace dataplot {
    //% shim=TD_ID
    //% blockId=graph_type_field
    //% block="$graph_type"
    //% blockHidden=true
    //% graph_type.fieldEditor="textdropdown"
    //% graph_type.fieldOptions.decompileLiterals=true
    //% graph_type.fieldOptions.values="line, scatter, bar, histogram, pie"
    //% graph_type.defl="line"
    export function _graph_type_field(graph_type: string): string {
        return graph_type
    }

    export class Series {
        constructor(
            public heading: string,
            public color: number
        ) {}
    }

    //% blockId=create_series
    //% block="series $heading colored $color"
    //% blockHidden=true
    //% color.shadow="colorNumberPicker"
    export function create_series(heading: string, color: number): Series {
        return new Series(heading, color);
    }

    //% bockId=add_plot
    //% block="Add $graph_type|plot named $title|with series $series1||$series2 $series3 $series4 $series5 $series6 $series7 $series8 $series9 $series10"
    //% graph_type.shadow=graph_type_field
    //% series1.shadow=create_series
    //% series2.shadow=create_series
    //% series3.shadow=create_series
    //% series4.shadow=create_series
    //% series5.shadow=create_series
    //% series6.shadow=create_series
    //% series7.shadow=create_series
    //% series8.shadow=create_series
    //% series9.shadow=create_series
    //% series10.shadow=create_series
    export function add_plot(
        graph_type: string, title: string,
        series1: Series, series2?: Series, series3?: Series, series4?: Series, series5?: Series,
        series6?: Series, series7?: Series, series8?: Series, series9?: Series, series10?: Series
        ) {
            add_plot_array(graph_type, title, [
                series1, series2, series3, series4, series5,
                series6, series7, series8, series9, series10
            ].filter((e: any) => !!e));
    }

    function add_plot_array(graph_type: string, title: string, seriess: Series[]) {
        let toLog : string = graph_type + "$$" + title + "$$";
        for (const series of seriess) {
            toLog += series.heading + "$$" + series.color + "$$";
        }
        flashlog.beginRow();
        flashlog.logData("$$plots", toLog);
        flashlog.endRow();
    }
}