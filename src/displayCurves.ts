import { Datas, Deplot, Plotly } from "https://deno.land/x/deplot@0.2.0/mod.ts";
import { Curve } from "./sessionCurves.ts";

const deplot = new Deplot('Plotly');

export const displayCurvePlot = (curves: Curve[]) => {
    const data: Plotly.Data[] = [];
    curves.forEach((curve) => {
        let xCoords: number[] = [];
        let yCoords: number[] = [];
        curve.points.forEach((coord) => {
            xCoords.push(coord.x);
            yCoords.push(coord.y);
        });
        data.push({
            x: xCoords,
            y: yCoords,
            mode: 'lines',
            type: 'scatter'
        })
    })
    const datas: Datas = { data }
    deplot.plot(datas, { title: 'ChartJs line plot', size: [800, 800] });
}