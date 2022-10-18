import sessionData from '../tmpOut/Session.json' assert {type: "json"};
import { Struct } from "https://deno.land/x/struct@1.0.0/mod.ts";
import { displayCurvePlot } from './displayCurves.ts';

type Coordinate = { x: number, y: number };
export type Curve = {
    numPoints: number,
    points: Coordinate[]
};

const numObjToArr = (input: {[key: string]: T}): T[] => {
	// assumes keys are ascending numbers
	let keys = Object.keys(input);
	keys = keys.sort((a, b) => {return a-b});
	const output: T[] = [];
	for(const key of keys) {
		output.push(input[key]);
	}
	return output;
}
const bytesToPoints = (bytes: Uint8Array): number[] => {
    const points: number[] = [];
    for(let i = 0; i < bytes.length/4; i++) {
        let num: number[] = Struct.unpack("f32", bytes.slice(4*i, 4*i+4).reverse());
        points[i] = num[0]
    }
    return points;
}
const bytesToNumPoints = (bytes: Uint8Array): number[] => {
    const numPoints: number[] = [];
    for(let i = 0; i < bytes.length/4; i++) {
        let num: number[] = Struct.unpack("i32", bytes.slice(4*i, 4*i+4).reverse());
        numPoints[i] = num[0]
    }
    return numPoints;
}
const makeCoords = (points: number[]): Coordinate[] => {
    let coords: Coordinate[] = [];
    let tmp: Coordinate;

    points.forEach((point, index, arr) => {
        if(index % 2 == 0) { // even values are x
            tmp = {x: point, y: arr[index + 1]};
            coords.push(tmp);
        } else return;
    });
    return coords;
}
const makeCurves = (coords: Coordinate[], numpoints: number[]): Curve[] => {
    const curves: Curve[] = [];
    let offset = 0;
    for(let i = 0; i < numpoints.length; i++) {
        let curve: Curve = {
            numPoints: numpoints[i],
            points: []
        };
        curve.points = coords.slice(offset, offset + numpoints[i]);
        offset += numpoints[i];
        curves.push(curve);
    }
    return curves;
}
let pointBytes: number[] = [];
let numPointBytes: number[] = [];
for (const entry of sessionData.$objects) {
    if(typeof entry !== "object") continue;
    if(!entry.curvespoints) continue;
    if(!entry.curvesnumpoints) continue;
    // numObjToArr ensures that we get these in order. thanks @turbio for pointing that out
	pointBytes = numObjToArr(entry.curvespoints);
    numPointBytes = numObjToArr(entry.curvesnumpoints);
}
const points = bytesToPoints(Uint8Array.from(pointBytes));
const numPoints = bytesToNumPoints(Uint8Array.from(numPointBytes));
const coords = makeCoords(points);
const curves = makeCurves(coords, numPoints);
// console.log(points.toString());
displayCurvePlot(curves);
await Deno.writeTextFile("./tmpOut/curves.json", JSON.stringify({curves}));
// console.log(curvespoints);
// let buff: Uint8Array = new Uint8Array();
