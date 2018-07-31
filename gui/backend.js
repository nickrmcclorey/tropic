const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// ==== global variables ==== \\
let currentFolder = {};
let selectedFiles = new Array();
let settings = require('./settings.json');
// ==== end of global variables ====\\


function init() {
    if (Object.keys(settings).includes('homeFolder') ) {
        currentFolder = new Folder(path.resolve(settings.homeFolder));
    } else {
        currentFolder = new Folder(os.homedir());
    }
    updateGuiFiles(currentFolder);
    setEventListeners();
    setContextMenuListeners();
}


function goToParentDirectory() {
    let newPath = currentFolder.path + '\\..'
    console.log(newPath);
    currentFolder = new Folder(path.resolve(newPath));
    //document.getElementById('fileList').innerHTML = '';
    updateGuiFiles(currentFolder);

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
            endIndex = k-1;
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

    if (Object.keys(settings.img).includes(fileObj.type)) {
        return 'img/' + settings.img[fileObj.type];
    }

    if (defaultIcons.includes(fileObj.type)) {
        return 'img/' + fileObj.type + '.png';
    } else {
        return 'img/blank.png';
    }

}

function sizeOf(size) {


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

function clearSelectedFiles() {
    let fileList_ul = document.getElementById('fileList');

    // reset color of files in browser
    for (li of fileList_ul.children) {
        li.style.backgroundColor = '';
    }
    selectedFiles = new Array();
}

function refresh() {
    currentFolder = new Folder(currentFolder.path);
}
