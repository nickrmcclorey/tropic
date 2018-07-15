const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

let currentFolder = {};

function init() {
    currentFolder = constructFolderObj(os.homedir());
    updateGuiFiles(currentFolder);
    setEventListeners();
}



function constructFolderObj(path) {

    let newFolder = {};
    let childrenNames = fs.readdirSync(path);
    newFolder.children = new Array();
    newFolder.path = path;

    for (let k of childrenNames) {
        let file = {};


        let fsInfo = fs.statSync(path +'/'+ k);

        file.size = fsInfo.size;
        file.lastModified = fsInfo.mtime;
        file.type = null;
        file.type = (fsInfo.isDirectory()) ? 'directory' : findFileExtension(k);
        newFolder.children[k] = file;
    }

    return newFolder;
}





// parses file extension from full file name (i.e. 'myBook.xlsx' as a parameter returns 'xlsx')
function findFileExtension(fileName) {
    if (fileName.lastIndexOf('.') == -1) {
        return null;
    } else {
        return fileName.substr(fileName.lastIndexOf('.')+1);
    }
}
