//% color="#AA278D"
namespace dataplot {
    //TODO: I believe block ids should be globally unique
    //TODO: Use an enum for output mode
    //TODO: More output modes?
    //TODO: Docstrings
    let outputMode = "serial";

    //% blockId=time_column_name
    //% block="time"
    export function time(): string {
        return "time (seconds)"
    }

    //% shim=TD_ID
    //% blockId=graph_type_field
    //% block="$graph_type"
    //% blockHidden=true
    //% graph_type.fieldEditor="textdropdown"
    //% graph_type.fieldOptions.decompileLiterals=true
    //% graph_type.fieldOptions.values="line, scatter"
    //% graph_type.defl="line"
    export function _graph_type_field(graph_type: string): string {
        return graph_type
    }

    export class AxisSettings {
        constructor(
            public label: string,
            public min?: number,
            public max?: number
        ) { }
    }

    //% blockId=axis_settings_field
    //% block="label $label||ranging from $min to $max"
    //% blockHidden=true
    export function _axis_settings(label: string, min?: number, max?: number) {
        return new AxisSettings(label, min, max);
    }

    export class GraphSettings {
        constructor(
            public title: string,
            public x_axis?: AxisSettings,
            public y_axis?: AxisSettings
        ) { }
    }

    //% blockId=graph_settings_field
    //% block="named $title||with x axis $x_axis|and y axis $y_axis"
    //% blockHidden=false
    //% x_axis.shadow=axis_settings_field
    //% y_axis.shadow=axis_settings_field
    //% expandableArgumentMode=toggle
    export function _graph_settings(title: string, x_axis?: AxisSettings, y_axis?: AxisSettings) {
        return new GraphSettings(title, x_axis, y_axis);
    }

    //% blockId=graph_settings_field_no_x
    //% block="named $title||with y axis $y_axis"
    //% blockHidden=false
    //% x_axis.shadow=axis_settings_field
    //% y_axis.shadow=axis_settings_field
    //% expandableArgumentMode=toggle
    export function _graph_settings_no_x(title: string, y_axis?: AxisSettings) {
        return new GraphSettings(title, undefined, y_axis);
    }

    //% blockId=graph_settings_field_no_axes
    //% block="named $title"
    //% blockHidden=false
    //% x_axis.shadow=axis_settings_field
    //% y_axis.shadow=axis_settings_field
    //% expandableArgumentMode=toggle
    export function _graph_settings_no_axes(title: string) {
        return new GraphSettings(title);
    }

    export class Series {
        constructor(
            public x_column: string,
            public y_column: string,
            public color: number,
            public display_name?: string,
            public icon?: string
        ) { }
    }

    enum Icon {
        //% block="cross"
        Cross,
        //% block="plus"
        Plus,
        //% block="zhe"
        Zhe,  // Looks like the cyrillic letter zhe
        //% block="circle"
        Circle,
        //% block="diamond"
        Diamond,
        //% block="rectangle"
        Rectangle,
        //% block="triangle"
        Triangle
    }

    //% blockId=icon_field
    //% block="$icon"
    export function _icon(icon: Icon): string {
        switch (icon) {
            case Icon.Cross: return "cross";
            case Icon.Plus: return "plus";
            case Icon.Zhe: return "zhe";
            case Icon.Circle: return "circle";
            case Icon.Diamond: return "diamond";
            case Icon.Rectangle: return "rectangle";
            case Icon.Triangle: return "triangle";
        }
    }

    //% blockId=series_field
    //% block="with x column $x_column and y column $y_column coloured $color||with heading $display_name and icon $icon"
    //% blockHidden=true
    //% x_column.shadow=datalogger_columnfield
    //% y_column.shadow=datalogger_columnfield
    //% color.shadow="colorNumberPicker"
    //% icon.shadow=icon_field
    //% expandableArgumentMode=toggle
    //% inlineInputMode=inline
    export function _series(x_column: string, y_column: string, color: number, display_name?: string, icon?: string): Series {
        return new Series(x_column, y_column, color, display_name, icon);
    }

    //% blockId=series_field_no_icon
    //% block="with x column $x_column and y column $y_column coloured $color||with heading $display_name"
    //% blockHidden=true
    //% x_column.shadow=datalogger_columnfield
    //% y_column.shadow=datalogger_columnfield
    //% color.shadow="colorNumberPicker"
    //% icon.shadow=icon_field
    //% expandableArgumentMode=toggle
    //% inlineInputMode=inline
    export function _series_no_icon(x_column: string, y_column: string, color: number, display_name?: string): Series {
        return new Series(x_column, y_column, color, display_name);
    }

    //% blockId=series_field_no_x
    //% block="with data column $y_column coloured $color||with heading $display_name"
    //% blockHidden=true
    //% y_column.shadow=datalogger_columnfield
    //% color.shadow="colorNumberPicker"
    //% icon.shadow=icon_field
    //% expandableArgumentMode=toggle
    //% inlineInputMode=inline
    export function _series_no_x(y_column: string, color: number, display_name?: string): Series {
        return new Series(undefined, y_column, color, display_name);
    }

    //% blockId=dataplot_rgb
    //% block="red $red green $green blue $blue"
    export function rgb(red: number, green: number, blue: number): number {
        return (red << 16) + (green << 8) + blue;
    }

