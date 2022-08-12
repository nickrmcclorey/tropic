import { sizeOf, fileExtension } from "./pure.ts"
import fs from "fs"
const pathModule = require("path")

declare var settings: any;

class File {
    size: string;
    lastModified: Date;
    type: string
    
    isDirectory(): boolean {
        return this.type == 'directory';
    }
}

// TODO: this could easily be trimmed and turned into a ts file
class Folder {
    children:{[fileName: string]: File} = {};
    
    constructor(public path: string) {}


    // TODO: Either switch to fs.stat or don't return promise at all
    read(): Promise<void> {
        this.collectFolderContents(this.path);
        return Promise.resolve();
    };


    collectFolderContents(path: string) {

        let childrenNames = fs.readdirSync(path);
        for (let fileName of childrenNames) {

            let file:File = new File();
            file.size = null;

            let fsInfo:fs.Stats = null;
            try {
                fsInfo = fs.statSync(path +'/'+ fileName);
            } catch (e) {
                continue;
            }

            // converts raw size of bytes to string in terms of KB, MB or GB
            if (fsInfo.isDirectory()) {
                file.size = 'folder';
            } else {
                file.size = sizeOf(fsInfo.size);
            }

            file.lastModified = fsInfo.mtime;

            file.type = (fsInfo.isDirectory()) ? 'directory' : fileExtension(fileName);

            file.isDirectory = function () {
                return this.type == 'directory';
            }
            
            if (!fileName.startsWith('.') || settings.showHiddenFiles) {
                this.children[fileName] = file;
            }
        }
    }
}
export default Folder
