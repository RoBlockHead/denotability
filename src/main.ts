import { unZipFromFile } from 'https://deno.land/x/zip@v1.1.0/mod.ts';
import { parseBuffer } from "https://deno.land/x/bplist_parser/mod.ts";

console.log("Notability Viewer Alpha 0.1");
let found = false;
for await (const dirEntry of Deno.readDir("./")) {
    if(dirEntry.name == "tmpOut") found = true;
}
if(found) Deno.remove("./tmpOut", {recursive: true});

const destPath = await unZipFromFile("./resources/testnote.note", "./tmpOut");
if(typeof destPath !== 'string') Deno.exit();
let innerName = "";
for await(const dirEntry of Deno.readDir(destPath)) {
    console.log(dirEntry);
    innerName = dirEntry.name;
}

const sessionBPList = await Deno.readFile(`${destPath}/${innerName}/Session.plist`);
Deno.writeTextFile("./tmpOut/Session.json", JSON.stringify(parseBuffer(sessionBPList), null, "\t"));
// Deno.writeTextFile("./tmpOut/metadata.json", JSON.stringify(await bplistParse(`${destPath}/${innerName}/metadata.plist`), null, "\t"));
// Deno.mkdir("./tmpOut/HandwritingIndex/");
// Deno.writeTextFile("./tmpOut/HandwritingIndex/index.json", JSON.stringify(await bplistParse(`${destPath}/${innerName}/HandwritingIndex/index.plist`), null, "\t"));