import { sizeOf, fileExtension } from "./pure.js"
const pathModule = require("path")
const fs = require("fs")

function Folder(path) {
    if (!path.includes('%')) {
        path = pathModule.resolve(path);
    }

    this.children = new Object();
    this.path = path;
    this.numExtractedIcons = 0;
    this.promises = new Array();
}


Folder.prototype.read = function () {
    this.collectFolderContents(this.path);
    return Promise.resolve();
};


Folder.prototype.collectFolderContents = function (path) {

    let childrenNames = fs.readdirSync(path);
    for (let fileName of childrenNames) {

        let file = {};
        file.size = null;

        let fsInfo = null;
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
        // we create an associative array where the filename is the index of it's correpsonding info
        this.children[fileName] = file;
    }
}


/* the readdir function doesn't always work on windows so
    so I've called the dir command and parsed the output. */
Folder.prototype.parseWinDir = function (resolve, reject) {

    let command = 'dir ' + preparePathForCmd(this.path) + ' /a:-s /o:e' 
    // calling the dir command and recieving its input in parameter 'raw'
    exec(command, (error, raw) => {
        // catch error calling dir and invalid path
        if (error) {
            reject();
            return;
        } else if (raw.includes('File Not Found')) {
            return;
        }


        // getting rid of '.' and '..' entry
        if (this.path != 'C:\\') {
            // parsing the declared dir to make sure path is correct
            let dirShown = raw.substr(raw.indexOf('Directory of '));
            dirShown = dirShown.substr(dirShown.indexOf('C:'), dirShown.indexOf('\n'));
            dirShown = dirShown.substr(0, dirShown.indexOf('\n'));

            raw = raw.substr(raw.indexOf('<DIR>'));
            raw = raw.substr(raw.indexOf('..'));
            raw = raw.substr(raw.indexOf('\n')+1);
        }

        // removing more lines we don't need
        let list = raw.split('\n');
        for (let k = 0; k < list.length; k++) {
            let currentLine = list[k];

            // each line containing information on a file or dir starts with a date and
            // each date starts with the month witch starts with a 0 or 1 i.e. '02/23/2018'
            if (currentLine.length == 0 || (currentLine[0] != '1' && currentLine[0] != '0')) {
                list.splice(k, 1);
                k--; // list is now one elemente shorter
            } else {
                list[k] = currentLine.substr(0, currentLine.indexOf('\r'));
            }
        }

        // list is now an array of strings
        // each string has the information on one file
        let fileId = 0;
        for (let line of list) {
            let newFile = {
                size: null,
                type: null,
                lastModified: null,
                id: fileId
            };

            // using javascript's built in date parser
            newFile.lastModified = new Date(line.substr(0,21));

            // cut off the date
            line = line.substr(21);
            // break the line up
            line = line.split(' ');

            // === finding size of file === \\

            // ignore the whitespace and find the size of file
            // <DIR> will be there if file is directory
            for (let i in line) {
                if (line[i]) {
                    newFile.size = line[i];

                    if (line[i] == '<DIR>')  {
                        newFile.size = 'folder';
                    } else {
                        // take the size, remove the commas, convert to a number and convert it to GB, MB or KB
                        newFile.size = sizeOf(Number(newFile.size.replace(/,/g, '')));
                    }

                    //  cut off everything up to this point
                    line.splice(1, i);
                    break;

                }
            }

            // === finding name === \\
            name = line.filter(string => string != '').join(' ');

            // parsing the file extension, if file
            if (newFile.size != 'folder') {
                newFile.type = fileExtension(name);
            } else {
                newFile.type = 'directory';
            }

            newFile.isDirectory = function () {
                return this.type == 'directory';
            }

            if (name == '.') {
                continue;
            }
            this.children[name] = newFile;
            fileId++;

            fileSettings = settings.fileTypes[fileExtension(name)];
            if (newFile.type != 'directory' && fileSettings && fileSettings.src == 'extract') {
                this.children[name].imgPromise = extractIcon(pathModule.join(this.path, name));
                this.numExtractedIcons++;
            }
        } // end of loop

        if (resolve) {
            resolve();
        }
    });
}


function extractIcon(path) {
    return new Promise(function(resolve, reject) {
        fii.getIcon(path, (img64) => {
            resolve({
                "img64": img64,
                "file": pathModule.basename(path)
            });
        });
    });
}

export default Folder
