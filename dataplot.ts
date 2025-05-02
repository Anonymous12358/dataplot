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

//% color="#AA278D"
namespace dataplot {
    //TODO: I believe block ids should be globally unique
    //TODO: Use an enum for output mode
    let outputMode: string = "serial";
    let isConnected: boolean = false;
    let buffer: string = ".........................\n";

    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        if (outputMode === "serial" && !isConnected && serial.readLine() === "dataplot connection") {
            isConnected = true;
            if (buffer !== "") {
                serial.writeString(buffer);
            }
        }
    });

    function outputData(data: string) {
        if (outputMode === "serial") {
            if (isConnected) {
                serial.writeLine(data);
            } else {
                buffer += data + "\n";
            }
        } else if (outputMode === "bluetooth") {
            bluetooth.uartWriteLine(data);
        }
    }

    //% blockId=time_column_name
    //% block="time"
    //% weight=30
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
    //% expandableArgumentMode=toggle
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
    //% blockHidden=true
    //% x_axis.shadow=axis_settings_field
    //% y_axis.shadow=axis_settings_field
    //% expandableArgumentMode=toggle
    export function _graph_settings(title: string, x_axis?: AxisSettings, y_axis?: AxisSettings) {
        return new GraphSettings(title, x_axis, y_axis);
    }

    //% blockId=graph_settings_field_no_x
    //% block="named $title||with y axis $y_axis"
    //% blockHidden=true
    //% x_axis.shadow=axis_settings_field
    //% y_axis.shadow=axis_settings_field
    //% expandableArgumentMode=toggle
    export function _graph_settings_no_x(title: string, y_axis?: AxisSettings) {
        return new GraphSettings(title, undefined, y_axis);
    }

    //% blockId=graph_settings_field_no_axes
    //% block="named $title"
    //% blockHidden=true
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

    //% blockId=icon_field
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

    /**
     * Specify a colour through its red, green, and blue values
     * This extension is not intended for colour processing: the block is provided only as a primitive way to specify colours beyond the default sixteen
     * @param red Intensity of red light
     * @param green Intensity of green light
     * @param blue Intensity of blue light
     * @returns The colour as a single RGB integer value
     */
    //% blockId=dataplot_rgb
    //% block="red $red green $green blue $blue"
    //% weight=25
    export function rgb(red: number, green: number, blue: number): number {
        return (red << 16) + (green << 8) + blue;
    }

    /**
     * Add a line or scatter plot to the display
     * @param graph_type Either "line" to draw a line from point to point, or "scatter" to not draw it
     * @param graph_settings A GraphSettings object with the title to display above the plot and optional configuration for the x and y axes
     * @param series1 A Series object with columns to read data from, a colour for the points and line plotted, and optionally, a name for the series and an icon to use for each point
     * @param series2 Up to 10 total series
     */
    //% blockId=add_plot_scatter_line
    //% block="Add $graph_type plot $graph_settings|with series $series1||$series2 $series3 $series4 $series5 $series6 $series7 $series8 $series9 $series10"
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

    /**
     * Add a histogram to the display
     * Each bar has a height determined by its y value, and stretches horizontally from the end of the previous bar (or minimum x value) to its x value
     * @param graph_settings A GraphSettings object with the title to display above the plot and optional configuration for the x and y axes
     * @param series1 A single Series object with columns from which to read data, a colour for the bars plotted, and optionally, a name for the series. Icons cannot be specified through the blocks interface and are ignored if specified otherwise.
     */
    //% bockId=add_plot_histogram
    //% block="Add histogram plot $graph_settings|with series $series1"
    //% graph_settings.shadow=graph_settings_field
    //% series1.shadow=series_field_no_icon
    //% weight=96
    export function add_plot_histogram(
        graph_settings: GraphSettings,
        series1: Series
    ) {
        add_plot_array("histogram", graph_settings, [
            series1
        ].filter((e: any) => !!e));
    }

    /**
     * Add a bar chart to the display
     * Each bar is a series, with height determined by its y value
     * @param graph_settings A GraphSettings object with the title to display above the plot and optional configuration for the y axis. X axis configuration cannot be specified through the blocks interface and is ignored if specified otherwise
     * @param series1 A Series object with a column from which to read the y data, a colour for the bar plotted, and optionally, a name for the series. Icon and x column cannot be specified through the blocks interface and are ignored if specified otherwise.
     * @param series2 Up to 10 total series
     */
    //% bockId=add_plot_bar
    //% block="Add bar chart $graph_settings|with bars $series1||$series2 $series3 $series4 $series5 $series6 $series7 $series8 $series9 $series10"
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
    //% weight=97
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

    /**
     * Add a pie chart to the display
     * Each sector is a series, with arc length determined by its y value
     * @param graph_settings A GraphSettings object with the title to display above the plot. X axis configuration cannot be specified through the blocks interface and is ignored if specified otherwise
     * @param series1 A Series object with a column from which to read the y data, a colour for the sector plotted, and optionally, a name for the series. Icon and x column cannot be specified through the blocks interface and are ignored if specified otherwise.
     * @param series2 Up to 10 total series
     */
    //% bockId=add_plot_pie
    //% block="Add pie chart $graph_settings|with wedges $series1||$series2 $series3 $series4 $series5 $series6 $series7 $series8 $series9 $series10"
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
    //% weight=98
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

    /**
         * Set whether to output graph config and data by bluetooth or serial
         * @param mode true to output by bluetooth, false to output by serial
         */
    //% blockId=set_output_mode
    //% block="Output via serial (no) $mode or bluetooth (yes)"
    //% mode.shadow="toggleYesNo"
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

    //% block
    //% weight=0
    export function sendData(data: string) {
        outputData(JSON.stringify({
            "type": "data",
            "timestamp": input.runningTime(),
            "values": JSON.parse(data)
        }));
    }
}


// "series": seriess.map((series) => ({
// "x_column": series.x_column,
//     "y_column": series.y_column,
//         "color": series.color,
//             "icon": series.icon || "cross",
//                "displayName": series.display_name || series.y_column
//            }))