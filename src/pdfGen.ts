import { PDFDocument, PageSizes, rgb,  } from 'https://esm.sh/pdf-lib';
import { generatePathString } from './svgCurves.ts';
import { Curve } from './types.ts';

export async function generatePdf(curves: Curve[]) {
    const pdfDocument = await PDFDocument.create();
    // const template = await PDFDocument.load(Deno.readFileSync('./tmpOut/Note\ Oct\ 20,\ 2022/PDFs/B56F5E2C-59F6-5996-BAC0-AD1584F3D55E.pdf'));
    // const pdfDocument = await template.copy();
    // const embeddedPdf = await pdfDocument.embedPdf();
    // const embeddedPdf = await pdfDocument.embedPdf("https://media.zaner-bloser.com/handwriting/pdfs/ZB_HW_Cursive_Paper_Templates.pdf");
    // await embeddedPdf[0].embed();
    // const pageWidth = 
    // const page = pdfDocument.addPage([667.79998779296875, 11*(667.79998779296875/8.5)]);
    const page = pdfDocument.addPage(PageSizes.Letter);
    page.moveTo(15,0);
    // page.moveTo(100, page.getHeight()-5)
    for(const curve of curves) {
        // page.moveTo(0, 0)
        const path = generatePathString(curve.points)
        // console.log("On Curve " + curve.uuid);
        // console.log(curve.color)
        // console.log(curve.color.substring(0,2))
        // console.log(path);
        page.drawSvgPath(path, {
            borderColor: rgb(parseInt(curve.color.substring(1,3),16)/255,parseInt(curve.color.substring(3,5),16)/255,parseInt(curve.color.substring(5,7),16)/255),
            borderWidth: curve.width,
            x: 16,
            y: page.getHeight(),
        });
    }
    return pdfDocument.save();
}
