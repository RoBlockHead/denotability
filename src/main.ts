import { unZipFromFile } from 'https://deno.land/x/zip@v1.1.0/mod.ts';
// import { parseBuffer } from "https://deno.land/x/bplist_parser@0.4.0/mod.ts";
import { parseBuffer } from "./bplistParser.ts";
import {curvesFromSession, curvesFromSessionObject, SessionData} from "./sessionCurves.ts";
import {win32 as winPath, posix as posixPath} from "https://deno.land/std@0.160.0/path/mod.ts";
import { generateSvg } from './svgCurves.ts';
import { generatePdf } from './pdfGen.ts';
import { resolveObjects } from './plistResolution.ts';
import { NoteTakingSession } from './types.ts';
import { parse as parseFlags } from "https://deno.land/std@0.161.0/flags/mod.ts";
console.log("Denotability v1");
console.log("Notability Viewer Alpha 0.1");

// const OPTIONS = {
//     input: "resources/.note",
//     outputOptions: {
//         svg: "out/note1.svg",
//     },
//     persistTempDir: true
// }


// Deno.writeTextFile("./tmpOut/metadata.json", JSON.stringify(await bplistParse(`${destPath}/${innerName}/metadata.plist`), null, "\t"));
// Deno.mkdir("./tmpOut/HandwritingIndex/");
// Deno.writeTextFile("./tmpOut/HandwritingIndex/index.json", JSON.stringify(await bplistParse(`${destPath}/${innerName}/HandwritingIndex/index.plist`), null, "\t"));
async function removeTempDir() {
    let tmpOutFound = false;
    for await (const dirEntry of Deno.readDir("./")) {
        if(dirEntry.name == "tmpOut") tmpOutFound = true;
    }
    if(tmpOutFound) Deno.remove("./tmpOut", {recursive: true});
}
const exists = async (filename: string): Promise<boolean> => {
    try {
      await Deno.stat(filename);
      // successful, file or directory must exist
      return true;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        // file or directory does not exist
        return false;
      } else {
        // unexpected error, maybe permissions, pass it along
        throw error;
      }
    }
  };
  
const MAX_FILE_SIZE = 300 * 1000 * 1000; // 300 Megabytes
async function main(args: string[]) {
    try {
        const flags = parseFlags(args, {
            boolean: ["help", "pdf", "svg", "overwrite", "r", "persistTemp"],
            string: ["pdfOut", "svgOut"],
            default: { pdf: true, svg: true }
        });
        // console.log(flags);
        const inputPath = flags._[0]
        if(flags.pdf && !flags.pdfOut) throw new Error("specify the path for the outputted PDF file");
        if(flags.svg && !flags.svgOut) throw new Error("specify the path for the outputted SVG file");

        if(flags._.length !== 1 || typeof inputPath == "number") throw new Error("need exactly one string argument containing a path.");
        if(flags.pdf && await exists(flags.pdfOut || "") && !flags.overwrite) throw new Error(`${flags.pdfOut} already exists! Overwrite with "--overwrite"`);
        if(flags.svg && await exists(flags.svgOut || "") && !flags.overwrite) throw new Error(`${flags.svgOut} already exists! Overwrite with "--overwrite"`);
        let fileStat = await Deno.stat(inputPath)
        if(fileStat.size > MAX_FILE_SIZE) throw new Error("provided file is larger than the maximum file size of 300Mb.");
        if(fileStat.isDirectory) throw new Error("provided file is a directory, not a .note file.");
        if(!inputPath.endsWith(".note")) throw new Error(`${inputPath} is not a .note file!`);

        await removeTempDir();

        const destPath = await unZipFromFile(inputPath, "./tmpOut");
        if(destPath == false) throw new Error("Error while decompressing " + inputPath);

        // this section assumes that there is only one directory within the note file's zipping. If there is more than one, this whole thing will break
        let innerName = "";
        for await(const dirEntry of Deno.readDir(destPath)) {
            console.log(dirEntry);
            innerName = dirEntry.name;
        }

        const sessionBPList = await Deno.readFile(`${destPath}/${innerName}/Session.plist`);
        const sessionObject = parseBuffer(sessionBPList);
        const session = resolveObjects(sessionObject) as NoteTakingSession;
        // const curves = curvesFromSessionObject(sessionObject as SessionData);
        const curves = curvesFromSession(session);
        if(flags.svg && flags.svgOut) {
            const svg = generateSvg(curves);
            Deno.writeTextFile(flags.svgOut, svg);
        }
        if(flags.pdf && flags.pdfOut) {
            const pdf = await generatePdf(curves);
            Deno.writeFile(flags.pdfOut, pdf);
        }
        Deno.writeTextFile("./tmpOut/Session.json", JSON.stringify(sessionObject, null, "\t"));
        Deno.writeTextFile("./tmpOut/ResolvedSession.json", JSON.stringify(session, null, "\t"));
        Deno.writeTextFile("./tmpOut/Curves.json", JSON.stringify(curves, null, "\t"));
        if(!flags.persistTemp) {
            await removeTempDir();
        }
    } catch(err) {
        console.error(err);
        Deno.exit();
    }    
}
main(Deno.args);