    //% bockId=add_plot_scatter_line
    //% block="Add $graph_type|plot $graph_settings|with series $series1||$series2 $series3 $series4 $series5 $series6 $series7 $series8 $series9 $series10"
    //% graph_type.shadow=graph_type_field
    //% graph_settings.shadow=graph_settings_field
    //% series1.shadow=series_field
    //% series2.shadow=series_field
    //% series3.shadow=series_field
    //% series4.shadow=series_field
    //% series5.shadow=series_field
    //% series6.shadow=series_field
    //% series7.shadow=series_field
    //% series8.shadow=series_field
    //% series9.shadow=series_field
    //% series10.shadow=series_field
    //% weight=100
    export function add_plot_scatter_line(
        graph_type: string, graph_settings: GraphSettings,
        series1: Series, series2?: Series, series3?: Series, series4?: Series, series5?: Series,
        series6?: Series, series7?: Series, series8?: Series, series9?: Series, series10?: Series
    ) {
        add_plot_array(graph_type, graph_settings, [
            series1, series2, series3, series4, series5,
            series6, series7, series8, series9, series10
        ].filter((e: any) => !!e));
    }

    //% bockId=add_plot_histogram
    //% block="Add histogram plot $graph_settings|with series $series1"
    //% graph_settings.shadow=graph_settings_field
    //% series1.shadow=series_field_no_icon
    //% weight=100
    export function add_plot_histogram(
        graph_settings: GraphSettings,
        series1: Series
    ) {
        add_plot_array("histogram", graph_settings, [
            series1
        ].filter((e: any) => !!e));
    }

    //% bockId=add_plot_bar
    //% block="Add bar chart $graph_settings|with series $series1||$series2 $series3 $series4 $series5 $series6 $series7 $series8 $series9 $series10"
    //% graph_settings.shadow=graph_settings_field_no_x
    //% series1.shadow=series_field_no_x
    //% series2.shadow=series_field_no_x
    //% series3.shadow=series_field_no_x
    //% series4.shadow=series_field_no_x
    //% series5.shadow=series_field_no_x
    //% series6.shadow=series_field_no_x
    //% series7.shadow=series_field_no_x
    //% series8.shadow=series_field_no_x
    //% series9.shadow=series_field_no_x
    //% series10.shadow=series_field_no_x
    //% weight=100
    export function add_plot_bar(
        graph_settings: GraphSettings,
        series1: Series, series2?: Series, series3?: Series, series4?: Series, series5?: Series,
        series6?: Series, series7?: Series, series8?: Series, series9?: Series, series10?: Series
    ) {
        add_plot_array("bar", graph_settings, [
            series1, series2, series3, series4, series5,
            series6, series7, series8, series9, series10
        ].filter((e: any) => !!e));
    }

    //% bockId=add_plot_pie
    //% block="Add pie chart $graph_settings|with series $series1||$series2 $series3 $series4 $series5 $series6 $series7 $series8 $series9 $series10"
    //% graph_settings.shadow=graph_settings_field_no_axes
    //% series1.shadow=series_field_no_x
    //% series2.shadow=series_field_no_x
    //% series3.shadow=series_field_no_x
    //% series4.shadow=series_field_no_x
    //% series5.shadow=series_field_no_x
    //% series6.shadow=series_field_no_x
    //% series7.shadow=series_field_no_x
    //% series8.shadow=series_field_no_x
    //% series9.shadow=series_field_no_x
    //% series10.shadow=series_field_no_x
    //% weight=100
    export function add_plot_pie(
        graph_settings: GraphSettings,
        series1: Series, series2?: Series, series3?: Series, series4?: Series, series5?: Series,
        series6?: Series, series7?: Series, series8?: Series, series9?: Series, series10?: Series
    ) {
        add_plot_array("pie", graph_settings, [
            series1, series2, series3, series4, series5,
            series6, series7, series8, series9, series10
        ].filter((e: any) => !!e));
    }

    //% blockId=set_output_mode
    //% block="Output via bluetooth $mode"
    //% mode.shadow="toggleOnOff"
    export function set_output_mode(mode: boolean) {
        if (mode) {
            outputMode = "bluetooth";
        } else {
            outputMode = "serial";
        }
    }

    function add_plot_array(graph_type: string, graph_settings: GraphSettings, seriess: Series[]) {
        outputData(construct_graph_json(graph_type, graph_settings, seriess));
    }

    function construct_graph_json(graph_type: string, graph_settings: GraphSettings, seriess: Series[]) {
        return JSON.stringify({
            "type": "config",
            "graphType": graph_type,
            "title": graph_settings.title,
            "x": graph_settings.x_axis,
            "y": graph_settings.y_axis,
            "series": seriess.map((series) => ({
                "x_column": series.x_column,
                "y_column": series.x_column,
                "color": series.color,
                "icon": series.icon || "cross",
                "displayName": series.display_name || series.y_column
            }))
        });
    }

    function outputData(data: string) {
        if (outputMode === "serial") {
            serial.writeLine(data);
        } else if (outputMode === "bluetooth") {
            bluetooth.uartWriteString("||plots:" + data);
        }
    }
}