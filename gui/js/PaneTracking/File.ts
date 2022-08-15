import fs from "fs"

class File {
    size: string;
    lastModified: Date;
    type: string

    constructor(fsInfo: fs.Stats, fileName: string) {
        // converts raw size of bytes to string in terms of KB, MB or GB
        if (fsInfo.isDirectory()) {
            this.size = 'folder';
        } else {
            this.size = File.sizeOf(fsInfo.size);
        }

        this.lastModified = fsInfo.mtime;

        this.type = (fsInfo.isDirectory()) ? 'directory' : File.fileExtension(fileName);
        
        
    }
    
    isDirectory(): boolean {
        return this.type == 'directory';
    }

    static sizeOf(size: number): string {

        if (size > 1000000000) { // bigger than a gig
            size /= 1000000000;
            return size.toFixed(2).toString() + ' GB';

        } else if (size > 1000000) { // bigger than a meg
            size /= 1000000;
            return size.toPrecision(3).toString() + ' MB';

        } else if (size > 1000) {
            size /= 1000;
            return Math.round(size).toString() + ' KB';

        } else {
            return size.toString() + " Bytes"
        }
    }

    // parses file extension from full file name (i.e. 'myBook.xlsx' as a parameter returns 'xlsx')
    static fileExtension(fileName: string): string {
        if (fileName.lastIndexOf('.') == -1) {
            return null;
        } else {
            return fileName.substr(fileName.lastIndexOf('.')+1);
        }
    }
}

export default File