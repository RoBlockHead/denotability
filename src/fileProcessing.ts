import { unZipFromFile } from 'https://deno.land/x/zip@v1.1.0/mod.ts';
import { parseBuffer } from "https://deno.land/x/bplist_parser@0.4.0/mod.ts";
import {win32 as winPath, posix as posixPath} from "https://deno.land/std@0.160.0/path/mod.ts";
import conf from './config.json' assert {type: "json"};
import { state } from './state.ts';

const MAX_FILE_SIZE = 30*1024*1024; // maximum file size in bytes

/**
 * parses a file path and verifies that it is not too large
 * @param path relative path of file being imported
 * @param currDir current absolute directory
 */
const getFilePath = async (path: string, currDir?: string) => {
    const filePath =  Deno.build.os  === "windows" ? winPath.resolve(currDir ? currDir : "", path) : posixPath.resolve(currDir ? currDir : "", path);
    const fstat = await Deno.stat(filePath);
    if(fstat.size > MAX_FILE_SIZE) {
        throw new Error("File is too large.")
    }
    return filePath;
}

/**
 * Retrieves a temporary directory for the app.
 * @return string containing the absolute file path to the temp directory
 */
const getTempDir = async () => {
    let tempDir;
    tempDir = conf.currentTempDir;
    let changed = false;
    if(!tempDir || await Deno.readFile(tempDir) !== Uint8Array.from([])) {
        tempDir = await Deno.makeTempDir({prefix: "denotability_"});
        changed = true;
    }
    if(conf.persistTempDir) {
        let config = conf;
        config.currentTempDir = tempDir;
        if(changed) Deno.writeTextFile("./config.json", JSON.stringify(config, null, "\t"));
    }
    return tempDir;
}


const processDotNote = async (path: string) => {
    // Unzip the .note file to the temp directory
    const tempDir = await getTempDir();
    if(Deno.read)
    state.setTempDir(tempDir);

}
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