const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');
const pathModule = require('path');
const { ipcRenderer } = require('electron');
const $ = require('jquery')
const fii = require('file-icon-info');
const ncp = require('ncp')

// ==== global variables ==== \\
let currentFolder = {};
let Tracker = {};
let templates = null;
const settings = require('./settings.json');
let selectedFiles = new SelectedFiles();
let defaultIcons = new Object();
let settingsInputBox = null;
// ==== end of global variables ====\\


function init() {
    setInitListeners();
    templates = $('#templates').remove()[0];
    templates.removeAttribute('hidden');
    loadDefaultIcons();

    let openingPath = "";
    if (Object.keys(settings).includes('homeFolder')) {
        openingPath = settings.homeFolder;
    } else {
        openingPath = os.homedir();
    }

    let fileFieldParent = $('#fileFieldParent')[0];
    Tracker = new PaneTabTracker(fileFieldParent, openingPath);
    Tracker.refresh();

    loadExternalPrograms();
}


function handleClick(e) {
    for (fileField of $('.fileField')) {
        if (e.path.includes(fileField) && Tracker.activePane.fileField != fileField) {
            for (pane of Tracker.panes) {
                if (pane.fileField == fileField) {
                    Tracker.activePane = pane;
                }
            }
        }
    }

    let contextMenu = document.getElementById('contextMenu');
    if (!e.path.includes(contextMenu)) {
        hideContextMenu();
    }

    let programMenu = document.getElementById('programMenu');
    if (!e.path.includes(programMenu) && e.target.getAttribute('class') != 'openWithButton') {
        programMenu.style.display = 'none';
    }

    if (e.target.classList.contains('fileField')) {
        clearSelectedFiles();
    }
}


function goToParentDirectory(e) {
    handleClick(e);
    let newPath = pathModule.join(Tracker.folder().path, '..') ;
    Tracker.activePane.cd(newPath);
}


// opens a file in a seperate program
function openFile(rawPath) {
    if (Tracker.folder().children[pathModule.basename(rawPath)].type == 'directory') {
        Tracker.activePane.cd(rawPath);
        hideContextMenu();
        return;
    }

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
    let raw = fs.readdirSync(pathModule.resolve(__dirname,'img'));

    // chopping off extensions
    for (let fileName of raw) {
        let newEntry = fileName.substr(0, fileName.indexOf('.'));
        defaultIcons[newEntry] = fileName;
    }

    for (let extension of Object.keys(settings.fileTypes)) {
        defaultIcons[extension] = settings.fileTypes[extension].img;
    }
}


// returns the path to the file that should be used.
// settings.json can be used to set file icons
function fileIconPath(folder, fileName) {
    let fileObj = folder.children[fileName];
    let iconFileName = defaultIcons[fileObj.type];
    let iconSettings = settings.fileTypes[findFileExtension(fileName)];
    if (fileObj.img64) {
        return 'data:img/png; base64 ' + fileObj.img64;
    }
    if (iconSettings == undefined) {
        if (iconFileName == undefined) {
            return 'img/blank.png';
        } else {
            return 'img/' + iconFileName;
        }
    } else if (iconSettings.src == 'self') {
        return pathModule.join(folder.path, fileName);
    } else if (iconSettings.src == 'extract') {
        return 'data:image/png;base64,' + folder.children[fileName].img64;
    } else {
        return 'img/' + iconFileName;
    }
}


function clearSelectedFiles() {
    let fileList_uls = document.getElementsByClassName('fileList');

    for (fileList_ul of fileList_uls) {
        // reset color of files in browser
        for (li of fileList_ul.children) {
            li.style.backgroundColor = '';
        }
    }
    selectedFiles.tentative = new Array();
}


// function to make a new folder or file
// makeDir should be boolean that is true if creating folder, false if creating file
function createNewChild(makeDir) {
    console.log(makeDir);
    let fileList = Tracker.activePane.fileList;
    let inputEl = newInputBox();
    inputEl.setAttribute('id', 'newFileInput');

    inputEl.addEventListener('keypress', function (e) {
        let keyPressed = e.which;
        if (keyPressed == 13) {
            let userInput = inputEl.value;

            if (makeDir && !fs.existsSync()) {
                newDirPath = pathModule.join(Tracker.folder().path, userInput);
                fs.mkdirSync(newDirPath);
            } else {
                fs.writeFile(userInput, '', () => {});
            }

            Tracker.refresh();
        }
    }, false);

    // if inputEl loses focus, cancel the creation of new file
    inputEl.addEventListener('blur', () => { inputEl.style.display = 'none' }, false);
    fileList.insertBefore(inputEl, fileList.children[1]);
    inputEl.focus();
}


