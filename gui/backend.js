const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// ==== global variables ==== \\
let currentFolder = {};
let selectedFile = null;

// ==== end of global variables ====\\
function init() {
    currentFolder = new Folder(os.homedir());
    updateGuiFiles(currentFolder);
    setEventListeners();
    document.getElementById('backButton').addEventListener('click', goToParentDirectory, false);
}


function Folder(path) {

    let newFolder = {};
    let childrenNames = fs.readdirSync(path);
    this.children = new Array();
    this.path = path;

    // childrenNames is an array of strings corresponding to files and directories
    // we create an associative array where the filename is the index of it's correpsonding info
    for (let fileName of childrenNames) {
        let file = {};


        let fsInfo = fs.statSync(path +'/'+ fileName);

        // converts raw size of bytes to string in terms of KB, MB or GB
        file.size = sizeOf(fsInfo);

        file.lastModified = fsInfo.mtime;

        file.type = (fsInfo.isDirectory()) ? 'directory' : findFileExtension(fileName);

        file.isDirectory = function () {
            return this.type == 'directory';
        }

        // appeniding the file to the array
        this.children[fileName] = file;
    }


}

function goToParentDirectory() {
    let newPath = currentFolder.path + '\\..'
    console.log(newPath);
    currentFolder = new Folder(path.resolve(newPath));
    //document.getElementById('fileList').innerHTML = '';
    updateGuiFiles(currentFolder);
    setEventListeners();
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

    if (defaultIcons.includes(fileObj.type)) {
        return 'img/' + fileObj.type + '.png';
    } else {
        return 'img/blank.png';
    }

}

function sizeOf(fsInfo) {

    if (fsInfo.isFile) {
        // size is in bytes
        let size = fsInfo.size;
        if (size > 1000000000) { // bigger than a gig
            size /= 1000000000;
            return size.toString() + ' GB';

        } else if (size > 1000000) { // bigger than a meg
            size /= 1000000;
            return size.toString() + ' MB';

        } else if (size > 1000) {
            size /= 1000;
            return size.toString() + ' KB';

        } else {
            return size.toString() + " Bytes"
        }
    }
}
