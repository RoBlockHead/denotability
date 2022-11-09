import type { Curve } from "./types.ts";
// import curveJson from "../tmpOut/curves.json" assert {type: "json"};

// const curves: {curves: Curve[]} = curveJson;
// const svgWin = createSVGWindow();
// const SVG = svgMod(svgWin);
// const document = svgWin.document;

// const draw = SVG(document.documentElement);
// // draw.rect(667.79998779296875, 11*(667.79998779296875/8.5));
// console.log(draw);


export const generatePathString = (curvePoints: {x: number, y: number}[]) => {
    let pathString = "";
    pathString += `M${curvePoints[0].x} ${curvePoints[0].y}`;
    let lastSeg = "C";
    if(curvePoints.length - 1 % 3 == 2) lastSeg = "S";
    if(curvePoints.length - 1 % 3 == 1) lastSeg = "SS";
    let inLastSeg = false;
    curvePoints.forEach(({x, y}, ind) => {
        if(ind == 0) return;
        if(ind == 1) pathString += " C "
        if(ind == curvePoints.length - 4 && lastSeg == "SS") {
            inLastSeg = true;
            pathString += "S "
        }
        if(lastSeg == "S" && inLastSeg)
            pathString += `${x} ${y}, `;
        if(ind == curvePoints.length - 2 && lastSeg == "S") {
            
            inLastSeg = true;
            pathString += "S "
        }
        if(!inLastSeg) {
            if(ind !== 1) pathString += ", ";
            pathString += `${x} ${y}`
        }
    });
    return pathString;
}

export const generateSvg = (curves: Curve[]): string => {
    // Assume Letter Paper for now.
    const width = 612;
    const height = 792;

    let polyLineElements: string[] = [];
    curves.forEach((val) => {
        const curvePoints: number[][] = [];
        let pointsString = "";
        val.points.forEach(({x, y}) => {
            pointsString += `${x} ${y}, `
        });
        // polyLineElements.push(`<polyline points="${pointsString}" fill="none" stroke="${val.color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>`);
        polyLineElements.push(`<path d="${generatePathString(val.points)}"  fill="none" stroke="${val.color.substring(0,7)}" stroke-width="${val.width}" stroke-linecap="round" stroke-linejoin="round"/>`);
    
    });
    
    const svgText = `<svg viewbox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${polyLineElements.join("\n")}
    </svg>`
    return svgText;
}