// uses executable that recycles files
function deleteFile() {
    let pathToExe = pathModule.join(__dirname, "/programs/recycle/recycle.exe");
    let filesToDelete = selectedFiles.tentativePaths().join(' ');
    exec(pathToExe + ' ' + filesToDelete, () => {
        Tracker.refresh();
    });
    hideContextMenu();
}


// usually results in contextMenu being shown
function fileRightClicked(e) {
    //console.log(e);
    if (!e.ctrlKey && selectedFiles.tentative.length == 1) {
        clearSelectedFiles();
    }
    // 'this' is the li element
    selectFile(this);

    showContextMenu(e);

    console.log(selectedFiles);
}


// creates input box, waits for user to enter new name or click elsewhere
function renameFiles() {
    hideContextMenu();
    let fileToRename = selectedFiles.tentative[0];

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

            fs.rename(fileToRename.path, pathModule.join(Tracker.folder().path, newName), (error) => {
                if (error) {
                    console.log(error);
                    alert('Failed to rename file')
                }
                Tracker.refresh();
                clearSelectedFiles();
            }); // end of fs.rename callback
        }// end of if
    }, false); // end of keypress callback

    // if user clicks elsewhere, replace the input box with old name
    inputBox.addEventListener('blur', () => { li.children[1].innerHTML = pathModule.basename(fileToRename.path) }, false);


    // showing the input box
    let li = selectedFiles.tentative[0].li;
    li.children[1].innerHTML = '';
    li.children[1].appendChild(inputBox);
    inputBox.focus();

} // end of rename sequence


// these files will be highlighted and held as global variables
// for future use. i.e. copy, paste
function selectFile(li_target) {

    // get li target as e.target could be child element of path

    li_target.style.backgroundColor = 'rgb(35, 219, 220)';

    let path = pathModule.join(Tracker.folder().path, nameFromLi(li_target));
    let isDirectory = fs.lstatSync(path).isDirectory()

    selectedFiles.addTentative(path, isDirectory, li_target);
}


function pasteSelectedFiles() {
    // can't paste if files haven't been copied
    if (!selectedFiles.pendingAction) {
        return;
    }

    for (selectedFile of selectedFiles.locked) {
        let fileName = pathModule.basename(selectedFile.path);

        let destination = '';
        if (selectedFiles.tentative[0] && selectedFiles.tentative[0].isDirectory) {
            destination = selectedFiles.tentative[0].path;
            destination = pathModule.join(destination, fileName);
        } else {
            destination = pathModule.join(Tracker.folder().path, fileName);
        }
        
        console.log(destination);
        // cut or copy depending on previous selection
        if (selectedFiles.pendingAction == 'cut') {
            fs.renameSync(selectedFile.path, destination, printError ); // end of callback and fs.rename
        } else if (selectedFiles.pendingAction == 'copy') {
            ncp(selectedFile.path, destination, printError);
            // fs.copyFileSync(selectedFile.path, pathModule.join(Tracker.folder().path, fileName), printError);
        }
        setTimeout(function(){ Tracker.refresh() }, 100);
    } // end of for loop

    pendingAction = null;
}


function loadExternalPrograms() {
    let programEl = document.getElementsByClassName('programList')[0];
    for (program in settings.programs) {
        programEl.innerHTML += '<div>' + program + '</div>';

    }
    programEl.addEventListener('click', startProgram, false);
}


function startProgram(event) {
    // get program object from settings.json
    let programName = event.target.textContent;
    let program = settings.programs[programName];

    // figure out file or folder to open
    let lastSelectedFile = selectedFiles.tentative[0];
    let fileOrFolderPath = (lastSelectedFile) ? lastSelectedFile.path : Tracker.folder().path;
    let filePath = null;
    let folderPath = null;
    if (!fileOrFolderPath) {
        folderPath = currentFolder.path;
    } else if (fs.statSync(fileOrFolderPath).isDirectory()) {
        folderPath = fileOrFolderPath;
    } else if (fs.statSync(fileOrFolderPath).isFile()) {
        filePath = fileOrFolderPath;
    }

    // only open program if it can open that folder or file
    if (folderPath && program.canOpenFolder) {
        runExtProgram(program.path, folderPath);
    } else if (filePath && program.canOpenFile) {
        runExtProgram(program.path, filePath);
    }
}


function runExtProgram(programPath, fileOrFolderPath) {
    if (fileOrFolderPath) {
        console.log(' "' + programPath + '" "' + fileOrFolderPath + '"');
        exec(' "' + programPath + '" "' + fileOrFolderPath + '"', null);
    } else {
        exec('program.path');
    }
}


function homePath() {
    if (settings.homeFolder == undefined) {
        return os.homedir();
    } else {
        return settings.homeFolder
    }
}
