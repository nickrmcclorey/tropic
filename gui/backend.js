const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

let currentFolder = {};

function init() {
    currentFolder = new Folder(os.homedir());
    updateGuiFiles(currentFolder);
    setEventListeners();
}



function Folder(path) {

    let newFolder = {};
    this.childrenNames = fs.readdirSync(path);
    this.children = new Array();
    this.path = path;

    // this.childrenNames is an array of strings corresponding to files and directories
    for (let k of this.childrenNames) {
        let file = {};


        let fsInfo = fs.statSync(path +'/'+ k);

        file.size = fsInfo.size;
        file.lastModified = fsInfo.mtime;

        file.type = (fsInfo.isDirectory()) ? 'directory' : findFileExtension(k);
        this.children[k] = file;
    }


}

// opens a file in a seperate program
function openFile(rawPath) {
    // some quotes are added to deal with paths with spaces
    if (process.platform == 'win32') {
        let afterC = rawPath.substr(rawPath.indexOf('\\')+1);
        exec('start C:\\"'+afterC + '"');
    } else {
        alert('Support for your operating system isn\'t available yet');
    }
}

// parses file extension from full file name (i.e. 'myBook.xlsx' as a parameter returns 'xlsx')
function findFileExtension(fileName) {
    if (fileName.lastIndexOf('.') == -1) {
        return null;
    } else {
        return fileName.substr(fileName.lastIndexOf('.')+1);
    }
}

// remove spaces from edges of string
function removeEdgeSpaces(input) {

    let beginIndex = 0;
    let endIndex = input.length;

    for (let k = 0; k < input.length; k++) {
        if (input.charAt(k) != ' ') {
            beginIndex = k;
            break;
        }
    }

    for (let k = input.length-1; k >= 0; k--) {
        if (input.charAt(k) == ' ') {
            endIndex = k;
        } else {
            break;
        }
    }

    return input.substr(beginIndex, endIndex);

}


let defaultIcons = new Array();
(function () {
    let refined = new Array();
    let raw = fs.readdirSync('gui/img');
    // chopping off extensions
    for (let k of raw) {
        let newEntry = k.substr(0, k.indexOf('.'));
        refined.push(newEntry);
    }
    defaultIcons = defaultIcons.concat(refined);
})();

function fileIconPath(fileObj) {

    console.log(fileObj.type);
    if (defaultIcons.includes(fileObj.type)) {
        return 'img/' + fileObj.type + '.png';
    } else {

        return 'img/blank.png';
    }

}
