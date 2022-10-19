import sessionData from '../tmpOut/Session.json' assert {type: "json"};
import { Struct } from "https://deno.land/x/struct@1.0.0/mod.ts";
// import { displayCurvePlot } from './displayCurves.ts';

type Coordinate = { x: number, y: number };
export type Curve = {
    uuid: string,
    color: string,
    numPoints: number,
    points: Coordinate[]
};

const numObjToArr = (input: {[key: string]: number}): number[] => {
	// assumes keys are ascending numbers
	let keys = Object.keys(input);
	keys = keys.sort((a, b) => {
        return Number.parseInt(a) - Number.parseInt(b)
    });
	const output: number[] = [];
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
const bytesToUUIDs = (bytes: Uint8Array): string[] => {
    const uuids: string[] = [];
    for(let i = 0; i < bytes.length/16; i++) {
        let uuidParts: string[] = [];
        bytes.slice(16*i, 16*i + 16).forEach((val) => {
            uuidParts.push(val.toString(16).padStart(2,"0"));
        });
        uuids.push(uuidParts.join(""));
    }
    return uuids;
}

/**
 * Converts an array of bytes into an array of hex RGBA color codes
 * @param bytes Uint8Array of bytes to convert to an array of colors
 */
const bytesToColors = (bytes: Uint8Array): string[] => {
    const colors: string[] = [];
    for(let i = 0; i < bytes.length/4; i++) {
        let colorParts: string[] = [];
        bytes.slice(4*i, 4*i + 4).forEach(val => {
            colorParts.push(val.toString(16).padStart(2,"0"));
        });
        colors.push("#" + colorParts.join(""));
    }
    return colors;
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
const makeCurves = (coords: Coordinate[], numpoints: number[], uuids: string[], colors: string[]): Curve[] => {
    const curves: Curve[] = [];
    let offset = 0;
    for(let i = 0; i < numpoints.length; i++) {
        const curve: Curve = {
            uuid: uuids[i],
            color: colors[i],
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
let uuidBytes: number[] = [];
let colorBytes: number[] = [];
for (const entry of sessionData.$objects) {
    if(typeof entry !== "object") continue;
    if(!entry.curvespoints) continue;
    if(!entry.curvesnumpoints) continue;
    if(!entry.curveUUIDs) continue;
    if(!entry.curvescolors) continue;
    // numObjToArr ensures that we get these in order. thanks @turbio for pointing that out
	pointBytes = numObjToArr(entry.curvespoints);
    numPointBytes = numObjToArr(entry.curvesnumpoints);
    uuidBytes = numObjToArr(entry.curveUUIDs);
    colorBytes = numObjToArr(entry.curvescolors);
}
const points = bytesToPoints(Uint8Array.from(pointBytes));
const numPoints = bytesToNumPoints(Uint8Array.from(numPointBytes));
const uuids = bytesToUUIDs(Uint8Array.from(uuidBytes));
const colors = bytesToColors(Uint8Array.from(colorBytes));
const coords = makeCoords(points);
const curves = makeCurves(coords, numPoints, uuids, colors);
// console.log(points.toString());
// displayCurvePlot(curves);
await Deno.writeTextFile("./tmpOut/curves.json", JSON.stringify({curves}));
// console.log(curvespoints);
// let buff: Uint8Array = new Uint8Array();
