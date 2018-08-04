const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');
const pathModule = require('path');

// ==== global variables ==== \\
let currentFolder = {};
let selectedFiles = new Array();
let settings = require('./settings.json');
let pendingAction = null;
let lockedAction = null;
let defaultIcons = new Array();
// ==== end of global variables ====\\


function init() {
    loadDefaultIcons();

    if (Object.keys(settings).includes('homeFolder') ) {
        currentFolder = new Folder(settings.homeFolder);
    } else {
        currentFolder = new Folder(os.homedir());
    }
    updateGuiFiles(currentFolder);
    setFileListListeners();
    setInitListeners();
}


function goToParentDirectory() {
    let newPath = currentFolder.path + '\\..'
    console.log(newPath);
    currentFolder = new Folder(newPath);
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


// the files in img folder are read into an array
// if the pictures name matches an extension, it is used.
// i.e. putting an picture called xlsx.png in the img folder
// will cause the program to use that picture as the .xlsx icon
function loadDefaultIcons() {
    let refined = new Array();
    let raw = fs.readdirSync('gui/img');
    // chopping off extensions
    for (let k of raw) {
        let newEntry = k.substr(0, k.indexOf('.'));
        refined.push(newEntry);
    }
    defaultIcons = defaultIcons.concat(refined);
};

// returns the path to the file that should be used.
// settings.json can be used to set file icons
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



function clearSelectedFiles() {
    let fileList_ul = document.getElementById('fileList');

    // reset color of files in browser
    for (li of fileList_ul.children) {
        li.style.backgroundColor = '';
    }
    selectedFiles = new Array();
}

// reloads the page with any file changes
function refresh() {
    currentFolder = new Folder(currentFolder.path);
}


// makeDir should be boolean that is true if creating folder, false if creating file
function createNewChild(makeDir) {
    console.log(makeDir);
    let fileList = document.getElementById('fileList');
    let inputEl = newInputBox();
    inputEl.setAttribute('id', 'newFileInput');

    inputEl.addEventListener('keypress', function (e) {
        let keyPressed = e.which;
        if (keyPressed == 13) {
            let userInput = inputEl.value;

            if (makeDir && !fs.existsSync()) {
                fs.mkdirSync(userInput);
            } else {
                fs.writeFile(userInput, '', () => {});
            }

            refresh();
        }
    }, false);

    // if inputEl loses focus, cancel the creation of new file
    inputEl.addEventListener('blur', () => { inputEl.style.display = 'none' }, false);


    fileList.prepend(inputEl);
    inputEl.focus();
}


// there's no recovering deleted files.
//Maybe I could find path to trash but this is different for each OS
// Maybe I could create my own trash folder
function deleteFile() {
    console.log('inside');
    for (let fileName of selectedFileLis()) {
        if (currentFolder.children[fileName].isDirectory()) {
            fs.rmdirSync(fileName);
        } else {
            fs.unlink(fileName, (error) => {
                if (error) {
                    console.log(error);
                }
            });
        }
    }
    refresh();
}

// goes through selectedFiles and grabs just
// the li elements and returns them in an array
function selectedFileLis() {
    let toReturn = new Array();
    for (let obj of selectedFiles) {
        toReturn.push(obj.el.children[1].textContent);
    }
    return toReturn;
}

// usually results in contextMenu being shown
function fileRightClicked(e) {
    //console.log(e);
    if (!e.ctrlKey && selectedFiles.length == 1) {
        clearSelectedFiles();
    }
    // 'this' is the li element
    selectFile(this);

    showContextMenu();

    console.log(selectedFiles);
}


function lockSelectedFiles(cutOrCopy) {
    if (cutOrCopy != 'copy' && cutOrCopy != 'cut') {
        console.log('lockSelectedFiles function called with invalid arguments')
        return;
    }

    lockedAction = {
        "type": cutOrCopy,
        "paths": selectedFiles
    };
    console.log(lockedAction);

    clearSelectedFiles();
}

// used to hide contextMenu
function handleClick(e) {
    //console.log(e);

    let contextMenu = document.getElementById('contextMenu');
    if (!e.path.includes(contextMenu)) {
        hideContextMenu();
    }

    // if (!e.path.includes(document.getElementById('fileList'))) {
    //     clearSelectedFiles();
    // }

}


// creates input box, waits for user to enter new name or click elsewhere
function renameFiles() {
    hideContextMenu();
    let oldName = selectedFileLis()[0];

    // creating input box
    let inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    inputBox.setAttribute('id', 'renameBox');

    // when user presses enter in the input box, the file will renamed
    inputBox.addEventListener('keypress', (e) => {

        // did user press enter?
        let keyPressed = e.which || e.keyCode;
        if (keyPressed == 13) { // enter pressed

            // get new name, rename file and refresh
            let newName = inputBox.value;

            fs.rename(currentFolder.path + '/' + oldName, currentFolder.path + '/' + newName, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    refresh();
                    clearSelectedFiles();
                }
            }); // end of fs.rename callback
        }// end of if
    }, false); // end of keypress callback

    // if user clicks elsewhere, replace the input box with old name
    inputBox.addEventListener('blur', () => { li.children[1].innerHTML = oldName }, false);


    // showing the input box
    let li = selectedFiles[0].el;
    li.children[1].innerHTML = '';
    li.children[1].appendChild(inputBox);
    inputBox.focus();

} // end of rename sequence


// these files will be highlighted and held as global variables
// for future use. i.e. copy, paste
function selectFile(li_target) {

    // get li target as e.target could be child element of path

    li_target.style.backgroundColor = 'rgb(35, 219, 220)';

    let path = currentFolder.path + '\\' + nameFromLi(li_target);

    let newSelectedFile = {
        "path": path,
        "el": li_target
    }

    if (!selectedFiles.includes(newSelectedFile)) {
        selectedFiles.push(newSelectedFile);
    }
}


function pasteSelectedFiles() {
    // can't paste if files havent' been copied
    if (!lockedAction) {
        return;
    }

    if (lockedAction.type == 'cut') {
        for (selectedFile of lockedAction.paths) {
            console.log(selectedFile);
            let fileName = pathModule.basename(selectedFile.path);
            fs.rename(selectedFile.path, pathModule.join(currentFolder.path, fileName), (error) => {
                if (error) {
                    console.log(error);
                }
            }); // end of callback and fs.rename

        } // end of for loop
    } else if (lockedAction.type == 'copy') {
        for (selectedFile of lockedAction.paths) {
            let fileName = pathModule.basename(selectedFile.path);
            fs.copyFile(selectedFile.path, pathModule.join(currentFolder.path, fileName), (error) => {
                if (error) {
                    console.log(error);
                }
            });
        }
    }

    pendingAction = null;
    refresh();
}
